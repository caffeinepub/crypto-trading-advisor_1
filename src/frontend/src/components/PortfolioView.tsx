import { Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { CoinData } from "../data/coins";
import { getSignalColor } from "../data/coins";
import { formatPrice } from "../utils/chartUtils";
import { CoinAvatar } from "./CoinSidebar";

interface Holding {
  symbol: string;
  amount: number;
}

interface Trade {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  amount: number;
  entryPrice: number;
  date: string;
  notes?: string;
}

interface Props {
  coins: CoinData[];
}

const HOLDINGS_KEY = "crypto_portfolio";
const TRADES_KEY = "crypto_trades";

function loadHoldings(): Holding[] {
  try {
    const raw = localStorage.getItem(HOLDINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveHoldings(holdings: Holding[]) {
  localStorage.setItem(HOLDINGS_KEY, JSON.stringify(holdings));
}

function loadTrades(): Trade[] {
  try {
    const raw = localStorage.getItem(TRADES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveTrades(trades: Trade[]) {
  localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
}

type SubTab = "Holdings" | "Trades";

export function PortfolioView({ coins }: Props) {
  const [subTab, setSubTab] = useState<SubTab>("Holdings");

  // --- Holdings ---
  const [holdings, setHoldings] = useState<Holding[]>(loadHoldings);
  const [showAdd, setShowAdd] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [addSymbol, setAddSymbol] = useState("");
  const [addAmount, setAddAmount] = useState("");

  useEffect(() => {
    saveHoldings(holdings);
  }, [holdings]);

  const enriched = holdings
    .map((h) => {
      const coin = coins.find((c) => c.symbol === h.symbol);
      const value = coin ? coin.currentPrice * h.amount : 0;
      return { ...h, coin, value };
    })
    .filter((h) => h.coin);

  const totalValue = enriched.reduce((s, h) => s + h.value, 0);

  const filteredAddCoins = coins
    .filter(
      (c) =>
        c.symbol.toLowerCase().includes(addSearch.toLowerCase()) ||
        c.name.toLowerCase().includes(addSearch.toLowerCase()),
    )
    .slice(0, 20);

  const handleAddHolding = () => {
    if (!addSymbol || !addAmount || Number(addAmount) <= 0) return;
    setHoldings((prev) => {
      const existing = prev.find((h) => h.symbol === addSymbol);
      if (existing) {
        return prev.map((h) =>
          h.symbol === addSymbol
            ? { ...h, amount: h.amount + Number(addAmount) }
            : h,
        );
      }
      return [...prev, { symbol: addSymbol, amount: Number(addAmount) }];
    });
    setAddSymbol("");
    setAddAmount("");
    setAddSearch("");
    setShowAdd(false);
  };

  const handleRemoveHolding = (symbol: string) => {
    setHoldings((prev) => prev.filter((h) => h.symbol !== symbol));
  };

  // --- Trades ---
  const [trades, setTrades] = useState<Trade[]>(loadTrades);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [tradeSearch, setTradeSearch] = useState("");
  const [tradeSymbol, setTradeSymbol] = useState("");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradePrice, setTradePrice] = useState("");
  const [tradeDate, setTradeDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [tradeNotes, setTradeNotes] = useState("");

  useEffect(() => {
    saveTrades(trades);
  }, [trades]);

  const filteredTradeCoins = coins
    .filter(
      (c) =>
        c.symbol.toLowerCase().includes(tradeSearch.toLowerCase()) ||
        c.name.toLowerCase().includes(tradeSearch.toLowerCase()),
    )
    .slice(0, 20);

  const handleAddTrade = () => {
    if (!tradeSymbol || !tradeAmount || !tradePrice) return;
    const trade: Trade = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      symbol: tradeSymbol,
      type: tradeType,
      amount: Number(tradeAmount),
      entryPrice: Number(tradePrice),
      date: tradeDate,
      notes: tradeNotes || undefined,
    };
    setTrades((prev) => [trade, ...prev]);
    setTradeSymbol("");
    setTradeSearch("");
    setTradeAmount("");
    setTradePrice("");
    setTradeNotes("");
    setShowTradeForm(false);
  };

  const handleRemoveTrade = (id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
  };

  // Performance summary
  const buyTrades = trades.filter((t) => t.type === "buy");
  const totalInvested = buyTrades.reduce(
    (s, t) => s + t.amount * t.entryPrice,
    0,
  );
  const currentValue = buyTrades.reduce((s, t) => {
    const coin = coins.find((c) => c.symbol === t.symbol);
    return s + t.amount * (coin?.currentPrice ?? t.entryPrice);
  }, 0);
  const totalPnL = currentValue - totalInvested;
  const pnlPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const isPnLPositive = totalPnL >= 0;

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      style={{ backgroundColor: "oklch(0.09 0.012 243)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2
            className="font-bold text-base"
            style={{ color: "oklch(0.95 0.008 240)" }}
          >
            My Portfolio
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.72 0.015 240)" }}
          >
            Track your crypto holdings and trades
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div
        className="flex gap-1 p-1 rounded"
        style={{
          backgroundColor: "oklch(0.13 0.014 243)",
          border: "1px solid oklch(0.2 0.014 243)",
        }}
      >
        {(["Holdings", "Trades"] as SubTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            data-ocid={`portfolio.${tab.toLowerCase()}.tab`}
            onClick={() => setSubTab(tab)}
            className="flex-1 py-1.5 rounded text-xs font-semibold transition-colors"
            style={{
              backgroundColor:
                subTab === tab ? "oklch(0.67 0.18 243)" : "transparent",
              color:
                subTab === tab
                  ? "oklch(0.09 0.012 243)"
                  : "oklch(0.72 0.015 240)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- Holdings tab --- */}
      {subTab === "Holdings" && (
        <>
          <div className="flex items-center justify-between">
            <span
              className="text-xs"
              style={{ color: "oklch(0.72 0.015 240)" }}
            >
              {enriched.length} asset{enriched.length !== 1 ? "s" : ""}
            </span>
            <button
              type="button"
              data-ocid="portfolio.open_modal_button"
              onClick={() => setShowAdd((v) => !v)}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold transition-colors"
              style={{
                backgroundColor: "oklch(0.67 0.18 243 / 0.15)",
                color: "oklch(0.67 0.18 243)",
                border: "1px solid oklch(0.67 0.18 243 / 0.3)",
              }}
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>

          {showAdd && (
            <div
              className="rounded p-3 space-y-2"
              style={{
                backgroundColor: "oklch(0.13 0.014 243)",
                border: "1px solid oklch(0.22 0.016 243)",
              }}
            >
              <div
                className="text-xs font-semibold mb-1"
                style={{ color: "oklch(0.95 0.008 240)" }}
              >
                Add Holding
              </div>
              <div className="relative">
                <Search
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3"
                  style={{ color: "oklch(0.72 0.015 240)" }}
                />
                <input
                  data-ocid="portfolio.search_input"
                  type="text"
                  placeholder="Search any of 1500+ coins..."
                  value={addSearch}
                  onChange={(e) => {
                    setAddSearch(e.target.value);
                    setAddSymbol("");
                  }}
                  className="w-full pl-6 pr-2 py-1.5 rounded text-xs outline-none border border-border"
                  style={{
                    backgroundColor: "oklch(0.14 0.014 243)",
                    color: "oklch(0.95 0.008 240)",
                  }}
                />
              </div>
              {addSearch && !addSymbol && (
                <div
                  className="max-h-36 overflow-y-auto rounded border border-border"
                  style={{ backgroundColor: "oklch(0.12 0.013 243)" }}
                >
                  {filteredAddCoins.map((c) => (
                    <button
                      key={c.symbol}
                      type="button"
                      onClick={() => {
                        setAddSymbol(c.symbol);
                        setAddSearch(`${c.name} (${c.symbol})`);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-white/5 transition-colors"
                    >
                      <CoinAvatar coin={c} size={20} />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "oklch(0.95 0.008 240)" }}
                      >
                        {c.symbol}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "oklch(0.72 0.015 240)" }}
                      >
                        {c.name}
                      </span>
                      <span
                        className="ml-auto text-xs font-mono"
                        style={{ color: "oklch(0.72 0.015 240)" }}
                      >
                        {formatPrice(c.currentPrice)}
                      </span>
                    </button>
                  ))}
                  {filteredAddCoins.length === 0 && (
                    <div
                      className="px-3 py-2 text-xs"
                      style={{ color: "oklch(0.72 0.015 240)" }}
                    >
                      No coins found
                    </div>
                  )}
                </div>
              )}
              {addSymbol && (
                <div className="flex gap-2 items-center">
                  <input
                    data-ocid="portfolio.input"
                    type="number"
                    placeholder="Amount"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    min="0"
                    step="any"
                    className="flex-1 px-2 py-1.5 rounded text-xs outline-none border border-border"
                    style={{
                      backgroundColor: "oklch(0.14 0.014 243)",
                      color: "oklch(0.95 0.008 240)",
                    }}
                  />
                  <button
                    type="button"
                    data-ocid="portfolio.submit_button"
                    onClick={handleAddHolding}
                    className="px-3 py-1.5 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: "oklch(0.67 0.18 243)",
                      color: "oklch(0.09 0.012 243)",
                    }}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          )}

          {enriched.length > 0 && (
            <div
              className="rounded p-4"
              style={{
                backgroundColor: "oklch(0.13 0.014 243)",
                border: "1px solid oklch(0.2 0.014 243)",
              }}
            >
              <div
                className="text-xs tracking-wider mb-1"
                style={{ color: "oklch(0.72 0.015 240)" }}
              >
                TOTAL VALUE
              </div>
              <div
                className="font-bold text-2xl"
                style={{ color: "oklch(0.67 0.18 243)" }}
                data-ocid="portfolio.card"
              >
                {formatPrice(totalValue)}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {enriched.map((h, idx) => {
              if (!h.coin) return null;
              const allocPct =
                totalValue > 0 ? (h.value / totalValue) * 100 : 0;
              const signalColor = getSignalColor(h.coin.signal);
              const isPositive = h.coin.priceChange24h >= 0;
              return (
                <div
                  key={h.symbol}
                  data-ocid={`portfolio.item.${idx + 1}`}
                  className="rounded p-3"
                  style={{
                    backgroundColor: "oklch(0.13 0.014 243)",
                    border: "1px solid oklch(0.2 0.014 243)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CoinAvatar coin={h.coin} size={28} />
                      <div>
                        <div
                          className="text-sm font-semibold"
                          style={{ color: "oklch(0.95 0.008 240)" }}
                        >
                          {h.coin.symbol}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: "oklch(0.72 0.015 240)" }}
                        >
                          {h.amount} {h.coin.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div
                          className="font-mono font-semibold text-sm"
                          style={{ color: "oklch(0.95 0.008 240)" }}
                        >
                          {formatPrice(h.value)}
                        </div>
                        <div
                          className="text-xs font-mono"
                          style={{
                            color: isPositive
                              ? "oklch(0.82 0.22 155)"
                              : "oklch(0.63 0.22 25)",
                          }}
                        >
                          {isPositive ? "+" : ""}
                          {h.coin.priceChange24h.toFixed(2)}%
                        </div>
                      </div>
                      <button
                        type="button"
                        data-ocid={`portfolio.delete_button.${idx + 1}`}
                        onClick={() => handleRemoveHolding(h.symbol)}
                        className="p-1 rounded hover:bg-white/5 transition-colors"
                        style={{ color: "oklch(0.55 0.012 240)" }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex-1 h-1 rounded-full"
                      style={{ backgroundColor: "oklch(0.2 0.014 243)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${allocPct}%`,
                          backgroundColor: "oklch(0.67 0.18 243)",
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-mono"
                      style={{ color: "oklch(0.67 0.18 243)", minWidth: 36 }}
                    >
                      {allocPct.toFixed(1)}%
                    </span>
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${signalColor}22`,
                        color: signalColor,
                        fontSize: 10,
                      }}
                    >
                      {h.coin.signal}
                    </span>
                  </div>
                  <div
                    className="mt-2 text-xs"
                    style={{ color: "oklch(0.72 0.015 240)" }}
                  >
                    {formatPrice(h.coin.currentPrice)} per coin
                  </div>
                </div>
              );
            })}
            {enriched.length === 0 && (
              <div
                data-ocid="portfolio.empty_state"
                className="rounded p-6 text-center"
                style={{
                  backgroundColor: "oklch(0.13 0.014 243)",
                  border: "1px solid oklch(0.2 0.014 243)",
                }}
              >
                <p
                  className="text-sm mb-1"
                  style={{ color: "oklch(0.95 0.008 240)" }}
                >
                  No holdings yet
                </p>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.72 0.015 240)" }}
                >
                  Click "Add" to start building your portfolio
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* --- Trades tab --- */}
      {subTab === "Trades" && (
        <>
          <div className="flex items-center justify-between">
            <span
              className="text-xs"
              style={{ color: "oklch(0.72 0.015 240)" }}
            >
              {trades.length} trade{trades.length !== 1 ? "s" : ""}
            </span>
            <button
              type="button"
              data-ocid="trades.open_modal_button"
              onClick={() => setShowTradeForm((v) => !v)}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold transition-colors"
              style={{
                backgroundColor: "oklch(0.67 0.18 243 / 0.15)",
                color: "oklch(0.67 0.18 243)",
                border: "1px solid oklch(0.67 0.18 243 / 0.3)",
              }}
            >
              <Plus className="w-3 h-3" />
              Log Trade
            </button>
          </div>

          {/* Performance summary */}
          {trades.length > 0 && (
            <div
              className="rounded p-4 grid grid-cols-2 gap-3"
              style={{
                backgroundColor: "oklch(0.13 0.014 243)",
                border: "1px solid oklch(0.2 0.014 243)",
              }}
              data-ocid="trades.card"
            >
              <div>
                <div
                  className="text-xs tracking-wider mb-1"
                  style={{ color: "oklch(0.72 0.015 240)" }}
                >
                  TOTAL INVESTED
                </div>
                <div
                  className="font-bold text-base"
                  style={{ color: "oklch(0.95 0.008 240)" }}
                >
                  {formatPrice(totalInvested)}
                </div>
              </div>
              <div>
                <div
                  className="text-xs tracking-wider mb-1"
                  style={{ color: "oklch(0.72 0.015 240)" }}
                >
                  CURRENT VALUE
                </div>
                <div
                  className="font-bold text-base"
                  style={{ color: "oklch(0.95 0.008 240)" }}
                >
                  {formatPrice(currentValue)}
                </div>
              </div>
              <div>
                <div
                  className="text-xs tracking-wider mb-1"
                  style={{ color: "oklch(0.72 0.015 240)" }}
                >
                  TOTAL P&amp;L
                </div>
                <div
                  className="font-bold text-base"
                  style={{
                    color: isPnLPositive
                      ? "oklch(0.82 0.22 155)"
                      : "oklch(0.63 0.22 25)",
                  }}
                >
                  {isPnLPositive ? "+" : ""}
                  {formatPrice(totalPnL)}
                </div>
              </div>
              <div>
                <div
                  className="text-xs tracking-wider mb-1"
                  style={{ color: "oklch(0.72 0.015 240)" }}
                >
                  P&amp;L %
                </div>
                <div
                  className="font-bold text-base"
                  style={{
                    color: isPnLPositive
                      ? "oklch(0.82 0.22 155)"
                      : "oklch(0.63 0.22 25)",
                  }}
                >
                  {isPnLPositive ? "+" : ""}
                  {pnlPct.toFixed(2)}%
                </div>
              </div>
            </div>
          )}

          {/* Trade form */}
          {showTradeForm && (
            <div
              data-ocid="trades.dialog"
              className="rounded p-3 space-y-2"
              style={{
                backgroundColor: "oklch(0.13 0.014 243)",
                border: "1px solid oklch(0.22 0.016 243)",
              }}
            >
              <div
                className="text-xs font-semibold"
                style={{ color: "oklch(0.95 0.008 240)" }}
              >
                Log Trade
              </div>

              {/* Coin search */}
              <div className="relative">
                <Search
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3"
                  style={{ color: "oklch(0.72 0.015 240)" }}
                />
                <input
                  data-ocid="trades.search_input"
                  type="text"
                  placeholder="Search coin..."
                  value={tradeSearch}
                  onChange={(e) => {
                    setTradeSearch(e.target.value);
                    setTradeSymbol("");
                  }}
                  className="w-full pl-6 pr-2 py-1.5 rounded text-xs outline-none border border-border"
                  style={{
                    backgroundColor: "oklch(0.14 0.014 243)",
                    color: "oklch(0.95 0.008 240)",
                  }}
                />
              </div>
              {tradeSearch && !tradeSymbol && (
                <div
                  className="max-h-36 overflow-y-auto rounded border border-border"
                  style={{ backgroundColor: "oklch(0.12 0.013 243)" }}
                >
                  {filteredTradeCoins.map((c) => (
                    <button
                      key={c.symbol}
                      type="button"
                      onClick={() => {
                        setTradeSymbol(c.symbol);
                        setTradeSearch(`${c.name} (${c.symbol})`);
                        setTradePrice(c.currentPrice.toString());
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-white/5 transition-colors"
                    >
                      <CoinAvatar coin={c} size={20} />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "oklch(0.95 0.008 240)" }}
                      >
                        {c.symbol}
                      </span>
                      <span
                        className="ml-auto text-xs font-mono"
                        style={{ color: "oklch(0.72 0.015 240)" }}
                      >
                        {formatPrice(c.currentPrice)}
                      </span>
                    </button>
                  ))}
                  {filteredTradeCoins.length === 0 && (
                    <div
                      className="px-3 py-2 text-xs"
                      style={{ color: "oklch(0.72 0.015 240)" }}
                    >
                      No coins found
                    </div>
                  )}
                </div>
              )}

              {/* Buy/Sell toggle */}
              <div className="flex gap-1">
                {(["buy", "sell"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    data-ocid={`trades.${t}.toggle`}
                    onClick={() => setTradeType(t)}
                    className="flex-1 py-1.5 rounded text-xs font-semibold uppercase transition-colors"
                    style={{
                      backgroundColor:
                        tradeType === t
                          ? t === "buy"
                            ? "oklch(0.72 0.2 145 / 0.2)"
                            : "oklch(0.63 0.22 25 / 0.2)"
                          : "oklch(0.16 0.014 243)",
                      color:
                        tradeType === t
                          ? t === "buy"
                            ? "oklch(0.72 0.2 145)"
                            : "oklch(0.63 0.22 25)"
                          : "oklch(0.55 0.01 240)",
                      border: `1px solid ${
                        tradeType === t
                          ? t === "buy"
                            ? "oklch(0.72 0.2 145 / 0.4)"
                            : "oklch(0.63 0.22 25 / 0.4)"
                          : "oklch(0.22 0.016 243)"
                      }`,
                    }}
                  >
                    {t === "buy" ? "🟢 Buy" : "🔴 Sell"}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  data-ocid="trades.input"
                  type="number"
                  placeholder="Amount"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  min="0"
                  step="any"
                  className="px-2 py-1.5 rounded text-xs outline-none border border-border"
                  style={{
                    backgroundColor: "oklch(0.14 0.014 243)",
                    color: "oklch(0.95 0.008 240)",
                  }}
                />
                <input
                  data-ocid="trades.price_input"
                  type="number"
                  placeholder="Entry price (USD)"
                  value={tradePrice}
                  onChange={(e) => setTradePrice(e.target.value)}
                  min="0"
                  step="any"
                  className="px-2 py-1.5 rounded text-xs outline-none border border-border"
                  style={{
                    backgroundColor: "oklch(0.14 0.014 243)",
                    color: "oklch(0.95 0.008 240)",
                  }}
                />
              </div>
              <input
                data-ocid="trades.date_input"
                type="date"
                value={tradeDate}
                onChange={(e) => setTradeDate(e.target.value)}
                className="w-full px-2 py-1.5 rounded text-xs outline-none border border-border"
                style={{
                  backgroundColor: "oklch(0.14 0.014 243)",
                  color: "oklch(0.95 0.008 240)",
                  colorScheme: "dark",
                }}
              />
              <input
                data-ocid="trades.notes_input"
                type="text"
                placeholder="Notes (optional)"
                value={tradeNotes}
                onChange={(e) => setTradeNotes(e.target.value)}
                className="w-full px-2 py-1.5 rounded text-xs outline-none border border-border"
                style={{
                  backgroundColor: "oklch(0.14 0.014 243)",
                  color: "oklch(0.95 0.008 240)",
                }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  data-ocid="trades.submit_button"
                  onClick={handleAddTrade}
                  disabled={!tradeSymbol || !tradeAmount || !tradePrice}
                  className="flex-1 py-1.5 rounded text-xs font-semibold transition-opacity disabled:opacity-40"
                  style={{
                    backgroundColor: "oklch(0.67 0.18 243)",
                    color: "oklch(0.09 0.012 243)",
                  }}
                >
                  Log Trade
                </button>
                <button
                  type="button"
                  data-ocid="trades.cancel_button"
                  onClick={() => setShowTradeForm(false)}
                  className="px-3 py-1.5 rounded text-xs"
                  style={{
                    backgroundColor: "oklch(0.16 0.014 243)",
                    color: "oklch(0.72 0.015 240)",
                    border: "1px solid oklch(0.22 0.016 243)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Trades list */}
          <div className="space-y-2">
            {trades.length === 0 && (
              <div
                data-ocid="trades.empty_state"
                className="rounded p-6 text-center"
                style={{
                  backgroundColor: "oklch(0.13 0.014 243)",
                  border: "1px solid oklch(0.2 0.014 243)",
                }}
              >
                <p
                  className="text-sm mb-1"
                  style={{ color: "oklch(0.95 0.008 240)" }}
                >
                  No trades logged yet
                </p>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.72 0.015 240)" }}
                >
                  Click "Log Trade" to start tracking your trades
                </p>
              </div>
            )}
            {trades.map((trade, idx) => {
              const coin = coins.find((c) => c.symbol === trade.symbol);
              const currentPrice = coin?.currentPrice ?? trade.entryPrice;
              const pnl =
                trade.type === "buy"
                  ? (currentPrice - trade.entryPrice) * trade.amount
                  : 0;
              const pnlPct =
                trade.type === "buy" && trade.entryPrice > 0
                  ? ((currentPrice - trade.entryPrice) / trade.entryPrice) * 100
                  : 0;
              const isBuy = trade.type === "buy";
              const isGain = pnl >= 0;
              return (
                <div
                  key={trade.id}
                  data-ocid={`trades.item.${idx + 1}`}
                  className="rounded p-3"
                  style={{
                    backgroundColor: "oklch(0.13 0.014 243)",
                    border: "1px solid oklch(0.2 0.014 243)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {coin && <CoinAvatar coin={coin} size={26} />}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "oklch(0.95 0.008 240)" }}
                          >
                            {trade.symbol}
                          </span>
                          <span
                            className="text-xs px-1.5 py-0.5 rounded font-bold uppercase"
                            style={{
                              backgroundColor: isBuy
                                ? "oklch(0.72 0.2 145 / 0.15)"
                                : "oklch(0.63 0.22 25 / 0.15)",
                              color: isBuy
                                ? "oklch(0.72 0.2 145)"
                                : "oklch(0.63 0.22 25)",
                            }}
                          >
                            {trade.type}
                          </span>
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: "oklch(0.72 0.015 240)" }}
                        >
                          {trade.amount} @ {formatPrice(trade.entryPrice)}
                        </div>
                        {trade.notes && (
                          <div
                            className="text-xs italic"
                            style={{ color: "oklch(0.55 0.01 240)" }}
                          >
                            {trade.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="text-right">
                        {isBuy && (
                          <>
                            <div
                              className="text-sm font-semibold font-mono"
                              style={{
                                color: isGain
                                  ? "oklch(0.82 0.22 155)"
                                  : "oklch(0.63 0.22 25)",
                              }}
                            >
                              {isGain ? "+" : ""}
                              {formatPrice(pnl)}
                            </div>
                            <div
                              className="text-xs font-mono"
                              style={{
                                color: isGain
                                  ? "oklch(0.72 0.2 145)"
                                  : "oklch(0.63 0.22 25)",
                              }}
                            >
                              {isGain ? "+" : ""}
                              {pnlPct.toFixed(2)}%
                            </div>
                          </>
                        )}
                        <div
                          className="text-xs"
                          style={{ color: "oklch(0.55 0.01 240)" }}
                        >
                          {new Date(trade.date).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        type="button"
                        data-ocid={`trades.delete_button.${idx + 1}`}
                        onClick={() => handleRemoveTrade(trade.id)}
                        className="p-1 rounded hover:bg-white/5 transition-colors"
                        style={{ color: "oklch(0.55 0.012 240)" }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {isBuy && coin && (
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className="text-xs"
                        style={{ color: "oklch(0.55 0.01 240)" }}
                      >
                        Current: {formatPrice(currentPrice)}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "oklch(0.55 0.01 240)" }}
                      >
                        ·
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "oklch(0.55 0.01 240)" }}
                      >
                        Entry: {formatPrice(trade.entryPrice)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <p
        className="text-xs text-center mt-4"
        style={{ color: "oklch(0.5 0.01 240)" }}
      >
        Portfolio tracked locally. Not financial advice.
      </p>
    </div>
  );
}
