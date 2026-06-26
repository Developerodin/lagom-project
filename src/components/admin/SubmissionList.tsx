import Link from "next/link";

type SubmissionRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  status: string;
  createdAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
};

export function SubmissionList({
  submissions,
}: {
  submissions: SubmissionRow[];
}) {
  if (submissions.length === 0) {
    return <div className="admin-empty">No enquiries yet.</div>;
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Subject</th>
          <th>Received</th>
          <th>Status</th>
          <th aria-label="Actions" />
        </tr>
      </thead>
      <tbody>
        {submissions.map((submission) => (
          <tr
            key={submission.id}
            className={
              submission.status === "new" ? "admin-table__row--unread" : undefined
            }
          >
            <td>
              {submission.name}
              <br />
              <span style={{ color: "var(--admin-muted)", fontWeight: 400 }}>
                {submission.email}
              </span>
            </td>
            <td>{submission.subject}</td>
            <td>{submission.createdAt}</td>
            <td>
              <span className={`admin-badge admin-badge--${submission.status}`}>
                {STATUS_LABELS[submission.status] ?? submission.status}
              </span>
            </td>
            <td>
              <Link
                href={`/admin/submissions/${submission.id}`}
                className="admin-btn admin-btn--secondary admin-btn--sm"
              >
                View
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
