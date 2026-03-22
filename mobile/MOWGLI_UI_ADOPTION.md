# Curabo Mowgli UI Adoption

## Goal

Use the Mowgli export in [mobile/_mowgli_export](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export) as the new visual reference for the Curabo mobile app, while preserving Curabo's existing React Native app logic, API calls, tenant behavior, OTP flow, cart, checkout, rewards, and clinic bundle loading.

This is a UI adoption project, not a rewrite-from-scratch project.

## Source Files

### Mowgli export

- [SPEC.md](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/SPEC.md)
- [ClinicSelectionScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/ClinicSelectionScreen.tsx)
- [AuthScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/AuthScreen.tsx)
- [HomeScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/HomeScreen.tsx)
- [ShopScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/ShopScreen.tsx)
- [TreatmentDetailScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/TreatmentDetailScreen.tsx)
- [RewardsScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/RewardsScreen.tsx)
- [AppointmentsScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/AppointmentsScreen.tsx)
- [ContactScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/ContactScreen.tsx)

### Current Curabo app

- [App.js](/Users/valentinstrasser/Documents/New project/mobile/App.js)
- [OnboardingScreen.js](/Users/valentinstrasser/Documents/New project/mobile/src/screens/OnboardingScreen.js)
- [HomeScreen.js](/Users/valentinstrasser/Documents/New project/mobile/src/screens/HomeScreen.js)
- [ShopScreen.js](/Users/valentinstrasser/Documents/New project/mobile/src/screens/ShopScreen.js)
- [RewardsScreen.js](/Users/valentinstrasser/Documents/New project/mobile/src/screens/RewardsScreen.js)
- [ProfileScreen.js](/Users/valentinstrasser/Documents/New project/mobile/src/screens/ProfileScreen.js)
- [ScanScreen.js](/Users/valentinstrasser/Documents/New project/mobile/src/screens/ScanScreen.js)
- [HeaderSearchOverlay.js](/Users/valentinstrasser/Documents/New project/mobile/src/overlays/HeaderSearchOverlay.js)
- [CartOverlay.js](/Users/valentinstrasser/Documents/New project/mobile/src/overlays/CartOverlay.js)
- [tokens.js](/Users/valentinstrasser/Documents/New project/mobile/src/theme/tokens.js)

## Important Constraint

The Mowgli export is not only a visual redesign. It also assumes additional screens and flows that the current Curabo mobile app does not fully implement yet.

That means adoption must be split into:

1. screens that can be visually adapted now
2. screens that require new state/routing/data later

## Screen Mapping

### Onboarding and auth

- Mowgli [SplashScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/SplashScreen.tsx)
  maps to Curabo boot/loading state inside [App.js](/Users/valentinstrasser/Documents/New project/mobile/App.js)
- Mowgli [ClinicSelectionScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/ClinicSelectionScreen.tsx)
  maps to Curabo clinic search and clinic selection inside [OnboardingScreen.js](/Users/valentinstrasser/Documents/New project/mobile/src/screens/OnboardingScreen.js)
- Mowgli [AuthScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/AuthScreen.tsx)
  maps to Curabo phone input, OTP verification, guest mode, and profile setup inside [OnboardingScreen.js](/Users/valentinstrasser/Documents/New project/mobile/src/screens/OnboardingScreen.js)

Adoption status:
- High priority
- Can be adopted now with existing logic
- Best first visible redesign target

### Home

- Mowgli [HomeScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/HomeScreen.tsx)
  maps to Curabo [HomeScreen.js](/Users/valentinstrasser/Documents/New project/mobile/src/screens/HomeScreen.js)

Key overlaps:
- header
- hero / featured area
- popular treatments
- membership promotion
- quick actions
- articles / knowledge section

Key differences:
- Mowgli assumes a darker luxury editorial shell
- Curabo currently also contains clinic card and map directly in home

Adoption status:
- High priority
- Can be adopted now
- Needs clinic contact/map section folded into the new visual system

### Shop

- Mowgli [ShopScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/ShopScreen.tsx)
  maps to Curabo [ShopScreen.js](/Users/valentinstrasser/Documents/New project/mobile/src/screens/ShopScreen.js)
- Mowgli [TreatmentDetailScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/TreatmentDetailScreen.tsx)
  maps to Curabo selected-treatment detail mode inside [ShopScreen.js](/Users/valentinstrasser/Documents/New project/mobile/src/screens/ShopScreen.js)
- Mowgli cart overlay state maps to Curabo [CartOverlay.js](/Users/valentinstrasser/Documents/New project/mobile/src/overlays/CartOverlay.js)

Key overlaps:
- shop tabs
- product cards
- memberships
- vouchers/gift concept
- cart

Key differences:
- Curabo currently has treatments, memberships, cart and checkout
- Curabo does not yet have a real voucher product flow
- Mowgli uses a darker premium catalog presentation

Adoption status:
- Highest priority together with onboarding and home
- Treatments and memberships can be visually adopted now
- Voucher tab should be visually scaffolded only after product decision

### Rewards

- Mowgli [RewardsScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/RewardsScreen.tsx)
  maps to Curabo [RewardsScreen.js](/Users/valentinstrasser/Documents/New project/mobile/src/screens/RewardsScreen.js)
- Mowgli [WalletScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/WalletScreen.tsx)
  maps conceptually to the wallet and redemption parts already inside Curabo rewards
- Mowgli [RewardRedemptionScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/RewardRedemptionScreen.tsx)
  is currently not separated in Curabo

Adoption status:
- High priority
- Can be adopted now visually
- likely should stay inside one screen first instead of adding extra routing

### Profile

- Mowgli [ProfileScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/ProfileScreen.tsx)
  maps to Curabo [ProfileScreen.js](/Users/valentinstrasser/Documents/New project/mobile/src/screens/ProfileScreen.js)

Key overlaps:
- account
- membership state
- settings
- clinic connection state

Adoption status:
- High priority
- Can be adopted now

### Scan

- Mowgli [ScanScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/ScanScreen.tsx)
  maps directly to Curabo [ScanScreen.js](/Users/valentinstrasser/Documents/New project/mobile/src/screens/ScanScreen.js)

Adoption status:
- Medium priority
- Can be adopted now

### Articles and contact

- Mowgli [ArticlesScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/ArticlesScreen.tsx)
  maps conceptually to Curabo home article cards
- Mowgli [ArticleDetailScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/ArticleDetailScreen.tsx)
  does not exist yet as a dedicated route in Curabo
- Mowgli [ContactScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/ContactScreen.tsx)
  maps to contact/map pieces currently embedded in Curabo home

Adoption status:
- Medium priority
- Contact can be adopted with existing clinic data
- Article detail needs new route/state

### Appointments and booking

- Mowgli [AppointmentsScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/AppointmentsScreen.tsx)
- Mowgli [AppointmentDetailScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/AppointmentDetailScreen.tsx)
- Mowgli [TimeSlotSelectionScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/TimeSlotSelectionScreen.tsx)
- Mowgli [CheckoutScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/CheckoutScreen.tsx)
- Mowgli [OrderConfirmationScreen.tsx](/Users/valentinstrasser/Documents/New project/mobile/_mowgli_export/screens/OrderConfirmationScreen.tsx)

Current Curabo status:
- checkout exists
- cart exists
- membership checkout exists
- no proper patient appointment list screen
- no dedicated booking slot flow
- no dedicated order confirmation route

Adoption status:
- Not first-wave UI adoption
- Should be second-wave product expansion

## Reusable Design Blocks From Mowgli

These are the highest-value UI patterns to port first:

1. dark shell and premium color/material language
2. typography pairing and editorial hierarchy
3. sticky premium header
4. media-first hero cards
5. treatment cards and horizontal carousels
6. membership card treatment
7. quick action tile system
8. rewards balance card
9. bottom navigation treatment
10. search/cart overlays re-skinned to match the shell

## Recommended Adoption Order

### Wave 1: Pure UI adoption on top of existing logic

1. Theme tokens and shell
2. Onboarding screen
3. Home screen
4. Shop screen
5. Treatment detail mode
6. Rewards screen
7. Profile screen
8. Scan screen
9. Search/cart overlays

### Wave 2: New screens using existing data where possible

1. Contact screen
2. Articles list and article detail
3. Wallet detail view

### Wave 3: Product expansion beyond current Curabo mobile feature set

1. Appointments list
2. Appointment detail
3. Timeslot booking
4. Voucher flow
5. Dedicated checkout screen
6. Order confirmation screen

## Practical Rules

- Do not replace Curabo business logic with Mowgli demo logic.
- Do not port web-specific Tailwind markup literally.
- Rebuild the design in React Native using Curabo state and APIs.
- Keep clinic bundle loading, OTP, rewards, memberships, cart, checkout and scan behavior from Curabo.
- Treat Mowgli as a visual and interaction reference, not as the source of product truth.

## First Build Recommendation

The best first real implementation is:

1. adopt the Mowgli shell and onboarding aesthetics
2. then rebuild Curabo home using the Mowgli home composition
3. then move the shop into the Mowgli dark catalog system

This gives the biggest visible change without waiting for new backend work.
