"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SiteCursor.module.css";

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, textarea, select, label[for], [data-work-card], summary";

const LIGHT_CONTRAST_SELECTOR = '[data-cursor-contrast="light"]';

const CURSOR_NONE_CLASS = "site-cursor-none";

export function SiteCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const onInteractiveRef = useRef(false);
  const lightContrastRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const pendingPosRef = useRef<{ x: number; y: number } | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [onInteractive, setOnInteractive] = useState(false);
  const [lightContrast, setLightContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const sync = () => setEnabled(mediaQuery.matches);
    sync();

    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove(CURSOR_NONE_CLASS);
      return;
    }

    document.documentElement.classList.add(CURSOR_NONE_CLASS);
    return () => {
      document.documentElement.classList.remove(CURSOR_NONE_CLASS);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const applyCursorPosition = (clientX: number, clientY: number) => {
      const cursor = cursorRef.current;
      if (!cursor) return;
      cursor.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
    };

    const scheduleCursorPosition = (clientX: number, clientY: number) => {
      pendingPosRef.current = { x: clientX, y: clientY };
      if (rafIdRef.current !== null) return;

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        const next = pendingPosRef.current;
        if (!next) return;
        applyCursorPosition(next.x, next.y);
      });
    };

    const syncInteractiveHover = (target: EventTarget | null) => {
      const overInteractive = Boolean(
        target instanceof Element && target.closest(INTERACTIVE_SELECTOR),
      );
      if (overInteractive === onInteractiveRef.current) return;
      onInteractiveRef.current = overInteractive;
      setOnInteractive(overInteractive);
    };

    const syncLightContrast = (target: EventTarget | null) => {
      const overLight = Boolean(
        target instanceof Element && target.closest(LIGHT_CONTRAST_SELECTOR),
      );
      if (overLight === lightContrastRef.current) return;
      lightContrastRef.current = overLight;
      setLightContrast(overLight);
    };

    const handlePointerMove = (event: PointerEvent) => {
      setVisible(true);
      scheduleCursorPosition(event.clientX, event.clientY);
      syncInteractiveHover(event.target);
      syncLightContrast(event.target);
    };

    const handlePointerLeave = (event: PointerEvent) => {
      // pointerleave on document fires when leaving the viewport
      if (event.relatedTarget !== null) return;
      setVisible(false);
      onInteractiveRef.current = false;
      setOnInteractive(false);
      lightContrastRef.current = false;
      setLightContrast(false);
      pendingPosRef.current = null;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setVisible(false);
        onInteractiveRef.current = false;
        setOnInteractive(false);
        lightContrastRef.current = false;
        setLightContrast(false);
      }
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.documentElement.addEventListener(
      "pointerleave",
      handlePointerLeave,
    );
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      className={[
        styles.cursor,
        visible ? styles.cursorVisible : "",
        onInteractive ? styles.cursorExpanded : "",
        lightContrast ? styles.cursorLight : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    />
  );
}
