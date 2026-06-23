import type { StaticImageData } from "next/image";

import heroBanner1 from "../../public/assets/home/banner_-1750-x-851px/1.jpg";
import heroBanner2 from "../../public/assets/home/banner_-1750-x-851px/2.jpg";
import heroBanner3 from "../../public/assets/home/banner_-1750-x-851px/3.jpg";
import heroBanner4 from "../../public/assets/home/banner_-1750-x-851px/4.jpg";
import heroBanner5 from "../../public/assets/home/banner_-1750-x-851px/5.jpg";
import featuredWork1 from "../../public/assets/home/square-images_-1024-x-1024px/s1.jpg";
import featuredWork2 from "../../public/assets/home/square-images_-1024-x-1024px/s2.jpg";
import featuredWork3 from "../../public/assets/home/square-images_-1024-x-1024px/s3.jpg";
import featuredWork4 from "../../public/assets/home/square-images_-1024-x-1024px/s4.jpg";
import featuredWork5 from "../../public/assets/home/square-images_-1024-x-1024px/s5.jpg";
import featuredWork6 from "../../public/assets/home/square-images_-1024-x-1024px/s6.jpg";

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

export type FeaturedWorkItem = {
  slug: string;
  title: string;
  image: StaticImageData;
  alt: string;
};

export const featuredWorkItems: FeaturedWorkItem[] = [
  {
    slug: "atelier-noir",
    title: "Atelier Noir",
    image: featuredWork1,
    alt: "Atelier Noir brand identity — minimal packaging and label design",
  },
  {
    slug: "verde-co",
    title: "Verde Co.",
    image: featuredWork2,
    alt: "Verde Co. visual identity — botanical product photography and branding",
  },
  {
    slug: "northline",
    title: "Northline",
    image: featuredWork3,
    alt: "Northline packaging design — clean geometric product boxes",
  },
  {
    slug: "form-studio",
    title: "Form Studio",
    image: featuredWork4,
    alt: "Form Studio brand applications — editorial layout and stationery",
  },
  {
    slug: "lumen",
    title: "Lumen",
    image: featuredWork5,
    alt: "Lumen digital brand experience — refined interface and typography",
  },
  {
    slug: "harbor-house",
    title: "Harbor House",
    image: featuredWork6,
    alt: "Harbor House identity — warm hospitality branding and collateral",
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
