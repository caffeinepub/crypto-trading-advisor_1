import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLockStore } from "../hooks/useLockStore";

const PAD_KEYS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "_empty",
  "0",
  "⌫",
];
const PIN_POSITIONS = ["p0", "p1", "p2", "p3", "p4", "p5", "p6", "p7"];

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const { verifyPin, verifyBiometric, hasBiometric } = useLockStore();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [credentialLost, setCredentialLost] = useState(false);
  const maxLen = 8;
  const shakeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerShake = useCallback(() => {
    setShake(true);
    if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
    shakeTimeout.current = setTimeout(() => setShake(false), 600);
  }, []);

  const handleUnlock = useCallback(
    async (currentPin: string) => {
      const ok = await verifyPin(currentPin);
      if (ok) {
        onUnlock();
      } else {
        setError("Incorrect PIN. Try again.");
        setPin("");
        triggerShake();
      }
    },
    [verifyPin, onUnlock, triggerShake],
  );

  const handlePad = (key: string) => {
    if (key === "⌫") {
      setPin((p) => p.slice(0, -1));
      setError("");
      return;
    }
    if (key === "_empty") return;
    const next = pin + key;
    setPin(next);
    setError("");
    if (next.length >= maxLen) {
      handleUnlock(next);
    }
  };

  // handleBiometric must be called directly from a user tap (not from useEffect)
  // because iOS Safari and many mobile browsers require a user gesture for WebAuthn
  const handleBiometric = useCallback(async () => {
    if (biometricLoading) return;
    setBiometricLoading(true);
    setError("");
    setCredentialLost(false);
    const result = await verifyBiometric();
    setBiometricLoading(false);
    if (result.ok) {
      onUnlock();
    } else if (result.credentialLost) {
      setCredentialLost(true);
      setError(
        "Biometric data not found on this device. Please re-register in Lock Settings, then use your PIN.",
      );
      triggerShake();
    } else {
      // User cancelled — don't show error, just let them use PIN
      setError("");
    }
  }, [verifyBiometric, onUnlock, triggerShake, biometricLoading]);

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        setPin((p) => p.slice(0, -1));
        setError("");
      } else if (/^[0-9]$/.test(e.key)) {
        const next = pin + e.key;
        setPin(next);
        setError("");
        if (next.length >= maxLen) handleUnlock(next);
      } else if (e.key === "Enter" && pin.length > 0) {
        handleUnlock(pin);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pin, handleUnlock]);

  const supportsWebAuthn = !!window.PublicKeyCredential;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ backgroundColor: "oklch(0.07 0.014 243)" }}
      data-ocid="lock.modal"
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.67 0.18 243 / 0.12), transparent)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center gap-6 w-full max-w-xs px-6 relative"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
            style={{
              backgroundColor: "oklch(0.67 0.18 243 / 0.15)",
              border: "1px solid oklch(0.67 0.18 243 / 0.3)",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <polyline
                points="1,12 5,7 9,10 15,3"
                stroke="oklch(0.67 0.18 243)"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "oklch(0.95 0.008 240)" }}
          >
            CoinAlert
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.6 0.012 240)" }}>
            {biometricLoading
              ? "Verifying biometric…"
              : "Enter your PIN to continue"}
          </p>
        </div>

        {/* Biometric button — shown prominently at top, must be tapped by user */}
        {hasBiometric && supportsWebAuthn && !credentialLost && (
          <button
            type="button"
            onClick={handleBiometric}
            disabled={biometricLoading}
            className="flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 w-full justify-center"
            style={{
              backgroundColor: "oklch(0.67 0.18 243 / 0.15)",
              color: biometricLoading
                ? "oklch(0.67 0.18 243)"
                : "oklch(0.88 0.012 240)",
              border: "1.5px solid oklch(0.67 0.18 243 / 0.4)",
              opacity: biometricLoading ? 0.7 : 1,
            }}
            data-ocid="lock.secondary_button"
          >
            {biometricLoading ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                role="img"
                aria-label="Loading"
              >
                <title>Loading</title>
                <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 12 12"
                    to="360 12 12"
                    dur="0.8s"
                    repeatCount="indefinite"
                  />
                </path>
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                role="img"
                aria-label="Fingerprint"
              >
                <title>Fingerprint</title>
                <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 3.4" />
                <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
                <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
                <path d="M2 12a10 10 0 0 1 18-6" />
                <path d="M2 17.5a14.5 14.5 0 0 0 4.56 5.5" />
                <path d="M20 10.13A10 10 0 0 1 22 12c0 1.27-.2 2.5-.57 3.65" />
                <path d="M4.3 19.54A14.44 14.44 0 0 1 2 12a10 10 0 0 1 .16-1.81" />
                <path d="M8 12a4 4 0 0 1 8 0c0 1.5-.16 3-.43 4.37" />
                <path d="M6.39 16.66C5.5 15.5 5 14 5 12a7 7 0 0 1 7-7" />
                <path d="M15 12a3 3 0 0 0-5.84-.98" />
              </svg>
            )}
            {biometricLoading ? "Verifying…" : "Use Face ID / Fingerprint"}
          </button>
        )}

        {/* PIN dots */}
        <motion.div
          animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex gap-3"
          data-ocid="lock.panel"
        >
          {PIN_POSITIONS.map((pos, i) => (
            <div
              key={pos}
              className="w-3 h-3 rounded-full transition-all duration-150"
              style={{
                backgroundColor:
                  i < pin.length
                    ? "oklch(0.67 0.18 243)"
                    : "oklch(0.25 0.015 243)",
                transform: i < pin.length ? "scale(1.2)" : "scale(1)",
              }}
            />
          ))}
        </motion.div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-center"
            style={{
              color: credentialLost
                ? "oklch(0.75 0.18 55)"
                : "oklch(0.65 0.22 25)",
            }}
            data-ocid="lock.error_state"
          >
            {error}
          </motion.p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {PAD_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handlePad(key)}
              disabled={key === "_empty"}
              className="h-14 rounded-xl text-lg font-semibold transition-all active:scale-95"
              style={{
                backgroundColor:
                  key === "_empty"
                    ? "transparent"
                    : key === "⌫"
                      ? "oklch(0.18 0.016 243)"
                      : "oklch(0.16 0.014 243)",
                color:
                  key === "⌫"
                    ? "oklch(0.72 0.015 240)"
                    : "oklch(0.95 0.008 240)",
                border:
                  key === "_empty" ? "none" : "1px solid oklch(0.24 0.016 243)",
                cursor: key === "_empty" ? "default" : "pointer",
              }}
              data-ocid={
                key !== "_empty" && key !== "⌫" ? "lock.button" : undefined
              }
            >
              {key === "_empty" ? "" : key}
            </button>
          ))}
        </div>

        {/* Confirm button for partial PIN */}
        {pin.length > 0 && pin.length < maxLen && (
          <button
            type="button"
            onClick={() => handleUnlock(pin)}
            className="w-full h-11 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{
              backgroundColor: "oklch(0.67 0.18 243)",
              color: "oklch(0.08 0.014 243)",
            }}
            data-ocid="lock.confirm_button"
          >
            Unlock
          </button>
        )}

        {/* Re-register prompt when credential is lost */}
        {credentialLost && (
          <div
            className="w-full px-3 py-2.5 rounded-xl text-xs text-center"
            style={{
              backgroundColor: "oklch(0.75 0.18 55 / 0.1)",
              border: "1px solid oklch(0.75 0.18 55 / 0.3)",
              color: "oklch(0.75 0.18 55)",
            }}
          >
            Open Lock Settings after unlocking to re-register your biometric.
          </div>
        )}
      </motion.div>
    </div>
  );
}
