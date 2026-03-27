import type { CoinData } from "../data/coins";
import { getSignalColor } from "../data/coins";
import { formatPrice } from "../utils/chartUtils";
import { CoinAvatar } from "./CoinSidebar";

interface Props {
  coins: CoinData[];
}

const PORTFOLIO: { symbol: string; amount: number }[] = [
  { symbol: "BTC", amount: 0.42 },
  { symbol: "ETH", amount: 3.15 },
  { symbol: "SOL", amount: 12.8 },
  { symbol: "ICP", amount: 220 },
];

export function PortfolioView({ coins }: Props) {
  const holdings = PORTFOLIO.map((h) => {
    const coin = coins.find((c) => c.symbol === h.symbol);
    const value = coin ? coin.currentPrice * h.amount : 0;
    return { ...h, coin, value };
  });

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      style={{ backgroundColor: "oklch(0.09 0.012 243)" }}
    >
      <div className="mb-2">
        <h2
          className="font-display font-bold text-base"
          style={{ color: "oklch(0.93 0.008 240)" }}
        >
          Portfolio
        </h2>
        <p
          className="text-xs mt-0.5"
          style={{ color: "oklch(0.62 0.015 240)" }}
        >
          Demo portfolio — simulated values
        </p>
      </div>

      {/* Total */}
      <div
        className="rounded p-4"
        style={{
          backgroundColor: "oklch(0.13 0.014 243)",
          border: "1px solid oklch(0.2 0.014 243)",
        }}
      >
        <div
          className="text-xs tracking-wider mb-1"
          style={{ color: "oklch(0.62 0.015 240)" }}
        >
          TOTAL VALUE
        </div>
        <div
          className="font-display font-bold text-2xl"
          style={{ color: "oklch(0.67 0.18 243)" }}
          data-ocid="portfolio.card"
        >
          {formatPrice(totalValue)}
        </div>
      </div>

      {/* Holdings */}
      <div className="space-y-2">
        {holdings.map((h, idx) => {
          if (!h.coin) return null;
          const allocPct = totalValue > 0 ? (h.value / totalValue) * 100 : 0;
          const signalColor = getSignalColor(h.coin.signal);
          const isPositive = h.coin.priceChange24h >= 0;
          return (
            <div
              key={h.symbol}
              data-ocid={`portfolio.item.${idx + 1}`}
              className="rounded p-3"
              style={{
                backgroundColor: "oklch(0.13 0.014 243)",
                border: "1px solid oklch(0.2 0.014 243)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CoinAvatar coin={h.coin} size={28} />
                  <div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: "oklch(0.93 0.008 240)" }}
                    >
                      {h.coin.symbol}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "oklch(0.62 0.015 240)" }}
                    >
                      {h.amount} {h.coin.symbol}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="font-mono font-semibold text-sm"
                    style={{ color: "oklch(0.93 0.008 240)" }}
                  >
                    {formatPrice(h.value)}
                  </div>
                  <div
                    className="text-xs font-mono"
                    style={{
                      color: isPositive
                        ? "oklch(0.82 0.22 155)"
                        : "oklch(0.63 0.22 25)",
                    }}
                  >
                    {isPositive ? "+" : ""}
                    {h.coin.priceChange24h.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Allocation bar */}
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 h-1 rounded-full"
                  style={{ backgroundColor: "oklch(0.2 0.014 243)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${allocPct}%`,
                      backgroundColor: "oklch(0.67 0.18 243)",
                    }}
                  />
                </div>
                <span
                  className="text-xs font-mono"
                  style={{ color: "oklch(0.67 0.18 243)", minWidth: 36 }}
                >
                  {allocPct.toFixed(1)}%
                </span>
                <span
                  className="text-xs font-semibold px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${signalColor}22`,
                    color: signalColor,
                    fontSize: 10,
                  }}
                >
                  {h.coin.signal}
                </span>
              </div>

              {/* Per-unit price */}
              <div
                className="mt-2 text-xs"
                style={{ color: "oklch(0.55 0.012 240)" }}
              >
                {formatPrice(h.coin.currentPrice)} per coin
              </div>
            </div>
          );
        })}
      </div>

      <p
        className="text-xs text-center mt-4"
        style={{ color: "oklch(0.4 0.01 240)" }}
      >
        Portfolio values are simulated. Not financial advice.
      </p>
    </div>
  );
}
