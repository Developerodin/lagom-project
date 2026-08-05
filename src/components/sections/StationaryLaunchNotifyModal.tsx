"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./StationaryLaunchNotifyModal.module.css";

type Status = "idle" | "submitting" | "success" | "error";

type StationaryLaunchNotifyModalProps = {
  open: boolean;
  onClose: () => void;
};

export function StationaryLaunchNotifyModal({
  open,
  onClose,
}: StationaryLaunchNotifyModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setError("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("submitting");
    setError("");

    const formData = new FormData(form);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      website: formData.get("website"),
    };

    const response = await fetch("/api/stationary/launch-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setStatus("success");
      form.reset();
      return;
    }

    const data = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    setError(data?.error ?? "Something went wrong. Please try again.");
    setStatus("error");
  }

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="stationary-launch-notify-title"
        data-cursor-contrast="light"
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close"
        >
          <svg
            className={styles.closeIcon}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 6L18 18M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <h2 id="stationary-launch-notify-title" className={styles.title}>
          Get notified at launch
        </h2>
        <p className={styles.description}>
          Leave your details and we&apos;ll let you know when The Lagom Paper
          Collection is ready to order.
        </p>

        {status === "success" ? (
          <p className={styles.success}>
            Thank you — you&apos;re on the list. We&apos;ll be in touch soon.
          </p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.honeypot} aria-hidden="true">
              <label htmlFor="launch-signup-website">Website</label>
              <input
                id="launch-signup-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="launch-signup-name" className={styles.label}>
                Name
              </label>
              <input
                id="launch-signup-name"
                name="name"
                type="text"
                className={styles.input}
                autoComplete="name"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="launch-signup-email" className={styles.label}>
                Email
              </label>
              <input
                id="launch-signup-email"
                name="email"
                type="email"
                className={styles.input}
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="launch-signup-phone" className={styles.label}>
                Phone
              </label>
              <input
                id="launch-signup-phone"
                name="phone"
                type="tel"
                className={styles.input}
                autoComplete="tel"
                required
              />
            </div>

            {error ? <p className={styles.error}>{error}</p> : null}

            <button
              type="submit"
              className={`button ${styles.submit}`}
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Saving…" : "Notify me"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
