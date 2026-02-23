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
  bash scripts/pilot_quick_check.sh [--base-url http://127.0.0.1:4173]

Was geprueft wird:
  1) Health Endpoint
  2) Mobile Klinik-Suche Endpoint
  3) Mobile Klinik-Bundle Endpoint
  4) Mobile OTP Request/Verify (lokaler Debug)
  5) Membership Aktivierung + Status Sync
  6) Cart/Add + Checkout Eventspur
  7) Runtime Campaign Smoke-Test
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
  echo "Fehler: curl fehlt." >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "Fehler: python3 fehlt." >&2
  exit 1
fi

json_field() {
  python3 - "$1" "$2" <<'PY'
import json,sys
payload = json.loads(sys.argv[1])
path = sys.argv[2].split(".")
value = payload
for part in path:
    if isinstance(value, dict):
        value = value.get(part)
    else:
        value = None
        break
if value is None:
    print("")
elif isinstance(value, (dict, list)):
    print(json.dumps(value))
else:
    print(str(value))
PY
}

echo "[1/7] Health pruefen ..."
HEALTH_RAW="$(curl -sS "${BASE_URL}/api/health")"
python3 - <<'PY' "${HEALTH_RAW}"
import json, sys
payload = json.loads(sys.argv[1])
if payload.get("status") != "ok":
    raise SystemExit("Health ist nicht ok.")
print("Health ok.")
PY

echo "[2/7] Klinik-Suche pruefen ..."
SEARCH_RAW="$(curl -sS "${BASE_URL}/api/mobile/clinics/search?query=milani&limit=5")"
python3 - <<'PY' "${SEARCH_RAW}"
import json, sys
payload = json.loads(sys.argv[1])
clinics = payload.get("clinics") or []
if not clinics:
    raise SystemExit("Klinik-Suche ohne Treffer.")
print(f"Klinik-Suche ok. Treffer: {len(clinics)}")
PY

CLINIC_NAME="$(python3 - <<'PY' "${SEARCH_RAW}"
import json,sys
payload=json.loads(sys.argv[1])
clinics=payload.get("clinics") or []
print(str((clinics[0] or {}).get("name") or "").strip())
PY
)"
if [[ -z "${CLINIC_NAME}" ]]; then
  echo "Fehler: clinicName konnte aus Suche nicht ermittelt werden." >&2
  exit 1
fi

echo "[3/7] Klinik-Bundle pruefen ..."
BUNDLE_RAW="$(curl -sS -G --data-urlencode "clinicName=${CLINIC_NAME}" "${BASE_URL}/api/mobile/clinic-bundle")"
python3 - <<'PY' "${BUNDLE_RAW}"
import json, sys
payload = json.loads(sys.argv[1])
catalog = payload.get("catalog") or {}
treatments = catalog.get("treatments") or []
if not treatments:
    raise SystemExit("Bundle ohne Treatments.")
print(f"Bundle ok. Treatments: {len(treatments)}")
PY

TREATMENT_ID="$(python3 - <<'PY' "${BUNDLE_RAW}"
import json,sys
payload=json.loads(sys.argv[1])
treatments=(payload.get("catalog") or {}).get("treatments") or []
first=treatments[0] if treatments else {}
print(str(first.get("id") or "").strip())
PY
)"
MEMBERSHIP_ID="$(python3 - <<'PY' "${BUNDLE_RAW}"
import json,sys
payload=json.loads(sys.argv[1])
memberships=(payload.get("catalog") or {}).get("memberships") or []
first=memberships[0] if memberships else {}
print(str(first.get("id") or "").strip())
PY
)"
if [[ -z "${TREATMENT_ID}" ]]; then
  echo "Fehler: treatmentId konnte aus Bundle nicht ermittelt werden." >&2
  exit 1
fi

echo "[4/7] Mobile OTP Request/Verify pruefen ..."
OTP_PHONE="+436641234567"
OTP_REQUEST_PAYLOAD="$(python3 - <<'PY' "${CLINIC_NAME}" "${OTP_PHONE}"
import json,sys
print(json.dumps({"clinicName":sys.argv[1], "phone":sys.argv[2]}))
PY
)"
OTP_REQUEST_RAW="$(curl -sS -X POST "${BASE_URL}/api/mobile/auth/otp/request" \
  -H "Content-Type: application/json" \
  -d "${OTP_REQUEST_PAYLOAD}")"
python3 - <<'PY' "${OTP_REQUEST_RAW}"
import json, sys
payload = json.loads(sys.argv[1])
if not payload.get("success"):
    code = str(payload.get("errorCode") or "").strip().upper()
    if code == "OTP_DELIVERY_FAILED":
        raise SystemExit(
            "OTP request fehlgeschlagen: SMS-Zustellung aktuell nicht moeglich "
            "(Twilio fehlt/ungueltig). Fuer lokalen Test MOBILE_OTP_DEBUG=true setzen."
        )
    raise SystemExit(f"OTP request fehlgeschlagen: {payload}")
request_id = str(payload.get("requestId") or "").strip()
debug_code = str(payload.get("debugCode") or "").strip()
if not request_id:
    raise SystemExit("OTP requestId fehlt.")
if not debug_code:
    raise SystemExit("OTP debugCode fehlt. Fuer lokalen Smoke-Test MOBILE_OTP_DEBUG=true setzen.")
print("OTP request ok.")
PY
OTP_REQUEST_ID="$(json_field "${OTP_REQUEST_RAW}" "requestId")"
OTP_DEBUG_CODE="$(json_field "${OTP_REQUEST_RAW}" "debugCode")"

OTP_VERIFY_PAYLOAD="$(python3 - <<'PY' "${CLINIC_NAME}" "${OTP_PHONE}" "${OTP_REQUEST_ID}" "${OTP_DEBUG_CODE}"
import json,sys
print(json.dumps({
    "clinicName": sys.argv[1],
    "phone": sys.argv[2],
    "requestId": sys.argv[3],
    "code": sys.argv[4],
}))
PY
)"
OTP_VERIFY_RAW="$(curl -sS -X POST "${BASE_URL}/api/mobile/auth/otp/verify" \
  -H "Content-Type: application/json" \
  -d "${OTP_VERIFY_PAYLOAD}")"
python3 - <<'PY' "${OTP_VERIFY_RAW}"
import json, sys
payload = json.loads(sys.argv[1])
if not payload.get("success"):
    raise SystemExit(f"OTP verify fehlgeschlagen: {payload}")
if payload.get("isGuest") is not False:
    raise SystemExit("OTP verify sollte einen nicht-Gast Login liefern.")
member_email = str(payload.get("memberEmail") or "").strip()
if "@" not in member_email:
    raise SystemExit("OTP verify ohne memberEmail.")
print("OTP verify ok.")
PY
MEMBER_EMAIL="$(json_field "${OTP_VERIFY_RAW}" "memberEmail")"
MEMBER_NAME="$(json_field "${OTP_VERIFY_RAW}" "memberName")"
if [[ -z "${MEMBER_NAME}" ]]; then
  MEMBER_NAME="Pilot User"
fi

echo "[5/7] Membership Aktivierung + Status Sync pruefen ..."
if [[ -n "${MEMBERSHIP_ID}" ]]; then
  MEMBERSHIP_ACTIVATE_PAYLOAD="$(python3 - <<'PY' "${CLINIC_NAME}" "${MEMBER_EMAIL}" "${MEMBER_NAME}" "${MEMBERSHIP_ID}"
import json,sys
print(json.dumps({
    "clinicName": sys.argv[1],
    "memberEmail": sys.argv[2],
    "memberName": sys.argv[3],
    "membershipId": sys.argv[4],
    "paymentStatus": "paid",
}))
PY
)"
  MEMBERSHIP_ACTIVATE_RAW="$(curl -sS -X POST "${BASE_URL}/api/mobile/membership/activate" \
    -H "Content-Type: application/json" \
    -d "${MEMBERSHIP_ACTIVATE_PAYLOAD}")"
  python3 - <<'PY' "${MEMBERSHIP_ACTIVATE_RAW}" "${MEMBERSHIP_ID}"
import json,sys
payload=json.loads(sys.argv[1])
expected_id=sys.argv[2]
if not payload.get("success"):
    raise SystemExit(f"Membership aktivieren fehlgeschlagen: {payload}")
membership=payload.get("membership") or {}
status=str(membership.get("status") or "").strip().lower()
if status not in {"active","past_due"}:
    raise SystemExit(f"Unerwarteter Membership-Status nach Aktivierung: {status}")
if str(membership.get("membershipId") or "").strip() != expected_id:
    raise SystemExit("Aktive Membership-ID stimmt nicht.")
print("Membership Aktivierung ok.")
PY
else
  echo "Hinweis: Keine Membership im Katalog gefunden. Schritt wird uebersprungen."
fi

MEMBERSHIP_STATUS_RAW="$(curl -sS -G \
  --data-urlencode "clinicName=${CLINIC_NAME}" \
  --data-urlencode "memberEmail=${MEMBER_EMAIL}" \
  "${BASE_URL}/api/mobile/membership/status")"
python3 - <<'PY' "${MEMBERSHIP_STATUS_RAW}"
import json,sys
payload=json.loads(sys.argv[1])
membership=payload.get("membership")
if membership is None:
    raise SystemExit("Membership status liefert None.")
status=str(membership.get("status") or "").strip().lower()
if status not in {"active","past_due","canceled","paused","inactive"}:
    raise SystemExit(f"Ungueltiger Membership-Status: {status}")
print(f"Membership status ok: {status}")
PY

echo "[6/7] Cart/Add + Checkout Eventspur pruefen ..."
CART_ADD_PAYLOAD="$(python3 - <<'PY' "${CLINIC_NAME}" "${TREATMENT_ID}" "${MEMBER_EMAIL}"
import json,sys
print(json.dumps({
    "clinicName": sys.argv[1],
    "treatmentId": sys.argv[2],
    "memberEmail": sys.argv[3],
    "sessionId": "pilot_quick_check",
    "units": 2,
}))
PY
)"
CART_ADD_RAW="$(curl -sS -X POST "${BASE_URL}/api/mobile/cart/add" \
  -H "Content-Type: application/json" \
  -d "${CART_ADD_PAYLOAD}")"
python3 - <<'PY' "${CART_ADD_RAW}"
import json,sys
payload=json.loads(sys.argv[1])
if not payload.get("success"):
    raise SystemExit(f"Cart add fehlgeschlagen: {payload}")
line=payload.get("lineItem") or {}
if not str(line.get("treatmentId") or "").strip():
    raise SystemExit("Cart add ohne treatmentId.")
units=int(line.get("units") or 0)
if units < 1:
    raise SystemExit("Cart add mit ungueltiger units-Anzahl.")
print("Cart add ok.")
PY

CHECKOUT_PAYLOAD="$(python3 - <<'PY' "${CLINIC_NAME}" "${TREATMENT_ID}" "${MEMBER_EMAIL}"
import json,sys
print(json.dumps({
    "clinicName": sys.argv[1],
    "memberEmail": sys.argv[3],
    "sessionId": "pilot_quick_check",
    "paymentStatus": "paid",
    "cartItems": [{"treatmentId": sys.argv[2], "units": 2}],
}))
PY
)"
CHECKOUT_RAW="$(curl -sS -X POST "${BASE_URL}/api/mobile/checkout/complete" \
  -H "Content-Type: application/json" \
  -d "${CHECKOUT_PAYLOAD}")"
python3 - <<'PY' "${CHECKOUT_RAW}"
import json,sys
payload=json.loads(sys.argv[1])
if not payload.get("success"):
    raise SystemExit(f"Checkout fehlgeschlagen: {payload}")
order_id=str(payload.get("orderId") or "").strip()
if not order_id:
    raise SystemExit("Checkout ohne orderId.")
line_items=payload.get("lineItems") or []
if not line_items:
    raise SystemExit("Checkout ohne lineItems.")
earned=int(payload.get("earnedPoints") or 0)
print(f"Checkout ok. orderId={order_id}, earnedPoints={earned}")
PY

echo "[7/7] Runtime-Kampagnen Smoke ..."
bash scripts/smoke_runtime_campaigns.sh --base-url "${BASE_URL}"

echo
echo "PASS: pilot_quick_check abgeschlossen."
