import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useLockStore } from "../hooks/useLockStore";

interface LockSettingsProps {
  open: boolean;
  onClose: () => void;
}

export function LockSettings({ open, onClose }: LockSettingsProps) {
  const {
    isEnabled,
    hasBiometric,
    setupPin,
    setupBiometric,
    disableBiometric,
    disableLock,
  } = useLockStore();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  const supportsWebAuthn = !!window.PublicKeyCredential;

  const handleSetPin = async () => {
    setPinError("");
    if (pin.length < 4) {
      setPinError("PIN must be at least 4 characters.");
      return;
    }
    if (pin !== confirmPin) {
      setPinError("PINs do not match.");
      return;
    }
    await setupPin(pin);
    setPin("");
    setConfirmPin("");
    setPinSuccess(true);
    setTimeout(() => setPinSuccess(false), 2500);
    toast.success("App lock PIN set!");
  };

  const handleEnableBiometric = async () => {
    setBiometricLoading(true);
    const ok = await setupBiometric();
    setBiometricLoading(false);
    if (ok) {
      toast.success("Biometric unlock enabled!");
    } else {
      toast.error("Biometric setup failed. Make sure your device supports it.");
    }
  };

  const handleDisable = () => {
    disableLock();
    toast.success("App lock disabled.");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-sm"
        style={{
          backgroundColor: "oklch(0.12 0.014 243)",
          border: "1px solid oklch(0.22 0.016 243)",
          color: "oklch(0.92 0.008 240)",
        }}
        data-ocid="lock.dialog"
      >
        <DialogHeader>
          <DialogTitle
            className="text-lg font-bold"
            style={{ color: "oklch(0.95 0.008 240)" }}
          >
            App Lock Settings
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 pt-1">
          {/* Status badges */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span
                className="text-sm font-medium"
                style={{ color: "oklch(0.85 0.008 240)" }}
              >
                App Lock
              </span>
              <span
                className="text-xs"
                style={{ color: "oklch(0.55 0.01 240)" }}
              >
                {isEnabled ? "Enabled" : "Disabled"} ·{" "}
                {hasBiometric ? "Biometric on" : "Biometric off"}
              </span>
            </div>
            <Switch
              data-ocid="lock.switch"
              checked={isEnabled}
              onCheckedChange={(checked) => {
                if (!checked) handleDisable();
              }}
            />
          </div>

          {/* Divider */}
          <div
            className="h-px w-full"
            style={{ backgroundColor: "oklch(0.22 0.016 243)" }}
          />

          {/* Set PIN */}
          <div className="flex flex-col gap-3">
            <h3
              className="text-sm font-semibold"
              style={{ color: "oklch(0.67 0.18 243)" }}
            >
              {isEnabled ? "Change PIN" : "Set PIN"}
            </h3>
            <div className="flex flex-col gap-2">
              <div>
                <Label
                  htmlFor="lock-pin"
                  className="text-xs mb-1 block"
                  style={{ color: "oklch(0.65 0.01 240)" }}
                >
                  PIN / Password
                </Label>
                <Input
                  id="lock-pin"
                  data-ocid="lock.input"
                  type="password"
                  placeholder="Min 4 characters"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setPinError("");
                  }}
                  className="h-9 text-sm"
                  style={{
                    backgroundColor: "oklch(0.16 0.014 243)",
                    borderColor: "oklch(0.26 0.016 243)",
                    color: "oklch(0.92 0.008 240)",
                  }}
                />
              </div>
              <div>
                <Label
                  htmlFor="lock-pin-confirm"
                  className="text-xs mb-1 block"
                  style={{ color: "oklch(0.65 0.01 240)" }}
                >
                  Confirm PIN
                </Label>
                <Input
                  id="lock-pin-confirm"
                  data-ocid="lock.textarea"
                  type="password"
                  placeholder="Repeat PIN"
                  value={confirmPin}
                  onChange={(e) => {
                    setConfirmPin(e.target.value);
                    setPinError("");
                  }}
                  className="h-9 text-sm"
                  style={{
                    backgroundColor: "oklch(0.16 0.014 243)",
                    borderColor: "oklch(0.26 0.016 243)",
                    color: "oklch(0.92 0.008 240)",
                  }}
                />
              </div>
            </div>
            {pinError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs"
                style={{ color: "oklch(0.65 0.22 25)" }}
                data-ocid="lock.error_state"
              >
                {pinError}
              </motion.p>
            )}
            {pinSuccess && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs"
                style={{ color: "oklch(0.7 0.18 145)" }}
                data-ocid="lock.success_state"
              >
                PIN saved successfully!
              </motion.p>
            )}
            <Button
              data-ocid="lock.save_button"
              onClick={handleSetPin}
              className="h-9 text-sm font-semibold"
              style={{
                backgroundColor: "oklch(0.67 0.18 243)",
                color: "oklch(0.08 0.014 243)",
              }}
            >
              {isEnabled ? "Update PIN" : "Enable Lock"}
            </Button>
          </div>

          {/* Biometric */}
          {supportsWebAuthn && (
            <>
              <div
                className="h-px w-full"
                style={{ backgroundColor: "oklch(0.22 0.016 243)" }}
              />
              <div className="flex flex-col gap-3">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.67 0.18 243)" }}
                >
                  Biometric Unlock
                </h3>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.55 0.01 240)" }}
                >
                  Use your device fingerprint or Face ID to unlock the app
                  instead of a PIN.
                </p>
                <div className="flex gap-2">
                  <Button
                    data-ocid="lock.secondary_button"
                    variant="outline"
                    onClick={handleEnableBiometric}
                    disabled={biometricLoading}
                    className="flex-1 h-9 text-xs"
                    style={{
                      backgroundColor: "oklch(0.16 0.014 243)",
                      borderColor: "oklch(0.26 0.016 243)",
                      color: "oklch(0.85 0.008 240)",
                    }}
                  >
                    {biometricLoading
                      ? "Setting up…"
                      : hasBiometric
                        ? "Re-register Biometric"
                        : "Enable Biometric"}
                  </Button>
                  {hasBiometric && (
                    <Button
                      data-ocid="lock.delete_button"
                      variant="outline"
                      onClick={() => {
                        disableBiometric();
                        toast.success("Biometric removed.");
                      }}
                      className="h-9 text-xs"
                      style={{
                        backgroundColor: "oklch(0.16 0.014 243)",
                        borderColor: "oklch(0.26 0.016 243)",
                        color: "oklch(0.65 0.22 25)",
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                {hasBiometric && (
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                    style={{
                      backgroundColor: "oklch(0.7 0.18 145 / 0.1)",
                      border: "1px solid oklch(0.7 0.18 145 / 0.25)",
                      color: "oklch(0.7 0.18 145)",
                    }}
                    data-ocid="lock.success_state"
                  >
                    ✓ Biometric unlock active
                  </div>
                )}
              </div>
            </>
          )}

          {/* Disable */}
          {isEnabled && (
            <>
              <div
                className="h-px w-full"
                style={{ backgroundColor: "oklch(0.22 0.016 243)" }}
              />
              <Button
                data-ocid="lock.delete_button"
                variant="outline"
                onClick={handleDisable}
                className="h-9 text-sm"
                style={{
                  backgroundColor: "transparent",
                  borderColor: "oklch(0.65 0.22 25 / 0.4)",
                  color: "oklch(0.65 0.22 25)",
                }}
              >
                Disable App Lock
              </Button>
            </>
          )}

          {/* Close */}
          <Button
            data-ocid="lock.close_button"
            variant="ghost"
            onClick={onClose}
            className="h-9 text-sm"
            style={{ color: "oklch(0.55 0.01 240)" }}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
