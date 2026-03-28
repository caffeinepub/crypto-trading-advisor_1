import { useCallback, useEffect, useState } from "react";
import { cloudLoad, cloudSave } from "./useCloudStorage";

const KEYS = {
  enabled: "appLock_enabled",
  pinHash: "appLock_pinHash",
  biometricCredId: "appLock_biometricCredentialId",
};

const CLOUD_KEY = "lock_settings";

async function sha256Hex(text: string): Promise<string> {
  const buf = await window.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function b64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function fromB64url(str: string): ArrayBuffer {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return bytes.buffer as ArrayBuffer;
}

interface CloudLockData {
  enabled: boolean;
  pinHash: string | null;
  biometricCredId?: string | null;
}

export function useLockStore() {
  const [isLocked, setIsLocked] = useState(() => {
    return localStorage.getItem(KEYS.enabled) === "true";
  });
  const [isEnabled, setIsEnabled] = useState(() => {
    return localStorage.getItem(KEYS.enabled) === "true";
  });
  const [hasBiometric, setHasBiometric] = useState(() => {
    return !!localStorage.getItem(KEYS.biometricCredId);
  });

  // Lock on load if enabled
  useEffect(() => {
    if (localStorage.getItem(KEYS.enabled) === "true") {
      setIsLocked(true);
    }
  }, []);

  // Load from cloud on mount — restore PIN and biometric credential ID
  useEffect(() => {
    cloudLoad<CloudLockData | null>(CLOUD_KEY, null)
      .then((data) => {
        if (!data) return;
        if (data.enabled && data.pinHash) {
          localStorage.setItem(KEYS.enabled, "true");
          localStorage.setItem(KEYS.pinHash, data.pinHash);
          setIsEnabled(true);
          setIsLocked(true);
        } else if (!data.enabled) {
          if (localStorage.getItem(KEYS.enabled) !== "true") {
            setIsEnabled(false);
          }
        }
        // Restore biometric credential ID from cloud
        if (data.biometricCredId) {
          localStorage.setItem(KEYS.biometricCredId, data.biometricCredId);
          setHasBiometric(true);
        }
      })
      .catch(() => {});
  }, []);

  const setupPin = useCallback(async (pin: string) => {
    const hash = await sha256Hex(pin);
    localStorage.setItem(KEYS.pinHash, hash);
    localStorage.setItem(KEYS.enabled, "true");
    setIsEnabled(true);
    const biometricCredId = localStorage.getItem(KEYS.biometricCredId);
    cloudSave(CLOUD_KEY, { enabled: true, pinHash: hash, biometricCredId });
  }, []);

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    const stored = localStorage.getItem(KEYS.pinHash);
    if (!stored) return false;
    const hash = await sha256Hex(pin);
    return hash === stored;
  }, []);

  const lockApp = useCallback(() => {
    if (localStorage.getItem(KEYS.enabled) === "true") {
      setIsLocked(true);
    }
  }, []);

  const unlockApp = useCallback(() => {
    setIsLocked(false);
  }, []);

  const setupBiometric = useCallback(async (): Promise<boolean> => {
    if (!window.PublicKeyCredential) return false;
    try {
      const challengeBytes = window.crypto.getRandomValues(new Uint8Array(32));
      const challenge = challengeBytes.buffer as ArrayBuffer;
      const userId = new Uint8Array(16);
      userId.set([
        99, 111, 105, 110, 97, 108, 101, 114, 116, 45, 117, 115, 114,
      ]);

      const cred = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "CoinAlert", id: window.location.hostname },
          user: {
            id: userId.buffer as ArrayBuffer,
            name: "coinalert-user",
            displayName: "CoinAlert User",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" }, // ES256
            { alg: -257, type: "public-key" }, // RS256 fallback
          ],
          authenticatorSelection: {
            // platform = use device biometric (Face ID, Touch ID, fingerprint)
            // NOT a hardware security key
            authenticatorAttachment: "platform",
            userVerification: "preferred",
            residentKey: "preferred",
          },
          timeout: 60000,
        },
      });
      if (!cred) return false;
      const pk = cred as PublicKeyCredential;
      const credId = b64url(pk.rawId);
      localStorage.setItem(KEYS.biometricCredId, credId);
      setHasBiometric(true);
      const pinHash = localStorage.getItem(KEYS.pinHash);
      const enabled = localStorage.getItem(KEYS.enabled) === "true";
      cloudSave(CLOUD_KEY, {
        enabled,
        pinHash: pinHash ?? null,
        biometricCredId: credId,
      });
      return true;
    } catch (err) {
      console.error("Biometric setup error:", err);
      return false;
    }
  }, []);

  /**
   * Returns:
   *   { ok: true }  — verified successfully
   *   { ok: false, credentialLost: true }  — credential not found on device, needs re-register
   *   { ok: false, credentialLost: false } — user cancelled or other temporary error
   */
  const verifyBiometric = useCallback(async (): Promise<{
    ok: boolean;
    credentialLost?: boolean;
  }> => {
    const credIdStr = localStorage.getItem(KEYS.biometricCredId);
    if (!credIdStr || !window.PublicKeyCredential) return { ok: false };
    try {
      const challengeBytes = window.crypto.getRandomValues(new Uint8Array(32));
      const challenge = challengeBytes.buffer as ArrayBuffer;
      const credId = fromB64url(credIdStr);
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{ id: credId, type: "public-key" }],
          userVerification: "preferred",
          timeout: 60000,
        },
      });
      if (assertion) return { ok: true };
      return { ok: false };
    } catch (err: unknown) {
      console.error("Biometric verify error:", err);
      const errName = err instanceof Error ? err.name : "";
      const errMsg = err instanceof Error ? err.message.toLowerCase() : "";

      // NotAllowedError = user cancelled or permission denied — do NOT clear credential
      if (errName === "NotAllowedError" || errName === "AbortError") {
        return { ok: false, credentialLost: false };
      }

      // NotFoundError = credential does not exist on this device — clear and ask to re-register
      const isNotFound =
        errName === "NotFoundError" ||
        errName === "InvalidStateError" ||
        errMsg.includes("not found") ||
        errMsg.includes("no credentials") ||
        errMsg.includes("no matching");

      if (isNotFound) {
        localStorage.removeItem(KEYS.biometricCredId);
        setHasBiometric(false);
        return { ok: false, credentialLost: true };
      }

      return { ok: false };
    }
  }, []);

  const disableBiometric = useCallback(() => {
    localStorage.removeItem(KEYS.biometricCredId);
    setHasBiometric(false);
    const pinHash = localStorage.getItem(KEYS.pinHash);
    const enabled = localStorage.getItem(KEYS.enabled) === "true";
    cloudSave(CLOUD_KEY, {
      enabled,
      pinHash: pinHash ?? null,
      biometricCredId: null,
    });
  }, []);

  const disableLock = useCallback(() => {
    localStorage.removeItem(KEYS.enabled);
    localStorage.removeItem(KEYS.pinHash);
    localStorage.removeItem(KEYS.biometricCredId);
    setIsEnabled(false);
    setHasBiometric(false);
    setIsLocked(false);
    cloudSave(CLOUD_KEY, {
      enabled: false,
      pinHash: null,
      biometricCredId: null,
    });
  }, []);

  return {
    isLocked,
    isEnabled,
    hasBiometric,
    setupPin,
    verifyPin,
    lockApp,
    unlockApp,
    setupBiometric,
    verifyBiometric,
    disableBiometric,
    disableLock,
  };
}
