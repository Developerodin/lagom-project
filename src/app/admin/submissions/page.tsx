import { SubmissionList } from "@/components/admin/SubmissionList";
import { getSubmissions } from "@/lib/contact";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage() {
  const submissions = await getSubmissions();

  return (
    <div>
      <div className="admin-page-header">
        <h1>Enquiries</h1>
      </div>

      <SubmissionList
        submissions={submissions.map((submission) => ({
          id: submission.id,
          name: submission.name,
          email: submission.email,
          subject: submission.subject,
          status: submission.status,
          createdAt: formatDateTime(submission.createdAt),
        }))}
      />
    </div>
  );
}
