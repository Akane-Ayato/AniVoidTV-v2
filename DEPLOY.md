# AnivoidTV frontend: deploy guide

Static site + Vercel serverless proxies. The browser only ever calls **your own domain**; the proxies hide the real API URLs and
keep the login cookie first-party.

## Pages
| File | What |
|---|---|
| `index.html` | landing (search, popular searches, **Visit Home**, watch-by-ID) |
| `home.html` | main panel: navbar, spotlight hero, Continue Watching, Latest (paginated), Top anime, schedule, footer |
| `recent.html` · `aired.html` · `upcoming.html` · `search.html` | listing pages (drawer menu links to all) |
| `details.html` | details + **Add to list** + comments |
| `watch.html` | player (resumes the last episode, records Continue Watching, counts watched episodes) |
| `profile.html` | your dashboard: rank/VP, stats, badges, favorites, Continue Watching, Watch List, Settings (avatar effects, privacy, username, password) |
| `user.html?u=name` | public profile |

Shared code: `assets/site.js` (auth popup, profile menu, avatars, continue-watching store, footer), `assets/community.js`
(list button + comments), `assets/home.js`, `assets/profile*.js`, styles in `assets/*.css`.

## Vercel setup
Project → Settings → Environment Variables:

| Name | Value |
|---|---|
| `BACKEND_URL` | your backend, e.g. `https://anivoid-api.onrender.com` (no trailing slash) |
| `PROXY_SECRET` | any long random string, **same value** as `PROXY_SECRET` on the backend |

Proxies: `api/recent.js`, `api/series/[id].js` (official API, unchanged) and `api/v1/[...path].js` (everything on your backend:
search, schedule, top-ten, completed, upcoming, accounts, comments, lists).

## Backend side
See the backend README, section "Accounts & community": MongoDB Atlas URI, `SESSION_SECRET`, optional `GOOGLE_CLIENT_ID`
(add your Vercel domain to the OAuth client's *Authorized JavaScript origins*).

## Local preview
`npx vercel dev` (runs the pages and the `/api` proxies, set the env vars in `.env`), or open the files through any static server for
a UI-only look (API calls will fail without the proxies).

## Notes
* Friends and Notification tabs are visible but marked "soon" (next update).
* Schedule times are shown as provided by the source site (timezone not guaranteed).
* The Konosuba-style character art from the reference screenshots is not included (copyrighted). The popup uses your logo and a
  petal animation; drop your own art into `.auth-art` in `assets/site.js` if you have rights to an image.
