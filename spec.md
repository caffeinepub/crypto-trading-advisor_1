# Crypto Trading Advisor

## Current State
- 20 hardcoded coins in `data/coins.ts` with simulated signals
- CoinGecko price fetch on startup for those 20
- Left sidebar has nav tabs (Dashboard/Market/Signals/Portfolio) — hidden on mobile (`hidden lg:flex`)
- Mobile top bar has logo + search + coin select dropdown but NO nav tabs
- PortfolioView has a hardcoded static PORTFOLIO array — not user-editable
- White text is `oklch(0.93 0.008 240)`, secondary text is `oklch(0.62 0.015 240)` — some labels too dim

## Requested Changes (Diff)

### Add
- Fetch top 300 coins from CoinGecko `/coins/markets` endpoint (2 pages x 150 or 2 pages x 250) on app load; generate simulated RSI/signal/momentum for each; merge with existing 20 coins
- Mobile bottom navigation bar (fixed, above footer) with Dashboard/Market/Signals/Portfolio tabs — visible only on mobile
- User-editable portfolio: anyone can add a coin (search from the 300 list), enter a quantity, and remove holdings; stored in localStorage so it persists across sessions
- Add/Edit/Remove holdings UI in PortfolioView with a dialog or inline form

### Modify
- `data/coins.ts`: extract `generateCoinFromMarket()` helper that converts a CoinGecko market item into a CoinData with simulated signals
- `App.tsx`: fetch top 300 on mount (replacing the 20-coin fetch), set all 300 as coins state
- `CoinSidebar.tsx`: search now searches across all 300 coins
- `PortfolioView.tsx`: replace static PORTFOLIO with localStorage state; add coin picker + amount input
- Text: brighten secondary/muted text from `oklch(0.62 0.015 240)` to `oklch(0.72 0.015 240)` for better readability in labels; foreground text stays `oklch(0.95 0.008 240)`
- Mobile top bar: keep existing search+select but also add nav tab row below it

### Remove
- Hardcoded PORTFOLIO constant in PortfolioView
- Hardcoded SYMBOL_TO_GECKO mapping in App.tsx (now dynamic from CoinGecko response)

## Implementation Plan
1. Update `data/coins.ts`: add `generateCoinFromMarketData()` that takes a CoinGecko market item and returns CoinData with seeded-random signals
2. Update `App.tsx`: fetch top 300 coins from CoinGecko markets endpoint on mount, call generateCoinFromMarketData for each, setState with all 300
3. Add mobile bottom nav bar in `App.tsx` (fixed bottom, `md:hidden`)
4. Update `PortfolioView.tsx`: localStorage portfolio state, coin search/add dialog, quantity input, remove button
5. Improve text contrast across all components: secondary text from 0.62 → 0.72 lightness
