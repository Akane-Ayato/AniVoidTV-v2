  const PER_PAGE = 20;
  const grid = document.getElementById("grid");
  const pageSub = document.getElementById("page-sub");
  const pagination = document.getElementById("pagination");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const pageInput = document.getElementById("page-input");
  const jumpBtn = document.getElementById("jump-btn");
  const totalPagesLabel = document.getElementById("total-pages");

  let currentPage = Math.max(1, parseInt(new URLSearchParams(location.search).get("page") || "1", 10) || 1);
  let totalPages = 1;
  let loading = false;

  function renderSkeleton(){
    grid.innerHTML = "";
    for(let i = 0; i < PER_PAGE; i++){
      const card = document.createElement("div");
      card.className = "skeleton-card";
      card.innerHTML = `
        <div class="skeleton-poster"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      `;
      grid.appendChild(card);
    }
  }

  function capitalize(s){ return typeof s === "string" && s.length ? s[0].toUpperCase() + s.slice(1) : s; }

  function statusBadge(status){
    if(!status) return "";
    if(/airing/i.test(status)){
      return '<span class="card-badge airing"><span class="dot"></span>Airing</span>';
    }
    if(/not yet/i.test(status)){
      return '<span class="card-badge up">Upcoming</span>';
    }
    if(/finish|complet/i.test(status)){
      return '<span class="card-badge finished">Finished</span>';
    }
    return `<span class="card-badge">${status}</span>`;
  }

  function makeCard(anime, i){
    const a = document.createElement("a");
    a.className = "anime-card";
    a.style.setProperty("--i", i);
    a.href = "details.html?id=" + encodeURIComponent(anime.id);

    const type = anime.terms_by_type && anime.terms_by_type.type && anime.terms_by_type.type[0];
    const sub = [type, anime.aired ? String(anime.aired).split(" to ")[0] : null]
      .filter(Boolean).join(" · ");

    a.innerHTML = `
      <div class="card-poster">
        <img src="${anime.poster || ""}" alt="${(anime.title || "").replace(/"/g,'&quot;')}" loading="lazy">
        <div class="card-badges">
          ${statusBadge(anime.status)}
        </div>
      </div>
      <div class="card-title">${anime.title || "Untitled"}</div>
      <div class="card-sub">${sub || "&nbsp;"}</div>
    `;
    return a;
  }

  async function loadPage(page){
    if(loading) return;
    loading = true;
    currentPage = page;
    pageInput.value = page;
    history.replaceState(null, "", "upcoming.html?page=" + page);

    renderSkeleton();
    pageSub.textContent = "Loading upcoming releases…";
    pagination.style.display = "none";

    try{
      const res = await fetch(`/api/v1/upcoming?page=${page}&per_page=${PER_PAGE}`, { headers: { Accept: "application/json" }, credentials: "same-origin" });
      if(res.status === 503) throw new Error("building");
      if(!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      if(json.success && json.results){ const r = json.results; json.ok = true; json.data = r.data; json.pagination = { total_pages: r.pagination.totalPages, total: r.pagination.totalItems }; }

      if(!json.ok || !Array.isArray(json.data)){
        throw new Error(json.message || "Unexpected response");
      }

      grid.innerHTML = "";
      json.data.forEach((anime, i) => grid.appendChild(makeCard(anime, i)));

      const p = json.pagination || {};
      totalPages = p.total_pages || 1;
      totalPagesLabel.textContent = totalPages.toLocaleString();
      pageSub.textContent = p.total
        ? `${p.total.toLocaleString()} anime · showing page ${page.toLocaleString()} of ${totalPages.toLocaleString()}`
        : `Page ${page}`;

      prevBtn.disabled = page <= 1;
      nextBtn.disabled = page >= totalPages;
      pagination.style.display = "flex";

    } catch(err){
      grid.innerHTML = `<div class="grid-status err">${err.message === "building" ? "This list is still being prepared — check back in a few minutes." : "Couldn't load this page — try again in a moment."}</div>`;
      pageSub.textContent = "Something went wrong";
    } finally {
      loading = false;
    }
  }

  prevBtn.addEventListener("click", () => { if(currentPage > 1) loadPage(currentPage - 1); window.scrollTo({top:0, behavior:"smooth"}); });
  nextBtn.addEventListener("click", () => { if(currentPage < totalPages) loadPage(currentPage + 1); window.scrollTo({top:0, behavior:"smooth"}); });
  jumpBtn.addEventListener("click", () => {
    const n = parseInt(pageInput.value, 10);
    if(n >= 1 && n <= totalPages) { loadPage(n); window.scrollTo({top:0, behavior:"smooth"}); }
  });
  pageInput.addEventListener("keydown", e => { if(e.key === "Enter") jumpBtn.click(); });

  loadPage(currentPage);

  // Basic inspect deterrents — cosmetic only
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("keydown", e => {
    const k = e.key;
    if(k === "F12" || (e.ctrlKey && e.shiftKey && (k === "I" || k === "J" || k === "C")) || (e.ctrlKey && k === "U")){
      e.preventDefault();
    }
  });
