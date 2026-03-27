import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CoinDetailMain } from "./components/CoinDetailMain";
import { CoinSidebar } from "./components/CoinSidebar";
import { DisclaimerBanner } from "./components/DisclaimerBanner";
import { MarketView } from "./components/MarketView";
import { PortfolioView } from "./components/PortfolioView";
import { RightPanel } from "./components/RightPanel";
import { SignalsView } from "./components/SignalsView";
import { type CoinData, fluctuateCoins, initCoins } from "./data/coins";
import {
  useAddToWatchlist,
  useRemoveFromWatchlist,
  useWatchlist,
} from "./hooks/useQueries";

type TabName = "Dashboard" | "Market" | "Signals" | "Portfolio";

// CoinGecko ID mapping
const SYMBOL_TO_GECKO: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  ICP: "internet-computer",
  XRP: "ripple",
  BNB: "binancecoin",
  SOL: "solana",
  ADA: "cardano",
  DOT: "polkadot",
  AVAX: "avalanche-2",
  MATIC: "matic-network",
  LINK: "chainlink",
  UNI: "uniswap",
  AAVE: "aave",
  FET: "fetch-ai",
  XDC: "xdcnetwork",
  VET: "vechain",
  XLM: "stellar",
  KSM: "kusama",
  SAND: "the-sandbox",
  ILV: "illuvium",
};

export default function App() {
  const [coins, setCoins] = useState<CoinData[]>(() => initCoins());
  const [selectedCoin, setSelectedCoin] = useState<CoinData>(
    () => initCoins()[0],
  );
  const [mobileSearch, setMobileSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabName>("Dashboard");

  const { data: watchlist } = useWatchlist();
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  // Fetch live prices from CoinGecko on mount
  useEffect(() => {
    const geckoIds = Object.values(SYMBOL_TO_GECKO).join(",");
    fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${geckoIds}&vs_currencies=usd&include_24hr_change=true`,
    )
      .then((r) => r.json())
      .then((data) => {
        const geckoToSymbol: Record<string, string> = {};
        for (const [sym, id] of Object.entries(SYMBOL_TO_GECKO)) {
          geckoToSymbol[id] = sym;
        }
        setCoins((prev) =>
          prev.map((coin) => {
            const geckoId = SYMBOL_TO_GECKO[coin.symbol];
            const info = geckoId ? data[geckoId] : null;
            if (!info) return coin;
            const newPrice =
              typeof info.usd === "number" && Number.isFinite(info.usd)
                ? info.usd
                : null;
            if (newPrice === null) return coin;
            const newChange =
              typeof info.usd_24h_change === "number" &&
              Number.isFinite(info.usd_24h_change)
                ? info.usd_24h_change
                : coin.priceChange24h;
            // Regenerate mini price history anchored at new price
            const newHistory: number[] = [];
            let p = newPrice * (0.93 + Math.random() * 0.08);
            for (let i = 0; i < 20; i++) {
              p = p * (1 + (Math.random() - 0.49) * 0.025);
              newHistory.push(p);
            }
            newHistory[newHistory.length - 1] = newPrice;
            return {
              ...coin,
              currentPrice: newPrice,
              priceChange24h: newChange,
              miniPriceHistory: newHistory,
            };
          }),
        );
      })
      .catch(() => {
        // Silently fall back to simulated data
      });
  }, []);

  // Keep selectedCoin in sync with coins updates
  useEffect(() => {
    setSelectedCoin(
      (prev) => coins.find((c) => c.symbol === prev.symbol) ?? prev,
    );
  }, [coins]);

  // Fluctuate prices every 3 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setCoins((prev) => fluctuateCoins(prev));
    }, 3000);
    return () => clearInterval(id);
  }, []);

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

  return (
    <div
      className="flex flex-col"
      style={{
        minHeight: "100vh",
        backgroundColor: "oklch(0.09 0.012 243)",
        overflowX: "hidden",
      }}
    >
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
            className="font-display font-bold text-sm"
            style={{ color: "oklch(0.67 0.18 243)" }}
          >
            CoinAlert
          </span>
        </div>
        <div className="relative flex-1">
          <Search
            className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3"
            style={{ color: "oklch(0.62 0.015 240)" }}
          />
          <input
            data-ocid="mobile.search_input"
            type="text"
            placeholder="Search coins..."
            value={mobileSearch}
            onChange={(e) => setMobileSearch(e.target.value)}
            className="w-full pl-6 pr-2 py-1.5 rounded text-xs outline-none border border-border"
            style={{
              backgroundColor: "oklch(0.14 0.014 243)",
              color: "oklch(0.93 0.008 240)",
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
              color: "oklch(0.93 0.008 240)",
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
            {filteredMobileCoins.map((coin) => (
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

        {/* Center Main */}
        <div className="flex-1 overflow-y-auto" style={{ minWidth: 0 }}>
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

        {/* Right Sidebar - shown on md+ */}
        <div
          className="hidden md:flex flex-col"
          style={{ height: "calc(100vh - 56px)", position: "sticky", top: 56 }}
        >
          <RightPanel coins={coins} selectedCoin={selectedCoin} />
        </div>
      </div>

      {/* Mobile: Right panel stacked below */}
      <div className="md:hidden">
        <RightPanel coins={coins} selectedCoin={selectedCoin} />
      </div>

      <footer
        className="border-t border-border px-4 py-3 text-center"
        style={{ backgroundColor: "oklch(0.11 0.013 243)" }}
      >
        <p className="text-xs" style={{ color: "oklch(0.45 0.01 240)" }}>
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

      <Toaster />
    </div>
  );
}
