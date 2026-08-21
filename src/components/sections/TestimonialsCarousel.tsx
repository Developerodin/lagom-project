"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { CmsImage } from "@/components/ui/CmsImage";
import styles from "./TestimonialsSection.module.css";

type Testimonial = {
  id: string;
  quote: string;
  logoUrl: string;
  logoAlt: string | null;
  company: string | null;
  bgImageUrl: string;
  bgImageAlt: string | null;
};

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLUListElement>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const mql = window.matchMedia("(max-width: 768px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const visibleCount = isMobile ? 1 : 3;
  const needsSliding = testimonials.length > visibleCount;
  const maxIndex = needsSliding ? testimonials.length - visibleCount : 0;

  const advance = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  useEffect(() => {
    if (!needsSliding || paused || reducedMotion.current) return;
    const id = setInterval(advance, 3000);
    return () => clearInterval(id);
  }, [needsSliding, paused, advance]);

  const slidePercent = isMobile
    ? currentIndex * 100
    : currentIndex * (100 / visibleCount);

  return (
    <div
      className={styles.carousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <ul
        ref={trackRef}
        className={styles.track}
        style={{
          transform: `translateX(-${slidePercent}%)`,
          transition: "transform 0.5s ease",
        }}
      >
        {testimonials.map((testimonial) => (
          <li
            key={testimonial.id}
            className={styles.slide}
            style={{ flex: `0 0 ${100 / visibleCount}%` }}
          >
            <article className={styles.card}>
              <CmsImage
                src={testimonial.bgImageUrl}
                alt={testimonial.bgImageAlt || ""}
                fill
                className={styles.cardBg}
                sizes="(max-width: 768px) 100vw, 33vw"
                loading="lazy"
                decoding="async"
                aria-hidden={testimonial.bgImageAlt ? undefined : true}
              />
              <div className={styles.cardOverlay} aria-hidden="true" />

              <div className={styles.cardContent}>
                <blockquote className={styles.quote}>
                  <p>{testimonial.quote}</p>
                </blockquote>

                <div className={styles.logoWrap}>
                  <CmsImage
                    src={testimonial.logoUrl}
                    alt={testimonial.logoAlt || testimonial.company || "Client logo"}
                    width={160}
                    height={64}
                    className={styles.logo}
                    sizes="(max-width: 768px) 120px, 160px"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>

      {needsSliding && (
        <div className={styles.dots}>
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === currentIndex ? styles.dotActive : ""}`}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
