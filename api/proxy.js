// /api/proxy.js: reached through the rewrite in vercel.json   /api/v1/*  ->  /api/proxy?path=*
// Forwards every /api/v1/... call to your AniVoid backend (Render/VPS). It runs on Vercel's servers, so the browser only talks to
// your own domain: session cookies stay first-party and the backend URL stays out of the page.
//
// Vercel env vars:  BACKEND_URL   e.g. https://anivoid-api-l3p8.onrender.com   (the proxy fixes a missing https:// or a trailing / or /api)
//                   PROXY_SECRET  same value as PROXY_SECRET on the backend (lets it see the real visitor IP)
//
// Self-check after deploying: open  https://<your-site>/api/v1/_debug

const CACHEABLE = new Set(["top-ten", "schedule", "search", "completed", "upcoming"]); // public data, same for everyone
const METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);

function backendBase() {
  let b = (process.env.BACKEND_URL || "").trim().replace(/\/+$/, "").replace(/\/api$/i, "");
  if (b && !/^https?:\/\//i.test(b)) b = "https://" + b;
  return b;
}

export default async function handler(req, res) {
  const BACKEND = backendBase();
  const raw = Array.isArray(req.query.path) ? req.query.path.join("/") : String(req.query.path || "");
  const parts = raw.split("/").filter(Boolean);

  // ---- self-check (no secrets, no URLs in the answer) ----
  if (parts[0] === "_debug") {
    let backend = "not configured";
    if (BACKEND) {
      try {
        const r = await fetch(BACKEND + "/health", { signal: AbortSignal.timeout(20000) });
        backend = r.ok ? "reachable" : "answered with HTTP " + r.status;
      } catch (e) { backend = "unreachable (" + (e.name === "TimeoutError" ? "timeout, is the Render service asleep?" : e.message) + ")"; }
    }
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ proxy: "ok", backend_url_set: !!BACKEND, proxy_secret_set: !!process.env.PROXY_SECRET, backend });
  }

  if (!BACKEND) return res.status(500).json({ success: false, message: "BACKEND_URL is not configured on Vercel" });
  if (!parts.length || parts.some((p) => p === "." || p === "..") || parts[0] === "admin") return res.status(400).json({ success: false, message: "Bad path" });
  if (!METHODS.has(req.method)) return res.status(405).json({ success: false, message: "Method not allowed" });

  const qs = new URL(req.url, "http://x").searchParams;
  qs.delete("path");
  const target = `${BACKEND}/api/${parts.map(encodeURIComponent).join("/")}${qs.toString() ? "?" + qs : ""}`;

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
      signal: AbortSignal.timeout(55000), // a sleeping free Render service can take ~50s to wake up
    });

    const setCookie = upstream.headers.getSetCookie ? upstream.headers.getSetCookie() : [];
    if (setCookie.length) res.setHeader("Set-Cookie", setCookie);

    const cacheable = req.method === "GET" && CACHEABLE.has(parts[0]) && upstream.ok;
    res.setHeader("Cache-Control", cacheable ? "s-maxage=120, stale-while-revalidate=600" : "no-store");
    const source = upstream.headers.get("x-data-source");
    if (source) res.setHeader("X-Data-Source", source);

    const text = await upstream.text();
    res.status(upstream.status).setHeader("Content-Type", "application/json; charset=utf-8").send(text);
  } catch (err) {
    const asleep = err && err.name === "TimeoutError";
    res.status(asleep ? 504 : 502).json({ success: false, message: asleep ? "Backend is waking up, try again in a moment" : "Backend unreachable" });
  }
}
