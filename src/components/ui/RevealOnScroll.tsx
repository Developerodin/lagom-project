"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ElementType,
  type Ref,
} from "react";
import styles from "./RevealOnScroll.module.css";

type RevealElement = "div" | "section" | "li" | "nav" | "footer" | "article";

type RevealOnScrollProps<T extends RevealElement = "div"> = {
  as?: T;
  delay?: number;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "delay" | "className">;

export function RevealOnScroll<T extends RevealElement = "div">({
  as,
  delay = 0,
  className,
  style,
  children,
  ...rest
}: RevealOnScrollProps<T>) {
  const Component = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const revealClassName = [
    styles.reveal,
    isVisible ? styles.visible : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component
      ref={ref as Ref<HTMLElement>}
      className={revealClassName}
      data-revealed={isVisible ? "true" : undefined}
      style={{
        ...style,
        ...(delay > 0 ? { transitionDelay: `${delay}ms` } : undefined),
      }}
      {...rest}
    >
      {children}
    </Component>
  );
}
