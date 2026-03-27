import { useMemo } from "react";
import type { CoinData } from "../data/coins";
import { getSignalColor } from "../data/coins";
import {
  computeSMA,
  formatPrice,
  generateLongHistory,
} from "../utils/chartUtils";
import { CoinAvatar } from "./CoinSidebar";

const PORTFOLIO = [
  { symbol: "BTC", qty: 0.42 },
  { symbol: "ETH", qty: 3.15 },
  { symbol: "SOL", qty: 12.8 },
  { symbol: "ICP", qty: 220 },
];

interface Props {
  coins: CoinData[];
  selectedCoin: CoinData | null;
}

export function RightPanel({ coins, selectedCoin }: Props) {
  const top10 = coins.slice(0, 10);

  const marketSentiment = useMemo(() => {
    const buyCount = coins.filter(
      (c) => c.signal === "Buy" || c.signal === "Strong Buy",
    ).length;
    return Math.round((buyCount / coins.length) * 100);
  }, [coins]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional dep on symbol+price only
  const aiAnalysis = useMemo(() => {
    if (!selectedCoin) return null;
    const history = generateLongHistory(selectedCoin, 50);
    const prices = history.map((h) => h.price);
    const sma7 = computeSMA(prices, 7);
    const sma25 = computeSMA(prices, 25);
    const macd = (sma7 - sma25) / sma25;
    return { sma7, sma25, macd };
  }, [selectedCoin?.symbol, selectedCoin?.currentPrice]);

  const portfolioTotal = PORTFOLIO.reduce((sum, item) => {
    const coin = coins.find((c) => c.symbol === item.symbol);
    return sum + (coin ? coin.currentPrice * item.qty : 0);
  }, 0);

  const needleLeft = `${Math.max(2, Math.min(96, marketSentiment))}%`;

  return (
    <aside
      className="flex flex-col gap-0 overflow-y-auto border-l border-border"
      style={{
        width: 220,
        minWidth: 220,
        backgroundColor: "oklch(0.11 0.013 243)",
      }}
    >
      {/* Live Prices */}
      <div className="p-3 border-b border-border">
        <div
          className="text-xs font-semibold tracking-wider mb-2"
          style={{ color: "oklch(0.62 0.015 240)" }}
        >
          LIVE PRICES (TOP 10)
        </div>
        <div className="space-y-1">
          {top10.map((coin, idx) => {
            const isPos = coin.priceChange24h >= 0;
            return (
              <div
                key={coin.symbol}
                data-ocid={`liveprice.item.${idx + 1}`}
                className="flex items-center gap-2"
              >
                <CoinAvatar coin={coin} size={20} />
                <span className="text-xs font-semibold text-foreground w-10 shrink-0">
                  {coin.symbol}
                </span>
                <span
                  className="text-xs font-mono text-foreground flex-1 text-right"
                  style={{ fontSize: 10 }}
                >
                  {formatPrice(coin.currentPrice)}
                </span>
                <span
                  className="text-xs font-mono w-14 text-right shrink-0"
                  style={{
                    color: isPos
                      ? "oklch(0.82 0.22 155)"
                      : "oklch(0.63 0.22 25)",
                    fontSize: 10,
                  }}
                >
                  {isPos ? "+" : ""}
                  {coin.priceChange24h.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Market Sentiment */}
      <div className="p-3 border-b border-border">
        <div
          className="text-xs font-semibold tracking-wider mb-2"
          style={{ color: "oklch(0.62 0.015 240)" }}
        >
          MARKET SENTIMENT
        </div>
        <div className="relative mb-1">
          <div
            className="h-3 rounded-full relative overflow-hidden"
            style={{
              background:
                "linear-gradient(to right, oklch(0.63 0.22 25), oklch(0.85 0.175 82), oklch(0.82 0.22 155))",
            }}
          >
            <div
              className="absolute top-0 bottom-0 w-0.5 rounded"
              style={{
                left: needleLeft,
                backgroundColor: "white",
                transform: "translateX(-50%)",
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span
              className="text-xs"
              style={{ color: "oklch(0.63 0.22 25)", fontSize: 9 }}
            >
              Bearish
            </span>
            <span
              className="text-xs"
              style={{ color: "oklch(0.82 0.22 155)", fontSize: 9 }}
            >
              Bullish {marketSentiment}%
            </span>
          </div>
          <div className="flex justify-between mt-0.5">
            {["10%", "30%", "50%", "70%", "90%"].map((p) => (
              <span
                key={p}
                className="text-xs"
                style={{ color: "oklch(0.45 0.01 240)", fontSize: 8 }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="p-3 border-b border-border">
        <div
          className="text-xs font-semibold tracking-wider mb-2"
          style={{ color: "oklch(0.62 0.015 240)" }}
        >
          AI ANALYSIS
        </div>
        {selectedCoin && aiAnalysis ? (
          <div className="space-y-1 font-mono" style={{ fontSize: 10 }}>
            <div className="flex justify-between">
              <span style={{ color: "oklch(0.62 0.015 240)" }}>RSI (14)</span>
              <span
                style={{
                  color:
                    selectedCoin.rsi >= 70
                      ? "#ff4b4b"
                      : selectedCoin.rsi <= 30
                        ? "#22e17a"
                        : "oklch(0.85 0.175 82)",
                }}
              >
                {selectedCoin.rsi.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "oklch(0.62 0.015 240)" }}>SMA7</span>
              <span style={{ color: "oklch(0.93 0.008 240)" }}>
                {formatPrice(aiAnalysis.sma7)}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "oklch(0.62 0.015 240)" }}>SMA25</span>
              <span style={{ color: "oklch(0.93 0.008 240)" }}>
                {formatPrice(aiAnalysis.sma25)}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "oklch(0.62 0.015 240)" }}>MACD</span>
              <span
                style={{ color: aiAnalysis.macd >= 0 ? "#22e17a" : "#ff4b4b" }}
              >
                {(aiAnalysis.macd * 100).toFixed(3)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "oklch(0.62 0.015 240)" }}>Signal</span>
              <span style={{ color: getSignalColor(selectedCoin.signal) }}>
                {selectedCoin.signal}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs" style={{ color: "oklch(0.45 0.01 240)" }}>
            Select a coin to see analysis
          </div>
        )}
      </div>

      {/* Portfolio */}
      <div className="p-3">
        <div
          className="text-xs font-semibold tracking-wider mb-2"
          style={{ color: "oklch(0.62 0.015 240)" }}
        >
          YOUR PORTFOLIO
        </div>
        <div className="space-y-1.5">
          {PORTFOLIO.map((item, idx) => {
            const coin = coins.find((c) => c.symbol === item.symbol);
            const value = coin ? coin.currentPrice * item.qty : 0;
            return (
              <div
                key={item.symbol}
                data-ocid={`portfolio.item.${idx + 1}`}
                className="flex items-center gap-2"
              >
                {coin && <CoinAvatar coin={coin} size={20} />}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      {item.symbol}
                    </span>
                    <span
                      className="text-xs font-mono"
                      style={{ color: "oklch(0.93 0.008 240)", fontSize: 10 }}
                    >
                      $
                      {value.toLocaleString("en-US", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "oklch(0.62 0.015 240)", fontSize: 10 }}
                  >
                    {item.qty} {item.symbol}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 pt-2 border-t border-border flex justify-between">
          <span
            className="text-xs font-semibold"
            style={{ color: "oklch(0.62 0.015 240)" }}
          >
            Total Value
          </span>
          <span
            className="text-xs font-mono font-bold"
            style={{ color: "oklch(0.67 0.18 243)" }}
          >
            $
            {portfolioTotal.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
      </div>
    </aside>
  );
}
