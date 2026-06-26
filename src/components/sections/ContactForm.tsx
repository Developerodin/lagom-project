"use client";

import { useState, type FormEvent } from "react";
import { contactFormContent } from "@/content/contact";
import styles from "./ContactSection.module.css";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const { fields, submitLabel } = contactFormContent;
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("submitting");
    setError("");

    const payload = Object.fromEntries(new FormData(form).entries());

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      form.reset();
      setStatus("success");
      return;
    }

    const data = await response.json().catch(() => ({}));
    setError(data.error || "Something went wrong. Please try again.");
    setStatus("error");
  }

  if (status === "success") {
    return (
      <div className={styles.successMessage} role="status">
        <p className={styles.successTitle}>Thank you for reaching out.</p>
        <p className={styles.successText}>
          Your message has been received. We will get back to you shortly.
        </p>
        <button
          type="button"
          className="button button-primary"
          onClick={() => setStatus("idle")}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {status === "error" && error ? (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      ) : null}

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className={styles.honeypot}
      />

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor="contact-name" className={styles.fieldLabel}>
            {fields.name.label}
          </label>
          <input
            id="contact-name"
            name="name"
            type={fields.name.type}
            className={styles.fieldInput}
            autoComplete="name"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-email" className={styles.fieldLabel}>
            {fields.email.label}
          </label>
          <input
            id="contact-email"
            name="email"
            type={fields.email.type}
            className={styles.fieldInput}
            autoComplete="email"
            required
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-company" className={styles.fieldLabel}>
          {fields.company.label}
        </label>
        <input
          id="contact-company"
          name="company"
          type={fields.company.type}
          className={styles.fieldInput}
          autoComplete="organization"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-subject" className={styles.fieldLabel}>
          {fields.subject.label}
        </label>
        <input
          id="contact-subject"
          name="subject"
          type={fields.subject.type}
          className={styles.fieldInput}
          required
        />
      </div>

      <div className={`${styles.field} ${styles.fieldTextarea}`}>
        <label htmlFor="contact-message" className={styles.fieldLabel}>
          {fields.message.label}
        </label>
        <textarea
          id="contact-message"
          name="message"
          className={styles.fieldInput}
          rows={5}
          required
        />
      </div>

      <button
        type="submit"
        className={`button button-primary ${styles.submitButton}`}
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}
