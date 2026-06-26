import Image from "next/image";
import type { StaticImageData } from "next/image";

import philosophyOne from "../../../public/assets/home/philosophy/p1.png";
import philosophyTwo from "../../../public/assets/home/philosophy/p2.png";
import philosophyThree from "../../../public/assets/home/philosophy/p3.png";
import philosophyFour from "../../../public/assets/home/philosophy/p4.png";
import philosophyFive from "../../../public/assets/home/philosophy/p5.png";
import philosophySix from "../../../public/assets/home/philosophy/p6.png";

import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import styles from "./OurPhilosophySection.module.css";

type PhilosophyCard = {
  id: string;
  image: StaticImageData;
  alt: string;
};

const philosophyCards: PhilosophyCard[] = [
  {
    id: "philosophy-1",
    image: philosophyOne,
    alt: "Design should always have a reason — never just decoration",
  },
  {
    id: "philosophy-2",
    image: philosophyTwo,
    alt: "Strong design comes from knowing what to add — and what to remove",
  },
  {
    id: "philosophy-3",
    image: philosophyThree,
    alt: "Every strong design begins with clear thinking",
  },
  {
    id: "philosophy-4",
    image: philosophyFour,
    alt: "Simplicity that speaks — it is not empty, it is clarity",
  },
  {
    id: "philosophy-5",
    image: philosophyFive,
    alt: "We design brands that stay relevant long after trends fade",
  },
  {
    id: "philosophy-6",
    image: philosophySix,
    alt: "Design works best when everything feels balanced — not excessive",
  },
];

export function OurPhilosophySection() {
  return (
    <RevealOnScroll
      as="section"
      className={styles.section}
      aria-labelledby="our-philosophy-title"
    >
      <div className="container">
        <h2
          id="our-philosophy-title"
          className={`heading-section ${styles.heading}`}
        >
          OUR PHILOSOPHY
        </h2>

        <ul className={styles.grid}>
          {philosophyCards.map((card) => (
            <li key={card.id} className={styles.card}>
              <Image
                src={card.image}
                alt={card.alt}
                width={800}
                height={800}
                className={styles.image}
                sizes="(min-width: 993px) 33vw, (min-width: 769px) 33vw, 50vw"
              />
            </li>
          ))}
        </ul>
      </div>
    </RevealOnScroll>
  );
}
