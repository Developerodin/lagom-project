import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const squareImages = [
  "/assets/home/square-images_-1024-x-1024px/s1.jpg",
  "/assets/home/square-images_-1024-x-1024px/s2.jpg",
  "/assets/home/square-images_-1024-x-1024px/s3.jpg",
  "/assets/home/square-images_-1024-x-1024px/s4.jpg",
  "/assets/home/square-images_-1024-x-1024px/s5.jpg",
  "/assets/home/square-images_-1024-x-1024px/s6.jpg",
];

const bannerImages = [
  "/assets/home/banner_-1750-x-851px/1.jpg",
  "/assets/home/banner_-1750-x-851px/2.jpg",
  "/assets/home/banner_-1750-x-851px/3.jpg",
  "/assets/home/banner_-1750-x-851px/4.jpg",
  "/assets/home/banner_-1750-x-851px/5.jpg",
];

const portraitImages = [
  "/assets/home/portrait_-900-x-1200px/p1.jpg",
  "/assets/home/portrait_-900-x-1200px/p2.jpg",
];

type SeedClient = {
  slug: string;
  title: string;
  alt: string;
  description: string;
  whatWeDid: string;
};

const clients: SeedClient[] = [
  {
    slug: "cafe-juliet",
    title: "Cafe Juliet",
    alt: "Cafe Juliet brand identity — warm hospitality branding and packaging",
    description:
      "A warm, inviting brand identity for Cafe Juliet — balancing artisanal charm with a clean, contemporary visual language across menus, packaging and in-store touchpoints.",
    whatWeDid: "Brand identity, packaging design, menu design, and in-store collateral.",
  },
  {
    slug: "klay-home",
    title: "Klay Home",
    alt: "Klay Home visual identity — refined home and lifestyle branding",
    description:
      "A refined identity system for Klay Home, built around tactile textures, muted palettes and editorial layouts that speak to considered living and craft.",
    whatWeDid: "Visual identity, brand guidelines, packaging, and lifestyle campaign assets.",
  },
  {
    slug: "tarinika",
    title: "Tarinika",
    alt: "Tarinika jewellery branding — elegant packaging and brand applications",
    description:
      "An elegant brand world for Tarinika — from packaging and collateral to digital presence, designed to feel timeless, luxurious and unmistakably Indian.",
    whatWeDid: "Brand identity, jewellery packaging, collateral, and digital brand applications.",
  },
  {
    slug: "bombay-republic",
    title: "Bombay Republic",
    alt: "Bombay Republic brand identity — bold food and beverage packaging",
    description:
      "A bold, energetic identity for Bombay Republic — packaging and brand applications that capture the spirit of modern Indian dining with clarity and confidence.",
    whatWeDid: "Brand identity, food packaging, restaurant collateral, and brand launch assets.",
  },
  {
    slug: "true-grain",
    title: "True Grain",
    alt: "True Grain packaging design — organic food brand visual system",
    description:
      "A grounded visual system for True Grain — honest typography, natural colour and packaging that communicates quality ingredients without excess.",
    whatWeDid: "Packaging design, label system, brand identity, and retail shelf applications.",
  },
  {
    slug: "whimsy-beauty",
    title: "Whimsy Beauty",
    alt: "Whimsy Beauty brand identity — playful beauty packaging and collateral",
    description:
      "A playful yet polished identity for Whimsy Beauty — packaging, social templates and brand collateral that feel fresh, feminine and distinctly ownable.",
    whatWeDid: "Brand identity, beauty packaging, social templates, and launch collateral.",
  },
];

const categories = [
  { slug: "food-beverage", name: "Food & Beverage", sortOrder: 0 },
  { slug: "fashion", name: "Fashion", sortOrder: 1 },
  { slug: "lifestyle", name: "Lifestyle", sortOrder: 2 },
];

const clientCategories: Record<string, string> = {
  "cafe-juliet": "food-beverage",
  "bombay-republic": "food-beverage",
  "true-grain": "food-beverage",
  "tarinika": "fashion",
  "whimsy-beauty": "fashion",
  "klay-home": "lifestyle",
};

const testimonials = [
  {
    id: "seed-testimonial-cafe-juliet",
    quote:
      "Lagom understood our café's personality from day one. The brand identity feels warm, intentional, and completely us — our guests notice it every time they walk in.",
    author: "Priya Mehta",
    company: "Cafe Juliet",
    logoUrl: "/assets/home/Clients/cafe-juliet.png",
    logoAlt: "Cafe Juliet logo",
    bgImageUrl: "/assets/home/square-images_-1024-x-1024px/s1.jpg",
    bgImageAlt: "Cafe Juliet brand identity and packaging",
    sortOrder: 0,
  },
  {
    id: "seed-testimonial-tarinika",
    quote:
      "They brought a rare balance of elegance and clarity to our jewellery brand. Every touchpoint — from packaging to digital — now feels cohesive and unmistakably Tarinika.",
    author: "Ananya Reddy",
    company: "Tarinika",
    logoUrl: "/assets/home/Clients/tarinika.png",
    logoAlt: "Tarinika logo",
    bgImageUrl: "/assets/home/square-images_-1024-x-1024px/s3.jpg",
    bgImageAlt: "Tarinika jewellery branding and packaging",
    sortOrder: 1,
  },
  {
    id: "seed-testimonial-klay-home",
    quote:
      "The team translated our vision for considered living into a visual language that feels tactile and timeless. Lagom made our brand feel as refined as the products we create.",
    author: "Rohan Kapoor",
    company: "Klay Home",
    logoUrl: "/assets/home/Clients/klay-home.png",
    logoAlt: "Klay Home logo",
    bgImageUrl: "/assets/home/square-images_-1024-x-1024px/s2.jpg",
    bgImageAlt: "Klay Home lifestyle brand visual system",
    sortOrder: 2,
  },
];

async function main() {
  const categoryIds = new Map<string, string>();

  for (const category of categories) {
    const record = await prisma.workCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        sortOrder: category.sortOrder,
      },
      create: category,
    });
    categoryIds.set(category.slug, record.id);
  }

  for (let index = 0; index < clients.length; index += 1) {
    const client = clients[index];
    const categorySlug = clientCategories[client.slug];
    const categoryId = categorySlug ? categoryIds.get(categorySlug) : undefined;
    const cardImage = squareImages[index % squareImages.length];
    const heroImage = bannerImages[index % bannerImages.length];

    const gallery = [
      {
        imageUrl: bannerImages[index % bannerImages.length],
        alt: `${client.title} — featured project visual`,
        width: 1750,
        height: 851,
        sortOrder: 0,
      },
      {
        imageUrl: portraitImages[index % portraitImages.length],
        alt: `${client.title} — detail study`,
        width: 900,
        height: 1200,
        sortOrder: 1,
      },
      {
        imageUrl: squareImages[index % squareImages.length],
        alt: `${client.title} — brand application`,
        width: 1024,
        height: 1024,
        sortOrder: 2,
      },
    ];

    await prisma.clientWork.upsert({
      where: { slug: client.slug },
      update: {
        title: client.title,
        cardImage,
        cardAlt: client.alt,
        heroImage,
        heroAlt: `${client.title} — hero banner`,
        description: client.description,
        whatWeDid: client.whatWeDid,
        services: client.whatWeDid,
        sortOrder: index,
        published: true,
        categoryId,
      },
      create: {
        slug: client.slug,
        title: client.title,
        cardImage,
        cardAlt: client.alt,
        heroImage,
        heroAlt: `${client.title} — hero banner`,
        description: client.description,
        whatWeDid: client.whatWeDid,
        services: client.whatWeDid,
        sortOrder: index,
        published: true,
        categoryId,
        gallery: {
          create: gallery,
        },
      },
    });
  }

  for (const testimonial of testimonials) {
    await prisma.testimonial.upsert({
      where: { id: testimonial.id },
      update: {
        quote: testimonial.quote,
        author: testimonial.author,
        company: testimonial.company,
        logoUrl: testimonial.logoUrl,
        logoAlt: testimonial.logoAlt,
        bgImageUrl: testimonial.bgImageUrl,
        bgImageAlt: testimonial.bgImageAlt,
        sortOrder: testimonial.sortOrder,
        published: true,
      },
      create: {
        ...testimonial,
        published: true,
      },
    });
  }

  console.log(
    `Seeded ${categories.length} categories, ${clients.length} client work entries, and ${testimonials.length} testimonials.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
