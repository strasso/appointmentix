# Appointmentix Framer Sections (Nativ Editierbar)

Baue jede Section als eigenes `Frame`/`Component`, damit du im Framer Editor alles visuell ändern kannst.

## Page Root
- Max Width: `1120`
- Align: Center
- Background: Verlauf `Sand / 50 -> Sand / 100`
- Vertical Layout
- Gap: `24`

## Section 1: Header
- Height: `68`
- Sticky: `Top 0`
- Border Bottom: `1px rgba(47,34,24,0.1)`
- Inhalte:
  - Logo links: `APPOINTMENTIX`
  - Nav Mitte: `Produkt`, `Referenzen`, `App-Builder`
  - Button rechts: `App bauen`

## Section 2: Hero Headline
- Center aligned
- Eyebrow: `White-Label Plattform für ästhetische Kliniken`
- H1: `Mehr Behandlungen & Pakete verkaufen`
- Body: `Eine schlanke App-Experience ...`
- CTA: `App bauen`

## Section 3: Feature Tabs
- 4 gleich breite Tabs
- Tabs:
  - `Automatisierte Angebote`
  - `Patientenfinanzierung`
  - `Prämien`
  - `Mitgliedschaften`
- Erster Tab aktiv (dunkler beige)

## Section 4: Showcase (Dark Band)
- Hintergrund: `Night / 900`
- 3 Spalten Desktop (1fr / 340 / 1fr)

Links (Card Light):
- H3: `Mehr verkaufen, auch außerhalb der Öffnungszeiten`
- Text: kurzer Absatz

Mitte (Phone Mockup):
- Schwarzer Device-Rahmen
- Inhalt:
  - Chips: `Angebote`, `Live`
  - Titel: `Willkommen zurück, Jana`
  - Text
  - Button: `Angebot öffnen`

Rechts (Card Dark):
- KPI 1: `+30k`
- KPI 2: `+88%`

## Section 5: Proof
- 2 Spalten

Links:
- Eyebrow `Fallbeispiel`
- H2 `Kliniken wählen Appointmentix ...`
- Bullet List (3 Punkte)
- CTA `App bauen`

Rechts:
- Bild-Platzhalter (Gradient oder echtes Bild)
- Zitat-Text

## Section 6: Configurator
- 2 Spalten

Links: Konfigurationskarte
- Eyebrow `Jetzt starten`
- H2 `App konfigurieren`
- Feld: Markenfarbe (Color + Hex)
- Feld: Schriftart (Select)
- CTA: `App bauen`

Rechts: Live-Vorschau
- Titel `Appointmentix Klinik-Branding`
- Mini Mockup

## Section 7: Booking / Lead Form
- Separate Page in Framer: `/book-a-call`
- Max Width: `560`
- White Card auf Sand Background

Inhalte:
- Back Link `Zur Startseite`
- H2 `Kostenfreie App-Building-Session buchen`
- 3 Benefit Pills
- Formularfelder wie in aktueller Seite:
  - Vollständiger Name
  - E-Mail
  - Telefonnummer
  - Klinikname
  - Website
  - Gerätefrage (Radio)
  - Umsatzfrage (Radio)
  - Consent Pflicht
  - Consent Marketing optional
- Button `Weiter`

## Section 8: Footer
- Hintergrund: `Night / 900`
- Links: `Produkt`, `Datenschutz`, `AGB`
- Linke Seite: kurzer Satz zur Marke

## Responsive Regeln
- <= 980px: Sections mit 2/3 Spalten auf 1 Spalte umbrechen
- <= 760px: Tabs als 2x2 Grid
- Button-Stack vertikal, volle Breite
