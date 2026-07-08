"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";

export type TestimonialFormData = {
  id?: string;
  quote: string;
  author: string;
  company: string;
  logoUrl: string;
  logoAlt: string;
  bgImageUrl: string;
  bgImageAlt: string;
  sortOrder: number;
  published: boolean;
};

type TestimonialFormProps = {
  mode: "create" | "edit";
  initial?: TestimonialFormData;
};

async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Upload failed.");
  }

  const { url } = await response.json();
  return url as string;
}

export function TestimonialForm({ mode, initial }: TestimonialFormProps) {
  const router = useRouter();
  const formId = useId();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const [quote, setQuote] = useState(initial?.quote ?? "");
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [logoUrl, setLogoUrl] = useState(initial?.logoUrl ?? "");
  const [logoAlt, setLogoAlt] = useState(initial?.logoAlt ?? "");
  const [bgImageUrl, setBgImageUrl] = useState(initial?.bgImageUrl ?? "");
  const [bgImageAlt, setBgImageAlt] = useState(initial?.bgImageAlt ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [published, setPublished] = useState(initial?.published ?? true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);

  async function handleLogoChange(file: File | null) {
    if (!file) return;

    setUploadingLogo(true);
    setError("");

    try {
      const url = await uploadFile(file);
      setLogoUrl(url);
      if (!logoAlt) {
        setLogoAlt(company || author || "Client logo");
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed.",
      );
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleBgChange(file: File | null) {
    if (!file) return;

    setUploadingBg(true);
    setError("");

    try {
      const url = await uploadFile(file);
      setBgImageUrl(url);
      if (!bgImageAlt) {
        setBgImageAlt(
          company ? `${company} project background` : "Testimonial card background",
        );
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed.",
      );
    } finally {
      setUploadingBg(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);

    const payload = {
      quote,
      author,
      company: company.trim() || null,
      logoUrl,
      logoAlt: logoAlt || company || author || "Client logo",
      bgImageUrl,
      bgImageAlt:
        bgImageAlt ||
        (company ? `${company} project background` : "Testimonial card background"),
      sortOrder: Number(sortOrder) || 0,
      published,
    };

    const endpoint =
      mode === "create"
        ? "/api/admin/testimonials"
        : `/api/admin/testimonials/${initial?.id}`;

    const response = await fetch(endpoint, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      router.push("/admin/testimonials");
      router.refresh();
      return;
    }

    const data = await response.json().catch(() => ({}));
    setError(data.error || "Could not save. Please try again.");
    setBusy(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-field">
          <label htmlFor={`${formId}-quote`}>Quote</label>
          <textarea
            id={`${formId}-quote`}
            value={quote}
            onChange={(event) => setQuote(event.target.value)}
            required
            rows={5}
            placeholder="What the client said about working with Lagom"
          />
        </div>

        <div className="admin-row">
          <div className="admin-field">
            <label htmlFor={`${formId}-author`}>Author name</label>
            <input
              id={`${formId}-author`}
              type="text"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="e.g. Jane Smith"
            />
          </div>

          <div className="admin-field">
            <label htmlFor={`${formId}-company`}>Company</label>
            <input
              id={`${formId}-company`}
              type="text"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="e.g. Cafe Juliet"
            />
          </div>
        </div>

        <div className="admin-field">
          <label>Client logo</label>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              void handleLogoChange(file);
              event.target.value = "";
            }}
          />
          <div className="admin-actions" style={{ marginBottom: 12 }}>
            <button
              type="button"
              className="admin-btn admin-btn--secondary"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo || uploadingBg}
            >
              {uploadingLogo ? "Uploading…" : logoUrl ? "Replace logo" : "Upload logo"}
            </button>
          </div>
          {logoUrl ? (
            <div
              style={{
                position: "relative",
                width: 160,
                height: 80,
                borderRadius: 8,
                overflow: "hidden",
                background: "#fff",
                border: "1px solid rgba(63, 73, 61, 0.18)",
              }}
            >
              <Image
                src={logoUrl}
                alt={logoAlt || "Client logo preview"}
                fill
                style={{ objectFit: "contain", padding: 8 }}
              />
            </div>
          ) : (
            <span className="admin-field__hint">Required — shown at the bottom of the card.</span>
          )}
        </div>

        <div className="admin-field">
          <label htmlFor={`${formId}-logo-alt`}>Logo alt text</label>
          <input
            id={`${formId}-logo-alt`}
            type="text"
            value={logoAlt}
            onChange={(event) => setLogoAlt(event.target.value)}
            placeholder="Accessible description of the logo"
          />
        </div>

        <div className="admin-field">
          <label>Card background image</label>
          <input
            ref={bgInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              void handleBgChange(file);
              event.target.value = "";
            }}
          />
          <div className="admin-actions" style={{ marginBottom: 12 }}>
            <button
              type="button"
              className="admin-btn admin-btn--secondary"
              onClick={() => bgInputRef.current?.click()}
              disabled={uploadingLogo || uploadingBg}
            >
              {uploadingBg
                ? "Uploading…"
                : bgImageUrl
                  ? "Replace background"
                  : "Upload background"}
            </button>
          </div>
          {bgImageUrl ? (
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 320,
                height: 180,
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid rgba(63, 73, 61, 0.18)",
              }}
            >
              <Image
                src={bgImageUrl}
                alt={bgImageAlt || "Background preview"}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          ) : (
            <span className="admin-field__hint">
              Required — fills the testimonial card behind the quote.
            </span>
          )}
        </div>

        <div className="admin-field">
          <label htmlFor={`${formId}-bg-alt`}>Background alt text</label>
          <input
            id={`${formId}-bg-alt`}
            type="text"
            value={bgImageAlt}
            onChange={(event) => setBgImageAlt(event.target.value)}
            placeholder="Describe the background image for accessibility"
          />
        </div>

        <div className="admin-row">
          <div className="admin-field">
            <label htmlFor={`${formId}-order`}>Sort order</label>
            <input
              id={`${formId}-order`}
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            />
            <span className="admin-field__hint">Lower numbers appear first.</span>
          </div>

          <div className="admin-field">
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={published}
                onChange={(event) => setPublished(event.target.checked)}
              />
              Published on homepage
            </label>
          </div>
        </div>
      </div>

      <div className="admin-actions">
        <button
          type="submit"
          className="admin-btn"
          disabled={busy || uploadingLogo || uploadingBg || !logoUrl || !bgImageUrl}
        >
          {busy ? "Saving…" : mode === "create" ? "Create testimonial" : "Save changes"}
        </button>
        <Link href="/admin/testimonials" className="admin-btn admin-btn--secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
