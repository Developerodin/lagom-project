import type { StaticImageData } from "next/image";

import heroBanner1 from "../../public/assets/home/banner_-1750-x-851px/1.jpg";
import heroBanner2 from "../../public/assets/home/banner_-1750-x-851px/2.jpg";
import heroBanner3 from "../../public/assets/home/banner_-1750-x-851px/3.jpg";
import heroBanner4 from "../../public/assets/home/banner_-1750-x-851px/4.jpg";
import heroBanner5 from "../../public/assets/home/banner_-1750-x-851px/5.jpg";
import slidingStrip2Image1 from "../../public/assets/home/sliding-strip-2/1.jpg";
import slidingStrip2Image2 from "../../public/assets/home/sliding-strip-2/2.jpg";
import slidingStrip2Image3 from "../../public/assets/home/sliding-strip-2/3.jpg";
import slidingStrip2Image4 from "../../public/assets/home/sliding-strip-2/4.jpg";
import slidingStrip2Image5 from "../../public/assets/home/sliding-strip-2/5.jpg";

export type HeroBannerSlide = {
  id: string;
  image: StaticImageData;
  alt: string;
};

export const heroBannerSlides: HeroBannerSlide[] = [
  {
    id: "banner-1",
    image: heroBanner1,
    alt: "Lagom Design — editorial brand identity and packaging showcase",
  },
  {
    id: "banner-2",
    image: heroBanner2,
    alt: "Lagom Design — thoughtful packaging and brand applications",
  },
  {
    id: "banner-3",
    image: heroBanner3,
    alt: "Lagom Design — minimal digital brand experience",
  },
  {
    id: "banner-4",
    image: heroBanner4,
    alt: "Lagom Design — considered visual identity work",
  },
  {
    id: "banner-5",
    image: heroBanner5,
    alt: "Lagom Design — purposeful brand design portfolio",
  },
];

export const workMeasuredContent = {
  title: "The work, measured.",
  stats: [
    {
      id: "brands-built",
      value: "50+",
      label: "Brands built from scratch",
    },
    {
      id: "industries",
      value: "8+",
      label: "Industries worked across",
    },
    {
      id: "projects",
      value: "100+",
      label: "Projects delivered",
    },
    {
      id: "return-clients",
      value: "80%",
      label: "Clients who came back",
    },
  ],
  approaches: [
    {
      id: "strategy-first",
      title: "Strategy-first",
      body: "Every engagement begins with understanding - not a moodboard. We do the thinking before we do the designing.",
    },
    {
      id: "design-led",
      title: "Design-led",
      body: "Strategy and visual identity are not two separate conversations in our studio. They happen together, by design.",
    },
    {
      id: "end-to-end",
      title: "End-to-end",
      body: "From brand brief to final guidelines - one studio, one vision. Zero handoffs to an agency you've never met.",
    },
  ],
} as const;

export const homeHeroContent = {
  headlineLead: "Designing brands",
  headlineAccent: "people choose.",
  body: "We create strategic brand identities, packaging and digital experiences that help businesses earn trust, build recognition and grow with confidence.",
  primaryCta: {
    label: "Start a project",
    href: "/contact",
  },
  secondaryCta: {
    label: "View our work",
    href: "/work",
  },
} as const;

export type HomeHeroCard = {
  id: string;
  src: string;
  alt: string;
};

export const homeHeroCards: HomeHeroCard[] = [
  {
    id: "hero-card-01",
    src: "/assets/home/hero-cards/01.png",
    alt: "",
  },
  {
    id: "hero-card-02",
    src: "/assets/home/hero-cards/02.png",
    alt: "",
  },
  {
    id: "hero-card-03",
    src: "/assets/home/hero-cards/03.png",
    alt: "",
  },
  {
    id: "hero-card-04",
    src: "/assets/home/hero-cards/04.png",
    alt: "",
  },
  {
    id: "hero-card-05",
    src: "/assets/home/hero-cards/05.png",
    alt: "",
  },
  {
    id: "hero-card-06",
    src: "/assets/home/hero-cards/06.png",
    alt: "",
  },
  {
    id: "hero-card-07",
    src: "/assets/home/hero-cards/07.png",
    alt: "",
  },
  {
    id: "hero-card-08",
    src: "/assets/home/hero-cards/08.png",
    alt: "",
  },
  {
    id: "hero-card-09",
    src: "/assets/home/hero-cards/09.png",
    alt: "",
  },
  {
    id: "hero-card-10",
    src: "/assets/home/hero-cards/10.png",
    alt: "",
  },
];

export const brandStatementContent = {
  headline: [
    { text: "We craft ", emphasis: false },
    { text: "brand identities", emphasis: true },
    { text: ", thoughtful ", emphasis: false },
    { text: "packaging", emphasis: true },
    { text: " and ", emphasis: false },
    { text: "digital experiences", emphasis: true },
    { text: " that are clear, purposeful and built to last.", emphasis: false },
  ],
  taglines: [
    "Balanced brands. Intentional design.",
    "Minimal · Powerful · Memorable",
  ],
} as const;

export const balanceFoundContent = {
  captions: ["Too little", "Balance, found", "Too much"] as const,
} as const;

export type SlidingImageItem = {
  id: string;
  src: StaticImageData;
  alt: string;
};

const slidingStripOneImages = [
  {
    src: heroBanner1,
    alt: "Mumbai-inspired coaster set with illustrated city landmarks and typography",
  },
  {
    src: heroBanner2,
    alt: "Kaahu tea canister collection arranged with glassware and dried botanicals",
  },
  {
    src: heroBanner3,
    alt: "SAMAH wellness packaging — seed cycling pouches, saffron, and shilajit",
  },
  {
    src: heroBanner4,
    alt: "Organic Yellow honey sticks — litchi, blueberry, and jamun flavor range",
  },
  {
    src: heroBanner5,
    alt: "Whimsy tropical gift sets with makeup brushes and pastel beauty accessories",
  },
] as const;

const slidingStripTwoImages = [
  {
    src: slidingStrip2Image1,
    alt: "SAVÉUR artisanal chocolate packaging with gold foil lettering",
  },
  {
    src: slidingStrip2Image2,
    alt: "Zaatar Mediterranean takeout packaging suite in burgundy and cream",
  },
  {
    src: slidingStrip2Image3,
    alt: "Wow Idli yellow packaging with South Indian illustrated motifs",
  },
  {
    src: slidingStrip2Image4,
    alt: "genes Beauty skincare range — facewash, cream, and sunscreen products",
  },
  {
    src: slidingStrip2Image5,
    alt: "The Godavari Icecream cone packaging pattern on yellow",
  },
] as const;

export const slidingImagesContent = {
  rowOne: slidingStripOneImages.map((item, index) => ({
    id: `slide-1-${index + 1}`,
    ...item,
  })) satisfies SlidingImageItem[],
  rowTwo: slidingStripTwoImages.map((item, index) => ({
    id: `slide-2-${index + 1}`,
    ...item,
  })) satisfies SlidingImageItem[],
} as const;
