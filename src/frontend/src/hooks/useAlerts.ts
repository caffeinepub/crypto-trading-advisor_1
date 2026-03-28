import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { CoinData } from "../data/coins";
import { cloudLoad, cloudSave } from "./useCloudStorage";

export interface Alert {
  id: string;
  symbol: string;
  type:
    | "price_above"
    | "price_below"
    | "signal_change_buy"
    | "signal_change_sell";
  threshold?: number;
  triggered: boolean;
  createdAt: number;
  triggeredAt?: number;
}

const STORAGE_KEY = "crypto_alerts";
const CLOUD_KEY = "price_alerts";

function loadAlertsLocal(): Alert[] {
  try {
    const raw =
      localStorage.getItem(`cloud_${CLOUD_KEY}`) ||
      localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function persistAlerts(alerts: Alert[]) {
  const json = JSON.stringify(alerts);
  localStorage.setItem(STORAGE_KEY, json);
  localStorage.setItem(`cloud_${CLOUD_KEY}`, json);
  cloudSave(CLOUD_KEY, alerts);
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(loadAlertsLocal);

  // Load from cloud on mount
  useEffect(() => {
    cloudLoad<Alert[]>(CLOUD_KEY, [])
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAlerts(data);
        }
      })
      .catch(() => {});
  }, []);

  const addAlert = useCallback((alert: Alert) => {
    setAlerts((prev) => {
      const next = [...prev, alert];
      persistAlerts(next);
      return next;
    });
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => {
      const next = prev.filter((a) => a.id !== id);
      persistAlerts(next);
      return next;
    });
  }, []);

  const checkAlerts = useCallback((coins: CoinData[]) => {
    setAlerts((prev) => {
      let changed = false;
      const next = prev.map((alert) => {
        if (alert.triggered) return alert;
        const coin = coins.find((c) => c.symbol === alert.symbol);
        if (!coin) return alert;

        let triggered = false;
        if (alert.type === "price_above" && alert.threshold !== undefined) {
          triggered = coin.currentPrice >= alert.threshold;
        } else if (
          alert.type === "price_below" &&
          alert.threshold !== undefined
        ) {
          triggered = coin.currentPrice <= alert.threshold;
        } else if (alert.type === "signal_change_buy") {
          triggered = coin.signal === "Buy" || coin.signal === "Strong Buy";
        } else if (alert.type === "signal_change_sell") {
          triggered = coin.signal === "Sell" || coin.signal === "Strong Sell";
        }

        if (triggered) {
          changed = true;
          const label =
            alert.type === "price_above"
              ? `${alert.symbol} price crossed above $${alert.threshold?.toLocaleString()}`
              : alert.type === "price_below"
                ? `${alert.symbol} price dropped below $${alert.threshold?.toLocaleString()}`
                : alert.type === "signal_change_buy"
                  ? `${alert.symbol} signal is now ${coin.signal}`
                  : `${alert.symbol} signal is now ${coin.signal}`;
          toast.success(`🔔 Alert: ${label}`);
          return { ...alert, triggered: true, triggeredAt: Date.now() };
        }
        return alert;
      });
      if (changed) persistAlerts(next);
      return changed ? next : prev;
    });
  }, []);

  return { alerts, addAlert, removeAlert, checkAlerts };
}
