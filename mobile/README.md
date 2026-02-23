# Appointmentix Mobile (Patienten-App MVP)

Dermis-inspirierte Patienten-App fuer MedSpa-Kliniken mit eigenem Appointmentix Design.

## Enthaltene MVP-Module

- Home Feed (Angebote, Finanzierungshinweis, Contentkarten)
- Shop mit 3 Bereichen: Browse, Membership, Treatments
- Treatment Detail inkl. Plan-Auswahl + Warenkorb
- Memberships (Silber / Gold)
- Scan Tab (Check-in Demo + Reward-Bonus)
- Rewards (Punkte sammeln + einloesen)
- Profil (Behandlungen, Membership, Einstellungen)
- Optionales Live-Tracking in das Backend fuer Klinik-Metriken
- Laden von Klinikdaten aus dem Backend (`/api/mobile/clinic-bundle`)
- Erstinbetriebnahme-Screen mit Klinik-Suche (`/api/mobile/clinics/search`)
- Phone-OTP Login (`/api/mobile/auth/otp/request` + `/api/mobile/auth/otp/verify` + `/api/mobile/auth/otp/resend`)
- Serverseitiger Cart-/Checkout-Flow (`/api/mobile/cart/add` + `/api/mobile/checkout/complete`)
- Membership Preislogik + Status-Sync ueber Backend (paid/past_due/canceled)
- Haptik/Vibration bei wichtigen Interaktionen
- Sanfte Tab-Transition Animationen
- Auto-Galerie pro Treatment (keyword-basiert, backend-seitig)

## Beispielklinik + Datenbasis

- Moser Milani Medical Spa (Wien)
- Treatments und Preisanker basieren auf:
  - milani.at/treatments
  - MOMI_Preisliste25_REV02.pdf

## Start lokal

```bash
cd "/Users/valentinstrasser/Documents/New project/mobile"
npm install
npx expo start -c
```

Dann in Expo Go oeffnen.

## Live-Metriken verbinden

1. In der App auf `Profil -> Einstellungen` gehen
2. Unter `Live-Metriken verbinden` die Backend-URL eintragen
   - lokal z. B. `http://192.168.x.x:4173`
3. `Backend verbinden` tippen
4. Optional vorab `Backend testen` tippen (Health-Check)

Danach werden App-Events (Views, Add-to-Cart, Kauf, Membership, Rewards) an das Backend gesendet.
Bei aktivem Backend laufen Add-to-Cart und Checkout serverseitig, inkl. produktiver Eventspur (`event_source=patient_app_checkout`).

## Klinik-Onboarding (Patientenflow)

1. Klinik nach Name suchen oder QR-/Referral-Code eingeben
2. Klinik auswählen
3. Telefonnummer eingeben
4. SMS-Code anfordern und bestätigen
5. Alternativ: `Als Gast fortfahren`

## OTP-Betriebsmodi

### Lokale Entwicklung (Debug)

- `MOBILE_OTP_DEBUG=true`
- OTP-Code wird als `debugCode` vom Backend im API-Response zurückgegeben.
- Die App zeigt den Code als Inline-Hinweis (kein blockierendes Popup).
- Cooldown/Resend wird trotzdem geprüft.

### Produktion (SMS live)

- `MOBILE_OTP_DEBUG=false`
- Twilio ist Pflicht (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`).
- Kein `debugCode` im Response.
- Fehlercodes vom Backend:
  - `OTP_COOLDOWN`
  - `OTP_INVALID`
  - `OTP_EXPIRED`
  - `OTP_ATTEMPTS_EXCEEDED`
  - `OTP_REQUEST_NOT_FOUND`

### OTP UX-Verhalten (App)

- Kein iOS-Alert mehr fuer Debug-Code.
- Inline-Statusmeldungen mit Cooldown-Countdown.
- `Code neu senden` nutzt den Endpoint `/api/mobile/auth/otp/resend`.
- Backend-URL im Onboarding ist standardmaessig eingeklappt und nur im Technik-Bereich sichtbar.

## Checkout + Membership Sync

- `In den Warenkorb` ruft bei aktiver Verbindung zuerst `/api/mobile/cart/add` auf.
- Preise werden serverseitig anhand von Membership-Status berechnet:
  - `standard`
  - `member`
  - `included` (0 EUR bei inkludiertem Treatment)
- `Jetzt bezahlen` ruft `/api/mobile/checkout/complete` auf.
- Nach Checkout werden Membership-Status und Payment-Status serverseitig synchronisiert.
- Offline-Demo bleibt weiterhin moeglich (lokaler Fallback ohne Backend).

## Klinikdaten laden (White-Label Demo)

1. In der App auf `Profil -> Einstellungen` gehen
2. Backend-URL eintragen (wie oben)
3. Klinikname eintragen, z. B. `Moser Milani Medical Spa`
4. `Backend verbinden` oder `Klinikdaten neu laden` tippen

Damit kommen Treatments, Memberships, Rewards und Home-Artikel aus dem Backend pro Klinik.

## Bilder in Treatments

- Im visuellen Editor (`/catalog`) kannst du jetzt Bilder hochladen.
- Danach im Treatment die Bild-URL setzen (oder direkt "Bild hochladen" im Treatment-Card Editor verwenden).
- In der Mobile App erscheinen diese Bilder in der Kartenansicht und im Detailscreen.

## Hinweis

Die vorherige Admin-Mobile-App wurde gesichert als:

- `AppAdminLegacy.js`

Falls du sie wieder brauchst, kann ich sie in ein separates Projekt (`mobile-admin/`) auslagern.
