/* home.html logic: hero, latest (paginated), top anime, schedule, continue watching, search */
(function () {
  "use strict";
  const esc = AVTV.esc;
  const $ = (s, r) => (r || document).querySelector(s);
  const PER_PAGE = 18;
  const CC = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm4.5 9.2c1.1 0 1.8-.5 2.1-1.2l-1-.5c-.2.4-.5.6-1 .6-.8 0-1.3-.6-1.3-1.6s.5-1.6 1.3-1.6c.5 0 .8.2 1 .6l1-.5c-.3-.7-1-1.2-2.1-1.2-1.5 0-2.6 1.1-2.6 2.7s1.1 2.7 2.6 2.7zm6.6 0c1.1 0 1.8-.5 2.1-1.2l-1-.5c-.2.4-.5.6-1 .6-.8 0-1.3-.6-1.3-1.6s.5-1.6 1.3-1.6c.5 0 .8.2 1 .6l1-.5c-.3-.7-1-1.2-2.1-1.2-1.5 0-2.6 1.1-2.6 2.7s1.1 2.7 2.6 2.7z"/></svg>';

  async function getJSON(url, ms) {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms || 12000);
    try {
      const r = await fetch(url, { headers: { Accept: "application/json" }, signal: ctl.signal });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    } finally { clearTimeout(t); }
  }
  const typeOf = (a) => (a.terms_by_type && a.terms_by_type.type && a.terms_by_type.type[0]) || "";
  const cleanDesc = (s) => (s || "").replace(/\(Source:.*?\)/i, "").replace(/\[Written by.*?\]/i, "").trim();
  const detailsHref = (id, title) => (id ? "details.html?id=" + encodeURIComponent(id) : "search.html?keyword=" + encodeURIComponent(title || ""));

  /* ================= HERO ================= */
  let slides = [], cur = 0, heroTimer = null;
  function buildHero(list) {
    const hero = $("#hero");
    slides = list.map((a, i) => {
      const el = document.createElement("div");
      el.className = "slide" + (i === 0 ? " on" : "");
      const eps = a.is_sub ? '<span>🎞 ' + esc(a.is_sub) + " eps</span>" : "";
      el.innerHTML =
        '<div class="bg" style="background-image:url(\'' + esc(a.background_image) + '\')"></div>' +
        '<div class="slide-c"><div class="sp-tag">#' + (i + 1) + " Spotlight</div><h1>" + esc(a.title) + "</h1>" +
        '<div class="sp-meta">' + (typeOf(a) ? "<span>▶ " + esc(typeOf(a)) + "</span>" : "") +
        (a.score ? '<span class="star">★ ' + esc(a.score) + "</span>" : "") + eps + (a.year ? "<span>" + esc(a.year) + "</span>" : "") + "</div>" +
        '<p class="sp-desc">' + esc(cleanDesc(a.description) || "No synopsis available.") + "</p>" +
        '<div class="sp-btns"><a class="btn primary" href="watch.html?id=' + encodeURIComponent(a.id) + '"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>Watch now</a>' +
        '<a class="btn" href="details.html?id=' + encodeURIComponent(a.id) + '">Details</a></div></div>';
      hero.insertBefore(el, $("#hero-nav"));
      return el;
    });
    $("#hero-sk").remove();
    if (slides.length > 1) $("#hero-nav").style.display = "flex";
    startAuto();
  }
  function go(n) {
    if (!slides.length) return;
    slides[cur].classList.remove("on");
    cur = (n + slides.length) % slides.length;
    slides[cur].classList.add("on");
  }
  function startAuto() { clearInterval(heroTimer); if (slides.length > 1) heroTimer = setInterval(() => go(cur + 1), 7000); }
  $("#hero-prev").onclick = () => { go(cur - 1); startAuto(); };
  $("#hero-next").onclick = () => { go(cur + 1); startAuto(); };
  $("#hero").addEventListener("mouseenter", () => clearInterval(heroTimer));
  $("#hero").addEventListener("mouseleave", startAuto);

  async function loadHero() {
    try {
      const j = await getJSON("/api/recent?page=1&per_page=60");
      const rows = (j.data || []).filter((a) => a.background_image);
      const airing = rows.filter((a) => /airing/i.test(a.status || ""));
      const pool = (airing.length >= 3 ? airing : rows).sort((a, b) => (parseFloat(b.score) || 0) - (parseFloat(a.score) || 0));
      if (!pool.length) throw new Error("empty");
      buildHero(pool.slice(0, 6));
    } catch (e) {
      $("#hero-sk").outerHTML = '<div class="hero-sk" style="animation:none;display:flex;align-items:center;justify-content:center;color:var(--muted);font-family:var(--font-mono);font-size:13px">Spotlight unavailable right now</div>';
    }
  }

  /* ================= LATEST ================= */
  let tab = "all", page = 1, totalPages = 1, loading = false;
  const grid = $("#latest-grid"), pager = $("#latest-pager");

  function skeleton() {
    grid.innerHTML = Array.from({ length: PER_PAGE }, () => '<div class="lcard lsk" style="opacity:1;animation:none"><div class="lc-poster"></div><div class="skeleton-line"></div><div class="skeleton-line short"></div></div>').join("");
  }
  function card(a, i) {
    const air = /airing/i.test(a.status || "") ? '<span class="b-air">● Airing</span>' : "";
    return '<a class="lcard" style="--i:' + i + '" href="' + detailsHref(a.id, a.title) + '"><div class="lc-poster"><img src="' + esc(a.poster) + '" alt="" loading="lazy">' + air +
      '<div class="lc-badges">' + (a.is_sub ? '<span class="b-cc">' + CC + esc(a.is_sub) + "</span>" : "<span></span>") + '<span class="b-type">' + esc(typeOf(a)) + "</span></div></div>" +
      '<div class="lc-title">' + esc(a.title) + "</div></a>";
  }
  function renderPager() {
    if (tab === "trending" || totalPages <= 1) { pager.innerHTML = ""; return; }
    const set = new Set([1, totalPages, page - 1, page, page + 1]);
    if (page <= 3) { set.add(2); set.add(3); }
    const nums = [...set].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
    let html = '<button type="button" data-p="' + (page - 1) + '"' + (page <= 1 ? " disabled" : "") + ">‹</button>", prev = 0;
    nums.forEach((n) => {
      if (n - prev > 1) html += '<span class="gap">…</span>';
      html += '<button type="button" data-p="' + n + '" class="' + (n === page ? "on" : "") + '">' + n.toLocaleString() + "</button>"; prev = n;
    });
    html += '<button type="button" data-p="' + (page + 1) + '"' + (page >= totalPages ? " disabled" : "") + ">›</button>";
    pager.innerHTML = html;
  }
  async function loadLatest(p) {
    if (loading) return; loading = true; skeleton(); pager.innerHTML = "";
    try {
      let rows;
      if (tab === "trending") {
        const j = await getJSON("/api/top-ten");
        rows = (j.results.week || []).map((t) => ({ id: t.id, title: t.title, poster: t.poster, status: "" }));
        totalPages = 1; page = 1;
      } else {
        if (tab === "random") { p = 1 + Math.floor(Math.random() * Math.max(1, Math.min(totalPages, 400))); }
        const j = await getJSON("/api/recent?page=" + p + "&per_page=" + PER_PAGE);
        if (!j.ok || !Array.isArray(j.data)) throw new Error("bad");
        rows = j.data; page = p; totalPages = (j.pagination && j.pagination.total_pages) || 1;
      }
      grid.innerHTML = rows.map(card).join("");
      renderPager();
    } catch (e) {
      grid.innerHTML = '<div class="grid-status err" style="grid-column:1/-1">Couldn\'t load episodes. <button class="btn sm" id="retry-latest" type="button">Retry</button></div>';
      const b = $("#retry-latest"); if (b) b.onclick = () => { loading = false; loadLatest(page); };
    } finally { loading = false; }
  }
  pager.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-p]"); if (!b || b.disabled) return;
    loadLatest(Number(b.dataset.p));
    $(".latest").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $("#latest-tabs").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-tab]"); if (!b) return;
    document.querySelectorAll("#latest-tabs button").forEach((x) => x.classList.toggle("on", x === b));
    tab = b.dataset.tab; loading = false; loadLatest(1);
  });

  /* ================= TOP ANIME ================= */
  let topData = null, range = "today";
  function renderTop() {
    const body = $("#pop-body"), list = (topData && topData[range]) || [];
    if (!list.length) { body.innerHTML = '<div class="grid-status">No data yet.</div>'; return; }
    const [f, ...rest] = list;
    body.innerHTML =
      '<a class="pop-feat" href="' + detailsHref(f.id, f.title) + '"><div class="bgimg" style="background-image:url(\'' + esc(f.poster) + '\')"></div><img src="' + esc(f.poster) + '" alt="">' +
      '<div><div class="t">#1 MOST WATCHED</div><h3>' + esc(f.title) + "</h3></div></a>" +
      rest.map((a) => '<a class="pop-item" href="' + detailsHref(a.id, a.title) + '"><span class="pop-rank">' + esc(a.rank) + '</span><img src="' + esc(a.poster) + '" alt="" loading="lazy"><span class="pt">' + esc(a.title) + "</span></a>").join("");
  }
  async function loadTop() {
    $("#pop-body").innerHTML = '<div class="pop-sk" style="height:132px"></div>' + '<div class="pop-sk"></div>'.repeat(5);
    try { topData = (await getJSON("/api/v1/top-ten")).results; renderTop(); }
    catch (e) { $("#pop-body").innerHTML = '<div class="grid-status err">Couldn\'t load top anime.</div>'; }
  }
  $("#pop-tabs").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-range]"); if (!b) return;
    document.querySelectorAll("#pop-tabs button").forEach((x) => x.classList.toggle("on", x === b));
    range = b.dataset.range; if (topData) renderTop();
  });

  /* ================= SCHEDULE ================= */
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"], MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let weekStart = (() => { const d = new Date(today); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; })();
  let selected = ymd(today); const schedCache = {};

  function renderDays() {
    const days = $("#days");
    days.innerHTML = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart); d.setDate(d.getDate() + i);
      const k = ymd(d);
      return '<button type="button" class="day' + (k === selected ? " on" : "") + (k === ymd(today) ? " today" : "") + '" data-d="' + k + '"><small>' + MON[d.getMonth()] + " " + d.getDate() + "</small><b>" + DOW[d.getDay()] + "</b></button>";
    }).join("");
    const on = days.querySelector(".on"); if (on && days.scrollWidth > days.clientWidth) days.scrollLeft = on.offsetLeft - days.clientWidth / 2 + on.clientWidth / 2;
  }
  async function loadSchedule(date) {
    const list = $("#sched-list");
    list.innerHTML = '<div class="grid-status">Loading schedule…</div>';
    try {
      const rows = schedCache[date] || (schedCache[date] = (await getJSON("/api/v1/schedule?date=" + date)).results);
      if (date !== selected) return;
      list.innerHTML = rows.length ? rows.map((r) => {
        const inner = '<time>' + esc(r.time) + '</time><span class="st">' + esc(r.title) + '</span><span class="ep"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>Episode ' + esc(r.episode_no) + "</span>";
        return r.id ? '<a class="srow" href="details.html?id=' + encodeURIComponent(r.id) + '">' + inner + "</a>" : '<div class="srow">' + inner + "</div>";
      }).join("") : '<div class="grid-status">Nothing scheduled for this day.</div>';
    } catch (e) { delete schedCache[date]; list.innerHTML = '<div class="grid-status err">Couldn\'t load the schedule.</div>'; }
  }
  $("#days").addEventListener("click", (e) => {
    const b = e.target.closest(".day"); if (!b) return;
    selected = b.dataset.d; renderDays(); loadSchedule(selected);
  });
  const shiftWeek = (n) => { weekStart.setDate(weekStart.getDate() + n * 7); renderDays(); };
  $("#days-prev").onclick = () => { const d = $("#days"); if (d.scrollWidth > d.clientWidth + 4 && d.scrollLeft > 4) d.scrollBy({ left: -d.clientWidth * .66, behavior: "smooth" }); else shiftWeek(-1); };
  $("#days-next").onclick = () => { const d = $("#days"); if (d.scrollWidth > d.clientWidth + 4 && d.scrollLeft + d.clientWidth < d.scrollWidth - 4) d.scrollBy({ left: d.clientWidth * .66, behavior: "smooth" }); else shiftWeek(1); };
  function tick() { const n = new Date(); $("#now-clock").textContent = "- Now: " + n.toLocaleDateString() + " " + n.toLocaleTimeString(); }
  tick(); setInterval(tick, 1000);

  /* ================= CONTINUE WATCHING ================= */
  function renderCW() {
    const sec = $("#cw-section"), items = AVTV.cw.list();
    if (!items.length) { sec.innerHTML = ""; return; }
    sec.innerHTML = '<div class="panel-h"><h2>Continue Watching</h2><button class="link-btn" id="cw-clear" type="button">Clear all</button></div><div class="cw-row">' + items.map((i) => AVTV.cw.cardHTML(i)).join("") + "</div>";
  }
  $("#cw-section").addEventListener("click", async (e) => {
    const x = e.target.closest("[data-remove]");
    if (x) { await AVTV.cw.remove(x.dataset.remove); renderCW(); AVTV.toast("Removed from Continue Watching"); return; }
    if (e.target.closest("#cw-clear") && confirm("Remove everything from Continue Watching?")) { await AVTV.cw.clear(); renderCW(); }
  });
  renderCW();
  document.addEventListener("avtv:user", renderCW);

  /* ================= SEARCH ================= */
  const form = $("#nav-search"), input = $("#q"), sugg = $("#sugg");
  let sTimer = null, sSeq = 0, items = [], act = -1;
  function closeSugg() { sugg.classList.remove("open"); act = -1; }
  async function runSearch(q) {
    const seq = ++sSeq;
    sugg.innerHTML = '<div class="none">Searching…</div>'; sugg.classList.add("open");
    try {
      const j = await getJSON("/api/v1/search?keyword=" + encodeURIComponent(q));
      if (seq !== sSeq) return;
      items = (j.results.data || []).slice(0, 6);
      sugg.innerHTML = items.length
        ? items.map((a) => '<a href="' + detailsHref(a.id, a.title) + '"><img src="' + esc(a.poster) + '" alt=""><span>' + esc(a.title) + "</span></a>").join("") + '<a class="all" href="search.html?keyword=' + encodeURIComponent(q) + '">View all results</a>'
        : '<div class="none">No anime found for “' + esc(q) + "”.</div>";
    } catch (e) { if (seq === sSeq) sugg.innerHTML = '<div class="none">Search is unavailable right now.</div>'; }
  }
  input.addEventListener("input", () => {
    clearTimeout(sTimer); const q = input.value.trim();
    if (q.length < 2) { closeSugg(); return; }
    sTimer = setTimeout(() => runSearch(q), 350);
  });
  input.addEventListener("keydown", (e) => {
    const links = [...sugg.querySelectorAll("a")];
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!links.length) return; e.preventDefault();
      act = (act + (e.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
      links.forEach((l, i) => l.classList.toggle("act", i === act));
    } else if (e.key === "Enter" && act >= 0 && links[act]) { e.preventDefault(); location.href = links[act].href; }
  });
  form.addEventListener("submit", (e) => { e.preventDefault(); const q = input.value.trim(); if (q) location.href = "search.html?keyword=" + encodeURIComponent(q); });
  document.addEventListener("click", (e) => { if (!form.contains(e.target) && e.target.id !== "search-toggle") closeSugg(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "s" && !e.ctrlKey && !e.metaKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) { e.preventDefault(); form.classList.add("show"); input.focus(); }
  });
  $("#search-toggle").onclick = () => { form.classList.toggle("show"); if (form.classList.contains("show")) input.focus(); else closeSugg(); };

  $("#random-btn").onclick = async () => {
    try { const j = await getJSON("/api/v1/random"); location.href = detailsHref(j.results.id, j.results.title); }
    catch (e) { AVTV.toast("Couldn't pick a random anime right now.", "err"); }
  };

  /* ================= boot ================= */
  loadHero(); loadLatest(1); loadTop(); renderDays(); loadSchedule(selected);
  document.addEventListener("contextmenu", (e) => e.preventDefault());
})();
