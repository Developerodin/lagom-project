import { NextResponse } from "next/server";
import { contactServiceOptions } from "@/content/contact";
import { sendContactNotification } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const SERVICE_LABELS = Object.fromEntries(
  contactServiceOptions.map((service) => [service.id, service.label]),
) as Record<string, string>;

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const recentSubmissions = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const previous = (recentSubmissions.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );

  if (previous.length >= MAX_PER_WINDOW) {
    recentSubmissions.set(ip, previous);
    return true;
  }

  previous.push(now);
  recentSubmissions.set(ip, previous);
  return false;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real users never fill this hidden field.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ success: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const services = Array.isArray(body.services)
    ? body.services
        .filter((service): service is string => typeof service === "string")
        .map((service) => service.trim())
        .filter((service) => service in SERVICE_LABELS)
    : [];
  const subject = services.map((service) => SERVICE_LABELS[service]).join(", ");

  if (!name || !email || !message || services.length === 0) {
    return NextResponse.json(
      { error: "Please fill in all required fields." },
      { status: 400 },
    );
  }

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages sent. Please try again later." },
      { status: 429 },
    );
  }

  try {
    await prisma.contactSubmission.create({
      data: {
        name,
        email,
        company: company || null,
        subject,
        message,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not send your message. Please try again." },
      { status: 500 },
    );
  }

  try {
    await sendContactNotification({
      name,
      email,
      company: company || null,
      services: subject,
      message,
    });
  } catch (error) {
    console.error("[contact] Failed to send notification email:", error);
    return NextResponse.json(
      { error: "Could not send your message. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
