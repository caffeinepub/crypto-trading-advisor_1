import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { Lock, Search, Settings2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CoinDetailMain } from "./components/CoinDetailMain";
import { CoinSidebar } from "./components/CoinSidebar";
import { DisclaimerBanner } from "./components/DisclaimerBanner";
import { LockScreen } from "./components/LockScreen";
import { LockSettings } from "./components/LockSettings";
import { MarketView } from "./components/MarketView";
import { PortfolioView } from "./components/PortfolioView";
import { SignalsView } from "./components/SignalsView";
import {
  type CoinData,
  type MASignal,
  type SignalType,
  initCoins,
} from "./data/coins";
import { useLockStore } from "./hooks/useLockStore";
import {
  useAddToWatchlist,
  useRemoveFromWatchlist,
  useWatchlist,
} from "./hooks/useQueries";

type TabName = "Dashboard" | "Market" | "Signals" | "Portfolio";

function marketItemToCoin(item: any): CoinData {
  const price = item.current_price ?? 0;
  const change = item.price_change_percentage_24h ?? 0;
  const seed = (item.symbol as string)
    .split("")
    .reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
  const rsi = 30 + (seed % 50);
  const momentum = (seed % 100) - 50;
  const signalIdx = seed % 5;
  const signals: SignalType[] = [
    "Strong Buy",
    "Buy",
    "Hold",
    "Sell",
    "Strong Sell",
  ];
  const signal = signals[signalIdx];
  const strength = 40 + (seed % 50);
  const maSignals: MASignal[] = ["buy", "neutral", "sell"];
  const maSignal = maSignals[seed % 3];

  const history: number[] = [];
  let p = price * 0.95;
  for (let i = 0; i < 20; i++) {
    p = p * (1 + (((seed * (i + 1)) % 10) - 5) * 0.003);
    history.push(Math.max(p, price * 0.001));
  }
  history[history.length - 1] = price;

  const colors = [
    "#F7931A",
    "#627EEA",
    "#3B00B9",
    "#00AAE4",
    "#F0B90B",
    "#9945FF",
    "#0033AD",
    "#E84142",
    "#8247E5",
    "#2A5ADA",
    "#FF007A",
    "#B6509E",
    "#1A1F6C",
    "#2F8AF5",
    "#15BDFF",
    "#7D00FF",
    "#E6007A",
    "#04ADEF",
    "#1E90FF",
    "#22C55E",
  ];
  const iconColor = colors[seed % colors.length];

  return {
    symbol: (item.symbol as string).toUpperCase(),
    name: item.name,
    currentPrice: price,
    priceChange24h: change,
    rsi,
    maSignal,
    momentum,
    signal,
    signalStrength: strength,
    reasoning: `${item.name} market data. RSI at ${rsi}. Simulated signal for educational purposes.`,
    entryStrategy: "This is simulated data. Not financial advice.",
    exitStrategy: "This is simulated data. Not financial advice.",
    miniPriceHistory: history,
    volume24h: item.total_volume ?? 0,
    iconColor,
  };
}

export default function App() {
  const [coins, setCoins] = useState<CoinData[]>(() => initCoins());
  const [selectedCoin, setSelectedCoin] = useState<CoinData>(
    () => initCoins()[0],
  );
  const [mobileSearch, setMobileSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabName>("Dashboard");
  const [lockSettingsOpen, setLockSettingsOpen] = useState(false);

  const { data: watchlist } = useWatchlist();
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();
  const { isLocked, isEnabled, lockApp, unlockApp } = useLockStore();

  // Fetch top 1500 coins from CoinGecko on mount (10 pages × 150)
  useEffect(() => {
    const pages = Array.from({ length: 10 }, (_, i) =>
      fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=150&page=${i + 1}&sparkline=false&price_change_percentage=24h`,
      ).then((r) => r.json()),
    );
    Promise.allSettled(pages)
      .then((results) => {
        const all = results.flatMap((r) =>
          r.status === "fulfilled" && Array.isArray(r.value) ? r.value : [],
        );
        const seen = new Set<string>();
        const unique = all.filter((item) => {
          const sym = (item.symbol as string).toUpperCase();
          if (seen.has(sym)) return false;
          seen.add(sym);
          return true;
        });
        if (unique.length > 0) {
          const newCoins = unique.map(marketItemToCoin);
          setCoins(newCoins);
          setSelectedCoin(newCoins[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Keep selectedCoin in sync with coins updates
  useEffect(() => {
    setSelectedCoin(
      (prev) => coins.find((c) => c.symbol === prev.symbol) ?? prev,
    );
  }, [coins]);

  const handleAddWatch = useCallback(
    (symbol: string) => {
      addToWatchlist.mutate(symbol, {
        onSuccess: () => toast.success(`${symbol} added to watchlist`),
        onError: () => toast.error("Failed to add to watchlist"),
      });
    },
    [addToWatchlist],
  );

  const handleRemoveWatch = useCallback(
    (symbol: string) => {
      removeFromWatchlist.mutate(symbol, {
        onSuccess: () => toast.success(`${symbol} removed from watchlist`),
        onError: () => toast.error("Failed to remove from watchlist"),
      });
    },
    [removeFromWatchlist],
  );

  const filteredMobileCoins = mobileSearch
    ? coins.filter(
        (c) =>
          c.symbol.toLowerCase().includes(mobileSearch.toLowerCase()) ||
          c.name.toLowerCase().includes(mobileSearch.toLowerCase()),
      )
    : coins;

  const isWatched = (watchlist ?? []).includes(selectedCoin.symbol);

  const handleSelectCoinAndDash = (coin: CoinData) => {
    setSelectedCoin(coin);
    setActiveTab("Dashboard");
  };

  const handleLockIconClick = () => {
    if (isEnabled) {
      lockApp();
    } else {
      setLockSettingsOpen(true);
    }
  };

  return (
    <div
      className="flex flex-col"
      style={{
        minHeight: "100vh",
        backgroundColor: "oklch(0.09 0.012 243)",
        overflowX: "hidden",
      }}
    >
      {/* Lock screen overlay */}
      {isLocked && <LockScreen onUnlock={unlockApp} />}

      <DisclaimerBanner />

      {/* Mobile top bar */}
      <div
        className="lg:hidden flex items-center gap-2 px-3 py-2 border-b border-border"
        style={{ backgroundColor: "oklch(0.11 0.013 243)" }}
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ backgroundColor: "oklch(0.67 0.18 243 / 0.2)" }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              role="presentation"
            >
              <polyline
                points="1,12 5,7 9,10 15,3"
                stroke="oklch(0.67 0.18 243)"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            className="font-bold text-sm"
            style={{ color: "oklch(0.67 0.18 243)" }}
          >
            CoinAlert
          </span>
        </div>
        <div className="relative flex-1">
          <Search
            className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3"
            style={{ color: "oklch(0.72 0.015 240)" }}
          />
          <input
            data-ocid="mobile.search_input"
            type="text"
            placeholder="Search 1500+ coins..."
            value={mobileSearch}
            onChange={(e) => setMobileSearch(e.target.value)}
            className="w-full pl-6 pr-2 py-1.5 rounded text-xs outline-none border border-border"
            style={{
              backgroundColor: "oklch(0.14 0.014 243)",
              color: "oklch(0.95 0.008 240)",
            }}
          />
        </div>
        <Select
          value={selectedCoin.symbol}
          onValueChange={(val) => {
            const coin = coins.find((c) => c.symbol === val);
            if (coin) handleSelectCoinAndDash(coin);
          }}
        >
          <SelectTrigger
            data-ocid="mobile.select"
            className="w-28 h-7 text-xs border-border shrink-0"
            style={{
              backgroundColor: "oklch(0.14 0.014 243)",
              color: "oklch(0.95 0.008 240)",
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            style={{
              backgroundColor: "oklch(0.15 0.016 243)",
              borderColor: "oklch(0.22 0.016 243)",
            }}
          >
            {filteredMobileCoins.slice(0, 200).map((coin) => (
              <SelectItem
                key={coin.symbol}
                value={coin.symbol}
                className="text-xs"
              >
                {coin.symbol} — {coin.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Lock icon - mobile */}
        <button
          type="button"
          data-ocid="lock.open_modal_button"
          onClick={handleLockIconClick}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
          style={{
            backgroundColor: isEnabled
              ? "oklch(0.67 0.18 243 / 0.15)"
              : "oklch(0.16 0.014 243)",
            border: "1px solid oklch(0.26 0.016 243)",
            color: isEnabled ? "oklch(0.67 0.18 243)" : "oklch(0.6 0.01 240)",
          }}
          title={isEnabled ? "Lock app" : "Set up app lock"}
        >
          <Lock className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          data-ocid="lock.secondary_button"
          onClick={() => setLockSettingsOpen(true)}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
          style={{
            backgroundColor: "oklch(0.16 0.014 243)",
            border: "1px solid oklch(0.26 0.016 243)",
            color: "oklch(0.6 0.01 240)",
          }}
          title="Lock settings"
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Desktop lock buttons (top right) */}
      <div className="hidden lg:flex items-center gap-2 absolute top-2 right-4 z-40">
        <button
          type="button"
          data-ocid="lock.open_modal_button"
          onClick={handleLockIconClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{
            backgroundColor: isEnabled
              ? "oklch(0.67 0.18 243 / 0.15)"
              : "oklch(0.16 0.014 243)",
            border: "1px solid oklch(0.26 0.016 243)",
            color: isEnabled ? "oklch(0.67 0.18 243)" : "oklch(0.72 0.015 240)",
          }}
          title={isEnabled ? "Lock app now" : "Set up app lock"}
        >
          <Lock className="w-3.5 h-3.5" />
          {isEnabled ? "Lock" : "Setup Lock"}
        </button>
        <button
          type="button"
          data-ocid="lock.secondary_button"
          onClick={() => setLockSettingsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{
            backgroundColor: "oklch(0.16 0.014 243)",
            border: "1px solid oklch(0.26 0.016 243)",
            color: "oklch(0.72 0.015 240)",
          }}
          title="Lock settings"
        >
          <Settings2 className="w-3.5 h-3.5" />
          Lock Settings
        </button>
      </div>

      {/* Centered max-width wrapper */}
      <div
        className="flex flex-1"
        style={{ maxWidth: 1400, margin: "0 auto", width: "100%" }}
      >
        {/* Left Sidebar - hidden on mobile/tablet */}
        <div
          className="hidden lg:flex flex-col"
          style={{ height: "calc(100vh - 56px)", position: "sticky", top: 56 }}
        >
          <CoinSidebar
            coins={coins}
            selectedCoin={selectedCoin}
            onSelectCoin={(coin) => {
              setSelectedCoin(coin);
              setActiveTab("Dashboard");
            }}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Main Content */}
        <div
          className="flex-1 overflow-y-auto pb-16 lg:pb-0"
          style={{ minWidth: 0 }}
        >
          {activeTab === "Dashboard" && (
            <CoinDetailMain
              coin={selectedCoin}
              isWatched={isWatched}
              onAddWatch={handleAddWatch}
              onRemoveWatch={handleRemoveWatch}
            />
          )}
          {activeTab === "Market" && (
            <MarketView coins={coins} onSelectCoin={handleSelectCoinAndDash} />
          )}
          {activeTab === "Signals" && (
            <SignalsView coins={coins} onSelectCoin={handleSelectCoinAndDash} />
          )}
          {activeTab === "Portfolio" && <PortfolioView coins={coins} />}
        </div>
      </div>

      <footer
        className="border-t border-border px-4 py-3 text-center"
        style={{ backgroundColor: "oklch(0.11 0.013 243)" }}
      >
        <p className="text-xs" style={{ color: "oklch(0.55 0.01 240)" }}>
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "oklch(0.67 0.18 243)" }}
          >
            caffeine.ai
          </a>{" "}
          &mdash;{" "}
          <span style={{ color: "oklch(0.45 0.01 240)" }}>
            Simulated data. Not financial advice.
          </span>
        </p>
      </footer>

      {/* Mobile bottom nav */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-border"
        style={{ backgroundColor: "oklch(0.11 0.013 243)" }}
      >
        {(["Dashboard", "Market", "Signals", "Portfolio"] as TabName[]).map(
          (tab) => {
            const isActive = activeTab === tab;
            const icons: Record<TabName, string> = {
              Dashboard: "📊",
              Market: "📈",
              Signals: "🔔",
              Portfolio: "💼",
            };
            return (
              <button
                key={tab}
                type="button"
                data-ocid={`nav.${tab.toLowerCase()}.link`}
                onClick={() => setActiveTab(tab)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
                style={{
                  minHeight: 56,
                  color: isActive
                    ? "oklch(0.67 0.18 243)"
                    : "oklch(0.72 0.015 240)",
                  backgroundColor: isActive
                    ? "oklch(0.67 0.18 243 / 0.08)"
                    : "transparent",
                  borderTop: isActive
                    ? "2px solid oklch(0.67 0.18 243)"
                    : "2px solid transparent",
                }}
              >
                <span style={{ fontSize: 18 }}>{icons[tab]}</span>
                <span
                  style={{ fontSize: 10, fontWeight: isActive ? 700 : 400 }}
                >
                  {tab}
                </span>
              </button>
            );
          },
        )}
      </nav>

      {/* Lock Settings modal */}
      <LockSettings
        open={lockSettingsOpen}
        onClose={() => setLockSettingsOpen(false)}
      />

      <Toaster />
    </div>
  );
}
