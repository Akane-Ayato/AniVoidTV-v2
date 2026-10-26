// /api/recent.js
// Proxies GET /recent-anime?page=&per_page= server-side. The browser only
// ever calls /api/recent?... on your own domain — the upstream URL below
// never appears in any page's network requests.

const UPSTREAM_BASE = "https://anikotoapi.site";

export default async function handler(req, res) {
  const page = req.query.page || "1";
  const perPage = req.query.per_page || "20";

  try {
    const upstream = await fetch(
      `${UPSTREAM_BASE}/recent-anime?page=${encodeURIComponent(page)}&per_page=${encodeURIComponent(perPage)}`,
      { headers: { Accept: "application/json" } }
    );
    const data = await upstream.json();

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({ ok: false, message: "Upstream fetch failed" });
  }
}