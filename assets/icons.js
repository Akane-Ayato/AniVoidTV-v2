/* AniVoid icon system: stroke UI icons, avatar glyphs, liquid badges, animated reactions. No emoji anywhere. */
(function () {
  "use strict";
  const AVTV = (window.AVTV = window.AVTV || {});
  const svg = (inner, cls) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (cls ? ' class="' + cls + '"' : "") + ">" + inner + "</svg>";
  const dot = (x, y) => '<path d="M' + x + " " + y + 'h.01" stroke-width="2.6"/>';

  const P = {
    arrow: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    checkc: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    cog: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    shuffle: '<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    upload: '<polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
    refresh: '<polyline points="23 4 23 10 17 10"/><path d="M20.5 15a9 9 0 1 1-2.1-9.4L23 10"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/>' + dot(9, 9) + dot(15, 9),
    bag: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    gem: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20"/><path d="M12 21L8 9l4-6 4 6z"/>',
    crystal: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20"/><path d="M12 21L8 9l4-6 4 6z"/>',
    crown: '<path d="M2 18l2-10 5 5 3-8 3 8 5-5 2 10z"/><path d="M3 21h18"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    flame: '<path d="M12 2c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
    bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    flower: '<circle cx="12" cy="12" r="2.4"/><circle cx="12" cy="5.5" r="3"/><circle cx="18.5" cy="12" r="3"/><circle cx="12" cy="18.5" r="3"/><circle cx="5.5" cy="12" r="3"/>',
    skull: '<path d="M12 3a8 8 0 0 0-8 8c0 3 1.5 4.5 3 5.5V20h10v-3.5c1.5-1 3-2.5 3-5.5a8 8 0 0 0-8-8z"/><circle cx="9" cy="11.5" r="1.4"/><circle cx="15" cy="11.5" r="1.4"/><path d="M10 20v-3M14 20v-3"/>',
    fox: '<path d="M3 4l5 4h8l5-4-1 9c0 4-4 8-8 8s-8-4-8-8z"/>' + dot(9, 13) + dot(15, 13) + '<path d="M11 17.2h2"/>',
    cat: '<path d="M4 3l4 4h8l4-4v10c0 4-3.5 8-8 8s-8-4-8-8z"/>' + dot(9, 12) + dot(15, 12) + '<path d="M12 14.5v1.5M10 17.2c1 1 3 1 4 0M2 12l4 1M22 12l-4 1"/>',
    wolf: '<path d="M3 3l5 5h8l5-5v9c0 5-4 9-9 9s-9-4-9-9z"/><path d="M8 12l2.2 1M16 12l-2.2 1M9.5 16.5L12 19.5l2.5-3"/>',
    dragon: '<path d="M5 3c1 3 2 4 4 5M19 3c-1 3-2 4-4 5M7 8h10l3 5-3 8H7l-3-8z"/>' + dot(9.5, 12.5) + dot(14.5, 12.5) + dot(10.5, 17) + dot(13.5, 17),
    ghost: '<path d="M5 21V11a7 7 0 0 1 14 0v10l-3.5-2.5L12 21l-3.5-2.5z"/>' + dot(9.5, 11) + dot(14.5, 11),
    bunny: '<path d="M8 3c-2 0-2 6 0 8M16 3c2 0 2 6 0 8M5 15a7 6 0 0 1 14 0c0 3-3 6-7 6s-7-3-7-6z"/>' + dot(9.5, 15) + dot(14.5, 15),
    owl: '<path d="M5 5l3 2h8l3-2v9c0 4-3 7-7 7s-7-3-7-7z"/><circle cx="9" cy="11" r="2"/><circle cx="15" cy="11" r="2"/><path d="M12 13.5l-1 2h2z"/>',
    headphones: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
    sword: '<path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6M16 16l4 4M19 21l2-2"/>',
    footprints: '<path d="M8 4c2 0 3 2 3 5s-1 4-3 4-3-1-3-4 1-5 3-5z"/><path d="M16 11c2 0 3 2 3 5s-1 4-3 4-3-1-3-4 1-5 3-5z"/>',
    popcorn: '<path d="M5 10l2 11h10l2-11z"/><path d="M7 10a2.5 2.5 0 1 1 3-3 2.5 2.5 0 0 1 4 0 2.5 2.5 0 1 1 3 3"/>',
    tv: '<rect x="2" y="7" width="20" height="14" rx="2"/><polyline points="17 2 12 7 7 2"/>',
    books: '<path d="M4 19V5a2 2 0 0 1 2-2h2v18H6a2 2 0 0 1-2-2z"/><path d="M8 3h4v18H8z"/><path d="M14 5l4-1 3 15-4 1z"/>',
    volcano: '<path d="M3 21l6-12h6l6 12z"/><path d="M10 9L9 5M14 9l1-4M12 9V4"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/>' + dot(12, 8),
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>',
    device: '<rect x="2" y="4" width="20" height="13" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    right: '<polyline points="9 18 15 12 9 6"/>',
    left: '<polyline points="15 18 9 12 15 6"/>',
    down: '<polyline points="6 9 12 15 18 9"/>',
    up: '<polyline points="18 15 12 9 6 15"/>',
    reply: '<polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
    palette: '<circle cx="13.5" cy="6.5" r="1.2"/><circle cx="17.5" cy="10.5" r="1.2"/><circle cx="8.5" cy="7.5" r="1.2"/><circle cx="6.5" cy="12.5" r="1.2"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.8.7-1.5 1.5-1.5H16c3.3 0 6-2.7 6-6 0-4.9-4.5-9-10-9z"/>',
    tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>' + dot(7, 7),
    sparkle: '<path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z"/>',
    gift: '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
    maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
  };
  AVTV.icons = {};
  Object.keys(P).forEach((k) => (AVTV.icons[k] = svg(P[k])));
  AVTV.icons.tg = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.9 4.6c.2-1-.6-1.8-1.5-1.4L2.4 10.7c-1 .4-1 1.9.1 2.2l4.4 1.4 1.7 5.4c.2.7 1 .9 1.6.4l2.5-2.2 4.6 3.4c.8.6 1.9.1 2.1-.8l3.5-15.9z"/></svg>';
  AVTV.icon = (name, cls) => svg(P[name] || P.star, cls);
  AVTV.hasIcon = (name) => !!P[name];

  /* ---------- liquid badge: glossy morphing blob + icon (badges, stats, shop tabs) ---------- */
  AVTV.liquid = function (name, tone, size, locked) {
    return '<span class="lq lq-' + (locked ? "lock" : tone || "iris") + '" style="--s:' + (size || 44) + 'px">' + AVTV.icon(name) + "</span>";
  };
  const BADGE_TONE = { footprints: "aqua", play: "iris", popcorn: "amber", tv: "sky", trophy: "amber", chat: "rose", books: "violet", check: "lime", flame: "coral", volcano: "coral", crystal: "violet", camera: "sky", image: "aqua", gem: "rose", crown: "amber" };
  AVTV.badgeIcon = (key, earned, size) => AVTV.liquid(key, BADGE_TONE[key] || "iris", size || 44, !earned);

  /* ---------- glyph avatars ---------- */
  AVTV.glyph = (key) => AVTV.icon(key);

  /* ---------- shared gradients (stickers, reactions) ---------- */
  const G = {
    "g-yellow": ["#ffe27a", "#ffb43a"], "g-red": ["#ff7a8c", "#e8264f"], "g-blue": ["#7fd0ff", "#3a7dff"], "g-orange": ["#ffb347", "#ff4d2e"],
    "g-pink": ["#ffa6d9", "#ff4fa0"], "g-green": ["#a6ffcf", "#2fd48a"], "g-violet": ["#c4b5ff", "#7a5cff"], "g-teal": ["#9ffaf0", "#19c3b5"],
    "s-mint": ["#c8ffe9", "#58e0b0"], "s-pink": ["#ffd1ea", "#ff8cc3"], "s-sky": ["#d2ecff", "#6fb6ff"], "s-lav": ["#e3dbff", "#9c86ff"],
    "s-peach": ["#ffe3c9", "#ffa56b"], "s-lime": ["#efffc4", "#9be84f"], "s-red": ["#ffb5b5", "#ff5252"], "s-gold": ["#fff3b0", "#ffc01f"],
    "s-ghost": ["#ffffff", "#bfd2ff"], "s-sick": ["#d7ffc8", "#7fcf5c"], "s-night": ["#7a8bff", "#2a1f7a"], "s-white": ["#ffffff", "#dfe7ff"],
  };
  AVTV.defsHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
    Object.keys(G).map((id) => '<linearGradient id="' + id + '" x1="0" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="' + G[id][0] + '"/><stop offset="1" stop-color="' + G[id][1] + '"/></linearGradient>').join("") + "</defs></svg>";
  AVTV.mountDefs = function () {
    if (document.getElementById("avtv-defs")) return;
    const d = document.createElement("div"); d.id = "avtv-defs"; d.innerHTML = AVTV.defsHTML; d.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    document.body.appendChild(d);
  };

  /* ---------- animated reactions (original art) ---------- */
  const hl = '<ellipse cx="11" cy="8" rx="6" ry="3" fill="#fff" opacity=".28"/>';
  const face = (g, inner) => '<circle cx="16" cy="16" r="14" fill="url(#' + g + ')"/>' + hl + inner;
  const ink = "#3a2300";
  const R = {
    like: '<g class="rx-a"><path d="M3 14h5v14H3z" fill="url(#g-blue)"/><path d="M10 14l5-10c2 0 3.5 1.5 3.5 3.5V12H26a2.5 2.5 0 0 1 2.4 3l-1.8 9A3 3 0 0 1 23.7 27H10z" fill="url(#g-blue)"/><path d="M12 15l4-8" stroke="#fff" stroke-opacity=".45" stroke-width="1.6" stroke-linecap="round" fill="none"/></g>',
    love: '<g class="rx-a"><path d="M16 28S3 20 3 11.5A6.5 6.5 0 0 1 16 9a6.5 6.5 0 0 1 13 2.5C29 20 16 28 16 28z" fill="url(#g-red)"/><ellipse cx="10" cy="11" rx="3.4" ry="2" fill="#fff" opacity=".4" transform="rotate(-25 10 11)"/></g>',
    haha: face("g-yellow", '<path d="M8.5 13.5q2.5-3 5 0M18.5 13.5q2.5-3 5 0" stroke="' + ink + '" stroke-width="2" fill="none" stroke-linecap="round"/><g class="rx-m"><path d="M8 18h16c0 5-3.5 8-8 8s-8-3-8-8z" fill="#3a1500"/><path d="M11 23.6q5-3 10 0c-1 1.7-3 2.5-5 2.5s-4-.8-5-2.5z" fill="#ff6b86"/></g>'),
    wow: face("g-yellow", '<path d="M8.5 9.5q3-2.2 5.5 0M18 9.5q3-2.2 5.5 0" stroke="' + ink + '" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="11.5" cy="14" r="2.2" fill="' + ink + '"/><circle cx="20.5" cy="14" r="2.2" fill="' + ink + '"/><ellipse class="rx-m" cx="16" cy="22" rx="3.2" ry="4" fill="#3a1500"/>'),
    sad: face("g-blue", '<path d="M8.5 11l5 2M23.5 11l-5 2" stroke="#12285c" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="11.5" cy="15" r="2" fill="#12285c"/><circle cx="20.5" cy="15" r="2" fill="#12285c"/><path d="M10.5 24q5.5-5 11 0" stroke="#12285c" stroke-width="2" fill="none" stroke-linecap="round"/><path class="rx-t" d="M23 17c2 2.6 2 4 0 4.6-2-.6-2-2 0-4.6z" fill="#d6f2ff"/>'),
    angry: face("g-orange", '<path d="M7.5 9.5l7 3.5M24.5 9.5l-7 3.5" stroke="#5a0b00" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="11.5" cy="15.5" r="2" fill="#5a0b00"/><circle cx="20.5" cy="15.5" r="2" fill="#5a0b00"/><path d="M10.5 24q5.5-4.5 11 0" stroke="#5a0b00" stroke-width="2.2" fill="none" stroke-linecap="round"/>'),
    fire: '<g class="rx-a"><path d="M16 2c1 5 8 8 8 16a8 8 0 0 1-16 0c0-4 2-6 3.5-8 .5 3 2 4.5 3.5 4.5C15 10 14 6 16 2z" fill="url(#g-orange)"/><path d="M16 16c.8 2.5 4 3.5 4 7a4 4 0 0 1-8 0c0-2 1.5-3 2-4.5.7 1 1.5 1.5 2 1.5z" fill="url(#g-yellow)"/></g>',
    clap: '<g class="rx-l"><rect x="3.5" y="11" width="9" height="16" rx="4.5" transform="rotate(-16 8 19)" fill="url(#g-yellow)"/></g><g class="rx-r"><rect x="19.5" y="11" width="9" height="16" rx="4.5" transform="rotate(16 24 19)" fill="url(#g-yellow)"/></g><path class="rx-s" d="M16 3v4M9.5 5l1.6 3.4M22.5 5l-1.6 3.4" stroke="#ffd35a" stroke-width="2" stroke-linecap="round" fill="none"/>',
  };
  AVTV.REACTION_LABELS = { like: "Like", love: "Love", haha: "Haha", wow: "Wow", sad: "Sad", angry: "Angry", fire: "Fire", clap: "Applause" };
  AVTV.reaction = (key, size) => '<svg class="rxi rx-' + key + '" viewBox="0 0 32 32" width="' + (size || 24) + '" height="' + (size || 24) + '" role="img" aria-label="' + (AVTV.REACTION_LABELS[key] || key) + '">' + (R[key] || "") + "</svg>";
})();
