# Curabo Dev Update

Stand: 30. März 2026

## Source of Truth

- Hauptrepo: `/Users/valentinstrasser/Documents/New project`
- Mobile-App: `/Users/valentinstrasser/Documents/New project/mobile`

## Kurzüberblick

Curabo ist eine White-Label Plattform für MedSpas und Kliniken im DACH-Markt.
Das Produkt besteht aus:

- Website
- Dashboard für Kliniken
- Admin/Superadmin
- Mobile Patienten-App
- Backend mit Multi-Tenant-Logik

Der aktuelle Hauptfokus liegt auf der Mobile-App und der möglichst exakten Übernahme der Mowgli-UI in die bestehende Curabo-App, ohne den vorhandenen Datenfluss, die Kliniklogik, OTP, Cart, Checkout, Rewards und White-Label-Mechanik zu zerstören.

## Mobile Status

Die Mobile-App basiert weiterhin auf Curabo-Logik und Curabo-Backendschnittstellen, aber die UI wird screenweise auf den exportierten Mowgli-Stand gezogen.

Bereits umgesetzt bzw. stark angeglichen:

- Onboarding / Klinik-Auswahl
- Auth / OTP-Einstieg
- Home
- Shop
- Rewards
- Profil
- Bottom Navigation

Noch offen bzw. noch nicht final 1:1:

- Scan
- Search Overlay
- Cart Overlay
- letzte Shared-Shell-Differenzen in `mobile/App.js`
- Theme-Feinschliff für klinikspezifische Brandingfarben

## Mowgli-Referenz

Der visuelle Referenzstand liegt im Repo unter:

- `mobile/_mowgli_export`

Die offizielle Zuordnung zwischen Mowgli und produktiver Curabo-App liegt hier:

- `mobile/MOWGLI_UI_ADOPTION.md`

Wichtig:

- Mowgli ist die UI-Referenz
- Curabo bleibt Source of Truth für Logik, APIs, Datenmodelle und Tenant-Verhalten
- Ziel ist keine lose Inspiration, sondern eine möglichst exakte UI-Übernahme auf die bestehende App

## Letzte relevante Commits

- `231380b` Pull mobile UI closer to exact Mowgli shell
- `cd99cf0` Port core mobile screens to exact Mowgli layout
- `eeb21d7` Restore Mowgli structure on core mobile screens
- `cbd0e43` Normalize Mowgli mobile theme behavior
- `5c931f1` Remove scalp article image fallback

## Backend / Plattform

Das Backend in `server.py` bleibt zentral für:

- Klinik-Bundle pro MedSpa
- Kliniksuche
- QR-/Referral-Code-Auflösung
- OTP Request / Verify / Resend
- Membership Status / Activate / Cancel
- serverseitige Cart- und Checkout-Logik
- Dashboard-, Catalog- und Admin-Daten

Render, Postgres und die Hauptinfrastruktur sind bereits eingerichtet.
OTP/SMS ist noch nicht final als produktiver Go-Live-Stand abgeschlossen.

## Dashboard / Admin / Catalog

Die Desktop-Flächen existieren bereits:

- `dashboard.html`, `dashboard.css`, `dashboard.js`
- `admin.html`, `admin.css`, `admin.js`
- `catalog.html`, `catalog.css`, `catalog.js`

Der sinnvolle Parallel-Track zur Mobile-Mowgli-Arbeit ist:

- Dashboard/Admin/Catalog separat weiterentwickeln
- Backend nur in klar abgegrenzten Scopes anfassen
- `server.py` nicht gleichzeitig von zwei Tracks ohne Scope-Trennung bearbeiten

## Smart Parallelisierung

Saubere Aufteilung:

### Track A: Mobile / Mowgli

Besitzt:

- `mobile/App.js`
- `mobile/src/screens/**`
- `mobile/src/components/**`
- `mobile/src/overlays/**`
- `mobile/src/theme/tokens.js`

### Track B: Dashboard / Admin / Catalog

Besitzt:

- `dashboard.*`
- `admin.*`
- `catalog.*`

### Track C: Backend

Besitzt:

- `server.py`
- mobile-bezogene Endpoints nur dann, wenn klar abgegrenzt
- dashboard-/admin-bezogene API-Arbeit nur seriell oder klar geschnitten

## Nächste sinnvolle Schritte

### Mobile

1. Scan exakt auf Mowgli ziehen
2. Search Overlay exakt auf Mowgli ziehen
3. Cart Overlay exakt auf Mowgli ziehen
4. Restliche Shell-Differenzen in `mobile/App.js` entfernen
5. Brandingfarben pro MedSpa sauber theme-basiert durchziehen

### Produkt / Features

1. Appointments
2. Wissen & Tipps als eigener Bereich
3. Kontakt & Klinik als eigener Screen
4. Referral-Flow
5. Offers / Wallet / Vouchers

## Aktueller Risikohinweis

Im Repo liegen aktuell neben der produktiven App auch zusätzliche Mowgli-Referenz- und Tooling-Dateien in `mobile/_mowgli_export` sowie offene Tooling-Dateien unter `mobile/package.json`, `mobile/package-lock.json` und `mobile/tsconfig.json`.

Diese sollten nicht blind mit produktiven UI-Änderungen vermischt committed werden.

## Zielbild

Curabo soll als White-Label MedSpa-/Klinikplattform eine deutlich hochwertigere Patient Experience liefern als Dermis:

- klinikspezifisches Branding
- hochwertige Mobile-UI
- Memberships
- Rewards
- Checkout
- später Appointments, Journeys, Offers und Custom Plans

Kurz:

Curabo soll nicht nur eine schöne App sein, sondern das digitale Patientenbetriebssystem für Premium-MedSpas und Kliniken.
