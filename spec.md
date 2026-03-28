# Crypto Trading Advisor

## Current State
All user data (portfolio holdings, trades, price alerts, and app lock PIN/biometric) is stored exclusively in browser `localStorage`. When the user clears browser history or site data, all settings are permanently lost.

The backend canister only stores a shared watchlist with no per-user persistence.

## Requested Changes (Diff)

### Add
- Backend `saveUserData(key: Text, json: Text)` and `getUserData(key: Text)` canister functions for per-account cloud storage.
- On first launch, generate a random UUID as the user's account key and save it to localStorage.
- Load all data (portfolio, trades, alerts, lock settings) from canister on startup using the account key.
- Save to canister on every change as primary storage (localStorage as secondary cache).
- "Account Key" panel in settings showing the UUID with copy button + "Restore from key" input so users can recover data on new devices/after clearing browser data.

### Modify
- `useLockStore`: read/write PIN hash and biometric cred from canister (via account key) in addition to localStorage.
- `useAlerts`: read/write alerts from canister.
- `PortfolioView`: read/write holdings and trades from canister.
- App.tsx: initialize account key on startup, sync canister data.

### Remove
- None. Keep localStorage as a fast local cache, canister is source of truth.

## Implementation Plan
1. Update `main.mo` to add `saveUserData(key, json)` and `getUserData(key)` functions using a stable HashMap.
2. Create `src/frontend/src/hooks/useAccountKey.ts` — generates/retrieves UUID, provides save/load helpers that call canister.
3. Create `src/frontend/src/hooks/useCloudStorage.ts` — wraps canister save/load with JSON parsing, debounced saves.
4. Update `useLockStore.ts` to persist lock settings to canister.
5. Update `useAlerts.ts` to persist alerts to canister.
6. Update `PortfolioView.tsx` to persist holdings and trades to canister.
7. Add Account Key recovery UI (small card in settings or footer with copy + restore input).
