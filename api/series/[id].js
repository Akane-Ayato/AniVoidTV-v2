// /api/series/[id].js
// Runs on Vercel's servers, never in the browser — the upstream URL below
// is invisible to anyone inspecting network requests on the site, because
// the browser only ever calls YOUR domain's /api/series/{id}, not the
// third-party API directly.

const UPSTREAM_BASE = "https://anikotoapi.site";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ ok: false, message: "Missing id" });
  }

  try {
    const upstream = await fetch(`${UPSTREAM_BASE}/series/${encodeURIComponent(id)}`, {
      headers: { Accept: "application/json" },
    });

    const data = await upstream.json();

    // Cache each ID's response at the edge for a bit — repeat visits for the
    // same show are served instantly without hitting the upstream API again.
    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=600");
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({ ok: false, message: "Upstream fetch failed" });
  }
}