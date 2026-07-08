import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ClientWorkDescription } from "@/components/work/ClientWorkDescription";
import { ClientWorkGallery } from "@/components/work/ClientWorkGallery";
import { ClientWorkHero } from "@/components/work/ClientWorkHero";
import { getClientBySlug, getClientWhatWeDid } from "@/lib/work";
import styles from "./detail.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const client = await getClientBySlug(slug);

  if (!client) {
    return {};
  }

  return {
    title: client.title,
    description: `${client.title} — a project by Lagom Design.`,
  };
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await getClientBySlug(slug);

  if (!client) {
    notFound();
  }

  return (
    <>
      <ClientWorkHero
        src={client.heroImage}
        alt={client.heroAlt}
        title={client.title}
      />
      <ClientWorkDescription
        description={client.description}
        whatWeDid={getClientWhatWeDid(client)}
        category={client.category?.name ?? null}
      />
      <ClientWorkGallery images={client.gallery} />

      <RevealOnScroll
        as="nav"
        className={styles.footerNav}
        aria-label="Work navigation"
      >
        <Link href="/work" className="button button-primary">
          Back to all work
        </Link>
        <Link href="/" className={styles.homeLink}>
          Return home
        </Link>
      </RevealOnScroll>
    </>
  );
}
