# Museum Wrapped — Capture-Skizzen

Konzeptskizzen für ein KI-Plugin im Medienguide des Staatlichen Museums
Ägyptischer Kunst (SMÄK), München. **Kein Produkt** — vier Richtungen, wie ein
Besucher seine eigenen Gedanken zu einem Objekt hinterlässt.

- **A · Vitrine** — ein Objekt, ganze Aufmerksamkeit.
- **B · Kartei** — die Route als Liste, Antworten im Blatt von unten.
- **C · Saal** — schematischer Grundriss mit Objektpunkten.
- **D · Führung** — Raum für Raum, mit eigener Position im Plan. Die Position
  ist abgespielt, es steckt keine Ortung dahinter.

Der Besucher sagt frei heraus, was ihm durch den Kopf geht — es gibt keine
vorgegebene Frage. Spracherkennung läuft im Browser (Web Speech API, `de-DE`);
ohne sie erscheint ein Textfeld.

Objektdaten, Kuratorentexte und Fotos stammen aus dem Airtable des Projekts.

Lokal ansehen: einen statischen Server im Repo-Ordner starten, z. B.
`python -m http.server 5599`, dann http://localhost:5599 öffnen.
