import type { Metadata } from "next";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { WorkPageContent } from "@/components/work/WorkPageContent";
import { getPublishedCategories } from "@/lib/categories";
import { getPublishedClients, getClientWhatWeDid } from "@/lib/work";
import styles from "./work.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected branding, packaging and digital projects by Lagom Design.",
};

export default async function WorkPage() {
  let clients: Awaited<ReturnType<typeof getPublishedClients>> = [];
  let categories: Awaited<ReturnType<typeof getPublishedCategories>> = [];

  try {
    [clients, categories] = await Promise.all([
      getPublishedClients(),
      getPublishedCategories(),
    ]);
  } catch {
    clients = [];
    categories = [];
  }

  return (
    <RevealOnScroll as="section" className={`section-md ${styles.section}`}>
      <div className="container">
        <h1 className="sr-only">Work</h1>
        {clients.length > 0 ? (
          <WorkPageContent
            categories={categories.map((category) => ({
              id: category.id,
              name: category.name,
              slug: category.slug,
            }))}
            items={clients.map((client) => ({
              slug: client.slug,
              title: client.title,
              cardImage: client.cardImage,
              cardAlt: client.cardAlt,
              whatWeDid: getClientWhatWeDid(client),
              categorySlug: client.category?.slug ?? null,
            }))}
          />
        ) : (
          <p className="body text-muted">
            New work is on the way. Please check back soon.
          </p>
        )}
      </div>
    </RevealOnScroll>
  );
}
