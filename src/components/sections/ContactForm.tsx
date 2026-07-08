"use client";

import { useState, type FormEvent } from "react";
import { contactFormContent, contactServiceOptions } from "@/content/contact";
import styles from "./ContactSection.module.css";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const { fields, submitLabel } = contactFormContent;
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  function toggleService(serviceId: string) {
    setSelectedServices((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("submitting");
    setError("");

    if (selectedServices.length === 0) {
      setError("Please select at least one service.");
      setStatus("error");
      return;
    }

    const formData = new FormData(form);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      company: formData.get("company"),
      message: formData.get("message"),
      services: selectedServices,
    };

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      form.reset();
      setSelectedServices([]);
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

      <fieldset className={`${styles.field} ${styles.servicesField}`}>
        <legend className={styles.fieldLabel}>{fields.services.label}</legend>
        <p className={styles.servicesHint}>{fields.services.hint}</p>
        <div className={styles.servicesGrid}>
          {contactServiceOptions.map((service) => {
            const checked = selectedServices.includes(service.id);
            return (
              <label
                key={service.id}
                className={`${styles.serviceOption} ${
                  checked ? styles.serviceOptionChecked : ""
                }`}
              >
                <input
                  type="checkbox"
                  name="services"
                  value={service.id}
                  checked={checked}
                  onChange={() => toggleService(service.id)}
                  className={styles.serviceCheckbox}
                />
                <span className={styles.serviceCheckmark} aria-hidden="true">
                  <svg viewBox="0 0 12 10" fill="none">
                    <path
                      d="M1 5.5L4.5 9L11 1.5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className={styles.serviceLabel}>{service.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

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
