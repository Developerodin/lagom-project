import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAllCategories, parseCategoryInput } from "@/lib/categories";

export async function GET() {
  const categories = await getAllCategories();
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = parseCategoryInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const created = await prisma.workCategory.create({ data: parsed.data });
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
    return NextResponse.json({ error: "Could not create category." }, { status: 500 });
  }
}
