import { Button } from "@/components/ui/button";
import {
  Bookmark,
  BookmarkCheck,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { type CoinData, getSignalColor } from "../data/coins";
import { MiniChart } from "./MiniChart";
import { SemiGauge } from "./SemiGauge";

interface DetailPanelProps {
  coin: CoinData;
  isWatched: boolean;
  onClose: () => void;
  onAddWatch: (symbol: string) => void;
  onRemoveWatch: (symbol: string) => void;
}

export function DetailPanel({
  coin,
  isWatched,
  onClose,
  onAddWatch,
  onRemoveWatch,
}: DetailPanelProps) {
  const isPositive = coin.priceChange24h >= 0;
  const signalColor = getSignalColor(coin.signal);
  const isBuy = coin.signal === "Buy" || coin.signal === "Strong Buy";

  const priceFormatted =
    coin.currentPrice >= 1000
      ? `$${coin.currentPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
      : coin.currentPrice >= 1
        ? `$${coin.currentPrice.toFixed(3)}`
        : `$${coin.currentPrice.toFixed(5)}`;

  const volumeStr =
    coin.volume24h >= 1_000_000
      ? `$${(coin.volume24h / 1_000_000).toFixed(2)}M`
      : `$${(coin.volume24h / 1_000).toFixed(0)}K`;

  const longHistory = [
    ...Array.from({ length: 10 }, (_, i) => {
      const base = coin.miniPriceHistory[0];
      return base * (0.95 + Math.sin(i * 0.5) * 0.03 + Math.random() * 0.02);
    }),
    ...coin.miniPriceHistory,
  ];

  return (
    <div
      data-ocid="detail.panel"
      className="fixed inset-0 z-50 flex items-start justify-end"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close detail panel"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm w-full cursor-default"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md h-full bg-[oklch(0.13_0.022_243)] border-l border-border shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-[oklch(0.13_0.022_243)] border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: coin.iconColor }}
            >
              {coin.symbol.slice(0, 2)}
            </div>
            <div>
              <p className="font-display font-bold text-foreground">
                {coin.symbol}
              </p>
              <p className="text-xs text-muted-foreground">{coin.name}</p>
            </div>
          </div>
          <button
            type="button"
            data-ocid="detail.close_button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-display font-black text-foreground">
              {priceFormatted}
            </span>
            <span
              className="flex items-center gap-1 text-sm font-mono font-semibold px-2 py-0.5 rounded"
              style={{
                color: isPositive ? "#22E17A" : "#FF4B4B",
                background: isPositive ? "#22E17A22" : "#FF4B4B22",
              }}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {isPositive ? "+" : ""}
              {coin.priceChange24h.toFixed(2)}%
            </span>
          </div>

          {/* Chart */}
          <div className="bg-muted rounded-lg p-3">
            <MiniChart
              history={longHistory}
              isPositive={isPositive}
              height={80}
            />
          </div>

          {/* Signal & Gauge */}
          <div className="flex items-center gap-4 bg-muted rounded-lg p-3">
            <SemiGauge
              value={coin.signalStrength}
              color={signalColor}
              size={100}
            />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Signal
              </p>
              <p
                className="text-xl font-display font-black"
                style={{ color: signalColor }}
              >
                {isBuy ? "▲ " : "▼ "}
                {coin.signal}
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: signalColor }}
              >
                {coin.signalStrength}% strength
              </p>
            </div>
          </div>

          {/* Indicators */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-muted rounded-lg p-2.5 text-center">
              <p className="text-xs text-muted-foreground">RSI</p>
              <p
                className="text-lg font-mono font-bold"
                style={{
                  color:
                    coin.rsi >= 70
                      ? "#FF6B35"
                      : coin.rsi <= 30
                        ? "#22E17A"
                        : "#F2F5F9",
                }}
              >
                {Math.round(coin.rsi)}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-2.5 text-center">
              <p className="text-xs text-muted-foreground">MA</p>
              <p
                className="text-sm font-bold capitalize"
                style={{
                  color:
                    coin.maSignal === "buy"
                      ? "#22E17A"
                      : coin.maSignal === "sell"
                        ? "#FF4B4B"
                        : "#F3C84B",
                }}
              >
                {coin.maSignal}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-2.5 text-center">
              <p className="text-xs text-muted-foreground">Momentum</p>
              <p
                className="text-sm font-bold"
                style={{ color: coin.momentum > 0 ? "#22E17A" : "#FF4B4B" }}
              >
                {coin.momentum > 0 ? "+" : ""}
                {Math.round(coin.momentum)}
              </p>
            </div>
          </div>

          {/* Volume */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">24h Volume</span>
            <span className="font-mono font-semibold text-foreground">
              {volumeStr}
            </span>
          </div>

          {/* Reasoning */}
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
              Signal Analysis
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {coin.reasoning}
            </p>
          </div>

          {/* Entry Strategy */}
          <div className="border border-buy/30 bg-buy/5 rounded-lg p-3">
            <p
              className="text-xs uppercase tracking-wider font-semibold mb-2"
              style={{ color: "#22E17A" }}
            >
              📈 Entry Strategy
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {coin.entryStrategy}
            </p>
          </div>

          {/* Exit Strategy */}
          <div className="border border-sell/30 bg-sell/5 rounded-lg p-3">
            <p
              className="text-xs uppercase tracking-wider font-semibold mb-2"
              style={{ color: "#FF4B4B" }}
            >
              📉 Exit Strategy
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {coin.exitStrategy}
            </p>
          </div>

          {/* Watchlist Button */}
          <Button
            data-ocid="detail.watchlist.toggle"
            type="button"
            onClick={() =>
              isWatched ? onRemoveWatch(coin.symbol) : onAddWatch(coin.symbol)
            }
            variant={isWatched ? "secondary" : "default"}
            className={`w-full gap-2 ${isWatched ? "" : "bg-buy text-primary-foreground hover:bg-buy/80"}`}
          >
            {isWatched ? (
              <>
                <BookmarkCheck className="w-4 h-4" /> Remove from Watchlist
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" /> Add to Watchlist
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center pb-4">
            ⚠️ For educational purposes only. Not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
