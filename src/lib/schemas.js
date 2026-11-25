import { SITE_URL } from "@/lib/site";

// BreadcrumbList schema matching the visual <Breadcrumb> on inner pages.
export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.name,
        item: `${SITE_URL}${item.url}`,
      })),
    ],
  };
}

// Q&As rendered by <FaqArea /> — keep in sync with the component copy.
export const FAQ_ITEMS = [
  {
    q: "What types of vehicles do you service?",
    a: "We service all types of vehicles including cars, trucks, and diesel vehicles. Our experienced mechanics handle everything from routine maintenance to complex engine repairs for both personal and commercial vehicles.",
  },
  {
    q: "How long does a typical repair take?",
    a: "Repair times vary depending on the service needed. Routine maintenance like oil changes typically take 30-60 minutes, while more complex repairs may take a few hours to a full day. We always provide accurate time estimates and keep you informed throughout the process.",
  },
  {
    q: "Do you offer warranty on your services?",
    a: "Yes! We stand behind our work with comprehensive warranties on parts and labor. Most repairs come with a 12-month or 20,000 km warranty, giving you peace of mind and assurance in the quality of our service.",
  },
];

export function faqPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}
