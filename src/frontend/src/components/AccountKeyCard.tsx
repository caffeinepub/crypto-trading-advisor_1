import { Check, Copy, KeyRound, RefreshCw } from "lucide-react";
import { useState } from "react";
import { getAccountKey, setAccountKey } from "../hooks/useAccountKey";

export function AccountKeyCard() {
  const [accountKey] = useState(getAccountKey);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  const [restoreInput, setRestoreInput] = useState("");
  const [restoreError, setRestoreError] = useState("");

  const maskedKey = accountKey
    ? `${accountKey.slice(0, 8)}-****-****-****-${accountKey.slice(-4)}`
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accountKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleRestore = () => {
    const trimmed = restoreInput.trim();
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(trimmed)) {
      setRestoreError("Invalid key format. Please enter a valid account key.");
      return;
    }
    setAccountKey(trimmed);
    window.location.reload();
  };

  return (
    <div
      data-ocid="account_key.card"
      className="rounded-lg p-4 space-y-3"
      style={{
        backgroundColor: "oklch(0.13 0.014 243)",
        border: "1px solid oklch(0.22 0.016 243)",
      }}
    >
      <div className="flex items-center gap-2">
        <KeyRound
          className="w-4 h-4 flex-shrink-0"
          style={{ color: "oklch(0.67 0.18 243)" }}
        />
        <div>
          <h3
            className="text-sm font-semibold"
            style={{ color: "oklch(0.95 0.008 240)" }}
          >
            Your Account Key
          </h3>
          <p className="text-xs" style={{ color: "oklch(0.65 0.015 240)" }}>
            Save this key to restore your data on a new device or after clearing
            your browser.
          </p>
        </div>
      </div>

      {/* Key display */}
      <div
        className="flex items-center gap-2 rounded px-3 py-2"
        style={{
          backgroundColor: "oklch(0.10 0.012 243)",
          border: "1px solid oklch(0.20 0.014 243)",
        }}
      >
        <code
          className="flex-1 text-xs font-mono select-all tracking-wide"
          style={{ color: "oklch(0.80 0.015 240)" }}
        >
          {revealed ? accountKey : maskedKey}
        </code>
        <button
          type="button"
          data-ocid="account_key.toggle"
          onClick={() => setRevealed((v) => !v)}
          className="text-xs px-2 py-0.5 rounded transition-colors"
          style={{
            color: "oklch(0.60 0.015 240)",
            backgroundColor: "oklch(0.16 0.014 243)",
          }}
        >
          {revealed ? "Hide" : "Show"}
        </button>
        <button
          type="button"
          data-ocid="account_key.button"
          onClick={handleCopy}
          className="p-1.5 rounded transition-colors"
          style={{
            color: copied ? "oklch(0.82 0.22 155)" : "oklch(0.67 0.18 243)",
            backgroundColor: "oklch(0.16 0.014 243)",
          }}
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Restore section */}
      {!showRestore ? (
        <button
          type="button"
          data-ocid="account_key.open_modal_button"
          onClick={() => setShowRestore(true)}
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: "oklch(0.60 0.015 240)" }}
        >
          <RefreshCw className="w-3 h-3" />
          Restore from a different key
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-xs" style={{ color: "oklch(0.70 0.015 240)" }}>
            Paste your saved account key below. This will replace your current
            key and reload the app.
          </p>
          <input
            data-ocid="account_key.input"
            type="text"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={restoreInput}
            onChange={(e) => {
              setRestoreInput(e.target.value);
              setRestoreError("");
            }}
            className="w-full px-3 py-2 rounded text-xs font-mono outline-none border border-border"
            style={{
              backgroundColor: "oklch(0.11 0.012 243)",
              color: "oklch(0.90 0.008 240)",
            }}
          />
          {restoreError && (
            <p
              data-ocid="account_key.error_state"
              className="text-xs"
              style={{ color: "oklch(0.63 0.22 25)" }}
            >
              {restoreError}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="account_key.confirm_button"
              onClick={handleRestore}
              disabled={!restoreInput.trim()}
              className="flex-1 py-1.5 rounded text-xs font-semibold transition-opacity disabled:opacity-40"
              style={{
                backgroundColor: "oklch(0.67 0.18 243)",
                color: "oklch(0.09 0.012 243)",
              }}
            >
              Restore &amp; Reload
            </button>
            <button
              type="button"
              data-ocid="account_key.cancel_button"
              onClick={() => {
                setShowRestore(false);
                setRestoreInput("");
                setRestoreError("");
              }}
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
    </div>
  );
}
