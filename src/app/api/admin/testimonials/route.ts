import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAllTestimonials, parseTestimonialInput } from "@/lib/testimonials";

export async function GET() {
  const testimonials = await getAllTestimonials();
  return NextResponse.json({ testimonials });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = parseTestimonialInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const created = await prisma.testimonial.create({ data: parsed.data });
    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create testimonial." }, { status: 500 });
  }
}
