import { type CoinData, getSignalColor } from "../data/coins";

interface SentimentPanelProps {
  coins: CoinData[];
}

function FearGreedGauge({ value }: { value: number }) {
  const r = 52;
  const cx = 70;
  const cy = 68;
  const strokeW = 10;

  const clamped = Math.max(0.5, Math.min(99.5, value));
  const angleRad = Math.PI - (clamped / 100) * Math.PI;

  const ex = cx + r * Math.cos(angleRad);
  const ey = cy - r * Math.sin(angleRad);

  const x1 = cx - r;
  const y1 = cy;
  const x2 = cx + r;

  const segments = [
    { color: "#FF4B4B", start: 0, end: 20 },
    { color: "#FF6B35", start: 20, end: 40 },
    { color: "#F3C84B", start: 40, end: 60 },
    { color: "#7DD87D", start: 60, end: 80 },
    { color: "#22E17A", start: 80, end: 100 },
  ];

  function arcPath(start: number, end: number) {
    const startRad = Math.PI - (start / 100) * Math.PI;
    const endRad = Math.PI - (end / 100) * Math.PI;
    const sx = cx + r * Math.cos(startRad);
    const sy = cy - r * Math.sin(startRad);
    const ex2 = cx + r * Math.cos(endRad);
    const ey2 = cy - r * Math.sin(endRad);
    const sweep = end - start > 50 ? 1 : 0;
    return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 ${sweep} 1 ${ex2.toFixed(2)} ${ey2.toFixed(2)}`;
  }

  const label =
    value < 20
      ? "Extreme Fear"
      : value < 40
        ? "Fear"
        : value < 60
          ? "Neutral"
          : value < 80
            ? "Greed"
            : "Extreme Greed";
  const labelColor =
    value < 20
      ? "#FF4B4B"
      : value < 40
        ? "#FF6B35"
        : value < 60
          ? "#F3C84B"
          : value < 80
            ? "#7DD87D"
            : "#22E17A";

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 140 78"
        className="w-44"
        aria-label={`Fear and Greed Index: ${value} - ${label}`}
      >
        <title>Fear and Greed Index</title>
        <path
          d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y1}`}
          fill="none"
          stroke="#242C36"
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
        {segments.map((seg) => (
          <path
            key={seg.color}
            d={arcPath(seg.start, seg.end)}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeW}
            opacity="0.5"
          />
        ))}
        <circle cx={ex.toFixed(2)} cy={ey.toFixed(2)} r="5" fill={labelColor} />
        <line
          x1={cx}
          y1={cy}
          x2={ex.toFixed(2)}
          y2={ey.toFixed(2)}
          stroke={labelColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="3" fill="#F2F5F9" />
        <text
          x={cx}
          y={cy - 18}
          textAnchor="middle"
          fill="#F2F5F9"
          fontSize="22"
          fontWeight="800"
          fontFamily="BricolageGrotesque, system-ui"
        >
          {value}
        </text>
      </svg>
      <p className="text-sm font-semibold mt-1" style={{ color: labelColor }}>
        {label}
      </p>
    </div>
  );
}

export function SentimentPanel({ coins }: SentimentPanelProps) {
  const signalCounts = coins.reduce(
    (acc, c) => {
      if (c.signal === "Strong Buy" || c.signal === "Buy") acc.buy++;
      else if (c.signal === "Hold") acc.hold++;
      else acc.sell++;
      return acc;
    },
    { buy: 0, hold: 0, sell: 0 },
  );

  const total = coins.length;
  const buyPct = Math.round((signalCounts.buy / total) * 100);
  const holdPct = Math.round((signalCounts.hold / total) * 100);
  const sellPct = 100 - buyPct - holdPct;

  const avgRsi = coins.reduce((s, c) => s + c.rsi, 0) / total;
  const avgMom = coins.reduce((s, c) => s + c.momentum, 0) / total;
  const fearGreed = Math.round(
    buyPct * 0.5 + ((avgRsi - 30) / 0.55) * 0.3 + ((avgMom + 100) / 2) * 0.2,
  );
  const clampedFG = Math.max(5, Math.min(95, fearGreed));

  const totalVolume = coins.reduce((s, c) => s + c.volume24h, 0);
  const volumeStr =
    totalVolume >= 1_000_000
      ? `$${(totalVolume / 1_000_000).toFixed(1)}M`
      : `$${(totalVolume / 1_000).toFixed(0)}K`;

  return (
    <div
      data-ocid="sentiment.panel"
      className="w-full bg-card border border-border rounded-xl p-5 shadow-card"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x md:divide-border">
        {/* Market Sentiment */}
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Market Sentiment
          </p>
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            <div
              className="transition-all duration-1000"
              style={{ width: `${buyPct}%`, background: "#22E17A" }}
            />
            <div
              className="transition-all duration-1000"
              style={{ width: `${holdPct}%`, background: "#F3C84B" }}
            />
            <div
              className="transition-all duration-1000"
              style={{ width: `${sellPct}%`, background: "#FF4B4B" }}
            />
          </div>
          <div className="space-y-1.5">
            {[
              {
                label: "Buy Signals",
                pct: buyPct,
                color: "#22E17A",
                count: signalCounts.buy,
              },
              {
                label: "Hold Signals",
                pct: holdPct,
                color: "#F3C84B",
                count: signalCounts.hold,
              },
              {
                label: "Sell Signals",
                pct: sellPct,
                color: "#FF4B4B",
                count: signalCounts.sell,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
                <span
                  className="font-mono font-semibold"
                  style={{ color: item.color }}
                >
                  {item.count} ({item.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fear & Greed */}
        <div className="flex flex-col items-center justify-center gap-2 md:px-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold self-start md:self-center">
            Fear & Greed Index
          </p>
          <FearGreedGauge value={clampedFG} />
        </div>

        {/* Live Signals */}
        <div className="flex flex-col gap-3 md:pl-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Live Signals
          </p>
          <div className="flex flex-wrap gap-2">
            {coins.slice(0, 8).map((coin) => (
              <span
                key={coin.symbol}
                className="text-xs font-mono px-2 py-0.5 rounded-full border"
                style={{
                  color: getSignalColor(coin.signal),
                  borderColor: `${getSignalColor(coin.signal)}50`,
                  background: `${getSignalColor(coin.signal)}15`,
                }}
              >
                {coin.symbol}
              </span>
            ))}
          </div>
          <div className="mt-auto">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              24h Volume
            </p>
            <p className="text-2xl font-display font-bold text-foreground">
              {volumeStr}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-buy pulse-dot" />
            <span className="text-xs text-muted-foreground">
              Live — updates every 3s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
