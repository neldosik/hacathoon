# Museum Wrapped — SMÄK

Konzeptskizzen für ein KI-Plugin im Medienguide des Staatlichen Museums
Ägyptischer Kunst (SMÄK), München. Der Besucher sagt frei heraus, was ihm zu
einem Objekt durch den Kopf geht; am Ende bekommt er seinen Besuch zurück.

## Zwei Seiten

**[app.html](app.html) — die Anwendung.** Für das Telefon gebaut, ein
Bildschirm, kein Rahmen. Führung Raum für Raum → „Besuch beenden“ → **Story**
(zum Zeigen) und **Faden** (zum Behalten); zwischen beiden springt man hin und
her. Das ist die Seite für Tests mit Menschen.

Voreinstellungen über die URL, damit man ein Testgerät vorbereiten und dann aus
der Hand geben kann:

| | |
|---|---|
| `app.html` | Deutsch, Beispieltext (kein Serveraufruf) |
| `app.html?live=1` | fragt wirklich bei n8n an — **für echte Tests** |
| `app.html?lang=en` | englische Fassung, Spracherkennung auf `en-US` |
| `app.html?lang=en&live=1` | beides |

Dieselben Schalter liegen im Zahnrad oben rechts, zusammen mit einer kurzen
Diagnose des letzten Aufrufs.

**[index.html](index.html) — die Auswahl.** Vier Entwürfe für die Aufnahme
(Vitrine, Kartei, Saal, Führung) und vier für das Wrapped (Story, Blatt, Karte,
Faden), nebeneinander zum Vergleichen. Gewählt wurden Führung, Story und Faden.

## Was echt ist und was nicht

- **Echt:** Objekte, Fotos und Kuratorentexte aus dem Airtable des Projekts.
  Die Spracherkennung läuft im Browser (Web Speech API); ohne sie erscheint ein
  Textfeld. Mit `live=1` antwortet wirklich die KI über n8n.
- **Beispieltext:** ohne `live=1` wird eine einmal geholte, echte Antwort des
  Servers gezeigt (`data/sample-de.json`, `data/sample-en.json`). Sie trägt
  oben rechts die Marke „Beispieltext“, damit sie niemand für den eigenen
  Besuch hält. Für Tests mit Menschen deshalb `?live=1` benutzen.
- **Skizze:** die eigene Position im Grundriss wird abgespielt oder mit dem
  Finger gesetzt — es steckt keine Ortung dahinter. Der Audioguide im
  Objektblatt ist ein Platzhalter.
- **Erfunden:** die Zahl neben dem Herz („andere Besucher haben hier
  gehalten“). Es gibt keine Datenbank und keine fremden Besuche; die Zahl
  wird aus der Objekt-Nummer berechnet und bleibt darum stabil.

## Empfehlungen

Am Ende stehen drei Objekte für den nächsten Besuch, nach dem Themenprofil des
ganzen Besuchs gewichtet — und eines, an dem der Besucher vorbeigegangen ist:
das schwächste Thema seines Tages. Beides wird deterministisch berechnet, nicht
vom Modell geraten, und nie ein Objekt, vor dem er schon stand.

## Lokal ansehen

Statischen Server im Repo-Ordner starten, etwa `python -m http.server 5599`,
dann http://localhost:5599/app.html öffnen. Chrome empfohlen — Safari und
Firefox können die Spracherkennung nicht, dort greift das Textfeld.

## Rechtliches

Der Auftraggeber ist eine oeffentliche Stelle des Freistaats Bayern, darum
gelten DSGVO/BayDSG, der EU AI Act (Art. 50) und die digitale
Barrierefreiheit (BayBGG Art. 14 / BITV 2.0 ~ WCAG 2.1 AA).

- **Einwilligung vor dem Mikrofon.** Der erste Schirm erklaert, was gespeichert
  wird, wie lange, dass die Spracherkennung ueber den Browser-Anbieter laeuft
  und dass eine KI den Rueckblick schreibt. Nichts ist vorgewaehlt; das
  Mikrofon wird erst nach einem Druck auf einen der beiden Knoepfe angefasst.
  Die Wahl liegt in `sessionStorage` unter `mw-consent`.
- **KI-Hinweis** steht ueber dem erzeugten Inhalt und bleibt in jedem Kader
  sichtbar, nicht im Fuss.
- **Sprechen und Tippen sind gleichwertig** — zwei gleiche Knoepfe
  nebeneinander. Beide Wege erzeugen dieselbe Reaktion mit `input_type: "text"`;
  die Nutzlast des Webhooks ist unveraendert.
- **Keine Zusage ueber geloeschtes Audio.** Bei Web Speech geht die Aufnahme an
  den Browser-Anbieter; eine solche Zusage waere unzutreffend. Der Wortlaut
  steht auf dem Einwilligungsschirm.
- **Bildrechte.** Alle Objektfotos stehen unter CC BY-NC-ND 4.0, aber von
  verschiedenen Fotografen — darum traegt jedes grosse Bild seinen eigenen
  Nachweis, dazu eine Sammelzeile im Fuss. ND heisst: kein Beschnitt, keine
  Filter, keine Farbschleier ueber den Fotos (`object-fit: contain` ueberall).
- **Barrierefreiheit.** Kein Text unter 11 px, Tippziele ab 44 px, sichtbarer
  Fokus, `aria-live` fuer den Aufnahmestatus, sprechende Alternativtexte,
  Zustaende nie nur ueber Farbe, und `prefers-reduced-motion` schaltet
  Pulsieren und Einblendungen ab.
- **Sitzung loeschen** ist im Aufnahme-Schirm jederzeit erreichbar.
