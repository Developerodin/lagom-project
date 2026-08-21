import type { StaticImageData } from "next/image";

import aboutHeroImage from "../../public/assets/about/hero.jpg";
import founderPortraitImage from "../../public/assets/about/founder-portrait.png";
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

export type TheStudioTextSegment = {
  text: string;
  emphasis: boolean;
};

export type TheStudioSectionContent = {
  title: {
    line1: string;
    line2: string;
  };
  paragraphs: Array<string | ReadonlyArray<TheStudioTextSegment>>;
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
    [
      {
        text: 'Lagom Design is a creative studio dedicated to building thoughtful, visually refined brands rooted in the philosophy of "',
        emphasis: false,
      },
      { text: "just the right amount.", emphasis: true },
      {
        text: '" We believe great design is not about excess, but about clarity, balance, and intention.',
        emphasis: false,
      },
    ],
    "Specializing in brand identities, packaging, and visual systems, we create work that feels effortless yet distinctive, combining strategy with aesthetics to tell meaningful brand stories.",
    "Our approach is simple, collaborative, and detail-driven, focusing on timeless design that connects and evolves rather than follows trends. At Lagom, we don't overdesign or overcomplicate - we create what feels right.",
  ],
  image: {
    src: studioPortraitImage,
    alt: "Lagom Design studio workspace with a laptop and notebooks",
  },
};

export type FoundersDeskSectionContent = {
  title: string;
  name: string;
  paragraphs: readonly string[];
  image?: {
    src: StaticImageData;
    alt: string;
  };
};

export const foundersDeskSectionContent: FoundersDeskSectionContent = {
  title: "From the Founder's Desk",
  name: "Radhika Kalani",
  paragraphs: [
    "Lagom Design Studio grew out of a journey that started with curiosity and a love for design.",
    "I graduated in Fashion Design, but my creative journey eventually led me towards graphic design. As a self-taught designer, I learned through exploring, experimenting, and constantly pushing myself to understand the craft better. My early experience with design agencies gave me a strong foundation, while freelancing allowed me to work closely with brands and founders and discover my own approach to design.",
    "Somewhere along the way, the thought of creating a space of my own took shape - one where I could bring together everything I had learned and work closely with the people behind each brand. That's how Lagom Design Studio came to life.",
    "For me, design has never been just about making something look good. It is about finding the right balance between creativity and purpose. Lagom is a reflection of how I like to work: with curiosity, intention, attention to detail, and a genuine connection with the people behind every project. I believe the best work comes from taking the time to understand, explore, and refine until everything feels just right.",
    "Today, Lagom is my space to create thoughtful, distinctive brands with purpose - one idea, one story, and one brand at a time.",
  ],
  image: {
    src: founderPortraitImage,
    alt: "Portrait of Radhika Kalani, founder of Lagom Design Studio",
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
