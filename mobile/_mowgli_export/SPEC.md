# Curabo - Mowgli Spec (v7)

## 

**Curabo** - Die White-Label Patient Experience App für moderne MedSpas und Kliniken.

Curabo ist die White-Label Patient Experience App für moderne MedSpas und Kliniken im DACH-Markt. Als zentrale Mobile-App (React Native/Expo) ermöglicht sie Patienten, ihre jeweilige Klinik zu wählen und in eine vollständig individualisierte, markenkonforme digitale Experience einzutreten. Die App verbindet Treatment-Entdeckung, Terminbuchung, Gutscheinkauf, Mitgliedschaftsverwaltung, ein Punkte-basiertes Belohnungssystem und direkte Klinik-Kommunikation in einer ruhigen, premium und professionellen Oberfläche.

## User Journeys

### 1. Onboarding & Klinik-Bindung

#### 1.1 App-Start & Initialisierung

- 1.1.1. Nutzer startet die App (Splash/Ladezustand mit Curabo- oder Klinik-Branding)
- 1.1.2. System prüft, ob bereits eine Klinik- und Session-Token persistiert ist
- 1.1.3. Bei bestehender Session: Direkter Sprung zu HomeScreen (1.4.1)
- 1.1.4. Bei erstem Start oder abgelaufener Session: Weiterleitung zu Klinikauswahl (1.2.1)

#### 1.2 Klinikauswahl (Erster Schritt)

- 1.2.1. Nutzer sieht Klinik-Suchbildschirm mit Eingabefeld für Kliniknamen
- 1.2.2. System filtert verfügbare Kliniken (Tenants) in Echtzeit basierend auf Eingabe
- 1.2.3. Nutzer wählt gewünschte Klinik aus der Liste
- 1.2.4. System lädt Public Config und Branding der Klinik (Farben, Logo, Name)
- 1.2.5. Vorschau/Prompt zur Bestätigung der Klinik-Auswahl
- 1.2.6. Bei Bestätigung: Weiterleitung zu Account-Erstellung (1.3.1)

#### 1.3 Account-Erstellung & Authentifizierung

- 1.3.1. Nutzer sieht Registrierungsmaske mit Telefonnummern-Eingabe
- 1.3.2. System sendet OTP/SMS (Status: noch nicht final produktiv, Fallback-Mechanismus definiert)
- 1.3.3. Nutzer gibt OTP-Code ein
- 1.3.4. Bei erfolgreicher Verifizierung: Profilerstellung (Name, Email, optional Geburtsdatum)
- 1.3.5. Nutzer akzeptiert AGB und Datenschutz der spezifischen Klinik
- 1.3.6. System erstellt User-Account im Tenant-Kontext der gewählten Klinik
- 1.3.7. Weiterleitung zu HomeScreen (Journey 2.1.1)

#### 1.4 Re-Onboarding ( bestehende Nutzer, neue Klinik)

- 1.4.1. Nutzer kann in Profil-Einstellungen "Klinik wechseln" auswählen
- 1.4.2. System führt zurück zu 1.2.1 (Suche), bei Auswahl neuer Klinik: Prüfung auf bestehenden Account oder Neuerstellung

---

### 2. Treatment-Entdeckung & Kommerz (Verkaufsfokus)

#### 2.1 Home-Screen Entdeckung

- 2.1.1. Nutzer landet auf HomeScreen mit klinikspezifischem Branding
- 2.1.2. System zeigt priorisiert: Featured Treatments, Neue Angebote, Empfohlene Memberships
- 2.1.3. Nutzer scrollt durch personalisierte oder allgemeine Empfehlungen
- 2.1.4. Schnellzugriff auf Shop-Tab und Scan-Tab via Bottom Navigation
- 2.1.5. Optional: Anzeige aktiver Membership-Badge oder Punkte-Stand (sekundär)

#### 2.2 Shop-Navigation & Katalog

- 2.2.1. Nutzer öffnet ShopScreen (Bottom Navigation)
- 2.2.2. System zeigt Kategorien: Treatments, Memberships, Gutscheine/Vouchers
- 2.2.3. Nutzer filtert oder scrollt durch Treatment-Liste mit Preisen und Bildern
- 2.2.4. Nutzer tippt auf Treatment für Detailansicht (Journey 2.3.1)

#### 2.3 Treatment-Detail & Kaufentscheidung

- 2.3.1. Nutzer sieht Treatment-Details: Beschreibung, Dauer, Preis, Bilder, Verfügbarkeit
- 2.3.2. System bietet zwei primäre Optionen: "Jetzt buchen" oder "Als Gutschein kaufen"
- 2.3.3. Nutzer wählt "Jetzt buchen" → Weiterleitung zu Buchungsflow (2.4.1)
- 2.3.4. Nutzer wählt "Als Gutschein kaufen" → Weiterleitung zu Voucher-Flow (2.5.1)
- 2.3.5. Alternative: "In den Warenkorb" für spätere Bezahlung (CartOverlay)

#### 2.4 Terminbuchung (Book Now)

- 2.4.1. Nutzer sieht Zeitfenster-Auswahl (Kalenderansicht)
- 2.4.2. System zeigt verfügbare Slots basierend auf Klinik-Verfügbarkeiten (keine Behandler-Auswahl, Zuweisung erfolgt durch Klinik)
- 2.4.3. Nutzer wählt Datum und Uhrzeit-Slot
- 2.4.4. System zeigt Buchungs-Zusammenfassung (Treatment, Zeit, Preis, Klinik-Standort)
- 2.4.5. Nutzer bestätigt Buchung und gelangt zu Checkout (2.6.1)

#### 2.5 Gutschein-Kauf (Voucher)

- 2.5.1. Nutzer wählt Anzahl/Variante des Gutscheins (falls mehrere Optionen)
- 2.5.2. System zeigt Preis und Gültigkeitszeitraum
- 2.5.3. Nutzer kann persönliche Nachricht hinzufügen (optional)
- 2.5.4. Weiterleitung zu Checkout (2.6.1) mit Kennzeichnung als Voucher-Kauf

#### 2.6 Checkout & Zahlung

- 2.6.1. Nutzer sieht Checkout-Screen mit Stripe-Integration
- 2.6.2. System zeigt Zahlungsmethoden (gespeicherte Karten oder neue Eingabe)
- 2.6.3. Nutzer bestätigt Zahlung
- 2.6.4. System verarbeitet Transaktion via Stripe, erstellt Order und bei Buchung: Appointment-Eintrag
- 2.6.5. Bei Erfolg: OrderConfirmationScreen mit Buchungsdetails oder Gutschein-Code

---

### 3. Terminverwaltung (Self-Service)

#### 3.1 Übersicht kommender Termine

- 3.1.1. Nutzer öffnet Profil oder dedizierten Termin-Bereich
- 3.1.2. System zeigt Liste bevorstehender Appointments mit Datum, Zeit, Treatment-Name, Standort
- 3.1.3. Nutzer tippt auf Termin für Detailansicht (3.2.1)

#### 3.2 Termin-Details & Verwaltung

- 3.2.1. Nutzer sieht Termin-Details: Status, Treatment-Info, Standort-Karte, Hinweise
- 3.2.2. System bietet Optionen: "Termin verschieben" oder "Termin stornieren"
- 3.2.3. Nutzer wählt Verschieben → Auswahl neuer Zeitfenster (wie 2.4.2) → Bestätigung
- 3.2.4. Nutzer wählt Stornieren → Bestätigungsdialog mit Hinweis auf Stornierungsbedingungen → System aktualisiert Status und ggf. Punkte/Guthaben

#### 3.3 Vergangene Termine & Historie

- 3.3.1. Nutzer sieht Tab/Segment für Vergangene Buchungen
- 3.3.2. System zeigt abgeschlossene Treatments mit Option zur Nachbuchung oder Review (falls implementiert)

---

### 4. Membership-Verwaltung

#### 4.1 Membership-Entdeckung & Kauf

- 4.1.1. Nutzer findet Memberships im Shop-Bereich oder via Home-Promotion
- 4.1.2. Nutzer sieht Details: Vorteile (z.B. 10% Rabatt), monatliche Kosten, Inklusiv-Leistungen
- 4.1.3. Nutzer startet Subscription via Checkout (Stripe Subscription)
- 4.1.4. System aktiviert Membership für Patienten-Account

#### 4.2 Membership-Status & Verwaltung

- 4.2.1. Nutzer sieht aktive Membership im Profil-Bereich mit nächstem Abrechnungsdatum
- 4.2.2. Nutzer kann Membership kündigen (Ende der Laufzeit) oder pausieren (falls von Klinik erlaubt)
- 4.2.3. System zeigt genutzte Vorteile (z.B. eingelöste Rabatte)

---

### 5. Rewards & Punkte-System

#### 5.1 Punkte-Übersicht

- 5.1.1. Nutzer öffnet RewardsScreen (Bottom Navigation)
- 5.1.2. System zeigt aktuellen Punktestand, verfügbare Prämien, Punkte-Historie (Earn/Burn)
- 5.1.3. Erklärung des Earning-Rates (z.B. 1 Punkt pro Euro Umsatz)

#### 5.2 Prämien einlösen

- 5.2.1. Nutzer browsiert Katalog einlösbarer Rewards (Treatments, Produkte, Rabatte)
- 5.2.2. System zeigt Punkt-Kosten pro Reward
- 5.2.3. Nutzer wählt Reward zur Einlösung
- 5.2.4. System bestätigt Transaktion und generiert Gutschein/QR für die Klinik

#### 5.3 Wallet & Historie

- 5.3.1. Nutzer sieht eingelöste/active Rewards im Wallet-Bereich
- 5.3.2. Nutzer sieht Punkte-Transaktionshistorie mit Zeitstempeln

---

### 6. In-Klinik Experience (Scan)

#### 6.1 Patienten-Identifikation

- 6.1.1. Nutzer öffnet Scan-Tab (Bottom Navigation)
- 6.1.2. System zeigt statischen QR-Code mit Patienten-ID und Klinik-ID
- 6.1.3. QR-Code ist für Check-in oder Zahlungsidentifikation durch Klinik-Personal gedacht (Kamera der Klinik scannt den Code der App)
- 6.1.4. Alternative Darstellung: Manuelle ID-Anzeige für manuelle Eingabe durch Personal

---

### 7. Content & Wissen

#### 7.1 Klinik-Wissen & Tipps

- 7.1.1. Nutzer findet Bereich "Wissen & Tipps" (im Home oder separater Tab)
- 7.1.2. System zeigt Artikel der Klinik (dynamisch geladen): Behandlungserklärungen, Aftercare, Blog-Posts
- 7.1.3. Nutzer tippt auf Artikel für Detailansicht mit Bildern und formatiertem Text

---

### 8. Klinik-Kontakt & Standort

#### 8.1 Kontaktaufnahme

- 8.1.1. Nutzer öffnet Kontakt-Bereich (im Profil oder dediziert)
- 8.1.2. System zeigt Klinik-Kontaktdaten: Telefon, Email, WhatsApp, Adresse
- 8.1.3. Nutzer tippt auf "Anrufen" → tel:-Link öffnet Telefon-App
- 8.1.4. Nutzer tippt auf Email → mailto:-Link
- 8.1.5. Nutzer tippt auf WhatsApp → wa.me-Link mit vorbelegter Nachricht
- 8.1.6. System zeigt Standort mit Karten-Integration (statisch oder dynamisch) und Öffnungszeiten

---

## Data Model

### Clinic (Tenant)

Repräsentiert die Klinik/MedSpa als Tenant in der Multi-Tenant-Architektur.

**Fields:**
* `id`: Unique identifier (UUID)
* `slug`: URL-freundlicher Identifier für die Klinik
* `name`: Anzeigename der Klinik
* `legalName`: Rechtlicher Firmenname für Rechnungen
* `publicConfig`: JSON mit Branding: `primaryColor`, `secondaryColor`, `logoUrl`, `fontPreference`
* `contactData`: JSON mit `phone`, `email`, `whatsappNumber`, `address` (Struktur mit Straße, PLZ, Stadt)
* `businessHours`: JSON mit Öffnungszeiten pro Wochentag
* `stripeAccountId`: Connect-Account-ID für Stripe Connect
* `isActive`: Boolean
* `createdAt`: Timestamp
* `updatedAt`: Timestamp

**Relationships:**
* Has many `User` (Patienten)
* Has many `Treatment` (Katalog)
* Has many `Membership` (Produkte)
* Has many `Appointment`
* Has many `Article` (Content)
* Has many `Reward` (Prämienkatalog)
* Has many `TimeSlot` (Verfügbarkeiten)

### User (Patient)

Repräsentiert den Endnutzer/Patienten im Kontext einer spezifischen Klinik.

**Fields:**
* `id`: UUID
* `clinicId`: FK zu Clinic (Tenant-Scoping)
* `phoneNumber`: E164-Format, für OTP und Kontakt
* `email`: Optional, für Bestätigungen
* `firstName`: Vorname
* `lastName`: Nachname
* `dateOfBirth`: Optional
* `pointsBalance`: Integer, aktueller Punktestand
* `membershipStatus`: Enum [`none`, `active`, `paused`, `cancelled`]
* `membershipId`: Optional FK zu aktiver Membership
* `stripeCustomerId`: Für wiederkehrende Zahlungen
* `notificationPrefs`: JSON (Email, SMS, Push)
* `createdAt`: Timestamp
* `updatedAt`: Timestamp

**Relationships:**
* Belongs to `Clinic`
* Has many `Appointment`
* Has many `Order`
* Has many `PointsTransaction`
* Has many `RewardRedemption`

### Treatment

Katalog-Eintrag für Behandlungen/Services.

**Fields:**
* `id`: UUID
* `clinicId`: FK Clinic
* `name`: Behandlungsname
* `description`: Rich-Text Beschreibung
* `durationMinutes`: Dauer
* `basePrice`: Decimal (Cent)
* `category`: Enum [`facial`, `body`, `injection`, `laser`, `wellness`, `other`]
* `imageUrls`: Array von URLs
* `isActive`: Boolean
* `requiresBooking`: Boolean (ob Termin nötig oder Walk-in)
* `createdAt`: Timestamp

**Relationships:**
* Belongs to `Clinic`
* Has many `Appointment`
* Has many `OrderItem`

### Membership

Abonnement-Produkt für wiederkehrende Patienten.

**Fields:**
* `id`: UUID
* `clinicId`: FK Clinic
* `name`: Name (z.B. "Gold Member")
* `description`: Vorteilsbeschreibung
* `monthlyPrice`: Decimal
* `benefits`: JSON (z.B. `{"discountPercent": 10, "includedTreatments": [...]}`)
* `stripePriceId`: Stripe Preis-ID für Subscription
* `isActive`: Boolean

**Relationships:**
* Belongs to `Clinic`
* Has many `User` (Abonnenten)

### Appointment

Konkreter gebuchter Termin.

**Fields:**
* `id`: UUID
* `clinicId`: FK Clinic
* `userId`: FK User
* `treatmentId`: FK Treatment
* `status`: Enum [`booked`, `completed`, `cancelled_by_patient`, `cancelled_by_clinic`, `no_show`]
* `scheduledAt`: Timestamp (Beginn)
* `durationMinutes`: Dauer
* `endAt`: Timestamp (berechnet)
* `practitionerName`: Optional, Name des zugewiesenen Behandlers (durch Klinik gesetzt)
* `notes`: Patienten-Notizen
* `internalNotes`: Klinik-Interne Notizen
* `isFromVoucher`: Boolean
* `voucherCode`: Optional
* `createdAt`: Timestamp
* `updatedAt`: Timestamp

**Relationships:**
* Belongs to `User`
* Belongs to `Treatment`
* Belongs to `Clinic`
* Has one `Order` (optional, wenn kostenpflichtig)

### Order

Bestellung/Kauftransaktion (Treatments, Vouchers, Memberships, Rewards).

**Fields:**
* `id`: UUID
* `clinicId`: FK Clinic
* `userId`: FK User
* `stripePaymentIntentId`: Stripe Referenz
* `status`: Enum [`pending`, `completed`, `failed`, `refunded`]
* `totalAmount`: Decimal (Cent)
* `currency`: Default EUR
* `type`: Enum [`treatment_booking`, `voucher_purchase`, `membership_subscription`, `reward_redemption`]
* `metadata`: JSON mit Details (z.B. eingelöste Punkte bei Reward)
* `createdAt`: Timestamp

**Relationships:**
* Belongs to `User`
* Belongs to `Clinic`
* Has many `OrderItem`
* Has one `Appointment` (bei Buchung)

### OrderItem

Einzelposition in einer Order.

**Fields:**
* `id`: UUID
* `orderId`: FK Order
* `treatmentId`: Optional FK Treatment
* `membershipId`: Optional FK Membership
* `quantity`: Integer
* `unitPrice`: Decimal (Cent)
* `totalPrice`: Decimal (Cent)
* `type`: Enum [`treatment`, `voucher`, `membership`, `reward`]

### TimeSlot

Verfügbare Zeitfenster für Buchungen (durch Klinik verwaltet).

**Fields:**
* `id`: UUID
* `clinicId`: FK Clinic
* `startTime`: Timestamp
* `endTime`: Timestamp
* `isBooked`: Boolean
* `capacity`: Integer (default 1, für Gruppenbehandlungen >1)

### PointsTransaction

Audit-Trail für Punktebewegungen.

**Fields:**
* `id`: UUID
* `userId`: FK User
* `clinicId`: FK Clinic
* `amount`: Integer (positiv für Earn, negativ für Burn)
* `type`: Enum [`purchase`, `redemption`, `bonus`, `expired`, `manual_adjustment`]
* `referenceId`: Optional FK zu Order oder RewardRedemption
* `description`: Text
* `createdAt`: Timestamp

### Reward

Einlösbare Prämien im Punkte-System.

**Fields:**
* `id`: UUID
* `clinicId`: FK Clinic
* `name`: Prämienname
* `description`: Beschreibung
* `pointsCost`: Integer
* `type`: Enum [`discount_fixed`, `discount_percent`, `free_treatment`, `product`]
* `value`: JSON (z.B. `{"treatmentId": "...", "discountPercent": 20}`)
* `stock`: Optional Integer (Limitierte Anzahl)
* `isActive`: Boolean
* `imageUrl`: Optional

### RewardRedemption

Konkrete Einlösung einer Prämie.

**Fields:**
* `id`: UUID
* `userId`: FK User
* `rewardId`: FK Reward
* `pointsSpent`: Integer
* `status`: Enum [`active`, `used`, `expired`]
* `voucherCode`: Generierter Code für Klinik-Scan
* `expiresAt`: Optional Timestamp
* `usedAt`: Optional Timestamp

### Article (Content/Wissen)

Klinik-spezifischer Content.

**Fields:**
* `id`: UUID
* `clinicId`: FK Clinic
* `title`: Titel
* `content`: Rich-Text/Markdown
* `excerpt`: Kurzbeschreibung
* `imageUrl`: Optional
* `category`: String (frei definierbar durch Klinik)
* `publishedAt`: Timestamp
* `isPublished`: Boolean

---

## Design

[STRICTLY USER INPUT - NO EDITORIALIZING]

Das Design der App soll folgende Eigenschaften aufweisen:

*   **Stimmung**: Ruhig, premium, modern, freundlich, professionell.
*   **Ästhetik**: Klinisch sauber, aber nicht kalt. Apple-/Desktop-Produktqualität.
*   **Verbotene Stile**: Keine billige Glassmorphism, keine generische AI-Optik, keine übergroßen unstrukturierten Hero-Flächen.
*   **Struktur**: Klare Hierarchie, gute Typografie, saubere Abstände, erwachsene Kanten (mature edges), hochwertige Overlays.
*   **Qualitätsanspruch**: Die Oberfläche darf nicht nach Beta, Template oder AI-Generierung aussehen. Edges, Radii, Panels und Overlays sollen glaubwürdig und professionell wirken.
*   **Motion**: Nur subtil und funktional.
*   **Funktionaler Kontext**: Das MVP der App steht bereits (Basis für Weiterentwicklung vorhanden).

---

## Technical Context Notes

[OUT OF SCOPE]: Web-Dashboard für Kliniken, Admin/Superadmin-Interface, Website-Frontend für Marketing. Diese existieren im Repo, sind aber nicht Teil dieses Mobile-App-Specs.

**Wichtige bestehende Dateien im Repo** (MVP-Basis):
*   `/mobile/App.js` - Root-Komponente mit Navigation-Setup
*   `/mobile/src/theme/tokens.js` - Design-Token-Definition (Farben, Spacing, Typography)
*   `/mobile/src/screens/HomeScreen.js` - Basis für Home
*   `/mobile/src/screens/ShopScreen.js` - Basis für Shop
*   `/mobile/src/screens/RewardsScreen.js` - Basis für Rewards
*   `/mobile/src/screens/ProfileScreen.js` - Basis für Profile
*   `/mobile/src/overlays/HeaderSearchOverlay.js` - Bestehende Suche
*   `/mobile/src/overlays/CartOverlay.js` - Bestehender Warenkorb
*   `/server.py` - Backend-Referenz (Multi-Tenant-Logik, Stripe-Integration)

**API-Konventionen**:
*   Alle Calls enthalten `X-Clinic-ID` Header für Tenant-Scoping
*   Public Endpoints (vor Auth): `/public/clinics`, `/public/config/:clinicId`
*   Authenticated Endpoints: `/api/v1/...` mit Bearer Token

**Stripe-Integration**:
*   PaymentIntents für einmalige Käufe (Treatments, Vouchers)
*   Subscriptions für Memberships
*   Stripe Connect für Klinik-Auszahlungen (Connect-Account-ID aus Clinic-Entity)

**OTP/SMS**:
*   Status: Noch nicht final produktiv (laut User-Eingabe)
*   Spec berücksichtigt Plattform-Architektur für zukünftige SMS-Integration (Twilio/similar) mit Fallback auf Email-OTP oder Manuelle Verifizierung während der Beta-Phase.

## Frontend

#### Dynamic Theme System

*   App lädt bei Klinik-Auswahl Branding-Config (Farben, Logo) aus Backend
*   Theme-Provider wrappt App mit klinikspezifischen Token (Primary, Secondary, Surface, Text-Farben)
*   Alle Screens konsumieren Theme-Context für konsistente Farbgebung
*   Fallback auf Curabo-Default-Theme wenn keine Klinik ausgewählt

#### Bottom Navigation Bar

*   Persistent auf allen Main-Screens (Home, Shop, Scan, Rewards, Profile)
*   Icons mit aktive/inaktiv States basierend auf Theme-Primary-Color
*   "Scan" als zentrales Highlight-Item (visuell hervorgehoben)
*   Badges für Rewards (Punktestand-Indikator) und Shop (Warenkorb-Anzahl)

#### Header Structure

*   Abhängig vom Screen: Entweder Klinik-Logo zentriert oder Screen-Titel mit Back-Button
*   Rechte Seite: Such-Icon (öffnet HeaderSearchOverlay) und Warenkorb-Icon (öffnet CartOverlay)
*   Dynamische Anpassung an Safe-Areas (StatusBar)

#### Overlay Container

*   Modale Overlays (HeaderSearchOverlay, CartOverlay) rendern über dem aktuellen Screen mit Hintergrund-Dimming
*   Gesten-Unterstützung für Swipe-to-Close
*   Fokus-Management: Bei Suche-Overlay wird Tastatur sofort aktiviert

### SplashScreen

Summary: Initialer Ladezustand beim App-Start. Überprüft die Session und leitet den Nutzer entweder zur Klinikauswahl oder zum Home-Screen weiter.

Preview size: 390x844

#### Preview states

State | Name | Description
------|------|--------------------------------
ID: default | Default | Zeigt das Logo und einen Lade-Indikator während die Session-Prüfung im Hintergrund stattfindet.

#### Contents

**Content Hierarchy:**
*   Curabo-Logo oder Klinik-Logo (falls zwischengespeichert)
*   Lade-Indikator
*   Optional: Kurzer Branding-Tagline

**States:**
*   Prüfung auf persistierte Session
*   Weiterleitung zu ClinicSelectionScreen (neuer Nutzer) oder HomeScreen (bestehende Session)

### ClinicSelectionScreen

Summary: Erster Schritt im Onboarding: Ermöglicht dem Nutzer die Auswahl seiner Klinik über eine Suchfunktion.

Preview size: 390x844

#### Preview states

State | Name | Description
------|------|--------------------------------
ID: default | Default | Das Suchfeld ist leer und zeigt eine Liste von verfügbaren Kliniken oder Vorschläge an.
ID: searchActive | Search Active | Der Nutzer tippt in das Suchfeld, die Liste wird dynamisch basierend auf der Eingabe gefiltert.
ID: noResults | No Results | Die Suche hat keine Ergebnisse geliefert. Es wird ein Hinweis "Keine Klinik gefunden" angezeigt.

#### Contents

**Content Hierarchy:**
*   Header mit Curabo-Branding
*   Such-Eingabefeld mit Placeholder "Klinikname eingeben..."
*   Dynamische Liste von Kliniken (Name, Stadt, Logo-Thumbnail)
*   Keine Map-Ansicht (laut QA: einfache Suche reicht)
*   Leer-Zustand: Hinweis wenn keine Klinik gefunden

**Interactions:**
*   Eingabe filtert Liste in Echtzeit (Debounced API-Call)
*   Tap auf Klinik öffnet Bestätigungs-Dialog oder direkte Auswahl
*   Bei Auswahl: Download der Klinik-Config, Speicherung lokal, Navigation zu AuthScreen

### AuthScreen

Summary: Account-Erstellung und Login nach Klinik-Auswahl. Führt durch Telefonnummern-Validierung, OTP-Eingabe und Profilerstellung.

Preview size: 390x844

#### Preview states

State | Name | Description
------|------|--------------------------------
ID: phoneInput | Phone Input | Initialer Zustand. Zeigt das Klinik-Logo und das Eingabefeld für die Telefonnummer.
ID: otpInput | OTP Input | Nach Eingabe der Nummer. Zeigt das Feld für den 6-stelligen OTP-Code an.
ID: profileDetails | Profile Details | Nach erfolgreicher OTP-Verifizierung. Zeigt Felder für Vorname, Nachname, Email und die AGB-Checkbox.

#### Contents

**Content Hierarchy:**
*   Anzeige des ausgewählten Klinik-Logos (Bestätigung: "Sie verbinden mit [Klinik]")
*   Telefonnummer-Eingabe mit Ländervorwahl (DACH-Fokus: +49, +43, +41)
*   OTP-Eingabe (6-stellig) nach SMS-Versand
*   Profil-Fields: Vorname, Nachname, Email (nach OTP-Verifizierung)
*   Checkbox für AGB/Datenschutz (klinikspezifische Links)
*   Primary Action: "Account erstellen"

**States:**
*   Loading: SMS wird gesendet
*   Error: Ungültige Telefonnummer, OTP falsch, Netzwerkfehler
*   Success: Weiterleitung zu HomeScreen

### HomeScreen

Summary: Verkaufsorientierter Hub der App. Zeigt Featured Treatments, Mitglieder-Status, Quick-Actions und Content-Vorschauen.

Preview size: 390x844

#### Preview states

State | Name | Description
------|------|--------------------------------
ID: default | Default | Der Home-Bereich ist vollständig sichtbar mit Hero-Bereich, horizontalen Listen und Quick-Actions. Keine Overlays sind offen.
ID: searchOverlay | Search Overlay Open | Das HeaderSearchOverlay ist über dem Inhalt geöffnet und verdeckt einen Großteil des Screens. Das Suchfeld ist fokussiert.
ID: cartOverlay | Cart Overlay Open | Das CartOverlay ist geöffnet und zeigt die aktuellen Warenkorb-Items und den Checkout-Button an.

#### Contents

**Content Hierarchy:**
*   Header mit Klinik-Logo und Such/Profil-Shortcuts
*   Hero-Bereich: Featured Treatment oder aktuelle Kampagne (dynamisch aus Backend)
*   Horizontale Scroll-Listen:
    *   "Beliebte Treatments" (Top-Seller der Klinik)
    *   "Ihre Membership" (falls aktiv, mit Status-Indikator)
    *   "Neu im Katalog"
*   Quick-Actions: "Termin buchen", "Mitglied werden", "Gutschein kaufen"
*   Unterer Bereich: Vorschau auf 1-2 aktuelle Artikel aus "Wissen  Tipps"

**Overlays/Modals (Nested):**
*   **HeaderSearchOverlay**: Vollbild-Suche nach Treatments/Content (bestehende Komponente)
*   **CartOverlay**: Schnellzugriff auf Warenkorb (bestehende Komponente)

**Interactions:**
*   Tap auf Treatment → TreatmentDetailScreen
*   Tap auf Artikel-Vorschau → ArticleDetailScreen
*   Pull-to-Refresh für Content-Update

### ShopScreen

Summary: Katalog-Übersicht für Treatments, Memberships und Gutscheine. Ermöglicht Filterung, Sortierung und Zugriff auf den Warenkorb.

Preview size: 390x844

#### Preview states

State | Name | Description
------|------|--------------------------------
ID: defaultTreatments | Treatments Tab | Der Tab "Treatments" ist aktiv. Eine Liste von Treatment-Cards wird angezeigt.
ID: membershipsTab | Memberships Tab | Der Tab "Memberships" ist aktiv. Eine Liste von Abonnement-Optionen wird angezeigt.
ID: vouchersTab | Vouchers Tab | Der Tab "Gutscheine" ist aktiv. Eine Liste von verfügbaren Gutscheinen wird angezeigt.
ID: filterOverlay | Filter Overlay Open | Das FilterOverlay ist geöffnet und zeigt erweiterte Filteroptionen für Kategorien und Preise an.
ID: cartOverlay | Cart Overlay Open | Das CartOverlay ist geöffnet und zeigt den Warenkorbinhalt über dem Shop-Listing an.

#### Contents

**Content Hierarchy:**
*   Segment-Control oder Tabs: "Treatments", "Memberships", "Gutscheine"
*   Filter/Sort-Optionen (Kategorie, Preis)
*   Grid- oder Listen-Ansicht von Product-Cards (Bild, Name, Preis, Dauer)
*   Floating Action Button oder persistenter Bereich für aktiven Warenkorb

**Overlays/Modals (Nested):**
*   **CartOverlay**: Vollständiger Warenkorb mit Checkout-Button (bestehende Komponente)
*   **FilterOverlay**: Erweiterte Filter für Behandlungskategorien

### TreatmentDetailScreen

Summary: Detailansicht einer Behandlung. Zeigt Bilder, Beschreibung, Preis und primäre Aktionen zum Buchen oder Gutschein-Kauf.

Preview size: 390x844

#### Preview states

State | Name | Description
------|------|--------------------------------
ID: default | Default | Zeigt alle Details des Treatments inklusive Bild, Preis, Beschreibung und die primären Action-Buttons.

#### Contents

**Content Hierarchy:**
*   Bild-Carousel des Treatments
*   Titel und Preis (ggf. Streichpreis bei Member-Rabatt)
*   Beschreibung (ausführlich, mit Bullet-Points für Benefits)
*   Dauer und Vorbereitungshinweise
*   **Primary Decision**: Zwei prominente Actions:
    *   "Jetzt buchen" (führt zu TimeSlotSelectionScreen)
    *   "Als Gutschein kaufen" (führt zu CheckoutScreen mit Voucher-Flag)
*   Sekundär: "In den Warenkorb" (für später)

**States:**
*   Wenn Treatment nicht verfügbar: "Nicht buchbar" Hinweis
*   Wenn Membership aktiv: Anzeige des automatischen Rabatts

### TimeSlotSelectionScreen

Summary: Kalenderansicht für Terminbuchung. Ermöglicht die Auswahl eines Datums und eines verfügbaren Zeitfensters.

Preview size: 390x844

#### Preview states

State | Name | Description
------|------|--------------------------------
ID: default | Default | Zeigt den Datums-Wähler und eine Liste verfügbarer Zeitfenster für das ausgewählte Datum.
ID: slotSelected | Slot Selected | Ein Zeitfenster ist ausgewählt und markiert. Eine Zusammenfassung und der Bestätigungs-Button sind sichtbar.

#### Contents

**Content Hierarchy:**
*   Header mit Treatment-Name und Zurück-Option
*   Datums-Wähler (horizontal scrollend oder Calendar-Picker)
*   Liste verfügbarer Zeitfenster für gewähltes Datum
*   Hinweis: "Behandler wird von der Klinik zugewiesen"
*   Zusammenfassung des gewählten Slots mit Bestätigungs-Button

**Interactions:**
*   Tap auf Datum lädt verfügbare Slots via API
*   Tap auf Slot markiert Auswahl
*   Bestätigung führt zu CheckoutScreen

### CheckoutScreen

Summary: Zahlungsabwicklung via Stripe. Zeigt Bestellübersicht, Zahlungsmethoden und ermöglicht die Einlösung von Punkten.

Preview size: 390x844

#### Preview states

State | Name | Description
------|------|--------------------------------
ID: default | Default | Zeigt die Bestellübersicht, Auswahl der Zahlungsmethode und den "Jetzt bezahlen" Button.
ID: pointsApplied | Points Applied | Die Option "Punkte verwenden" ist aktiviert. Die Gesamtsumme wurde reduziert und die Punkteinlösung ist in der Zusammenfassung sichtbar.
ID: processing | Processing Payment | Der "Jetzt bezahlen" Button zeigt einen Lade-Indikator. Die Interaktion ist gesperrt während die Transaktion verarbeitet wird.
ID: error | Payment Error | Eine Fehlermeldung wird angezeigt (z.B. "Zahlung fehlgeschlagen"), und der Nutzer hat die Option, es erneut zu versuchen.

#### Contents

**Content Hierarchy:**
*   Bestellübersicht: Treatment/Produkt, Datum (falls Termin), Preis
*   Zahlungsmethoden-Auswahl: Gespeicherte Karten (Stripe Customer) oder Neue Karte (Card-Input-Element)
*   Punkte-Einlösung-Option (falls verfügbar: "Punkte verwenden")
*   Gesamtsumme mit Steueraufschlüsselung
*   Primary Action: "Jetzt bezahlen"
*   AGB-Checkbox der Klinik

**States:**
*   Loading: Stripe Processing
*   Success: Weiterleitung zu OrderConfirmationScreen
*   Error: Zahlungsfehler-Anzeige mit Retry-Option

### OrderConfirmationScreen

Summary: Erfolgsbestätigung nach Kauf. Zeigt Details zur Bestellung an und bietet Aktionen wie Kalender-Export oder Gutschein-Anzeige.

Preview size: 390x844

#### Preview states

State | Name | Description
------|------|--------------------------------
ID: appointmentSuccess | Appointment Success | Bestätigung einer Terminbuchung. Zeigt eine Option zum Export in den Kalender (.ics).
ID: voucherSuccess | Voucher Success | Bestätigung eines Gutscheinkaufs. Zeigt den Gutschein-Code und/oder QR-Code prominent an.

#### Contents

**Content Hierarchy:**
*   Erfolgs-Icon/Animation
*   Bestellnummer und Zusammenfassung
*   Bei Terminbuchung: Kalender-Export-Option (.ics)
*   Bei Gutschein: Anzeige des Gutschein-Codes (QR oder alphanumerisch)
*   CTA: "Weiter zu Meine Termine" oder "Zurück zu Home"

### AppointmentsScreen

Summary: Liste aller Termine. Unterscheidet zwischen kommenden und vergangenen Buchungen und ermöglicht den Zugriff auf Details.

Preview size: 390x844

#### Preview states

State | Name | Description
------|------|--------------------------------
ID: upcoming | Upcoming Appointments | Das Segment "Kommende" ist aktiv und zeigt eine Liste zukünftiger Termine.
ID: past | Past Appointments | Das Segment "Vergangene" ist aktiv und zeigt eine Liste historischer Termine.

#### Contents

**Content Hierarchy:**
*   Segmente: "Kommende", "Vergangene"
*   Liste von Appointment-Cards:
    *   Datum und Uhrzeit
    *   Treatment-Name
    *   Status-Indikator (bestätigt, verschoben, etc.)
    *   Standort-Name
*   Swipe-Actions oder Tap für Details

**Interactions:**
*   Tap auf Termin → AppointmentDetailScreen

### AppointmentDetailScreen

Summary: Detail und Verwaltung eines Termins. Zeigt alle Infos und bietet Optionen zum Verschieben oder Stornieren.

Preview size: 390x844

#### Preview states

State | Name | Description
------|------|--------------------------------
ID: default | Default | Zeigt die Termin-Details, Standort und die Action-Buttons "Verschieben" und "Stornieren".
ID: rescheduleOverlay | Reschedule Overlay Open | Das RescheduleOverlay ist geöffnet und ermöglicht die Auswahl eines neuen Zeitfensters für den Termin.
ID: cancelOverlay | Cancellation Confirmation Open | Das CancellationConfirmOverlay ist geöffnet und bittet um Bestätigung mit Hinweis auf Stornierungsbedingungen.

#### Contents

**Content Hierarchy:**
*   Treatment-Details (Name, Dauer, Bild)
*   Zeitpunkt mit Kalender-Export-Option
*   Standort mit Karten-Link (externe Maps-App)
*   Praxis-Notizen (falls vom Personal hinterlegt)
*   Action-Buttons: "Termin verschieben", "Termin stornieren"
*   Stornierungsbedingungen (Text aus Klinik-Config)

**Overlays/Modals (Nested):**
*   **RescheduleOverlay**: Zeitfenster-Auswahl (wie TimeSlotSelectionScreen, aber im Kontext des bestehenden Appointments)
*   **CancellationConfirmOverlay**: Dialog mit Erklärung zu Rückerstattung/Punkte-Verfall

**Interactions:**
*   Verschieben: Auswahl neuer Slot → Bestätigung → API-Update
*   Stornieren: Bestätigung → Status-Update → Rückerstattungs-Logik (falls Prepaid)

### ScanScreen

Summary: Anzeige des Patienten-QR-Codes für den Check-in oder Zahlungsidentifikation an der Klinik-Rezeption.

Preview size: 390x844

#### Preview states

State | Name | Description
------|------|--------------------------------
ID: default | Default | Zeigt den großen QR-Code und den Erklärungstext an.
ID: manualId | Manual ID Display | Zeigt die manuelle ID (alphanumerischer Code) als Alternative zum QR-Scan an.

#### Contents

**Content Hierarchy:**
*   Zentrale große QR-Code-Darstellung (statisch, generiert aus User-ID + Clinic-ID)
*   Erklärungstext: "Zeigen Sie diesen Code dem Personal für Check-in oder Bezahlung"
*   Manuelle ID-Anzeige darunter (falls QR-Scan nicht funktioniert)
*   Refresh-Button (z.B. für Code-Rotation aus Sicherheitsgründen, falls implementiert)

**States:**
*   Offline-Hinweis wenn keine Verbindung (QR ist lokal generiert, aber Sync-Status wichtig)
*   Helligkeits-Boost bei QR-Anzeige (optional)

### RewardsScreen

Summary: Übersicht des Punkte-Systems. Zeigt den aktuellen Punktestand, verfügbare Prämien und die Transaktionshistorie.

Preview size: 390x844

#### Preview states

State | Name | Description
------|------|--------------------------------
ID: default | Default | Zeigt die Punkte-Balance, den Katalog der verfügbaren Rewards und die Transaktionshistorie.

#### Contents

**Content Hierarchy:**
*   Punkte-Balance (große Anzeige)
*   "Punkte sammeln" Erklärung (Rate pro Euro)
*   Verfügbare Rewards: Horizontaler Scroll oder Grid (Bild, Name, Punkte-Kosten)
*   Historie: Letzte Transaktionen (Earn/Burn)

**Interactions:**
*   Tap auf Reward → RewardRedemptionScreen
*   Pull-to-Refresh für aktuellen Punktestand

### RewardRedemptionScreen

Summary: Detail und Einlösung einer Prämie. Zeigt Kosten und ermöglicht den Einlösevorgang gegen Punkte.

Preview size: 390x844

#### Preview states

State | Name | Description
------|------|--------------------------------
ID: default | Default | Zeigt Reward-Details, Kosten und den aktiven "Einlösen" Button.
ID: insufficientPoints | Insufficient Points | Der "Einlösen" Button ist deaktiviert (grau), da der Nutzer nicht genügend Punkte hat. Ein Hinweis wird angezeigt.

#### Contents

**Content Hierarchy:**
*   Reward-Bild und Beschreibung
*   Punkte-Kosten und aktueller Balance-Vergleich
*   "Einlösen" Button (deaktiviert wenn nicht genug Punkte)
*   Hinweis auf Gültigkeit nach Einlösung

**Result:**
*   Bei Einlösung: Generierung von Voucher-Code, Anzeige in Wallet, Punkte-Abzug

### ProfileScreen

Summary: Nutzerkonto und Einstellungen. Zentraler Punkt für Mitgliedschafts-Verwaltung, Historie und Einstellungen.

Preview size: 390x844

#### Preview states

State | Name | Description
------|------|--------------------------------
ID: default | Default | Zeigt das Nutzer-Profil, Mitgliedschafts-Status, Liste der Einstellungen und Aktionen wie "Klinik wechseln".
ID: clinicChangeWarning | Clinic Change Warning | Ein Warn-Dialog ist sichtbar, der den Nutzer über die Konsequenzen des Klinikwechsels informiert und um Bestätigung bittet.

#### Contents

**Content Hierarchy:**
*   Nutzer-Header: Name, Mitgliedsstatus-Badge, Punkte-Übersicht
*   Mitgliedschafts-Bereich: Aktive Membership verwalten (kündigen, Vorteile einsehen)
*   Bestellhistorie: Link zu vergangenen Käufen
*   Einstellungen: Benachrichtigungen, Zahlungsmethoden (Stripe Customer Portal Link), Persönliche Daten ändern
*   Klinik-Wechsel Option (führt zu ClinicSelectionScreen mit Warnung)
*   Kontakt: Link zu ContactScreen

### ContactScreen

Summary: Klinik-Kommunikation. Bietet Kontaktinformationen, Adresse, Öffnungszeiten und Direktlinks zu Anruf, Email und WhatsApp.

Preview size: 390x844

#### Preview states

State | Name | Description
------|------|--------------------------------
ID: default | Default | Zeigt die Klinik-Details, Adresse, Öffnungszeiten und die Kontakt-Buttons.

#### Contents

**Content Hierarchy:**
*   Klinik-Name und Logo
*   Adresse mit "In Maps öffnen" Funktion
*   Öffnungszeiten (heute hervorgehoben)
*   Kontakt-Methoden:
    *   "Anrufen" (tel: Link) - Primärer Kanal
    *   "Email senden" (mailto: Link)
    *   "WhatsApp" (wa.me Link mit Vorlage)
*   Optional: Emergency/Hotline Hinweis

### ArticlesScreen

Summary: Liste der Klinik-Inhalte (Wissen  Tipps). Ermöglicht das Durchsuchen und Filtern von Artikeln.

Preview size: 390x844

#### Preview states

State | Name | Description
------|------|--------------------------------
ID: default | Default | Zeigt alle Artikel-Cards in einer Liste an.
ID: categoryFilter | Category Filter Active | Eine Kategorie wurde im horizontalen Filter ausgewählt, die Liste zeigt nur Artikel dieser Kategorie.

#### Contents

**Content Hierarchy:**
*   Kategorien-Filter (horizontal)
*   Liste von Article-Cards (Bild, Titel, Kurzbeschreibung, Datum)
*   Suchfunktion (lokal oder via HeaderSearchOverlay)

### ArticleDetailScreen

Summary: Vollständige Artikelansicht. Zeigt den Inhalt eines "Wissen  Tipps"-Artikels mit Bildern und formatiertem Text.

Preview size: 390x844

#### Preview states

State | Name | Description
------|------|--------------------------------
ID: default | Default | Zeigt den Titel, das Header-Bild und den vollständigen Text-Inhalt des Artikels.

#### Contents

**Content Hierarchy:**
*   Header-Bild
*   Titel und Veröffentlichungsdatum
*   Rich-Text Content (formatiert, mit Bildern)
*   "Teilen" Funktion (native Share-Sheet)
*   Zurück-Navigation zu ArticlesScreen oder HomeScreen

### WalletScreen

Summary: Sammlung von Gutscheinen und eingelösten Rewards. Ermöglicht die schnelle Anzeige von Codes für die Einlösung an der Klinik.

Preview size: 390x844

#### Preview states

State | Name | Description
------|------|--------------------------------
ID: vouchersTab | Vouchers Tab | Zeigt eine Liste aktiver Gutschein-Codes und zugehörige QR-Codes.
ID: rewardsTab | Rewards Tab | Zeigt eine Liste eingelöster Rewards mit deren Status (z.B. "Aktiv", "Verbraucht").

#### Contents

**Content Hierarchy:**
*   Segmente: "Gutscheine", "Rewards"
*   Liste aktiver Codes mit Ablaufdatum
*   QR-Code-Anzeige pro Gutschein für Klinik-Scan
*   Historie verbrauchter/ablaufender Codes