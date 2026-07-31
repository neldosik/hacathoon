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
  if (q.get("font")) setFont(q.get("font"));

  wrappedPeer = true;        // Story und Faden verweisen aufeinander
  wrappedStyle = "story";    // die Story kommt zuerst
  document.documentElement.lang = LANG;

  const root = document.getElementById("app");
  const app = Fuehrung(root);

  /* --- Einstellungen ------------------------------------------------- */

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
    sb.append(seg(T.textSource, [[false, T.sampleShort], [true, T.liveShort]], v => liveMode === v, v => {
      liveMode = v;
    }));
    sb.append(el(`<div class="sethint">${esc(T.srcNote)}</div>`));

    const close = el(`<button class="btn" style="min-height:52px;margin-top:4px">${esc(T.close)}</button>`);
    close.onclick = () => sheet.remove();
    sb.append(close);
    document.body.append(sheet);
  }

  /* Die Führung zeichnet ihren Kopf bei jedem Schritt neu, also hängen wir
     das Zahnrad nach jeder Änderung wieder an. */
  const GEAR = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>';

  function mountGear() {
    const slot = root.querySelector(".topright") || root.querySelector(".topbar");
    if (!slot || slot.querySelector(".gear")) return;
    const b = el(`<button class="gear" aria-label="${esc(t().settings)}">${GEAR}</button>`);
    b.onclick = openSettings;
    slot.append(b);
  }
  new MutationObserver(mountGear).observe(root, { childList: true, subtree: true });
  mountGear();
})();
