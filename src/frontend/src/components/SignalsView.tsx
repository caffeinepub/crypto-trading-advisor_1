import type { CoinData, SignalType } from "../data/coins";
import { getSignalColor } from "../data/coins";
import { CoinAvatar } from "./CoinSidebar";

interface Props {
  coins: CoinData[];
  onSelectCoin: (coin: CoinData) => void;
}

const SIGNAL_ORDER: SignalType[] = [
  "Strong Buy",
  "Buy",
  "Hold",
  "Sell",
  "Strong Sell",
];

export function SignalsView({ coins, onSelectCoin }: Props) {
  const grouped = SIGNAL_ORDER.map((signal) => ({
    signal,
    color: getSignalColor(signal),
    coins: coins.filter((c) => c.signal === signal),
  }));

  const buys = coins.filter(
    (c) => c.signal === "Buy" || c.signal === "Strong Buy",
  ).length;
  const sells = coins.filter(
    (c) => c.signal === "Sell" || c.signal === "Strong Sell",
  ).length;
  const holds = coins.filter((c) => c.signal === "Hold").length;
  const total = coins.length;
  const buyPct = Math.round((buys / total) * 100);
  const sellPct = Math.round((sells / total) * 100);
  const holdPct = Math.round((holds / total) * 100);

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
          Signal Distribution
        </h2>
        <p
          className="text-xs mt-0.5"
          style={{ color: "oklch(0.62 0.015 240)" }}
        >
          Market sentiment across all tracked assets
        </p>
      </div>

      {/* Summary bar */}
      <div
        className="rounded p-3 flex gap-4"
        style={{
          backgroundColor: "oklch(0.13 0.014 243)",
          border: "1px solid oklch(0.2 0.014 243)",
        }}
      >
        {[
          {
            label: "Buy / Strong Buy",
            count: buys,
            pct: buyPct,
            color: "#22e17a",
          },
          {
            label: "Hold",
            count: holds,
            pct: holdPct,
            color: "oklch(0.85 0.175 82)",
          },
          {
            label: "Sell / Strong Sell",
            count: sells,
            pct: sellPct,
            color: "#ff4b4b",
          },
        ].map((item) => (
          <div key={item.label} className="flex-1 text-center">
            <div
              className="font-mono font-bold text-lg"
              style={{ color: item.color }}
            >
              {item.count}
            </div>
            <div className="text-xs" style={{ color: "oklch(0.62 0.015 240)" }}>
              {item.label}
            </div>
            <div className="text-xs font-mono" style={{ color: item.color }}>
              {item.pct}%
            </div>
          </div>
        ))}
      </div>

      {/* Groups */}
      {grouped.map(({ signal, color, coins: group }) => (
        <div key={signal}>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs font-bold tracking-wider px-2 py-0.5 rounded"
              style={{ backgroundColor: `${color}22`, color }}
            >
              {signal.toUpperCase()}
            </span>
            <span
              className="text-xs"
              style={{ color: "oklch(0.62 0.015 240)" }}
            >
              {group.length} coin{group.length !== 1 ? "s" : ""}
            </span>
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: "oklch(0.2 0.014 243)" }}
            />
          </div>
          {group.length === 0 ? (
            <div
              className="text-xs px-2 py-2"
              style={{ color: "oklch(0.45 0.01 240)" }}
            >
              No coins in this category
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {group.map((coin, idx) => (
                <button
                  type="button"
                  key={coin.symbol}
                  data-ocid={`signals.item.${idx + 1}`}
                  onClick={() => onSelectCoin(coin)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: "oklch(0.13 0.014 243)",
                    border: `1px solid ${color}33`,
                  }}
                >
                  <CoinAvatar coin={coin} size={20} />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.93 0.008 240)" }}
                  >
                    {coin.symbol}
                  </span>
                  <span
                    className="font-mono text-xs"
                    style={{ color, fontSize: 10 }}
                  >
                    {coin.signalStrength}%
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
