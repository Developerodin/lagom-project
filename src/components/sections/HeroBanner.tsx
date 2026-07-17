"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { heroBannerSlides, type HeroBannerSlide } from "@/content/home";
import styles from "./HeroBanner.module.css";

const AUTOPLAY_DELAY_MS = 3500;
const SCROLL_DURATION = 25;
const SLIDE_COUNT = heroBannerSlides.length;
type AutoplayPlugin = ReturnType<typeof Autoplay>;

function scheduleStateUpdate(fn: () => void) {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(fn);
  } else {
    window.setTimeout(fn, 0);
  }
}

type HeroBannerSlideItemProps = {
  slide: HeroBannerSlide;
  index: number;
  isActive: boolean;
};

const HeroBannerSlideItem = memo(function HeroBannerSlideItem({
  slide,
  index,
  isActive,
}: HeroBannerSlideItemProps) {
  return (
    <div
      className={styles.slide}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${SLIDE_COUNT}`}
      aria-hidden={!isActive}
    >
      <div className={styles.slideInner}>
        <Image
          src={slide.image}
          alt={slide.alt}
          fill
          priority={index === 0}
          // Slide 2 loads eagerly so autoplay never reveals an empty frame
          // on slow connections; later slides stay lazy until needed.
          loading={index === 0 ? undefined : index === 1 ? "eager" : "lazy"}
          sizes="100vw"
          className={styles.image}
          draggable={false}
        />
      </div>
    </div>
  );
});

export function HeroBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisibleRef = useRef(false);
  const isDraggingRef = useRef(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const autoplayPlugin: AutoplayPlugin | null = useMemo(() => {
    if (prefersReducedMotion) return null;
    return Autoplay({
      delay: AUTOPLAY_DELAY_MS,
      playOnInit: false,
      stopOnInteraction: false,
    });
  }, [prefersReducedMotion]);

  const emblaOptions = useMemo(
    () => ({
      loop: true,
      align: "start" as const,
      duration: prefersReducedMotion ? 0 : SCROLL_DURATION,
      dragFree: false,
    }),
    [prefersReducedMotion],
  );

  const emblaPlugins = useMemo(
    () => (autoplayPlugin ? [autoplayPlugin] : []),
    [autoplayPlugin],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, emblaPlugins);

  const resumeAutoplay = useCallback(() => {
    if (
      prefersReducedMotion ||
      !autoplayPlugin ||
      !isVisibleRef.current ||
      isDraggingRef.current
    ) {
      return;
    }

    autoplayPlugin.reset();
  }, [autoplayPlugin, prefersReducedMotion]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
      resumeAutoplay();
    },
    [emblaApi, resumeAutoplay],
  );

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
    resumeAutoplay();
  }, [emblaApi, resumeAutoplay]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
    resumeAutoplay();
  }, [emblaApi, resumeAutoplay]);

  const onPaginationKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollNext, scrollPrev],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }

    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateReducedMotion = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updateReducedMotion();
    mediaQuery.addEventListener("change", updateReducedMotion);

    return () => mediaQuery.removeEventListener("change", updateReducedMotion);
  }, []);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    scheduleStateUpdate(onSelect);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const onPointerDown = () => {
      isDraggingRef.current = true;
      autoplayPlugin?.stop();
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
      resumeAutoplay();
    };

    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerUp", onPointerUp);

    return () => {
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
    };
  }, [emblaApi, resumeAutoplay]);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;

        if (entry.isIntersecting && !prefersReducedMotion) {
          autoplayPlugin?.play();
        } else {
          autoplayPlugin?.stop();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    emblaApi.reInit(emblaOptions, emblaPlugins);
  }, [emblaApi, emblaOptions, emblaPlugins]);

  useEffect(() => {
    if (prefersReducedMotion) {
      autoplayPlugin?.stop();
      return;
    }

    if (isVisibleRef.current) {
      autoplayPlugin?.play();
    }
  }, [autoplayPlugin, prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-roledescription="carousel"
      aria-label="Featured work"
    >
      <div className={styles.viewport} ref={emblaRef}>
        <div className={styles.container}>
          {heroBannerSlides.map((slide, index) => (
            <HeroBannerSlideItem
              key={slide.id}
              slide={slide}
              index={index}
              isActive={index === selectedIndex}
            />
          ))}
        </div>
      </div>

      <div
        className={styles.pagination}
        role="tablist"
        aria-label="Choose banner slide"
        onKeyDown={onPaginationKeyDown}
      >
        {heroBannerSlides.map((slide, index) => {
          const isActive = index === selectedIndex;

          return (
            <button
              key={slide.id}
              type="button"
              role="tab"
              className={`${styles.dot} ${isActive ? styles.dotActive : ""}`}
              aria-label={`Go to slide ${index + 1}`}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => scrollTo(index)}
            />
          );
        })}
      </div>
    </section>
  );
}
