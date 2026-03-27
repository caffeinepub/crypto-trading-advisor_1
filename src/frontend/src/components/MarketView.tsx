import { useMemo, useState } from "react";
import type { CoinData } from "../data/coins";
import { getSignalColor } from "../data/coins";
import { formatPrice } from "../utils/chartUtils";
import { CoinAvatar } from "./CoinSidebar";

const PAGE_SIZE = 100;

interface Props {
  coins: CoinData[];
  onSelectCoin: (coin: CoinData) => void;
}

export function MarketView({ coins, onSelectCoin }: Props) {
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return coins;
    return coins.filter(
      (c) =>
        c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
    );
  }, [coins, search]);

  const isSearchActive = search.trim().length > 0;
  const displayed = isSearchActive ? filtered : filtered.slice(0, visibleCount);
  const canLoadMore = !isSearchActive && visibleCount < filtered.length;

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-4"
      style={{ backgroundColor: "oklch(0.09 0.012 243)" }}
    >
      <div className="mb-4">
        <h2
          className="font-display font-bold text-base"
          style={{ color: "oklch(0.93 0.008 240)" }}
        >
          Market Overview
        </h2>
        <p
          className="text-xs mt-0.5"
          style={{ color: "oklch(0.62 0.015 240)" }}
        >
          Showing {displayed.length} of {coins.length} coins
        </p>
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by name or symbol…"
          data-ocid="market.search_input"
          className="w-full rounded px-3 py-2 text-xs outline-none"
          style={{
            backgroundColor: "oklch(0.13 0.014 243)",
            border: "1px solid oklch(0.22 0.015 243)",
            color: "oklch(0.93 0.008 240)",
          }}
        />
      </div>

      <div
        className="rounded overflow-hidden"
        style={{ border: "1px solid oklch(0.2 0.014 243)" }}
      >
        {/* Table header */}
        <div
          className="grid text-xs font-semibold tracking-wider px-3 py-2"
          style={{
            backgroundColor: "oklch(0.13 0.014 243)",
            color: "oklch(0.62 0.015 240)",
            gridTemplateColumns: "2fr 1.2fr 0.8fr 1fr 0.8fr 1fr",
          }}
          data-ocid="market.table"
        >
          <span>COIN</span>
          <span className="text-right">PRICE</span>
          <span className="text-right">24H%</span>
          <span className="text-center">SIGNAL</span>
          <span className="text-center">STRENGTH</span>
          <span className="text-right">VOLUME</span>
        </div>

        {displayed.length === 0 ? (
          <div
            className="text-center text-xs py-8"
            style={{ color: "oklch(0.62 0.015 240)" }}
            data-ocid="market.empty_state"
          >
            No coins match &ldquo;{search}&rdquo;
          </div>
        ) : (
          displayed.map((coin, idx) => {
            const isPositive = coin.priceChange24h >= 0;
            const signalColor = getSignalColor(coin.signal);
            return (
              <button
                type="button"
                key={coin.symbol}
                data-ocid={`market.item.${idx + 1}`}
                onClick={() => onSelectCoin(coin)}
                className="w-full grid text-left px-3 py-2.5 transition-colors hover:bg-white/5"
                style={{
                  gridTemplateColumns: "2fr 1.2fr 0.8fr 1fr 0.8fr 1fr",
                  borderTop: "1px solid oklch(0.16 0.013 243)",
                }}
              >
                <div className="flex items-center gap-2">
                  <CoinAvatar coin={coin} size={22} />
                  <div>
                    <div
                      className="text-xs font-semibold"
                      style={{ color: "oklch(0.93 0.008 240)" }}
                    >
                      {coin.symbol}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "oklch(0.62 0.015 240)", fontSize: 10 }}
                    >
                      {coin.name}
                    </div>
                  </div>
                </div>
                <div
                  className="text-right font-mono text-xs self-center"
                  style={{ color: "oklch(0.93 0.008 240)" }}
                >
                  {formatPrice(coin.currentPrice)}
                </div>
                <div
                  className="text-right font-mono text-xs self-center"
                  style={{
                    color: isPositive
                      ? "oklch(0.82 0.22 155)"
                      : "oklch(0.63 0.22 25)",
                  }}
                >
                  {isPositive ? "+" : ""}
                  {coin.priceChange24h.toFixed(2)}%
                </div>
                <div className="flex justify-center self-center">
                  <span
                    className="text-xs font-semibold px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `${signalColor}22`,
                      color: signalColor,
                      fontSize: 10,
                    }}
                  >
                    {coin.signal}
                  </span>
                </div>
                <div className="flex justify-center items-center gap-1 self-center">
                  <div
                    className="h-1 rounded-full"
                    style={{
                      width: 40,
                      backgroundColor: "oklch(0.2 0.014 243)",
                    }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${coin.signalStrength}%`,
                        backgroundColor: signalColor,
                      }}
                    />
                  </div>
                  <span
                    className="font-mono"
                    style={{ color: signalColor, fontSize: 10 }}
                  >
                    {coin.signalStrength}%
                  </span>
                </div>
                <div
                  className="text-right font-mono text-xs self-center"
                  style={{ color: "oklch(0.67 0.18 243)" }}
                >
                  ${(coin.volume24h / 1e6).toFixed(2)}M
                </div>
              </button>
            );
          })
        )}
      </div>

      {canLoadMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            data-ocid="market.secondary_button"
            onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            className="text-xs px-5 py-2 rounded transition-colors hover:opacity-80"
            style={{
              backgroundColor: "oklch(0.18 0.018 243)",
              border: "1px solid oklch(0.28 0.018 243)",
              color: "oklch(0.75 0.12 243)",
            }}
          >
            Load more ({Math.min(PAGE_SIZE, filtered.length - visibleCount)}{" "}
            more)
          </button>
        </div>
      )}
    </div>
  );
}
