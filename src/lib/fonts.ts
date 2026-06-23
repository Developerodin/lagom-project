import localFont from "next/font/local";

export const montserrat = localFont({
  src: [
    {
      path: "../assets/fonts/montserrat/montserrat-latin-300-normal.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../assets/fonts/montserrat/montserrat-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/montserrat/montserrat-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/montserrat/montserrat-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-montserrat",
  display: "swap",
});

export const lora = localFont({
  src: [
    {
      path: "../assets/fonts/lora/lora-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/lora/lora-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/lora/lora-latin-400-italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-lora",
  display: "swap",
});
