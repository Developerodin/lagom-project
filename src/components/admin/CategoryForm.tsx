"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

export type CategoryFormData = {
  id?: string;
  name: string;
  slug: string;
  sortOrder: number;
};

type CategoryFormProps = {
  mode: "create" | "edit";
  initial?: CategoryFormData;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryForm({ mode, initial }: CategoryFormProps) {
  const router = useRouter();
  const formId = useId();

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);

    const payload = {
      name,
      slug: slugify(slug || name),
      sortOrder: Number(sortOrder) || 0,
    };

    const endpoint =
      mode === "create"
        ? "/api/admin/categories"
        : `/api/admin/categories/${initial?.id}`;

    const response = await fetch(endpoint, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      router.push("/admin/categories");
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
        <div className="admin-row">
          <div className="admin-field">
            <label htmlFor={`${formId}-name`}>Category name</label>
            <input
              id={`${formId}-name`}
              type="text"
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              required
              placeholder="e.g. Fashion"
            />
          </div>

          <div className="admin-field">
            <label htmlFor={`${formId}-slug`}>URL slug</label>
            <input
              id={`${formId}-slug`}
              type="text"
              value={slug}
              onChange={(event) => {
                setSlugEdited(true);
                setSlug(event.target.value);
              }}
              required
            />
            <span className="admin-field__hint">Filter key: {slug || "…"}</span>
          </div>
        </div>

        <div className="admin-field">
          <label htmlFor={`${formId}-order`}>Sort order</label>
          <input
            id={`${formId}-order`}
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          />
          <span className="admin-field__hint">
            Lower numbers appear first in the work page filters.
          </span>
        </div>
      </div>

      <div className="admin-actions">
        <button type="submit" className="admin-btn" disabled={busy}>
          {busy ? "Saving…" : mode === "create" ? "Create category" : "Save changes"}
        </button>
        <Link href="/admin/categories" className="admin-btn admin-btn--secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
