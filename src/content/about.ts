import type { StaticImageData } from "next/image";

import aboutHeroImage from "../../public/assets/about/hero.jpg";
import studioPortraitImage from "../../public/assets/about/studio-portrait.png";
import aboutCtaCollageImage from "../../public/assets/about/cta-collage.png";

export type AboutHeroContent = {
  image: StaticImageData;
  alt: string;
};

export const aboutHeroContent: AboutHeroContent = {
  image: aboutHeroImage,
  alt: "A laptop on a green velvet sofa displaying Lagom Design — Design, the Lagom Way. A studio that speaks in visuals.",
};

export type TheStudioSectionContent = {
  title: {
    line1: string;
    line2: string;
  };
  paragraphs: string[];
  image: {
    src: StaticImageData;
    alt: string;
  };
};

export const theStudioSectionContent: TheStudioSectionContent = {
  title: {
    line1: "THE",
    line2: "STUDIO",
  },
  paragraphs: [
    "Lagom Design is a creative studio dedicated to building thoughtful, visually refined brands rooted in the philosophy of \"just the right amount.\" We believe great design is not about excess, but about clarity, balance, and intention.",
    "Specializing in brand identities, packaging, and visual systems, we create work that feels effortless yet distinctive, combining strategy with aesthetics to tell meaningful brand stories.",
    "Our approach is simple, collaborative, and detail-driven, focusing on timeless design that connects and evolves rather than follows trends. At Lagom, we don't overdesign or overcomplicate - we create what feels right.",
  ],
  image: {
    src: studioPortraitImage,
    alt: "Lagom Design studio workspace with a laptop and notebooks",
  },
};

export const aboutCtaContent = {
  headline: {
    line1: [
      { text: "Let's ", emphasis: false },
      { text: "build", emphasis: true },
      { text: " something", emphasis: false },
    ],
    line2: [
      { text: "that feels just ", emphasis: false },
      { text: "right", emphasis: true },
      { text: ".", emphasis: false },
    ],
  },
  cta: {
    label: "Start a Project",
    href: "/contact",
  },
  collage: {
    src: aboutCtaCollageImage,
    alt: "Lagom Design packaging and brand work collage",
  },
} as const;
