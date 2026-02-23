# Framer Uebergabe fuer Appointmentix

## Dateien

- `framer-embed-snippet.html`

## Schnellstart in Framer

1. Framer-Projekt oeffnen.
2. `Insert` -> `Embed` auswaehlen.
3. Den gesamten Inhalt aus `framer-embed-snippet.html` in den Embed-Block kopieren.
4. Embed-Breite auf `Fill`, Hoehe auf ca. `4200px` setzen (spaeter feinjustieren).

## Sehr wichtig: Calendly-Link setzen

In der Datei `framer-embed-snippet.html` im Script-Bereich:

```js
const CALENDLY_URL = "https://calendly.com/dein-echter-name/30min";
```

Den Wert auf deinen echten Link aendern, sonst wird absichtlich nicht weitergeleitet.

## Was enthalten ist

- Homepage im Appointmentix-Design (creme/beige/braun/ocker)
- `App bauen` CTA
- Qualifizierungsformular
- Weiterleitung zu Calendly nach Formularabschluss
- Deutsche Texte

## Hinweis

Diese Framer-Version ist als Embed gedacht, damit sie sofort laeuft.
Wenn du willst, baue ich dir im naechsten Schritt die gleiche Seite als **nativ editierbare Framer-Struktur** (Sections, Components, Text Styles, Color Styles).
