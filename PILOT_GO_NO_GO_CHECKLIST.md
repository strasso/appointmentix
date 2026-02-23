# Appointmentix Pilot Go/No-Go Checkliste (DACH)

Ziel: **ehrliche Go-Entscheidung** fuer die ersten Pilot-Kliniken.  
Regel: **Wenn ein Blocker rot ist => No-Go**.

## 0) Setup (einmalig)

### Terminal A (Backend)
```bash
cd "/Users/valentinstrasser/Documents/New project"
source .venv/bin/activate
python3 server.py
```

### Terminal B (Mobile)
```bash
cd "/Users/valentinstrasser/Documents/New project/mobile"
npx expo start -c
```

### Terminal C (Checks)
```bash
cd "/Users/valentinstrasser/Documents/New project"
bash scripts/pilot_quick_check.sh --base-url http://127.0.0.1:4173
```

---

## 1) Blocker-Matrix (muss alles gruen sein)

### B1. Backend erreichbar + Kern-API ok
- **Check:**
  - `curl -sS http://127.0.0.1:4173/api/health`
  - `bash scripts/pilot_quick_check.sh --base-url http://127.0.0.1:4173`
- **Pass-Kriterium:** Health liefert `{"status":"ok"}` und Quick-Check endet mit `PASS`.
- **Status:** [ ] Gruen [ ] Rot

### B2. Auth + Session stabil
- **Check (manuell im Dashboard):**
  - `/dashboard` aufrufen
  - Owner registrieren
  - Logout/Login
  - Staff anlegen
- **Pass-Kriterium:** Keine 401/500 im Normalflow, Session bleibt stabil.
- **Status:** [ ] Gruen [ ] Rot

### B3. Mandantentrennung (Klinik A/B)
- **Check (manuell):**
  1. Klinik A Owner einloggen, Katalogtitel/Treatment-Name eindeutig setzen.
  2. Ausloggen, Klinik B Owner einloggen.
  3. Verifizieren, dass Klinik B Katalog unveraendert bleibt.
  4. App mit Klinik A verbinden, dann mit Klinik B verbinden.
- **Pass-Kriterium:** Keine Datenvermischung zwischen A/B.
- **Status:** [ ] Gruen [ ] Rot

### B4. Mobile Erstinbetriebnahme + Kliniksuche
- **Check (in App):**
  - Onboarding `Backend testen`
  - `Klinik suchen` und Klinik aus Liste waehlen
  - `Klinik verbinden`
- **Pass-Kriterium:** Kein `Network request failed` bei korrekter LAN-URL; Bundle wird geladen.
- **Status:** [ ] Gruen [ ] Rot

### B5. Kampagnen Runtime
- **Check:**
  - `scripts/smoke_runtime_campaigns.sh --base-url http://127.0.0.1:4173`
  - Dashboard: `Faellige ausfuehren` Button klicken
- **Pass-Kriterium:** Smoke `PASS`, Deliveries vorhanden, Audit Logs enthalten `campaign.created` + `campaign.run`.
- **Status:** [ ] Gruen [ ] Rot

### B6. Billing / Stripe (mind. Testmode vor Pilot, Live vor Skalierung)
- **Check Testmode:**
  - Dashboard: Checkout starten
  - Stripe Testkarte `4242 4242 4242 4242`
  - Webhook verarbeitet Event
- **Check Live (vor zahlenden Kunden):**
  - Live Keys gesetzt
  - Realer 1 EUR Test/Trial (oder kleinster Plan)
- **Pass-Kriterium:** Subscription-Status und Historie stimmen, keine Doppelbuchung.
- **Status:** [ ] Gruen [ ] Rot

### B7. Backup + Restore (Postgres)
- **Backup Check:**
```bash
docker exec -t appointmentix-pg pg_dump -U appointmentix -d appointmentix > /tmp/appointmentix_backup.sql
```
- **Restore Drill (separate DB):**
```bash
docker exec -i appointmentix-pg psql -U appointmentix -d appointmentix -c "CREATE DATABASE appointmentix_restore;"
docker exec -i appointmentix-pg psql -U appointmentix -d appointmentix_restore < /tmp/appointmentix_backup.sql
```
- **Pass-Kriterium:** Restore erfolgreich, Kern-Tabellen vorhanden, App laeuft danach normal.
- **Status:** [ ] Gruen [ ] Rot

### B8. Monitoring / Alerting (Minimum)
- **Check:**
  - Uptime-Check auf `/api/health`
  - Fehler-Tracking aktiv (z. B. Sentry oder Logging+Alerting)
  - Alarmweg (E-Mail/Slack) getestet
- **Pass-Kriterium:** Ein absichtlich erzeugter Fehler loest Alarm aus.
- **Status:** [ ] Gruen [ ] Rot

### B9. Rechtliches DACH
- **Check:**
  - Impressum
  - Datenschutz
  - AGB
  - AVV / Auftragsverarbeitung fuer B2B Kliniken
- **Pass-Kriterium:** Dokumente final, oeffentlich erreichbar, intern freigegeben.
- **Status:** [ ] Gruen [ ] Rot

### B10. App Release Readiness
- **Check:**
  - iOS Build + Android Build erfolgreich
  - 10 Pilot-Tester
  - Core-Flows ohne Blocker:
    - Onboarding
    - Klinik verbinden
    - Shop
    - Add to cart
    - Checkout
    - Rewards
- **Pass-Kriterium:** Keine P0/P1 Bugs offen.
- **Status:** [ ] Gruen [ ] Rot

---

## 2) Pilot-Start Entscheidung

- **GO:** Alle Blocker B1-B10 sind Gruen.
- **NO-GO:** Mindestens ein Blocker ist Rot.

---

## 3) 7-Tage Pilot Betriebsplan (nach GO)

### Tag 1
- 1 Klinik onboarden
- Daily Check: Health, Error-Logs, Stripe Webhook

### Tag 2-3
- Conversion-Funnel messen: App Open -> Add to Cart -> Checkout
- Reward-Nutzung monitoren

### Tag 4-5
- 2. Klinik onboarden
- Tenant-Isolation erneut pruefen

### Tag 6
- Billing-Reconciliation (Dashboard vs Stripe)

### Tag 7
- Pilot Retro: Bugs, Churn-Risiken, Feature-Priorisierung

---

## 4) Minimaler Go-Live Scope (realistisch)

Pflicht fuer Pilot:
- Login/Session stabil
- Kliniksuche + Onboarding stabil
- Katalog-Editor + Auto-Galerie stabil
- Kampagnenlauf stabil
- Stripe Testflow stabil
- Backup/Restore nachweislich erfolgreich

Kann nach Pilot folgen:
- erweiterte Animationen
- tiefere AI-Automation
- erweitertes Reporting
