"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SubmissionDetailProps = {
  submission: {
    id: string;
    name: string;
    email: string;
    company: string | null;
    subject: string;
    message: string;
    status: string;
    createdAt: string;
  };
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
};

export function SubmissionDetail({ submission }: SubmissionDetailProps) {
  const router = useRouter();
  const [status, setStatus] = useState(submission.status);
  const [busy, setBusy] = useState(false);

  async function updateStatus(nextStatus: string) {
    setBusy(true);
    const response = await fetch(`/api/admin/submissions/${submission.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setBusy(false);

    if (response.ok) {
      setStatus(nextStatus);
      router.refresh();
    } else {
      window.alert("Could not update status. Please try again.");
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this enquiry? This cannot be undone.")) {
      return;
    }
    setBusy(true);
    const response = await fetch(`/api/admin/submissions/${submission.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      router.push("/admin/submissions");
      router.refresh();
    } else {
      setBusy(false);
      window.alert("Could not delete this enquiry. Please try again.");
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <span className={`admin-badge admin-badge--${status}`}>
          {STATUS_LABELS[status] ?? status}
        </span>
      </div>

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <dl className="admin-detail-grid">
          <dt>Name</dt>
          <dd>{submission.name}</dd>

          <dt>Email</dt>
          <dd>
            <a className="admin-link" href={`mailto:${submission.email}`}>
              {submission.email}
            </a>
          </dd>

          {submission.company ? (
            <>
              <dt>Company</dt>
              <dd>{submission.company}</dd>
            </>
          ) : null}

          <dt>Subject</dt>
          <dd>{submission.subject}</dd>

          <dt>Received</dt>
          <dd>{submission.createdAt}</dd>

          <dt>Message</dt>
          <dd className="admin-message-body">{submission.message}</dd>
        </dl>
      </div>

      <div className="admin-actions">
        <button
          type="button"
          className="admin-btn admin-btn--secondary"
          onClick={() => updateStatus("read")}
          disabled={busy || status === "read"}
        >
          Mark as read
        </button>
        <button
          type="button"
          className="admin-btn"
          onClick={() => updateStatus("replied")}
          disabled={busy || status === "replied"}
        >
          Mark as replied
        </button>
        <a className="admin-btn admin-btn--secondary" href={`mailto:${submission.email}`}>
          Reply by email
        </a>
        <button
          type="button"
          className="admin-btn admin-btn--danger"
          onClick={handleDelete}
          disabled={busy}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
