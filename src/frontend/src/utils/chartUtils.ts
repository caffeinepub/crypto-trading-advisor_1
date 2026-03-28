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

// How many minutes of data to show per timerange
export const RANGE_WINDOW_MINUTES: Record<TimeRange, number> = {
  "1sec": 15,
  "1min": 30,
  "5min": 60,
  "10min": 120,
  "30min": 180,
  "1h": 240,
  "2h": 360,
  "3h": 480,
  "4h": 600,
  "5h": 720,
  "6h": 1440,
};

function formatLabel(ts: number, windowMinutes: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  if (windowMinutes < 60) return `${hh}:${mm}:${ss}`;
  if (windowMinutes < 24 * 60) return `${hh}:${mm}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
}

/**
 * Slice real CoinGecko market chart data [[timestamp_ms, price], ...] for a given time range.
 */
export function slicePricesForRange(
  rawPrices: [number, number][],
  range: TimeRange,
): PricePoint[] {
  const windowMs = RANGE_WINDOW_MINUTES[range] * 60_000;
  const now = Date.now();
  const cutoff = now - windowMs;
  const filtered = rawPrices.filter(([ts]) => ts >= cutoff);
  // If we have very few points, use all available data
  const data = filtered.length >= 5 ? filtered : rawPrices.slice(-60);
  return data.map(([ts, price]) => ({
    time: formatLabel(ts, RANGE_WINDOW_MINUTES[range]),
    price,
    timestamp: ts,
  }));
}

/**
 * Compute Wilder's RSI from an array of closing prices.
 */
export function computeRealRSI(prices: number[], period = 14): number[] {
  if (prices.length < period + 1) {
    return prices.map(() => 50);
  }
  const rsiValues: number[] = new Array(period).fill(50);
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const delta = prices[i] - prices[i - 1];
    if (delta >= 0) avgGain += delta;
    else avgLoss += Math.abs(delta);
  }
  avgGain /= period;
  avgLoss /= period;
  const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsiValues.push(100 - 100 / (1 + firstRS));
  for (let i = period + 1; i < prices.length; i++) {
    const delta = prices[i] - prices[i - 1];
    const gain = delta > 0 ? delta : 0;
    const loss = delta < 0 ? Math.abs(delta) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsiValues.push(100 - 100 / (1 + rs));
  }
  return rsiValues;
}

function computeEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];
  let prevEma = prices[0];
  ema.push(prevEma);
  for (let i = 1; i < prices.length; i++) {
    prevEma = prices[i] * k + prevEma * (1 - k);
    ema.push(prevEma);
  }
  return ema;
}

/**
 * Compute real MACD (12/26/9) from closing prices.
 */
export function computeRealMACD(
  prices: number[],
): { macd: number; signal: number; histogram: number }[] {
  if (prices.length < 26) {
    return prices.map(() => ({ macd: 0, signal: 0, histogram: 0 }));
  }
  const ema12 = computeEMA(prices, 12);
  const ema26 = computeEMA(prices, 26);
  const macdLine = prices.map((_, i) => ema12[i] - ema26[i]);
  const signalLine = computeEMA(macdLine, 9);
  return prices.map((_, i) => ({
    macd: macdLine[i],
    signal: signalLine[i],
    histogram: macdLine[i] - signalLine[i],
  }));
}

/**
 * Build RSIPoint[] from price history and raw price array.
 */
export function buildRSIHistory(
  priceHistory: PricePoint[],
  rsiValues: number[],
): RSIPoint[] {
  return priceHistory.map((p, i) => ({
    time: p.time,
    rsi: Math.round((rsiValues[i] ?? 50) * 10) / 10,
  }));
}

/**
 * Build MACDPoint[] from price history and MACD values.
 */
export function buildMACDHistory(
  priceHistory: PricePoint[],
  macdValues: { macd: number; signal: number; histogram: number }[],
): MACDPoint[] {
  return priceHistory.map((p, i) => ({
    time: p.time,
    macd: macdValues[i]?.macd ?? 0,
    signal: macdValues[i]?.signal ?? 0,
    histogram: macdValues[i]?.histogram ?? 0,
  }));
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

// Keep for backward compat (used in MiniChart if any)
export function generateHistoryForRange(
  coin: CoinData,
  _range: TimeRange,
): PricePoint[] {
  // Fallback: generate flat line at current price — no fake randomness
  const now = Date.now();
  return coin.miniPriceHistory.map((price, i) => ({
    time: "",
    price,
    timestamp: now - (coin.miniPriceHistory.length - i) * 300_000,
  }));
}

export function generateRSIHistory(
  priceHistory: PricePoint[],
  currentRsi: number,
): RSIPoint[] {
  const prices = priceHistory.map((p) => p.price);
  const rsiValues = computeRealRSI(prices);
  // Anchor last value to current RSI from CoinGecko signals
  if (rsiValues.length > 0) rsiValues[rsiValues.length - 1] = currentRsi;
  return buildRSIHistory(priceHistory, rsiValues);
}

export function generateMACDHistory(priceHistory: PricePoint[]): MACDPoint[] {
  const prices = priceHistory.map((p) => p.price);
  const macdValues = computeRealMACD(prices);
  return buildMACDHistory(priceHistory, macdValues);
}

export function generateLongHistory(
  coin: CoinData,
  _points = 168,
): PricePoint[] {
  return generateHistoryForRange(coin, "6h");
}
