"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ClientRow = {
  id: string;
  title: string;
  slug: string;
  sortOrder: number;
  published: boolean;
  categoryName: string | null;
};

export function ClientWorkList({ clients }: { clients: ClientRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    const response = await fetch(`/api/admin/clients/${id}`, {
      method: "DELETE",
    });
    setDeletingId(null);

    if (response.ok) {
      router.refresh();
    } else {
      window.alert("Could not delete this entry. Please try again.");
    }
  }

  if (clients.length === 0) {
    return (
      <div className="admin-empty">
        No work entries yet. Create your first one to get started.
      </div>
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Slug</th>
            <th>Order</th>
            <th>Status</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td data-label="Title">{client.title}</td>
              <td data-label="Category">{client.categoryName ?? "—"}</td>
              <td data-label="Slug">/work/{client.slug}</td>
              <td data-label="Order">{client.sortOrder}</td>
              <td data-label="Status">
                <span
                  className={`admin-badge ${
                    client.published ? "admin-badge--published" : "admin-badge--draft"
                  }`}
                >
                  {client.published ? "Published" : "Draft"}
                </span>
              </td>
              <td data-label="">
                <div className="admin-actions">
                  <Link
                    href={`/admin/clients/${client.id}/edit`}
                    className="admin-btn admin-btn--secondary admin-btn--sm"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="admin-btn admin-btn--danger admin-btn--sm"
                    onClick={() => handleDelete(client.id, client.title)}
                    disabled={deletingId === client.id}
                  >
                    {deletingId === client.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
