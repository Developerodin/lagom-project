"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  workCount: number;
};

export function CategoryList({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? Work entries in this category will become uncategorized.`)) {
      return;
    }

    setDeletingId(id);
    const response = await fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });
    setDeletingId(null);

    if (response.ok) {
      router.refresh();
    } else {
      window.alert("Could not delete this category. Please try again.");
    }
  }

  if (categories.length === 0) {
    return (
      <div className="admin-empty">
        No categories yet. Create one to group work entries (e.g. Fashion, Food).
      </div>
    );
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Slug</th>
          <th>Order</th>
          <th>Work entries</th>
          <th aria-label="Actions" />
        </tr>
      </thead>
      <tbody>
        {categories.map((category) => (
          <tr key={category.id}>
            <td>{category.name}</td>
            <td>{category.slug}</td>
            <td>{category.sortOrder}</td>
            <td>{category.workCount}</td>
            <td>
              <div className="admin-actions">
                <Link
                  href={`/admin/categories/${category.id}/edit`}
                  className="admin-btn admin-btn--secondary admin-btn--sm"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className="admin-btn admin-btn--danger admin-btn--sm"
                  onClick={() => handleDelete(category.id, category.name)}
                  disabled={deletingId === category.id}
                >
                  {deletingId === category.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
