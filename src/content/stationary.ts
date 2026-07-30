export const stationaryHeroContent = {
  line1: "Thoughtfully designed",
  accent: "paper goods.",
  body: "Custom stationery and paper products — designed with intention, printed with care, and delivered to your door.",
} as const;

export const stationaryCatalogContent = {
  headline: "We'll design it exactly the way you want it.",
  intro:
    "This is a working list of what we regularly design — but every piece starts blank and is shaped entirely around your brief. Nothing here is pre-made or picked off a shelf.",
  categories: [
    {
      id: "notecards",
      title: "Notecards & Cards",
      tagline: "Worded, coloured and styled your way",
      items: ["Notecards", "Thank-you cards"],
    },
    {
      id: "envelopes",
      title: "Envelopes & Paper",
      tagline: "Matched to your palette and occasion",
      items: ["Personalised envelopes", "Money & gift envelopes"],
    },
    {
      id: "journals",
      title: "Journals & Planners",
      tagline: "Covers and pages, built around you",
      items: [
        "Hardcover journals",
        "Notebooks",
        "Planners & notepads",
        "Recipe journals",
      ],
    },
  ],
  footerBefore: "Don't see what you're picturing?",
  footerLink: "Tell us anyway",
  footerAfter:
    "— if it can be printed, we'll design it for you specifically.",
} as const;

export const stationaryRealRequestsContent = {
  headline: "Real requests, brought to life.",
  body: "From a dog portrait on a diary cover to a full set of branded notebooks for a studio team — every project begins with a specific ask and ends as something made only for them.",
  image: {
    src: "/assets/stationary/real-requests-notebooks.png",
    alt: "Custom pet portrait notebooks with Sniff and Scribble branding",
  },
} as const;

export type StationaryValueIcon =
  | "design"
  | "quality"
  | "order"
  | "delivery";

export const stationaryValuesContent = {
  items: [
    {
      id: "thoughtful-design",
      icon: "design" as StationaryValueIcon,
      title: "Thoughtful Design",
      body: "Every piece is custom designed with intention.",
    },
    {
      id: "premium-quality",
      icon: "quality" as StationaryValueIcon,
      title: "Premium Quality",
      body: "Fine papers, inks and finishes that feel considered.",
    },
    {
      id: "made-to-order",
      icon: "order" as StationaryValueIcon,
      title: "Made to Order",
      body: "We design and print in small batches for quality and care.",
    },
    {
      id: "delivered-to-you",
      icon: "delivery" as StationaryValueIcon,
      title: "Delivered to You",
      body: "Carefully packed and delivered, wherever you are.",
    },
  ],
} as const;

export const stationaryCollectionContent = {
  badge: "+ Coming Soon",
  headline: "The Lagom Paper Collection",
  paragraphs: [
    "A curated line of ready-to-order paper goods — thoughtfully designed, printed in small batches, and made to feel as considered as our custom work.",
    "Notebooks, notecards, and everyday pieces you can order as they are. Launching soon.",
  ],
  ctaLabel: "Notify me when it launches →",
} as const;

export const stationaryCtaContent = {
  headline: "Let's create something you'll love to hold.",
  body: "Whether it's one personalised notebook or a complete stationery suite for your business, we'd love to bring your ideas to paper.",
  ctaLabel: "Start a Custom Order →",
  ctaHref: "/contact",
} as const;
