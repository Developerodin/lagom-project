import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { validateCategoryId } from "@/lib/categories";
import { prisma } from "@/lib/prisma";
import {
  getAllClients,
  parseClientWorkInput,
  validateServiceIds,
} from "@/lib/work";

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const clients = await getAllClients();
  return NextResponse.json({ clients });
}

export async function POST(request: Request) {
  const authError = await requireAuth();
  if (authError) return authError;

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

  const { gallery, serviceIds, ...fields } = parsed.data;

  const categoryCheck = await validateCategoryId(fields.categoryId);
  if (!categoryCheck.ok) {
    return NextResponse.json({ error: categoryCheck.error }, { status: 400 });
  }

  const serviceCheck = await validateServiceIds(serviceIds);
  if (!serviceCheck.ok) {
    return NextResponse.json({ error: serviceCheck.error }, { status: 400 });
  }

  try {
    const created = await prisma.clientWork.create({
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
    });
    return NextResponse.json({ id: created.id }, { status: 201 });
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
    return NextResponse.json({ error: "Could not create entry." }, { status: 500 });
  }
}
