# Framer Formular-Logik (ohne eigenes Backend)

## Ziel
Nach Klick auf `Weiter` direkt zu deinem Calendly-Link weiterleiten.

## Variante A: No-Code in Framer (einfach)

1. Auf Booking-Page das Formular erstellen.
2. Submit-Button auswählen.
3. `Link` auf deinen Calendly-Link setzen:
   - z. B. `https://calendly.com/valentin-strasser/30min`
4. Optional: `Open in New Tab` aktivieren.

Hinweis:
Diese Variante speichert Leads nicht in einer Datenbank.

## Variante B: Mit Framer Forms + Mail

1. Framer Form Block verwenden.
2. Form Destination auf E-Mail/Integration setzen.
3. Nach Submit Redirect auf Calendly konfigurieren.

## Variante C: Mit deinem Flask Backend `/api/leads`

Wenn du Lead-Speicherung möchtest, kann ich dir einen kleinen Framer Code Component liefern,
der zuerst `POST /api/leads` aufruft und danach weiterleitet.

Sag einfach: `mach mir die Variante C`, dann erstelle ich dir die Datei sofort.
