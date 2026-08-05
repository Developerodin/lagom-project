"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

const LOGIN_TIMEOUT_MS = 20_000;

export function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        signal: AbortSignal.timeout(LOGIN_TIMEOUT_MS),
      });

      if (response.ok) {
        // Hard navigation remounts cleanly if middleware bounces an invalid session.
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
          Sign in to manage work and enquiries.
        </p>

        <form onSubmit={handleSubmit}>
          {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}

          <div className="admin-field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              autoFocus
              required
            />
          </div>

          <button type="submit" className="admin-btn" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: "0.85rem", textAlign: "center" }}>
          <Link
            href="/admin/forgot-password"
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
}
