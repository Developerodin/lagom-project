import type { StaticImageData } from "next/image";

import aboutHeroImage from "../../public/assets/about/hero.jpg";
import studioPortraitImage from "../../public/assets/about/studio-portrait.png";
import collageS1 from "../../public/assets/home/square-images_-1024-x-1024px/s1.jpg";
import collageS2 from "../../public/assets/home/square-images_-1024-x-1024px/s2.jpg";
import collageS3 from "../../public/assets/home/square-images_-1024-x-1024px/s3.jpg";
import collageS4 from "../../public/assets/home/square-images_-1024-x-1024px/s4.jpg";
import collageS5 from "../../public/assets/home/square-images_-1024-x-1024px/s5.jpg";
import collageS6 from "../../public/assets/home/square-images_-1024-x-1024px/s6.jpg";
import collageB1 from "../../public/assets/home/banner_-1750-x-851px/1.jpg";
import collageB2 from "../../public/assets/home/banner_-1750-x-851px/2.jpg";
import collageB3 from "../../public/assets/home/banner_-1750-x-851px/3.jpg";
import collageB4 from "../../public/assets/home/banner_-1750-x-851px/4.jpg";

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
    alt: "Lagom Design studio workspace with a laptop displaying brand design work",
  },
};

export type AboutCtaCollageItem = {
  id: string;
  src: StaticImageData;
  alt: string;
};

export const aboutCtaCollageItems: AboutCtaCollageItem[] = [
  {
    id: "s1",
    src: collageS1,
    alt: "Skincare product packaging design",
  },
  {
    id: "s2",
    src: collageS2,
    alt: "Illustrated tote bag brand application",
  },
  {
    id: "s3",
    src: collageS3,
    alt: "Colorful spice tin packaging lineup",
  },
  {
    id: "s4",
    src: collageS4,
    alt: "Architectural brand photography",
  },
  {
    id: "s5",
    src: collageS5,
    alt: "NOCK NOCK branded packaging box",
  },
  {
    id: "s6",
    src: collageS6,
    alt: "Saffron product packaging design",
  },
  {
    id: "b1",
    src: collageB1,
    alt: "WOW IDLI food brand packaging",
  },
  {
    id: "b2",
    src: collageB2,
    alt: "Hair care product bottle design",
  },
  {
    id: "b3",
    src: collageB3,
    alt: "SAVEUR luxury packaging box",
  },
  {
    id: "b4",
    src: collageB4,
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
