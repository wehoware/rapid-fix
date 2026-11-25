// Submits all sitemap URLs to IndexNow (Bing, Yandex, Naver, Seznam).
// Bing's index powers Copilot and ChatGPT Search, so this speeds up AI visibility.
// Usage: node scripts/indexnow.mjs   (run after each deploy / content change)
const KEY = "8ab564a8d8f4393c7c7d26b31ee9312e";
const HOST = "www.rapidfixauto.ca";
const SITE = `https://${HOST}`;

const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList: urls,
  }),
});
console.log(`IndexNow: ${res.status} — submitted ${urls.length} URLs`);
