import type { StaticImageData } from "next/image";

import heroBanner1 from "../../public/assets/home/banner_-1750-x-851px/1.jpg";
import heroBanner2 from "../../public/assets/home/banner_-1750-x-851px/2.jpg";
import heroBanner3 from "../../public/assets/home/banner_-1750-x-851px/3.jpg";
import heroBanner4 from "../../public/assets/home/banner_-1750-x-851px/4.jpg";
import heroBanner5 from "../../public/assets/home/banner_-1750-x-851px/5.jpg";

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
