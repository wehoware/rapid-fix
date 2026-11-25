import { SITE_URL } from "@/lib/site";

const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "Amazonbot",
  "CCBot",
  "cohere-ai",
  "DuckAssistBot",
  "Timpibot",
  "VelenPublicWebCrawler",
  "YouBot",
];

export default function robots() {
  return {
    rules: [
      // AI / answer-engine crawlers explicitly welcomed
      ...AI_CRAWLERS.map((ua) => ({
        userAgent: ua,
        allow: "/",
        disallow: ["/3d", "/frames", "/api/"],
      })),
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/3d", "/frames", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
