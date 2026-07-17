import { prisma } from "@/lib/prisma";

export type TestimonialInput = {
  quote: string;
  author: string;
  company: string | null;
  logoUrl: string;
  logoAlt: string;
  bgImageUrl: string;
  bgImageAlt: string;
  sortOrder: number;
  published: boolean;
};

export type TestimonialValidationResult =
  | { ok: true; data: TestimonialInput }
  | { ok: false; error: string };

export function parseTestimonialInput(body: unknown): TestimonialValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid request body." };
  }

  const raw = body as Record<string, unknown>;
  const quote = typeof raw.quote === "string" ? raw.quote.trim() : "";
  const author = typeof raw.author === "string" ? raw.author.trim() : "";
  const company =
    typeof raw.company === "string" && raw.company.trim()
      ? raw.company.trim()
      : null;
  const logoUrl = typeof raw.logoUrl === "string" ? raw.logoUrl.trim() : "";
  const logoAlt = typeof raw.logoAlt === "string" ? raw.logoAlt.trim() : "";
  const bgImageUrl = typeof raw.bgImageUrl === "string" ? raw.bgImageUrl.trim() : "";
  const bgImageAlt = typeof raw.bgImageAlt === "string" ? raw.bgImageAlt.trim() : "";
  const sortOrder = Number.isFinite(Number(raw.sortOrder))
    ? Math.trunc(Number(raw.sortOrder))
    : 0;
  const published = raw.published !== false;

  if (!quote) return { ok: false, error: "Quote is required." };
  if (!logoUrl) return { ok: false, error: "Client logo is required." };
  if (!bgImageUrl) return { ok: false, error: "Card background image is required." };

  return {
    ok: true,
    data: {
      quote,
      author,
      company,
      logoUrl,
      logoAlt,
      bgImageUrl,
      bgImageAlt,
      sortOrder,
      published,
    },
  };
}

export function getAllTestimonials() {
  return prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getPublishedTestimonials() {
  const rows = await prisma.testimonial.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return rows;
}

export function getTestimonialById(id: string) {
  return prisma.testimonial.findUnique({ where: { id } });
}
