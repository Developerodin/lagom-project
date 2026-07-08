import {
  brandingSectionContent,
  illustrationsSectionContent,
  packagingSectionContent,
  socialMediaSectionContent,
  webDesignSectionContent,
} from "@/content/services";

export const contactServiceOptions = [
  { id: "branding", label: brandingSectionContent.title },
  { id: "packaging-design", label: packagingSectionContent.title },
  { id: "web-design", label: webDesignSectionContent.title },
  { id: "social-media", label: socialMediaSectionContent.title },
  { id: "illustrations", label: illustrationsSectionContent.title },
] as const;

export const contactFormContent = {
  title: "Send us a message",
  fields: {
    name: { label: "Your Name", type: "text" as const },
    email: { label: "Email Address", type: "email" as const },
    company: { label: "Company (Optional)", type: "text" as const },
    services: {
      label: "What can we help you with?",
      hint: "Select all services that apply to your project.",
    },
    message: { label: "Tell us about your project", type: "textarea" as const },
  },
  submitLabel: "Send Message",
} as const;

export const contactInfoContent = {
  title: "Get in touch",
  items: [
    {
      id: "email",
      label: "Email",
      value: "studiolagomdesign@gmail.com",
      href: "mailto:studiolagomdesign@gmail.com",
    },
    {
      id: "phone",
      label: "Phone",
      value: "+91 89551 06651",
      href: "tel:+918955106651",
    },
    {
      id: "location",
      label: "Location",
      value: "Jaipur, India",
    },
    {
      id: "hours",
      label: "Working Hours",
      value: "Mon - Fri | 10:00 AM - 6:00 PM",
    },
  ],
} as const;
