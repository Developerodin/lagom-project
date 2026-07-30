import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { validateCategoryId } from "@/lib/categories";
import { prisma } from "@/lib/prisma";
import { deleteUpload } from "@/lib/uploads";
import {
  getClientById,
  parseClientWorkInput,
  validateServiceIds,
} from "@/lib/work";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ client });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = parseClientWorkInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const existing = await prisma.clientWork.findUnique({
    where: { id },
    include: { gallery: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { gallery, serviceIds, ...fields } = parsed.data;

  const categoryCheck = await validateCategoryId(fields.categoryId);
  if (!categoryCheck.ok) {
    return NextResponse.json({ error: categoryCheck.error }, { status: 400 });
  }

  const serviceCheck = await validateServiceIds(serviceIds);
  if (!serviceCheck.ok) {
    return NextResponse.json({ error: serviceCheck.error }, { status: 400 });
  }

  const previousUrls = new Set<string>([
    existing.cardImage,
    existing.heroImage,
    ...existing.gallery.map((image) => image.imageUrl),
  ]);
  const nextUrls = new Set<string>([
    fields.cardImage,
    fields.heroImage,
    ...gallery.map((image) => image.imageUrl),
  ]);

  try {
    await prisma.$transaction([
      prisma.clientWorkImage.deleteMany({ where: { clientWorkId: id } }),
      prisma.clientWorkService.deleteMany({ where: { clientWorkId: id } }),
      prisma.clientWork.update({
        where: { id },
        data: {
          ...fields,
          categoryId: categoryCheck.categoryId,
          gallery: {
            create: gallery.map((image, index) => ({
              imageUrl: image.imageUrl,
              alt: image.alt,
              width: image.width,
              height: image.height,
              sortOrder: index,
            })),
          },
          workServices: {
            create: serviceCheck.serviceIds.map((workServiceId, index) => ({
              workServiceId,
              sortOrder: index,
            })),
          },
        },
      }),
    ]);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That slug is already in use. Choose a different one." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Could not update entry." }, { status: 500 });
  }

  for (const url of previousUrls) {
    if (!nextUrls.has(url)) {
      await deleteUpload(url);
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;

  const existing = await prisma.clientWork.findUnique({
    where: { id },
    include: { gallery: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await prisma.clientWork.delete({ where: { id } });

  await deleteUpload(existing.cardImage);
  await deleteUpload(existing.heroImage);
  for (const image of existing.gallery) {
    await deleteUpload(image.imageUrl);
  }

  return NextResponse.json({ success: true });
}
