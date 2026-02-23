# Appointmentix - Dermis-inspirierte Homepage + Qualifizierungsformular

Dieses Projekt enthält jetzt:

- eine **schlanke Homepage** im Dermis-Stil (aber im eigenen Appointmentix-Design)
- ein **Build my app**-Flow mit Qualifizierungsformular
- automatische **Weiterleitung zu Calendly** nach erfolgreichem Absenden
- Backend-Endpoint zum Speichern von Leads (`POST /api/leads`)
- mobile Admin-App unter `mobile/` (Expo, iOS + Android)

## 1. Voraussetzungen

- Python 3.9+
- pip

## 2. Start lokal

```bash
cd "/Users/valentinstrasser/Documents/New project"
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 server.py
```

Dann im Browser öffnen:

`http://localhost:4173`

Web-Admin-Dashboard:

`http://localhost:4173/dashboard`

Super-Admin-Panel:

`http://localhost:4173/admin`

## 3. .env konfigurieren

Falls noch nicht vorhanden:

```bash
cp .env.example .env
```

Wichtig für deinen Flow:

- `CALENDLY_URL=https://calendly.com/dein-name/demo`

Hinweis:

- `dein-name/demo` ist nur ein Platzhalter und führt zu `404`.
- Setze hier deinen echten Calendly-Link, z. B. `https://calendly.com/valentin-strasser/30min`.

Optional (wenn du Stripe weiter nutzt):

- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES=card,paypal,klarna`

Hinweise zu Payment-Methoden:

- Apple Pay wird in Stripe Checkout über `card` bereitgestellt (zusätzlich Domain-Verifizierung in Stripe nötig).
- Klarna/PayPal hängen von Stripe-Konto, Land, Währung und Checkout-Mode ab.
- Wenn eine Methode im Konto nicht verfügbar ist, nutzt der Backend-Flow kompatible Fallback-Methoden.

Optional fuer Production-DB:

- `DATABASE_URL=postgresql://USER:PASS@HOST:5432/DBNAME`

Optional fuer Kampagnen-Provider:

- `RESEND_API_KEY=...`
- `RESEND_FROM_EMAIL=noreply@deinedomain.de`
- `TWILIO_ACCOUNT_SID=...`
- `TWILIO_AUTH_TOKEN=...`
- `TWILIO_FROM_NUMBER=+43...`
- `MOBILE_OTP_BRAND_NAME=Appointmentix`
- `MOBILE_OTP_TTL_SECONDS=300`
- `MOBILE_OTP_MAX_ATTEMPTS=5`
- `MOBILE_OTP_RESEND_COOLDOWN_SECONDS=30`
- `MOBILE_OTP_DEBUG=true` (nur lokal; in Production auf `false`)
- `ONESIGNAL_APP_ID=...`
- `ONESIGNAL_REST_API_KEY=...`
- `AUTOMATION_RUNNER_SECRET=...` (fuer systemweiten Due-Run Endpoint)

Fuer das Super-Admin-Panel:

- `SUPERADMIN_EMAIL=admin@appointmentix.de`
- `SUPERADMIN_PASSWORD=dein-sehr-langes-passwort`

## 4. Nutzerflow

1. User klickt auf `Build my app`
2. User füllt das Qualifizierungsformular aus
3. Daten werden in der Tabelle `leads` gespeichert
4. Danach Weiterleitung zu deinem Calendly-Link

Direkte Formular-URL:

- `http://localhost:4173/book-a-call`

## 5. Relevante Endpoints

- `GET /api/health`
- `GET /api/config/public`
- `POST /api/leads`
- `POST /api/auth/register` (liefert jetzt auch Bearer-Token)
- `POST /api/auth/login` (liefert jetzt auch Bearer-Token)
- `POST /api/auth/logout`
- `GET /api/mobile/clinic-bundle?clinicName=...` (Patienten-App Bundle pro Klinik)
- `GET /api/mobile/clinics/search?query=...` (Klinik-Suche fuer Erstinbetriebnahme)
- `POST /api/mobile/clinics/resolve-code` (QR-/Referral-Code auf Klinik auflösen)
- `POST /api/mobile/auth/otp/request` (SMS-Code anfordern)
- `POST /api/mobile/auth/otp/verify` (SMS-Code verifizieren)
- `POST /api/mobile/auth/otp/resend` (SMS-Code neu senden)
- `GET /api/mobile/membership/status?clinicName=...&memberEmail=...` (Patienten-Membership Status)
- `POST /api/mobile/membership/activate` (Patienten-Membership aktivieren)
- `POST /api/mobile/membership/cancel` (Patienten-Membership kündigen)
- `POST /api/mobile/membership/mark-past-due` (Demo: Payment-Fehler simulieren)
- `POST /api/mobile/cart/add` (serverseitige Preislogik pro Treatment inkl. Membership)
- `POST /api/mobile/checkout/complete` (Checkout Eventspur + Membership Status Sync)
- `GET /api/clinic/settings`
- `PUT /api/clinic/settings` (nur Owner)
- `GET /api/clinic/catalog`
- `PUT /api/clinic/catalog` (nur Owner, pflegt Treatments/Memberships/Rewards)
- `GET /api/clinic/catalog/export` (Katalog als JSON exportieren)
- `POST /api/clinic/catalog/import` (Katalog aus JSON importieren, nur Owner)
- `POST /api/clinic/catalog/auto-gallery` (KI-Keyword Auto-Galerie auf Treatments anwenden, nur Owner)
- `GET /api/clinic/media` (Owner/Staff, Medienliste)
- `POST /api/clinic/media/upload` (nur Owner, Bild-Upload)
- `DELETE /api/clinic/media` (nur Owner, Bild löschen)
- `GET /api/clinic/members`
- `POST /api/clinic/members` (nur Owner, erstellt Staff-User)
- `GET /api/clinic/patient-memberships` (Owner/Staff, aktive Memberships + MRR)
- `GET /api/clinic/campaigns` (Owner/Staff, Kampagnenliste)
- `POST /api/clinic/campaigns` (nur Owner, Kampagne erstellen)
- `PUT /api/clinic/campaigns/:id` (nur Owner, Kampagne ändern)
- `POST /api/clinic/campaigns/:id/run` (nur Owner, Kampagne sofort ausführen)
- `POST /api/clinic/campaigns/run-due` (nur Owner, faellige aktive Kampagnen der Klinik laufen lassen)
- `GET /api/clinic/campaigns/:id/deliveries` (Owner/Staff, Versandprotokoll)
- `POST /api/system/campaigns/run-due` (Secret-protected, faellige aktive Kampagnen systemweit)
- `GET /api/clinic/audit-logs` (Owner/Staff, Änderungsverlauf)
- `POST /api/analytics/events` (authentifizierte Events)
- `POST /api/analytics/public-event` (Patienten-App Event-Ingest)
- `GET /api/analytics/summary?days=7|30|90`
- `GET /api/billing/status`
- `GET /api/billing/history` (nur Owner)
- `POST /api/billing/create-checkout-session` (nur Owner)
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/me`
- `GET /api/admin/overview`
- `GET /api/admin/clinics`
- `GET /api/admin/clinics/:id`
- `PUT /api/admin/clinics/:id/subscription`
- `GET /api/admin/leads`

(Die bestehenden Auth/Billing-Endpoints bleiben weiterhin im Backend vorhanden.)

## 6. Web Dashboard (Owner + Staff)

Im Dashboard kannst du:

- Login / Registrierung (Owner)
- Klinik-Branding pflegen (nur Owner)
- Staff-Mitglieder anlegen (nur Owner)
- Mobile Katalog pflegen (Kategorien, Treatments, Memberships, Rewards, Home-Artikel)
- Katalog JSON exportieren/importieren
- Kampagnen (Automation v1) anlegen und manuell starten
- Audit-Log der Änderungen sehen
- Billing-Status prüfen
- Stripe-Checkout starten (nur Owner)
- Klinik-Metriken sehen (aktive Sessions, Offer Views, Cart-Rate, Conversion, Umsatz, Top-Treatments)
- Membership-Metriken sehen (aktive Memberships, MRR)

Zusätzlich:

- Visueller Card-Editor unter `http://localhost:4173/catalog` (Owner-only)

Staff kann lesen, aber keine Owner-Aktionen ausführen.

## 7. Super-Admin Panel

Im Super-Admin-Panel kannst du:

- alle Kliniken zentral sehen
- nach Klinik/Owner suchen
- Klinikdetails + Mitglieder sehen
- Subscription-Status pro Klinik setzen
- Leads zentral einsehen

Wichtig: Ohne `SUPERADMIN_EMAIL` und `SUPERADMIN_PASSWORD` ist Login dort deaktiviert.

## 8. Mobile App starten

Siehe `mobile/README.md` fuer die komplette Anleitung.

Aktueller Stand:

- `mobile/App.js` = Patienten-App MVP (Dermis-inspiriert, Appointmentix Design)
- `mobile/AppAdminLegacy.js` = vorherige Admin-Mobile-App als Backup

Kurzfassung:

```bash
cd "/Users/valentinstrasser/Documents/New project/mobile"
npm install
npx expo start
```

## 9. PostgreSQL (Schritt 1)

Bisher nutzt das Projekt lokal die Datei-DB `clinicflow.db` (SQLite).

Mit PostgreSQL:

- laeuft die DB als eigener Server (stabiler fuer mehrere Kliniken/User)
- ist Hosting/Backups/Skalierung einfacher
- kannst du spaeter sauber auf Cloud deployen

Aktueller Stand:

- Wenn `DATABASE_URL` gesetzt ist, nutzt das Backend automatisch PostgreSQL.
- Wenn `DATABASE_URL` leer ist, bleibt es bei SQLite.

## 10. SQLite -> PostgreSQL Migration

Script:

- `scripts/migrate_sqlite_to_postgres.py`

Ausfuehren (Erstmigration, Zieltabellen werden geleert):

```bash
cd "/Users/valentinstrasser/Documents/New project"
source .venv/bin/activate
python3 scripts/migrate_sqlite_to_postgres.py --truncate
```

Danach Backend normal starten:

```bash
python3 server.py
```

## 11. One-Command Runtime Smoke-Test

Damit du den kompletten Kampagnenfluss schnell validierst:

1) **Terminal 1** (Backend starten):

```bash
cd "/Users/valentinstrasser/Documents/New project"
source .venv/bin/activate
python3 server.py
```

2) **Terminal 2** (Smoke-Test ausfuehren):

```bash
cd "/Users/valentinstrasser/Documents/New project"
scripts/smoke_runtime_campaigns.sh
```

Optional mit anderer API-URL:

```bash
scripts/smoke_runtime_campaigns.sh --base-url http://127.0.0.1:4181
```

Was getestet wird:

- Owner-Registrierung
- Public Analytics Event (Patientenprofil)
- Kampagne erstellen
- Kampagne ausfuehren
- Deliveries + Audit-Logs + Mobile Bundle
