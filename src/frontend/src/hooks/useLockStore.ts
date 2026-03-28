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

  // Load from cloud on mount
  useEffect(() => {
    cloudLoad<{ enabled: boolean; pinHash: string | null } | null>(
      CLOUD_KEY,
      null,
    )
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
      })
      .catch(() => {});
  }, []);

  const setupPin = useCallback(async (pin: string) => {
    const hash = await sha256Hex(pin);
    localStorage.setItem(KEYS.pinHash, hash);
    localStorage.setItem(KEYS.enabled, "true");
    setIsEnabled(true);
    cloudSave(CLOUD_KEY, { enabled: true, pinHash: hash });
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
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "CoinAlert", id: window.location.hostname },
          user: {
            id: new TextEncoder().encode("coinalert-user")
              .buffer as ArrayBuffer,
            name: "coinalert-user",
            displayName: "CoinAlert User",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      });
      if (!cred) return false;
      const pk = cred as PublicKeyCredential;
      const credId = b64url(pk.rawId);
      localStorage.setItem(KEYS.biometricCredId, credId);
      setHasBiometric(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const verifyBiometric = useCallback(async (): Promise<boolean> => {
    const credIdStr = localStorage.getItem(KEYS.biometricCredId);
    if (!credIdStr || !window.PublicKeyCredential) return false;
    try {
      const challengeBytes = window.crypto.getRandomValues(new Uint8Array(32));
      const challenge = challengeBytes.buffer as ArrayBuffer;
      const credId = fromB64url(credIdStr);
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{ id: credId, type: "public-key" }],
          userVerification: "required",
          timeout: 60000,
        },
      });
      return !!assertion;
    } catch {
      return false;
    }
  }, []);

  const disableBiometric = useCallback(() => {
    localStorage.removeItem(KEYS.biometricCredId);
    setHasBiometric(false);
  }, []);

  const disableLock = useCallback(() => {
    localStorage.removeItem(KEYS.enabled);
    localStorage.removeItem(KEYS.pinHash);
    localStorage.removeItem(KEYS.biometricCredId);
    setIsEnabled(false);
    setHasBiometric(false);
    setIsLocked(false);
    cloudSave(CLOUD_KEY, { enabled: false, pinHash: null });
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
