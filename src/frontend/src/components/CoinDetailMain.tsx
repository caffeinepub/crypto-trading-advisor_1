import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CoinData } from "../data/coins";
import { getSignalColor } from "../data/coins";
import {
  formatPrice,
  generateLongHistory,
  generateMACDHistory,
  generateRSIHistory,
} from "../utils/chartUtils";
import { CoinAvatar } from "./CoinSidebar";

const CHART_TICK_STYLE = {
  fill: "oklch(0.62 0.015 240)",
  fontSize: 10,
  fontFamily: "JetBrainsMono",
};
const TOOLTIP_STYLE = {
  backgroundColor: "oklch(0.15 0.016 243)",
  border: "1px solid oklch(0.22 0.016 243)",
  borderRadius: 4,
  color: "oklch(0.93 0.008 240)",
  fontSize: 11,
};
const GRID_COLOR = "oklch(0.2 0.014 243)";
const GREEN = "#22e17a";
const RED = "#ff4b4b";

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span
        className="text-xs font-semibold tracking-wider"
        style={{ color: "oklch(0.62 0.015 240)" }}
      >
        {title}
      </span>
      <div
        className="flex-1 h-px"
        style={{ backgroundColor: "oklch(0.2 0.014 243)" }}
      />
    </div>
  );
}

interface Props {
  coin: CoinData;
  isWatched: boolean;
  onAddWatch: (symbol: string) => void;
  onRemoveWatch: (symbol: string) => void;
}

export function CoinDetailMain({
  coin,
  isWatched,
  onAddWatch,
  onRemoveWatch,
}: Props) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: regenerate charts only when symbol changes
  const priceHistory = useMemo(
    () => generateLongHistory(coin, 168),
    [coin.symbol],
  );
  const rsiHistory = useMemo(
    () => generateRSIHistory(priceHistory, coin.rsi),
    [priceHistory, coin.rsi],
  );
  const macdHistory = useMemo(
    () => generateMACDHistory(priceHistory),
    [priceHistory],
  );

  const signalColor = getSignalColor(coin.signal);
  const isPositive = coin.priceChange24h >= 0;
  const changeColor = isPositive
    ? "oklch(0.82 0.22 155)"
    : "oklch(0.63 0.22 25)";

  const tickFormatter = (_val: string, idx: number) =>
    idx % 24 === 0 ? (priceHistory[idx]?.time.split(" ")[0] ?? "") : "";

  const sellTarget = coin.currentPrice * 1.045;
  const stopLoss = coin.currentPrice * 0.955;
  const rsiLabel =
    coin.rsi >= 70 ? "Overbought" : coin.rsi <= 30 ? "Oversold" : "Neutral";

  return (
    <div
      className="flex-1 flex flex-col overflow-y-auto"
      style={{ backgroundColor: "oklch(0.09 0.012 243)" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b border-border"
        style={{ backgroundColor: "oklch(0.11 0.013 243)" }}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <CoinAvatar coin={coin} size={36} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base text-foreground">
                  {coin.name}
                </h2>
                <span
                  className="text-sm font-mono"
                  style={{ color: "oklch(0.62 0.015 240)" }}
                >
                  ({coin.symbol}/USD)
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-bold text-lg text-foreground">
                  {formatPrice(coin.currentPrice)}
                </span>
                <span
                  className="text-sm font-mono"
                  style={{ color: changeColor }}
                >
                  {isPositive ? "+" : ""}
                  {coin.priceChange24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="px-3 py-1 rounded text-xs font-bold tracking-wider"
              style={{
                backgroundColor: `${signalColor}22`,
                color: signalColor,
                border: `1px solid ${signalColor}44`,
              }}
            >
              {coin.signal.toUpperCase()} {coin.signalStrength}%
            </div>
            <button
              type="button"
              data-ocid="detail.toggle"
              onClick={() =>
                isWatched ? onRemoveWatch(coin.symbol) : onAddWatch(coin.symbol)
              }
              className="px-3 py-1 rounded text-xs border transition-colors"
              style={{
                borderColor: isWatched
                  ? "oklch(0.63 0.22 25 / 0.5)"
                  : "oklch(0.67 0.18 243 / 0.5)",
                color: isWatched
                  ? "oklch(0.63 0.22 25)"
                  : "oklch(0.67 0.18 243)",
                backgroundColor: "transparent",
              }}
            >
              {isWatched ? "Unwatch" : "+ Watch"}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 mt-3">
          {[
            {
              label: "Sell Target",
              value: formatPrice(sellTarget),
              color: GREEN,
            },
            { label: "Stop Loss", value: formatPrice(stopLoss), color: RED },
            {
              label: "Volume 24H",
              value: `$${(coin.volume24h / 1e6).toFixed(2)}M`,
              color: "oklch(0.67 0.18 243)",
            },
            {
              label: "RSI (14)",
              value: coin.rsi.toFixed(1),
              color:
                rsiLabel === "Neutral"
                  ? "oklch(0.85 0.175 82)"
                  : rsiLabel === "Overbought"
                    ? RED
                    : GREEN,
            },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                className="text-xs"
                style={{ color: "oklch(0.62 0.015 240)" }}
              >
                {stat.label}
              </div>
              <div
                className="font-mono text-sm font-semibold"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts — constrained max width so they don't stretch too wide */}
      <div className="flex-1 px-4 py-4 space-y-6" style={{ maxWidth: 820 }}>
        {/* Price Chart */}
        <div>
          <SectionHeader title="PRICE CHART — 7D" />
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs font-mono"
              style={{ color: "oklch(0.62 0.015 240)" }}
            >
              Hourly
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart
              data={priceHistory}
              margin={{ top: 5, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.67 0.18 243)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.67 0.18 243)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={GRID_COLOR}
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tick={CHART_TICK_STYLE}
                tickFormatter={tickFormatter}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                tick={CHART_TICK_STYLE}
                axisLine={false}
                tickLine={false}
                width={60}
                tickFormatter={(v) => formatPrice(v as number).replace("$", "")}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v) => [formatPrice(v as number), "Price"]}
                labelFormatter={(l) => String(l)}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="oklch(0.67 0.18 243)"
                strokeWidth={1.5}
                fill="url(#priceGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* RSI Chart */}
        <div>
          <SectionHeader
            title={`RSI (14) — ${coin.rsi.toFixed(1)} — ${rsiLabel}`}
          />
          <ResponsiveContainer width="100%" height={100}>
            <LineChart
              data={rsiHistory}
              margin={{ top: 5, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={GRID_COLOR}
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tick={CHART_TICK_STYLE}
                tickFormatter={tickFormatter}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                tick={CHART_TICK_STYLE}
                axisLine={false}
                tickLine={false}
                width={30}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v) => [`${v}`, "RSI"]}
                labelFormatter={(l) => String(l)}
              />
              <ReferenceLine
                y={70}
                stroke={RED}
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <ReferenceLine
                y={30}
                stroke={GREEN}
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <Line
                type="monotone"
                dataKey="rsi"
                stroke="oklch(0.85 0.175 82)"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* MACD Chart */}
        <div>
          <SectionHeader title="MACD (12/26/9)" />
          <ResponsiveContainer width="100%" height={100}>
            <BarChart
              data={macdHistory}
              margin={{ top: 5, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={GRID_COLOR}
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tick={CHART_TICK_STYLE}
                tickFormatter={tickFormatter}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                tick={CHART_TICK_STYLE}
                axisLine={false}
                tickLine={false}
                width={40}
                tickFormatter={(v) => (v as number).toFixed(0)}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v) => [(v as number).toFixed(4), "Histogram"]}
                labelFormatter={(l) => String(l)}
              />
              <ReferenceLine y={0} stroke={GRID_COLOR} />
              <Bar
                dataKey="histogram"
                radius={[1, 1, 0, 0]}
                isAnimationActive={false}
              >
                {macdHistory.map((entry) => (
                  <Cell
                    key={entry.time}
                    fill={entry.histogram >= 0 ? GREEN : RED}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Signal reasoning */}
        <div
          className="rounded p-3"
          style={{
            backgroundColor: "oklch(0.13 0.014 243)",
            border: "1px solid oklch(0.2 0.014 243)",
          }}
        >
          <div
            className="text-xs font-semibold mb-1"
            style={{ color: "oklch(0.67 0.18 243)" }}
          >
            SIGNAL REASONING
          </div>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "oklch(0.75 0.01 240)" }}
          >
            {coin.reasoning}
          </p>
        </div>
      </div>
    </div>
  );
}
