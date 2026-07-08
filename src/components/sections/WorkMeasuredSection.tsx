"use client";

import { useEffect, useRef, useState } from "react";

import { workMeasuredContent } from "@/content/home";
import styles from "./WorkMeasuredSection.module.css";

function scheduleStateUpdate(fn: () => void) {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(fn);
  } else {
    window.setTimeout(fn, 0);
  }
}

type ParsedStatValue = {
  target: number;
  suffix: string;
};

function parseStatValue(value: string): ParsedStatValue {
  const match = value.match(/^(\d+)(.*)$/);

  if (!match) {
    return { target: 0, suffix: value };
  }

  return {
    target: Number.parseInt(match[1], 10),
    suffix: match[2],
  };
}

type AnimatedStatValueProps = {
  value: string;
  start: boolean;
  delay?: number;
};

function AnimatedStatValue({
  value,
  start,
  delay = 0,
}: AnimatedStatValueProps) {
  const { target, suffix } = parseStatValue(value);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!start) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      scheduleStateUpdate(() => setDisplay(target));
      return;
    }

    let frameId = 0;
    let timeoutId = 0;
    const duration = 1400;

    const runCount = (startTime: number) => {
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - (1 - progress) ** 3;

        setDisplay(Math.round(eased * target));

        if (progress < 1) {
          frameId = window.requestAnimationFrame(tick);
        }
      };

      frameId = window.requestAnimationFrame(tick);
    };

    timeoutId = window.setTimeout(() => {
      runCount(performance.now());
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(frameId);
    };
  }, [delay, start, target]);

  return (
    <p className={styles.statValue} aria-label={value}>
      {display}
      {suffix}
    </p>
  );
}

export function WorkMeasuredSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const { title, stats, approaches } = workMeasuredContent;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      scheduleStateUpdate(() => setIsRevealed(true));
      return;
    }

    const node = sectionRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const sectionClassName = [
    styles.section,
    isRevealed ? styles.revealed : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      ref={sectionRef}
      className={sectionClassName}
      aria-labelledby="work-measured-title"
      data-revealed={isRevealed ? "true" : undefined}
    >
      <div className="container">
        <h2 id="work-measured-title" className={styles.heading}>
          {title}
        </h2>

        <div className={styles.grid}>
          <ul className={styles.statsRow} aria-label="Studio metrics">
            {stats.map((stat, index) => (
              <li
                key={stat.id}
                className={styles.statCard}
                style={{ transitionDelay: `${index * 110}ms` }}
              >
                <AnimatedStatValue
                  value={stat.value}
                  start={isRevealed}
                  delay={index * 110}
                />
                <p className={styles.statLabel}>{stat.label}</p>
              </li>
            ))}
          </ul>

          <ul className={styles.approachRow} aria-label="Studio approach">
            {approaches.map((approach, index) => (
              <li
                key={approach.id}
                className={styles.approachCard}
                style={{
                  transitionDelay: `${(stats.length + index) * 110}ms`,
                }}
              >
                <h3 className={styles.approachTitle}>{approach.title}</h3>
                <p className={`body ${styles.approachBody}`}>{approach.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
