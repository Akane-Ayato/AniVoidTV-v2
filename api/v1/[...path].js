// /api/v1/* -> your AniVoid backend (Render/VPS). Runs on Vercel's servers, so the browser only ever
// talks to your own domain: session cookies stay first-party and the backend URL stays hidden.
//
// Vercel env vars:  BACKEND_URL   e.g. https://anivoid-api.onrender.com   (no trailing slash)
//                   PROXY_SECRET  same value as PROXY_SECRET on the backend (lets it see the real visitor IP)

const CACHEABLE = /^(top-ten|schedule|search|completed|upcoming|random)$/;   // public, same for everyone

export default async function handler(req, res) {
  const BACKEND = (process.env.BACKEND_URL || "").replace(/\/$/, "");
  if (!BACKEND) return res.status(500).json({ success: false, message: "BACKEND_URL is not configured" });

  const parts = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
  const url = new URL(req.url, "http://x");
  url.searchParams.delete("path");
  const target = `${BACKEND}/api/${parts.map(encodeURIComponent).join("/")}${url.searchParams.toString() ? "?" + url.searchParams : ""}`;

  const headers = { Accept: "application/json", "X-AVTV": req.headers["x-avtv"] || "" };
  if (req.headers.cookie) headers.cookie = req.headers.cookie;
  if (req.headers["content-type"]) headers["content-type"] = req.headers["content-type"];
  if (process.env.PROXY_SECRET) {
    headers["x-proxy-secret"] = process.env.PROXY_SECRET;
    headers["x-client-ip"] = (req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  }

  const hasBody = !["GET", "HEAD"].includes(req.method);
  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: hasBody && req.body !== undefined ? (typeof req.body === "string" ? req.body : JSON.stringify(req.body)) : undefined,
    });

    const setCookie = upstream.headers.getSetCookie ? upstream.headers.getSetCookie() : [];
    if (setCookie.length) res.setHeader("Set-Cookie", setCookie);

    const isPublicGet = req.method === "GET" && CACHEABLE.test(parts[0] || "") && parts[0] !== "random" && !req.headers.cookie?.includes("avtv_session=undefined");
    res.setHeader("Cache-Control", isPublicGet && upstream.ok ? "s-maxage=120, stale-while-revalidate=600" : "no-store");
    const dataSource = upstream.headers.get("x-data-source");
    if (dataSource) res.setHeader("X-Data-Source", dataSource);

    const text = await upstream.text();
    res.status(upstream.status).setHeader("Content-Type", "application/json; charset=utf-8").send(text);
  } catch (err) {
    res.status(502).json({ success: false, message: "Backend unreachable" });
  }
}
