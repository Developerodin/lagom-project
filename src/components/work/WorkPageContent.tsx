"use client";

import { useState } from "react";
import { WorkGrid, type WorkGridItem } from "@/components/work/WorkGrid";
import styles from "./WorkCategoryFilters.module.css";

export type WorkCategory = {
  id: string;
  name: string;
  slug: string;
};

type WorkPageContentProps = {
  items: Array<WorkGridItem & { categorySlug: string | null }>;
  categories: WorkCategory[];
};

export function WorkPageContent({ items, categories }: WorkPageContentProps) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const filteredItems =
    activeSlug === null
      ? items
      : items.filter((item) => item.categorySlug === activeSlug);

  return (
    <>
      {categories.length > 0 ? (
        <div className={styles.filters} role="group" aria-label="Filter by category">
          <button
            type="button"
            className={`button ${activeSlug === null ? "button-primary" : "button-outline"}`}
            onClick={() => setActiveSlug(null)}
            aria-pressed={activeSlug === null}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`button ${activeSlug === category.slug ? "button-primary" : "button-outline"}`}
              onClick={() => setActiveSlug(category.slug)}
              aria-pressed={activeSlug === category.slug}
            >
              {category.name}
            </button>
          ))}
        </div>
      ) : null}

      {filteredItems.length > 0 ? (
        <WorkGrid items={filteredItems} />
      ) : (
        <p className="body text-muted">
          No work in this category yet. Please check back soon.
        </p>
      )}
    </>
  );
}
