import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/work";

export type WorkCategoryInput = {
  name: string;
  slug: string;
  sortOrder: number;
};

export type CategoryValidationResult =
  | { ok: true; data: WorkCategoryInput }
  | { ok: false; error: string };

export function parseCategoryInput(body: unknown): CategoryValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid request body." };
  }

  const raw = body as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const slugSource = typeof raw.slug === "string" ? raw.slug : "";
  const slug = slugify(slugSource || name);
  const sortOrder = Number.isFinite(Number(raw.sortOrder))
    ? Math.trunc(Number(raw.sortOrder))
    : 0;

  if (!name) return { ok: false, error: "Name is required." };
  if (!slug) return { ok: false, error: "A valid slug is required." };

  return { ok: true, data: { name, slug, sortOrder } };
}

export function getAllCategories() {
  return prisma.workCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { works: true } },
    },
  });
}

export function getPublishedCategories() {
  return prisma.workCategory.findMany({
    where: {
      works: { some: { published: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export function getCategoryById(id: string) {
  return prisma.workCategory.findUnique({ where: { id } });
}

export async function validateCategoryId(categoryId: string | null) {
  if (!categoryId) return { ok: true as const, categoryId: null };
  const category = await getCategoryById(categoryId);
  if (!category) {
    return { ok: false as const, error: "Selected category does not exist." };
  }
  return { ok: true as const, categoryId };
}
