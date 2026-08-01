/* ==========================================================================
   QR-Kodierer, klein und selbst geschrieben.

   Warum selbst: das Projekt zieht keine Abhängigkeiten und hat keinen
   Bauschritt. Eine Bibliothek wäre eine Datei mehr im Verzeichnis, die
   niemand im Team gelesen hat.

   Umfang: Byte-Modus, Fehlerkorrektur M und L, alle 40 Versionen.
   Gewählt wird immer die kleinste Version, die den Text fasst — bei
   gleicher Größe die stärkere Korrektur. Kleiner heißt größere Kästchen
   heißt: die Kamera des Gegenübers trennt sie noch.

   QR Code ist eine eingetragene Marke von Denso Wave.
   ========================================================================== */
const QR = (function () {

  /* --- Rechnen im Körper GF(256) -------------------------------------- */
  const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  (function () {
    let x = 1;
    for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();
  const mul = (a, b) => (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]];

  /* Das Generatorpolynom für n Prüfzeichen: (x-a^0)(x-a^1)…(x-a^(n-1)) */
  function genPoly(n) {
    let p = [1];
    for (let i = 0; i < n; i++) {
      const r = new Array(p.length + 1).fill(0);
      for (let j = 0; j < p.length; j++) { r[j] ^= mul(p[j], 1); r[j + 1] ^= mul(p[j], EXP[i]); }
      p = r;
    }
    return p;
  }

  /* Rest der Polynomdivision — die Prüfzeichen eines Blocks */
  function ecc(data, n) {
    const g = genPoly(n);
    const res = new Uint8Array(data.length + n);
    res.set(data);
    for (let i = 0; i < data.length; i++) {
      const f = res[i];
      if (!f) continue;
      for (let j = 0; j < g.length; j++) res[i + j] ^= mul(g[j], f);
    }
    return res.slice(data.length);
  }

  /* --- Blockaufteilung, Fehlerkorrektur M ------------------------------
     [Prüfzeichen je Block, Blöcke Gruppe 1, Datenzeichen Gruppe 1,
      Blöcke Gruppe 2, Datenzeichen Gruppe 2] */
  const BLOECKE = {
    M: [null,
      [10,1,16,0,0],[16,1,28,0,0],[26,1,44,0,0],[18,2,32,0,0],[24,2,43,0,0],
      [16,4,27,0,0],[18,4,31,0,0],[22,2,38,2,39],[22,3,36,2,37],[26,4,43,1,44],
      [30,1,50,4,51],[22,6,36,2,37],[22,8,37,1,38],[24,4,40,5,41],[24,5,41,5,42],
      [28,7,45,3,46],[28,10,46,1,47],[26,9,43,4,44],[26,3,44,11,45],[26,3,41,13,42],
      [26,17,42,0,0],[28,17,46,0,0],[28,4,47,14,48],[28,6,45,14,46],[28,8,47,13,48],
      [28,19,46,4,47],[28,22,45,3,46],[28,3,45,23,46],[28,21,45,7,46],[28,19,47,10,48],
      [28,2,46,29,47],[28,10,46,23,47],[28,14,46,21,47],[28,14,46,23,47],[28,12,47,26,48],
      [28,6,47,34,48],[28,29,46,14,47],[28,13,46,32,47],[28,40,47,7,48],[28,18,47,31,48]],
    L: [null,
      [7,1,19,0,0],[10,1,34,0,0],[15,1,55,0,0],[20,1,80,0,0],[26,1,108,0,0],
      [18,2,68,0,0],[20,2,78,0,0],[24,2,97,0,0],[30,2,116,0,0],[18,2,68,2,69],
      [20,4,81,0,0],[24,2,92,2,93],[26,4,107,0,0],[30,3,115,1,116],[22,5,87,1,88],
      [24,5,98,1,99],[28,1,107,5,108],[30,5,120,1,121],[28,3,113,4,114],[28,3,107,5,108],
      [28,4,116,4,117],[28,2,111,7,112],[30,4,121,5,122],[30,6,117,4,118],[26,8,106,4,107],
      [28,10,114,2,115],[30,8,122,4,123],[30,3,117,10,118],[30,7,116,7,117],[30,5,115,10,116],
      [30,13,115,3,116],[30,17,115,0,0],[30,17,115,1,116],[30,13,115,6,116],[30,12,121,7,122],
      [30,6,121,14,122],[30,17,122,4,123],[30,4,122,18,123],[30,20,117,4,118],[30,19,118,6,119]],
  };
  const datenZeichen = (stufe, v) => { const t = BLOECKE[stufe][v]; return t[1] * t[2] + t[3] * t[4]; };

  /* Übrige Bits nach den Zeichen, je Version */
  const REST = (v) => v === 1 ? 0 : v <= 6 ? 7 : v <= 13 ? 0 : v <= 20 ? 3
    : v <= 27 ? 4 : v <= 34 ? 3 : 0;

  /* Wo die Ausrichtungsquadrate sitzen. Als Tabelle und nicht als Formel:
     die verbreitete Formel weicht bei Version 32 von der Norm ab, und
     genau die Version braucht ein voller Rückblick. */
  const AUSRICHT = [null, [],
    [6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],
    [6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],
    [6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],
    [6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],
    [6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],
    [6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],
    [6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],
    [6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]];
  const alignPos = (v) => AUSRICHT[v];

  /* --- BCH für Format- und Versionsangabe ------------------------------ */
  function bch(rest, gen, stellen) {
    let d = rest << stellen;
    const hoch = (x) => { let n = 0; while (x) { n++; x >>>= 1; } return n; };
    const gl = hoch(gen);
    while (hoch(d) >= gl) d ^= gen << (hoch(d) - gl);
    return d;
  }
  const STUFE_BITS = { M: 0, L: 1 };   // so steht es in der Formatangabe
  const formatBits = (stufe, maske) => {
    const roh = (STUFE_BITS[stufe] << 3) | maske;
    return ((roh << 10) | bch(roh, 0x537, 10)) ^ 0x5412;
  };
  const versionBits = (v) => (v << 12) | bch(v, 0x1f25, 12);

  /* --- Die acht Masken -------------------------------------------------- */
  const MASKEN = [
    (r, c) => (r + c) % 2 === 0,
    (r) => r % 2 === 0,
    (r, c) => c % 3 === 0,
    (r, c) => (r + c) % 3 === 0,
    (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
    (r, c) => (r * c) % 2 + (r * c) % 3 === 0,
    (r, c) => ((r * c) % 2 + (r * c) % 3) % 2 === 0,
    (r, c) => ((r + c) % 2 + (r * c) % 3) % 2 === 0,
  ];

  /* --- Das Raster ------------------------------------------------------- */
  function leeresRaster(v) {
    const n = v * 4 + 17;
    const feld = [], fest = [];
    for (let i = 0; i < n; i++) { feld.push(new Uint8Array(n)); fest.push(new Uint8Array(n)); }

    const setze = (r, c, w) => { feld[r][c] = w; fest[r][c] = 1; };
    const sucher = (zr, zc) => {
      for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) {
        const y = zr + r, x = zc + c;
        if (y < 0 || y >= n || x < 0 || x >= n) continue;
        const rand = (r >= 0 && r <= 6 && (c === 0 || c === 6)) || (c >= 0 && c <= 6 && (r === 0 || r === 6));
        const kern = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        setze(y, x, rand || kern ? 1 : 0);
      }
    };
    sucher(0, 0); sucher(0, n - 7); sucher(n - 7, 0);

    for (let i = 8; i < n - 8; i++) { setze(6, i, i % 2 === 0 ? 1 : 0); setze(i, 6, i % 2 === 0 ? 1 : 0); }

    const pos = alignPos(v);
    pos.forEach(zr => pos.forEach(zc => {
      // Nicht in die Sucherquadrate hinein
      if ((zr <= 8 && zc <= 8) || (zr <= 8 && zc >= n - 9) || (zr >= n - 9 && zc <= 8)) return;
      for (let r = -2; r <= 2; r++) for (let c = -2; c <= 2; c++)
        setze(zr + r, zc + c, Math.max(Math.abs(r), Math.abs(c)) !== 1 ? 1 : 0);
    }));

    setze(n - 8, 8, 1);                                   // das immer dunkle Kästchen

    for (let i = 0; i < 9; i++) {                          // Platz für die Formatangabe
      if (i !== 6) { fest[8][i] = 1; fest[i][8] = 1; }
    }
    for (let i = 0; i < 8; i++) { fest[8][n - 1 - i] = 1; fest[n - 1 - i][8] = 1; }

    if (v >= 7) for (let i = 0; i < 18; i++) {             // Platz für die Versionsangabe
      const r = Math.floor(i / 3), c = i % 3;
      fest[n - 11 + c][r] = 1; fest[r][n - 11 + c] = 1;
    }
    return { feld: feld, fest: fest, n: n };
  }

  /* Der Zickzack von unten rechts nach oben, Spalte 6 wird übersprungen */
  function* wegDurchsRaster(n) {
    let auf = true;
    for (let rechts = n - 1; rechts > 0; rechts -= 2) {
      if (rechts === 6) rechts--;
      for (let k = 0; k < n; k++) {
        const r = auf ? n - 1 - k : k;
        yield [r, rechts]; yield [r, rechts - 1];
      }
      auf = !auf;
    }
  }

  /* --- Strafpunkte: welche Maske das ruhigste Bild ergibt --------------- */
  function strafe(feld, n) {
    let p = 0;
    const lauf = (hole) => {
      for (let a = 0; a < n; a++) {
        let letzte = -1, laenge = 0;
        for (let b = 0; b < n; b++) {
          const w = hole(a, b);
          if (w === letzte) { laenge++; if (laenge === 5) p += 3; else if (laenge > 5) p++; }
          else { letzte = w; laenge = 1; }
        }
      }
    };
    lauf((r, c) => feld[r][c]); lauf((c, r) => feld[r][c]);

    for (let r = 0; r < n - 1; r++) for (let c = 0; c < n - 1; c++) {
      const w = feld[r][c];
      if (w === feld[r][c + 1] && w === feld[r + 1][c] && w === feld[r + 1][c + 1]) p += 3;
    }

    const muster = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
    const musterR = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
    const passt = (hole, a, b, m) => { for (let i = 0; i < 11; i++) if (hole(a, b + i) !== m[i]) return false; return true; };
    for (let a = 0; a < n; a++) for (let b = 0; b + 11 <= n; b++) {
      if (passt((y, x) => feld[y][x], a, b, muster)) p += 40;
      if (passt((y, x) => feld[y][x], a, b, musterR)) p += 40;
      if (passt((y, x) => feld[x][y], a, b, muster)) p += 40;
      if (passt((y, x) => feld[x][y], a, b, musterR)) p += 40;
    }

    let dunkel = 0;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) dunkel += feld[r][c];
    p += Math.floor(Math.abs(dunkel * 100 / (n * n) - 50) / 5) * 10;
    return p;
  }

  /* --- Der eigentliche Weg: Text rein, Kästchen raus -------------------- */
  function kodiere(text) {
    const bytes = new TextEncoder().encode(text);

    /* Die kleinste Version, die den Text fasst. Passt er bei dieser Größe
       auch mit der starken Korrektur, nehmen wir die — sie kostet nichts. */
    const passt = (stufe, i) => {
      const kopf = 4 + (i >= 10 ? 16 : 8);
      return bytes.length + Math.ceil(kopf / 8) <= datenZeichen(stufe, i);
    };
    let v = 0, stufe = "M";
    for (let i = 1; i <= 40; i++) {
      if (passt("M", i)) { v = i; stufe = "M"; break; }
      if (passt("L", i)) { v = i; stufe = "L"; break; }
    }
    if (!v) throw new Error("zu lang für einen QR-Code (" + bytes.length + " Bytes)");

    /* Bitstrom: Modus, Länge, Daten, Abschluss, Füllzeichen */
    const bits = [];
    const schiebe = (wert, anzahl) => { for (let i = anzahl - 1; i >= 0; i--) bits.push((wert >> i) & 1); };
    schiebe(4, 4);
    schiebe(bytes.length, v >= 10 ? 16 : 8);
    bytes.forEach(b => schiebe(b, 8));
    const soll = datenZeichen(stufe, v) * 8;
    for (let i = 0; i < 4 && bits.length < soll; i++) bits.push(0);
    while (bits.length % 8) bits.push(0);
    const fuell = [0xec, 0x11];
    for (let i = 0; bits.length < soll; i++) schiebe(fuell[i % 2], 8);

    const daten = new Uint8Array(bits.length / 8);
    for (let i = 0; i < daten.length; i++)
      for (let b = 0; b < 8; b++) daten[i] = (daten[i] << 1) | bits[i * 8 + b];

    /* In Blöcke teilen, Prüfzeichen rechnen, verschränkt aneinanderlegen */
    const [ecN, g1, d1, g2, d2] = BLOECKE[stufe][v];
    const dBloecke = [], eBloecke = [];
    let p = 0;
    for (let i = 0; i < g1; i++) { const b = daten.slice(p, p + d1); p += d1; dBloecke.push(b); eBloecke.push(ecc(b, ecN)); }
    for (let i = 0; i < g2; i++) { const b = daten.slice(p, p + d2); p += d2; dBloecke.push(b); eBloecke.push(ecc(b, ecN)); }

    const strom = [];
    for (let i = 0; i < Math.max(d1, d2); i++) dBloecke.forEach(b => { if (i < b.length) strom.push(b[i]); });
    for (let i = 0; i < ecN; i++) eBloecke.forEach(b => strom.push(b[i]));

    const strombits = [];
    strom.forEach(b => { for (let i = 7; i >= 0; i--) strombits.push((b >> i) & 1); });
    for (let i = 0; i < REST(v); i++) strombits.push(0);

    /* Setzen, maskieren, die ruhigste Maske behalten */
    const roh = leeresRaster(v), n = roh.n;
    let i = 0;
    for (const [r, c] of wegDurchsRaster(n)) {
      if (roh.fest[r][c]) continue;
      roh.feld[r][c] = i < strombits.length ? strombits[i] : 0;
      i++;
    }

    let bestes = null, besteStrafe = Infinity, besteMaske = 0;
    for (let m = 0; m < 8; m++) {
      const f = roh.feld.map(z => Uint8Array.from(z));
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++)
        if (!roh.fest[r][c] && MASKEN[m](r, c)) f[r][c] ^= 1;
      setzeFormat(f, n, stufe, m);
      if (v >= 7) setzeVersion(f, n, v);
      const s = strafe(f, n);
      if (s < besteStrafe) { besteStrafe = s; bestes = f; besteMaske = m; }
    }
    return { feld: bestes, n: n, version: v, stufe: stufe, maske: besteMaske, bytes: bytes.length };
  }

  function setzeFormat(f, n, stufe, maske) {
    const bits = formatBits(stufe, maske);
    for (let i = 0; i < 15; i++) {
      const b = (bits >> i) & 1;
      if (i < 6) { f[8][i] = b; f[n - 1 - i][8] = b; }
      else if (i === 6) { f[8][7] = b; f[n - 7][8] = b; }
      else if (i === 7) { f[8][8] = b; f[8][n - 8] = b; }
      else if (i === 8) { f[7][8] = b; f[8][n - 7 + (i - 8)] = b; }
      else { f[14 - i][8] = b; f[8][n - 15 + i] = b; }
    }
    f[n - 8][8] = 1;
  }

  function setzeVersion(f, n, v) {
    const bits = versionBits(v);
    for (let i = 0; i < 18; i++) {
      const b = (bits >> i) & 1, r = Math.floor(i / 3), c = i % 3;
      f[n - 11 + c][r] = b; f[r][n - 11 + c] = b;
    }
  }

  /* --- Ausgabe als SVG ------------------------------------------------
     Zwei Fassungen: nüchtern (Kästchen) und gestaltet (runde Punkte,
     gefasste Sucherquadrate). Dunkel auf hell bleibt es in beiden Fällen —
     ein umgekehrter Code wird von manchen Kameras schlicht nicht erkannt,
     und ein schöner Code, den niemand scannen kann, ist keiner.
     -------------------------------------------------------------------- */
  function svg(text, opt) {
    const o = opt || {};
    const q = kodiere(text);
    const rand = o.rand == null ? 4 : o.rand;
    const seite = q.n + rand * 2;
    const hell = o.hell || "#ffffff", dunkel = o.dunkel || "#000000";
    const R = rand;

    // Die drei Sucherquadrate zeichnen wir eigens — sie tragen die Form.
    const istSucher = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= q.n - 7) || (r >= q.n - 7 && c < 7);

    /* Runde Punkte kosten Farbe: ein einzeln stehendes Kästchen wird zum
       Kreis und verliert ein Fünftel seiner Fläche. Bei wenigen, großen
       Kästchen fällt das nicht ins Gewicht — bei einem dichten Code, wo
       ein Kästchen auf dem Display kaum zwei Pixel breit ist, schon.
       Deshalb entscheidet die Größe über die Form, nicht der Geschmack. */
    const rund = o.rund && q.version <= 21;

    let d = "";
    if (rund) {
      for (let r = 0; r < q.n; r++) for (let c = 0; c < q.n; c++) {
        if (!q.feld[r][c] || istSucher(r, c)) continue;
        // Ein Punkt mit weichem Rand; die Nachbarn schließen die Lücken.
        const x = c + R, y = r + R;
        const nachbar = (dr, dc) => {
          const rr = r + dr, cc = c + dc;
          return rr >= 0 && rr < q.n && cc >= 0 && cc < q.n && q.feld[rr][cc] && !istSucher(rr, cc);
        };
        const ol = nachbar(-1, 0) || nachbar(0, -1) ? 0 : 0.5;
        const or_ = nachbar(-1, 0) || nachbar(0, 1) ? 0 : 0.5;
        const ur = nachbar(1, 0) || nachbar(0, 1) ? 0 : 0.5;
        const ul = nachbar(1, 0) || nachbar(0, -1) ? 0 : 0.5;
        d += `M${x + ol} ${y}h${1 - ol - or_}` + (or_ ? `a.5.5 0 0 1 .5 .5` : `h0v0`) +
             `v${1 - or_ - ur}` + (ur ? `a.5.5 0 0 1 -.5 .5` : ``) +
             `h${-(1 - ur - ul)}` + (ul ? `a.5.5 0 0 1 -.5 -.5` : ``) +
             `v${-(1 - ul - ol)}` + (ol ? `a.5.5 0 0 1 .5 -.5` : ``) + `z`;
      }
    } else {
      const eigene = o.eigeneSucher || o.rund;
      for (let r = 0; r < q.n; r++) {
        let c = 0;
        while (c < q.n) {
          if (!q.feld[r][c] || (eigene && istSucher(r, c))) { c++; continue; }
          let bis = c;
          while (bis + 1 < q.n && q.feld[r][bis + 1] && !(eigene && istSucher(r, bis + 1))) bis++;
          d += `M${c + R} ${r + R}h${bis - c + 1}v1h${-(bis - c + 1)}z`;
          c = bis + 1;
        }
      }
    }

    /* Ein Zeichen in der Mitte. Es deckt Kästchen zu, und das ist erlaubt:
       der Code verschränkt seine Wörter über alle Blöcke, ein rundes Feld
       in der Mitte trifft daher jeden Block ein wenig statt einen ganz.
       Bei dreizehn Prozent Breite verbraucht es rund ein Siebtel dessen,
       was die Fehlerkorrektur tragen kann — der Rest bleibt für Reflexe,
       schiefe Winkel und müde Kameras. */
    let mitte = "";
    if (o.marke) {
      const m = (q.n + rand * 2) / 2, r = q.n * 0.068;
      const s2 = r * 0.46;
      mitte = `
        <circle cx="${m}" cy="${m}" r="${r}" fill="${hell}"/>
        <circle cx="${m}" cy="${m}" r="${r - .55}" fill="none"
          stroke="${o.markeRand || dunkel}" stroke-width=".5" opacity=".35"/>
        <path d="M${m} ${m - s2}L${m + s2} ${m}L${m} ${m + s2}L${m - s2} ${m}Z"
          fill="${o.markeFarbe || dunkel}"/>`;
    }

    let augen = "";
    if (o.rund || o.eigeneSucher) {
      const eck = o.rund ? 2.2 : 0;
      const auge = (r, c) => `
        <rect x="${c + R + .5}" y="${r + R + .5}" width="6" height="6" rx="${eck}"
          fill="none" stroke="${o.auge || dunkel}" stroke-width="1"/>
        <rect x="${c + R + 2}" y="${r + R + 2}" width="3" height="3" rx="${eck / 2.2}"
          fill="${o.auge || dunkel}"/>`;
      augen = auge(0, 0) + auge(0, q.n - 7) + auge(q.n - 7, 0);
    }

    const ecke = o.karteEck == null ? 0 : o.karteEck;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${seite} ${seite}"
      shape-rendering="${rund ? "geometricPrecision" : "crispEdges"}"
      role="img" aria-label="${(o.alt || "QR-Code").replace(/"/g, "")}">
      <rect width="${seite}" height="${seite}" rx="${ecke}" fill="${hell}"/>
      <path d="${d}" fill="${dunkel}"/>${augen}${mitte}</svg>`;
  }

  return { kodiere: kodiere, svg: svg, datenZeichen: datenZeichen, alignPos: alignPos, BLOECKE: BLOECKE };
})();
