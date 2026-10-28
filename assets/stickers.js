/* Original animated sticker packs (SVG + CSS animation). Packs and ids must match app/effects.py STICKERS. */
(function () {
  "use strict";
  const AVTV = (window.AVTV = window.AVTV || {});
  const INK = "#241a3a";
  const line = (d, w, c) => '<path d="' + d + '" stroke="' + (c || INK) + '" stroke-width="' + (w || 4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  const dot = (x, y, r, c) => '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 5) + '" fill="' + (c || INK) + '"/>';
  const blush = '<ellipse cx="34" cy="70" rx="8" ry="5" fill="#ff7fb0" opacity=".55"/><ellipse cx="86" cy="70" rx="8" ry="5" fill="#ff7fb0" opacity=".55"/>';
  const gloss = '<ellipse cx="42" cy="34" rx="16" ry="8" fill="#fff" opacity=".35" transform="rotate(-20 42 34)"/>';
  const heart = (x, y, s, c) => '<path transform="translate(' + x + " " + y + ") scale(" + s + ')" d="M0 8C-9 1-8-8 0-4 8-8 9 1 0 8z" fill="' + (c || "#ff3d77") + '"/>';
  const sparkle = (x, y, s, c) => '<path transform="translate(' + x + " " + y + ") scale(" + s + ')" d="M0-10L2.6-2.6 10 0 2.6 2.6 0 10-2.6 2.6-10 0-2.6-2.6z" fill="' + (c || "#fff") + '"/>';
  const wrap = (name, anim, inner) => '<svg class="stk stk-' + anim + '" viewBox="0 0 120 120" role="img" aria-label="' + name + '">' + inner + "</svg>";

  /* ---------- Blobbies ---------- */
  const BLOB = "M60 14c27 0 46 19 46 46s-19 48-46 48S14 87 14 60 33 14 60 14z";
  const blob = (g) => '<path d="' + BLOB + '" fill="url(#' + g + ')"/>' + gloss;
  const BLOBS = {
    happy: ["bounce", blob("s-sky") + line("M36 58q7-9 14 0M70 58q7-9 14 0", 4.5) + line("M46 72q14 15 28 0", 4.5) + blush],
    sad: ["droop", blob("s-lav") + line("M36 50l14 5M84 50l-14 5", 3.5) + dot(43, 62, 5) + dot(77, 62, 5) + line("M46 84q14-13 28 0", 4.5) + '<path class="stk-tear" d="M84 66c6 8 6 12 0 14-6-2-6-6 0-14z" fill="#bfe6ff"/>'],
    angry: ["shake", blob("s-red") + line("M34 46l18 9M86 46l-18 9", 5) + dot(44, 62, 4.5) + dot(76, 62, 4.5) + line("M46 86q14-11 28 0", 5) + '<path d="M22 34l8 6M98 34l-8 6" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>'],
    love: ["pulse", blob("s-pink") + heart(44, 58, 1.5) + heart(76, 58, 1.5) + line("M46 74q14 14 28 0", 4.5) + blush + heart(100, 26, .8, "#ff7fb0") + heart(18, 30, .6, "#ff7fb0")],
    shock: ["pop", blob("s-peach") + '<circle cx="42" cy="56" r="11" fill="#fff"/><circle cx="78" cy="56" r="11" fill="#fff"/>' + dot(42, 58, 5) + dot(78, 58, 5) + '<ellipse cx="60" cy="84" rx="8" ry="11" fill="' + INK + '"/>' + line("M30 40q8-6 16 0M74 40q8-6 16 0", 3.5)],
    sleepy: ["float", blob("s-mint") + line("M34 60h16M70 60h16", 4.5) + line("M52 80q8 5 16 0", 4) + '<text x="84" y="34" font-size="18" font-weight="800" fill="#fff" font-family="Sora,sans-serif">z</text><text x="96" y="22" font-size="13" font-weight="800" fill="#fff" font-family="Sora,sans-serif">z</text>'],
    cool: ["wobble", blob("s-gold") + '<rect x="28" y="48" width="30" height="20" rx="8" fill="#111a33"/><rect x="62" y="48" width="30" height="20" rx="8" fill="#111a33"/><path d="M58 56h4" stroke="#111a33" stroke-width="4"/><path d="M34 52l8 0M68 52l8 0" stroke="#7fd0ff" stroke-width="2.5" stroke-linecap="round"/>' + line("M48 82q12 7 26-3", 4.5)],
    laugh: ["wiggle", blob("s-lime") + line("M34 56q8-10 16 0M70 56q8-10 16 0", 4.5) + '<path d="M40 70h40c0 14-9 22-20 22S40 84 40 70z" fill="' + INK + '"/><path d="M48 84q12-8 24 0c-3 5-8 7-12 7s-9-2-12-7z" fill="#ff6b86"/>' + '<path d="M28 62c-5 6-4 10 0 11 4-1 5-5 0-11zM92 62c5 6 4 10 0 11-4-1-5-5 0-11z" fill="#bfe6ff"/>'],
  };

  /* ---------- Hype Words ---------- */
  const word = (txt, g, anim, size) => [anim, '<rect x="6" y="28" width="108" height="64" rx="26" fill="url(#' + g + ')"/><path d="M22 40q10-8 24-8" stroke="#fff" stroke-opacity=".5" stroke-width="5" fill="none" stroke-linecap="round"/><text x="60" y="73" text-anchor="middle" font-family="Sora,sans-serif" font-weight="800" font-size="' + (size || 38) + '" fill="#fff" stroke="' + INK + '" stroke-width="5" paint-order="stroke" stroke-linejoin="round">' + txt + "</text>"];
  const WORDS = {
    gg: word("GG", "g-green", "pop"), omg: word("OMG", "g-pink", "shake", 34), wow: word("WOW", "g-orange", "bounce", 34), lol: word("LOL", "g-yellow", "wiggle", 36),
    nice: word("NICE", "g-blue", "wobble", 28), hype: word("HYPE", "g-violet", "pulse", 28), rip: word("RIP", "s-night", "droop", 36), uwu: word("UWU", "g-pink", "pulse", 34),
  };

  /* ---------- Little Spirits ---------- */
  const GH = "M26 102V56a34 34 0 0 1 68 0v46l-11-8-11 8-12-8-12 8-11-8z";
  const ghost = (g) => '<path d="' + GH + '" fill="url(#' + g + ')"/><ellipse cx="46" cy="32" rx="14" ry="7" fill="#fff" opacity=".55" transform="rotate(-20 46 32)"/>';
  const SPIRITS = {
    boo: ["float", ghost("s-ghost") + '<ellipse cx="46" cy="58" rx="7" ry="10" fill="' + INK + '"/><ellipse cx="74" cy="58" rx="7" ry="10" fill="' + INK + '"/><ellipse cx="60" cy="80" rx="8" ry="10" fill="' + INK + '"/>' + '<path d="M26 66l-14-16M94 66l14-16" stroke="#bfd2ff" stroke-width="8" stroke-linecap="round"/>'],
    shy: ["float", ghost("s-pink") + line("M38 62q6-6 12 0M70 62q6-6 12 0", 4) + line("M54 76q6 4 12 0", 3.5) + blush.replace(/cy="70"/g, 'cy="72"')],
    smug: ["wobble", ghost("s-lav") + '<path d="M36 58h18M66 58h18" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/><path d="M38 58a8 6 0 0 1 14 0M68 58a8 6 0 0 1 14 0" fill="' + INK + '"/>' + line("M48 78q14 8 26-4", 4)],
    dizzy: ["spin", ghost("s-sky") + '<path d="M46 58m-3 0a3 3 0 1 1 6 0a6 6 0 1 1-12 0a9 9 0 1 1 18 0" stroke="' + INK + '" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M76 58m-3 0a3 3 0 1 1 6 0a6 6 0 1 1-12 0a9 9 0 1 1 18 0" stroke="' + INK + '" stroke-width="3" fill="none" stroke-linecap="round"/>' + line("M48 80q4-5 8 0t8 0 8 0", 3.5)],
    sick: ["droop", ghost("s-sick") + line("M40 52l12 12M52 52L40 64M68 52l12 12M80 52L68 64", 4) + line("M48 80q4 6 8 0t8 0 8 0", 3.5) + '<path d="M90 70c5 7 5 11 0 12-5-1-5-5 0-12z" fill="#b6ff8a"/>'],
    panic: ["shake", ghost("s-ghost") + '<circle cx="46" cy="58" r="10" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="74" cy="58" r="10" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' + dot(46, 58, 3) + dot(74, 58, 3) + line("M44 82l8-6 8 6 8-6 8 6", 4) + '<path d="M96 40c4 6 4 9 0 10-4-1-4-4 0-10z" fill="#bfe6ff"/>'],
    zen: ["float", ghost("s-mint") + line("M38 60q6 6 12 0M70 60q6 6 12 0", 4) + line("M52 76q8 6 16 0", 3.5) + '<ellipse cx="60" cy="20" rx="22" ry="6" fill="none" stroke="#ffe27a" stroke-width="4"/>'],
    glee: ["bounce", ghost("s-gold") + sparkle(46, 58, 1, INK) + sparkle(74, 58, 1, INK) + '<path d="M42 72h36c0 12-8 18-18 18S42 84 42 72z" fill="' + INK + '"/>' + sparkle(100, 30, .8, "#fff") + sparkle(18, 40, .6, "#fff")],
  };

  /* ---------- Living Sparks ---------- */
  const SPARKS = {
    heart: ["pulse", '<path d="M60 104S14 76 14 42a24 24 0 0 1 46-9 24 24 0 0 1 46 9c0 34-46 62-46 62z" fill="url(#g-red)"/><ellipse cx="38" cy="38" rx="12" ry="7" fill="#fff" opacity=".4" transform="rotate(-30 38 38)"/>' + sparkle(98, 22, .9)],
    star: ["spin", '<polygon points="60 8 74 44 112 46 82 70 92 108 60 87 28 108 38 70 8 46 46 44" fill="url(#g-yellow)"/><ellipse cx="46" cy="36" rx="10" ry="5" fill="#fff" opacity=".5" transform="rotate(-35 46 36)"/>'],
    flame: ["flicker", '<path d="M60 8c4 20 36 32 36 66a36 36 0 0 1-72 0c0-18 8-28 16-38 2 12 8 20 14 20-4-22-2-36 6-48z" fill="url(#g-orange)"/><path d="M60 60c3 12 18 18 18 34a18 18 0 0 1-36 0c0-10 6-14 9-22 3 5 6 8 9 8z" fill="url(#g-yellow)"/>'],
    drop: ["bounce", '<path d="M60 8C44 36 24 52 24 76a36 36 0 0 0 72 0C96 52 76 36 60 8z" fill="url(#g-blue)"/><ellipse cx="46" cy="70" rx="7" ry="14" fill="#fff" opacity=".45" transform="rotate(15 46 70)"/>'],
    bolt: ["shake", '<polygon points="70 6 20 66 54 66 44 114 100 48 64 48 70 6" fill="url(#g-yellow)"/><polygon points="68 14 34 62 58 62" fill="#fff" opacity=".35"/>'],
    ring: ["spin", '<circle cx="60" cy="60" r="36" fill="none" stroke="url(#g-teal)" stroke-width="12"/><circle cx="60" cy="60" r="52" fill="none" stroke="url(#g-violet)" stroke-width="5" stroke-dasharray="14 10" stroke-linecap="round"/><circle cx="60" cy="60" r="14" fill="url(#g-pink)"/>'],
    crown: ["bounce", '<path d="M14 92L8 38l32 26 20-40 20 40 32-26-6 54z" fill="url(#g-yellow)"/><rect x="14" y="92" width="92" height="14" rx="6" fill="#e8a000"/>' + dot(60, 52, 6, "#ff4fa0") + dot(30, 62, 4.5, "#4fd0ff") + dot(90, 62, 4.5, "#4fd0ff")],
    sparkle: ["spin", '<path d="M60 6l12 36 36 12-36 12-12 36-12-36-36-12 36-12z" fill="url(#g-violet)"/><path d="M96 82l5 13 13 5-13 5-5 13-5-13-13-5 13-5z" fill="url(#g-teal)"/><path d="M22 14l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="url(#g-pink)"/>'],
  };

  /* ---------- Critter Club ---------- */
  const cat = (g, ear) => '<path d="M22 54L16 14l32 18zM98 54l6-40-32 18z" fill="url(#' + g + ')"/><path d="M26 44l-3-18 14 8zM94 44l3-18-14 8z" fill="' + ear + '"/><ellipse cx="60" cy="70" rx="44" ry="38" fill="url(#' + g + ')"/>' + '<ellipse cx="42" cy="46" rx="14" ry="7" fill="#fff" opacity=".28" transform="rotate(-20 42 46)"/>';
  const whisk = line("M10 72l22 4M10 84l22-4M110 72l-22 4M110 84l-22-4", 2.6, "#7a6aa0");
  const nose = '<path d="M55 74h10l-5 6z" fill="#ff7fb0"/>';
  const fox = (g) => '<path d="M20 58L14 10l36 24zM100 58l6-48-36 24z" fill="url(#' + g + ')"/><path d="M28 46l-4-22 16 10zM92 46l4-22-16 10z" fill="#3a2230"/><path d="M14 72c0-26 20-42 46-42s46 16 46 42c0 22-20 38-46 38S14 94 14 72z" fill="url(#' + g + ')"/><path d="M60 88c-18 0-32 8-38 18 12 8 24 6 38 6s26 2 38-6c-6-10-20-18-38-18z" fill="#fff"/>' + '<ellipse cx="44" cy="46" rx="12" ry="6" fill="#fff" opacity=".28" transform="rotate(-20 44 46)"/>';
  const bun = (g) => '<ellipse cx="42" cy="26" rx="12" ry="30" fill="url(#' + g + ')" transform="rotate(-8 42 26)"/><ellipse cx="78" cy="26" rx="12" ry="30" fill="url(#' + g + ')" transform="rotate(8 78 26)"/><ellipse cx="42" cy="28" rx="6" ry="20" fill="#ffb3d1" transform="rotate(-8 42 28)"/><ellipse cx="78" cy="28" rx="6" ry="20" fill="#ffb3d1" transform="rotate(8 78 28)"/><ellipse cx="60" cy="78" rx="40" ry="34" fill="url(#' + g + ')"/><ellipse cx="46" cy="58" rx="12" ry="6" fill="#fff" opacity=".3" transform="rotate(-20 46 58)"/>';
  const CRITTERS = {
    cat_happy: ["bounce", cat("s-peach", "#ff9aa8") + line("M36 64q7-9 14 0M70 64q7-9 14 0", 4.5) + nose + line("M60 80q-8 10-16 4M60 80q8 10 16 4", 3.5) + whisk],
    cat_sleepy: ["float", cat("s-lav", "#ff9aa8") + line("M34 66h16M70 66h16", 4.5) + nose + line("M54 86q6 4 12 0", 3.5) + whisk + '<text x="90" y="30" font-size="16" font-weight="800" fill="#fff" font-family="Sora,sans-serif">z</text>'],
    cat_angry: ["shake", cat("s-red", "#ffd0d0") + line("M32 54l18 8M88 54l-18 8", 5) + dot(42, 68, 4.5) + dot(78, 68, 4.5) + nose + line("M48 90q12-9 24 0", 4.5) + whisk],
    cat_love: ["pulse", cat("s-pink", "#ff6b9d") + heart(44, 64, 1.4) + heart(76, 64, 1.4) + nose + line("M60 80q-8 10-16 4M60 80q8 10 16 4", 3.5) + whisk],
    fox_wink: ["wobble", fox("g-orange") + line("M34 62q7-9 14 0", 4.5) + line("M72 62h14", 4.5) + dot(60, 80, 5) + line("M60 84q-6 8-12 3M60 84q6 8 12 3", 3.2)],
    fox_smug: ["wobble", fox("g-orange") + '<path d="M34 62h16M70 62h16" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/><path d="M36 62a7 5 0 0 1 12 0M72 62a7 5 0 0 1 12 0" fill="' + INK + '"/>' + dot(60, 80, 5) + line("M50 90q12 6 22-2", 3.5)],
    bun_shy: ["float", bun("s-white") + line("M38 76q6-6 12 0M70 76q6-6 12 0", 4) + '<ellipse cx="60" cy="86" rx="4" ry="3" fill="#ff7fb0"/>' + blush.replace(/cy="70"/g, 'cy="88"')],
    bun_happy: ["bounce", bun("s-white") + dot(44, 76, 5) + dot(76, 76, 5) + '<ellipse cx="60" cy="86" rx="4" ry="3" fill="#ff7fb0"/>' + line("M60 90q-6 8-12 3M60 90q6 8 12 3", 3.2)],
  };

  const PACKS = { blobs: BLOBS, words: WORDS, spirits: SPIRITS, sparks: SPARKS, critters: CRITTERS };
  AVTV.PACK_ORDER = ["blobs", "words", "spirits", "sparks", "critters"];
  AVTV.STICKER_PACKS = Object.fromEntries(Object.entries(PACKS).map(([k, v]) => [k, Object.keys(v)]));
  AVTV.sticker = function (code, size) {
    const [pack, id] = String(code || "").split(":");
    const def = PACKS[pack] && PACKS[pack][id];
    if (!def) return "";
    const s = wrap(id.replace(/_/g, " "), def[0], def[1]);
    return size ? s.replace("<svg ", '<svg width="' + size + '" height="' + size + '" ') : s;
  };
})();
