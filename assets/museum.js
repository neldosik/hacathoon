/* ==========================================================================
   Museum Wrapped — Capture + Wrapped. Konzeptskizzen, kein Produkt.
   Zweisprachig: Oberfläche, Raumnamen, Objekttitel, Kuratorentexte und die
   Spracherkennung wechseln mit. Am Ende geht ein echter POST an n8n.
   ========================================================================== */
const IMG = "assets/objects/";
const WEBHOOK_URL = "https://y1jia.app.n8n.cloud/webhook/museum-wrapped";
let LANG = "de";

/* CC BY-NC-ND 4.0 verlangt die Nennung des einzelnen Fotografen, eine
   Sammelzeile genuegt nicht. ND heisst ausserdem: keine Beschnitte, keine
   Filter, keine Farbschleier ueber den Museumsfotos. */
const CREDITS = {
  "OBJ-01": "SMÄK, Foto: Marianne Franke (2013)",
  "OBJ-02": "SMÄK, 3D-Scan: Federico Taverni, Massimiliano Nuzzolo, Sun Temples Project (2024)",
  "OBJ-03": "SMÄK, Foto: Marianne Franke (2020)",
  "OBJ-04": "SMÄK, Foto: Marianne Franke (2019)",
  "OBJ-05": "SMÄK, Foto: Marianne Franke (2021)",
  "OBJ-06": "SMÄK, Foto: Marianne Franke (2013)",
  "OBJ-07": "SMÄK, Foto: Marianne Franke (2020)",
  "OBJ-08": "SMÄK, Foto: Marianne Franke (2021)",
  "OBJ-09": "SMÄK, Foto: Marianne Franke (2021)",
  "OBJ-10": "SMÄK, Foto: Roy Hessing (2022)",
  "OBJ-11": "SMÄK, Foto: Marianne Franke (2019)",
  "OBJ-12": "SMÄK, Foto: Marianne Franke (2012)",
  "OBJ-13": "SMÄK, Foto: Marianne Franke (2013)",
  "OBJ-14": "SMÄK, Foto: Marianne Franke (2010)",
  "OBJ-15": "SMÄK, Foto: Marianne Franke (2012)",
  "OBJ-16": "SMÄK, Foto: Marianne Franke (2019)",
  "OBJ-17": "SMÄK, Foto: Marianne Franke (2013)",
  "OBJ-18": "SMÄK, Foto: Roy Hessing (2022)",
  "OBJ-19": "SMÄK, Foto: Marianne Franke (2011)",
  "OBJ-20": "SMÄK, Foto: Claus Rammel (2022)",
  "OBJ-21": "SMÄK, Foto: Roy Hessing (2024)",
  "OBJ-22": "SMÄK, Foto: Marianne Franke (2013)",
};

/* Nachbarn im Kunstareal. Die Beschreibungen sind nachgeschlagen, nicht
   erfunden; das Thema des Besuchs entscheidet nur, wen wir zeigen, und
   begruendet nichts ueber fremde Sammlungen. Die Neue Pinakothek fehlt
   absichtlich - sie ist wegen Sanierung geschlossen. */
const NACHBARN = {
  glyptothek: {
    de: { name: "Glyptothek", text: "Antike Skulptur in klassizistischen Sälen — Münchens ältestes öffentliches Museum." },
    en: { name: "Glyptothek", text: "Ancient sculpture in neoclassical halls — Munich's oldest public museum." },
  },
  antiken: {
    de: { name: "Staatliche Antikensammlungen", text: "Griechische, römische und etruskische Vasen, Goldschmiedearbeiten und Kleinkunst." },
    en: { name: "Staatliche Antikensammlungen", text: "Greek, Roman and Etruscan vases, goldwork and small-scale art." },
  },
  alte: {
    de: { name: "Alte Pinakothek", text: "Alte Meister aus sechs Jahrhunderten europäischer Malerei." },
    en: { name: "Alte Pinakothek", text: "Old Masters from six centuries of European painting." },
  },
  lenbach: {
    de: { name: "Lenbachhaus", text: "Der Blaue Reiter: Kandinsky, Franz Marc, Gabriele Münter." },
    en: { name: "Lenbachhaus", text: "The Blue Rider: Kandinsky, Franz Marc, Gabriele Münter." },
  },
  moderne: {
    de: { name: "Pinakothek der Moderne", text: "Kunst, Grafik, Architektur und Design des 20. und 21. Jahrhunderts." },
    en: { name: "Pinakothek der Moderne", text: "Art, works on paper, architecture and design of the 20th and 21st centuries." },
  },
  palaeo: {
    de: { name: "Paläontologisches Museum", text: "Fossilien und Skelette aus der Erdgeschichte, im selben Viertel." },
    en: { name: "Paläontologisches Museum", text: "Fossils and skeletons from the history of the earth, in the same quarter." },
  },
};
/* Welche Nachbarn zu welchem Schwerpunkt passen — je zwei, bewusst knapp. */
const NACHBAR_THEMA = {
  "Death & Afterlife": ["glyptothek", "alte"],
  "Gods & Belief": ["glyptothek", "antiken"],
  "Kingship & Power": ["glyptothek", "alte"],
  "Daily Life": ["antiken", "lenbach"],
  "Writing & Knowledge": ["alte", "antiken"],
  "Beauty & Body": ["glyptothek", "moderne"],
};
const KUNSTAREAL_URL = "https://kunstareal.de/haeuser-und-institutionen";

/* Die Bruecke spricht ueber den Besucher, nicht ueber fremde Sammlungen —
   so behauptet sie nichts, was wir nicht nachgeschlagen haben. */
const NACHBAR_BRUECKE = {
  "Death & Afterlife": {
    de: "Du hast dich lange bei dem aufgehalten, was nach dem Leben kommt. Nebenan wird dieselbe Frage anders gestellt.",
    en: "You spent your time with what comes after this life. Next door the same question is asked differently." },
  "Gods & Belief": {
    de: "Dich hat beschäftigt, woran die Menschen damals glaubten. Zwei Häuser weiter stehen andere Götter.",
    en: "You kept circling what these people believed in. Two houses on stand other gods." },
  "Kingship & Power": {
    de: "Dich hat beschäftigt, wer die Macht hatte und wie er sie zeigte. In Stein setzen liessen sich Herrscher nicht nur in Ägypten.",
    en: "You kept circling who held power and how they showed it. Rulers had themselves carved in stone well beyond Egypt." },
  "Daily Life": {
    de: "Dich hat das ganz gewöhnliche Leben interessiert. Davon erzählen die Nachbarn auch.",
    en: "It was ordinary everyday life that caught you. The neighbours tell of it too." },
  "Writing & Knowledge": {
    de: "Dich hat interessiert, was aufgeschrieben und bewahrt wurde. Nebenan wird weiter bewahrt.",
    en: "You were drawn to what was written down and kept. The keeping goes on next door." },
  "Beauty & Body": {
    de: "Dich hat beschäftigt, wie man aussehen wollte. Auch nebenan formen Menschen Körper.",
    en: "You kept circling how people wanted to look. Next door people shape bodies too." },
};

function nachbarnFuer(w) {
  const themes = Array.isArray(w.themes) ? w.themes : [];
  const top = (themes[0] && themes[0].theme)
    || (w.recommendations && w.recommendations[0] && w.recommendations[0].theme) || "";
  const keys = NACHBAR_THEMA[top] || ["glyptothek", "antiken"];
  const br = NACHBAR_BRUECKE[top];
  return {
    bruecke: br ? (br[LANG] || br.de) : "",
    haeuser: keys.map(k => NACHBARN[k][LANG] || NACHBARN[k].de),
  };
}

const legalRow = () => `<div class="legal">` + LEGAL_LINKS.map(l =>
  `<a href="${l.url}" target="_blank" rel="noopener noreferrer">${esc(l[LANG] || l.de)}</a>`
).join("") + `</div>`;
const creditOf = (id) => CREDITS[id] ? "© " + CREDITS[id] + " / CC BY-NC-ND 4.0" : "";
const LEGAL_LINKS = [
  { de: "Datenschutz", en: "Privacy", url: "https://smaek.de/datenschutzerklaerung/" },
  { de: "Impressum", en: "Legal notice", url: "https://smaek.de/impressum/" },
  { de: "Barrierefreiheit", en: "Accessibility", url: "https://smaek.de/erklaerung-zur-barrierefreiheit/" },
];
const RIGHTS = "Objekttexte und Abbildungen: © Staatliches Museum Ägyptischer Kunst, München "
  + "(Sammlung Online, CC BY-NC-ND 4.0) — verwendet mit freundlicher Genehmigung.";


/* Die Anzeigeschrift lässt sich am Gerät wechseln — welche trägt, sieht man
   erst auf dem Telefon. Geladen wird erst beim Umschalten. */
const FONTS = [
  { key:"cormorant",  label:"Cormorant",  css:'"Cormorant Garamond", Georgia, serif' },
  { key:"spectral",   label:"Spectral",   css:'"Spectral", Georgia, serif',
    google:"Spectral:ital,wght@0,300;0,400;0,500;1,300;1,400" },
  { key:"fraunces",   label:"Fraunces",   css:'"Fraunces", Georgia, serif',
    google:"Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..500" },
  { key:"instrument", label:"Instrument", css:'"Instrument Serif", Georgia, serif',
    google:"Instrument+Serif:ital@0;1" },
];
let fontKey = "cormorant";
function setFont(key) {
  const f = FONTS.find(x => x.key === key) || FONTS[0];
  fontKey = f.key;
  if (f.google && !document.getElementById("font-" + f.key)) {
    const l = document.createElement("link");
    l.id = "font-" + f.key; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=" + f.google + "&display=swap";
    document.head.append(l);
  }
  document.documentElement.style.setProperty("--display", f.css);
}

const L = {
  de: {
    speech: "de-DE",
    labTitle: "Museum Wrapped — Skizzen",
    labIntro: "Konzeptskizzen, kein Produkt. Echte Objekte, Fotos und Kuratorentexte aus dem Airtable des SMÄK. Der Besucher sagt frei heraus, was ihm durch den Kopf geht — es gibt keine vorgegebene Frage. Nach mindestens einer Reflexion führt „Besuch beenden“ zum echten Wrapped: die Reaktionen gehen an n8n, die KI antwortet, und die Antwort wird als Story gezeigt.",
    tabAll: "Alle vier", tabD: "Nur Führung", tabA: "Nur Vitrine", tabB: "Nur Kartei", tabC: "Nur Saal",
    nameA: "A · Vitrine", nameB: "B · Kartei", nameC: "C · Saal", nameD: "D · Führung",
    whyA: "Ein Objekt, ganze Aufmerksamkeit. Das Foto sitzt im Passepartout wie in einer echten Vitrine — querformatige Stücke werden nicht beschnitten.",
    whyB: "Die Route auf einen Blick: was erzählt ist, was noch offen. Antworten passiert im Blatt von unten.",
    whyC: "Schematischer Grundriss statt 3D — die Geste des bestehenden Guides, nur ruhig. Der Plan ist erfunden, nicht vermessen.",
    whyD: "Ein Raum füllt den Schirm und wechselt, sobald du weitergehst. Foto antippen öffnet Beschreibung, weitere Aufnahmen und den Audioguide. Die Position ist abgespielt — es steckt keine Ortung dahinter.",
    einladung: "Was geht dir gerade durch den Kopf?",
    erzaehlt: "erzählt", room: "Raum",
    walk: "Rundgang", pause: "Pause", sketch: "Position simuliert",
    next: "Nächstes", here: "Du stehst davor",
    listening: "Ich höre zu", listenStop: "Ich höre zu — noch einmal tippen zum Beenden",
    sayHere: "Du stehst davor — flüster es einfach", sayAny: "Flüster es einfach, ganz leise",
    sayOne: "Flüstern genügt — ein Satz reicht", again: "Nochmal sprechen und überschreiben",
    typeInstead: "Lieber tippen", save: "Speichern", placeholder: "In deinen eigenen Worten …",
    finish: "Besuch beenden", close: "Schliessen",
    routeHead: "Deine Route<br/>durch die Sammlung",
    routeSub: "Sechs Objekte. Zu jedem so viel oder so wenig, wie du sagen willst.",
    told: "Erzählt", open: "Noch offen",
    objectOf: (i, n) => `Objekt ${i} von ${n}`,
    shots: (n) => `${n} Aufnahme${n > 1 ? "n" : ""}`,
    audioStub: "Audioguide des Museums · Platzhalter",
    legendTold: "erzählt", legendOpen: "offen", schematic: "Schematischer Plan",
    /* Wrapped */
    loading: ["Deine Worte werden gelesen …", "Die Fäden deines Besuchs werden gesucht …", "Dein Wrapped entsteht …"],
    loadNote: "Das dauert einen Moment — die KI liest gerade mit",
    wIntro: "Dein Besuch, gewoben",
    wStatsHead: "Dein Besuch in Zahlen",
    statReflections: "Gedanken hinterlassen", statObjects: "Objekte begleitet", statMinutes: "Minuten hier",
    wWordsHead: "In deinen Worten",
    wQuestion: "Eine Frage zum Mitnehmen",
    wDeeper: "Komm wieder für",
    restart: "Neuer Besuch", offline: "Der Server hat nicht geantwortet — dies ist ein Beispiel.",
    keepsake: "Zum Behalten",
    demoNote: "Beispieltext — der Server wird nicht gefragt",
    toThread: "Mein Faden", toStory: "Als Story ansehen",
    recsHead: "Für den nächsten Besuch", missedHead: "Daran bist du vorbeigegangen",
    textSource: "Woher kommt der Text?", sampleShort: "Beispiel", liveShort: "Live",
    saal: "Saal", youAreHere: "Du bist hier", walkRunning: "Rundgang läuft",
    steps: (n) => n + (n === 1 ? " Schritt" : " Schritte"), vitrine: (n) => "Vitrine " + n,
    toEntrance: "Eingang", finishShort: "Besuch beenden", goTo: "Weiter zum Saal",
    speechErr: {
      nosupport: "Dieser Browser kann keine Spracherkennung. Schreib es einfach auf.",
      "not-allowed": "Das Mikrofon ist gesperrt. Erlaube es für diese Seite in den Browser-Einstellungen.",
      "service-not-allowed": "Auf dem iPhone braucht Safari dafür das Diktat: Einstellungen → Allgemein → Tastatur → Diktat einschalten.",
      "audio-capture": "Ich finde kein Mikrofon.",
      network: "Die Erkennung braucht Netz und bekommt gerade keins.",
      "no-speech": "Ich habe nichts gehört. Näher ans Mikrofon — oder schreib es auf.",
      nostart: "Die Erkennung ist nicht angesprungen. In einem In-App-Browser geht sie nicht — öffne die Seite in Safari oder schreib es auf.",
      unknown: "Die Spracherkennung hat abgebrochen.",
    },
    tryAgain: "Nochmal versuchen",
    tellNow: "Jetzt erz\u00e4hlen", tapHint: "Tippen bl\u00e4ttert", threadHead: "Dein Faden",
    loadSub: "Deine Gedanken sind unterwegs. Das dauert einen Moment.",
    heard: "So habe ich dich verstanden", keepIt: "So lassen",
    speakAgain: "Neu sprechen", editText: "Text ändern",
    notSaved: "noch nicht gespeichert", seconds: (n) => n + " Sekunden",
    alreadyTold: "Schon erzählt · jederzeit änderbar",
    introTitle: "Erzähl mir, was du siehst — am Ende bekommst du deinen Besuch zurück.",
    introStep1: "Du gehst durch die Säle",
    introStep1Sub: "Der Guide sagt dir, wenn ein Objekt vor dir steht.",
    introStep2: "Sag frei heraus, was dir durch den Kopf geht",
    introStep2Sub: "Es gibt keine richtige Antwort. Flüstern genügt — ein Satz reicht.",
    introStep3: "Am Ende: dein Faden",
    introStep3Sub: "Deine Worte, was sie über deinen Tag sagen, und drei Objekte für das nächste Mal.",
    consentTitle: "Bevor wir beginnen",
    consentIntro: "Dieses Plug-in hält deine eigenen Gedanken zu einzelnen Objekten fest und erstellt daraus am Ende einen persönlichen Rückblick.",
    consentBullets: [
      "Was gespeichert wird: nur der Text deiner Reflexion, das Objekt und die Uhrzeit.",
      "Wie lange: nur für die Dauer deines Besuchs. Danach wird die Sitzung gelöscht.",
      "Keine Anmeldung, keine Namen — deine Sitzung ist anonym.",
      "Gemerkte Objekte bleiben nur auf deinem Gerät und nur für diese Sitzung.",
      "Die Spracherkennung erfolgt über deinen Browser. Dabei wird die Aufnahme zur Umwandlung in Text an den Browser-Anbieter (z. B. Google) übertragen.",
      "Der Rückblick wird von einer KI (OpenAI) aus deinen Worten erzeugt.",
      "Du kannst jederzeit tippen statt sprechen.",
    ],
    consentVoluntary: "Die Teilnahme ist freiwillig. Der Medienguide funktioniert auch ohne dieses Plug-in.",
    consentYes: "Einverstanden — los geht's",
    consentNo: "Ohne Aufnahme fortfahren",
    aiBanner: "Von KI erstellt — aus deinen eigenen Worten und geprüften Museumstexten.",
    micWarn: "Sprich leise — das Mikrofon kann auch andere Besucher aufnehmen.",
    speak: "Sprechen", type: "Tippen", chars: (n) => n + " Zeichen",
    wipe: "Sitzung löschen", wipeDone: "Sitzung gelöscht.",
    rights: RIGHTS,
    introVoice: "Ich erzähle mit der Stimme", introType: "Lieber schreiben",
    introSwitch: "Du kannst jederzeit wechseln.",
    neu: "Neu",
    nachbarnHead: "Nebenan im Kunstareal",
    nachbarnFoot: "Ein paar Minuten zu Fuß von hier. Mehr Häuser: ",
    keep: "Behalten", keepTitle: "Deinen Besuch behalten",
    keepNote: "Nichts davon liegt auf einem Server — der Text geht mit, nicht ein Link darauf.",
    keepRights: RIGHTS,
    keepShare: "Teilen", keepMail: "Per E-Mail schicken", keepCopy: "Text kopieren",
    keepCopied: "Kopiert.",
    settings: "Einstellungen", setLang: "Sprache", setSource: "Text", setFont: "Schrift",
    likeLabel: "Merken", likeHint: "Andere Besucher haben hier gehalten",
    demoBadge: "Beispieltext",
    diagIdle: "Noch kein Aufruf in dieser Sitzung.", diagHead: "Letzter Aufruf",
    /* Galerie der Wrapped-Entwürfe */
    wsecTitle: "Wrapped — vier Entwürfe",
    wsecIntro: "Derselbe echte Text der KI, vier Mal anders gesetzt. Zum Vergleichen, nicht zum Bedienen — der Weg dorthin liegt oben im Capture.",
    srcSample: "Beispieltext", srcLive: "Live vom Server",
    srcNote: "Der Beispieltext ist eine echte, einmal geholte Antwort des Servers. „Live“ fragt bei jedem „Besuch beenden“ neu an und verbraucht Credits.",
    wsAll: "Alle vier", wsStory: "Nur Story", wsBlatt: "Nur Blatt", wsKarte: "Nur Karte", wsFaden: "Nur Faden",
    nStory: "W1 · Story", nBlatt: "W2 · Blatt", nKarte: "W3 · Karte", nFaden: "W4 · Faden",
    wStory: "Ein Kader nach dem anderen, Tippen blättert — rechts weiter, links zurück. Baut Spannung auf und liest sich noch aus der letzten Reihe.",
    wBlatt: "Alles auf einer gedruckten Seite zum Scrollen. Am ruhigsten und am ehesten Museum; man überblickt den ganzen Besuch auf einmal.",
    wKarte: "Ein einziger Bildschirm ohne Scrollen, wie ein Andenken zum Abfotografieren. Verdichtet stark — die übrigen Zitate fallen weg.",
    wFaden: "Der Besuch als Zeitstrahl an einem goldenen Faden. Betont die Reihenfolge: wo du warst und in welcher Reihenfolge es dich berührt hat.",
    toWrapped: "Wrapped",
  },
  en: {
    speech: "en-US",
    labTitle: "Museum Wrapped — sketches",
    labIntro: "Concept sketches, not a product. Real objects, photographs and curator texts from the project's Airtable. The visitor simply says whatever comes to mind — there is no prescribed question. After at least one reflection, “Finish visit” leads to the real Wrapped: the reactions go to n8n, the AI answers, and the answer is shown as a story.",
    tabAll: "All four", tabD: "Guided only", tabA: "Vitrine only", tabB: "Index only", tabC: "Floor plan only",
    nameA: "A · Vitrine", nameB: "B · Index", nameC: "C · Floor plan", nameD: "D · Guided",
    whyA: "One object, full attention. The photograph sits in a mount like a real display case — landscape pieces are never cropped.",
    whyB: "The whole route at a glance: what has been told, what is still open. Answering happens in the sheet from below.",
    whyC: "A schematic plan instead of 3D — the gesture of the existing guide, only calmer. The plan is invented, not surveyed.",
    whyD: "One room fills the screen and changes as you walk on. Tap the photo for the description, further shots and the audio guide. The position is played back — there is no tracking behind it.",
    einladung: "What's going through your mind?",
    erzaehlt: "shared", room: "Room",
    walk: "Walk", pause: "Pause", sketch: "Simulated position",
    next: "Next", here: "You're right here",
    listening: "Listening", listenStop: "Listening — tap again to stop",
    sayHere: "You're here — just whisper it", sayAny: "Whisper it, quietly is enough",
    sayOne: "A whisper is enough — one sentence will do", again: "Speak again to replace it",
    typeInstead: "Type instead", save: "Save", placeholder: "In your own words …",
    finish: "Finish visit", close: "Close",
    routeHead: "Your route<br/>through the collection",
    routeSub: "Six objects. To each of them as much or as little as you want to say.",
    told: "Shared", open: "Still open",
    objectOf: (i, n) => `Object ${i} of ${n}`,
    shots: (n) => `${n} photograph${n > 1 ? "s" : ""}`,
    audioStub: "Museum audio guide · placeholder",
    legendTold: "shared", legendOpen: "open", schematic: "Schematic plan",
    loading: ["Reading your words …", "Looking for the thread of your visit …", "Weaving your Wrapped …"],
    loadNote: "This takes a moment — the AI is reading along",
    wIntro: "Your visit, woven",
    wStatsHead: "Your visit in numbers",
    statReflections: "thoughts left behind", statObjects: "objects kept company", statMinutes: "minutes here",
    wWordsHead: "In your own words",
    wQuestion: "One question to take with you",
    wDeeper: "Come back for",
    restart: "New visit", offline: "The server did not answer — this is an example.",
    keepsake: "Yours to keep",
    demoNote: "Sample text — the server is not called",
    toThread: "My thread", toStory: "View as story",
    recsHead: "For your next visit", missedHead: "What you walked past",
    textSource: "Where does the text come from?", sampleShort: "Sample", liveShort: "Live",
    saal: "Room", youAreHere: "You are here", walkRunning: "Walk running",
    steps: (n) => n + (n === 1 ? " step" : " steps"), vitrine: (n) => "Case " + n,
    toEntrance: "Entrance", finishShort: "Finish visit", goTo: "Go to room",
    speechErr: {
      nosupport: "This browser cannot do speech recognition. Just write it down.",
      "not-allowed": "The microphone is blocked. Allow it for this page in your browser settings.",
      "service-not-allowed": "On iPhone, Safari needs dictation for this: Settings → General → Keyboard → Enable Dictation.",
      "audio-capture": "I cannot find a microphone.",
      network: "Recognition needs a connection and there is none right now.",
      "no-speech": "I did not hear anything. Move closer — or write it down.",
      nostart: "Recognition did not start. It does not work inside in-app browsers — open the page in Safari, or write it down.",
      unknown: "Speech recognition stopped.",
    },
    tryAgain: "Try again",
    tellNow: "Tell it now", tapHint: "Tap to move on", threadHead: "Your thread",
    loadSub: "Your thoughts are on their way. This takes a moment.",
    heard: "This is what I understood", keepIt: "Keep it",
    speakAgain: "Speak again", editText: "Edit the text",
    notSaved: "not saved yet", seconds: (n) => n + " seconds",
    alreadyTold: "Already told · change any time",
    introTitle: "Tell me what you see — at the end you get your visit back.",
    introStep1: "You walk through the rooms",
    introStep1Sub: "The guide tells you when an object is in front of you.",
    introStep2: "Say whatever comes to mind",
    introStep2Sub: "There is no right answer. A whisper is enough — one sentence will do.",
    introStep3: "At the end: your thread",
    introStep3Sub: "Your words, what they say about your day, and three objects for next time.",
    consentTitle: "Before we begin",
    consentIntro: "This plug-in keeps your own thoughts on individual objects and turns them into a personal recap at the end.",
    consentBullets: [
      "What is stored: only the text of your reflection, the object and the time.",
      "For how long: only for the duration of your visit. The session is deleted afterwards.",
      "No sign-in, no names — your session is anonymous.",
      "Objects you keep stay on your device and only for this session.",
      "Speech recognition runs through your browser. The recording is sent to the browser vendor (e.g. Google) to be turned into text.",
      "The recap is written by an AI (OpenAI) from your words.",
      "You can type instead of speaking at any time.",
    ],
    consentVoluntary: "Taking part is voluntary. The media guide works without this plug-in.",
    consentYes: "I agree — let's start",
    consentNo: "Continue without recording",
    aiBanner: "Made by AI — from your own words and checked museum texts.",
    micWarn: "Speak quietly — the microphone can pick up other visitors too.",
    speak: "Speak", type: "Type", chars: (n) => n + " characters",
    wipe: "Delete session", wipeDone: "Session deleted.",
    rights: RIGHTS,
    introVoice: "I'll speak", introType: "I'd rather write",
    introSwitch: "You can switch at any time.",
    neu: "New",
    nachbarnHead: "Next door in the Kunstareal",
    nachbarnFoot: "A few minutes on foot from here. More houses: ",
    keep: "Keep", keepTitle: "Keep your visit",
    keepNote: "None of this sits on a server — the text travels with you, not a link to it.",
    keepRights: RIGHTS,
    keepShare: "Share", keepMail: "Send by e-mail", keepCopy: "Copy the text",
    keepCopied: "Copied.",
    settings: "Settings", setLang: "Language", setSource: "Text", setFont: "Typeface",
    likeLabel: "Keep", likeHint: "Other visitors stopped here",
    demoBadge: "Sample text",
    diagIdle: "No call in this session yet.", diagHead: "Last call",
    wsecTitle: "Wrapped — four drafts",
    wsecIntro: "The same real AI text, set four different ways. For comparing, not for using — the way there is in the capture section above.",
    srcSample: "Sample text", srcLive: "Live from server",
    srcNote: "The sample is a real answer from the server, fetched once. “Live” calls it again on every “Finish visit” and spends credits.",
    wsAll: "All four", wsStory: "Story only", wsBlatt: "Page only", wsKarte: "Card only", wsFaden: "Thread only",
    nStory: "W1 · Story", nBlatt: "W2 · Page", nKarte: "W3 · Card", nFaden: "W4 · Thread",
    wStory: "One frame at a time, tap to move on — right for forward, left for back. Builds up, and still reads from the back row.",
    wBlatt: "Everything on one printed page you scroll. The calmest and the most museum-like; the whole visit at a glance.",
    wKarte: "A single screen with no scrolling, a keepsake made to be photographed. Condenses hard — the other quotes fall away.",
    wFaden: "The visit as a timeline on a golden thread. Puts the order first: where you were, and in which order it reached you.",
    toWrapped: "Wrapped",
  },
};
const t = () => L[LANG];

/* Objekte des Demo-Rundgangs. OBJ-16 fehlt absichtlich — es soll dem Wrapped
   als Empfehlung übrig bleiben. Titel und Kuratorentexte je Sprache. */
const OBJECTS = [
  { id:"OBJ-14", img:"OBJ-14@hi.jpg", plan:{x:26,y:20},
    de:{ title:"Oberteil des Sarges der Königstochter Satdjehuti", epoche:"17. Dynastie", room:"Jenseits",
      fact:"Oberteil (Kopfteil) des vergoldeten Sarges der Königstochter und Königsschwester Satdjehuti (Inv. ÄS 7163), vom Übergang der Zweiten Zwischenzeit zum Neuen Reich. Der überlebensgroße anthropoide Holzsarg war mit Blattgold überzogen; die Augen bestehen aus Einlagen aus weißem Marmor und schwarzem Stein. Satdjehuti trägt die Geierhaube, eine den königlichen Frauen vorbehaltene Kopfbedeckung." },
    en:{ title:"Upper part of the coffin of the king's daughter Satdjehuti", epoche:"17th Dynasty", room:"Afterlife",
      fact:"Upper part (head section) of the gilded coffin of Satdjehuti, king's daughter and king's sister (inv. ÄS 7163), from the transition between the Second Intermediate Period and the New Kingdom. The over-lifesize anthropoid wooden coffin was covered in gold leaf; the eyes are inlaid with white marble and black stone. Satdjehuti wears the vulture headdress, a covering reserved for royal women." } },

  { id:"OBJ-15", img:"OBJ-15@hi.jpg", plan:{x:60,y:16},
    de:{ title:"Totenbuch des Pajuheru", epoche:"Spätzeit", room:"Jenseits",
      fact:"Totenbuch des Pajuheru (Leihgabe 2). Der mehrere Meter lange Papyrus enthält Sprüche, die den Verstorbenen auf seinem Weg ins Jenseits begleiten, schützen und versorgen sollen – in hieratischer Schrift, mit rot hervorgehobenen Überschriften und Vignetten. Im Mittelpunkt steht das Totengericht unter Osiris, bei dem Anubis und Horus das Herz gegen die Feder der Maat abwiegen." },
    en:{ title:"Book of the Dead of Pajuheru", epoche:"Late Period", room:"Afterlife",
      fact:"Book of the Dead of Pajuheru (loan 2). The papyrus, several metres long, holds the spells that were to accompany, protect and provide for the deceased on the way into the afterlife — in hieratic script, with headings picked out in red, and with vignettes. At its centre stands the judgement of the dead under Osiris, where Anubis and Horus weigh the heart against the feather of Maat." } },

  { id:"OBJ-07", img:"OBJ-07@hi.jpg", plan:{x:24,y:52},
    de:{ title:"Sitzgruppe des Sabu, seiner Frau Meretites und des Sohnes Isebwer", epoche:"5. Dynastie", room:"Kunst und Form",
      fact:"Sitzgruppe des Sabu, seiner Frau Meretites und ihres Sohnes Isebwer (Inv. ÄS 7146), 5. Dynastie, Altes Reich (um 2435–2306 v. Chr.), aus bemaltem Kalkstein. Die Statuengruppe zeigt die Familie gemeinsam sitzend." },
    en:{ title:"Seated group of Sabu, his wife Meretites and their son Isebwer", epoche:"5th Dynasty", room:"Art and Form",
      fact:"Seated group of Sabu, his wife Meretites and their son Isebwer (inv. ÄS 7146), 5th Dynasty, Old Kingdom (about 2435–2306 BC), in painted limestone. The group shows the family seated together." } },

  { id:"OBJ-06", img:"OBJ-06@hi.jpg", plan:{x:56,y:56},
    de:{ title:"Würfelstatue des Bakenchons, Hohepriester des Amun", epoche:"19. Dynastie", room:"Kunst und Form",
      fact:"Würfelstatue des Bakenchons (Inv. Gl. WAF 38), Hohepriester des Amun. Der hockende, in ein enges Gewand gehüllte Körper ist auf einfache geometrische Formen reduziert. Bemerkenswert ist die umfangreiche hieroglyphische Inschrift auf Vorderseite, Rückenpfeiler und Sockel – einer der wichtigsten biographischen Texte des Alten Ägypten, der Bakenchons' Lebensweg vom Schüler bis zum Hohepriester des Amun in Karnak schildert." },
    en:{ title:"Block statue of Bakenkhons, High Priest of Amun", epoche:"19th Dynasty", room:"Art and Form",
      fact:"Block statue of Bakenkhons (inv. Gl. WAF 38), High Priest of Amun. The crouching body, wrapped in a tight garment, is reduced to simple geometric forms. Remarkable is the extensive hieroglyphic inscription on the front, the back pillar and the base — one of the most important biographical texts of ancient Egypt, tracing Bakenkhons' path from pupil to High Priest of Amun at Karnak." } },

  { id:"OBJ-03", img:"OBJ-03@hi.jpg", plan:{x:30,y:84},
    de:{ title:"Gesichtsfragment einer Kolossalstatue des Königs Amenophis IV.", epoche:"18. Dynastie", room:"Kunst und Zeit",
      fact:"Gesichtsfragment einer Kolossalstatue des Königs Amenophis IV. / Echnaton (Inv. ÄS 6290). Es gehörte zu einer überlebensgroßen Statue aus dem frühen Aton-Tempel (Gem-pa-Aton) in Karnak. Die schmalen Züge, vollen Lippen und das vorspringende Kinn sind typisch für den Bildstil seiner ersten Regierungsjahre, in denen er eine tiefgreifende religiöse Umwälzung einleitete." },
    en:{ title:"Face fragment of a colossal statue of King Amenhotep IV", epoche:"18th Dynasty", room:"Art and Time",
      fact:"Face fragment of a colossal statue of King Amenhotep IV / Akhenaten (inv. ÄS 6290). It belonged to an over-lifesize statue from the early Aten temple (Gem-pa-Aten) at Karnak. The narrow features, full lips and projecting chin are typical of the style of his first regnal years, in which he set a profound religious upheaval in motion." } },

  { id:"OBJ-01", img:"OBJ-01@hi.jpg", plan:{x:70,y:86},
    de:{ title:"Fayencefigur eines liegenden Nilpferds", epoche:"Mittleres Reich", room:"Kunsthandwerk",
      fact:"Fayencefigur eines liegenden Nilpferds (Inv. ÄS 6040). Solche kunstvoll verzierten Tierfiguren wurden als Grabbeigaben verwendet und sollten die Verstorbenen auf ihrem Weg ins Jenseits begleiten und schützen. Der Körper ist mit Lotosbändern und -blüten dekoriert, die auf den natürlichen Lebensraum des Tieres verweisen." },
    en:{ title:"Faience figure of a reclining hippopotamus", epoche:"Middle Kingdom", room:"Decorative Arts",
      fact:"Faience figure of a reclining hippopotamus (inv. ÄS 6040). Such richly decorated animal figures were placed in tombs and were meant to accompany and protect the dead on the way into the afterlife. The body is decorated with lotus stems and blossoms, a reference to the animal's natural habitat." } },
];
const loc = (o) => o[LANG];
const obj = (id) => OBJECTS.find(o => o.id === id);

const GALERIE = {
  "OBJ-14":["OBJ-14_1.jpg","OBJ-14_2.jpg"],
  "OBJ-15":["OBJ-15_1.jpg"],
  "OBJ-07":["OBJ-07_1.jpg","OBJ-07_2.jpg","OBJ-07_3.jpg","OBJ-07_4.jpg"],
  "OBJ-06":["OBJ-06_1.jpg","OBJ-06_2.jpg","OBJ-06_3.jpg","OBJ-06_4.jpg"],
  "OBJ-03":["OBJ-03_1.jpg","OBJ-03_2.jpg","OBJ-03_3.jpg"],
  "OBJ-01":["OBJ-01_1.jpg","OBJ-01_2.jpg","OBJ-01_3.jpg","OBJ-01_4.jpg"],
};

/* Alle 22 Objekte zweisprachig — sonst stehen in den Empfehlungen deutsche
   Titel mitten in der englischen Fassung. */
const TITLES = {
  "OBJ-01":{de:"Fayencefigur eines liegenden Nilpferds", en:"Faience figure of a reclining hippopotamus"},
  "OBJ-02":{de:"Doppelstatue des stehenden Königs Niuserre", en:"Double statue of the standing king Niuserre"},
  "OBJ-03":{de:"Gesichtsfragment einer Kolossalstatue des Königs Amenophis IV.", en:"Face fragment of a colossal statue of King Amenhotep IV"},
  "OBJ-04":{de:"Statue eines falkenköpfigen Gottes", en:"Statue of a falcon-headed god"},
  "OBJ-05":{de:"Relief eines geflügelten Genius aus Nimrud", en:"Relief of a winged genius from Nimrud"},
  "OBJ-06":{de:"Würfelstatue des Bakenchons, Hohepriester des Amun", en:"Block statue of Bakenkhons, High Priest of Amun"},
  "OBJ-07":{de:"Sitzgruppe des Sabu, seiner Frau Meretites und des Sohnes Isebwer", en:"Seated group of Sabu, his wife Meretites and their son Isebwer"},
  "OBJ-08":{de:"Standstatuette eines hohen Beamten", en:"Standing statuette of a high official"},
  "OBJ-09":{de:"Kniestatue mit Sistrum des Senenmut", en:"Kneeling statue of Senenmut with a sistrum"},
  "OBJ-10":{de:"Statue des Antinoos", en:"Statue of Antinous"},
  "OBJ-11":{de:"Obelisk des Titus Sextius Africanus", en:"Obelisk of Titus Sextius Africanus"},
  "OBJ-12":{de:"Oberteil einer Sitzstatue des Königs Ramses II.", en:"Upper part of a seated statue of King Ramesses II"},
  "OBJ-13":{de:"Scheintür der Chnumit, Gottesdienerin der Hathor", en:"False door of Khnumit, servant of the goddess Hathor"},
  "OBJ-14":{de:"Oberteil des Sarges der Königstochter Satdjehuti", en:"Upper part of the coffin of the king's daughter Satdjehuti"},
  "OBJ-15":{de:"Totenbuch des Pajuheru", en:"Book of the Dead of Pajuheru"},
  "OBJ-16":{de:"Statue eines Falkengottes (Silber)", en:"Statue of a falcon god (silver)"},
  "OBJ-17":{de:"Statue der Göttin Isis lactans mit Horuskind", en:"Statue of the goddess Isis lactans with the child Horus"},
  "OBJ-18":{de:"Stele des Upuautaa, Vorsteher der Priester", en:"Stela of Wepwawetaa, overseer of the priests"},
  "OBJ-19":{de:"Schildring mit Widderkopf des Gottes Amun", en:"Shield ring with the ram's head of the god Amun"},
  "OBJ-20":{de:"Glasbecher mit dem Thronnamen Thutmosis III.", en:"Glass beaker with the throne name of Thutmose III"},
  "OBJ-21":{de:"Bronzestatuette eines Krokodils", en:"Bronze statuette of a crocodile"},
  "OBJ-22":{de:"Stele der Königin Amanishakheto", en:"Stela of Queen Amanishakheto"},
};
const ROOM_EN = {
  "Jenseits":"Afterlife", "Kunst und Form":"Art and Form", "Kunst und Zeit":"Art and Time",
  "Kunsthandwerk":"Decorative Arts", "Alter Orient":"Ancient Near East", "Obelisk":"Obelisk",
  "Pharao":"Pharaoh", "Religion":"Religion", "Nach den Pharaonen":"After the Pharaohs",
  "Schrift und Text":"Writing and Text", "Nubien und Sudan":"Nubia and Sudan",
};

const titleOf = (id, fallback) => (TITLES[id] && TITLES[id][LANG]) || fallback || id;
const roomOf = (raw) => {
  const g = String(raw || "").replace(/^Raum\s*"/, "").replace(/"$/, "").trim();
  return LANG === "de" ? g : (ROOM_EN[g] || g);
};

/* Die Fragen des Museums zu den Objekten des Rundgangs (Airtable:
   reflection_prompt). Sie führen den Aufnahme-Schirm. */
const FRAGEN = {
  "OBJ-14":{de:"Wie möchtest du aussehen, wenn man sich für immer an dein Gesicht erinnert?",
            en:"How would you want to look, if your face were remembered forever?"},
  "OBJ-15":{de:"Was von deinem Leben würdest du in die Waagschale legen wollen?",
            en:"What part of your life would you want to put on the scales?"},
  "OBJ-07":{de:"Mit wem würdest du für die Ewigkeit zusammen abgebildet sein wollen?",
            en:"Who would you want to be portrayed with, for eternity?"},
  "OBJ-06":{de:"Wenn du deinen Lebensweg in wenige Sätze fassen müsstest – was bliebe stehen?",
            en:"If you had to put your life into a few sentences — what would remain?"},
  "OBJ-03":{de:"Was erkennst du in einem Gesicht, von dem nur ein Bruchteil erhalten ist?",
            en:"What do you recognise in a face when only a fragment of it survives?"},
  "OBJ-01":{de:"Welches Tier würdest du mit auf eine lange Reise nehmen – und warum?",
            en:"Which animal would you take with you on a long journey — and why?"},
};
const frageOf = (id) => (FRAGEN[id] && FRAGEN[id][LANG]) || t().einladung;

/* Wie oft andere Besucher hier stehen geblieben sind. Erfundene, aber stabile
   Zahlen — es gibt keine Datenbank und keine fremden Besuche. */
const likesOf = (id) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return 40 + (h % 260);
};
/* Gemerkte Objekte ueberleben ein Neuladen, aber nur innerhalb der Sitzung:
   sessionStorage endet mit dem Tab, und ein neuer Besuch loescht ihn ohnehin.
   Nichts davon verlaesst das Geraet. */
const LIKE_KEY = "mw-likes";
const myLikes = (function () {
  try { return JSON.parse(sessionStorage.getItem(LIKE_KEY) || "{}"); } catch (e) { return {}; }
})();
function saveLikes() {
  try { sessionStorage.setItem(LIKE_KEY, JSON.stringify(myLikes)); } catch (e) {}
}
function clearLikes() {
  Object.keys(myLikes).forEach(function (k) { delete myLikes[k]; });
  try { sessionStorage.removeItem(LIKE_KEY); } catch (e) {}
}
const likeBtn = (id, onChange) => {
  const mine = !!myLikes[id];
  const b = el(`<button class="likebtn ${mine ? "on" : ""}" aria-label="${esc(t().likeLabel)}">
    ${mine ? SVG.heartOn : SVG.heart}<span>${likesOf(id) + (mine ? 1 : 0)}</span></button>`);
  b.onclick = (e) => { e.stopPropagation(); myLikes[id] = !mine; saveLikes(); onChange(); };
  return b;
};

const ROUTE_ROOMS = [
  { de:"Jenseits",       en:"Afterlife",       spots:[
      {id:"OBJ-14",x:30,y:26,side:"left", nr:3},{id:"OBJ-15",x:70,y:66,side:"right",nr:7}] },
  { de:"Kunst und Form", en:"Art and Form",    spots:[
      {id:"OBJ-07",x:30,y:28,side:"left", nr:1},{id:"OBJ-06",x:70,y:64,side:"right",nr:4}] },
  { de:"Kunst und Zeit", en:"Art and Time",    spots:[
      {id:"OBJ-03",x:30,y:42,side:"left", nr:2}] },
  { de:"Kunsthandwerk",  en:"Decorative Arts", spots:[
      {id:"OBJ-01",x:70,y:44,side:"right",nr:9}] },
];
const ROOMS = [
  { de:"Jenseits",       en:"Afterlife",       x:10, y:6,  w:78, h:26 },
  { de:"Kunst und Form", en:"Art and Form",    x:10, y:38, w:78, h:26 },
  { de:"Kunst und Zeit", en:"Art and Time",    x:10, y:70, w:38, h:24 },
  { de:"Kunsthandwerk",  en:"Decorative Arts", x:52, y:70, w:36, h:24 },
];

const SVG = {
  mic:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/></svg>',
  stop:'<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>',
  check:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l6 6L20 6"/></svg>',
  arrow:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  left:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  right:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  play:'<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>',
  heart:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 20s-7-4.4-7-9.3A4.1 4.1 0 0 1 12 7.8a4.1 4.1 0 0 1 7 2.9C19 15.6 12 20 12 20z"/></svg>',
  heartOn:'<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20s-7-4.4-7-9.3A4.1 4.1 0 0 1 12 7.8a4.1 4.1 0 0 1 7 2.9C19 15.6 12 20 12 20z"/></svg>',
  spark:'<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 5.6L19.5 9l-5.6 1.4L12 16l-1.9-5.6L4.5 9l5.6-1.4z"/></svg>',
  heading:'<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l7 17-7-4-7 4z"/></svg>',
  shield:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5.5c0 4.3-2.9 7.7-7 8.5-4.1-.8-7-4.2-7-8.5V6z"/><path d="M9 12l2.2 2.2L15.5 10"/></svg>',
  redo:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
};

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let activeRec = null;

/* Auf dem iPhone scheitert die Spracherkennung still: ohne eingeschaltetes
   Diktat, ohne Mikrofonrecht oder in einem In-App-Browser kommt nur ein
   Fehlercode. Der muss sichtbar werden, sonst wirkt die App kaputt. */
const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

function makeRecorder({ onInterim, onFinal, onState }) {
  return {
    toggle(objId) {
      if (activeRec) { try { activeRec.stop(); } catch (e) {} activeRec = null; onState("idle"); return; }
      if (!SR) { onState("failed", "nosupport"); return; }

      const rec = new SR();
      rec.lang = t().speech;
      rec.interimResults = !IS_IOS;   // auf iOS kommen Zwischenergebnisse nicht zuverlaessig
      rec.continuous = false;
      let finalText = "", started = false, failed = null;
      const t0 = Date.now();

      rec.onstart = () => { started = true; };
      rec.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const s = e.results[i][0].transcript;
          if (e.results[i].isFinal) finalText += s; else interim += s;
        }
        onInterim((finalText + " " + interim).trim());
      };
      rec.onerror = (e) => { failed = (e && e.error) || "unknown"; };
      rec.onend = () => {
        activeRec = null;
        if (finalText.trim()) { onState("idle"); onFinal(objId, finalText.trim(),
          Math.max(1, Math.round((Date.now() - t0) / 1000))); return; }
        if (failed) { onState("failed", failed); return; }
        onState("failed", started ? "no-speech" : "nostart");
      };

      activeRec = rec; onState("rec"); onInterim("");
      try { rec.start(); } catch (e) { activeRec = null; onState("failed", "nostart"); return; }
      // Meldet sich die Erkennung gar nicht, haengt der Schirm sonst auf „hoere zu"
      setTimeout(() => {
        if (activeRec === rec && !started) { try { rec.stop(); } catch (e) {} }
      }, 2500);
    }
  };
}

/* Klartext statt Fehlercode — mit dem Hinweis, der auf dem iPhone hilft */
function speechProblem(code) {
  const T = t();
  const m = T.speechErr[code] || T.speechErr.unknown;
  return { text: m, code: code };
}

const el = (html) => { const tpl = document.createElement("template"); tpl.innerHTML = html.trim(); return tpl.content.firstElementChild; };
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));

/* ==========================================================================
   WRAPPED — Stories. Tippen blättert, kein Timer.
   ========================================================================== */
const FALLBACK = () => ({
  greeting: LANG === "de" ? "Dein Besuch hatte einen roten Faden – und er gehörte dir."
                          : "Your visit had a thread running through it — and it was yours.",
  archetype: LANG === "de"
    ? { name: "Wanderin am Nil", subtitle: t().offline }
    : { name: "Wanderer of the Nile", subtitle: t().offline },
  stats: {}, themes: [], your_words: [],
  reflective_question: LANG === "de" ? "Was nimmst du mit?" : "What do you take with you?",
  go_deeper: null,
  closing: LANG === "de"
    ? "Das war dein Besuch, in deinen Worten. Gespeichert wurde nur der Text — die Sitzung endet mit deinem Besuch."
    : "That was your visit, in your own words. Only the text was kept — the session ends with your visit.",
});

/* Beispieltexte: echte Antworten des Servers, einmal geholt und mitgeliefert.
   Damit kostet das Durchsehen der Entwürfe keine Credits. */
const SAMPLE = { de: null, en: null };
let liveMode = false;            // Standard: Beispieltext, kein Netzaufruf
let wrappedStyle = "story";

["de", "en"].forEach(k => {
  fetch(`data/sample-${k}.json`).then(r => r.json()).then(j => {
    SAMPLE[k] = j;
    if (window.__wrapReady) window.__wrapReady();
  }).catch(() => {});
});
const sample = () => SAMPLE[LANG] || FALLBACK();

const restartBtn = (onRestart, layer) => {
  if (!onRestart) return null;
  const b = el(`<button class="linkish">${SVG.redo} ${esc(t().restart)}</button>`);
  b.onclick = () => { layer.remove(); onRestart(); };
  return b;
};

/* In der App leben Story und Faden nebeneinander: die eine zum Zeigen,
   die andere zum Behalten. Auf der Auswahlseite bleibt das aus. */
let wrappedPeer = false;
let introEnabled = false;   // nur die App zeigt den Willkommen-Schirm
const peerBtn = (layer, w, onRestart, to) => {
  if (!wrappedPeer) return null;
  const b = el(`<button class="linkish">${esc(t()[to === "faden" ? "toThread" : "toStory"])}</button>`);
  b.onclick = () => showWrapped(layer, w, onRestart, to);
  return b;
};
const statsOf = (w) => {
  const st = w.stats || {};
  const T = t();
  return [[st.reflections, T.statReflections], [st.objects_saved, T.statObjects], [st.duration_min, T.statMinutes]];
};

/* ---------- W1 · Story: ein Kader nach dem anderen, Tippen blättert ---------- */
function renderStory(layer, w, onRestart) {
  const T = t(), words = (Array.isArray(w.your_words) ? w.your_words : []).slice(0, 3);
  const st = w.stats || {}, frames = [];

  frames.push(() => `<div class="eyebrow">${esc(T.wIntro)}</div>
    <div class="wbig">${esc(w.greeting)}</div>`);
  if (w.archetype && w.archetype.name) frames.push(() => `<div class="eyebrow">${esc(T.wIntro)}</div>
    <div class="wbig wgold">${esc(w.archetype.name)}</div>
    <div class="wsub">${esc(w.archetype.subtitle)}</div>`);
  frames.push(() => `<div class="eyebrow">${esc(T.wStatsHead)}</div>
    <div class="wstats">${statsOf(w).map(([v, l]) =>
      `<div class="wstat"><b>${esc(v ?? "—")}</b><span class="wsub">${esc(l)}</span></div>`).join("")}</div>`);
  words.forEach(m => {
    const o = obj(m.object_id);
    frames.push(() => `
      ${o ? `<div class="wshot"><img src="${IMG}${o.img}" alt="${esc(loc(o).title)}" /></div>
      <div class="credit">${esc(creditOf(m.object_id))}</div>` : ""}
      <div class="eyebrow">${esc(T.wWordsHead)}</div>
      <div class="wquote">„${esc(m.quote)}“</div>
      ${m.echo ? `<div class="wecho">${esc(m.echo)}</div>` : ""}
      <div class="wsub" style="font-size:11.5px">${esc(o ? loc(o).title : m.object_title)}</div>`);
  });
  if (w.reflective_question) frames.push(() => `<div class="eyebrow">${esc(T.wQuestion)}</div>
    <div class="wmid"><span class="wgold">„</span>${esc(w.reflective_question)}<span class="wgold">“</span></div>`);

  const recs = Array.isArray(w.recommendations) && w.recommendations.length
    ? w.recommendations : (w.go_deeper ? [w.go_deeper] : []);
  if (recs.length) frames.push(() => `<div class="eyebrow">${esc(T.recsHead)}</div>
    <div class="reclist">${recs.map(r => `
      <div class="rec">
        <div class="kthumb"><img src="${IMG}${r.object_id}.jpg" alt="" /></div>
        <div><div class="rectitle">${esc(titleOf(r.object_id, r.title))}</div>
        <div class="recwhy">${esc(r.reason)}</div></div>
      </div>`).join("")}</div>`);
  if (w.missed && w.missed.title) frames.push(() => `<div class="eyebrow">${esc(T.missedHead)}</div>
    <div class="wshot"><img src="${IMG}${w.missed.object_id}.jpg" alt="" /></div>
    <div class="wmid">${esc(titleOf(w.missed.object_id, w.missed.title))}</div>
    <div class="wsub">${esc(w.missed.reason)}</div>`);
  frames.push(() => {
    const nb = nachbarnFuer(w);
    return `<div class="eyebrow">${esc(T.nachbarnHead)}</div>
      ${nb.bruecke ? `<div class="nbbruecke">${esc(nb.bruecke)}</div>` : ""}
      <div class="nblist">${nb.haeuser.map(m => `
        <div class="nb"><div class="nbname">${esc(m.name)}</div>
        <div class="nbtext">${esc(m.text)}</div></div>`).join("")}</div>
      <div class="nbfoot">${esc(T.nachbarnFoot)}</div>`;
  });

  frames.push(() => `<div class="wmid">${esc(w.closing)}</div>
    <div class="wnote">SMÄK · Museum Wrapped</div>`);

  let i = 0;
  (function paint() {
    layer.innerHTML = "";
    layer.append(aiBanner(layer.dataset.demo === "1"));
    layer.append(el(`<div class="wbars">${frames.map((_, k) => `<i class="${k <= i ? "on" : ""}"></i>`).join("")}</div>`));
    layer.append(el(`<div class="wframe">${frames[i]()}</div>`));
    const foot = el(`<div class="wfoot"></div>`);
    if (i === frames.length - 1) {
      if (onRestart) {
        const keep = el(`<button class="btn gold" style="flex:0 0 auto;padding:0 18px;min-height:44px">${esc(T.keep)}</button>`);
        keep.onclick = () => keepSheet(layer, w);
        foot.append(keep);
      }
      const p = peerBtn(layer, w, onRestart, "faden"); if (p) foot.append(p);
      const r = restartBtn(onRestart, layer); if (r) foot.append(r);
    } else if (onRestart) {
      foot.append(el(`<div class="taphint">${esc(T.tapHint)} ${SVG.right}</div>`));
    }
    layer.append(foot);
    const back = el(`<button class="wtap l"></button>`), fwd = el(`<button class="wtap r"></button>`);
    back.onclick = () => { if (i > 0) { i--; paint(); } };
    fwd.onclick = () => { if (i < frames.length - 1) { i++; paint(); } };
    layer.append(back, fwd);
  })();
}

/* ---------- W2 · Blatt: alles auf einer gedruckten Seite ---------- */
function renderBlatt(layer, w, onRestart) {
  const T = t(), words = (Array.isArray(w.your_words) ? w.your_words : []).slice(0, 4);
  const b = el(`<div class="blatt"></div>`);
  b.append(el(`<div class="blabel">SMÄK · Museum Wrapped</div>`));
  b.append(el(`<h1 class="bhead">${esc(w.greeting)}</h1>`));
  b.append(el(`<div class="brule gold"></div>`));
  if (w.archetype && w.archetype.name) b.append(el(`<div>
    <div class="barch">${esc(w.archetype.name)}</div>
    <div class="bsub" style="margin-top:6px">${esc(w.archetype.subtitle)}</div></div>`));
  b.append(el(`<div class="bnums">${statsOf(w).map(([v, l]) =>
    `<div><b>${esc(v ?? "—")}</b><span>${esc(l)}</span></div>`).join("")}</div>`));
  b.append(el(`<div class="brule"></div>`));
  b.append(el(`<div class="blabel">${esc(T.wWordsHead)}</div>`));
  words.forEach(m => {
    const o = obj(m.object_id);
    b.append(el(`<div class="bitem">
      <div class="bq">„${esc(m.quote)}“</div>
      ${m.echo ? `<div class="becho">${esc(m.echo)}</div>` : ""}
      <div class="bmeta">${esc(o ? loc(o).title : m.object_title)}</div></div>`));
  });
  b.append(el(`<div class="brule"></div>`));
  b.append(el(`<div class="blabel">${esc(T.wQuestion)}</div>`));
  b.append(el(`<div class="bq big">${esc(w.reflective_question)}</div>`));
  if (w.go_deeper && w.go_deeper.title) {
    b.append(el(`<div class="brule"></div>`));
    b.append(el(`<div class="blabel">${esc(T.wDeeper)}</div>`));
    b.append(el(`<div><div class="barch" style="font-size:19px">${esc(titleOf(w.go_deeper.object_id, w.go_deeper.title))}</div>
      <div class="bsub" style="margin-top:6px">${esc(w.go_deeper.reason)}</div></div>`));
  }
  b.append(el(`<div class="brule"></div>`));
  b.append(el(`<div class="bfoot">${esc(w.closing)}</div>`));
  const r = restartBtn(onRestart, layer); if (r) b.append(r);
  layer.append(b);
}

/* ---------- W3 · Karte: ein Bildschirm zum Behalten, ohne Scrollen ---------- */
function renderKarte(layer, w, onRestart) {
  const T = t(), first = (Array.isArray(w.your_words) ? w.your_words : [])[0];
  const k = el(`<div class="karte"><div class="kcard2"><div class="kglow"></div></div></div>`);
  const c = k.querySelector(".kcard2");
  c.append(el(`<div class="ktop"><span>SMÄK · München</span><span>Museum Wrapped</span></div>`));
  if (w.archetype && w.archetype.name) {
    c.append(el(`<div class="karch">${esc(w.archetype.name)}</div>`));
    c.append(el(`<div class="ksub2">${esc(w.archetype.subtitle)}</div>`));
  }
  if (first) c.append(el(`<div class="khero">„${esc(String(first.quote).slice(0, 130))}“</div>`));
  c.append(el(`<div class="knums">${statsOf(w).map(([v, l]) =>
    `<div><b>${esc(v ?? "—")}</b><span>${esc(l)}</span></div>`).join("")}</div>`));
  c.append(el(`<div class="kq2">${esc(w.reflective_question)}</div>`));
  c.append(el(`<div class="kfoot2">${esc(T.keepsake)}</div>`));
  const r = restartBtn(onRestart, layer);
  if (r) { const wrap = el(`<div style="padding-top:10px;text-align:center"></div>`); wrap.append(r); k.append(wrap); }
  layer.append(k);
}

/* ---------- W4 · Faden: der Besuch als Zeitstrahl ---------- */
function renderFaden(layer, w, onRestart) {
  const T = t(), words = Array.isArray(w.your_words) ? w.your_words : [];
  const f = el(`<div class="faden"></div>`);
  f.append(el(`<div class="fhead">
    <div class="eyebrow">${esc(T.threadHead)}</div>
    <div class="h">${esc(w.greeting)}</div>
    ${w.archetype && w.archetype.name ? `<div class="a">${esc(w.archetype.name)}</div>` : ""}</div>`));
  const th = el(`<div class="thread"></div>`);
  words.forEach(m => {
    const o = obj(m.object_id), d = o ? loc(o) : null;
    th.append(el(`<div class="node">
      <div class="nt">${o ? `<div class="kthumb"><img src="${IMG}${o.img}" alt="" /></div>` : ""}
        <div class="nm">${esc(d ? d.room : "")}<br/>${esc(d ? d.title : m.object_title)}</div></div>
      <div class="nq">„${esc(m.quote)}“</div>
      ${m.echo ? `<div class="ne">${esc(m.echo)}</div>` : ""}</div>`));
  });
  f.append(th);
  const end = el(`<div class="fend"></div>`);
  end.append(el(`<div class="fpanel"><div class="blabel">${esc(T.wQuestion)}</div>
    <div class="fq" style="margin-top:7px">${esc(w.reflective_question)}</div></div>`));

  const recs = Array.isArray(w.recommendations) && w.recommendations.length
    ? w.recommendations : (w.go_deeper ? [w.go_deeper] : []);
  if (recs.length) end.append(el(`<div class="fpanel">
    <div class="blabel">${esc(T.recsHead)}</div>
    <div class="reclist" style="margin-top:9px">${recs.map(r => `
      <div class="rec">
        <div class="kthumb"><img src="${IMG}${r.object_id}.jpg" alt="" /></div>
        <div><div class="rectitle">${esc(titleOf(r.object_id, r.title))}</div>
        <div class="recwhy">${esc(r.reason)}</div></div>
      </div>`).join("")}</div></div>`));
  const nb = nachbarnFuer(w);
  end.append(el(`<div class="fpanel">
    <div class="blabel">${esc(T.nachbarnHead)}</div>
    ${nb.bruecke ? `<div class="nbbruecke">${esc(nb.bruecke)}</div>` : ""}
    <div class="nblist">${nb.haeuser.map(m => `
      <div class="nb"><div class="nbname">${esc(m.name)}</div>
      <div class="nbtext">${esc(m.text)}</div></div>`).join("")}</div>
    <div class="nbfoot">${esc(T.nachbarnFoot)}
      <a href="${KUNSTAREAL_URL}" target="_blank" rel="noopener noreferrer">kunstareal.de</a></div></div>`));

  if (w.missed && w.missed.title) end.append(el(`<div class="missed">
    <div class="blabel">${esc(T.missedHead)}</div>
    <div class="rec" style="margin-top:9px">
      <div class="kthumb"><img src="${IMG}${w.missed.object_id}.jpg" alt="" /></div>
      <div><div class="rectitle">${esc(titleOf(w.missed.object_id, w.missed.title))}</div>
      <div class="recwhy">${esc(w.missed.reason)}</div></div>
    </div></div>`));
  end.append(el(`<div class="bfoot">${esc(w.closing)}</div>`));
  end.append(el(`<div class="rights">${esc(T.rights)}</div>`));
  end.append(el(legalRow()));
  f.append(end);
  layer.append(f);

  if (onRestart) {
    const bar = el(`<div class="fbottom"></div>`);
    const keep = el(`<button class="btn gold" style="min-height:48px">${esc(T.keep)}</button>`);
    keep.onclick = () => keepSheet(layer, w);
    const p = peerBtn(layer, w, onRestart, "story");
    bar.append(keep);
    if (p) { p.className = "btn"; p.style.minHeight = "48px"; bar.append(p); }
    layer.append(bar);
    const r = restartBtn(onRestart, layer);
    if (r) end.append(r);
  }
}

/* Der Besuch zum Mitnehmen. Es gibt keinen Server, der ihn aufhebt — also
   geht der Text mit, nicht ein Link darauf. */
function wrappedAsText(w) {
  const T = t(), L = [];
  L.push("MUSEUM WRAPPED · SMÄK München", "");
  if (w.greeting) L.push(w.greeting, "");
  if (w.archetype && w.archetype.name) L.push(w.archetype.name + (w.archetype.subtitle ? " — " + w.archetype.subtitle : ""), "");
  const words = Array.isArray(w.your_words) ? w.your_words : [];
  if (words.length) {
    L.push(T.wWordsHead.toUpperCase(), "");
    words.forEach(m => {
      L.push("„" + m.quote + "“");
      if (m.echo) L.push(m.echo);
      L.push("— " + titleOf(m.object_id, m.object_title), "");
    });
  }
  if (w.reflective_question) L.push(T.wQuestion.toUpperCase(), w.reflective_question, "");
  const recs = Array.isArray(w.recommendations) ? w.recommendations : [];
  if (recs.length) {
    L.push(T.recsHead.toUpperCase());
    recs.forEach(r => L.push("· " + titleOf(r.object_id, r.title) + " — " + r.reason));
    L.push("");
  }
  if (w.missed) L.push(T.missedHead.toUpperCase(), "· " + titleOf(w.missed.object_id, w.missed.title), "");
  const nb = nachbarnFuer(w);
  if (nb.haeuser.length) {
    L.push(T.nachbarnHead.toUpperCase());
    if (nb.bruecke) L.push(nb.bruecke);
    nb.haeuser.forEach(m => L.push("· " + m.name + " — " + m.text));
    L.push("");
  }
  if (w.closing) L.push(w.closing);
  L.push("", RIGHTS);
  return L.join(String.fromCharCode(10));
}

function keepSheet(host, w) {
  const T = t(), text = wrappedAsText(w);
  const sheet = el(`<div class="sheet open"><div class="sheetbody"><div class="grab"></div></div></div>`);
  sheet.onclick = (e) => { if (e.target === sheet) sheet.remove(); };
  const sb = sheet.querySelector(".sheetbody");
  sb.append(el(`<div class="vtitle" style="margin:0;font-size:22px">${esc(T.keepTitle)}</div>`));
  sb.append(el(`<div class="sethint" style="margin:0">${esc(T.keepNote)}</div>`));
  sb.append(el(`<div class="rights">${esc(T.rights)}</div>`));

  const say = (msg) => { const n = sb.querySelector(".keepmsg"); if (n) n.textContent = msg; };

  if (navigator.share) {
    const b = el(`<button class="btn gold" style="min-height:52px">${esc(T.keepShare)}</button>`);
    b.onclick = () => navigator.share({ title: "Museum Wrapped", text }).catch(() => {});
    sb.append(b);
  }
  const mail = el(`<button class="btn" style="min-height:50px">${esc(T.keepMail)}</button>`);
  mail.onclick = () => {
    location.href = "mailto:?subject=" + encodeURIComponent("Museum Wrapped · SMÄK")
      + "&body=" + encodeURIComponent(text);
  };
  sb.append(mail);

  const copy = el(`<button class="btn" style="min-height:50px">${esc(T.keepCopy)}</button>`);
  copy.onclick = () => {
    const done = () => say(T.keepCopied);
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done);
    else done();
  };
  sb.append(copy, el(`<div class="keepmsg sethint" style="margin:0;text-align:center;min-height:18px"></div>`));

  const close = el(`<button class="linkish" style="align-self:center">${esc(T.close)}</button>`);
  close.onclick = () => sheet.remove();
  sb.append(close);
  host.append(sheet);
}

const WSTYLES = [
  { key:"story", fn:renderStory }, { key:"blatt", fn:renderBlatt },
  { key:"karte", fn:renderKarte }, { key:"faden", fn:renderFaden },
];
/* AI Act Art. 50: der Hinweis steht ueber dem erzeugten Inhalt, nicht im Fuss,
   und bleibt in jedem Kader sichtbar. Die Beispiel-Marke sitzt in derselben
   Zeile, damit sie den Text nicht verdeckt. */
function aiBanner(demo) {
  const T = t();
  return el(`<div class="aibanner">${SVG.spark}
    <span>${esc(T.aiBanner)}</span>
    ${demo ? `<span class="demotag">${esc(T.demoBadge)}</span>` : ""}</div>`);
}

function showWrapped(layer, w, onRestart, style) {
  layer.innerHTML = "";
  // Erst die Marke setzen: die Story zeichnet ihre Kader sofort und liest sie ab.
  layer.dataset.demo = (!liveMode && onRestart) ? "1" : "";
  layer.append(aiBanner(layer.dataset.demo === "1"));
  (WSTYLES.find(s => s.key === (style || wrappedStyle)) || WSTYLES[0]).fn(layer, w, onRestart);
}

function showLoading(layer, autoMs, then) {
  const T = t();
  layer.innerHTML = "";
  let li = 0;
  const load = el(`<div class="wload">
    <div class="wloadring"></div>
    <div class="wloadtext">${esc(T.loading[0])}</div>
    <div class="wloadsub">${esc(T.loadSub)}</div>
    <div class="wdots"><i class="on"></i><i></i><i></i></div>
    <div class="wprivacy">${esc(liveMode ? T.loadNote : T.demoNote)}</div></div>`);
  layer.append(load);
  const cycle = setInterval(() => {
    li = (li + 1) % T.loading.length;
    const n = load.querySelector(".wloadtext");
    if (n) { n.style.animation = "none"; n.textContent = T.loading[li]; void n.offsetHeight; n.style.animation = "fadein .5s ease"; }
    load.querySelectorAll(".wdots i").forEach((d, k) => d.classList.toggle("on", k <= li));
  }, 3400);
  let done = false;
  const stop = () => { if (!done) { done = true; clearInterval(cycle); } };
  if (autoMs) setTimeout(() => { stop(); if (then) then(); }, autoMs);
  return stop;
}

function startWrapped(host, answers, startedAt, onRestart) {
  const layer = el(`<div class="wrap"></div>`);
  host.append(layer);

  const count = Object.keys(answers).length;
  if (!liveMode || !count) {              // Beispieltext: kein Netz, keine Credits
    showLoading(layer, 1500, () => showWrapped(layer, sample(), onRestart));
    return;
  }
  const payload = {
    session: "S-" + Date.now(),
    duration_min: Math.max(1, Math.round((Date.now() - startedAt) / 60000)),
    mode: "solo",
    lang: LANG,
    reactions: Object.keys(answers).map(id => ({
      object_id: id, input_type: "text", transcript_text: answers[id],
      reaction_emoji: null, timestamp: new Date().toISOString(),
    })),
  };
  const stop = showLoading(layer, 0);
  const t0 = Date.now();
  window.__lastCall = { state: "läuft", started: new Date().toLocaleTimeString(), reactions: payload.reactions.length, lang: LANG };
  fetch(WEBHOOK_URL, { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(payload) })
    .then(r => r.json())
    .then(j => {
      stop();
      const ok = !!(j && j.greeting);
      window.__lastCall = Object.assign(window.__lastCall, {
        state: ok ? "ok" : "Antwort ohne greeting → Beispiel",
        ms: Date.now() - t0, words: (j && j.your_words || []).length,
        recs: (j && j.recommendations || []).length, missed: !!(j && j.missed),
      });
      showWrapped(layer, ok ? j : FALLBACK(), onRestart);
    }, (err) => {
      stop();
      window.__lastCall = Object.assign(window.__lastCall, { state: "Fehler: " + err, ms: Date.now() - t0 });
      showWrapped(layer, FALLBACK(), onRestart);
    });
}

/* Gemeinsame Fusszeile mit dem Knopf, der zum Wrapped führt */
function finishBar(host, answers, startedAt, pad, onRestart, rerender) {
  const T = t(), n = Object.keys(answers).length;
  const bar = el(`<div style="padding:0 ${pad}px ${pad}px"><button class="finish">${esc(T.finish)} ${SVG.arrow}</button></div>`);
  bar.querySelector("button").onclick = () => {
    startWrapped(host, answers, startedAt, () => {
      Object.keys(answers).forEach(k => delete answers[k]);
      onRestart(); rerender();
    });
  };
  return bar;
}

/* ======================= A · VITRINE ======================= */
function Vitrine(root) {
  let idx = 0, answers = {}, mode = "idle", live = "", speechCode = null, startedAt = Date.now();
  const rec = makeRecorder({
    onInterim: s => { live = s; render(); },
    onFinal: (id, s) => { answers[id] = s; live = ""; render(); },
    onState: (s, code) => { mode = s; speechCode = code || null; render(); },
  });

  function render() {
    const T = t(), o = OBJECTS[idx], d = loc(o), saved = answers[o.id];
    root.innerHTML = "";
    root.append(el(`<div class="topbar">
      <div class="brand"><i>◆</i> SMÄK</div>
      <div class="count"><b>${Object.keys(answers).length}</b> / ${OBJECTS.length} ${esc(T.erzaehlt)}</div></div>`));
    root.append(el(`<div class="hair"></div>`));

    const body = el(`<div class="vitrine">
      <div class="case">
        <img src="${IMG}${o.img}" alt="${esc(d.title)}" />
        <div class="plaque"><span>${esc(d.room)}</span><span>${esc(d.epoche)}</span></div>
        <button class="nav l">${SVG.left}</button><button class="nav r">${SVG.right}</button>
      </div>
      <div class="eyebrow">${esc(T.objectOf(idx + 1, OBJECTS.length))}</div>
      <div class="vtitle">${esc(d.title)}</div>
      ${saved ? `<div class="saved">${SVG.check}<p>„${esc(saved)}“</p></div>`
              : `<div class="frage vfrage">${esc(frageOf(o.id))}</div>`}
      <div class="vfoot"></div><div class="dots"></div></div>`);

    const foot = body.querySelector(".vfoot");
    if (mode === "nospeech" || mode === "failed") {
      const ta = el(`<textarea class="typed" rows="3" placeholder="${esc(T.placeholder)}"></textarea>`);
      const ok = el(`<button class="linkish">${esc(T.save)}</button>`);
      ok.onclick = () => { if (ta.value.trim()) answers[o.id] = ta.value.trim(); mode = "idle"; render(); };
      foot.append(ta, ok); setTimeout(() => ta.focus(), 30);
    } else {
      foot.append(el(`<div class="live">${mode === "rec" ? esc(live || "…") : ""}</div>`));
      const mic = el(`<button class="mic ${mode === "rec" ? "rec" : (saved ? "done" : "")}">${mode === "rec" ? SVG.stop : SVG.mic}</button>`);
      mic.onclick = () => rec.toggle(o.id);
      foot.append(mic, el(`<div class="hint">${esc(mode === "rec" ? T.listenStop : (saved ? T.again : T.sayOne))}</div>`));
      if (mode !== "rec") {
        const alt = el(`<button class="linkish">${esc(T.typeInstead)}</button>`);
        alt.onclick = () => { mode = "nospeech"; render(); };
        foot.append(alt);
      }
    }
    const dots = body.querySelector(".dots");
    OBJECTS.forEach((oo, i) => {
      const b = el(`<button class="${i === idx ? "on" : ""} ${answers[oo.id] ? "has" : ""}"></button>`);
      b.onclick = () => { idx = i; live = ""; render(); };
      dots.append(b);
    });
    body.querySelector(".nav.l").onclick = () => { idx = (idx - 1 + OBJECTS.length) % OBJECTS.length; live = ""; render(); };
    body.querySelector(".nav.r").onclick = () => { idx = (idx + 1) % OBJECTS.length; live = ""; render(); };
    root.append(body);
    root.append(finishBar(root, answers, startedAt, 22, () => { idx = 0; startedAt = Date.now(); }, render));
  }
  render();
  return { relang: render };
}

/* ======================= B · KARTEI ======================= */
function Kartei(root) {
  let open = null, answers = {}, mode = "idle", live = "", speechCode = null, startedAt = Date.now();
  const rec = makeRecorder({
    onInterim: s => { live = s; render(); },
    onFinal: (id, s) => { answers[id] = s; live = ""; render(); },
    onState: (s, code) => { mode = s; speechCode = code || null; render(); },
  });

  function render() {
    const T = t();
    root.innerHTML = "";
    root.append(el(`<div class="topbar">
      <div class="brand"><i>◆</i> SMÄK</div>
      <div class="count"><b>${Object.keys(answers).length}</b> / ${OBJECTS.length} ${esc(T.erzaehlt)}</div></div>`));
    root.append(el(`<div class="hair"></div>`));

    const list = el(`<div class="kartei">
      <div class="khead">${T.routeHead}</div>
      <div class="ksub">${esc(T.routeSub)}</div></div>`);
    OBJECTS.forEach(o => {
      const d = loc(o), has = !!answers[o.id];
      const c = el(`<button class="kcard ${has ? "has" : ""}">
        <div class="kthumb"><img src="${IMG}${o.img}" alt="" /></div>
        <div class="kbody"><div class="eyebrow">${esc(d.room)}</div>
        <h3>${esc(d.title)}</h3>
        <div class="kstate">${has ? SVG.check + " " + esc(T.told) : esc(T.open)}</div></div></button>`);
      c.onclick = () => { open = o.id; live = ""; mode = "idle"; render(); };
      list.append(c);
    });
    root.append(list);

    const n = Object.keys(answers).length;
    const bar = el(`<div class="kbar"><button class="finish">${esc(T.finish)} ${SVG.arrow}</button></div>`);
    bar.querySelector("button").onclick = () => {
      startWrapped(root, answers, startedAt, () => {
        Object.keys(answers).forEach(k => delete answers[k]);
        open = null; startedAt = Date.now(); render();
      });
    };
    root.append(bar);

    const o = obj(open);
    const sheet = el(`<div class="sheet ${o ? "open" : ""}"><div class="sheetbody"><div class="grab"></div></div></div>`);
    sheet.onclick = (e) => { if (e.target === sheet) { open = null; render(); } };
    if (o) {
      const d = loc(o), sb = sheet.querySelector(".sheetbody"), saved = answers[o.id];
      sb.append(el(`<div class="sheethero">
        <div class="kthumb"><img src="${IMG}${o.img}" alt="" /></div>
        <div><div class="eyebrow">${esc(d.room)} · ${esc(d.epoche)}</div>
        <div class="vtitle" style="margin:4px 0 0;font-size:17px">${esc(d.title)}</div></div></div>`));
      sb.append(el(saved ? `<div class="saved">${SVG.check}<p>„${esc(saved)}“</p></div>`
                        : `<div class="frage sfrage">${esc(frageOf(o.id))}</div>`));
      if (mode === "nospeech" || mode === "failed") {
        const ta = el(`<textarea class="typed" rows="3" placeholder="${esc(T.placeholder)}"></textarea>`);
        const ok = el(`<button class="linkish">${esc(T.save)}</button>`);
        ok.onclick = () => { if (ta.value.trim()) answers[o.id] = ta.value.trim(); mode = "idle"; render(); };
        sb.append(ta, ok); setTimeout(() => ta.focus(), 30);
      } else {
        sb.append(el(`<div class="live">${mode === "rec" ? esc(live || "…") : ""}</div>`));
        const wrap = el(`<div style="display:flex;flex-direction:column;align-items:center;gap:8px"></div>`);
        const mic = el(`<button class="mic ${mode === "rec" ? "rec" : (saved ? "done" : "")}">${mode === "rec" ? SVG.stop : SVG.mic}</button>`);
        mic.onclick = () => rec.toggle(o.id);
        wrap.append(mic, el(`<div class="hint">${esc(mode === "rec" ? T.listening : T.sayOne)}</div>`));
        if (mode !== "rec") {
          const alt = el(`<button class="linkish">${esc(T.typeInstead)}</button>`);
          alt.onclick = () => { mode = "nospeech"; render(); };
          wrap.append(alt);
        }
        sb.append(wrap);
      }
      const close = el(`<button class="linkish" style="align-self:center">${esc(T.close)}</button>`);
      close.onclick = () => { open = null; render(); };
      sb.append(close);
    }
    root.append(sheet);
  }
  render();
  return { relang: render };
}

/* ======================= C · SAAL ======================= */
function Saal(root) {
  let sel = 0, answers = {}, mode = "idle", live = "", speechCode = null, startedAt = Date.now();
  const rec = makeRecorder({
    onInterim: s => { live = s; render(); },
    onFinal: (id, s) => { answers[id] = s; live = ""; render(); },
    onState: (s, code) => { mode = s; speechCode = code || null; render(); },
  });

  function render() {
    const T = t(), o = OBJECTS[sel], d = loc(o), saved = answers[o.id];
    root.innerHTML = "";
    root.append(el(`<div class="topbar">
      <div class="brand"><i>◆</i> SMÄK</div>
      <div class="count"><b>${Object.keys(answers).length}</b> / ${OBJECTS.length} ${esc(T.erzaehlt)}</div></div>`));
    root.append(el(`<div class="hair"></div>`));

    const body = el(`<div class="saal"><div class="plan"></div>
      <div class="planfoot">
        <div class="legend"><span><i style="background:var(--gold)"></i>${esc(T.legendTold)}</span><span><i style="border:1px solid oklch(0.70 0.10 75/.6)"></i>${esc(T.legendOpen)}</span></div>
        <div class="eyebrow">${esc(T.schematic)}</div>
      </div><div class="detail"></div></div>`);

    const plan = body.querySelector(".plan");
    ROOMS.forEach(r => plan.append(el(
      `<div class="room" style="left:${r.x}%;top:${r.y}%;width:${r.w}%;height:${r.h}%"><span>${esc(r[LANG])}</span></div>`)));
    OBJECTS.forEach((oo, i) => {
      const p = el(`<button class="pin ${i === sel ? "on" : ""} ${answers[oo.id] ? "has" : ""}"
        style="left:${oo.plan.x}%;top:${oo.plan.y}%">${answers[oo.id] ? SVG.check : (i + 1)}</button>`);
      p.onclick = () => { sel = i; live = ""; mode = "idle"; render(); };
      plan.append(p);
    });

    const det = body.querySelector(".detail");
    det.append(el(`<div class="row">
      <div class="kthumb"><img src="${IMG}${o.img}" alt="" /></div>
      <div><div class="eyebrow">${esc(d.room)}</div>
      <div class="vtitle" style="margin:4px 0 0;font-size:16px">${esc(d.title)}</div></div></div>`));
    det.append(el(saved ? `<div class="saved">${SVG.check}<p>„${esc(saved)}“</p></div>`
                        : `<div class="frage dfrage">${esc(frageOf(o.id))}</div>`));
    if (mode === "nospeech" || mode === "failed") {
      const ta = el(`<textarea class="typed" rows="2" placeholder="${esc(T.placeholder)}"></textarea>`);
      const ok = el(`<button class="linkish">${esc(T.save)}</button>`);
      ok.onclick = () => { if (ta.value.trim()) answers[o.id] = ta.value.trim(); mode = "idle"; render(); };
      det.append(ta, ok); setTimeout(() => ta.focus(), 30);
    } else {
      const row = el(`<div style="display:flex;align-items:center;gap:13px"></div>`);
      const mic = el(`<button class="mic ${mode === "rec" ? "rec" : (saved ? "done" : "")}" style="width:56px;height:56px;flex:0 0 auto">${mode === "rec" ? SVG.stop : SVG.mic}</button>`);
      mic.onclick = () => rec.toggle(o.id);
      row.append(mic, el(`<div style="flex:1;text-align:left">
        <div class="live" style="text-align:left">${mode === "rec" ? esc(live || "…") : ""}</div>
        <div class="hint" style="text-align:left">${esc(mode === "rec" ? T.listening : T.sayAny)}</div></div>`));
      det.append(row);
      if (mode !== "rec") {
        const alt = el(`<button class="linkish" style="align-self:flex-start;padding-left:0">${esc(T.typeInstead)}</button>`);
        alt.onclick = () => { mode = "nospeech"; render(); };
        det.append(alt);
      }
    }
    root.append(body);
    root.append(finishBar(root, answers, startedAt, 18, () => { sel = 0; startedAt = Date.now(); }, render));
  }
  render();
  return { relang: render };
}

/* ======================= D · FÜHRUNG ======================= */
/* Konzeptskizze. Keine Ortung: die Position wird abgespielt oder mit dem
   Finger gesetzt. Sie zeigt nur die Idee — das nächste Objekt meldet sich
   von allein, statt dass man es sucht. */
function Fuehrung(root) {
  const SCALE_X = 14, SCALE_Y = 20;   // Meter, die ein Raum in der Skizze misst
  const ARRIVE = 2.6;

  let roomIdx = 0;
  let me = { x: 50, y: 94 }, heading = -90, wp = 0, seg = 0, walking = false;
  let answers = {}, selId = ROUTE_ROOMS[0].spots[0].id, arrived = false;
  let mode = "idle", live = "", speechCode = null, sheetId = null, shot = 0, startedAt = Date.now();
  let intro = introEnabled, inputPref = "voice";
  let pending = null, editing = false;
  let elMe, elRange, elLabel, pinEls = [], inWrapped = false, lastRoom = -1;

  const rec = makeRecorder({
    onInterim: s => { live = s; render(); },
    onFinal: (id, s, sec) => { pending = { objId: id, text: s, seconds: sec }; editing = false; live = ""; render(); },
    onState: (s, code) => { mode = s; speechCode = code || null; render(); },
  });

  const room = () => ROUTE_ROOMS[roomIdx];
  const path = () => [{ x: 50, y: 94 }].concat(room().spots.map(s => ({ x: s.x, y: s.y })), [{ x: 50, y: 6 }]);
  const distM = (a, b) => Math.hypot((a.x - b.x) * SCALE_X / 100, (a.y - b.y) * SCALE_Y / 100);

  function nearest() {
    let best = null, bd = Infinity;
    room().spots.forEach(s => { const d = distM(me, s); if (d < bd) { bd = d; best = s; } });
    return { spot: best, d: bd };
  }

  function enterRoom(i, dir) {
    roomIdx = (i + ROUTE_ROOMS.length) % ROUTE_ROOMS.length;
    me = { x: 50, y: dir < 0 ? 6 : 94 };
    wp = 0; seg = 0; heading = dir < 0 ? 90 : -90;
    selId = room().spots[0].id; mode = "idle"; live = ""; sheetId = null;
    render();
  }

  function tick() {
    if (!walking || sheetId || inWrapped) return;
    const P = path();
    if (wp >= P.length - 1) { enterRoom(roomIdx + 1, 1); return; }
    const a = P[wp], b = P[wp + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    seg += 1.2 / len;
    if (seg >= 1) { seg = 0; wp++; if (wp >= P.length - 1) { enterRoom(roomIdx + 1, 1); return; } }
    const A = P[wp], B = P[wp + 1] || P[wp];
    me = { x: A.x + (B.x - A.x) * seg, y: A.y + (B.y - A.y) * seg };
    heading = Math.atan2(B.y - A.y, B.x - A.x) * 180 / Math.PI;
    paint();
  }
  setInterval(tick, 80);

  function paint() {
    if (!elMe || !elMe.isConnected) return;
    const T = t();
    elMe.style.left = me.x + "%"; elMe.style.top = me.y + "%";
    elRange.style.left = me.x + "%"; elRange.style.top = me.y + "%";
    elLabel.style.left = me.x + "%"; elLabel.style.top = `calc(${me.y}% + 34px)`;
    const tri = elMe.querySelector("svg");
    if (tri) tri.style.transform = `rotate(${heading + 90}deg)`;

    const n = nearest(), now = !!(n.spot && n.d < ARRIVE);
    pinEls.forEach(p => p.classList.toggle("near", now && p.dataset.id === n.spot.id));

    if (now && selId !== n.spot.id) { selId = n.spot.id; arrived = true; mode = "idle"; live = ""; render(); return; }
    arrived = now;
  }

  function render() {
    // Nach dem Abschluss gehoert der Schirm dem Wrapped. Eine spaet
    // eintreffende Spracherkennung darf ihn nicht wegwischen.
    if (inWrapped) return;
    if (intro) return renderIntro();
    const T = t(), o = obj(selId), d = loc(o), saved = answers[selId], R = room();
    const near = nearest();          // welche Vitrine gerade vor dir steht
    root.innerHTML = ""; pinEls = [];

    root.append(el(`<div class="topbar">
      <div class="brand"><i>◆</i> SMÄK</div>
      <div class="topright"><div class="count"><b>${Object.keys(answers).length}</b> / ${OBJECTS.length} ${esc(T.erzaehlt)}</div></div>
    </div>`));
    root.append(el(`<div class="hair"></div>`));
    root.append(el(`<div class="srlive" role="status" aria-live="polite">${esc(
      mode === "rec" ? T.listening : (saved ? T.told : ""))}</div>`));

    const body = el(`<div class="fuehrung">
      <div class="planwrap">
        <div class="roomhead"></div><div class="rstage"></div><div class="fbar"></div>
      </div>
      <div class="detail"></div></div>`);

    const head = body.querySelector(".roomhead");
    head.append(el(`<div class="rn">${esc(T.saal)} ${esc(R[LANG])}</div>`),
                el(`<div class="rc">${esc(T.room)} ${roomIdx + 1} / ${ROUTE_ROOMS.length}</div>`));

    /* Der Saal: Wände, Durchgänge, Vitrinen */
    const st = body.querySelector(".rstage");
    if (lastRoom !== roomIdx) { st.classList.add("fresh"); lastRoom = roomIdx; }
    st.append(el(`<div class="walls"></div>`));
    /* Durch den Proeben geht man weiter — auch mit dem Finger, nicht nur im Rundgang */
    const nextRoom = ROUTE_ROOMS[(roomIdx + 1) % ROUTE_ROOMS.length][LANG];
    const prevName = roomIdx === 0 ? T.toEntrance : ROUTE_ROOMS[roomIdx - 1][LANG];
    const doorTop = el(`<button class="door top" aria-label="${esc(T.goTo)} ${esc(nextRoom)}">
      <i></i><span>→ ${esc(nextRoom)}</span></button>`);
    doorTop.onclick = (e) => { e.stopPropagation(); walking = false; enterRoom(roomIdx + 1, 1); };
    st.append(doorTop);

    const first = roomIdx === 0;
    const doorBot = el(`<button class="door bot ${first ? "shut" : ""}"
      ${first ? "disabled" : `aria-label="${esc(T.goTo)} ${esc(prevName)}"`}>
      <i></i><span>← ${esc(prevName)}</span></button>`);
    if (!first) doorBot.onclick = (e) => { e.stopPropagation(); walking = false; enterRoom(roomIdx - 1, -1); };
    st.append(doorBot);

    R.spots.forEach(sp => {
      const oo = obj(sp.id), od = loc(oo), has = !!answers[sp.id];
      const isNear = !!(near.spot && near.spot.id === sp.id && arrived);
      const wall = sp.side === "left" ? "left:26px" : "right:26px";
      const card = sp.side === "left" ? "left:30px" : "right:30px";
      st.append(el(`<div class="vbar ${isNear ? "on" : ""}" style="${wall};top:calc(${sp.y}% - 5px)"></div>`));
      const p = el(`<button class="rpin ${isNear ? "near" : ""} ${has ? "has" : ""}" data-id="${sp.id}"
        style="${card};top:calc(${sp.y}% + 11px)" aria-label="${esc(od.title)}">
        <span class="shot"><img src="${IMG}${oo.img}" alt="" /></span>
        <span class="cap">${esc(T.vitrine(sp.nr))}</span></button>`);
      p.onclick = (e) => { e.stopPropagation(); selId = sp.id; mode = "idle"; live = ""; render(); };
      st.append(p); pinEls.push(p);
      if (has) st.append(el(`<div class="rtick" title="${esc(T.told)}"
        style="${sp.side === "left" ? "left:78px" : "right:78px"};top:calc(${sp.y}% + 14px)">${SVG.check}</div>`));
    });

    elRange = el(`<div class="range"></div>`); st.append(elRange);
    elMe = el(`<div class="me"><i>${SVG.heading}</i></div>`); st.append(elMe);
    elLabel = el(`<div class="melabel">${esc(T.youAreHere)}</div>`); st.append(elLabel);
    st.onclick = (e) => {
      const r = st.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width * 100, ny = (e.clientY - r.top) / r.height * 100;
      heading = Math.atan2(ny - me.y, nx - me.x) * 180 / Math.PI;
      me = { x: nx, y: ny }; walking = false; paint();
    };

    const bar = body.querySelector(".fbar");
    const go = el(`<button class="chip ${walking ? "on" : ""}">${esc(walking ? T.walkRunning : T.walk)}</button>`);
    go.onclick = () => { walking = !walking; render(); };
    const wipe = el(`<button class="wipe">${esc(T.wipe)}</button>`);
    wipe.onclick = () => {
      Object.keys(answers).forEach(k => delete answers[k]);
      pending = null; editing = false;
      clearLikes();
      try { sessionStorage.removeItem("mw-consent"); } catch (e) {}
      startedAt = Date.now(); render();
      const live = root.querySelector(".srlive"); if (live) live.textContent = T.wipeDone;
    };
    bar.append(go, el(`<span class="stub">${esc(T.sketch)}</span>`), wipe);

    /* Aufnahmefeld */
    const det = body.querySelector(".detail");
    const row = el(`<div class="row"></div>`);
    const tap = el(`<button class="tapphoto"><span class="kthumb" style="width:56px;height:56px;border-radius:12px">
      <img src="${IMG}${o.img}" alt="" /></span></button>`);
    tap.onclick = () => { sheetId = selId; shot = 0; render(); };
    row.append(tap, el(`<div style="flex:1;min-width:0">
      <div class="eyebrow">${esc(d.room)} · ${esc(d.epoche)}</div>
      <div class="vtitle" style="margin:4px 0 0;font-size:18px">${esc(d.title)}</div>
      <div class="credit">${esc(creditOf(selId))}</div></div>`));
    row.append(likeBtn(selId, render));
    det.append(row);

    det.append(el(saved ? `<div class="saved">${SVG.check}<p>„${esc(saved)}“</p></div>`
                        : `<div class="frage dfrage">${esc(frageOf(selId))}</div>`));

    if (mode === "nospeech" || mode === "failed") {
      if (mode === "failed") {
        const p = speechProblem(speechCode);
        det.append(el(`<div class="speecherr">${esc(p.text)}<span>${esc(p.code)}</span></div>`));
      }
      // Kein Deckel: wer sprechen kann, wird nicht begrenzt — wer tippen muss,
      // darf es auch nicht sein. Der Zaehler bleibt als Rueckmeldung.
      const ta = el(`<textarea class="typed" rows="2" placeholder="${esc(T.placeholder)}"></textarea>`);
      const counter = el(`<div class="chars" aria-live="polite">${esc(T.chars(0))}</div>`);
      ta.oninput = () => { counter.textContent = T.chars(ta.value.length); };
      det.append(ta, counter);
      setTimeout(() => ta.focus(), 30);
      const acts = el(`<div class="actions"></div>`);
      if (mode === "failed" && ["no-speech", "nostart", "network", "unknown"].indexOf(speechCode) > -1) {
        const again = el(`<button class="btn">${esc(T.tryAgain)}</button>`);
        again.onclick = () => { mode = "idle"; speechCode = null; render(); rec.toggle(selId); };
        acts.append(again);
      }
      const ok = el(`<button class="btn">${esc(T.save)}</button>`);
      ok.onclick = () => { if (ta.value.trim()) answers[selId] = ta.value.trim(); mode = "idle"; render(); };
      acts.append(ok, finishButton());
      det.append(acts);
    } else if (mode === "rec") {
      const box = el(`<div class="recbox"></div>`);
      const mic = el(`<button class="mic rec" aria-label="${esc(T.listenStop)}" aria-pressed="true"
        style="width:52px;height:52px;flex:0 0 auto">${SVG.stop}</button>`);
      mic.onclick = () => rec.toggle(selId);
      box.append(mic, el(`<div style="flex:1;min-width:0">
        <div class="live">${esc(live || "…")}</div>
        <div class="hint">${esc(T.listenStop)}</div></div>`));
      det.append(box);
    } else {
      // Sprechen und Tippen stehen gleichberechtigt nebeneinander — Tippen ist
      // kein Notausgang, sondern fuer viele Besucher der einzige Weg.
      const ways = el(`<div class="actions"></div>`);
      const speak = el(`<button class="btn way" aria-pressed="false">${SVG.mic} ${esc(T.speak)}</button>`);
      speak.onclick = () => rec.toggle(selId);
      const write = el(`<button class="btn way">${esc(T.type)}</button>`);
      write.onclick = () => { mode = "nospeech"; render(); };
      ways.append(speak, write);
      det.append(ways);
      det.append(el(`<div class="micwarn">${esc(T.micWarn)}</div>`));
      const acts = el(`<div class="actions"></div>`);
      acts.append(finishButton());
      det.append(acts);
    }
    root.append(body);
    root.append(objektblatt());
    root.append(deineWorte());
    paint();
  }

  /* 1 · Willkommen: worum es geht, bevor der erste Saal kommt */
  function renderIntro() {
    const T = t();
    root.innerHTML = "";
    const v = el(`<div class="intro">
      <div class="introtop">
        <div class="brand"><i>◆</i> SMÄK</div>
        <div class="langpills"></div>
      </div>
      <div class="introbody"><div class="introinner">
        <div>
          <div class="introeyebrow"><span class="neu">${esc(T.neu)}</span> Museum Wrapped</div>
          <div class="introhead">${esc(T.introTitle)}</div>
        </div>
        <div class="steps"></div>
        <div class="consent">
          <div class="consenthead"><span>${SVG.shield}</span>${esc(T.consentTitle)}</div>
          <p>${esc(T.consentIntro)}</p>
          <ul>${T.consentBullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul>
          <p class="voluntary">${esc(T.consentVoluntary)}</p>
        </div>
        <div class="rights">${esc(T.rights)}</div>
        ${legalRow()}
      </div></div>
      <div class="introfoot"></div></div>`);

    const pills = v.querySelector(".langpills");
    [["de", "DE"], ["en", "EN"]].forEach(([k, label]) => {
      const b = el(`<button class="${LANG === k ? "on" : ""}">${label}</button>`);
      b.onclick = () => { LANG = k; document.documentElement.lang = k; render(); };
      pills.append(b);
    });

    const steps = v.querySelector(".steps");
    [1, 2, 3].forEach(i => steps.append(el(`<div class="step">
      <span class="stepnum">${i}</span>
      <div style="padding-top:6px">
        <div class="steptitle">${esc(T["introStep" + i])}</div>
        <div class="steptext">${esc(T["introStep" + i + "Sub"])}</div>
      </div></div>`)));

    const foot = v.querySelector(".introfoot");
    // Nichts ist vorgewaehlt: erst ein Druck auf einen der beiden Knoepfe
    // entscheidet, und erst danach wird das Mikrofon ueberhaupt angefasst.
    const voice = el(`<button class="btnbig">${SVG.mic} ${esc(T.consentYes)}</button>`);
    voice.onclick = () => {
      try { sessionStorage.setItem("mw-consent", "voice"); } catch (e) {}
      inputPref = "voice"; intro = false; mode = "idle"; render();
    };
    const type = el(`<button class="btnghost">${esc(T.consentNo)}</button>`);
    type.onclick = () => {
      try { sessionStorage.setItem("mw-consent", "text"); } catch (e) {}
      inputPref = "text"; intro = false; mode = "nospeech"; render();
    };
    foot.append(voice, type, el(`<div class="footnote">${esc(T.introSwitch)}</div>`));

    // Ohne Spracherkennung im Browser führt nur der Schreibweg weiter
    if (!SR) { voice.disabled = true; voice.style.opacity = ".45"; voice.style.cursor = "not-allowed"; }
    root.append(v);
  }

  function finishButton() {
    const b = el(`<button class="btn gold">${esc(t().finishShort)}</button>`);
    b.onclick = () => {
      inWrapped = true; walking = false;
      startWrapped(root, answers, startedAt, () => {
        // Ein neuer Besuch ist ein neuer Mensch: die Einwilligung des vorigen
        // gilt nicht weiter, das Geraet wandert schliesslich von Hand zu Hand.
        Object.keys(answers).forEach(k => delete answers[k]);
        try { sessionStorage.removeItem("mw-consent"); } catch (e) {}
        clearLikes();
        inWrapped = false; roomIdx = 0; lastRoom = -1; startedAt = Date.now();
        pending = null; editing = false; sheetId = null; speechCode = null;
        me = { x: 50, y: 94 }; heading = -90; wp = 0; seg = 0; walking = false;
        selId = ROUTE_ROOMS[0].spots[0].id;
        intro = introEnabled; mode = "idle"; inputPref = "voice";
        render();
      });
    };
    return b;
  }

  /* 3 · Deine Worte: erst zeigen, was verstanden wurde, dann speichern */
  function deineWorte() {
    const T = t();
    const sheet = el(`<div class="sheet ${pending ? "open" : ""}"><div class="sheetbody"><div class="grab"></div></div></div>`);
    sheet.onclick = (e) => { if (e.target === sheet) { pending = null; editing = false; render(); } };
    if (!pending) return sheet;

    const o = obj(pending.objId), d = loc(o), sb = sheet.querySelector(".sheetbody");
    sb.append(el(`<div class="sheethero">
      <div class="kthumb" style="width:52px;height:52px"><img src="${IMG}${o.img}" alt="" /></div>
      <div><div class="eyebrow">${esc(d.room)} · ${esc(d.epoche)}</div>
      <div class="vtitle" style="margin:4px 0 0;font-size:17px">${esc(d.title)}</div></div></div>`));

    if (editing) {
      const ta = el(`<textarea class="typed" rows="3">${esc(pending.text)}</textarea>`);
      sb.append(ta);
      setTimeout(() => { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }, 30);
      const save = el(`<button class="btnbig" style="min-height:54px;border-radius:15px;font-size:15.5px">${SVG.check} ${esc(T.keepIt)}</button>`);
      save.onclick = () => {
        const v = ta.value.trim();
        if (v) answers[pending.objId] = v;
        pending = null; editing = false; render();
      };
      sb.append(save);
    } else {
      sb.append(el(`<div class="heard">
        <div class="heardlabel">${SVG.mic} ${esc(T.heard)}</div>
        <div class="heardquote">„${esc(pending.text)}“</div>
        <div class="heardmeta">${esc(T.seconds(pending.seconds))} · ${esc(T.notSaved)}</div></div>`));

      const keep = el(`<button class="btnbig" style="min-height:54px;border-radius:15px;font-size:15.5px">${SVG.check} ${esc(T.keepIt)}</button>`);
      keep.onclick = () => { answers[pending.objId] = pending.text; pending = null; render(); };
      sb.append(keep);

      const two = el(`<div class="actions"></div>`);
      const again = el(`<button class="btn" style="min-height:48px">${SVG.redo} ${esc(T.speakAgain)}</button>`);
      again.onclick = () => { const id = pending.objId; pending = null; render(); rec.toggle(id); };
      const edit = el(`<button class="btn" style="min-height:48px">${esc(T.editText)}</button>`);
      edit.onclick = () => { editing = true; render(); };
      two.append(again, edit);
      sb.append(two);
    }

    /* Alles, was schon erzählt ist — jederzeit neu besprechbar */
    const told = Object.keys(answers);
    if (told.length) {
      sb.append(el(`<div class="toldlabel">${esc(T.alreadyTold)}</div>`));
      const list = el(`<div class="toldlist"></div>`);
      told.forEach(id => {
        const oo = obj(id); if (!oo) return;
        const rowEl = el(`<div class="toldrow">
          <div class="kthumb" style="width:44px;height:44px"><img src="${IMG}${oo.img}" alt="" /></div>
          <div style="flex:1;min-width:0">
            <div class="toldquote">„${esc(answers[id])}“</div>
            <div class="toldtitle">${esc(loc(oo).title)}</div></div></div>`);
        const redo = el(`<button class="toldredo" aria-label="${esc(T.speakAgain)}">${SVG.redo}</button>`);
        redo.onclick = () => { pending = null; selId = id; render(); rec.toggle(id); };
        rowEl.append(redo);
        list.append(rowEl);
      });
      sb.append(list);
    }
    return sheet;
  }

  /* Objektblatt: Beschreibung, weitere Aufnahmen, Audioguide (Platzhalter) */
  function objektblatt() {
    const T = t();
    const sheet = el(`<div class="sheet ${sheetId ? "open" : ""}"><div class="sheetbody"><div class="grab"></div></div></div>`);
    sheet.onclick = (e) => { if (e.target === sheet) { sheetId = null; render(); } };
    if (!sheetId) return sheet;

    const o = obj(sheetId), d = loc(o), gal = GALERIE[sheetId] || [];
    const big = gal[shot] || o.img;
    const sb = sheet.querySelector(".sheetbody");

    sb.append(el(`<div class="bigshot"><img src="${IMG}${big}" alt="${esc(d.title)}" /></div>`));
    sb.append(el(`<div class="credit">${esc(creditOf(sheetId))}</div>`));
    if (gal.length > 1) {
      const strip = el(`<div class="strip"></div>`);
      gal.forEach((g, i) => {
        const b = el(`<button class="${i === shot ? "on" : ""}"><img src="${IMG}${g}" alt="" /></button>`);
        b.onclick = () => { shot = i; render(); };
        strip.append(b);
      });
      sb.append(strip);
    }
    const spot = (room().spots.find(x => x.id === sheetId) || {}).nr;
    sb.append(el(`<div>
      <div class="eyebrow">${esc(d.room)} · ${esc(d.epoche)}${spot ? " · " + esc(T.vitrine(spot)) : ""}</div>
      <div class="vtitle" style="margin:5px 0 0;font-size:22px">${esc(d.title)}</div></div>`));
    sb.append(el(`<div class="beschreibung">${esc(d.fact)}</div>`));

    const bars = Array.from({ length: 12 }, (_, i) =>
      `<i style="height:${22 + Math.round(66 * Math.abs(Math.sin(i * 1.9)))}%"></i>`).join("");
    sb.append(el(`<div class="audio">
      <div class="play">${SVG.play}</div>
      <div style="flex:1;min-width:0">
        <div class="audiotitle">${esc(T.audioStub)}</div>
        <div class="audiolen">2:14</div>
      </div>
      <div class="wave">${bars}</div></div>`));

    const likeRow = el(`<div class="likerow"></div>`);
    likeRow.append(likeBtn(sheetId, render), el(`<span class="likehint">${esc(T.likeHint)}</span>`));
    sb.append(likeRow);

    const foot = el(`<div class="actions"></div>`);
    const now = el(`<button class="btn gold" style="min-height:50px">${esc(T.tellNow)}</button>`);
    now.onclick = () => { selId = sheetId; sheetId = null; mode = "idle"; render(); rec.toggle(selId); };
    const close = el(`<button class="btn" style="min-height:50px">${esc(T.close)}</button>`);
    close.onclick = () => { sheetId = null; render(); };
    foot.append(now, close);
    sb.append(foot);
    return sheet;
  }

  render();
  return { relang: render };
}

/* ======================= Werkbank ======================= */
const SLOTS = [
  { key:"d", make:Fuehrung, name:"nameD", why:"whyD" },
  { key:"a", make:Vitrine,  name:"nameA", why:"whyA" },
  { key:"b", make:Kartei,   name:"nameB", why:"whyB" },
  { key:"c", make:Saal,     name:"nameC", why:"whyC" },
];
let visible = "d";                     // Fokus liegt auf D
const apps = {};

function buildRack() {
  const rack = document.getElementById("rack");
  rack.innerHTML = "";
  SLOTS.forEach(s => {
    rack.append(el(`<figure class="slot" data-slot="${s.key}">
      <figcaption><div class="name"></div><div class="why"></div></figcaption>
      <div class="device"><div class="screen" id="scr-${s.key}"></div></div></figure>`));
    apps[s.key] = s.make(document.getElementById("scr-" + s.key));
  });
  paintChrome();
}

function paintChrome() {
  const T = t();
  document.documentElement.lang = LANG;
  document.getElementById("labTitle").textContent = T.labTitle;
  document.getElementById("labIntro").textContent = T.labIntro;

  const tabs = document.getElementById("tabs");
  tabs.innerHTML = "";
  [{ k:"all", l:T.tabAll }].concat(SLOTS.map(s => ({ k:s.key, l:T["tab" + s.key.toUpperCase()] })))
    .forEach(dd => {
      const b = el(`<button data-slot="${dd.k}" aria-pressed="${visible === dd.k}">${esc(dd.l)}</button>`);
      b.onclick = () => { visible = dd.k; paintChrome(); };
      tabs.append(b);
    });

  SLOTS.forEach(s => {
    const fig = document.querySelector(`.slot[data-slot="${s.key}"]`);
    fig.querySelector(".name").textContent = T[s.name];
    fig.querySelector(".why").textContent = T[s.why];
    fig.classList.toggle("hidden", visible !== "all" && visible !== s.key);
  });
}

/* ---------- Galerie der Wrapped-Entwürfe: derselbe Text, vier Sätze ---------- */
let wVisible = "all";

function buildWrack() {
  const wrack = document.getElementById("wrack");
  wrack.innerHTML = "";
  WSTYLES.forEach(s => {
    wrack.append(el(`<figure class="slot" data-wslot="${s.key}">
      <figcaption><div class="name"></div><div class="why"></div></figcaption>
      <div class="device"><div class="wdev" id="wscr-${s.key}"></div></div></figure>`));
  });
  paintWrack();
}

function paintWrack() {
  const T = t(), data = sample();
  document.getElementById("wsecTitle").textContent = T.wsecTitle;
  document.getElementById("wsecIntro").textContent = T.wsecIntro;
  document.getElementById("srcNote").textContent = T.srcNote;
  const src = document.getElementById("srcsw");
  src.querySelector('[data-src="sample"]').textContent = T.srcSample;
  src.querySelector('[data-src="live"]').textContent = T.srcLive;
  src.querySelectorAll(".chip").forEach(c =>
    c.classList.toggle("on", (c.dataset.src === "live") === liveMode));

  const wtabs = document.getElementById("wtabs");
  wtabs.innerHTML = "";
  [{ k:"all", l:T.wsAll }].concat(WSTYLES.map(s => ({ k:s.key, l:T["ws" + s.key[0].toUpperCase() + s.key.slice(1)] })))
    .forEach(dd => {
      const b = el(`<button data-wslot="${dd.k}" aria-pressed="${wVisible === dd.k}">${esc(dd.l)}</button>`);
      b.onclick = () => {
        wVisible = dd.k;
        if (dd.k !== "all") wrappedStyle = dd.k;   // die Auswahl gilt auch im Capture-Weg
        paintWrack();
      };
      wtabs.append(b);
    });

  WSTYLES.forEach(s => {
    const cap = s.key[0].toUpperCase() + s.key.slice(1);
    const fig = document.querySelector(`.slot[data-wslot="${s.key}"]`);
    if (!fig) return;                     // Galerie steht noch nicht
    fig.querySelector(".name").textContent = T["n" + cap];
    fig.querySelector(".why").textContent = T["w" + cap];
    fig.classList.toggle("hidden", wVisible !== "all" && wVisible !== s.key);
    const scr = document.getElementById("wscr-" + s.key);
    scr.innerHTML = "";
    const layer = el(`<div class="wrap" style="position:relative;flex:1"></div>`);
    scr.append(layer);
    showWrapped(layer, data, null, s.key);   // in der Galerie ohne „Neuer Besuch“
  });
}
/* Die Werkbank gibt es nur auf der Auswahlseite. Die App bindet dieselbe
   Datei ein und baut ihre eigene Oberflaeche darum. */
if (document.getElementById("rack")) {
  document.getElementById("srcsw").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    liveMode = b.dataset.src === "live";
    paintWrack();
  });

  document.getElementById("langsw").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    LANG = b.dataset.lang;
    document.querySelectorAll("#langsw button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    Object.values(apps).forEach(a => a.relang());   // Zustand bleibt, nur die Sprache wechselt
    paintChrome();
    paintWrack();
  });

  buildRack();
  buildWrack();
  window.__wrapReady = paintWrack;   // erst wenn die Galerie steht
}
