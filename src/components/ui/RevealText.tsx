"use client";

import {
  useEffect,
  useRef,
  useState,
  type Ref,
} from "react";

import styles from "./RevealText.module.css";

function scheduleStateUpdate(fn: () => void) {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(fn);
  } else {
    window.setTimeout(fn, 0);
  }
}

type TextSegment = {
  text: string;
  emphasis?: boolean;
};

type RevealTextBaseProps = {
  className?: string;
  id?: string;
  staggerMs?: number;
  delayMs?: number;
  active?: boolean;
  variant?: "default" | "expressive";
};

type RevealTextWordsProps = RevealTextBaseProps & {
  mode: "words";
  segments: readonly TextSegment[];
  as?: "h1" | "h2" | "h3" | "p" | "div";
  wordClassName?: string;
  emphasisClassName?: string;
};

type RevealTextLinesProps = RevealTextBaseProps & {
  mode: "lines";
  lines: readonly string[];
  lineClassName?: string;
};

type RevealTextProps = RevealTextWordsProps | RevealTextLinesProps;

type WordToken = {
  word: string;
  emphasis: boolean;
};

const PUNCT_ONLY = /^[,.;:!?…]+$/;

function clusterWordsWithPunctuation(words: WordToken[]): WordToken[][] {
  const clusters: WordToken[][] = [];

  for (const token of words) {
    if (PUNCT_ONLY.test(token.word) && clusters.length > 0) {
      clusters[clusters.length - 1].push(token);
    } else {
      clusters.push([token]);
    }
  }

  return clusters;
}

function useRevealOnScroll(enabled: boolean) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      scheduleStateUpdate(() => setIsVisible(true));
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
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [enabled]);

  return { ref, isVisible };
}

function renderExpressiveWord(
  word: string,
  emphasis: boolean,
  index: number,
  emphasisClassName?: string,
  delayMs = 0,
  staggerMs = 50,
) {
  if (emphasis) {
    return (
      <strong
        key={`${word}-${index}`}
        className={`${styles.emphasisGroup} ${emphasisClassName ?? ""}`.trim()}
      >
        {word.split("").map((char, charIndex) => (
          <span key={`${word}-${charIndex}`} className={styles.charWrapper}>
            <span
              className={styles.char}
              style={{
                animationDelay: `${delayMs + index * staggerMs + charIndex * 28}ms`,
              }}
            >
              {char}
            </span>
          </span>
        ))}
      </strong>
    );
  }

  return (
    <span key={`${word}-${index}`} className={styles.wordWrapper}>
      <span
        className={styles.word}
        style={{
          animationDelay: `${delayMs + index * staggerMs}ms`,
        }}
      >
        {word}
      </span>
    </span>
  );
}

function renderDefaultWord(
  word: string,
  emphasis: boolean,
  index: number,
  wordClassName?: string,
  emphasisClassName?: string,
  delayMs = 0,
  staggerMs = 45,
) {
  const WordTag = emphasis ? "strong" : "span";
  const wordTagClassName = emphasis ? emphasisClassName : wordClassName;

  return (
    <span key={`${word}-${index}`}>
      <span className={styles.wordWrapper}>
        <WordTag
          className={`${styles.word} ${wordTagClassName ?? ""}`.trim()}
          style={{
            transitionDelay: `${delayMs + index * staggerMs}ms`,
          }}
        >
          {word}
        </WordTag>
      </span>
    </span>
  );
}

export function RevealText(props: RevealTextProps) {
  const {
    className,
    id,
    staggerMs,
    delayMs = 0,
    active,
    variant = "default",
  } = props;

  const usesExternalTrigger = active !== undefined;
  const { ref, isVisible: scrollVisible } = useRevealOnScroll(!usesExternalTrigger);
  const isVisible = active ?? scrollVisible;

  const resolvedStaggerMs =
    staggerMs ?? (variant === "expressive" ? 58 : 45);

  const containerClassName = [
    styles.container,
    variant === "expressive" ? styles.expressive : "",
    isVisible ? styles.visible : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (props.mode === "words") {
    const {
      segments,
      as: Component = "div",
      wordClassName,
      emphasisClassName,
    } = props;

    const words = segments.flatMap((segment) =>
      segment.text
        .split(" ")
        .filter(Boolean)
        .map((word) => ({
          word,
          emphasis: Boolean(segment.emphasis),
        })),
    );
    const clusters = clusterWordsWithPunctuation(words);
    let wordIndex = 0;

    return (
      <Component
        ref={usesExternalTrigger ? undefined : (ref as never)}
        id={id}
        className={containerClassName}
        data-revealed={isVisible ? "true" : undefined}
      >
        {clusters.map((cluster, clusterIndex) => {
          const nodes = cluster.map((token) => {
            const index = wordIndex;
            wordIndex += 1;

            return variant === "expressive"
              ? renderExpressiveWord(
                  token.word,
                  token.emphasis,
                  index,
                  emphasisClassName,
                  delayMs,
                  resolvedStaggerMs,
                )
              : renderDefaultWord(
                  token.word,
                  token.emphasis,
                  index,
                  wordClassName,
                  emphasisClassName,
                  delayMs,
                  resolvedStaggerMs,
                );
          });

          return (
            <span key={`cluster-${clusterIndex}`}>
              {cluster.length > 1 ? (
                <span className={styles.keepTogether}>{nodes}</span>
              ) : (
                nodes
              )}
              {clusterIndex < clusters.length - 1 ? (
                <span className={styles.wordSpace}> </span>
              ) : null}
            </span>
          );
        })}
      </Component>
    );
  }

  const { lines, lineClassName } = props;
  const lineStaggerMs = resolvedStaggerMs;

  return (
    <div
      ref={usesExternalTrigger ? undefined : (ref as Ref<HTMLDivElement>)}
      id={id}
      className={containerClassName}
      data-revealed={isVisible ? "true" : undefined}
    >
      {lines.map((line, lineIndex) => {
        const lineBaseDelay =
          delayMs + lineIndex * (variant === "expressive" ? 280 : lineStaggerMs);

        return (
          <p key={line} className={lineClassName}>
            <span className={styles.lineWrapper}>
              {variant === "expressive" ? (
                <span className={styles.line}>
                  {line
                    .split(" ")
                    .filter(Boolean)
                    .map((word, wordIndex, words) => {
                      const charOffset = words
                        .slice(0, wordIndex)
                        .reduce((sum, part) => sum + part.length + 1, 0);

                      return (
                        <span key={`word-${lineIndex}-${wordIndex}`}>
                          <span className={styles.lineWord}>
                            {word.split("").map((char, charIndex) => (
                              <span
                                key={`char-${lineIndex}-${wordIndex}-${charIndex}`}
                                className={styles.lineChar}
                              >
                                <span
                                  className={styles.lineCharInner}
                                  style={{
                                    animationDelay: `${
                                      lineBaseDelay +
                                      (charOffset + charIndex) * 22
                                    }ms`,
                                  }}
                                >
                                  {char}
                                </span>
                              </span>
                            ))}
                          </span>
                          {wordIndex < words.length - 1 ? (
                            <span className={styles.lineCharSpace}> </span>
                          ) : null}
                        </span>
                      );
                    })}
                </span>
              ) : (
                <span
                  className={styles.line}
                  style={{
                    transitionDelay: `${lineBaseDelay}ms`,
                  }}
                >
                  {line}
                </span>
              )}
            </span>
          </p>
        );
      })}
    </div>
  );
}
