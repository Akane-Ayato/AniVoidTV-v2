/* Banner scenes: animated particle fields and layered silhouettes (SVG + CSS). Recipes: assets/fx-recipes.js */
(function () {
  "use strict";
  const AVTV = (window.AVTV = window.AVTV || {});
  const f = (n) => Math.round(n * 100) / 100;
  function rng(seed) { let a = 0; for (let i = 0; i < seed.length; i++) a = (a * 31 + seed.charCodeAt(i)) | 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  const sky = (c) => (c ? '<div class="bsky" style="background:linear-gradient(180deg,' + c[0] + "," + c[1] + ')"></div>' : "");

  const SHAPE = {
    petal: (c, c2) => '<path d="M0 -5.4C4.4 -3 4.4 3 0 5.4C-4.4 3 -4.4 -3 0 -5.4Z" fill="' + c + '"/><path d="M0 -4C1.6 -2 1.6 1 0 3C-1.6 1 -1.6 -2 0 -4Z" fill="' + c2 + '" opacity=".7"/>',
    leaf: (c, c2) => '<path d="M0 -6C5 -3 5 3 0 6C-5 3 -5 -3 0 -6Z" fill="' + c + '"/><path d="M0 -5V5" stroke="' + c2 + '" stroke-width=".7" opacity=".8"/>',
    dot: (c) => '<circle r="2.6" fill="' + c + '"/>',
    spark: (c, c2) => '<circle r="4.6" fill="' + c + '" opacity=".28"/><circle r="2.2" fill="' + c + '"/><circle r="1" fill="' + c2 + '"/>',
    ash: (c) => '<path d="M-3 -1L-1 -3L2 -2L3 1L0 3L-2 2Z" fill="' + c + '"/>',
    bubble: (c, c2) => '<circle r="4.2" fill="' + c2 + '" fill-opacity=".18" stroke="' + c + '" stroke-width=".9"/><path d="M-2.4 -.6A2.6 2.6 0 0 1 -.6 -2.4" stroke="#fff" stroke-width=".9" fill="none" stroke-linecap="round"/>',
    heart: (c) => '<path d="M0 4.4C-6 -.6 -5 -5.6 0 -2.8C5 -5.6 6 -.6 0 4.4Z" fill="' + c + '"/>',
    confetti: (c) => '<rect x="-1.6" y="-3.4" width="3.2" height="6.8" rx=".6" fill="' + c + '"/>',
    star: (c, c2) => '<path d="M0 -5L1.5 -1.6L5 -1.2L2.3 1.2L3 4.8L0 3L-3 4.8L-2.3 1.2L-5 -1.2L-1.5 -1.6Z" fill="' + c + '"/>',
  };

  function particles(id, p, r) {
    let s = sky(p.sky);
    if (p.moon) s += '<svg class="bs" viewBox="0 0 300 100" preserveAspectRatio="xMaxYMin slice"><circle cx="248" cy="24" r="12" fill="#fff6d0"/><circle cx="253" cy="21" r="12" fill="' + p.sky[0] + '"/></svg>';
    const [d0, d1] = p.dur;
    for (let i = 0; i < p.n; i++) {
      const x = r() * 100, dur = d0 + r() * (d1 - d0), delay = -r() * dur, size = 7 + r() * 9, c = pick(r, p.c), c2 = pick(r, p.c);
      const cls = p.dir === "up" ? "bY-up" : p.dir === "diag" ? "bY-diag" : "bY-down";
      s += '<span class="bpw ' + cls + '" style="left:' + f(x) + "%;--t:" + f(dur) + "s;--d:" + f(delay) + 's"><svg class="bp" viewBox="-6 -6 12 12" style="width:' + f(size) + "px;height:" + f(size) + "px;--sw:" + f((r() - 0.5) * 2 * p.sway) + "px;--st:" + f(2 + r() * 3) + "s;--rot:" + f(120 + r() * 280) + 'deg">' + SHAPE[p.obj](c, c2) + "</svg></span>";
    }
    return s;
  }

  function stars(id, p, r) {
    let s = sky(p.sky);
    for (let i = 0; i < p.stars; i++) s += '<i class="bstar" style="left:' + f(r() * 100) + "%;top:" + f(r() * 78) + "%;width:" + f(1 + r() * 2.2) + "px;height:" + f(1 + r() * 2.2) + "px;background:" + pick(r, p.c) + ";--t:" + f(1.8 + r() * 3) + "s;--d:" + f(-r() * 4) + 's"></i>';
    for (let i = 0; i < p.shoot; i++) s += '<i class="bshoot" style="left:' + f(30 + r() * 70) + "%;top:" + f(r() * 40) + "%;--t:" + f(4 + r() * 5) + "s;--d:" + f(-r() * 8) + 's"></i>';
    return s;
  }

  function fireflies(id, p, r) {
    let s = sky(p.sky) + '<svg class="bs" viewBox="0 0 300 100" preserveAspectRatio="xMidYMax slice"><path d="M0 100V82C30 74 50 84 80 78C110 72 130 84 170 78C210 72 250 84 300 76V100Z" fill="#06120a" opacity=".9"/>' + [20, 60, 140, 210, 260].map((x, i) => '<path d="M' + x + " 82v-" + (6 + (i % 3) * 3) + 'm-2 0l2 -3 2 3" stroke="#0b2a14" stroke-width="1.2" fill="none"/>').join("") + "</svg>";
    for (let i = 0; i < p.n; i++) s += '<i class="bfly" style="left:' + f(r() * 100) + "%;top:" + f(15 + r() * 70) + "%;--t:" + f(7 + r() * 8) + "s;--d:" + f(-r() * 10) + "s;--x1:" + f((r() - 0.5) * 60) + "px;--y1:" + f((r() - 0.5) * 40) + "px;--x2:" + f((r() - 0.5) * 60) + "px;--y2:" + f((r() - 0.5) * 40) + "px;background:" + pick(r, p.c) + ";color:" + p.c[0] + '"></i>';
    return s;
  }

  function rain(id, p, r) {
    let s = sky(p.sky);
    if (p.bolt) s += '<div class="bflash"></div><svg class="bs bbolt" viewBox="0 0 300 100" preserveAspectRatio="xMidYMin slice"><path d="M170 0L160 30L176 32L150 70L162 46L148 44Z" fill="#fff" opacity=".95"/></svg>';
    for (let i = 0; i < p.n; i++) s += '<i class="bdrop" style="left:' + f(r() * 110 - 5) + "%;height:" + f(10 + r() * 14) + "px;background:" + pick(r, p.c) + ";--t:" + f(0.45 + r() * 0.5) + "s;--d:" + f(-r()) + 's"></i>';
    return s;
  }

  function fog(id, p, r) {
    let s = sky(p.sky);
    for (let i = 0; i < 5; i++) s += '<i class="bfog" style="top:' + f(10 + i * 17) + "%;width:" + f(60 + r() * 40) + "%;height:" + f(26 + r() * 20) + "%;background:" + pick(r, p.c) + ";--t:" + f(18 + r() * 14) + "s;--d:" + f(-r() * 20) + 's"></i>';
    return s;
  }

  function lanterns(id, p, r) {
    let s = sky(p.sky);
    for (let i = 0; i < 26; i++) s += '<i class="bstar" style="left:' + f(r() * 100) + "%;top:" + f(r() * 60) + '%;width:1.4px;height:1.4px;background:#fff;--t:3s;--d:' + f(-r() * 3) + 's"></i>';
    for (let i = 0; i < p.n; i++) {
      const sz = 12 + r() * 12, c = pick(r, p.c);
      s += '<span class="bpw bY-up" style="left:' + f(r() * 100) + "%;--t:" + f(9 + r() * 8) + "s;--d:" + f(-r() * 14) + 's"><svg class="bp" viewBox="-6 -8 12 16" style="width:' + f(sz) + "px;height:" + f(sz * 1.3) + "px;--sw:" + f((r() - 0.5) * 20) + 'px;--st:4s;--rot:0deg"><circle r="9" cy="0" fill="' + c + '" opacity=".22"/><path d="M-4 -4H4L5 4Q0 6 -5 4Z" fill="' + c + '" stroke="#5a2a10" stroke-width=".6"/><rect x="-3.4" y="-5.4" width="6.8" height="1.6" fill="#5a2a10"/><rect x="-3" y="4.2" width="6" height="1.2" fill="#5a2a10"/><path d="M-1.6 -3V3M1.6 -3V3" stroke="' + p.c[2] + '" stroke-width=".5" opacity=".7"/></svg></span>';
    }
    return s;
  }

  function cranes(id, p, r) {
    let s = sky(p.sky);
    for (let i = 0; i < p.n; i++) { const sz = 14 + r() * 14, y = 10 + r() * 60; s += '<span class="bfly-x" style="top:' + f(y) + "%;--t:" + f(14 + r() * 10) + "s;--d:" + f(-r() * 20) + 's"><svg class="bp" viewBox="-10 -8 20 16" style="width:' + f(sz) + "px;height:" + f(sz * 0.8) + 'px;--sw:0px;--st:1.2s;--rot:0deg"><path d="M-8 2L0 -2L9 1L1 5Z" fill="' + p.c[0] + '" stroke="#120f16" stroke-width=".5"/><path d="M0 -2L-5 -9L3 -1Z" fill="' + p.c[0] + '" stroke="#120f16" stroke-width=".5"/><path d="M0 -2L7 -8L4 0Z" fill="' + p.c[1] + '" stroke="#120f16" stroke-width=".5"/><path d="M9 1L13 -2L10 3Z" fill="' + p.c[1] + '"/></svg></span>'; }
    return s;
  }

  function dust(id, p, r) {
    let s = sky(p.sky) + '<svg class="bs" viewBox="0 0 300 100" preserveAspectRatio="none">' + [[40, 90, 70], [120, 160, 110], [190, 250, 90]].map(([a, b, w], i) => '<polygon class="bbeam" style="--d:' + -i * 2 + 's" points="' + a + ",0 " + (a + w) + ',0 ' + b + ',100 ' + (b - w * 0.6) + ',100" fill="' + p.c[0] + '" opacity=".14"/>').join("") + "</svg>";
    for (let i = 0; i < 34; i++) s += '<i class="bfly" style="left:' + f(r() * 100) + "%;top:" + f(r() * 100) + "%;width:2px;height:2px;--t:" + f(8 + r() * 8) + "s;--d:" + f(-r() * 10) + "s;--x1:" + f((r() - 0.5) * 30) + "px;--y1:" + f(-r() * 24) + "px;--x2:" + f((r() - 0.5) * 30) + "px;--y2:" + f(-r() * 30) + "px;background:" + pick(r, p.c) + ';opacity:.8"></i>';
    return s;
  }

  const SCENES = {
    ocean: (p, r) => {
      let s = '<div class="bsky" style="background:linear-gradient(180deg,' + p.c[1] + "," + p.c[0] + ')"></div><svg class="bs" viewBox="0 0 300 100" preserveAspectRatio="xMidYMax slice">' +
        [30, 110, 190, 260].map((x, i) => '<polygon class="bbeam" style="--d:' + -i * 1.5 + 's" points="' + x + ",0 " + (x + 26) + ",0 " + (x + 10) + ',100 ' + (x - 30) + ',100" fill="' + p.c[2] + '" opacity=".1"/>').join("") +
        [20, 75, 150, 225, 280].map((x, i) => '<path class="bweed" style="--d:' + -i + 's;transform-origin:' + x + 'px 100px" d="M' + x + " 100C" + (x - 6) + " 86 " + (x + 6) + " 74 " + x + " " + (58 - (i % 3) * 8) + 'C' + (x + 4) + " 74 " + (x - 4) + " 86 " + x + ' 100Z" fill="#0b3b3a" opacity=".85"/>').join("") + "</svg>";
      for (let i = 0; i < p.bub; i++) s += '<span class="bpw bY-up" style="left:' + f(r() * 100) + "%;--t:" + f(5 + r() * 6) + "s;--d:" + f(-r() * 10) + 's"><svg class="bp" viewBox="-6 -6 12 12" style="width:' + f(5 + r() * 8) + "px;height:" + f(5 + r() * 8) + 'px;--sw:' + f((r() - 0.5) * 14) + 'px;--st:3s;--rot:0deg">' + SHAPE.bubble(p.c[2], "#fff") + "</svg></span>";
      s += [0, 1, 2].map((i) => '<svg class="bfish" viewBox="-10 -5 20 10" style="top:' + (22 + i * 20) + "%;--t:" + (20 + i * 6) + "s;--d:" + -i * 8 + 's"><path d="M-8 0Q-2 -5 6 0Q-2 5 -8 0ZM6 0L10 -3.4V3.4Z" fill="#0b2a44" opacity=".8"/></svg>').join("");
      return s;
    },
    mountain: (p, r) => '<div class="bsky" style="background:linear-gradient(180deg,' + p.c[0] + "," + p.c[1] + ')"></div><svg class="bs" viewBox="0 0 300 100" preserveAspectRatio="xMidYMax slice"><circle cx="230" cy="26" r="9" fill="#fff6d0" opacity=".9"/>' +
      '<path d="M0 100V58L40 34L72 56L112 24L158 60L200 40L246 64L300 36V100Z" fill="' + p.c[1] + '"/><path d="M0 100V74L36 52L82 72L126 46L176 76L222 56L264 78L300 60V100Z" fill="' + p.c[2] + '"/><path d="M0 100V88L50 74L96 90L150 70L210 90L260 76L300 88V100Z" fill="#0b1020"/></svg>' +
      [0, 1, 2].map((i) => '<i class="bfog" style="top:' + (46 + i * 14) + "%;width:80%;height:22%;background:" + p.c[3] + ";opacity:.25;--t:" + (22 + i * 8) + "s;--d:" + -i * 9 + 's"></i>').join(""),
    city: (p, r) => {
      let b = "", w = "", x = 0; while (x < 300) { const bw = 10 + r() * 16, h = 28 + r() * 46; b += '<rect x="' + f(x) + '" y="' + f(100 - h) + '" width="' + f(bw) + '" height="' + f(h) + '" fill="#07080f"/>'; for (let j = 0; j < 9; j++) if (r() > 0.45) w += '<rect class="bwin" style="--d:' + f(-r() * 6) + 's" x="' + f(x + 2 + r() * (bw - 5)) + '" y="' + f(100 - h + 3 + r() * (h - 8)) + '" width="1.6" height="1.8" fill="' + pick(r, [p.c[2], p.c[2], p.c[3]]) + '"/>'; x += bw + 1; }
      let s = '<div class="bsky" style="background:linear-gradient(180deg,' + p.c[0] + "," + p.c[1] + ')"></div>'; for (let i = 0; i < 24; i++) s += '<i class="bstar" style="left:' + f(r() * 100) + "%;top:" + f(r() * 45) + '%;width:1.5px;height:1.5px;background:#fff;--t:3s;--d:' + f(-r() * 3) + 's"></i>';
      return s + '<svg class="bs" viewBox="0 0 300 100" preserveAspectRatio="xMidYMax slice">' + b + w + '<circle class="bwin" cx="150" cy="38" r="1.4" fill="#ff4d4d"/></svg>';
    },
    dusk: (p, r) => {
      let b = "", x = 0; while (x < 300) { const bw = 12 + r() * 18, h = 20 + r() * 34; b += '<rect x="' + f(x) + '" y="' + f(100 - h) + '" width="' + f(bw) + '" height="' + f(h) + '" fill="' + p.c[3] + '"/>'; x += bw; }
      return '<div class="bsky" style="background:linear-gradient(180deg,' + p.c[0] + " 0%," + p.c[1] + " 62%," + p.c[2] + ' 100%)"></div><svg class="bs" viewBox="0 0 300 100" preserveAspectRatio="xMidYMax slice"><circle cx="190" cy="66" r="22" fill="' + p.c[2] + '" opacity=".9"/>' + [0, 1, 2].map((i) => '<rect class="bcloud" style="--d:' + -i * 7 + 's;--t:' + (30 + i * 8) + 's" x="' + (20 + i * 90) + '" y="' + (20 + i * 12) + '" width="60" height="2.6" rx="1.3" fill="#fff" opacity=".28"/>').join("") + b + "</svg>";
    },
    waves: (p, r) => {
      const wave = (y, amp, col, t, d) => '<g class="bwave" style="--t:' + t + "s;--d:" + d + 's"><path d="M0 ' + y + (() => { let q = ""; for (let i = 0; i < 8; i++) q += "Q" + (i * 75 + 37.5) + " " + (y + (i % 2 ? amp : -amp)) + " " + (i * 75 + 75) + " " + y; return q; })() + "V100H0Z" + '" fill="' + col + '"/></g>';
      return '<div class="bsky" style="background:linear-gradient(180deg,' + p.c[3] + "," + p.c[2] + ')"></div><svg class="bs" viewBox="0 0 300 100" preserveAspectRatio="none"><g>' + wave(52, 7, p.c[2], 9, 0) + wave(62, 6, p.c[1], 7, -2) + wave(74, 5, p.c[0], 5, -4) + "</g></svg>";
    },
    pines: (p, r) => {
      let t = ""; for (let i = 0; i < 12; i++) { const x = 8 + i * 25 + r() * 10, h = 26 + r() * 30; t += '<path d="M' + f(x) + " " + f(100 - h) + "L" + f(x - 9) + " " + f(100 - h * 0.45) + "H" + f(x - 5) + "L" + f(x - 12) + " 92H" + f(x + 12) + "L" + f(x + 5) + " " + f(100 - h * 0.45) + "H" + f(x + 9) + 'Z" fill="' + p.c[1] + '"/><path d="M' + f(x) + " " + f(100 - h) + "L" + f(x - 5) + " " + f(100 - h + 12) + "H" + f(x + 5) + 'Z" fill="' + p.c[2] + '"/>'; }
      return '<div class="bsky" style="background:linear-gradient(180deg,' + p.c[0] + "," + p.c[1] + ')"></div><svg class="bs" viewBox="0 0 300 100" preserveAspectRatio="xMidYMax slice">' + t + '<path d="M0 100V92Q75 86 150 92T300 90V100Z" fill="' + p.c[2] + '"/></svg>' + particles("snow", { obj: "dot", n: 36, c: ["#ffffff", "#dcefff"], dur: [5, 9], dir: "down", sway: 10 }, r);
    },
    jelly: (p, r) => {
      let s = '<div class="bsky" style="background:linear-gradient(180deg,' + p.c[0] + ',#050a18)"></div>';
      [[18, 44, 22], [48, 62, 16], [74, 36, 26], [90, 70, 14]].forEach(([x, y, sz], i) => { const col = p.c[1 + (i % 3)]; s += '<span class="bjelly" style="left:' + x + "%;top:" + y + "%;--t:" + (7 + i * 1.7) + "s;--d:" + -i * 2 + 's"><svg viewBox="-12 -10 24 34" style="width:' + sz + "px;height:" + f(sz * 1.4) + 'px"><path class="bbell" d="M-10 4A10 9 0 0 1 10 4Q0 7 -10 4Z" fill="' + col + '" fill-opacity=".55" stroke="' + col + '" stroke-width=".8"/>' + [-6, -2, 2, 6].map((tx, k) => '<path class="btent" style="--d:' + -k * 0.3 + 's" d="M' + tx + " 5Q" + (tx + 3) + " 11 " + tx + " 16T" + tx + ' 26" stroke="' + col + '" stroke-width=".9" fill="none" stroke-linecap="round"/>').join("") + "</svg></span>"; });
      return s;
    },
  };

  const FAM = {
    b_fall: (id, p, r) => particles(id, p, r), b_stars: stars, b_fire: fireflies, b_rain: rain, b_fog: fog, b_lantern: lanterns, b_crane: cranes, b_dust: dust,
    b_scene: (id, p, r) => SCENES[p.scene](p, r),
  };
  AVTV.bannerFamilies = Object.keys(FAM);
  const cache = {};
  AVTV.bannerFx = function (id) {
    if (!id) return "";
    if (cache[id] !== undefined) return cache[id];
    const rec = AVTV.FX_RECIPES && AVTV.FX_RECIPES[id];
    return (cache[id] = rec && FAM[rec.fam] ? FAM[rec.fam](id, rec.p, rng(id)) : "");
  };
})();
