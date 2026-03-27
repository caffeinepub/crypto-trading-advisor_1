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

export function generateLongHistory(
  coin: CoinData,
  points = 168,
): PricePoint[] {
  const now = Date.now();
  const intervalMs = (7 * 24 * 60 * 60 * 1000) / points;
  const history: PricePoint[] = [];

  // seed from miniPriceHistory
  const seed = coin.miniPriceHistory;
  let price = seed[0] ?? coin.currentPrice * 0.92;

  for (let i = 0; i < points; i++) {
    const seedFrac = i / points;
    const seedIdx = Math.floor(seedFrac * seed.length);
    const seedPrice = seed[seedIdx] ?? coin.currentPrice;
    // blend toward seed price
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
  // ensure last point matches current price
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
    // bias toward current RSI near the end
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
