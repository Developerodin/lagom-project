"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type TestimonialRow = {
  id: string;
  quote: string;
  author: string;
  company: string | null;
  sortOrder: number;
  published: boolean;
};

function truncate(text: string, max = 80) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

export function TestimonialList({ testimonials }: { testimonials: TestimonialRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this testimonial?")) {
      return;
    }

    setDeletingId(id);
    const response = await fetch(`/api/admin/testimonials/${id}`, {
      method: "DELETE",
    });
    setDeletingId(null);

    if (response.ok) {
      router.refresh();
    } else {
      window.alert("Could not delete this testimonial. Please try again.");
    }
  }

  if (testimonials.length === 0) {
    return (
      <div className="admin-empty">
        No testimonials yet. Add client quotes to display on the homepage.
      </div>
    );
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Quote</th>
          <th>Author</th>
          <th>Company</th>
          <th>Order</th>
          <th>Status</th>
          <th aria-label="Actions" />
        </tr>
      </thead>
      <tbody>
        {testimonials.map((testimonial) => (
          <tr key={testimonial.id}>
            <td>{truncate(testimonial.quote)}</td>
            <td>{testimonial.author || "—"}</td>
            <td>{testimonial.company || "—"}</td>
            <td>{testimonial.sortOrder}</td>
            <td>{testimonial.published ? "Published" : "Draft"}</td>
            <td>
              <div className="admin-actions">
                <Link
                  href={`/admin/testimonials/${testimonial.id}/edit`}
                  className="admin-btn admin-btn--secondary admin-btn--sm"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className="admin-btn admin-btn--danger admin-btn--sm"
                  onClick={() => handleDelete(testimonial.id)}
                  disabled={deletingId === testimonial.id}
                >
                  {deletingId === testimonial.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
