"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type PauseOffscreenProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/**
 * Marks itself with data-paused when off-screen so CSS can pause
 * continuous animations (marquees) without visual change when visible.
 */
export function PauseOffscreen({
  children,
  className,
  style,
}: PauseOffscreenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setPaused(!entry.isIntersecting);
      },
      { rootMargin: "80px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      data-paused={paused ? "true" : undefined}
    >
      {children}
    </div>
  );
}
