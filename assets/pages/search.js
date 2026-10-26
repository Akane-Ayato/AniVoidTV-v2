  const PER_PAGE = 30;
  const grid = document.getElementById("grid");
  const pageSub = document.getElementById("page-sub");
  const pagination = document.getElementById("pagination");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const pageInput = document.getElementById("page-input");
  const jumpBtn = document.getElementById("jump-btn");
  const totalPagesLabel = document.getElementById("total-pages");
  const sInput = document.getElementById("s-input");
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const params = new URLSearchParams(location.search);
  let keyword = (params.get("keyword") || "").trim();
  let currentPage = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);
  let totalPages = 1;
  let loading = false;
  sInput.value = keyword;

  function renderSkeleton(){
    grid.innerHTML = "";
    for(let i = 0; i < 12; i++){
      const card = document.createElement("div");
      card.className = "skeleton-card";
      card.innerHTML = '<div class="skeleton-poster"></div><div class="skeleton-line"></div><div class="skeleton-line short"></div>';
      grid.appendChild(card);
    }
  }

  function makeCard(a, i){
    const el = document.createElement("a");
    el.className = "anime-card";
    el.style.setProperty("--i", i);
    el.href = a.id ? "details.html?id=" + encodeURIComponent(a.id) : "search.html?keyword=" + encodeURIComponent(a.title || "");
    el.innerHTML = '<div class="card-poster"><img src="' + esc(a.poster) + '" alt="" loading="lazy"></div><div class="card-title">' + esc(a.title || "Untitled") + '</div>';
    return el;
  }

  async function loadPage(page){
    if(!keyword){ grid.innerHTML = ""; pagination.style.display = "none"; pageSub.textContent = "Type a title to find an anime."; return; }
    if(loading) return;
    loading = true;
    currentPage = page;
    pageInput.value = page;
    history.replaceState(null, "", "search.html?keyword=" + encodeURIComponent(keyword) + (page > 1 ? "&page=" + page : ""));
    document.title = keyword + " — Search — AnivoidTV";
    renderSkeleton();
    pageSub.textContent = "Searching…";
    pagination.style.display = "none";
    try{
      const res = await fetch("/api/v1/search?keyword=" + encodeURIComponent(keyword) + "&page=" + page, { headers: { Accept: "application/json" } });
      if(!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      const r = json.results || {};
      grid.innerHTML = "";
      (r.data || []).forEach((a, i) => grid.appendChild(makeCard(a, i)));
      totalPages = r.totalPages || 1;
      totalPagesLabel.textContent = totalPages.toLocaleString();
      if(!(r.data || []).length){
        grid.innerHTML = '<div class="grid-status">No anime found for “' + esc(keyword) + '”.</div>';
        pageSub.textContent = "No results";
      } else {
        pageSub.textContent = "Results for “" + keyword + "” · page " + page + " of " + totalPages;
        prevBtn.disabled = page <= 1;
        nextBtn.disabled = page >= totalPages;
        pagination.style.display = totalPages > 1 ? "flex" : "none";
      }
    } catch(err){
      grid.innerHTML = '<div class="grid-status err">Search is unavailable right now — try again in a moment.</div>';
      pageSub.textContent = "Something went wrong";
    } finally { loading = false; }
  }

  document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    keyword = sInput.value.trim();
    loadPage(1);
  });

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
