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
};

const clients: SeedClient[] = [
  {
    slug: "cafe-juliet",
    title: "Cafe Juliet",
    alt: "Cafe Juliet brand identity — warm hospitality branding and packaging",
    description:
      "A warm, inviting brand identity for Cafe Juliet — balancing artisanal charm with a clean, contemporary visual language across menus, packaging and in-store touchpoints.",
  },
  {
    slug: "klay-home",
    title: "Klay Home",
    alt: "Klay Home visual identity — refined home and lifestyle branding",
    description:
      "A refined identity system for Klay Home, built around tactile textures, muted palettes and editorial layouts that speak to considered living and craft.",
  },
  {
    slug: "tarinika",
    title: "Tarinika",
    alt: "Tarinika jewellery branding — elegant packaging and brand applications",
    description:
      "An elegant brand world for Tarinika — from packaging and collateral to digital presence, designed to feel timeless, luxurious and unmistakably Indian.",
  },
  {
    slug: "bombay-republic",
    title: "Bombay Republic",
    alt: "Bombay Republic brand identity — bold food and beverage packaging",
    description:
      "A bold, energetic identity for Bombay Republic — packaging and brand applications that capture the spirit of modern Indian dining with clarity and confidence.",
  },
  {
    slug: "true-grain",
    title: "True Grain",
    alt: "True Grain packaging design — organic food brand visual system",
    description:
      "A grounded visual system for True Grain — honest typography, natural colour and packaging that communicates quality ingredients without excess.",
  },
  {
    slug: "whimsy-beauty",
    title: "Whimsy Beauty",
    alt: "Whimsy Beauty brand identity — playful beauty packaging and collateral",
    description:
      "A playful yet polished identity for Whimsy Beauty — packaging, social templates and brand collateral that feel fresh, feminine and distinctly ownable.",
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
        sortOrder: index,
        published: true,
        categoryId,
        gallery: {
          create: gallery,
        },
      },
    });
  }

  console.log(`Seeded ${categories.length} categories and ${clients.length} client work entries.`);
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
