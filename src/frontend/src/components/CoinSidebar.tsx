import { Search } from "lucide-react";
import { useState } from "react";
import type { CoinData } from "../data/coins";
import { formatPrice } from "../utils/chartUtils";

type TabName = "Dashboard" | "Market" | "Signals" | "Portfolio";

interface CoinSidebarProps {
  coins: CoinData[];
  selectedCoin: CoinData | null;
  onSelectCoin: (coin: CoinData) => void;
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

export function CoinAvatar({
  coin,
  size = 28,
}: { coin: CoinData; size?: number }) {
  const initials = coin.symbol.slice(0, 2);
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 text-white font-bold"
      style={{
        width: size,
        height: size,
        backgroundColor: coin.iconColor,
        fontSize: size * 0.35,
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

export function CoinSidebar({
  coins,
  selectedCoin,
  onSelectCoin,
  activeTab,
  onTabChange,
}: CoinSidebarProps) {
  const [search, setSearch] = useState("");

  const filtered = coins.filter(
    (c) =>
      c.symbol.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <aside
      className="flex flex-col border-r border-border"
      style={{
        backgroundColor: "oklch(0.11 0.013 243)",
        width: 200,
        minWidth: 200,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div
          className="w-7 h-7 rounded flex items-center justify-center"
          style={{ backgroundColor: "oklch(0.67 0.18 243 / 0.2)" }}
        >
          <svg
            width="16"
            height="16"
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

      {/* Nav tabs */}
      <nav className="flex flex-col px-2 py-2 gap-0.5 border-b border-border">
        {(["Dashboard", "Market", "Signals", "Portfolio"] as TabName[]).map(
          (tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                type="button"
                key={tab}
                data-ocid={`nav.${tab.toLowerCase()}.link`}
                onClick={() => onTabChange(tab)}
                className="text-left text-xs px-2 py-1.5 rounded transition-colors"
                style={{
                  color: isActive
                    ? "oklch(0.67 0.18 243)"
                    : "oklch(0.72 0.015 240)",
                  backgroundColor: isActive
                    ? "oklch(0.67 0.18 243 / 0.1)"
                    : "transparent",
                }}
              >
                {tab}
              </button>
            );
          },
        )}
      </nav>

      {/* Search */}
      <div className="px-3 py-2 border-b border-border">
        <div className="relative">
          <Search
            className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3"
            style={{ color: "oklch(0.72 0.015 240)" }}
          />
          <input
            data-ocid="sidebar.search_input"
            type="text"
            placeholder="Search 300+ coins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-6 pr-2 py-1.5 rounded text-xs outline-none border border-border"
            style={{
              backgroundColor: "oklch(0.14 0.014 243)",
              color: "oklch(0.95 0.008 240)",
            }}
          />
        </div>
      </div>

      {/* Assets header */}
      <div className="flex items-center justify-between px-3 py-2">
        <span
          className="text-xs font-semibold tracking-wider"
          style={{ color: "oklch(0.72 0.015 240)" }}
        >
          ASSETS ({filtered.length})
        </span>
        <span className="text-xs" style={{ color: "oklch(0.72 0.015 240)" }}>
          24H
        </span>
      </div>

      {/* Coin list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((coin, idx) => {
          const isSelected = selectedCoin?.symbol === coin.symbol;
          const isPositive = coin.priceChange24h >= 0;
          return (
            <button
              type="button"
              key={coin.symbol}
              data-ocid={`sidebar.item.${idx + 1}`}
              onClick={() => onSelectCoin(coin)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-muted/50"
              style={{
                backgroundColor: isSelected
                  ? "oklch(0.67 0.18 243 / 0.08)"
                  : undefined,
                borderLeft: isSelected
                  ? "2px solid oklch(0.67 0.18 243)"
                  : "2px solid transparent",
              }}
            >
              <CoinAvatar coin={coin} size={26} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    {coin.symbol}
                  </span>
                  <span
                    className="text-xs font-mono"
                    style={{
                      color: isPositive
                        ? "oklch(0.82 0.22 155)"
                        : "oklch(0.63 0.22 25)",
                    }}
                  >
                    {isPositive ? "+" : ""}
                    {coin.priceChange24h.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.72 0.015 240)" }}
                  >
                    {coin.name.slice(0, 10)}
                  </span>
                  <span
                    className="text-xs font-mono"
                    style={{ color: "oklch(0.75 0.01 240)", fontSize: 10 }}
                  >
                    {formatPrice(coin.currentPrice)
                      .replace("$", "")
                      .slice(0, 8)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div
            data-ocid="sidebar.empty_state"
            className="px-3 py-4 text-xs text-center"
            style={{ color: "oklch(0.72 0.015 240)" }}
          >
            No coins found
          </div>
        )}
      </div>
    </aside>
  );
}
