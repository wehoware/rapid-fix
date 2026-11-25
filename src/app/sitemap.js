import { SITE_URL } from "@/lib/site";

const API_BASE_URL = process.env.API_BASE_URL || "https://www.app.wehoware.ca";
const API_CLIENT_ID = process.env.API_CLIENT_ID || "fce75c6e-733c-4f25-a0dd-bf067cdb6bcb";

// Regenerate at most once an hour so new services/posts appear without a redeploy.
export const revalidate = 3600;

const STATIC_ROUTES = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/request/", changeFrequency: "monthly", priority: 0.9 },
  { path: "/services/", changeFrequency: "weekly", priority: 0.9 },
  { path: "/about/", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact/", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog/", changeFrequency: "weekly", priority: 0.7 },
  { path: "/faq/", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy-policy/", changeFrequency: "yearly", priority: 0.2 },
];

async function fetchSlugs(kind) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/public/${kind}?clientId=${API_CLIENT_ID}&limit=1000`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const items = json?.data || json?.blogs || [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export default async function sitemap() {
  const [services, blogs] = await Promise.all([
    fetchSlugs("services"),
    fetchSlugs("blogs"),
  ]);

  const staticEntries = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const serviceEntries = services
    .filter((s) => s?.slug)
    .map((s) => ({
      url: `${SITE_URL}/services/${s.slug}/`,
      lastModified: s.updated_at ? new Date(s.updated_at) : undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const blogEntries = blogs
    .filter((b) => b?.slug)
    .map((b) => ({
      url: `${SITE_URL}/blog/${b.slug}/`,
      lastModified: b.updated_at ? new Date(b.updated_at) : undefined,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [...staticEntries, ...serviceEntries, ...blogEntries];
}
