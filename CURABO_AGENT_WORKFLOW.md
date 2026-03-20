# Curabo Agent Workflow

## Ziel
Curabo soll mit mehreren klar getrennten Arbeitsstraengen entwickelt werden, ohne dass sich parallele Aenderungen gegenseitig blockieren oder ueberschreiben.

Dieses Dokument definiert:
- die sinnvollsten Agenten-/Thread-Rollen
- Datei-Ownership
- Regeln fuer paralleles Arbeiten
- die naechsten Architekturverbesserungen fuer bessere Parallelisierung

## Grundprinzip
Ein Hauptthread orchestriert. Alle anderen Threads oder Agents arbeiten nur in klar abgegrenzten Write-Scopes.

Wichtig:
- Ein File hat immer genau einen aktiven Owner pro Arbeitsphase.
- Keine parallelen Aenderungen an denselben Kernfiles.
- UI, Funktion, Backend und QA duerfen parallel laufen, wenn die Write-Scopes disjunkt sind.

## Empfohlene Struktur

### 1. Orchestrator
Verantwortung:
- priorisiert Aufgaben
- definiert Ownership
- integriert Ergebnisse
- prueft Endzustand
- entscheidet bei Konflikten

Write-Scope:
- kein fester Scope
- darf nur integrieren oder koordinieren

Typische Aufgaben:
- Sprint-Fokus setzen
- Aufgaben schneiden
- Merge-/Integrationsreihenfolge festlegen
- finale Review

### 2. Website / Marketing Surface
Verantwortung:
- Landingpage
- Marketing-Website
- Conversion-Flow
- Brand-Präsentation

Write-Scope:
- `index.html`
- `styles.css`
- `app.js`
- optional Marketing-/Launch-Dokumente

Darf parallel laufen mit:
- Backend
- Mobile
- Dashboard/Admin

Darf nicht parallel dieselben Files teilen mit:
- niemandem

### 3. Dashboard / Admin Surface
Verantwortung:
- Klinik-Dashboard
- Admin/Superadmin
- Katalog-Editor
- Datenvisualisierung und Desktop-UX

Write-Scope:
- `dashboard.html`
- `dashboard.css`
- `dashboard.js`
- `admin.html`
- `admin.css`
- `admin.js`
- `catalog.html`
- `catalog.css`
- `catalog.js`

Darf parallel laufen mit:
- Website
- Mobile
- Backend, solange API-Vertraege stabil bleiben

Sonderregel:
- Wenn API-Antworten oder Datenformate geaendert werden muessen, zuerst mit Backend koordinieren

### 4. Mobile App Surface
Verantwortung:
- Patienten-App UI
- mobile UX
- patientenseitige Flows
- White-label-Erlebnis in der App

Write-Scope:
- `mobile/App.js`
- `mobile/app.json`
- spaeter `mobile/src/**`, sobald aufgeteilt

Wichtig:
- `mobile/App.js` ist aktuell ein Monolith
- Design- und Funktionsarbeit an dieser Datei sollte nicht parallel passieren

Deshalb:
- Entweder `Design Pass`
- Oder `Function Pass`
- Aber nicht gleichzeitig zwei Agents auf `mobile/App.js`

### 5. Backend / Platform
Verantwortung:
- API
- Auth
- OTP
- Multi-Tenant-Logik
- Stripe
- Klinik-Bundles
- Datenmodell und Infrastruktur

Write-Scope:
- `server.py`
- `wsgi.py`
- `requirements.txt`
- `render.yaml`
- `scripts/**`

Wichtig:
- `server.py` ist aktuell ebenfalls ein Monolith
- keine zwei Backend-Agents gleichzeitig an `server.py`

### 6. QA / Review / Release
Verantwortung:
- Smoke-Tests
- Regressionspruefung
- UI-Konsistenzpruefung
- Go-/No-Go-Checks

Write-Scope:
- im Normalfall read-only
- optional:
  - `PILOT_GO_NO_GO_CHECKLIST.md`
  - `scripts/**`
  - Test-/QA-Dokumente

Aufgabe:
- nie Haupt-Implementierungsowner
- sondern parallel pruefender Sidecar-Thread

## Beste Parallelisierung fuer Curabo heute

### Sichere Parallel-Kombinationen
- Website + Backend
- Website + Mobile
- Website + Dashboard/Admin
- Dashboard/Admin + Backend
- Dashboard/Admin + Mobile
- QA parallel zu allen anderen

### Unsichere Kombinationen
- Design-Agent und Function-Agent gleichzeitig auf `mobile/App.js`
- zwei Backend-Agents gleichzeitig auf `server.py`
- zwei Agents gleichzeitig auf derselben HTML/CSS/JS-Oberflaeche

## Praktisches Arbeitsmodell

### Modell A: 4 aktive Straenge
Empfohlen fuer normale Weiterentwicklung.

1. Orchestrator
2. Website
3. Dashboard/Admin
4. Mobile
5. Backend

QA laeuft als Nebenstrang oder in Review-Phasen.

### Modell B: 3 aktive Straenge
Empfohlen bei hohem Risiko oder groesseren Umbauten.

1. Orchestrator
2. Frontend Surface Thread
   - besitzt genau eine Flaeche gleichzeitig: Website oder Dashboard oder Mobile
3. Backend Thread
4. QA Thread

Dieses Modell ist langsamer, aber sicherer.

## Ownership-Regeln

### Regel 1
Ein Agent bekommt immer konkrete Dateien, nicht nur ein Thema.

Schlecht:
- "Arbeite an Mobile UX"

Gut:
- "Du besitzt `mobile/App.js` fuer den visuellen Onboarding- und Home-Polish."

### Regel 2
Wenn ein Task mehrere Kernfiles beruehrt, wird er geschnitten.

Beispiel:
- Backend fuegt API-Feld hinzu
- Dashboard nutzt Feld danach
- Mobile nutzt Feld danach

Nicht:
- alle drei gleichzeitig dieselbe Annahme umsetzen

### Regel 3
Monolith-Dateien werden seriell bearbeitet.

Aktuell betrifft das vor allem:
- `mobile/App.js`
- `server.py`

## Empfohlene Task-Zuschnitte

### Gute Sidecar-Tasks fuer Agents
- Website-Hero ueberarbeiten
- Dashboard-Typografie verfeinern
- Admin-Tabellen lesbarer machen
- Mobile-Screen auditieren
- Backend-Smoke-Tests schreiben
- QA auf Reward-/Checkout-Flows

### Schlechte Agent-Tasks
- "Mach das ganze Produkt besser"
- "Arbeite an Mobile und Backend gleichzeitig"
- "Verbessere UI und aendere dabei auch gleich Logik in denselben Monolith-Files"

## Naechste Strukturverbesserungen

### Mobile
Mittelfristig aufteilen:
- `mobile/src/screens/HomeScreen.js`
- `mobile/src/screens/ShopScreen.js`
- `mobile/src/screens/RewardsScreen.js`
- `mobile/src/screens/ProfileScreen.js`
- `mobile/src/screens/OnboardingScreen.js`
- `mobile/src/theme/tokens.js`
- `mobile/src/components/**`

Nutzen:
- Design- und Funktionsarbeit werden besser trennbar
- mehrere Mobile-Agents koennen spaeter parallel arbeiten

### Backend
Mittelfristig aufteilen:
- `server/auth.py`
- `server/mobile.py`
- `server/clinic.py`
- `server/admin.py`
- `server/billing.py`
- `server/catalog.py`

Nutzen:
- Features lassen sich sauberer parallel entwickeln
- geringeres Risiko in `server.py`

## Konkrete Empfehlung fuer Curabo jetzt

### Standardmodus
- 1 Orchestrator
- 1 Website-Agent
- 1 Dashboard/Admin-Agent
- 1 Mobile-Agent
- 1 Backend-Agent
- 1 QA-Agent bei Bedarf

### Sonderregel fuer aktuelle Monolithen
- `mobile/App.js` nie doppelt besetzen
- `server.py` nie doppelt besetzen

### Reihenfolge bei abhängigen Tasks
1. Backend
2. Surface-Integration
3. QA
4. finaler Integrationspass

## Current Phase Recommendation

Stand: Maerz 2026

Diese Aufteilung ist fuer den aktuellen Curabo-Zustand die sinnvollste naechste Arbeitsweise.

### Thread 1: Mobile Product Surface
Ziel:
- Patienten-App optisch auf Premium-Niveau bringen
- White-label-Erlebnis in der App staerken
- Onboarding, Home, Shop, Rewards und Profil konsistent machen

Ownership:
- `mobile/App.js`
- `mobile/app.json`

Wichtig:
- Dieser Thread besitzt waehrend einer Phase exklusiv `mobile/App.js`
- Kein zweiter Agent fuer Mobile-Logik oder Mobile-Design parallel auf derselben Datei

Aktuelle Prioritaeten:
- weiterer UI-/UX-Polish
- bessere Screen-Hierarchie
- White-label-Darstellung pro Klinik
- Vorbereitung fuer spaetere Dateiaufteilung in `mobile/src/**`

### Thread 2: Backend / Clinic Platform
Ziel:
- stabile Klinik-Bundles
- OTP/SMS-Haertung
- White-label-Daten sauber ausliefern
- Stripe-/Membership-/Catalog-Flows stabilisieren

Ownership:
- `server.py`
- `wsgi.py`
- `requirements.txt`
- `scripts/**`

Aktuelle Prioritaeten:
- mobile clinic bundle
- OTP-Flow Produktionshaertung
- Datenqualitaet fuer Klinikprofil, Logo, Farben, Katalog
- API-Stabilitaet fuer Mobile und Dashboard

Wichtig:
- exklusiver Owner von `server.py`

### Thread 3: Dashboard / Admin / Catalog
Ziel:
- Klinik-Dashboard, Admin und Catalog-Editor visuell und funktional aufraeumen
- Desktop-Qualitaet und Klarheit deutlich steigern

Ownership:
- `dashboard.html`
- `dashboard.css`
- `dashboard.js`
- `admin.html`
- `admin.css`
- `admin.js`
- `catalog.html`
- `catalog.css`
- `catalog.js`

Aktuelle Prioritaeten:
- visuelle Konsistenz
- bessere Datenlesbarkeit
- staerkere Typografie
- klinikseitige White-label- und Catalog-Pflege angenehmer machen

### Thread 4: Website / Marketing
Ziel:
- Curabo als starke Marke praesentieren
- Website und Produktpositionierung schaerfen
- Conversion verbessern

Ownership:
- `index.html`
- `styles.css`
- `app.js`

Aktuelle Prioritaeten:
- klarere Produktstory
- Premium-Markenwirkung
- DACH-Medspa-Relevanz
- bessere Verbindung zwischen Curabo Brand und White-label Nutzen

### Thread 5: QA / Release Sidecar
Ziel:
- Regressionen frueh sehen
- Smoke-Flows absichern
- Oberflaechen und Kernrouten schnell pruefen

Ownership:
- primaer read-only
- optional `PILOT_GO_NO_GO_CHECKLIST.md`
- optional `scripts/**`

Aktuelle Prioritaeten:
- Mobile Smoke
- Dashboard/Admin Smoke
- API-/Health-Pruefung
- Membership-/Checkout-/OTP-Kernpfade

## Empfohlene Ausfuehrungsreihenfolge

### Modus A: Parallel mit 5 Straengen
Nutzen, wenn mehrere Agents aktiv sind.

1. Thread 2 Backend arbeitet an API-/Datenbasis
2. Thread 1 Mobile arbeitet parallel an UI-/UX, solange keine neue Backend-Antwortform benoetigt wird
3. Thread 3 Dashboard/Admin arbeitet parallel an Desktop-Surfaces
4. Thread 4 Website arbeitet parallel an Marketing-Surface
5. Thread 5 QA prueft Sidecar-maessig die stabilen Teile

### Modus B: Sicherer Fokusmodus
Nutzen, wenn eine Kernflaeche stark umgebaut wird.

1. Backend
2. genau eine Surface gleichzeitig
3. QA
4. Integrationspass

## Aktuell beste konkrete Agenten-Aufteilung

### Agent A: Mobile Design / UX
Besitzt:
- `mobile/App.js`

Auftrag:
- nur visuelle und UX-bezogene Verbesserungen
- keine Backend-Aenderungen

### Agent B: Backend / Platform
Besitzt:
- `server.py`
- `scripts/**`

Auftrag:
- OTP, clinic bundle, memberships, billing-nahe API-Stabilitaet

### Agent C: Dashboard / Admin Surface
Besitzt:
- `dashboard.*`
- `admin.*`
- `catalog.*`

Auftrag:
- Desktop-Qualitaet, Datenlesbarkeit, White-label-Pflege

### Agent D: Website / Marketing
Besitzt:
- `index.html`
- `styles.css`
- `app.js`

Auftrag:
- Story, Conversion, Curabo-Markenwirkung

### Agent E: QA / Review
Besitzt:
- im Regelfall keine Kern-Produktfiles

Auftrag:
- Smoke-Tests
- Regressionspruefung
- Release-Risiken frueh melden

## Was ich fuer den naechsten Sprint empfehlen wuerde

### Sprint-Fokus 1
Mobile + Backend

Warum:
- die Patienten-App ist die sichtbarste Produktflaeche
- sie haengt direkt von stabilen Klinik-Bundles, OTP und Membership-Logik ab

### Sprint-Fokus 2
Dashboard/Admin

Warum:
- Klinik-Teams muessen White-label Daten, Katalog und operative Inhalte sauber pflegen koennen

### Sprint-Fokus 3
Website

Warum:
- wichtig fuer Marke und Vertrieb
- aber weniger blockierend fuer die Produktkernfunktion als Mobile + Backend

## Kurz gesagt fuer den Alltag

Wenn du mehrere Agents aktiv nutzt, dann aktuell am besten so:
- 1 Agent Mobile
- 1 Agent Backend
- 1 Agent Dashboard/Admin
- 1 Agent Website
- 1 Agent QA
- 1 Hauptthread als Orchestrator

Nicht tun:
- zwei Agents gleichzeitig auf `mobile/App.js`
- zwei Agents gleichzeitig auf `server.py`
- einen Agent gleichzeitig fuer Design und Logik auf derselben Monolith-Datei laufen lassen

## Active Round 1

### Laufende Zuteilung
- `Hume` -> Mobile Design / UX
  - Ownership: `mobile/App.js`, `mobile/app.json`
- `Archimedes` -> Backend / Platform
  - Ownership: `server.py`, `wsgi.py`, `requirements.txt`, `scripts/**`
- `Singer` -> Dashboard / Admin / Catalog
  - Ownership: `dashboard.*`, `admin.*`, `catalog.*`
- `Noether` -> Website / Marketing
  - Ownership: `index.html`, `styles.css`, `app.js`
- `Mencius` -> QA / Review
  - Read-only smoke matrix and regression risks

### Integrationsreihenfolge fuer diese Runde
1. Backend
2. Mobile
3. Dashboard / Admin / Catalog
4. Website
5. QA-Review und finaler Integrationspass

### Erfolgsbild fuer Runde 1
- Mobile wirkt deutlich reifer und konsistenter
- Backend liefert stabile White-label- und Mobile-Daten
- Dashboard/Admin/Catalog naehern sich einem kohärenten Premium-Desktop-Look
- Website kommuniziert Curabo klarer als White-label Produkt
- QA benennt die echten Risiken statt allgemeiner Unschaerfe

## Kurzfassung
- Ja, mehrere Threads/Agents sind fuer Curabo sinnvoll.
- Nein, sie sollten nicht dieselben Monolith-Dateien gleichzeitig anfassen.
- Das Projekt laesst sich heute gut in Website, Dashboard/Admin, Mobile, Backend und QA schneiden.
- Die groesste Hebelverbesserung fuer spaetere Parallelisierung ist das Aufteilen von `mobile/App.js` und `server.py`.
