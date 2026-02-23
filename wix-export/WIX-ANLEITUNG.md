# Wix Uebergabe fuer Appointmentix

## Was im Ordner liegt

- `index-wix.html`  
- `styles-wix.css`  
- `app-wix.js`

## Wichtig vorab

Wix kann eine bestehende HTML/CSS/JS-Seite nicht 1:1 als native Wix-Sections importieren.

Du hast 2 Wege:

1. **Schnell live (Empfohlen jetzt):** als HTML-Embed in Wix einbauen.
2. **Spaeter voll nativ in Wix bearbeiten:** Layout in Wix Studio visuell nachbauen (Texte/Farben aus diesen Dateien uebernehmen).

## Weg 1: Schnell live in Wix

1. In Wix Editor: `Hinzufuegen` -> `Einbetten` -> `Eigener Code` -> `HTML iframe`.
2. Inhalt von `index-wix.html` in den Embed-Block kopieren.
3. In `index-wix.html` diese Zeilen anpassen:
   - `styles-wix.css`
   - `app-wix.js`

Hinweis: Falls Wix keine lokalen Dateien laedt, dann beide Dateien (`styles-wix.css`, `app-wix.js`) auf ein CDN/GitHub Pages hochladen und in `index-wix.html` mit absoluter URL verlinken.

## Calendly einstellen

In `app-wix.js` ganz oben:

```js
calendlyUrl: "https://calendly.com/dein-echter-name/30min"
```

Wenn dort ein Platzhalter steht, wird absichtlich nicht weitergeleitet.

## Deutsche Inhalte

Die Seite ist bereits auf Deutsch umgestellt.

## Optional: Leads speichern

Diese Wix-Version leitet nach Formular an Calendly weiter, speichert aber keine Leads im Backend.

Wenn du Lead-Speicherung willst, gibt es zwei Optionen:

1. Wix Forms + Wix CRM nutzen.
2. Ich verbinde das Formular wieder mit deinem Flask-Endpoint `/api/leads`.
