/* ==========================================================================
   Das Blatt zum Behalten.

   Wird über den QR-Code oder den Link aus der Mail geöffnet. Der Rückblick
   steht im Fragment der Adresse — hinter dem Doppelkreuz. Der Browser
   schickt ein Fragment nie an einen Server: die Worte des Menschen reisen
   im Link mit, kommen aber nirgends an. Diese Seite fragt auch sonst
   nichts nach, sie hat nichts zu laden außer den Bildern des Hauses.

   Gebaut als Dokument, nicht als App: eine Spalte, die von oben nach unten
   gelesen wird. Deshalb wird daraus auch ein brauchbares PDF — „Teilen →
   Als PDF sichern“ im Browser, ohne dass wir ein PDF schreiben müssten.
   ========================================================================== */
(function () {
  const wurzel = document.getElementById("blatt");

  const zeige = (titel, text) => {
    wurzel.innerHTML = "";
    wurzel.append(el(`<div class="bleer">
      <div class="bleerkopf">${esc(titel)}</div>
      <p>${esc(text)}</p></div>`));
  };

  async function los() {
    const roh = location.hash.replace(/^#w=/, "");
    if (!roh) { zeige(t().keepTitle, t().blattLeer); return; }

    let k;
    try { k = await entpacke(roh); }
    catch (e) { zeige(t().blattKaputtKopf, t().blattKaputt); return; }

    // Die Sprache kommt aus dem Link, nicht aus dem Gerät des Lesers
    if (k.l === "en" || k.l === "de") { LANG = k.l; document.documentElement.lang = LANG; }
    const w = dick(k), T = t();
    document.title = "Museum Wrapped · SMÄK";
    baue(w, T, k.d);
  }

  function baue(w, T, datum) {
    wurzel.innerHTML = "";
    const teile = [];
    const abschnitt = (kopf, inhalt) => teile.push(
      `<section class="babschnitt">${kopf ? `<h2>${esc(kopf)}</h2>` : ""}${inhalt}</section>`);

    /* Kopf */
    teile.push(`<header class="bkopf">
      <div class="bmarke"><i>◆</i> SMÄK</div>
      <div class="bdatum">${esc(datum || "")}</div>
    </header>`);

    if (w.greeting) teile.push(`<p class="bgruss">${esc(w.greeting)}</p>`);

    if (w.archetype && w.archetype.name) {
      teile.push(`<div class="barche">
        <div class="barchename">${esc(w.archetype.name)}</div>
        ${w.archetype.subtitle ? `<div class="barchesub">${esc(w.archetype.subtitle)}</div>` : ""}
      </div>`);
    }

    if (Array.isArray(w.themes) && w.themes.length) {
      abschnitt(T.wThemesHead, w.themes.map(th => {
        if (typeof th === "string") return `<div class="bthema"><b>${esc(th)}</b></div>`;
        const titel = th.theme || th.name || th.title || "";
        const text = th.blurb || th.text || th.line || "";
        const zahl = th.count ? `<span class="bmal">${esc(String(th.count))}×</span>` : "";
        return `<div class="bthema"><b>${esc(titel)}${zahl}</b>${text ? `<p>${esc(text)}</p>` : ""}</div>`;
      }).join(""));
    }

    const worte = Array.isArray(w.your_words) ? w.your_words : [];
    if (worte.length) {
      abschnitt(T.wWordsHead, worte.map(m => {
        const o = OBJECTS.find(x => x.id === m.object_id);
        const bild = o ? `<img src="${IMG}${o.img}" alt="" loading="lazy" />` : "";
        return `<figure class="bwort">
          ${bild ? `<div class="bbild">${bild}</div>` : ""}
          <blockquote>${esc(m.quote || "")}</blockquote>
          ${m.echo ? `<p class="becho">${esc(m.echo)}</p>` : ""}
          <figcaption>${esc(titleOf(m.object_id, m.object_title))}
            ${o ? `<span class="bcredit">${esc(creditOf(m.object_id))}</span>` : ""}</figcaption>
        </figure>`;
      }).join(""));
    }

    if (w.reflective_question) abschnitt(T.wQuestion, `<p class="bfrage">${esc(w.reflective_question)}</p>`);

    if (w.go_deeper && typeof w.go_deeper === "object" && w.go_deeper.object_id) {
      const g = w.go_deeper, o = OBJECTS.find(x => x.id === g.object_id);
      abschnitt(T.deeperHead, `<ul class="bliste"><li>
        ${o ? `<span class="bmini"><img src="${IMG}${o.img}" alt="" loading="lazy" /></span>` : ""}
        <span><b>${esc(titleOf(g.object_id, g.title))}</b>
        ${g.reason || g.text ? `<i>${esc(g.reason || g.text)}</i>` : ""}</span></li></ul>`);
    } else if (typeof w.go_deeper === "string" && w.go_deeper) {
      abschnitt(T.deeperHead, `<p>${esc(w.go_deeper)}</p>`);
    }

    const empf = Array.isArray(w.recommendations) ? w.recommendations : [];
    if (empf.length) {
      abschnitt(T.recsHead, `<ul class="bliste">` + empf.map(r => {
        const o = OBJECTS.find(x => x.id === r.object_id);
        return `<li>${o ? `<span class="bmini"><img src="${IMG}${o.img}" alt="" loading="lazy" /></span>` : ""}
          <span><b>${esc(titleOf(r.object_id, r.title))}</b>${r.reason ? `<i>${esc(r.reason)}</i>` : ""}</span></li>`;
      }).join("") + `</ul>`);
    }

    if (w.missed) {
      const o = OBJECTS.find(x => x.id === w.missed.object_id);
      abschnitt(T.missedHead, `<ul class="bliste"><li>
        ${o ? `<span class="bmini"><img src="${IMG}${o.img}" alt="" loading="lazy" /></span>` : ""}
        <span><b>${esc(titleOf(w.missed.object_id, w.missed.title))}</b>
        ${w.missed.reason ? `<i>${esc(w.missed.reason)}</i>` : ""}</span></li></ul>`);
    }

    const nb = typeof nachbarnFuer === "function" ? nachbarnFuer(w) : { haeuser: [] };
    if (nb.haeuser && nb.haeuser.length) {
      abschnitt(T.nachbarnHead,
        (nb.bruecke ? `<p class="bbruecke">${esc(nb.bruecke)}</p>` : "") +
        `<ul class="bliste schmal">` + nb.haeuser.map(m =>
          `<li><span><b>${esc(m.name)}</b><i>${esc(m.text)}</i></span></li>`).join("") + `</ul>`);
    }

    if (w.closing) teile.push(`<p class="bschluss">${esc(w.closing)}</p>`);

    teile.push(`<footer class="bfuss">
      <div class="brechte">${esc(RIGHTS)}</div>
      <div class="bhinweis">${esc(T.blattHinweis)}</div>
    </footer>`);

    wurzel.append(el(`<article class="bblatt">${teile.join("")}</article>`));

    const leiste = el(`<div class="bleiste">
      <button class="btn gold bdruck">${esc(T.blattPdf)}</button></div>`);
    leiste.querySelector(".bdruck").onclick = () => window.print();
    wurzel.append(leiste);
  }

  los();
})();
