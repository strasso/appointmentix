# Curabo — Go-Live / Deployment

Kurz-Runbook, um das Curabo-Backend live zu bringen. Der App-Code ist deploy-fertig
(Gunicorn + Postgres + Env-Config + Reverse-Proxy-Härtung). Es geht hier nur um die
Infrastruktur drumherum.

## Was wohin
- **Vertriebs-Website (curabo.app)** → bleibt bei united-domains (PHP-Webspace reicht dafür).
- **App-Backend (dieses Repo, Python/Flask)** → **eigener Server**. united-domains-Webspace
  kann das NICHT (kein Python-Daemon, kein Postgres). Optionen:
  - **Hetzner Cloud** (EU/DE, DSGVO): CX22 ~€4–6/Mon. *(empfohlen für stabiles Live-Business —
    vorhersehbar, simpel.)*
  - **Oracle Cloud (OCI) Always Free**: ARM A1 bis 4 vCPU / 24 GB / 200 GB Storage = **€0**,
    Region Frankfurt für EU. *(billigste Option; Haken: A1-Kapazität oft "out of capacity"
    beim Anlegen, Oracle reklamiert Gratis-Accounts gelegentlich → gut für Pilot, fürs
    Business riskanter. Keine Gratis-Postgres → Postgres selbst auf der VM.)*
  - **netcup** (DE, Standort Wien): VPS ~€3–6/Mon — bestes Preis-Leistung in DACH.
  - **Exoscale** (AT, Zone Wien): ~€5–10/Mon, saubere Console, DSGVO.
  - **Scaleway** (FR/EU): ~€5–8/Mon, moderne Console/DX.
  - Alternativ Render / Fly.io / Railway in einer **EU-Region** (Procfile wird direkt genutzt).
  - Ein VPS mit ~2 vCPU / 4 GB RAM reicht für den MVP locker. *(Preise ungefähr.)*

## 1. Datenbank: SQLite → Postgres
SQLite ist nur für lokal. Live → Postgres (Code unterstützt es via `psycopg`):
- Managed (Hetzner-Postgres-Addon, Supabase EU, Neon EU) **oder** Postgres direkt auf dem VPS.
- Setze `DATABASE_URL=postgresql://user:pass@host:5432/curabo`.
- Beim ersten Start legt der Code alle Tabellen automatisch an (`init_db()` + Migrationen).

## 2. Code + Env
```bash
git clone <repo> && cd curabo
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
cp .env.example .env   # dann ausfüllen
```
**Pflicht-Variablen** in `.env`:
| Var | Wert |
|---|---|
| `APP_SECRET_KEY` | langer Zufallswert (`python -c "import secrets;print(secrets.token_hex(32))"`) |
| `DATABASE_URL` | Postgres-URL (s. o.) |
| `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` | aus dem Stripe-Dashboard |
| `RESEND_API_KEY` + `RESEND_FROM_EMAIL` | für Team-/Kunden-E-Mails (Resend, EU-Versand möglich) |
| `AUTOMATION_RUNNER_SECRET` | langer Zufallswert (schützt den Cron-Endpoint) |
| `SESSION_COOKIE_SECURE` | `true` (läuft hinter HTTPS) |
| `TRUST_PROXY` | `true` (läuft hinter Reverse Proxy) |

Optional: `TWILIO_*` (SMS), `ONESIGNAL_*` (App-Push). Slack & Kalender-Abo brauchen **keinen**
globalen Key — die stellt jede Klinik selbst in ihren Einstellungen ein.

## 3. Starten (Gunicorn)
Das `Procfile` ist gesetzt: `web: gunicorn ... wsgi:app`.
- **PaaS (Render/Fly):** nutzt das Procfile automatisch.
- **VPS:** als systemd-Service laufen lassen, z. B.
  `gunicorn --workers 2 --threads 4 --bind 127.0.0.1:4173 wsgi:app`

## 4. Reverse Proxy + HTTPS
Caddy (Auto-HTTPS, am einfachsten) oder nginx + certbot vor Gunicorn:
```
api.curabo.app {
    reverse_proxy 127.0.0.1:4173
}
```

## 5. DNS (bei united-domains)
A/AAAA-Record **`api.curabo.app` → Server-IP**. Domain bleibt bei united-domains, nur die
Subdomain zeigt auf den App-Server.

## 6. Stripe-Webhook
Im Stripe-Dashboard Endpoint `https://api.curabo.app/api/payments/webhook` eintragen,
das Signing-Secret als `STRIPE_WEBHOOK_SECRET` setzen.

## 7. Cron für fällige Kampagnen
Alle 5–15 Min den geschützten Endpoint anstoßen (Host-Cron oder z. B. cron-job.org):
```bash
curl -fsS -X POST "https://api.curabo.app/api/system/campaigns/run-due" \
  -H "X-Automation-Secret: $AUTOMATION_RUNNER_SECRET"
```

## 8. Uploads / Bilder
Treatment-/Produktbilder liegen unter `uploads/` (lokale Platte).
- **VPS mit persistenter Platte:** passt so.
- **Ephemeres PaaS ohne Volume (Render/Fly):** Object Storage (Cloudflare R2 / S3) nötig —
  separater Ausbauschritt, noch nicht umgesetzt.

## 9. Kosten (grob, EU, MVP)
VPS ~€5–8 · Postgres €0 (auf dem VPS) bis ~€15 (managed) · Resend gratis-Tier ·
Push/Slack/Kalender gratis · Domain läuft schon → **~€5–20/Monat gesamt**, geteilt über
**alle** Kliniken (Multi-Tenant, nicht pro Klinik).

## Checkliste vor dem ersten echten Kunden
- [ ] `DATABASE_URL` zeigt auf Postgres (nicht SQLite)
- [ ] `APP_SECRET_KEY`, `AUTOMATION_RUNNER_SECRET` gesetzt (lang & zufällig)
- [ ] `SESSION_COOKIE_SECURE=true`, `TRUST_PROXY=true`
- [ ] HTTPS aktiv (Caddy/nginx)
- [ ] Stripe-Webhook + `STRIPE_WEBHOOK_SECRET` gesetzt
- [ ] `RESEND_API_KEY` + verifizierte Absender-Domain
- [ ] Cron für `run-due` eingerichtet
- [ ] AVV/DSGVO mit Hoster, Stripe, Resend abgeschlossen
