import { prisma } from "@/lib/prisma";

export type GalleryImageInput = {
  imageUrl: string;
  alt: string;
  width: number | null;
  height: number | null;
  sortOrder: number;
};

export type ClientWorkInput = {
  title: string;
  slug: string;
  description: string;
  services: string;
  whatWeDid: string | null;
  cardImage: string;
  cardAlt: string;
  heroImage: string;
  heroAlt: string;
  sortOrder: number;
  published: boolean;
  categoryId: string | null;
  serviceIds: string[];
  gallery: GalleryImageInput[];
};

export type WorkServiceInput = {
  name: string;
  slug: string;
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type ValidationResult =
  | { ok: true; data: ClientWorkInput }
  | { ok: false; error: string };

export type WorkServiceValidationResult =
  | { ok: true; data: WorkServiceInput }
  | { ok: false; error: string };

const workServiceInclude = {
  include: { workService: true },
  orderBy: { sortOrder: "asc" as const },
};

export function parseClientWorkInput(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid request body." };
  }

  const raw = body as Record<string, unknown>;
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const slugSource = typeof raw.slug === "string" ? raw.slug : "";
  const slug = slugify(slugSource || title);
  const description =
    typeof raw.description === "string" ? raw.description.trim() : "";
  const whatWeDid =
    typeof raw.whatWeDid === "string" ? raw.whatWeDid.trim() : "";
  const services =
    typeof raw.services === "string"
      ? raw.services.trim()
      : whatWeDid;
  const cardImage = typeof raw.cardImage === "string" ? raw.cardImage : "";
  const cardAlt = typeof raw.cardAlt === "string" ? raw.cardAlt.trim() : "";
  const heroImage = typeof raw.heroImage === "string" ? raw.heroImage : "";
  const heroAlt = typeof raw.heroAlt === "string" ? raw.heroAlt.trim() : "";
  const sortOrder = Number.isFinite(Number(raw.sortOrder))
    ? Math.trunc(Number(raw.sortOrder))
    : 0;
  const published = raw.published !== false;
  const categoryId =
    typeof raw.categoryId === "string" && raw.categoryId.trim().length > 0
      ? raw.categoryId.trim()
      : null;

  if (!title) return { ok: false, error: "Title is required." };
  if (!slug) return { ok: false, error: "A valid slug is required." };
  if (!cardImage) return { ok: false, error: "A card image is required." };
  if (!heroImage) return { ok: false, error: "A hero image is required." };
  if (!description) return { ok: false, error: "A description is required." };

  const galleryRaw = Array.isArray(raw.gallery) ? raw.gallery : [];
  const gallery: GalleryImageInput[] = galleryRaw
    .map((item, index) => {
      const entry = item as Record<string, unknown>;
      const imageUrl =
        typeof entry.imageUrl === "string" ? entry.imageUrl : "";
      return {
        imageUrl,
        alt: typeof entry.alt === "string" ? entry.alt.trim() : "",
        width: Number.isFinite(Number(entry.width))
          ? Math.trunc(Number(entry.width))
          : null,
        height: Number.isFinite(Number(entry.height))
          ? Math.trunc(Number(entry.height))
          : null,
        sortOrder: Number.isFinite(Number(entry.sortOrder))
          ? Math.trunc(Number(entry.sortOrder))
          : index,
      };
    })
    .filter((item) => item.imageUrl.length > 0);

  const serviceIdsRaw = Array.isArray(raw.serviceIds) ? raw.serviceIds : [];
  const seenServiceIds = new Set<string>();
  const serviceIds: string[] = [];
  for (const item of serviceIdsRaw) {
    if (typeof item !== "string") continue;
    const id = item.trim();
    if (!id || seenServiceIds.has(id)) continue;
    seenServiceIds.add(id);
    serviceIds.push(id);
  }

  return {
    ok: true,
    data: {
      title,
      slug,
      description,
      services,
      whatWeDid: whatWeDid.length > 0 ? whatWeDid : null,
      cardImage,
      cardAlt,
      heroImage,
      heroAlt,
      sortOrder,
      published,
      categoryId,
      serviceIds,
      gallery,
    },
  };
}

export function parseWorkServiceInput(
  body: unknown,
): WorkServiceValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid request body." };
  }

  const raw = body as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const slugSource = typeof raw.slug === "string" ? raw.slug : "";
  const slug = slugify(slugSource || name);

  if (!name) return { ok: false, error: "Name is required." };
  if (!slug) return { ok: false, error: "A valid slug is required." };

  return { ok: true, data: { name, slug } };
}

export function getClientWhatWeDid(client: {
  whatWeDid: string | null;
  services: string;
}) {
  const whatWeDid = client.whatWeDid?.trim();
  if (whatWeDid) return whatWeDid;

  const services = client.services?.trim();
  return services || null;
}

export function getClientServiceLabels(client: {
  workServices?: Array<{ workService: { name: string } }>;
}) {
  return (client.workServices ?? []).map((entry) => entry.workService.name);
}

export function getAllWorkServices() {
  return prisma.workService.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function validateServiceIds(serviceIds: string[]) {
  if (serviceIds.length === 0) {
    return { ok: true as const, serviceIds: [] as string[] };
  }

  const found = await prisma.workService.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true },
  });
  const foundIds = new Set(found.map((service) => service.id));
  const missing = serviceIds.filter((id) => !foundIds.has(id));

  if (missing.length > 0) {
    return {
      ok: false as const,
      error: "One or more selected services do not exist.",
    };
  }

  return { ok: true as const, serviceIds };
}

export function getPublishedClients(limit?: number, categorySlug?: string) {
  return prisma.clientWork.findMany({
    where: {
      published: true,
      ...(categorySlug
        ? { category: { slug: categorySlug } }
        : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    take: limit,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      workServices: workServiceInclude,
    },
  });
}

export function getClientBySlug(slug: string) {
  return prisma.clientWork.findFirst({
    where: { slug, published: true },
    include: {
      gallery: { orderBy: { sortOrder: "asc" } },
      category: { select: { id: true, name: true, slug: true } },
      workServices: workServiceInclude,
    },
  });
}

export function getAllClients() {
  return prisma.clientWork.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      category: { select: { id: true, name: true, slug: true } },
      workServices: workServiceInclude,
    },
  });
}

export function getClientById(id: string) {
  return prisma.clientWork.findUnique({
    where: { id },
    include: {
      gallery: { orderBy: { sortOrder: "asc" } },
      category: { select: { id: true, name: true, slug: true } },
      workServices: workServiceInclude,
    },
  });
}
