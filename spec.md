# Crypto Trading Advisor

## Current State
Full crypto trading advisor app with CoinGecko live prices, Buy/Sell/Hold signals, portfolio, watchlist, and mobile-responsive layout. No authentication or app lock mechanism exists.

## Requested Changes (Diff)

### Add
- App Lock screen that appears on first load (if lock is enabled) and when user manually locks the app
- Settings page / modal where users can:
  - Set a numeric PIN or password to lock the app
  - Enable fingerprint/biometric unlock (using Web Authentication API / navigator.credentials)
  - Disable app lock
- Lock screen UI with:
  - PIN/password input field
  - "Use Fingerprint" button (shown only if biometrics are set up and available)
  - Unlock button
- Lock icon in the app header/nav to manually lock the app
- Lock settings stored in localStorage (hashed PIN, biometric credential ID)

### Modify
- App header or nav bar: add a lock icon button to trigger manual lock and open lock settings

### Remove
- Nothing

## Implementation Plan
1. Create `useLockStore` hook managing lock state in localStorage: isPinSet, isLocked, biometricEnabled
2. Create `LockScreen` component: shows PIN input + optional fingerprint button, handles unlock
3. Create `LockSettings` component/modal: set/change PIN, enable/disable biometric, enable/disable lock
4. Wire biometric via `navigator.credentials.create` (registration) and `navigator.credentials.get` (auth) using WebAuthn with platform authenticator
5. Hash PIN with subtle crypto (SHA-256) before storing
6. Add lock icon to nav bar that locks app and opens settings
7. Wrap main app content — if locked, show LockScreen instead
