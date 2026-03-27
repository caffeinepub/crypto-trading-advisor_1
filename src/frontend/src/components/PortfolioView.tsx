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

interface Props {
  coins: CoinData[];
}

const STORAGE_KEY = "crypto_portfolio";

function loadHoldings(): Holding[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveHoldings(holdings: Holding[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
}

export function PortfolioView({ coins }: Props) {
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

  const handleRemove = (symbol: string) => {
    setHoldings((prev) => prev.filter((h) => h.symbol !== symbol));
  };

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      style={{ backgroundColor: "oklch(0.09 0.012 243)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2
            className="font-display font-bold text-base"
            style={{ color: "oklch(0.95 0.008 240)" }}
          >
            My Portfolio
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.72 0.015 240)" }}
          >
            Track your crypto holdings
          </p>
        </div>
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

      {/* Add holding panel */}
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
              placeholder="Search any of 300+ coins..."
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

      {/* Total */}
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
            className="font-display font-bold text-2xl"
            style={{ color: "oklch(0.67 0.18 243)" }}
            data-ocid="portfolio.card"
          >
            {formatPrice(totalValue)}
          </div>
        </div>
      )}

      {/* Holdings */}
      <div className="space-y-2">
        {enriched.map((h, idx) => {
          if (!h.coin) return null;
          const allocPct = totalValue > 0 ? (h.value / totalValue) * 100 : 0;
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
                    onClick={() => handleRemove(h.symbol)}
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
            <p className="text-xs" style={{ color: "oklch(0.72 0.015 240)" }}>
              Click &ldquo;Add&rdquo; to start building your portfolio
            </p>
          </div>
        )}
      </div>

      <p
        className="text-xs text-center mt-4"
        style={{ color: "oklch(0.5 0.01 240)" }}
      >
        Portfolio tracked locally. Not financial advice.
      </p>
    </div>
  );
}
