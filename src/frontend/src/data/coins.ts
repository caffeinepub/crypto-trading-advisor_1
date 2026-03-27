export type SignalType = "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell";
export type MASignal = "buy" | "sell" | "neutral";

export interface CoinData {
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  rsi: number;
  maSignal: MASignal;
  momentum: number;
  signal: SignalType;
  signalStrength: number;
  reasoning: string;
  entryStrategy: string;
  exitStrategy: string;
  miniPriceHistory: number[];
  volume24h: number;
  iconColor: string;
  geckoId?: string;
}

const BASE_COINS: Omit<CoinData, "miniPriceHistory">[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    currentPrice: 67420,
    priceChange24h: 2.34,
    rsi: 62,
    maSignal: "buy",
    momentum: 42,
    signal: "Buy",
    signalStrength: 72,
    reasoning:
      "BTC is trading above its 50-day moving average with strong institutional demand. RSI at 62 suggests room for further upside before overbought territory. MACD crossover confirmed bullish momentum.",
    entryStrategy:
      "Consider accumulating near the $66,000–$67,000 support zone. Set a stop-loss below $64,500 to manage risk.",
    exitStrategy:
      "Target partial profits at $70,000 resistance. Trail stop-loss up as price rises. Exit fully if RSI exceeds 78.",
    volume24h: 38400000,
    iconColor: "#F7931A",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    currentPrice: 3482,
    priceChange24h: 1.87,
    rsi: 58,
    maSignal: "buy",
    momentum: 31,
    signal: "Buy",
    signalStrength: 65,
    reasoning:
      "Ethereum's EIP activity and growing DeFi TVL drive positive sentiment. 50-day MA acting as support. RSI at 58 leaves healthy upside potential.",
    entryStrategy:
      "Accumulate between $3,400–$3,500. Use ETH/BTC ratio as confirmation. Stop-loss at $3,200.",
    exitStrategy:
      "First target at $3,800 resistance. Consider reducing exposure at $4,000 psychological level.",
    volume24h: 19200000,
    iconColor: "#627EEA",
  },
  {
    symbol: "ICP",
    name: "Internet Computer",
    currentPrice: 12.45,
    priceChange24h: 4.21,
    rsi: 68,
    maSignal: "buy",
    momentum: 58,
    signal: "Strong Buy",
    signalStrength: 85,
    reasoning:
      "ICP shows strong momentum with ecosystem development milestones. RSI at 68 trending up. Multiple MA crossovers confirm bullish trend reversal from recent lows.",
    entryStrategy:
      "Enter on dips to $11.50–$12.00. Strong buying pressure provides a good risk/reward ratio at current levels.",
    exitStrategy:
      "Target $15.00 for first take-profit. Keep a core position for potential $20+ run if ecosystem news continues.",
    volume24h: 1850000,
    iconColor: "#3B00B9",
  },
  {
    symbol: "XRP",
    name: "Ripple",
    currentPrice: 0.624,
    priceChange24h: -0.82,
    rsi: 48,
    maSignal: "neutral",
    momentum: -8,
    signal: "Hold",
    signalStrength: 50,
    reasoning:
      "XRP consolidating near key support after recent regulatory clarity. RSI neutral at 48. Awaiting breakout confirmation above $0.65 before taking a directional stance.",
    entryStrategy:
      "Wait for confirmed breakout above $0.65 with volume. Current range: $0.58–$0.65 is the consolidation zone.",
    exitStrategy:
      "If holding, consider stop-loss below $0.55. Target $0.75–$0.80 on breakout confirmation.",
    volume24h: 2100000,
    iconColor: "#00AAE4",
  },
  {
    symbol: "BNB",
    name: "BNB Chain",
    currentPrice: 428.5,
    priceChange24h: 1.15,
    rsi: 55,
    maSignal: "neutral",
    momentum: 18,
    signal: "Hold",
    signalStrength: 52,
    reasoning:
      "BNB trading range-bound with moderate momentum. Exchange token utility remains strong but price needs to break $440 to confirm bullish trend.",
    entryStrategy:
      "Neutral stance. Consider small buys near $420 support. Larger position on breakout above $440.",
    exitStrategy:
      "Reduce exposure near $450 if momentum weakens. Stop-loss at $410 for existing positions.",
    volume24h: 5600000,
    iconColor: "#F0B90B",
  },
  {
    symbol: "SOL",
    name: "Solana",
    currentPrice: 183.2,
    priceChange24h: 3.56,
    rsi: 71,
    maSignal: "buy",
    momentum: 64,
    signal: "Strong Buy",
    signalStrength: 88,
    reasoning:
      "Solana breaking out with strong DeFi and NFT activity. RSI at 71 shows strong momentum. All major MAs aligned bullish. Institutional inflows accelerating.",
    entryStrategy:
      "Strong breakout signal. Enter at market or on slight pullback to $178. Stop-loss at $170.",
    exitStrategy:
      "First target $195, then $210. Trail stop-loss aggressively given high RSI. Be ready to exit quickly if momentum fades.",
    volume24h: 8900000,
    iconColor: "#9945FF",
  },
  {
    symbol: "ADA",
    name: "Cardano",
    currentPrice: 0.523,
    priceChange24h: -1.24,
    rsi: 42,
    maSignal: "sell",
    momentum: -22,
    signal: "Sell",
    signalStrength: 62,
    reasoning:
      "ADA showing bearish momentum with price below all key MAs. RSI at 42 and declining. Cardano development milestones not generating expected price action.",
    entryStrategy:
      "Avoid new longs. Wait for RSI to reach oversold territory (30) before considering accumulation.",
    exitStrategy:
      "Exit current positions. If holding long-term, set stop-loss at $0.48. Short-term target for bears: $0.45.",
    volume24h: 980000,
    iconColor: "#0033AD",
  },
  {
    symbol: "DOT",
    name: "Polkadot",
    currentPrice: 8.72,
    priceChange24h: -0.45,
    rsi: 45,
    maSignal: "neutral",
    momentum: -5,
    signal: "Hold",
    signalStrength: 48,
    reasoning:
      "DOT at neutral territory. Parachain ecosystem growing but price action sluggish. Key support at $8.50 holding, resistance at $9.50.",
    entryStrategy:
      "Hold existing positions. Add modestly near $8.50 support only if Bitcoin remains stable.",
    exitStrategy:
      "Reduce at $9.50 resistance. Full exit if $8.00 support breaks with volume.",
    volume24h: 760000,
    iconColor: "#E6007A",
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    currentPrice: 38.9,
    priceChange24h: 2.78,
    rsi: 60,
    maSignal: "buy",
    momentum: 35,
    signal: "Buy",
    signalStrength: 68,
    reasoning:
      "Avalanche subnet expansion driving ecosystem growth. RSI at 60 with positive MACD. 50-day MA crossover confirmed. Institutional interest from gaming/DeFi sectors.",
    entryStrategy:
      "Buy the current momentum. Enter near $38–$39. Place stop-loss below $35.50.",
    exitStrategy:
      "Target $44 resistance zone. Partial profits at $42. Trail stop as price moves higher.",
    volume24h: 1450000,
    iconColor: "#E84142",
  },
  {
    symbol: "MATIC",
    name: "Polygon",
    currentPrice: 0.924,
    priceChange24h: -2.1,
    rsi: 38,
    maSignal: "sell",
    momentum: -38,
    signal: "Strong Sell",
    signalStrength: 78,
    reasoning:
      "Polygon facing competitive pressure from newer L2s. RSI at 38 and falling. All key MAs trending bearish. Migration to POL token creates uncertainty.",
    entryStrategy:
      "Do not add new positions. Wait for RSI to reach extreme oversold (25-30) for potential contrarian entry.",
    exitStrategy:
      "Exit immediately. Strong downtrend with $0.85 as next support. Bears targeting $0.80 level.",
    volume24h: 1200000,
    iconColor: "#8247E5",
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    currentPrice: 17.85,
    priceChange24h: 1.92,
    rsi: 57,
    maSignal: "buy",
    momentum: 28,
    signal: "Buy",
    signalStrength: 63,
    reasoning:
      "Chainlink oracle network demand growing with AI/DeFi integration. RSI recovering from recent dip. CCIP adoption accelerating cross-chain utility.",
    entryStrategy:
      "Buy dips to $17.00–$17.50. Oracle utility narrative strong. Stop-loss at $15.50.",
    exitStrategy:
      "Target $20.00 resistance. Consider partial exit at $19.00 if momentum slows.",
    volume24h: 920000,
    iconColor: "#2A5ADA",
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    currentPrice: 11.34,
    priceChange24h: 0.67,
    rsi: 52,
    maSignal: "neutral",
    momentum: 12,
    signal: "Hold",
    signalStrength: 50,
    reasoning:
      "UNI consolidating after recent fee switch governance vote. DeFi volumes stable. RSI neutral. Awaiting clearer direction from regulatory developments.",
    entryStrategy:
      "Hold current positions. New entry only on clear breakout above $12 with volume confirmation.",
    exitStrategy: "Reduce at $12.50. Stop-loss at $10.00 for risk management.",
    volume24h: 540000,
    iconColor: "#FF007A",
  },
  {
    symbol: "AAVE",
    name: "Aave",
    currentPrice: 96.4,
    priceChange24h: 3.12,
    rsi: 63,
    maSignal: "buy",
    momentum: 44,
    signal: "Buy",
    signalStrength: 71,
    reasoning:
      "AAVE V3 showing strong TVL growth. Interest rate dynamics favorable. RSI at 63 with MACD bullish crossover. DeFi lending demand increasing.",
    entryStrategy:
      "Accumulate on dips to $92–$95. AAVE fundamentals strong. Stop-loss at $88.",
    exitStrategy:
      "First target $108. Consider full exit if RSI reaches 75+. Trailing stop after $100 break.",
    volume24h: 680000,
    iconColor: "#B6509E",
  },
  {
    symbol: "FET",
    name: "Fetch.ai",
    currentPrice: 2.18,
    priceChange24h: 5.84,
    rsi: 74,
    maSignal: "buy",
    momentum: 72,
    signal: "Strong Buy",
    signalStrength: 82,
    reasoning:
      "FET surging on AI agent narrative and ASI Alliance momentum. RSI at 74 shows extreme momentum but AI narrative supports premium valuations. Volume significantly above average.",
    entryStrategy:
      "High momentum play. Chase only with strict stop-loss at $1.95. Position sizing critical given high RSI.",
    exitStrategy:
      "Aggressive targets: $2.50 then $3.00. Use tight trailing stops. RSI above 80 is exit signal.",
    volume24h: 1380000,
    iconColor: "#1A1F6C",
  },
  {
    symbol: "XDC",
    name: "XDC Network",
    currentPrice: 0.0512,
    priceChange24h: -0.38,
    rsi: 46,
    maSignal: "neutral",
    momentum: -4,
    signal: "Hold",
    signalStrength: 45,
    reasoning:
      "XDC maintaining stable range. Trade finance use cases growing steadily. RSI neutral, no clear directional signal.",
    entryStrategy:
      "Neutral. Small accumulation at $0.048 support level only for long-term holders.",
    exitStrategy:
      "Reduce exposure if price falls below $0.045. Target $0.065 for medium-term.",
    volume24h: 180000,
    iconColor: "#2F8AF5",
  },
  {
    symbol: "VET",
    name: "VeChain",
    currentPrice: 0.0481,
    priceChange24h: -1.56,
    rsi: 40,
    maSignal: "sell",
    momentum: -28,
    signal: "Sell",
    signalStrength: 64,
    reasoning:
      "VeChain underperforming broader market. Supply chain narrative losing traction. RSI declining toward oversold. VTHO utility not translating to VET price action.",
    entryStrategy:
      "Avoid. Wait for RSI at 30 or confirmed bounce off $0.042 before re-entering.",
    exitStrategy:
      "Exit positions now. Next support at $0.042. Bears targeting $0.038.",
    volume24h: 320000,
    iconColor: "#15BDFF",
  },
  {
    symbol: "XLM",
    name: "Stellar",
    currentPrice: 0.124,
    priceChange24h: 0.81,
    rsi: 51,
    maSignal: "neutral",
    momentum: 6,
    signal: "Hold",
    signalStrength: 49,
    reasoning:
      "XLM range-bound between $0.11–$0.13. Stellar payment network growing in emerging markets. RSI neutral. No strong catalyst visible short-term.",
    entryStrategy:
      "Hold. Add only near $0.110 support. Monitor for SWIFT integration news as catalyst.",
    exitStrategy: "Reduce at $0.135 resistance. Stop-loss at $0.105.",
    volume24h: 290000,
    iconColor: "#7D00FF",
  },
  {
    symbol: "KSM",
    name: "Kusama",
    currentPrice: 37.6,
    priceChange24h: -2.85,
    rsi: 36,
    maSignal: "sell",
    momentum: -45,
    signal: "Strong Sell",
    signalStrength: 76,
    reasoning:
      "KSM in clear downtrend. Canary network for Polkadot seeing reduced activity. RSI at 36 and momentum strongly negative. Bears in control.",
    entryStrategy:
      "Do not buy. Wait for capitulation at $30–$32 support zone before considering long-term accumulation.",
    exitStrategy:
      "Exit all positions. Target $30 for shorts. Strong sell signal with bearish MACD crossover confirmed.",
    volume24h: 210000,
    iconColor: "#000000",
  },
  {
    symbol: "SAND",
    name: "The Sandbox",
    currentPrice: 0.548,
    priceChange24h: -1.92,
    rsi: 39,
    maSignal: "sell",
    momentum: -33,
    signal: "Sell",
    signalStrength: 67,
    reasoning:
      "SAND metaverse narrative cooling. User activity metrics declining. RSI at 39 bearish. Price failing to hold $0.55 support zone. Bearish MA crossover confirmed.",
    entryStrategy:
      "Avoid. Metaverse tokens out of favor. Wait for sector rotation back to gaming/metaverse before re-entry.",
    exitStrategy:
      "Exit positions. Next support at $0.48. Bears targeting $0.42 medium-term.",
    volume24h: 340000,
    iconColor: "#04ADEF",
  },
  {
    symbol: "ILV",
    name: "Illuvium",
    currentPrice: 94.2,
    priceChange24h: 2.44,
    rsi: 59,
    maSignal: "buy",
    momentum: 32,
    signal: "Buy",
    signalStrength: 66,
    reasoning:
      "ILV benefiting from open-world game launch momentum. RSI recovering from oversold conditions. Early game access driving token utility. Positive MACD divergence forming.",
    entryStrategy:
      "Buy on momentum confirmation above $95. Game launch catalyst supports bullish case. Stop-loss at $85.",
    exitStrategy:
      "Target $115 on continued game adoption. Take 50% profits at $108. Trail stop on remainder.",
    volume24h: 420000,
    iconColor: "#1E90FF",
  },
];

function generatePriceHistory(basePrice: number, length = 20): number[] {
  const history: number[] = [];
  let price = basePrice * (0.93 + Math.random() * 0.08);
  for (let i = 0; i < length; i++) {
    price = price * (1 + (Math.random() - 0.49) * 0.025);
    history.push(price);
  }
  history[history.length - 1] = basePrice;
  return history;
}

export function initCoins(): CoinData[] {
  return BASE_COINS.map((coin) => ({
    ...coin,
    miniPriceHistory: generatePriceHistory(coin.currentPrice),
  }));
}

export function fluctuateCoins(coins: CoinData[]): CoinData[] {
  return coins.map((coin) => {
    const priceDelta = coin.currentPrice * (Math.random() - 0.498) * 0.004;
    const rawPrice = coin.currentPrice + priceDelta;
    const newPrice =
      Number.isFinite(rawPrice) && rawPrice > 0
        ? Math.max(rawPrice, coin.currentPrice * 0.95)
        : coin.currentPrice;

    const newHistory = [...coin.miniPriceHistory.slice(1), newPrice];

    const rawRsi = coin.rsi + (Math.random() - 0.5) * 1.5;
    const newRsi = Number.isFinite(rawRsi)
      ? Math.max(20, Math.min(85, rawRsi))
      : coin.rsi;

    const rawMomentum = coin.momentum + (Math.random() - 0.5) * 3;
    const newMomentum = Number.isFinite(rawMomentum)
      ? Math.max(-100, Math.min(100, rawMomentum))
      : coin.momentum;

    return {
      ...coin,
      currentPrice: newPrice,
      miniPriceHistory: newHistory,
      rsi: newRsi,
      momentum: newMomentum,
    };
  });
}

export function getSignalColor(signal: SignalType): string {
  switch (signal) {
    case "Strong Buy":
      return "#22E17A";
    case "Buy":
      return "#15C464";
    case "Hold":
      return "#F3C84B";
    case "Sell":
      return "#FF6B35";
    case "Strong Sell":
      return "#FF4B4B";
  }
}

export function getSignalBg(signal: SignalType): string {
  switch (signal) {
    case "Strong Buy":
    case "Buy":
      return "glow-buy";
    case "Hold":
      return "glow-hold";
    case "Sell":
    case "Strong Sell":
      return "glow-sell";
  }
}

export function isBuySignal(signal: SignalType): boolean {
  return signal === "Buy" || signal === "Strong Buy";
}

export function isSellSignal(signal: SignalType): boolean {
  return signal === "Sell" || signal === "Strong Sell";
}
