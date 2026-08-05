"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { useRef } from "react";

import { homeHeroCards } from "@/content/home";
import styles from "./HomeHeroCardsAnimation.module.css";

gsap.registerPlugin(useGSAP);

/** Percent of overlay size: center of each card. Wide gaps like the reference. */
type CardLayout = {
  x: number;
  y: number;
  size: number;
  z: number;
  rotation: number;
};

type ResolvedCard = {
  finalX: number;
  finalY: number;
  /** Same as exit — enter is reverse of fly-past toward camera. */
  cameraX: number;
  cameraY: number;
  sizePx: number;
  z: number;
  rotation: number;
  sideSign: number;
};

/** Wide horizontal scatter — generous gaps, minimal overlap (reference language). */
const DESKTOP_LAYOUT: CardLayout[] = [
  { x: 6, y: 46, size: 8.5, z: 3, rotation: -5 },
  { x: 18, y: 22, size: 8, z: 4, rotation: 4 },
  { x: 22, y: 58, size: 8.5, z: 5, rotation: -3 },
  { x: 34, y: 78, size: 9, z: 3, rotation: 5 },
  { x: 36, y: 28, size: 8, z: 6, rotation: -4 },
  { x: 50, y: 48, size: 8.5, z: 2, rotation: 2 },
  { x: 58, y: 24, size: 8, z: 5, rotation: -3 },
  { x: 66, y: 72, size: 8.5, z: 4, rotation: 4 },
  { x: 78, y: 40, size: 8.5, z: 5, rotation: -2 },
  { x: 92, y: 52, size: 9, z: 3, rotation: 4 },
];

const ENTER_DURATION = 1.1;
const ENTER_STAGGER = 0.06;
const PULSE_DURATION = 0.4;
const HOLD = 0.0;
const EXIT_DURATION = 0.8;
const EXIT_STAGGER = 0.035;
const REVEAL_DURATION = 0.3;
/** Toward-camera scale for enter start / exit end (fly past). */
const CAMERA_SCALE = 2.2;
const PULSE_SCALE = 1.08;
/** How many cards on each end pulse (3 left + 3 right = 6). */
const PULSE_END_COUNT = 3;
/** Outward X drift on fly-past path (fraction of overlay width). */
const CAMERA_OUTWARD = 0.06;

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function layoutScale() {
  if (typeof window === "undefined") return 1;
  const w = window.innerWidth;
  if (w <= 640) return 0.62;
  if (w <= 900) return 0.8;
  return 1;
}

function clusterTighten() {
  if (typeof window === "undefined") return 1;
  const w = window.innerWidth;
  if (w <= 640) return 0.78;
  if (w <= 900) return 0.9;
  return 1;
}

function resolveLayout(width: number, height: number): ResolvedCard[] {
  const cx = width / 2;
  const cy = height / 2;
  const sizeScale = layoutScale();
  const tighten = clusterTighten();
  const rem = Number.parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );

  return DESKTOP_LAYOUT.map((slot) => {
    const rawX = (slot.x / 100) * width;
    const rawY = (slot.y / 100) * height;
    const finalX = cx + (rawX - cx) * tighten;
    const finalY = cy + (rawY - cy) * tighten;
    const sideSign = Math.sign(finalX - cx) || 1;

    // Toward-camera point: enter comes from here, exit returns here (same path).
    const cameraX = finalX + sideSign * CAMERA_OUTWARD * width;
    const cameraY = finalY;

    return {
      finalX,
      finalY,
      cameraX,
      cameraY,
      sizePx: slot.size * rem * sizeScale,
      z: slot.z,
      rotation: slot.rotation,
      sideSign,
    };
  });
}

function buildTimeline(
  master: gsap.core.Timeline,
  cards: HTMLDivElement[],
  positions: ResolvedCard[],
  content: HTMLElement | null,
) {
  master.clear();

  const orderByX = [...positions.keys()].sort(
    (a, b) => (positions[a]?.finalX ?? 0) - (positions[b]?.finalX ?? 0),
  );
  // 3 leftmost + 3 rightmost
  const endIndices = [
    ...orderByX.slice(0, PULSE_END_COUNT),
    ...orderByX.slice(-PULSE_END_COUNT),
  ];

  // 1) Enter = reverse of exit: from toward-camera (large) → land at rest
  orderByX.forEach((index, order) => {
    const card = cards[index];
    const p = positions[index];
    if (!card || !p) return;

    master.fromTo(
      card,
      {
        x: p.cameraX,
        y: p.cameraY,
        scale: CAMERA_SCALE,
        autoAlpha: 0,
      },
      {
        x: p.finalX,
        y: p.finalY,
        scale: 1,
        autoAlpha: 1,
        duration: ENTER_DURATION,
        ease: "power2.out",
      },
      order * ENTER_STAGGER,
    );
  });

  const enterEnd = (orderByX.length - 1) * ENTER_STAGGER + ENTER_DURATION;

  // 2) Pulse left-end + right-end (6 cards): 1 → 1.08 → 1
  endIndices.forEach((index) => {
    const card = cards[index];
    if (!card) return;

    master.to(
      card,
      {
        scale: PULSE_SCALE,
        duration: PULSE_DURATION / 2,
        ease: "power1.out",
      },
      enterEnd,
    );
    master.to(
      card,
      {
        scale: 1,
        duration: PULSE_DURATION / 2,
        ease: "power1.in",
      },
      enterEnd + PULSE_DURATION / 2,
    );
  });

  const pulseEnd = enterEnd + PULSE_DURATION;
  const exitAt = pulseEnd + HOLD;

  // 3) Exit toward camera along the same path (scale up + fade)
  orderByX.forEach((index, order) => {
    const card = cards[index];
    const p = positions[index];
    if (!card || !p) return;

    master.to(
      card,
      {
        x: p.cameraX,
        y: p.cameraY,
        scale: CAMERA_SCALE,
        autoAlpha: 0,
        duration: EXIT_DURATION,
        ease: "power2.in",
      },
      exitAt + order * EXIT_STAGGER,
    );
  });

  const exitEnd =
    exitAt + (orderByX.length - 1) * EXIT_STAGGER + EXIT_DURATION;

  if (content) {
    master.to(
      content,
      {
        autoAlpha: 1,
        duration: REVEAL_DURATION,
        ease: "power1.out",
      },
      exitEnd - 0.1,
    );
  }
}

export function HomeHeroCardsAnimation() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const overlay = overlayRef.current;
      if (!overlay) return;

      const section = overlay.closest("section");
      if (!section) return;

      const content = section.querySelector<HTMLElement>("[data-hero-content]");
      const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
      if (cards.length === 0) return;

      if (prefersReducedMotion()) {
        gsap.set(cards, { autoAlpha: 0 });
        if (content) gsap.set(content, { autoAlpha: 1 });
        return;
      }

      if (content) gsap.set(content, { autoAlpha: 0 });

      let positions: ResolvedCard[] = [];

      const applyLayout = () => {
        const { width, height } = overlay.getBoundingClientRect();
        if (width <= 0 || height <= 0) return false;

        positions = resolveLayout(width, height);

        cards.forEach((card, index) => {
          const p = positions[index];
          if (!p) return;
          gsap.set(card, {
            width: p.sizePx,
            height: p.sizePx,
            xPercent: -50,
            yPercent: -50,
            left: 0,
            top: 0,
            x: p.cameraX,
            y: p.cameraY,
            scale: CAMERA_SCALE,
            rotation: p.rotation,
            zIndex: p.z,
            autoAlpha: 0,
            force3D: true,
            transformOrigin: "50% 50%",
          });
        });

        return true;
      };

      if (!applyLayout()) return;

      const parkAtStart = () => {
        cards.forEach((card, index) => {
          const p = positions[index];
          if (!p) return;
          gsap.set(card, {
            x: p.cameraX,
            y: p.cameraY,
            scale: CAMERA_SCALE,
            rotation: p.rotation,
            autoAlpha: 0,
          });
        });
        if (content) gsap.set(content, { autoAlpha: 0 });
      };

      const master = gsap.timeline({ paused: true });
      let hasPlayedForCurrentEntry = false;

      const play = () => {
        applyLayout();
        parkAtStart();
        buildTimeline(master, cards, positions, content);
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
          if (master.isActive()) return;
          applyLayout();
          if (!hasPlayedForCurrentEntry || master.progress() === 0) {
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
    <div ref={overlayRef} className={styles.overlay} aria-hidden="true">
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
            width={400}
            height={400}
            className={styles.cardImage}
            loading={index < 3 ? "eager" : "lazy"}
            sizes="(max-width: 640px) 16vw, 9rem"
          />
        </div>
      ))}
    </div>
  );
}
