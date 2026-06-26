import Link from "next/link";
import { notFound } from "next/navigation";
import { SubmissionDetail } from "@/components/admin/SubmissionDetail";
import { getSubmissionById } from "@/lib/contact";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await getSubmissionById(id);

  if (!submission) {
    notFound();
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>{submission.subject}</h1>
        <Link href="/admin/submissions" className="admin-btn admin-btn--secondary">
          Back to enquiries
        </Link>
      </div>

      <SubmissionDetail
        submission={{
          id: submission.id,
          name: submission.name,
          email: submission.email,
          company: submission.company,
          subject: submission.subject,
          message: submission.message,
          status: submission.status,
          createdAt: formatDateTime(submission.createdAt),
        }}
      />
    </div>
  );
}
