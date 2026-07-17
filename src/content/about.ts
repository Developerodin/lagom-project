import type { StaticImageData } from "next/image";

import aboutHeroImage from "../../public/assets/about/hero.jpg";
import studioPortraitImage from "../../public/assets/about/studio-portrait.png";
import collage4 from "../../public/assets/about/4.jpg";
import collage5 from "../../public/assets/about/5.jpg";
import collage6 from "../../public/assets/about/6.jpg";
import collage7 from "../../public/assets/about/7.jpg";
import collage8 from "../../public/assets/about/8.jpg";
import collage9 from "../../public/assets/about/9.jpg";
import collage10 from "../../public/assets/about/10.jpg";
import collage11 from "../../public/assets/about/11.jpg";
import collage12 from "../../public/assets/about/12.jpg";
import collage13 from "../../public/assets/about/13.jpg";

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

export type AboutCtaCollageItem = {
  id: string;
  src: StaticImageData;
  alt: string;
};

export type AboutCtaCollageColumn = {
  id: string;
  itemIds: readonly string[];
  leadingEmptySlots?: number;
  wide?: boolean;
};

export const aboutCtaCollageColumns: AboutCtaCollageColumn[] = [
  { id: "col1", itemIds: ["s1", "s5", "b2"] },
  { id: "col2", itemIds: ["s2", "s3", "s6", "b3"], leadingEmptySlots: 1, wide: true },
  { id: "col3", itemIds: ["s4", "b1", "b4"], leadingEmptySlots: 2 },
];

export const aboutCtaCollageItems: AboutCtaCollageItem[] = [
  {
    id: "s1",
    src: collage4,
    alt: "Skincare product packaging design",
  },
  {
    id: "s2",
    src: collage5,
    alt: "Illustrated tote bag brand application",
  },
  {
    id: "s3",
    src: collage6,
    alt: "Colorful spice tin packaging lineup",
  },
  {
    id: "s4",
    src: collage7,
    alt: "Saffron product packaging design",
  },
  {
    id: "s5",
    src: collage8,
    alt: "Architectural brand photography",
  },
  {
    id: "s6",
    src: collage9,
    alt: "NOCK NOCK branded packaging box",
  },
  {
    id: "b1",
    src: collage10,
    alt: "WOW IDLI food brand packaging",
  },
  {
    id: "b2",
    src: collage11,
    alt: "Hair care product bottle design",
  },
  {
    id: "b3",
    src: collage12,
    alt: "SAVEUR luxury packaging box",
  },
  {
    id: "b4",
    src: collage13,
    alt: "Restaurant interior brand signage",
  },
];

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
} as const;
