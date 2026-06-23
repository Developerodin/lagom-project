import type { Metadata } from "next";

import { ContactSection } from "@/components/sections/ContactSection";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Lagom Design. Send us a message or reach out via email, phone, or visit us in Bengaluru.",
};

export default function ContactPage() {
  return <ContactSection />;
}
