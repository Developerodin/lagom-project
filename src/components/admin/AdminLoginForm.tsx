"use client";

import { useEffect, useState, type FormEvent } from "react";

const REQUEST_TIMEOUT_MS = 20_000;
const VERIFY_TIMEOUT_MS = 20_000;
const PASSWORD_TIMEOUT_MS = 20_000;
const RESEND_COOLDOWN_SECONDS = 60;

type Step = "chooser" | "password" | "forgot-verify" | "set-password";

export function AdminLoginForm() {
  const [step, setStep] = useState<Step>("chooser");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  function goToChooser() {
    setStep("chooser");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setInfo("");
  }

  function goToPasswordLogin(message = "") {
    setStep("password");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setInfo(message);
  }

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
        setError(data.error || "Could not send reset code. Please try again.");
        return false;
      }

      setStep("forgot-verify");
      setOtp("");
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
      setInfo(
        data.message ||
          "If a reset is available, a code has been sent to the studio email.",
      );
      return true;
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
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
        setStep("set-password");
        setPassword("");
        setConfirmPassword("");
        setError("");
        setInfo("Code confirmed. Create a new admin password.");
        return;
      }

      const data = await response.json().catch(() => ({}));
      setError(data.error || "Could not verify the code. Please try again.");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSetPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/password/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
        signal: AbortSignal.timeout(PASSWORD_TIMEOUT_MS),
      });

      if (response.ok) {
        goToPasswordLogin("Password saved. Sign in with your new password.");
        return;
      }

      const data = await response.json().catch(() => ({}));
      setError(data.error || "Could not save password. Please try again.");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/password/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        signal: AbortSignal.timeout(PASSWORD_TIMEOUT_MS),
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

  const subtitle =
    step === "chooser"
      ? "Sign in with your admin password, or reset it with an email code."
      : step === "password"
        ? "Enter the admin password to continue."
        : step === "forgot-verify"
          ? "Enter the 6-digit code from your email."
          : "Choose a new admin password.";

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <h1 className="admin-login__title">Lagom Admin</h1>
        <p className="admin-login__subtitle">{subtitle}</p>

        {step === "chooser" ? (
          <div className="admin-login__actions">
            {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}

            <button
              type="button"
              className="admin-btn"
              disabled={loading}
              onClick={() => goToPasswordLogin()}
              style={{ width: "100%" }}
            >
              Enter password
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--secondary"
              disabled={loading}
              onClick={() => void handleForgotPassword()}
              style={{ width: "100%" }}
            >
              {loading ? "Sending code…" : "Forgot password"}
            </button>
          </div>
        ) : null}

        {step === "password" ? (
          <form onSubmit={handlePasswordLoginSubmit}>
            {info ? <div className="admin-alert">{info}</div> : null}
            {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}

            <div className="admin-field">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className="admin-btn"
              disabled={loading || password.length === 0}
              style={{ width: "100%" }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <div className="admin-login__actions" style={{ marginTop: 16 }}>
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                disabled={loading}
                onClick={goToChooser}
                style={{ width: "100%" }}
              >
                Back
              </button>
            </div>
          </form>
        ) : null}

        {step === "forgot-verify" ? (
          <form onSubmit={handleVerifySubmit}>
            {info ? <div className="admin-alert">{info}</div> : null}
            {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}

            <div className="admin-field">
              <label htmlFor="admin-otp">Reset code</label>
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
              {loading ? "Verifying…" : "Continue"}
            </button>

            <div className="admin-login__actions" style={{ marginTop: 16 }}>
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
                onClick={goToChooser}
                style={{ width: "100%" }}
              >
                Back
              </button>
            </div>
          </form>
        ) : null}

        {step === "set-password" ? (
          <form onSubmit={handleSetPasswordSubmit}>
            {info ? <div className="admin-alert">{info}</div> : null}
            {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}

            <div className="admin-field">
              <label htmlFor="admin-new-password">New password</label>
              <input
                id="admin-new-password"
                type="password"
                autoComplete="new-password"
                minLength={10}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="admin-field">
              <label htmlFor="admin-confirm-password">Confirm password</label>
              <input
                id="admin-confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={10}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="admin-btn"
              disabled={loading || password.length < 10 || confirmPassword.length < 10}
              style={{ width: "100%" }}
            >
              {loading ? "Saving…" : "Save password"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
