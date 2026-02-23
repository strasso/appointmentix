#!/usr/bin/env bash
set -euo pipefail

BASE_URL="http://127.0.0.1:4173"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base-url)
      BASE_URL="${2:-}"
      shift 2
      ;;
    -h|--help)
      cat <<'USAGE'
Usage:
  scripts/smoke_runtime_campaigns.sh [--base-url http://127.0.0.1:4173]

Voraussetzung:
  Das Backend muss bereits laufen.

Was wird getestet:
  1) Owner-Registrierung
  2) Public Analytics Event (Patientenprofil)
  3) Kampagne erstellen
  4) Kampagne ausführen
  5) Deliveries/Audit/Bundle Endpoints abrufen
USAGE
      exit 0
      ;;
    *)
      echo "Unbekanntes Argument: $1" >&2
      exit 1
      ;;
  esac
done

if ! command -v curl >/dev/null 2>&1; then
  echo "Fehler: curl ist nicht installiert." >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "Fehler: python3 ist nicht installiert." >&2
  exit 1
fi

if ! curl -fsS "${BASE_URL}/api/health" >/dev/null; then
  echo "Fehler: Backend ist unter ${BASE_URL} nicht erreichbar." >&2
  echo "Starte zuerst den Server in Terminal 1:" >&2
  echo "  cd \"/Users/valentinstrasser/Documents/New project\"" >&2
  echo "  source .venv/bin/activate" >&2
  echo "  python3 server.py" >&2
  exit 1
fi

RAND="$(date +%s)"
CLINIC_NAME="Smoke Campaign Clinic ${RAND}"
OWNER_EMAIL="smoke_owner_${RAND}@appointmentix.test"
OWNER_PASSWORD="SmokePass123!"
PATIENT_EMAIL="smoke_patient_${RAND}@appointmentix.test"
OUT_DIR="/tmp/appointmentix_smoke_${RAND}"
COOKIE_FILE="${OUT_DIR}/cookie.txt"
mkdir -p "${OUT_DIR}"

cat > "${OUT_DIR}/register_payload.json" <<JSON
{"fullName":"Smoke Owner","clinicName":"${CLINIC_NAME}","email":"${OWNER_EMAIL}","password":"${OWNER_PASSWORD}"}
JSON

curl -sS -c "${COOKIE_FILE}" \
  -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  --data-binary @"${OUT_DIR}/register_payload.json" \
  > "${OUT_DIR}/register.json"

cat > "${OUT_DIR}/public_event_payload.json" <<JSON
{"clinicName":"${CLINIC_NAME}","eventName":"app_open","metadata":{"email":"${PATIENT_EMAIL}","name":"Smoke Patient","patientId":"patient_${RAND}"}}
JSON

curl -sS \
  -X POST "${BASE_URL}/api/analytics/public-event" \
  -H "Content-Type: application/json" \
  --data-binary @"${OUT_DIR}/public_event_payload.json" \
  > "${OUT_DIR}/public_event.json"

cat > "${OUT_DIR}/campaign_payload.json" <<'JSON'
{"name":"Welcome Boost","triggerType":"broadcast","channel":"in_app","status":"active","templateTitle":"Willkommen {{name}}","templateBody":"Hallo {{name}}, dein Willkommensvorteil wartet bei {{clinic}}.","pointsBonus":120}
JSON

curl -sS -b "${COOKIE_FILE}" \
  -X POST "${BASE_URL}/api/clinic/campaigns" \
  -H "Content-Type: application/json" \
  --data-binary @"${OUT_DIR}/campaign_payload.json" \
  > "${OUT_DIR}/campaign_create.json"

CAMPAIGN_ID="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["campaign"]["id"])' "${OUT_DIR}/campaign_create.json")"

curl -sS -b "${COOKIE_FILE}" \
  -X POST "${BASE_URL}/api/clinic/campaigns/${CAMPAIGN_ID}/run" \
  > "${OUT_DIR}/campaign_run.json"

curl -sS -b "${COOKIE_FILE}" \
  "${BASE_URL}/api/clinic/campaigns/${CAMPAIGN_ID}/deliveries?limit=20" \
  > "${OUT_DIR}/campaign_deliveries.json"

curl -sS -b "${COOKIE_FILE}" \
  "${BASE_URL}/api/clinic/audit-logs?limit=20" \
  > "${OUT_DIR}/audit_logs.json"

curl -sS -G \
  --data-urlencode "clinicName=${CLINIC_NAME}" \
  "${BASE_URL}/api/mobile/clinic-bundle" \
  > "${OUT_DIR}/mobile_bundle.json"

python3 - <<'PY' "${OUT_DIR}" "${CLINIC_NAME}" "${OWNER_EMAIL}" "${PATIENT_EMAIL}"
import json
import pathlib
import sys

out = pathlib.Path(sys.argv[1])
clinic_name = sys.argv[2]
owner_email = sys.argv[3]
patient_email = sys.argv[4]

register = json.loads((out / "register.json").read_text())
public_event = json.loads((out / "public_event.json").read_text())
campaign_create = json.loads((out / "campaign_create.json").read_text())
campaign_run = json.loads((out / "campaign_run.json").read_text())
deliveries = json.loads((out / "campaign_deliveries.json").read_text())
audit_logs = json.loads((out / "audit_logs.json").read_text())
bundle = json.loads((out / "mobile_bundle.json").read_text())

errors = []

user_email = (register.get("user") or {}).get("email")
if user_email != owner_email:
  errors.append("Owner-Registrierung fehlgeschlagen oder E-Mail stimmt nicht.")

if public_event.get("success") is not True:
  errors.append("Public Analytics Event wurde nicht erfolgreich gespeichert.")

campaign_id = ((campaign_create.get("campaign") or {}).get("id"))
if not isinstance(campaign_id, int):
  errors.append("Kampagne wurde nicht erstellt.")

run_payload = campaign_run.get("run") or {}
audience_count = run_payload.get("audienceCount")
delivery_summary = run_payload.get("delivery") or {}
if not isinstance(audience_count, int) or audience_count < 1:
  errors.append("Kampagnen-Run hatte keine Empfänger (erwartet >= 1).")

delivery_items = deliveries.get("deliveries") or []
if len(delivery_items) < 1:
  errors.append("Deliveries-Endpoint liefert keine Einträge.")

if not any(item.get("status") == "sent" for item in delivery_items):
  errors.append("Keine erfolgreiche Delivery gefunden.")

if not any(item.get("recipientKey") == patient_email for item in delivery_items):
  errors.append("Delivery für erwarteten Test-Patienten fehlt.")

actions = [row.get("action") for row in (audit_logs.get("logs") or [])]
if "campaign.created" not in actions or "campaign.run" not in actions:
  errors.append("Audit-Logs enthalten nicht sowohl campaign.created als auch campaign.run.")

bundle_clinic_name = (bundle.get("clinic") or {}).get("name")
if bundle_clinic_name != clinic_name:
  errors.append("Mobile Bundle Klinikname passt nicht.")

treatments_count = len((bundle.get("catalog") or {}).get("treatments") or [])
if treatments_count < 1:
  errors.append("Mobile Bundle enthält keine Treatments.")

print("SMOKE TEST REPORT")
print(f"- owner_email={owner_email}")
print(f"- clinic_name={clinic_name}")
print(f"- campaign_id={campaign_id}")
print(f"- audience_count={audience_count}")
print(f"- deliveries={len(delivery_items)}")
print(f"- audit_actions={actions[:8]}")
print(f"- bundle_treatments={treatments_count}")
print(f"- artifacts={out}")

if errors:
  print("\\nFAILED:")
  for message in errors:
    print(f"- {message}")
  raise SystemExit(1)

print("\\nPASS: Runtime-Kampagnenfluss funktioniert.")
PY
