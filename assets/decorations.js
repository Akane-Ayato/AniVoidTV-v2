/* Avatar decorations: flat illustrated SVG overlays (wreaths, ears, crowns, wings, flames, seals, accessories...).
   Recipes come from assets/fx-recipes.js (generated from the backend catalog). Everything is drawn in a
   100x100 box centred on 0,0 where the picture is a circle of radius 36. */
(function () {
  "use strict";
  const AVTV = (window.AVTV = window.AVTV || {});
  const OL = "#120f16";
  const f = (n) => Math.round(n * 100) / 100;
  const rad = (d) => (d * Math.PI) / 180;

  function rng(seed) {
    let a = 0;
    for (let i = 0; i < seed.length; i++) a = (a * 31 + seed.charCodeAt(i)) | 0;
    return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const path = (d, fill, extra) => '<path d="' + d + '" fill="' + fill + '" stroke="' + OL + '" stroke-width=".9" stroke-linejoin="round"' + (extra || "") + "/>";
  const line = (d, stroke, w, extra) => '<path d="' + d + '" fill="none" stroke="' + stroke + '" stroke-width="' + (w || 1) + '" stroke-linecap="round" stroke-linejoin="round"' + (extra || "") + "/>";
  const circ = (x, y, r, fill, extra) => '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '"' + (extra || "") + "/>";
  const grp = (cls, style, inner, extra) => '<g class="' + cls + '" style="' + style + '"' + (extra || "") + ">" + inner + "</g>";
  const at = (x, y, rot, inner, sc) => '<g transform="translate(' + f(x) + " " + f(y) + ")" + (rot ? " rotate(" + f(rot) + ")" : "") + (sc && sc !== 1 ? " scale(" + f(sc) + ")" : "") + '">' + inner + "</g>";
  const anim = (name, t, delay, extra) => "--t:" + f(t) + "s;--d:" + f(delay) + "s;" + (extra || "");
  const polar = (deg, R) => [R * Math.sin(rad(deg)), -R * Math.cos(rad(deg))];
  const mirror = (inner) => inner + '<g transform="scale(-1 1)">' + inner + "</g>";
  const star = (r, fill) => { let d = ""; for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r, a = rad(i * 36); d += (i ? "L" : "M") + f(rr * Math.sin(a)) + " " + f(-rr * Math.cos(a)); } return path(d + "Z", fill); };

  /* ---------- single-shape builders (drawn pointing UP from 0,0) ---------- */
  const SHAPES = {
    leaf: (c1, c2, c3) => path("M0 0C7 -3 8 -11 0 -15C-8 -11 -7 -3 0 0Z", c1) + '<path d="M0 0C4 -3 5 -9 0 -15C-1 -8 -1 -3 0 0Z" fill="' + c2 + '" opacity=".6"/>' + line("M0 -1V-12", c3, .7),
    maple: (c1, c2, c3) => path("M0 0L-2 -5L-8 -4L-5 -9L-8 -12L-3 -12L0 -17L3 -12L8 -12L5 -9L8 -4L2 -5Z", c1) + line("M0 -2V-14M0 -6L-5 -9M0 -6L5 -9", c3, .6) + '<path d="M0 -17L3 -12L8 -12L5 -9L0 -8Z" fill="' + c2 + '" opacity=".45"/>',
    fern: (c1, c2, c3) => { let s = line("M0 0V-17", c3, 1.1); for (let k = 1; k <= 5; k++) { const y = -k * 3; s += at(0, y, -55, path("M0 0C2 -1 4 -3 5 -5C2 -4 0 -2 0 0Z", c1)) + at(0, y, 55, path("M0 0C-2 -1 -4 -3 -5 -5C-2 -4 0 -2 0 0Z", c1)); } return s + circ(0, -17, 1.2, c2); },
    petal: (c1, c2) => path("M0 0C5 -3 6 -10 0 -14C-6 -10 -5 -3 0 0Z", c1) + '<path d="M0 -2C2 -5 2 -9 0 -11C-2 -9 -2 -5 0 -2Z" fill="' + c2 + '" opacity=".85"/>',
    laurel: (c1, c2, c3) => line("M0 0V-3", c3, 1) + at(0, -2, -24, path("M0 0C3 -2 4 -8 0 -13C-4 -8 -3 -2 0 0Z", c1) + line("M0 -1V-11", c2, .6)) + at(0, -2, 24, path("M0 0C3 -2 4 -8 0 -13C-4 -8 -3 -2 0 0Z", c1) + line("M0 -1V-11", c2, .6)) + circ(0, -3, 1.3, c2),
    bamboo: (c1, c2, c3) => path("M-2.2 0H2.2V-14H-2.2Z", c1) + '<rect x="-1.2" y="-13" width="1" height="12" fill="' + c2 + '" opacity=".7"/>' + line("M-2.2 -5H2.2M-2.2 -10H2.2", c3, .8) + at(2, -9, 40, path("M0 0C4 -1 6 -4 7 -7C3 -6 1 -3 0 0Z", c1)),
    vine: (c1, c2, c3, i) => line("M0 0C-3 -5 3 -9 0 -14", c1, 1.7) + path("M1 -4L4.5 -5.2L1.6 -7Z", c3) + path("M-1 -9L-4.5 -10.2L-1.6 -12Z", c3) + (i % 3 === 0 ? circ(0, -15, 3.6, c2, ' stroke="' + OL + '" stroke-width=".8"') + line("M-1.6 -15.4C-.4 -17 1.8 -16.4 1.4 -14.8C1 -13.6 -.6 -13.8 -.6 -14.8", c3, .7) : at(0, -13, 35, SHAPES.leaf(c1, c1, c3), .6)),
    feather: (c1, c2, c3) => path("M0 0C6 -4 7 -12 0 -18C-7 -12 -6 -4 0 0Z", c1) + line("M0 0V-17", c2, .8) + line("M0 -5L4 -8M0 -8L4.4 -11.4M0 -5L-4 -8M0 -8L-4.4 -11.4", c3, .5),
    clover: (c1, c2, c3) => line("M0 0V-6", c3, 1) + [-50, 0, 50].map((a) => at(0, -6, a, path("M0 0C-2.4 -2.4 -5 -2.4 -5 -5C-5 -7.6 -1.6 -7.6 0 -5C1.6 -7.6 5 -7.6 5 -5C5 -2.4 2.4 -2.4 0 0Z", c1) + line("M0 -1V-5", c2, .5), .85)).join(""),
    pine: (c1, c2, c3) => line("M0 0V-3", c3, 1.2) + line("M0 -2L-7 -13M0 -2L0 -16M0 -2L7 -13M0 -2L-3.6 -14M0 -2L3.6 -14", c1, 1.5) + circ(-7, -13, 1.1, c2) + circ(0, -16, 1.2, c2) + circ(7, -13, 1.1, c2),
  };

  /* ---------- family builders: return {back, front} ---------- */
  const FAM = {};

  FAM.wreath = (p, r) => {
    const [c1, c2, c3] = p.c, shape = SHAPES[p.shape], n = p.n; let out = "";
    for (let i = 0; i < n; i++) {
      const th = (360 * i) / n, [x, y] = polar(th, 35), tilt = (i % 2 ? 1 : -1) * 26, sc = 0.9 + r() * 0.35;
      const inner = p.an === "spin" || p.an === "spinR" ? shape(c1, c2, c3, i) : grp("a-" + p.an, anim(p.an, p.t, -r() * p.t), shape(c1, c2, c3, i));
      out += at(x, y, th + tilt, inner, sc);
    }
    return { front: p.an === "spin" || p.an === "spinR" ? grp(p.an === "spin" ? "a-spin" : "a-spinR", anim("", p.t, 0), out) : out };
  };

  const FLOWERS = {
    daisy: (c1, c2) => { let s = ""; for (let i = 0; i < 8; i++) s += at(0, 0, i * 45, path("M0 -1C2 -3 2 -6 0 -7.5C-2 -6 -2 -3 0 -1Z", c1)); return s + circ(0, 0, 2.2, c2, ' stroke="' + OL + '" stroke-width=".6"'); },
    rose: (c1, c2) => circ(0, 0, 4.6, c1, ' stroke="' + OL + '" stroke-width=".8"') + circ(0, 0, 2.8, c2, ' opacity=".85"') + line("M-1.6 0.4C-1.6 -1.6 1.6 -1.8 1.6 0.2C1.6 2 -.4 2.2 -.6 0.8", OL, .6),
    lavender: (c1, c2, c3) => line("M0 0V-12", c3, 1) + [0, 1, 2, 3, 4].map((k) => circ(k % 2 ? 1.6 : -1.6, -3 - k * 2.2, 1.6, k % 2 ? c1 : c2)).join("") + circ(0, -13, 1.5, c1),
    sunflower: (c1, c2) => { let s = ""; for (let i = 0; i < 12; i++) s += at(0, 0, i * 30, path("M0 -2C2 -4 2 -7 0 -9C-2 -7 -2 -4 0 -2Z", c1)); return s + circ(0, 0, 3.6, c2, ' stroke="' + OL + '" stroke-width=".6"') + circ(-1, -1, .5, "#c28a4a") + circ(1, 1, .5, "#c28a4a") + circ(1, -1.2, .4, "#c28a4a"); },
    lotus: (c1, c2) => [-50, -25, 0, 25, 50].map((a) => at(0, 0, a, path("M0 0C4 -2 4 -8 0 -11C-4 -8 -4 -2 0 0Z", a === 0 ? c2 : c1))).join(""),
    tulip: (c1, c2, c3) => line("M0 0V8", c3, 1.1) + path("M-4.4 0C-5.4 -5 -2.6 -8 0 -9C2.6 -8 5.4 -5 4.4 0C2 1 -2 1 -4.4 0Z", c1) + '<path d="M0 -9C-1 -5 -1 -2 0 0C1 -2 1 -5 0 -9Z" fill="' + c2 + '" opacity=".6"/>',
  };
  FAM.flowers = (p, r) => {
    const [c1, c2, c3] = p.c, n = p.n; let out = line("M" + polar(-82, 36).map(f).join(" ") + "A36 36 0 0 1 " + polar(82, 36).map(f).join(" "), c3, 2.2);
    for (let i = 0; i < n; i++) {
      const th = -78 + (156 * i) / (n - 1), [x, y] = polar(th, 36.5), sc = 1.05 + r() * 0.35;
      const leaf = at(x, y, th + 70 * (i % 2 ? 1 : -1), SHAPES.leaf(c3, c3, OL), 0.7);
      out += leaf + grp("a-" + p.an, anim("", 3 + r() * 2, -r() * 4), at(x, y, th * 0.4, FLOWERS[p.kind](c1, c2, c3), sc), ' transform=""');
    }
    return { front: out.replace(/ transform=""/g, "") };
  };

  FAM.flame = (p, r) => {
    const [c1, c2, c3] = p.c; let out = "";
    for (let i = 0; i < p.n; i++) {
      const th = (360 * i) / p.n + r() * 6, [x, y] = polar(th, 33.5), sc = 0.85 + r() * 0.75;
      const tongue = path("M-4 0C-6 -6 -1 -9 -1 -17C3 -11 7 -7 4 0Z", c1) + '<path d="M-2.4 0C-3.4 -4 -.5 -6 0 -11C2 -7 4 -4 2.4 0Z" fill="' + c2 + '"/><path d="M-1.2 0C-1.6 -2 0 -3 0 -6C1 -3 1.8 -2 1.2 0Z" fill="' + c3 + '"/>';
      out += at(x, y, th, grp("a-flick", anim("", p.t * (0.8 + r() * 0.5), -r() * 2), tongue), sc);
    }
    return { front: circ(0, 0, 35.5, "none", ' stroke="' + c1 + '" stroke-width="1.6"') + out };
  };

  FAM.crystal = (p, r) => {
    const [c1, c2, c3] = p.c; let out = "";
    for (let i = 0; i < p.n; i++) {
      const th = (360 * i) / p.n + (i % 2) * 4, [x, y] = polar(th, 34), len = 0.8 + r() * 0.8;
      const shard = path("M-3 0L-1.8 -9L0 -16L1.8 -9L3 0L0 3Z", c1) + '<path d="M0 -16L1.8 -9L3 0L0 3Z" fill="' + c3 + '" opacity=".5"/><path d="M-1.8 -9L0 -16L-.6 -8Z" fill="' + c2 + '" opacity=".9"/>';
      const body = p.an === "spin" ? shard : grp("a-twinkle", anim("", 2 + r() * 2.5, -r() * 3), shard);
      out += at(x, y, th, body, len);
    }
    return { front: p.an === "spin" ? grp("a-spin", anim("", 50, 0), out) : out };
  };

  const ORB = {
    moon: (c1, c2) => path("M0 -4A4 4 0 1 0 3.6 2.4A5 5 0 0 1 0 -4Z", c1),
    star: (c1, c2) => star(4, c1),
    rune: (c1, c2) => line("M0 -4.2L3.6 0L0 4.2L-3.6 0Z", c1, 1.1) + line("M-1.4 -1L1.4 1M1.4 -1L-1.4 1", c2, .8),
    firefly: (c1, c2) => circ(0, 0, 4.5, c1, ' opacity=".22"') + circ(0, 0, 2.4, c1, ' opacity=".5"') + circ(0, 0, 1.3, c2),
    bubble: (c1, c2) => circ(0, 0, 3.4, c2, ' fill-opacity=".28" stroke="' + c1 + '" stroke-width=".9"') + line("M-1.8 -.6A2 2 0 0 1 -.4 -2", "#fff", .8),
    comet: (c1, c2) => '<path d="M0 0L-12 -2.2L-12 2.2Z" fill="' + c1 + '" opacity=".6"/>' + circ(0, 0, 2.8, c2, ' stroke="' + OL + '" stroke-width=".6"'),
    crane: (c1, c2) => path("M-5 1L0 -2L6 0L1 3Z", c1) + path("M0 -1L-4 -7L2 -2Z", c1) + path("M0 -1L5 -6L3 0Z", c2) + path("M6 0L9 -3L7 1Z", c2) + path("M-5 1L-8 3L-4 2Z", c1),
    gear: (c1, c2) => { let s = ""; for (let i = 0; i < 6; i++) s += at(0, 0, i * 60, '<rect x="-1" y="-4.8" width="2" height="2.6" fill="' + c1 + '" stroke="' + OL + '" stroke-width=".5"/>'); return grp("a-spin", anim("", 4, 0), s + circ(0, 0, 3.4, c1, ' stroke="' + OL + '" stroke-width=".7"') + circ(0, 0, 1.2, c2)); },
    petal: (c1, c2) => at(0, 2, 90, SHAPES.petal(c1, c2), 0.5),
  };
  FAM.orbit = (p, r) => {
    let out = "";
    for (let i = 0; i < p.n; i++) {
      const off = -((p.spd * i) / p.n);
      out += grp(i % 2 && p.obj === "gear" ? "a-spinR" : "a-spin", anim("", p.spd, off), at(0, -p.rad, 0, ORB[p.obj](p.c[0], p.c[1])));
    }
    return { front: circ(0, 0, p.rad, "none", ' stroke="' + p.c[0] + '" stroke-opacity=".18" stroke-width=".6" stroke-dasharray="1.5 3"') + out };
  };

  FAM.halo = (p, r) => {
    const [c1, c2] = p.c, Y = -41; let s;
    const ring = (y, rx, ry, w) => '<ellipse cx="0" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="' + OL + '" stroke-width="' + (w + 1.6) + '"/><ellipse cx="0" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="' + c1 + '" stroke-width="' + w + '"/><ellipse cx="0" cy="' + (y - 0.5) + '" rx="' + (rx - 1) + '" ry="' + (ry - 0.7) + '" fill="none" stroke="' + c2 + '" stroke-width=".7" opacity=".9"/>';
    switch (p.style) {
      case "twin": s = grp("a-bob", anim("", 3, 0), ring(Y, 17, 4.6, 2)) + grp("a-bob", anim("", 3, -1.5), ring(Y - 6, 11, 3, 1.6)); break;
      case "thorn": { let th = ""; for (let i = 0; i < 14; i++) { const a = (360 * i) / 14, x = 16 * Math.sin(rad(a)), y = Y - 4.4 * Math.cos(rad(a)); th += at(x, y, a, path("M-1.2 0L0 -3.6L1.2 0Z", c2)); } s = grp("a-bob", anim("", 3.4, 0), ring(Y, 16, 4.4, 1.6) + th); break; }
      case "rune": { let ticks = ""; for (let i = 0; i < 12; i++) { const a = (360 * i) / 12; ticks += line("M" + f(16 * Math.sin(rad(a))) + " " + f(Y - 4.5 * Math.cos(rad(a))) + "L" + f(19 * Math.sin(rad(a))) + " " + f(Y - 5.6 * Math.cos(rad(a))), c1, 1); } s = grp("a-bob", anim("", 3.2, 0), '<ellipse cx="0" cy="' + Y + '" rx="16" ry="4.5" fill="none" stroke="' + c1 + '" stroke-width="1.4" stroke-dasharray="3 2" class="a-dash" style="--t:5s"/>' + ticks); break; }
      case "eclipse": { let rays = ""; for (let i = 0; i < 12; i++) rays += at(0, 0, i * 30, line("M0 -12L0 -16", c1, 1.4)); s = grp("a-bob", anim("", 4, 0), at(0, -45, 0, grp("a-spin", anim("", 30, 0), rays) + circ(0, 0, 11, c2, ' stroke="' + c1 + '" stroke-width="1.4"'))); break; }
      case "lotus": s = grp("a-bob", anim("", 3.4, 0), at(0, -37, 0, [-60, -30, 0, 30, 60].map((a) => at(0, 0, a, path("M0 0C4 -3 4 -9 0 -12C-4 -9 -4 -3 0 0Z", a === 0 ? c2 : c1))).join(""))); break;
      case "broken": { const arcs = [[-70, -10], [10, 70], [100, 160]].map(([a, b]) => { const [x1, y1] = polar(a, 1), [x2, y2] = polar(b, 1); return line("M" + f(16 * x1) + " " + f(Y + 4.5 * y1) + "A16 4.5 0 0 1 " + f(16 * x2) + " " + f(Y + 4.5 * y2), c1, 2.2); }).join(""); s = grp("a-bob", anim("", 3, 0), arcs) + grp("a-twinkle", anim("", 1.2, 0), star(2.2, c2).replace("<path", '<path transform="translate(14 -46)"')) + grp("a-twinkle", anim("", 1.6, -.6), star(1.6, c1).replace("<path", '<path transform="translate(-15 -44)"')); break; }
      default: s = grp("a-bob", anim("", 3, 0), ring(Y, 16, 4.5, 2.1)) + grp("a-twinkle", anim("", 2, 0), star(2, c2).replace("<path", '<path transform="translate(13 -45)"'));
    }
    return { front: s };
  };

  const EARS = {
    cat: (c1, c2) => path("M-27 -24L-30 -49L-10 -34Z", c1) + path("M-25 -29L-27 -42L-15 -34Z", c2),
    fox: (c1, c2) => path("M-26 -22L-29 -53L-8 -35Z", c1) + path("M-24 -28L-26 -46L-14 -35Z", c2) + path("M-29 -53L-27.4 -47L-30.6 -47.6Z", OL),
    bunny: (c1, c2) => path("M-22 -30C-32 -44 -27 -61 -18 -50C-13 -43 -14 -37 -14 -33Z", c1) + path("M-21 -34C-27 -44 -24 -55 -19.6 -49C-17 -44 -17.6 -38 -17.6 -35Z", c2),
    wolf: (c1, c2) => path("M-27 -22L-31 -49L-20 -43L-9 -33Z", c1) + path("M-24 -28L-27 -44L-19 -39Z", c2),
    devil: (c1, c2) => path("M-18 -32C-25 -38 -30 -45 -26 -53C-20 -47 -12 -42 -10 -34Z", c1) + line("M-23 -45C-20 -41 -16 -38 -13 -36", c2, 1.1),
    oni: (c1, c2) => path("M-17 -33C-18 -42 -16 -48 -13 -52C-9 -46 -8 -40 -8 -34Z", c1) + line("M-16.6 -39H-9.4M-15.6 -44H-10.4", c2, 1.1),
    antlers: (c1, c2) => line("M-10 -34C-14 -42 -20 -46 -24 -56M-17 -43L-26 -44M-21 -50L-30 -53M-19 -46L-22 -38", c1, 2.2) + circ(-24, -56, 1.6, c2) + circ(-26, -44, 1.5, c2) + circ(-30, -53, 1.5, c2),
    bear: (c1, c2) => circ(-24, -28, 8.4, c1, ' stroke="' + OL + '" stroke-width=".9"') + circ(-24, -28, 4.6, c2),
    elf: (c1, c2) => path("M-34 -4C-44 -6 -50 -12 -54 -21C-46 -19 -40 -17 -34 -14Z", c1) + path("M-36 -8C-42 -10 -46 -13 -49 -17C-44 -16 -40 -15 -36 -12Z", c2),
  };
  FAM.ears = (p, r) => {
    const [c1, c2] = p.c;
    if (p.kind === "unicorn") {
      let sp = ""; for (let i = 0; i < 4; i++) sp += line("M" + f(-3.4 + i * 0.4) + " " + f(-38 - i * 4.8) + "L" + f(3.4 - i * 0.4) + " " + f(-41 - i * 4.8), c2, 1.2);
      return { front: grp("a-bob", anim("", 3, 0), path("M-4.6 -35L0 -61L4.6 -35Z", c1) + sp) + grp("a-twinkle", anim("", 1.4, 0), star(2.4, "#fff").replace("<path", '<path transform="translate(8 -56)"')) };
    }
    const body = EARS[p.kind](c1, c2), cls = p.an === "bob" ? "a-bob" : p.an === "sway" ? "a-sway" : "a-" + p.an;
    const origin = p.kind === "elf" ? "-34px -8px" : p.kind === "bear" ? "-24px -28px" : "-18px -32px";
    const one = (flip) => '<g transform="' + (flip ? "scale(-1 1)" : "") + '">' + grp(cls, anim("", 2.4 + (flip ? 0.5 : 0), flip ? -1.1 : 0, "transform-origin:" + origin), body) + "</g>";
    return { front: one(false) + one(true) };
  };

  FAM.crown = (p, r) => {
    const [c1, c2, c3] = p.c; let s;
    const glint = (x, y, t, d) => grp("a-twinkle", anim("", t, d), star(2.2, "#fff").replace("<path", '<path transform="translate(' + x + " " + y + ')"'));
    switch (p.style) {
      case "tiara": s = line("M-19 -32Q0 -52 19 -32", c1, 3) + line("M-19 -32Q0 -52 19 -32", c2, 1) + [-12, -6, 6, 12].map((x, i) => path("M" + (x - 1.6) + " " + f(-40 + Math.abs(x) * 0.5) + "L" + x + " " + f(-45 + Math.abs(x) * 0.3) + "L" + (x + 1.6) + " " + f(-40 + Math.abs(x) * 0.5) + "Z", c1)).join("") + path("M0 -50L3.4 -45L0 -40L-3.4 -45Z", c3) + glint(8, -50, 2, 0); break;
      case "laurel": { let l = ""; for (let i = 0; i < 7; i++) { const th = 52 + i * 11; const [x, y] = polar(th, 37), [x2, y2] = polar(-th, 37); l += at(x, y, th + 80, SHAPES.leaf(c1, c2, c3), 0.8) + at(x2, y2, -th - 80, SHAPES.leaf(c1, c2, c3), 0.8); } s = l; break; }
      case "thorn": { let t = ""; for (let i = 0; i < 9; i++) { const th = -64 + i * 16, [x, y] = polar(th, 37); t += at(x, y, th + (i % 2 ? 40 : -40), path("M-1.4 0L0 -5L1.4 0Z", c2)); } s = line("M" + polar(-72, 37).map(f).join(" ") + "A37 37 0 0 1 " + polar(72, 37).map(f).join(" "), c1, 2.4) + t + circ(-12, -37, 1.3, c3) + circ(16, -34, 1.2, c3); break; }
      case "star": { const stars = [-50, -25, 25, 50].map((th) => { const [x, y] = polar(th, 38); return star(3.6, c1).replace("<path", '<path transform="translate(' + f(x) + " " + f(y) + ')"'); }).join(""); s = line("M" + polar(-62, 37).map(f).join(" ") + "A37 37 0 0 1 " + polar(62, 37).map(f).join(" "), c1, 1.4) + stars + star(6, c1).replace("<path", '<path transform="translate(0 -43)"') + circ(0, -43, 1.8, c3) + glint(7, -49, 1.8, 0); break; }
      case "moon": s = grp("a-bob", anim("", 3.6, 0), path("M-7 -43C-7 -52 2 -57 9 -52C2 -52 0 -46 3 -41C-3 -39 -7 -39 -7 -43Z", c1) + star(2.2, c3).replace("<path", '<path transform="translate(12 -47)"') + star(1.6, c3).replace("<path", '<path transform="translate(-12 -46)"')) + glint(-6, -52, 2.2, 0); break;
      default: s = grp("a-bob", anim("", 3.2, 0), path("M-15 -34L-17 -45L-9 -40L-4.4 -49L0 -40L4.4 -49L9 -40L17 -45L15 -34Z", c1) + '<path d="M-15 -34L15 -34L15.6 -37L-15.6 -37Z" fill="' + c2 + '" opacity=".75"/>' + circ(-9, -41.5, 1.5, c3) + circ(0, -42, 1.7, c3) + circ(9, -41.5, 1.5, c3)) + glint(-5, -47, 2, 0);
    }
    return { front: s };
  };

  FAM.wings = (p, r) => {
    const [c1, c2, c3] = p.c; let wing = "";
    if (p.kind === "feather") {
      for (let k = 0; k < 3; k++) for (let i = 0; i < 5; i++) { const a = 28 + i * 13 + k * 3, len = (22 + (4 - i) * 3 - k * 4) / 18; wing += at(30, -6 + k * 3, a + 90 - 90, "<g transform=\"rotate(" + f(a - 40) + ")\">" + SHAPES.feather(k === 0 ? c1 : k === 1 ? c2 : c1, c3, c3) + "</g>", len * 1.15); }
    } else if (p.kind === "bat") {
      wing = path("M30 -8L56 -36L52 -16L61 -9L51 -1L55 9L43 3L38 15L33 5Z", c1) + line("M30 -8L56 -36M30 -8L61 -9M30 -8L55 9M30 -8L38 15", c3, 1.1) + '<path d="M30 -8L52 -16L51 -1L43 3Z" fill="' + c2 + '" opacity=".45"/>';
    } else {
      wing = path("M30 -6C38 -30 56 -40 58 -26C59 -14 44 -6 30 -6Z", c1) + path("M30 -4C44 -2 56 6 50 16C44 22 34 12 30 -4Z", c2) + circ(48, -24, 3, c3) + circ(46, 9, 2.2, c3) + line("M30 -6C42 -16 50 -22 55 -28M30 -4C40 2 46 8 48 13", c3, .8);
    }
    const side = (flip) => '<g transform="' + (flip ? "scale(-1 1)" : "") + '">' + grp("a-flap", anim("", p.t, flip ? -p.t / 2 : 0, "transform-origin:30px -6px"), wing) + "</g>";
    return { back: side(false) + side(true) };
  };

  FAM.magic = (p, r) => {
    const [c1, c2] = p.c; let ticks = "";
    for (let i = 0; i < 36; i++) { const a = i * 10, l = i % 3 ? 1.2 : 2.6; ticks += line("M" + f(47 * Math.sin(rad(a))) + " " + f(-47 * Math.cos(rad(a))) + "L" + f((47 - l) * Math.sin(rad(a))) + " " + f(-(47 - l) * Math.cos(rad(a))), c1, .8); }
    const poly = (n, R, step) => { let d = ""; for (let i = 0; i <= n; i++) { const a = rad((360 * ((i * step) % n)) / n); d += (i ? "L" : "M") + f(R * Math.sin(a)) + " " + f(-R * Math.cos(a)); } return d + "Z"; };
    let inner;
    if (p.style === "star") inner = grp("a-spin", anim("", 36, 0), line(poly(5, 42, 2), c1, 1.2) + [0, 1, 2, 3, 4].map((i) => circ(42 * Math.sin(rad(i * 72)), -42 * Math.cos(rad(i * 72)), 1.6, c2)).join(""));
    else if (p.style === "rings") inner = grp("a-spin", anim("", 28, 0), circ(0, 0, 43, "none", ' stroke="' + c1 + '" stroke-width="1.1" stroke-dasharray="6 4"')) + grp("a-spinR", anim("", 40, 0), circ(0, 0, 39.5, "none", ' stroke="' + c2 + '" stroke-width=".8" stroke-dasharray="2 5"')) + [0, 90, 180, 270].map((a) => at(...polar(a, 47), a, path("M0 -2.4L2 0L0 2.4L-2 0Z", c2))).join("");
    else inner = grp("a-spin", anim("", 34, 0), line(poly(6, 43, 1), c1, 1.3) + line(poly(3, 43, 1), c2, .9) + line(poly(6, 43, 2).replace(/Z$/, "Z"), c2, .9)) + grp("a-spinR", anim("", 50, 0), circ(0, 0, 40, "none", ' stroke="' + c1 + '" stroke-width=".7" stroke-dasharray="1 3"'));
    return { back: circ(0, 0, 47, "none", ' stroke="' + c1 + '" stroke-width="1.2"') + grp("a-spinR", anim("", 90, 0), ticks) + inner };
  };

  FAM.aura = (p, r) => {
    const [c1, c2] = p.c; let s = "";
    if (p.kind === "wisps") for (let i = 0; i < 7; i++) { const [x, y] = polar(i * 51 + 10, 36); s += at(x, y, i * 51 + 10, grp("a-rise", anim("", 3 + r() * 2, -r() * 4, "--dy:" + f(-8 - r() * 8) + "px"), path("M0 0C-3 -4 2 -7 0 -12C4 -8 5 -3 0 0Z", i % 2 ? c1 : c2, ' opacity=".85"'))); }
    else if (p.kind === "arcs") for (let i = 0; i < 6; i++) { const a = i * 60 + 15, [x, y] = polar(a, 35); s += at(x, y, a, grp("a-flash", anim("", 2.4 + r() * 1.6, -r() * 3), line("M0 0L-2 -4L2 -7L-1 -11L3 -15", c1, 1.6) + line("M0 0L-2 -4L2 -7L-1 -11L3 -15", c2, .6))); }
    else if (p.kind === "smoke") for (let i = 0; i < 7; i++) { const [x, y] = polar(i * 51 + 20, 37); s += at(x, y, 0, grp("a-puff", anim("", 3.6 + r() * 2, -r() * 4, "--dy:" + f(-8 - r() * 8) + "px"), circ(0, 0, 4 + r() * 3, i % 2 ? c1 : c2, ' fill-opacity=".7"'))); }
    else if (p.kind === "ripple") for (let i = 0; i < 3; i++) s += grp("a-ripple", anim("", 3, -i), circ(0, 0, 36, "none", ' stroke="' + (i % 2 ? c2 : c1) + '" stroke-width="1.6"'));
    else for (let i = 0; i < 3; i++) { const R = 38 + i * 4; s += grp(i % 2 ? "a-spinR" : "a-spin", anim("", 8 + i * 5, 0), line("M" + f(R) + " 0A" + R + " " + R + " 0 0 1 0 " + R, i % 2 ? c2 : c1, 2) + line("M" + f(-R) + " 0A" + R + " " + R + " 0 0 1 0 " + f(-R), i % 2 ? c1 : c2, 1.2)); }
    return { back: s };
  };

  FAM.cap = (p, r) => {
    const [c1, c2, c3] = p.c; let s;
    switch (p.kind) {
      case "sprout": s = grp("a-sway", anim("", 3, 0, "transform-origin:0px -35px"), line("M0 -35C-1 -40 1 -43 0 -47", c3, 1.8) + at(0, -46, -48, SHAPES.leaf(c1, c2, c3), 1.05) + at(0, -46, 52, SHAPES.leaf(c2, c1, c3), 0.9)); break;
      case "mush": s = grp("a-bob", anim("", 3.4, 0), path("M-24 -31C-24 -56 24 -56 24 -31C16 -28 -16 -28 -24 -31Z", c1) + '<path d="M-22 -31C-14 -28 14 -28 22 -31L22 -29C14 -25 -14 -25 -22 -29Z" fill="' + c3 + '" stroke="' + OL + '" stroke-width=".8"/>' + circ(-11, -42, 3.4, c2) + circ(5, -47, 4.2, c2) + circ(14, -39, 2.6, c2) + circ(-2, -37, 2, c2)); break;
      case "snow": s = path("M-26 -26C-20 -43 20 -43 26 -26C22 -30 18 -26 14 -30C10 -26 4 -30 0 -28C-4 -30 -10 -26 -14 -30C-18 -26 -22 -30 -26 -26Z", c1) + '<path d="M-26 -26C-22 -30 -18 -26 -14 -30C-10 -26 -4 -30 0 -28L0 -25C-6 -27 -10 -24 -14 -27C-20 -24 -22 -27 -26 -26Z" fill="' + c2 + '" opacity=".7"/>' + [-20, -6, 10, 22].map((x, i) => grp("a-fall", anim("", 3 + i * 0.6, -i, "--dy:16px"), circ(x, -34, 1.3, c1))).join(""); break;
      case "cloud": s = grp("a-bob", anim("", 3.6, 0), path("M-18 -40C-24 -40 -24 -48 -17 -48C-16 -54 -6 -55 -4 -50C2 -56 12 -52 11 -46C18 -46 19 -40 14 -40Z", c1) + '<path d="M-14 -42C-8 -40 8 -40 15 -42C14 -40 10 -39 0 -39C-8 -39 -12 -40 -14 -42Z" fill="' + c2 + '" opacity=".6"/>') + [-10, 0, 9].map((x, i) => grp("a-fall", anim("", 1.2 + i * 0.25, -i * 0.4, "--dy:12px"), line("M" + x + " -38L" + (x - 1) + " -34", c3, 1.4))).join(""); break;
      case "kasa": s = path("M-31 -29L0 -55L31 -29Q0 -23 -31 -29Z", c1) + line("M-20 -33L-10 -26M-10 -42L4 -25M2 -49L16 -25M-24 -30L-4 -50", c2, .6) + '<path d="M-31 -29Q0 -23 31 -29L29 -27Q0 -20 -29 -27Z" fill="' + c3 + '" opacity=".8"/>'; break;
      case "witch": s = path("M-31 -29Q0 -22 31 -29Q17 -33 13 -38L6 -66Q-5 -55 -12 -38Q-25 -33 -31 -29Z", c1) + '<path d="M-14 -37Q0 -33 13 -38L12 -41Q0 -36 -13 -41Z" fill="' + c2 + '"/>' + grp("a-twinkle", anim("", 1.6, 0), star(2.6, c3).replace("<path", '<path transform="translate(2 -50)"')); break;
      default: s = grp("a-sway", anim("", 4, 0, "transform-origin:-30px -36px"), line("M-34 -26C-26 -36 -14 -44 2 -48C12 -50 22 -48 30 -42", c1, 2.4) + [[-22, -38], [-8, -45], [8, -48], [22, -45]].map(([x, y], i) => circ(x, y, 3.2, i % 2 ? c2 : c3, ' stroke="' + OL + '" stroke-width=".6"') + circ(x, y, 1, "#ffcf5a")).join("")) + grp("a-fall", anim("", 4, 0, "--dy:22px"), path("M0 0C2 -1 3 -3 2 -5C0 -4 -1 -2 0 0Z", c3).replace("<path", '<path transform="translate(-14 -40)"'));
    }
    return { front: s };
  };

  const PART = {
    sparkle: (c1, c2) => star(3.2, c1), heart: (c1) => path("M0 3C-5 -1 -4 -5 0 -2.4C4 -5 5 -1 0 3Z", c1), bubble: (c1, c2) => circ(0, 0, 2.6, c2, ' fill-opacity=".3" stroke="' + c1 + '" stroke-width=".8"'),
    petal: (c1, c2) => at(0, 2, 0, SHAPES.petal(c1, c2), 0.4), dot: (c1) => circ(0, 0, 1.5, c1), leaf: (c1, c2) => at(0, 3, 0, SHAPES.leaf(c1, c2, OL), 0.45), star: (c1, c2) => star(2.6, c1),
  };
  FAM.part = (p, r) => {
    let s = "";
    for (let i = 0; i < p.n; i++) {
      const th = r() * 360, R = 37 + r() * 11, [x, y] = polar(th, R), cls = p.dir === "twinkle" ? "a-twinkle" : p.dir === "up" ? "a-rise" : "a-fall", col = i % 2 ? p.c[0] : p.c[1];
      s += at(x, y, 0, grp(cls, anim("", p.t * (0.7 + r() * 0.7), -r() * p.t, "--dy:" + (p.dir === "up" ? -18 : 20) + "px;--rot:" + f(120 + r() * 200) + "deg"), PART[p.obj](col, p.c[1])));
    }
    return { front: s };
  };

  FAM.tech = (p, r) => {
    const [c1, c2] = p.c; let s = "";
    if (p.kind === "pixel") for (let i = 0; i < 36; i++) { const [x, y] = polar(i * 10, 38 + (i % 3) * 1.8), z = 1.6 + (i % 4) * 0.5; s += grp("a-blink", anim("", 1.6, -(i % 7) * 0.23), '<rect x="' + f(x - z / 2) + '" y="' + f(y - z / 2) + '" width="' + z + '" height="' + z + '" fill="' + (i % 2 ? c1 : c2) + '"/>'); }
    else if (p.kind === "reticle") s = grp("a-spin", anim("", 14, 0), [0, 90, 180, 270].map((a) => at(0, 0, a, line("M-9 -43H-14M-14 -43V-38", c1, 1.8) + line("M9 -43H14M14 -43V-38", c1, 1.8))).join("")) + grp("a-spinR", anim("", 20, 0), circ(0, 0, 40, "none", ' stroke="' + c2 + '" stroke-width=".8" stroke-dasharray="2 4"'));
    else if (p.kind === "radar") s = circ(0, 0, 39, "none", ' stroke="' + c2 + '" stroke-width=".9"') + circ(0, 0, 45, "none", ' stroke="' + c2 + '" stroke-opacity=".5" stroke-width=".7"') + grp("a-spin", anim("", 3.2, 0), '<path d="M0 0L0 -45A45 45 0 0 1 32 -32Z" fill="' + c1 + '" fill-opacity=".38"/>' + line("M0 0V-45", c1, 1.4));
    else s = grp("a-glitch", anim("", 2.2, 0), '<rect x="-42" y="-42" width="84" height="84" rx="22" fill="none" stroke="' + c1 + '" stroke-width="1.6"/>') + grp("a-glitch", anim("", 2.2, -1.1), '<rect x="-42" y="-42" width="84" height="84" rx="22" fill="none" stroke="' + c2 + '" stroke-width="1.6"/>') + '<rect x="-30" y="-44" width="10" height="2" fill="' + c1 + '"/><rect x="18" y="40" width="14" height="2" fill="' + c2 + '"/>';
    return { front: s };
  };

  /* ---------- public API ---------- */
  const cache = {};
  AVTV.deco = function (id) {
    if (!id) return null;
    if (cache[id]) return cache[id];
    const rec = AVTV.FX_RECIPES && AVTV.FX_RECIPES[id];
    if (!rec || !FAM[rec.fam]) return null;
    const out = FAM[rec.fam](rec.p, rng(id));
    return (cache[id] = { back: out.back || "", front: out.front || "", color: (rec.p.c && (rec.p.c[1] || rec.p.c[0])) || "#ffd24a" });
  };
  AVTV.decoFamilies = Object.keys(FAM);
  const wrap = (cls, inner) => '<svg class="deco ' + cls + '" viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">' + inner + "</svg>";
  AVTV.decoLayers = function (id) { const d = AVTV.deco(id); return d ? { back: d.back ? wrap("back", d.back) : "", front: d.front ? wrap("front", d.front) : "" } : { back: "", front: "" }; };

  /* click on a decorated avatar: small burst of sparks in its colour */
  AVTV.burst = function (av) {
    const color = av.dataset.dc || "#ffd24a", n = 14, box = document.createElement("span");
    box.className = "burst";
    for (let i = 0; i < n; i++) {
      const a = (360 * i) / n + Math.random() * 20, d = 38 + Math.random() * 26, s = document.createElement("i");
      s.style.cssText = "--a:" + a + "deg;--d:" + d + "px;background:" + color;
      box.appendChild(s);
    }
    av.appendChild(box); setTimeout(() => box.remove(), 900);
  };
  document.addEventListener("click", (e) => { const av = e.target.closest && e.target.closest(".av.has-deco"); if (av) AVTV.burst(av); });
})();
