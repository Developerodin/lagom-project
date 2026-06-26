import { prisma } from "@/lib/prisma";

export function getSubmissions() {
  return prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export function getSubmissionById(id: string) {
  return prisma.contactSubmission.findUnique({ where: { id } });
}

export function getUnreadSubmissionCount() {
  return prisma.contactSubmission.count({ where: { status: "new" } });
}
