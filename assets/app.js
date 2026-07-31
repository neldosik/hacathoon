/* ==========================================================================
   Telefon-Ansicht. Ein Bildschirm, kein Geräterahmen, keine Werkbank.

   Ablauf: Führung (aufnehmen) → Besuch beenden → Story (zum Zeigen) →
   „Mein Faden“ (zum Behalten). Beide Wrapped-Fassungen bleiben erreichbar,
   man springt zwischen ihnen hin und her.

   Voreinstellungen über die URL, damit man ein Testgerät vorbereiten und
   dann aus der Hand geben kann:
     ?lang=en   englische Fassung, Spracherkennung auf en-US
     ?live=1    fragt wirklich bei n8n an (kostet Credits)
   Beides ist auch im Zahnrad oben rechts erreichbar.
   ========================================================================== */
(function () {
  const q = new URLSearchParams(location.search);
  if (q.get("lang") === "en") LANG = "en";
  if (q.get("live") === "1") liveMode = true;

  wrappedPeer = true;        // Story und Faden verweisen aufeinander
  wrappedStyle = "story";    // die Story kommt zuerst
  document.documentElement.lang = LANG;

  const root = document.getElementById("app");
  const app = Fuehrung(root);

  /* --- Einstellungen ------------------------------------------------- */
  function diagText() {
    const T = t(), c = window.__lastCall;
    if (!c) return T.diagIdle;
    return T.diagHead + "\n" + Object.keys(c).map(k => k + ": " + c[k]).join("\n");
  }

  function openSettings() {
    const T = t();
    const sheet = el(`<div class="sheet open" style="position:fixed"><div class="sheetbody"><div class="grab"></div></div></div>`);
    sheet.onclick = (e) => { if (e.target === sheet) sheet.remove(); };
    const sb = sheet.querySelector(".sheetbody");
    sb.append(el(`<div class="vtitle" style="margin:0">${esc(T.settings)}</div>`));

    const seg = (label, options, isOn, onPick) => {
      const row = el(`<div class="setrow"><span>${esc(label)}</span></div>`);
      const s = el(`<div class="seg"></div>`);
      options.forEach(([val, text]) => {
        const b = el(`<button class="${isOn(val) ? "on" : ""}">${esc(text)}</button>`);
        b.onclick = () => { onPick(val); sheet.remove(); openSettings(); };
        s.append(b);
      });
      row.append(s);
      return row;
    };

    sb.append(seg(T.setLang, [["de", "DE"], ["en", "EN"]], v => LANG === v, v => {
      LANG = v; document.documentElement.lang = v; app.relang();
    }));
    sb.append(seg(T.setSource, [[false, T.srcSample], [true, T.srcLive]], v => liveMode === v, v => {
      liveMode = v;
    }));
    sb.append(el(`<div class="diag">${esc(diagText())}</div>`));

    const close = el(`<button class="linkish" style="align-self:center">${esc(T.close)}</button>`);
    close.onclick = () => sheet.remove();
    sb.append(close);
    document.body.append(sheet);
  }

  /* Die Führung zeichnet ihren Kopf bei jedem Schritt neu, also hängen wir
     das Zahnrad nach jeder Änderung wieder an. */
  const GEAR = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>';

  function mountGear() {
    const bar = root.querySelector(".topbar");
    if (!bar || bar.querySelector(".gear")) return;
    const b = el(`<button class="gear" aria-label="Einstellungen">${GEAR}</button>`);
    b.onclick = openSettings;
    bar.append(b);
  }
  new MutationObserver(mountGear).observe(root, { childList: true, subtree: true });
  mountGear();
})();
