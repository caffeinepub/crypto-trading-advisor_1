import type { CoinData } from "../data/coins";

export interface PricePoint {
  time: string;
  price: number;
  timestamp: number;
}

export interface RSIPoint {
  time: string;
  rsi: number;
}

export interface MACDPoint {
  time: string;
  macd: number;
  signal: number;
  histogram: number;
}

export type TimeRange =
  | "1sec"
  | "1min"
  | "5min"
  | "10min"
  | "30min"
  | "1h"
  | "2h"
  | "3h"
  | "4h"
  | "5h"
  | "6h";

const RANGE_CONFIG: Record<TimeRange, { windowMs: number; points: number }> = {
  "1sec": { windowMs: 60_000, points: 60 },
  "1min": { windowMs: 60_000, points: 60 },
  "5min": { windowMs: 5 * 60_000, points: 60 },
  "10min": { windowMs: 10 * 60_000, points: 60 },
  "30min": { windowMs: 30 * 60_000, points: 60 },
  "1h": { windowMs: 60 * 60_000, points: 60 },
  "2h": { windowMs: 2 * 60 * 60_000, points: 60 },
  "3h": { windowMs: 3 * 60 * 60_000, points: 60 },
  "4h": { windowMs: 4 * 60 * 60_000, points: 60 },
  "5h": { windowMs: 5 * 60 * 60_000, points: 60 },
  "6h": { windowMs: 6 * 60 * 60_000, points: 60 },
};

function formatLabel(ts: number, windowMs: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  if (windowMs < 60_000) return `${hh}:${mm}:${ss}`;
  if (windowMs < 60 * 60_000) return `${hh}:${mm}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
}

export function generateHistoryForRange(
  coin: CoinData,
  range: TimeRange,
): PricePoint[] {
  const { windowMs, points } = RANGE_CONFIG[range];
  const now = Date.now();
  const intervalMs = windowMs / points;
  const seed = coin.miniPriceHistory;
  let price = seed[0] ?? coin.currentPrice * 0.92;
  const history: PricePoint[] = [];

  for (let i = 0; i < points; i++) {
    const seedFrac = i / points;
    const seedIdx = Math.floor(seedFrac * seed.length);
    const seedPrice = seed[seedIdx] ?? coin.currentPrice;
    price = price * 0.97 + seedPrice * 0.03;
    price = price * (1 + (Math.random() - 0.49) * 0.018);
    const ts = now - (points - i) * intervalMs;
    history.push({
      time: formatLabel(ts, windowMs),
      price: Math.max(price, 0.000001),
      timestamp: ts,
    });
  }
  history[history.length - 1].price = coin.currentPrice;
  return history;
}

export function generateLongHistory(
  coin: CoinData,
  points = 168,
): PricePoint[] {
  const now = Date.now();
  const intervalMs = (7 * 24 * 60 * 60 * 1000) / points;
  const history: PricePoint[] = [];

  const seed = coin.miniPriceHistory;
  let price = seed[0] ?? coin.currentPrice * 0.92;

  for (let i = 0; i < points; i++) {
    const seedFrac = i / points;
    const seedIdx = Math.floor(seedFrac * seed.length);
    const seedPrice = seed[seedIdx] ?? coin.currentPrice;
    price = price * 0.97 + seedPrice * 0.03;
    price = price * (1 + (Math.random() - 0.49) * 0.018);
    const ts = now - (points - i) * intervalMs;
    const date = new Date(ts);
    const label = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
    history.push({
      time: label,
      price: Math.max(price, 0.000001),
      timestamp: ts,
    });
  }
  history[history.length - 1].price = coin.currentPrice;
  return history;
}

export function generateRSIHistory(
  priceHistory: PricePoint[],
  currentRsi: number,
): RSIPoint[] {
  const len = priceHistory.length;
  const rsiHistory: RSIPoint[] = [];
  let rsi = Math.max(20, Math.min(80, currentRsi - (Math.random() * 20 - 5)));

  for (let i = 0; i < len; i++) {
    rsi = Math.max(20, Math.min(82, rsi + (Math.random() - 0.5) * 4));
    if (i > len * 0.8) {
      rsi = rsi * 0.95 + currentRsi * 0.05;
    }
    rsiHistory.push({
      time: priceHistory[i].time,
      rsi: Math.round(rsi * 10) / 10,
    });
  }
  rsiHistory[rsiHistory.length - 1].rsi = currentRsi;
  return rsiHistory;
}

export function generateMACDHistory(priceHistory: PricePoint[]): MACDPoint[] {
  return priceHistory.map((p, i) => {
    const noise = (Math.random() - 0.5) * 0.004 * p.price;
    const trend =
      Math.sin((i / priceHistory.length) * Math.PI * 3) * 0.002 * p.price;
    const macd = noise + trend;
    const signal = macd * 0.85 + (Math.random() - 0.5) * 0.001 * p.price;
    const histogram = macd - signal;
    return { time: p.time, macd, signal, histogram };
  });
}

export function formatPrice(price: number): string {
  if (price >= 1000)
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

export function computeSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] ?? 0;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}
