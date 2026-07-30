"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

export function ForgotPasswordForm() {
  const router = useRouter();
  const formId = useId();

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSendOtp() {
    setError("");
    setInfo("");
    setSending(true);

    const response = await fetch("/api/auth/forgot-password/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    setSending(false);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "Could not send recovery code. Please try again.");
      return;
    }

    setOtpSent(true);
    setInfo(data.message || "Recovery code sent to the studio email.");
  }

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setInfo("");
    setResetting(true);

    const response = await fetch("/api/auth/forgot-password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        otp,
        newPassword,
        confirmPassword,
      }),
    });

    if (response.ok) {
      router.replace("/admin/clients");
      router.refresh();
      return;
    }

    setResetting(false);
    const data = await response.json().catch(() => ({}));
    setError(data.error || "Could not reset password. Please try again.");
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <h1 className="admin-login__title">Reset password</h1>
        <p className="admin-login__subtitle">
          We’ll send a one-time code to the studio recovery email. No other
          address can be used.
        </p>

        {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}
        {info ? <div className="admin-alert admin-alert--success">{info}</div> : null}

        <div style={{ marginBottom: 20 }}>
          <button
            type="button"
            className="admin-btn"
            disabled={sending || resetting}
            onClick={handleSendOtp}
            style={{ width: "100%" }}
          >
            {sending ? "Sending…" : otpSent ? "Resend OTP" : "Send OTP"}
          </button>
        </div>

        {otpSent ? (
          <form onSubmit={handleReset}>
            <div className="admin-field">
              <label htmlFor={`${formId}-otp`}>Recovery code</label>
              <input
                id={`${formId}-otp`}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                required
                maxLength={6}
                autoFocus
              />
            </div>

            <div className="admin-field">
              <label htmlFor={`${formId}-new`}>New password</label>
              <input
                id={`${formId}-new`}
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div className="admin-field">
              <label htmlFor={`${formId}-confirm`}>Confirm new password</label>
              <input
                id={`${formId}-confirm`}
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="admin-btn"
              disabled={sending || resetting}
              style={{ width: "100%", marginTop: 8 }}
            >
              {resetting ? "Resetting…" : "Reset password"}
            </button>
          </form>
        ) : null}

        <p style={{ marginTop: 20, fontSize: "0.85rem", textAlign: "center" }}>
          <Link href="/admin" style={{ color: "inherit", textDecoration: "underline" }}>
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
