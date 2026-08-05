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
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Services</th>
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
              <td data-label="Name">
                {submission.name}
                <br />
                <span className="admin-table__muted">{submission.email}</span>
              </td>
              <td data-label="Services">{submission.subject}</td>
              <td data-label="Received">{submission.createdAt}</td>
              <td data-label="Status">
                <span className={`admin-badge admin-badge--${submission.status}`}>
                  {STATUS_LABELS[submission.status] ?? submission.status}
                </span>
              </td>
              <td data-label="">
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
    </div>
  );
}
