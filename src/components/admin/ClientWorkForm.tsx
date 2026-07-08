"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";

type GalleryItem = {
  key: string;
  imageUrl: string;
  alt: string;
  width: number | null;
  height: number | null;
};

export type ClientWorkFormData = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  services: string;
  cardImage: string;
  cardAlt: string;
  heroImage: string;
  heroAlt: string;
  sortOrder: number;
  published: boolean;
  categoryId: string | null;
  gallery: Array<{
    imageUrl: string;
    alt: string;
    width: number | null;
    height: number | null;
  }>;
};

type CategoryOption = {
  id: string;
  name: string;
};

type ClientWorkFormProps = {
  mode: "create" | "edit";
  initial?: ClientWorkFormData;
  categories: CategoryOption[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readDimensions(
  file: File,
): Promise<{ width: number | null; height: number | null }> {
  return new Promise((resolve) => {
    const image = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    image.onerror = () => {
      resolve({ width: null, height: null });
      URL.revokeObjectURL(objectUrl);
    };
    image.src = objectUrl;
  });
}

async function uploadFile(file: File) {
  const dimensions = await readDimensions(file);
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
  return { url: url as string, ...dimensions };
}

export function ClientWorkForm({ mode, initial, categories }: ClientWorkFormProps) {
  const router = useRouter();
  const formId = useId();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [services, setServices] = useState(initial?.services ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [published, setPublished] = useState(initial?.published ?? true);
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");

  const [cardImage, setCardImage] = useState(initial?.cardImage ?? "");
  const [cardAlt, setCardAlt] = useState(initial?.cardAlt ?? "");
  const [heroImage, setHeroImage] = useState(initial?.heroImage ?? "");
  const [heroAlt, setHeroAlt] = useState(initial?.heroAlt ?? "");

  const [gallery, setGallery] = useState<GalleryItem[]>(
    (initial?.gallery ?? []).map((item, index) => ({
      key: `existing-${index}`,
      imageUrl: item.imageUrl,
      alt: item.alt,
      width: item.width,
      height: item.height,
    })),
  );

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEdited) {
      setSlug(slugify(value));
    }
  }

  async function handleSingleUpload(
    file: File | undefined,
    apply: (url: string) => void,
  ) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const { url } = await uploadFile(file);
      apply(url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleGalleryUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError("");
    try {
      const uploaded: GalleryItem[] = [];
      for (const file of Array.from(files)) {
        const { url, width, height } = await uploadFile(file);
        uploaded.push({
          key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          imageUrl: url,
          alt: "",
          width,
          height,
        });
      }
      setGallery((current) => [...current, ...uploaded]);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed.",
      );
    } finally {
      setBusy(false);
      if (galleryInputRef.current) {
        galleryInputRef.current.value = "";
      }
    }
  }

  function updateGalleryItem(key: string, patch: Partial<GalleryItem>) {
    setGallery((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  }

  function removeGalleryItem(key: string) {
    setGallery((current) => current.filter((item) => item.key !== key));
  }

  function moveGalleryItem(index: number, direction: -1 | 1) {
    setGallery((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!cardImage) {
      setError("Please upload a card image.");
      return;
    }
    if (!heroImage) {
      setError("Please upload a hero image.");
      return;
    }

    setBusy(true);

    const payload = {
      title,
      slug: slugify(slug || title),
      description,
      services,
      whatWeDid: services,
      sortOrder: Number(sortOrder) || 0,
      published,
      categoryId: categoryId || null,
      cardImage,
      cardAlt,
      heroImage,
      heroAlt,
      gallery: gallery.map((item, index) => ({
        imageUrl: item.imageUrl,
        alt: item.alt,
        width: item.width,
        height: item.height,
        sortOrder: index,
      })),
    };

    const endpoint =
      mode === "create"
        ? "/api/admin/clients"
        : `/api/admin/clients/${initial?.id}`;

    const response = await fetch(endpoint, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      router.push("/admin/clients");
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
            <label htmlFor={`${formId}-title`}>Client / project name</label>
            <input
              id={`${formId}-title`}
              type="text"
              value={title}
              onChange={(event) => handleTitleChange(event.target.value)}
              required
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
            <span className="admin-field__hint">/work/{slug || "…"}</span>
          </div>
        </div>

        <div className="admin-field">
          <label htmlFor={`${formId}-description`}>Description</label>
          <textarea
            id={`${formId}-description`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
        </div>

        <div className="admin-field">
          <label htmlFor={`${formId}-services`}>What we did</label>
          <textarea
            id={`${formId}-services`}
            value={services}
            onChange={(event) => setServices(event.target.value)}
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
            <span className="admin-field__hint">
              Lower numbers appear first on the work page.
            </span>
          </div>

          <div className="admin-field">
            <label htmlFor={`${formId}-category`}>Category</label>
            <select
              id={`${formId}-category`}
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categories.length === 0 ? (
              <span className="admin-field__hint">
                <Link href="/admin/categories/new">Create a category</Link> to group this work.
              </span>
            ) : null}
          </div>
        </div>

        <div className="admin-field" style={{ justifyContent: "flex-end" }}>
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
            />
            Published (visible on the site)
          </label>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: 16 }}>Card image</h2>
        <p className="admin-field__hint" style={{ marginBottom: 12 }}>
          Square thumbnail shown in the work grid and on the home page.
        </p>
        <div className="admin-uploader">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) =>
              handleSingleUpload(event.target.files?.[0], setCardImage)
            }
          />
          {cardImage ? (
            <div className="admin-uploader__preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cardImage} alt="Card preview" />
            </div>
          ) : null}
        </div>
        <div className="admin-field" style={{ marginTop: 14 }}>
          <label htmlFor={`${formId}-cardalt`}>Card image alt text</label>
          <input
            id={`${formId}-cardalt`}
            type="text"
            value={cardAlt}
            onChange={(event) => setCardAlt(event.target.value)}
          />
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: 16 }}>Hero image</h2>
        <p className="admin-field__hint" style={{ marginBottom: 12 }}>
          Full-width banner at the top of the project page.
        </p>
        <div className="admin-uploader">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) =>
              handleSingleUpload(event.target.files?.[0], setHeroImage)
            }
          />
          {heroImage ? (
            <div className="admin-uploader__preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroImage} alt="Hero preview" />
            </div>
          ) : null}
        </div>
        <div className="admin-field" style={{ marginTop: 14 }}>
          <label htmlFor={`${formId}-heroalt`}>Hero image alt text</label>
          <input
            id={`${formId}-heroalt`}
            type="text"
            value={heroAlt}
            onChange={(event) => setHeroAlt(event.target.value)}
          />
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: 16 }}>Gallery images</h2>
        <p className="admin-field__hint" style={{ marginBottom: 12 }}>
          Full-width images shown down the project page, in order.
        </p>
        <div className="admin-uploader">
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(event) => handleGalleryUpload(event.target.files)}
          />
        </div>

        {gallery.length > 0 ? (
          <div className="admin-gallery-grid">
            {gallery.map((item, index) => (
              <div className="admin-gallery-item" key={item.key}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.alt || "Gallery image"} />
                <div className="admin-gallery-item__body">
                  <input
                    type="text"
                    placeholder="Alt text"
                    value={item.alt}
                    onChange={(event) =>
                      updateGalleryItem(item.key, { alt: event.target.value })
                    }
                  />
                  <div className="admin-gallery-item__controls">
                    <button
                      type="button"
                      className="admin-btn admin-btn--secondary admin-btn--sm"
                      onClick={() => moveGalleryItem(index, -1)}
                      disabled={index === 0}
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--secondary admin-btn--sm"
                      onClick={() => moveGalleryItem(index, 1)}
                      disabled={index === gallery.length - 1}
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--danger admin-btn--sm"
                      onClick={() => removeGalleryItem(item.key)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="admin-actions">
        <button type="submit" className="admin-btn" disabled={busy}>
          {busy ? "Saving…" : mode === "create" ? "Create entry" : "Save changes"}
        </button>
        <Link href="/admin/clients" className="admin-btn admin-btn--secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
