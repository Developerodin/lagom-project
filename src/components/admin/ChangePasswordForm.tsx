"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

export function ChangePasswordForm() {
  const router = useRouter();
  const formId = useId();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);

    const response = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    });

    setBusy(false);

    if (response.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password updated.");
      router.refresh();
      return;
    }

    const data = await response.json().catch(() => ({}));
    setError(data.error || "Could not update password. Please try again.");
  }

  return (
    <form onSubmit={handleSubmit}>
      {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}
      {success ? (
        <div className="admin-alert admin-alert--success">{success}</div>
      ) : null}

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-field">
          <label htmlFor={`${formId}-current`}>Current password</label>
          <input
            id={`${formId}-current`}
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <div className="admin-row">
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
        </div>

        <p className="admin-field__hint" style={{ marginTop: 10 }}>
          Use at least 8 characters. You’ll stay signed in after updating.
        </p>
      </div>

      <div className="admin-actions">
        <button type="submit" className="admin-btn" disabled={busy}>
          {busy ? "Updating…" : "Update password"}
        </button>
      </div>
    </form>
  );
}

