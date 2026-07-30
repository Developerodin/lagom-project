"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import Image from "next/image";
import { useId, useRef } from "react";

import { homeHeroCards } from "@/content/home";
import styles from "./HomeHeroCardsAnimation.module.css";

gsap.registerPlugin(useGSAP, MotionPathPlugin);

const CARD_COUNT = homeHeroCards.length;
const PATH_DURATION = 1.7;
const STAGGER = 0.1;
const EXIT = 0.4;
const FADE = 0.2;
const MIN_SIZE_REM = 5;
const MAX_SIZE_REM = 9;
/** Spread along visible arc only; path continues past top-left off the left edge for exit. */
const SPREAD_END_MAX = 0.78;
const SPREAD_END_MIN = 0.18;

const START_ROTATIONS = [-12, 8, -6, 10, -4, 6, -10, 5, -8, 12] as const;

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** First along the swoosh (path start) is smallest; last along the path (tip) is largest. */
function cardSizeRem(index: number) {
  return (
    MAX_SIZE_REM -
    (MAX_SIZE_REM - MIN_SIZE_REM) * (index / (CARD_COUNT - 1))
  );
}

/** Path progress where each card eases to a stop, forming an end→start flock. */
function spreadEndProgress(index: number) {
  const t = index / (CARD_COUNT - 1);
  return SPREAD_END_MAX - t * (SPREAD_END_MAX - SPREAD_END_MIN);
}

function buildArcPath(width: number, height: number) {
  const startX = width * 0.28;
  const startY = height * 0.92;
  const midX = width * 0.96;
  const midY = height * 0.48;
  const cornerX = width * 0.08;
  const cornerY = height * 0.06;
  // Continue the curve past the top-left corner off the left border.
  const exitX = -width * 0.18;
  const exitY = height * 0.02;

  return [
    `M ${startX},${startY}`,
    `C ${width * 0.52},${height * 0.9}`,
    `${midX},${height * 0.72}`,
    `${midX},${midY}`,
    `S ${width * 0.35},${height * 0.12}`,
    `${cornerX},${cornerY}`,
    `C ${width * 0.02},${height * 0.04}`,
    `${-width * 0.06},${height * 0.03}`,
    `${exitX},${exitY}`,
  ].join(" ");
}

function mobileSizeScale() {
  if (typeof window === "undefined") return 1;
  return window.matchMedia("(max-width: 640px)").matches ? 0.68 : 1;
}

export function HomeHeroCardsAnimation() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const pathId = useId().replace(/:/g, "");

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const overlay = overlayRef.current;
      const pathEl = pathRef.current;
      if (!overlay || !pathEl) return;

      const section = overlay.closest("section");
      if (!section) return;

      const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
      if (cards.length === 0) return;

      const rem = Number.parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      const scale = mobileSizeScale();

      const layout = () => {
        const { width, height } = overlay.getBoundingClientRect();
        if (width <= 0 || height <= 0) return null;

        pathEl.setAttribute("d", buildArcPath(width, height));

        const svg = pathEl.ownerSVGElement;
        if (svg) {
          svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        }

        return { width, height };
      };

      const box = layout();
      if (!box) return;

      cards.forEach((card, index) => {
        const sizePx = cardSizeRem(index) * rem * scale;
        gsap.set(card, {
          width: sizePx,
          height: sizePx,
          xPercent: -50,
          yPercent: -50,
          rotation: START_ROTATIONS[index] ?? 0,
          autoAlpha: 0,
          force3D: true,
        });
      });

      gsap.set(cards, {
        motionPath: {
          path: pathEl,
          align: pathEl,
          alignOrigin: [0.5, 0.5],
          start: 0,
          end: 0,
        },
      });

      const master = gsap.timeline({ paused: true });

      cards.forEach((card, index) => {
        const startAt = index * STAGGER;
        const endProgress = spreadEndProgress(index);

        master.fromTo(
          card,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.12,
            ease: "power1.out",
          },
          startAt,
        );

        // Ease-out into the spread formation (end→start along the arc).
        // Do not continue to a top-left stack.
        master.to(
          card,
          {
            duration: PATH_DURATION,
            ease: "power2.out",
            motionPath: {
              path: pathEl,
              align: pathEl,
              alignOrigin: [0.5, 0.5],
              start: 0,
              end: endProgress,
              autoRotate: false,
            },
          },
          startAt,
        );
      });

      const lastLand = (CARD_COUNT - 1) * STAGGER + PATH_DURATION;

      // Continue along the curve off the left corner — not a straight horizontal slide.
      cards.forEach((card, index) => {
        const fromProgress = spreadEndProgress(index);
        master.to(
          card,
          {
            duration: EXIT,
            ease: "power2.in",
            motionPath: {
              path: pathEl,
              align: pathEl,
              alignOrigin: [0.5, 0.5],
              start: fromProgress,
              end: 1,
              autoRotate: false,
            },
          },
          lastLand + index * 0.02,
        );
      });

      master.to(
        cards,
        {
          autoAlpha: 0,
          duration: FADE,
          ease: "power1.in",
        },
        lastLand + EXIT * 0.25,
      );

      let hasPlayedForCurrentEntry = false;

      const parkAtStart = () => {
        gsap.set(cards, {
          autoAlpha: 0,
          rotation: (index: number) => START_ROTATIONS[index] ?? 0,
          motionPath: {
            path: pathEl,
            align: pathEl,
            alignOrigin: [0.5, 0.5],
            start: 0,
            end: 0,
          },
        });
      };

      const play = () => {
        layout();
        parkAtStart();
        master.restart(true);
        hasPlayedForCurrentEntry = true;
      };

      const reset = () => {
        master.pause(0);
        hasPlayedForCurrentEntry = false;
        parkAtStart();
      };

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
            if (!hasPlayedForCurrentEntry) play();
          } else if (!entry.isIntersecting) {
            reset();
          }
        },
        { threshold: [0, 0.2, 0.5] },
      );

      observer.observe(section);

      let resizeTimer = 0;
      const onResize = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          layout();
          if (!master.isActive() && master.progress() === 0) {
            parkAtStart();
          }
        }, 120);
      };

      window.addEventListener("resize", onResize);

      return () => {
        observer.disconnect();
        window.removeEventListener("resize", onResize);
        window.clearTimeout(resizeTimer);
        master.kill();
      };
    },
    { scope: overlayRef },
  );

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      aria-hidden="true"
    >
      <svg className={styles.pathSvg} aria-hidden="true">
        <path
          ref={pathRef}
          id={`hero-cards-arc-${pathId}`}
          className={styles.path}
        />
      </svg>

      {homeHeroCards.map((card, index) => (
        <div
          key={card.id}
          ref={(node) => {
            cardsRef.current[index] = node;
          }}
          className={styles.card}
        >
          <Image
            src={card.src}
            alt={card.alt}
            width={320}
            height={320}
            className={styles.cardImage}
            loading={index < 2 ? "eager" : "lazy"}
            sizes="(max-width: 640px) 20vw, 9rem"
          />
        </div>
      ))}
    </div>
  );
}
