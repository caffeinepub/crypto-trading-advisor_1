import { Bell, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { CoinData } from "../data/coins";
import { type Alert, useAlerts } from "../hooks/useAlerts";
import { formatPrice } from "../utils/chartUtils";
import { CoinAvatar } from "./CoinSidebar";

const ALERT_TYPE_LABELS: Record<Alert["type"], string> = {
  price_above: "Price rises above",
  price_below: "Price falls below",
  signal_change_buy: "Signal → Buy / Strong Buy",
  signal_change_sell: "Signal → Sell / Strong Sell",
};

interface Props {
  coins: CoinData[];
}

export function AlertsView({ coins }: Props) {
  const { alerts, addAlert, removeAlert } = useAlerts();
  const [showForm, setShowForm] = useState(false);
  const [formSearch, setFormSearch] = useState("");
  const [formSymbol, setFormSymbol] = useState("");
  const [formType, setFormType] = useState<Alert["type"]>("price_above");
  const [formThreshold, setFormThreshold] = useState("");

  const isPriceAlert = formType === "price_above" || formType === "price_below";

  const filteredCoins = coins
    .filter(
      (c) =>
        c.symbol.toLowerCase().includes(formSearch.toLowerCase()) ||
        c.name.toLowerCase().includes(formSearch.toLowerCase()),
    )
    .slice(0, 20);

  const handleAdd = () => {
    if (!formSymbol) return;
    if (isPriceAlert && (!formThreshold || Number(formThreshold) <= 0)) return;

    const newAlert: Alert = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      symbol: formSymbol,
      type: formType,
      threshold: isPriceAlert ? Number(formThreshold) : undefined,
      triggered: false,
      createdAt: Date.now(),
    };
    addAlert(newAlert);
    setShowForm(false);
    setFormSymbol("");
    setFormSearch("");
    setFormThreshold("");
    setFormType("price_above");
  };

  const activeCount = alerts.filter((a) => !a.triggered).length;
  const triggeredCount = alerts.filter((a) => a.triggered).length;

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      style={{ backgroundColor: "oklch(0.09 0.012 243)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="font-bold text-base"
            style={{ color: "oklch(0.95 0.008 240)" }}
          >
            Price Alerts
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.72 0.015 240)" }}
          >
            Get notified when conditions are met
          </p>
        </div>
        <button
          type="button"
          data-ocid="alerts.open_modal_button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold transition-colors"
          style={{
            backgroundColor: "oklch(0.67 0.18 243 / 0.15)",
            color: "oklch(0.67 0.18 243)",
            border: "1px solid oklch(0.67 0.18 243 / 0.3)",
          }}
        >
          <Plus className="w-3 h-3" />
          New Alert
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            label: "Total",
            value: alerts.length,
            color: "oklch(0.72 0.015 240)",
          },
          {
            label: "Active",
            value: activeCount,
            color: "oklch(0.67 0.18 243)",
          },
          {
            label: "Triggered",
            value: triggeredCount,
            color: "oklch(0.72 0.2 145)",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded p-3 text-center"
            style={{
              backgroundColor: "oklch(0.13 0.014 243)",
              border: "1px solid oklch(0.2 0.014 243)",
            }}
          >
            <div className="font-bold text-lg" style={{ color }}>
              {value}
            </div>
            <div className="text-xs" style={{ color: "oklch(0.55 0.01 240)" }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* New alert form */}
      {showForm && (
        <div
          data-ocid="alerts.dialog"
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
            Create Alert
          </div>

          {/* Coin search */}
          <div className="relative">
            <input
              data-ocid="alerts.search_input"
              type="text"
              placeholder="Search coin..."
              value={formSearch}
              onChange={(e) => {
                setFormSearch(e.target.value);
                setFormSymbol("");
              }}
              className="w-full px-2 py-1.5 rounded text-xs outline-none border border-border"
              style={{
                backgroundColor: "oklch(0.14 0.014 243)",
                color: "oklch(0.95 0.008 240)",
              }}
            />
          </div>
          {formSearch && !formSymbol && (
            <div
              className="max-h-36 overflow-y-auto rounded border border-border"
              style={{ backgroundColor: "oklch(0.12 0.013 243)" }}
            >
              {filteredCoins.map((c) => (
                <button
                  key={c.symbol}
                  type="button"
                  onClick={() => {
                    setFormSymbol(c.symbol);
                    setFormSearch(`${c.name} (${c.symbol})`);
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
              {filteredCoins.length === 0 && (
                <div
                  className="px-3 py-2 text-xs"
                  style={{ color: "oklch(0.72 0.015 240)" }}
                >
                  No coins found
                </div>
              )}
            </div>
          )}

          {/* Alert type */}
          <select
            data-ocid="alerts.select"
            value={formType}
            onChange={(e) => setFormType(e.target.value as Alert["type"])}
            className="w-full px-2 py-1.5 rounded text-xs outline-none border border-border"
            style={{
              backgroundColor: "oklch(0.14 0.014 243)",
              color: "oklch(0.95 0.008 240)",
            }}
          >
            {(Object.keys(ALERT_TYPE_LABELS) as Alert["type"][]).map((t) => (
              <option key={t} value={t}>
                {ALERT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>

          {/* Threshold */}
          {isPriceAlert && (
            <input
              data-ocid="alerts.input"
              type="number"
              placeholder="Price threshold (USD)"
              value={formThreshold}
              onChange={(e) => setFormThreshold(e.target.value)}
              min="0"
              step="any"
              className="w-full px-2 py-1.5 rounded text-xs outline-none border border-border"
              style={{
                backgroundColor: "oklch(0.14 0.014 243)",
                color: "oklch(0.95 0.008 240)",
              }}
            />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="alerts.submit_button"
              onClick={handleAdd}
              disabled={!formSymbol || (isPriceAlert && !formThreshold)}
              className="flex-1 py-1.5 rounded text-xs font-semibold transition-opacity disabled:opacity-40"
              style={{
                backgroundColor: "oklch(0.67 0.18 243)",
                color: "oklch(0.09 0.012 243)",
              }}
            >
              Create Alert
            </button>
            <button
              type="button"
              data-ocid="alerts.cancel_button"
              onClick={() => setShowForm(false)}
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

      {/* Alerts list */}
      <div className="space-y-2">
        {alerts.length === 0 && (
          <div
            data-ocid="alerts.empty_state"
            className="rounded p-8 text-center"
            style={{
              backgroundColor: "oklch(0.13 0.014 243)",
              border: "1px solid oklch(0.2 0.014 243)",
            }}
          >
            <Bell
              className="w-8 h-8 mx-auto mb-2"
              style={{ color: "oklch(0.4 0.01 240)" }}
            />
            <p className="text-sm" style={{ color: "oklch(0.95 0.008 240)" }}>
              No alerts yet
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: "oklch(0.55 0.01 240)" }}
            >
              Click "New Alert" to get notified when conditions are met
            </p>
          </div>
        )}
        {alerts.map((alert, idx) => {
          const coin = coins.find((c) => c.symbol === alert.symbol);
          return (
            <div
              key={alert.id}
              data-ocid={`alerts.item.${idx + 1}`}
              className="rounded p-3"
              style={{
                backgroundColor: "oklch(0.13 0.014 243)",
                border: alert.triggered
                  ? "1px solid oklch(0.72 0.2 145 / 0.4)"
                  : "1px solid oklch(0.2 0.014 243)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {coin && <CoinAvatar coin={coin} size={26} />}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "oklch(0.95 0.008 240)" }}
                      >
                        {alert.symbol}
                      </span>
                      {alert.triggered ? (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded font-semibold"
                          style={{
                            backgroundColor: "oklch(0.72 0.2 145 / 0.15)",
                            color: "oklch(0.72 0.2 145)",
                          }}
                        >
                          ✓ Triggered
                        </span>
                      ) : (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded font-semibold"
                          style={{
                            backgroundColor: "oklch(0.67 0.18 243 / 0.15)",
                            color: "oklch(0.67 0.18 243)",
                          }}
                        >
                          Active
                        </span>
                      )}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.72 0.015 240)" }}
                    >
                      {ALERT_TYPE_LABELS[alert.type]}
                      {alert.threshold !== undefined && (
                        <span className="font-mono ml-1">
                          ${alert.threshold.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {alert.triggeredAt && (
                      <div
                        className="text-xs"
                        style={{ color: "oklch(0.55 0.01 240)" }}
                      >
                        {new Date(alert.triggeredAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {coin && (
                    <div className="text-right">
                      <div
                        className="text-xs font-mono"
                        style={{ color: "oklch(0.72 0.015 240)" }}
                      >
                        {formatPrice(coin.currentPrice)}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    data-ocid={`alerts.delete_button.${idx + 1}`}
                    onClick={() => removeAlert(alert.id)}
                    className="p-1 rounded hover:bg-white/5 transition-colors"
                    style={{ color: "oklch(0.55 0.012 240)" }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p
        className="text-xs text-center mt-4"
        style={{ color: "oklch(0.5 0.01 240)" }}
      >
        Alerts checked every 10 seconds. Not financial advice.
      </p>
    </div>
  );
}
