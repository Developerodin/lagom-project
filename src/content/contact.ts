export const contactFormContent = {
  title: "Send us a message",
  fields: {
    name: { label: "Your Name", type: "text" as const },
    email: { label: "Email Address", type: "email" as const },
    company: { label: "Company (Optional)", type: "text" as const },
    subject: { label: "Subject", type: "text" as const },
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
      value: "hello@lagomdesign.in",
      href: "mailto:hello@lagomdesign.in",
    },
    {
      id: "phone",
      label: "Phone",
      value: "+91 98765 43210",
      href: "tel:+919876543210",
    },
    {
      id: "location",
      label: "Location",
      value: "Bengaluru, India",
    },
    {
      id: "hours",
      label: "Working Hours",
      value: "Mon - Fri | 10:00 AM - 6:00 PM",
    },
  ],
} as const;
