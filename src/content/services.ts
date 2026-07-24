import type { StaticImageData } from "next/image";

import brandingImagePrimary from "../../public/assets/services/b1.png";
import brandingImageSecondary from "../../public/assets/services/b2.png";
import packagingImagePrimary from "../../public/assets/services/p1.png";
import packagingImageSecondary from "../../public/assets/services/p2.png";
import webDesignImagePrimary from "../../public/assets/services/w1.png";
import webDesignImageSecondary from "../../public/assets/services/w2.png";
import socialMediaImagePrimary from "../../public/assets/services/s1.png";
import socialMediaImageSecondary from "../../public/assets/services/s2.png";
import illustrationsImagePrimary from "../../public/assets/services/i1.png";
import illustrationsImageSecondary from "../../public/assets/services/i2.png";
import processIconUnderstand from "../../public/assets/home/icons_-150-x-150px/understand.png";
import processIconExplore from "../../public/assets/home/icons_-150-x-150px/explore.png";
import processIconDefine from "../../public/assets/home/icons_-150-x-150px/define.png";
import processIconDesign from "../../public/assets/home/icons_-150-x-150px/design.png";
import processIconFinalise from "../../public/assets/home/icons_-150-x-150px/finalise.png";

export const brandingSectionContent = {
  title: "Branding",
  paragraphs: [
    "We create thoughtful brand identities built on clarity, intention, and longevity. Each element — from logo to typography and color — is designed as part of a cohesive system that feels distinctive and adaptable across touchpoints.",
    "We focus on simplifying complexity, ensuring your brand communicates with confidence and consistency.",
  ],
  cta: {
    label: "Get Started",
    href: "/contact",
  },
  images: {
    primary: {
      src: brandingImagePrimary,
      alt: "Artisanal chocolate branding — packaging and business card on a dark surface",
    },
    secondary: {
      src: brandingImageSecondary,
      alt: "SAMāH brand identity — mountain logo on a teal background",
    },
  },
} as const;

export const packagingSectionContent = {
  title: "Packaging Design",
  paragraphs: [
    "Packaging that balances aesthetics with purpose — designed to not only look refined but also function seamlessly in real-world contexts.",
    "We consider structure, material, and visual hierarchy to create packaging that enhances product experience while staying true to the brand.",
  ],
  cta: {
    label: "Get Started",
    href: "/contact",
  },
  images: {
    primary: {
      src: packagingImagePrimary,
      alt: "SAMāH supplement packaging — shilajit and saffron boxes with product jars",
    },
    secondary: {
      src: packagingImageSecondary,
      alt: "True Grain packaging design — organic food brand pouch and product display",
    },
  },
} as const;

export const webDesignSectionContent = {
  title: "Web Design",
  paragraphs: [
    "Clean, intuitive websites designed to reflect your brand with clarity and precision. We focus on creating digital experiences that feel seamless, visually aligned, and easy to navigate.",
    "Each website is designed to communicate effectively while maintaining a refined and minimal aesthetic.",
  ],
  cta: {
    label: "Get Started",
    href: "/contact",
  },
  images: {
    primary: {
      src: webDesignImagePrimary,
      alt: "Whimsy Beauty web design — responsive website across desktop, laptop, tablet, and mobile",
    },
    secondary: {
      src: webDesignImageSecondary,
      alt: "Whimsy Beauty web design — isometric laptop mockup with floating UI components",
    },
  },
} as const;

export const socialMediaSectionContent = {
  title: "Social Media",
  paragraphs: [
    "Thoughtfully designed social media visuals that maintain consistency while allowing flexibility. We create systems that help your brand show up clearly and cohesively across platforms.",
    "The focus is on building a recognisable presence without overwhelming the visual language.",
  ],
  cta: {
    label: "Get Started",
    href: "/contact",
  },
  images: {
    primary: {
      src: socialMediaImagePrimary,
      alt: "kaahu social media graphic — Silver Needle White Tea from Darjeeling",
    },
    secondary: {
      src: socialMediaImageSecondary,
      alt: "kaahu tea packaging — Risheehat Floral First Flush Darjeeling tea box and tin",
    },
  },
} as const;

export const illustrationsSectionContent = {
  title: "Illustrations",
  paragraphs: [
    "Custom illustration systems that add depth, personality, and a unique visual layer to your brand. From subtle motifs to expressive compositions, each element is designed to integrate seamlessly within the overall identity.",
    "These systems are built to scale across packaging, digital, and print applications.",
  ],
  cta: {
    label: "Get Started",
    href: "/contact",
  },
  images: {
    primary: {
      src: illustrationsImagePrimary,
      alt: "Watercolor illustration — woman resting in a meadow surrounded by flowers and butterflies",
    },
    secondary: {
      src: illustrationsImageSecondary,
      alt: "Architectural sketch illustration — Taj Mahal Palace Hotel in Mumbai",
    },
  },
} as const;

export type ServiceHighlightImage = {
  src: StaticImageData;
  alt: string;
};

export const servicesCtaContent = {
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

export const ourProcessSectionContent = {
  title: "Our Process",
  subtitle: "A thoughtful process, refined at every step.",
  steps: [
    {
      title: "Understand",
      description:
        "We begin by understanding your brand, audience, and intent - deeply and clearly.",
      icon: { src: processIconUnderstand, alt: "Understand" },
    },
    {
      title: "Explore",
      description:
        "Directions are explored through mood, form, and visual language to find what feels right.",
      icon: { src: processIconExplore, alt: "Explore" },
    },
    {
      title: "Define",
      description:
        "A clear design direction is shaped - refined, intentional, and aligned.",
      icon: { src: processIconDefine, alt: "Define" },
    },
    {
      title: "Design",
      description:
        "We build the identity system with precision, balancing aesthetics and function.",
      icon: { src: processIconDesign, alt: "Design" },
    },
    {
      title: "Finalise",
      description: "Refined and resolved - ready to come to life, effortlessly.",
      icon: { src: processIconFinalise, alt: "Finalise" },
    },
  ],
} as const satisfies {
  title: string;
  subtitle: string;
  steps: Array<{
    title: string;
    description: string;
    icon: { src: StaticImageData; alt: string };
  }>;
};
