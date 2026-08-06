"use client";

import { useEffect, useState, type FormEvent } from "react";

const REQUEST_TIMEOUT_MS = 20_000;
const VERIFY_TIMEOUT_MS = 20_000;
const RESEND_COOLDOWN_SECONDS = 60;

type Step = "request" | "verify";

export function AdminLoginForm() {
  const [step, setStep] = useState<Step>("request");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  async function requestCode() {
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const response = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Could not send login code. Please try again.");
        return;
      }

      setStep("verify");
      setOtp("");
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
      setInfo(
        data.message ||
          "If login is available, a code has been sent to the studio email.",
      );
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await requestCode();
  }

  async function handleVerifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
        signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
      });

      if (response.ok) {
        window.location.assign("/admin/clients");
        return;
      }

      const data = await response.json().catch(() => ({}));
      setError(data.error || "Login failed. Please try again.");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <h1 className="admin-login__title">Lagom Admin</h1>
        <p className="admin-login__subtitle">
          {step === "request"
            ? "Sign in with a one-time code sent to the studio email."
            : "Enter the 6-digit code from your email."}
        </p>

        {step === "request" ? (
          <form onSubmit={handleRequestSubmit}>
            {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}

            <button
              type="submit"
              className="admin-btn"
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading ? "Sending code…" : "Email me a login code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifySubmit}>
            {info ? <div className="admin-alert">{info}</div> : null}
            {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}

            <div className="admin-field">
              <label htmlFor="admin-otp">Login code</label>
              <input
                id="admin-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className="admin-btn"
              disabled={loading || otp.length !== 6}
              style={{ width: "100%" }}
            >
              {loading ? "Verifying…" : "Sign in"}
            </button>

            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                disabled={loading || resendSeconds > 0}
                onClick={() => void requestCode()}
                style={{ width: "100%" }}
              >
                {resendSeconds > 0
                  ? `Resend code in ${resendSeconds}s`
                  : "Resend code"}
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                disabled={loading}
                onClick={() => {
                  setStep("request");
                  setOtp("");
                  setError("");
                  setInfo("");
                }}
                style={{ width: "100%" }}
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
