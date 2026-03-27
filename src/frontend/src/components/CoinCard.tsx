import { type CoinData, getSignalBg, getSignalColor } from "../data/coins";
import { MiniChart } from "./MiniChart";
import { SemiGauge } from "./SemiGauge";

interface CoinCardProps {
  coin: CoinData;
  onClick: () => void;
  index: number;
}

function getRsiColor(rsi: number): string {
  if (rsi >= 70) return "#FF6B35";
  if (rsi <= 30) return "#22E17A";
  return "#9AA6B2";
}

function getMomentumLabel(momentum: number): string {
  if (momentum > 40) return "Strong";
  if (momentum > 10) return "Positive";
  if (momentum > -10) return "Neutral";
  if (momentum > -40) return "Negative";
  return "Weak";
}

function getMomentumColor(momentum: number): string {
  if (momentum > 20) return "#22E17A";
  if (momentum > -20) return "#F3C84B";
  return "#FF4B4B";
}

export function CoinCard({ coin, onClick, index }: CoinCardProps) {
  const isPositive = coin.priceChange24h >= 0;
  const signalColor = getSignalColor(coin.signal);
  const glowClass = getSignalBg(coin.signal);
  const isBuy = coin.signal === "Buy" || coin.signal === "Strong Buy";
  const isSell = coin.signal === "Sell" || coin.signal === "Strong Sell";

  const maColor =
    coin.maSignal === "buy"
      ? "#22E17A"
      : coin.maSignal === "sell"
        ? "#FF4B4B"
        : "#9AA6B2";

  const priceFormatted =
    coin.currentPrice >= 1000
      ? `$${coin.currentPrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
      : coin.currentPrice >= 1
        ? `$${coin.currentPrice.toFixed(2)}`
        : `$${coin.currentPrice.toFixed(4)}`;

  return (
    <button
      type="button"
      data-ocid={`coins.item.${index}`}
      onClick={onClick}
      className={`relative w-full text-left bg-card border border-border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01] ${glowClass}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: coin.iconColor }}
          >
            {coin.symbol.slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">
              {coin.symbol}
            </p>
            <p className="text-xs text-muted-foreground leading-tight">
              {coin.name}
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          1H
        </span>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-display font-bold text-foreground">
          {priceFormatted}
        </span>
        <span
          className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded"
          style={{
            color: isPositive ? "#22E17A" : "#FF4B4B",
            background: isPositive ? "#22E17A22" : "#FF4B4B22",
          }}
        >
          {isPositive ? "+" : ""}
          {coin.priceChange24h.toFixed(2)}%
        </span>
      </div>

      {/* Mini Chart */}
      <div className="mb-3 -mx-1">
        <MiniChart
          history={coin.miniPriceHistory}
          isPositive={isPositive}
          height={48}
        />
      </div>

      {/* Signal Label */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-lg font-display font-black tracking-wide"
          style={{ color: signalColor }}
        >
          {isBuy ? "▲ " : isSell ? "▼ " : "— "}
          {coin.signal.toUpperCase()}
        </span>
        <span
          className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
          style={{ color: signalColor, background: `${signalColor}22` }}
        >
          {coin.signalStrength}%
        </span>
      </div>

      {/* Signal Strength Gauge */}
      <div className="flex items-center gap-3 mb-3">
        <SemiGauge value={coin.signalStrength} color={signalColor} size={80} />
        <div>
          <p className="text-xs text-muted-foreground">Signal Strength</p>
          <p className="text-sm font-semibold" style={{ color: signalColor }}>
            {coin.signalStrength >= 80
              ? "Very Strong"
              : coin.signalStrength >= 60
                ? "Strong"
                : coin.signalStrength >= 40
                  ? "Moderate"
                  : "Weak"}
          </p>
        </div>
      </div>

      {/* Indicator Pills */}
      <div className="flex gap-1.5 flex-wrap">
        <span
          className="text-xs font-mono px-2 py-0.5 rounded-full border"
          style={{
            color: getRsiColor(coin.rsi),
            borderColor: `${getRsiColor(coin.rsi)}50`,
            background: `${getRsiColor(coin.rsi)}15`,
          }}
        >
          RSI {Math.round(coin.rsi)}
        </span>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded-full border"
          style={{
            color: maColor,
            borderColor: `${maColor}50`,
            background: `${maColor}15`,
          }}
        >
          MA{" "}
          {coin.maSignal === "buy"
            ? "↑ Buy"
            : coin.maSignal === "sell"
              ? "↓ Sell"
              : "— Neutral"}
        </span>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded-full border"
          style={{
            color: getMomentumColor(coin.momentum),
            borderColor: `${getMomentumColor(coin.momentum)}50`,
            background: `${getMomentumColor(coin.momentum)}15`,
          }}
        >
          Mom {getMomentumLabel(coin.momentum)}
        </span>
      </div>
    </button>
  );
}
