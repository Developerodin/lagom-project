"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import styles from "./FeaturedWorkCursor.module.css";

type FeaturedWorkCursorProps = {
  children: ReactNode;
  className?: string;
};

export function FeaturedWorkCursor({
  children,
  className,
}: FeaturedWorkCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const onCardRef = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [onCard, setOnCard] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const sync = () => setEnabled(mediaQuery.matches);
    sync();

    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  const updateCursorPosition = (clientX: number, clientY: number) => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    cursor.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
  };

  const syncCardHover = (target: EventTarget | null) => {
    const overCard = Boolean(
      target instanceof Element && target.closest("[data-work-card]"),
    );
    if (overCard === onCardRef.current) return;
    onCardRef.current = overCard;
    setOnCard(overCard);
  };

  const handlePointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    setVisible(true);
    updateCursorPosition(event.clientX, event.clientY);
    syncCardHover(event.target);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    updateCursorPosition(event.clientX, event.clientY);
    syncCardHover(event.target);
  };

  const handlePointerLeave = () => {
    setVisible(false);
    onCardRef.current = false;
    setOnCard(false);
  };

  return (
    <div
      className={[
        className,
        enabled ? styles.zone : "",
        enabled && visible ? styles.zoneActive : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
      {enabled ? (
        <div
          ref={cursorRef}
          className={[
            styles.cursor,
            visible ? styles.cursorVisible : "",
            onCard ? styles.cursorExpanded : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
