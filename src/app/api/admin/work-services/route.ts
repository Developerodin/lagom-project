import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAllWorkServices, parseWorkServiceInput } from "@/lib/work";

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const services = await getAllWorkServices();
  return NextResponse.json({ services });
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

  const parsed = parseWorkServiceInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const maxOrder = await prisma.workService.aggregate({
    _max: { sortOrder: true },
  });
  const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  try {
    const created = await prisma.workService.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        sortOrder,
      },
    });

    return NextResponse.json(
      { id: created.id, name: created.name, slug: created.slug },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That service already exists. Choose a different name." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Could not create service." },
      { status: 500 },
    );
  }
}
