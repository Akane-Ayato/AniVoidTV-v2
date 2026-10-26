  // Same-origin proxy routes — see /api/series/[id].js and /api/recent.js
  // for the actual upstream calls, which happen server-side and never
  // appear anywhere in this file's network requests.
  const API_BASE = "/api/series";
  const RECENT_API = "/api/recent";

  let episodes = [];
  let currentEp = null;
  let currentAudio = "sub";

  const frame = document.getElementById("player-frame");
  const badgeText = document.getElementById("badge-text");
  const nowEpLabel = document.getElementById("now-ep-label");
  const btnSub = document.getElementById("btn-sub");
  const btnDub = document.getElementById("btn-dub");
  const epList = document.getElementById("ep-list");
  const epCount = document.getElementById("ep-count");
  const heroBackdrop = document.getElementById("hero-backdrop");

  const idInput = document.getElementById("id-input");
  const idLoadBtn = document.getElementById("id-load-btn");
  const idLoadText = document.getElementById("id-load-text");
  const idHint = document.getElementById("id-hint");

  function renderEpisodes(){
    epList.innerHTML = "";
    if(episodes.length === 0){
      epCount.textContent = "Enter an ID above";
      return;
    }
    episodes.forEach(ep => {
      const btn = document.createElement("button");
      btn.className = "ep-btn" + (currentEp && ep.number === currentEp.number ? " active" : "");
      btn.textContent = ep.number;
      if(ep.embed.dub){
        const mark = document.createElement("span");
        mark.className = "dub-mark";
        btn.appendChild(mark);
      }
      btn.onclick = () => selectEpisode(ep.number);
      epList.appendChild(btn);
    });
    epCount.textContent = episodes.length + (episodes.length === 1 ? " episode" : " episodes");
  }

  function selectEpisode(number){
    const ep = episodes.find(e => e.number === number);
    if(!ep) return;
    currentEp = ep;
    if(!ep.embed[currentAudio]) currentAudio = ep.embed.sub ? "sub" : "dub";
    updatePlayer();
    renderEpisodes();
  }

  function setAudio(kind){
    if(!currentEp || !currentEp.embed[kind]) return;
    currentAudio = kind;
    updatePlayer();
  }

  function urlIdGlobal(){ return new URLSearchParams(window.location.search).get("id") || (idInput && idInput.value) || ""; }

  function updatePlayer(){
    if(!currentEp){
      frame.src = "";
      badgeText.textContent = "No anime loaded";
      nowEpLabel.textContent = "—";
      btnSub.disabled = true;
      btnDub.disabled = true;
      return;
    }
    frame.src = currentEp.embed[currentAudio] || "";
    badgeText.textContent = "EP " + currentEp.number + " · " + currentAudio.toUpperCase();
    nowEpLabel.textContent = currentEp.title;

    btnSub.classList.toggle("active", currentAudio === "sub");
    btnDub.classList.toggle("active", currentAudio === "dub");
    btnDub.disabled = !currentEp.embed.dub;
    btnSub.disabled = !currentEp.embed.sub;
    if(window.AVTV && window.__anime) AVTV.trackWatch(window.__anime, currentEp.number, currentAudio);
  }

  function renderDetails(anime){
    document.getElementById("d-poster").src = anime.poster || "";
    document.getElementById("d-poster").alt = (anime.title || "Anime") + " poster";
    document.getElementById("d-title").textContent = anime.title || "Untitled";
    document.getElementById("d-alt").textContent = anime.alternative || "";
    document.getElementById("d-alt").style.display = anime.alternative ? "block" : "none";
    document.getElementById("d-native").textContent = anime.native || "";
    document.getElementById("d-native").style.display = anime.native ? "block" : "none";
    document.getElementById("d-description").textContent = anime.description
      ? anime.description.replace(/\(Source:.*?\)/i, "").trim()
      : "No synopsis available.";

    const meta = document.getElementById("d-meta");
    meta.innerHTML = "";
    const chips = [];
    if(anime.status){
      const isAiring = /airing/i.test(anime.status);
      chips.push({ html: `<span class="dot"></span>${anime.status}`, cls: isAiring ? "airing" : "" });
    }
    if(anime.score) chips.push({ text: "Score " + anime.score, cls: "score" });
    const type = anime.terms_by_type && anime.terms_by_type.type && anime.terms_by_type.type[0];
    if(type) chips.push({ text: type });
    if(anime.season && anime.year) chips.push({ text: capitalize(anime.season) + " " + anime.year });
    if(anime.aired) chips.push({ text: "Aired " + anime.aired });

    chips.forEach(c => {
      const span = document.createElement("span");
      span.className = "chip" + (c.cls ? " " + c.cls : "");
      if(c.html) span.innerHTML = c.html; else span.textContent = c.text;
      meta.appendChild(span);
    });

    const tagsWrap = document.getElementById("d-tags");
    tagsWrap.innerHTML = "";
    const genres = (anime.terms_by_type && anime.terms_by_type.genre) || [];
    const studios = (anime.terms_by_type && anime.terms_by_type.studios) || [];
    genres.forEach(g => tagsWrap.appendChild(makeTag(g, true)));
    studios.forEach(s => tagsWrap.appendChild(makeTag(s, false)));
    if(anime.source) tagsWrap.appendChild(makeTag("Source: " + capitalize(anime.source), false));

    // hero backdrop art
    if(anime.background_image){
      heroBackdrop.style.backgroundImage = `url(${anime.background_image})`;
      heroBackdrop.classList.add("visible");
    } else {
      heroBackdrop.classList.remove("visible");
    }
  }

  function makeTag(text, isGenre){
    const span = document.createElement("span");
    span.className = "tag" + (isGenre ? " genre" : "");
    span.textContent = text;
    return span;
  }

  function capitalize(s){
    return typeof s === "string" && s.length ? s[0].toUpperCase() + s.slice(1) : s;
  }

  function buildEpisodesFromApi(apiEpisodes){
    return (apiEpisodes || []).map(ep => ({
      number: ep.number,
      title: ep.title || ("Episode " + ep.number),
      embed: {
        sub: ep.embed_url && ep.embed_url.sub ? ep.embed_url.sub : null,
        dub: ep.embed_url && ep.embed_url.dub ? ep.embed_url.dub : null,
      }
    })).filter(ep => ep.embed.sub || ep.embed.dub);
  }

  function fetchWithTimeout(url, ms){
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    return fetch(url, { signal: controller.signal, headers: { "Accept": "application/json" } })
      .then(res => {
        clearTimeout(timer);
        if(!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .catch(err => { clearTimeout(timer); throw err; });
  }

  function getCached(id){
    try{
      const raw = sessionStorage.getItem("anikoto:" + id);
      return raw ? JSON.parse(raw) : null;
    } catch(e){ return null; }
  }
  function setCached(id, json){
    try{ sessionStorage.setItem("anikoto:" + id, JSON.stringify(json)); } catch(e){ /* ignore quota errors */ }
  }

  async function loadSeries(){
    const id = idInput.value.trim();
    if(!id){
      setHint("Enter an anime ID first.", "err");
      return;
    }

    setLoading(true);

    const cached = getCached(id);
    if(cached){
      applySeries(cached);
      setHint("Loaded “" + cached.data.anime.title + "” · " + episodes.length + " episodes (cached)", "ok");
      setLoading(false);
      return;
    }

    setHint("Loading…", "");

    try{
      const json = await fetchWithTimeout(API_BASE + "/" + encodeURIComponent(id), 8000);

      if(!json.ok || !json.data || !json.data.anime){
        throw new Error(json.message || "Anime not found");
      }
      if(buildEpisodesFromApi(json.data.episodes).length === 0){
        throw new Error("No streamable episodes returned for this ID");
      }

      setCached(id, json);
      applySeries(json);
      setHint("Loaded “" + json.data.anime.title + "” · " + episodes.length + " episodes", "ok");

    } catch(err){
      setHint("Couldn't load that ID — try again in a moment.", "err");
    } finally {
      setLoading(false);
    }
  }

  function applySeries(json){
    episodes = buildEpisodesFromApi(json.data.episodes);
    window.__anime = Object.assign({}, json.data.anime, { id: json.data.anime.id || Number(urlIdGlobal()) });
    const wantEp = Number(new URLSearchParams(location.search).get("ep")) || ((window.AVTV && AVTV.cw.get(window.__anime.id)) || {}).episode;
    currentEp = episodes.find(e => e.number === wantEp) || episodes[0];
    currentAudio = currentEp.embed.sub ? "sub" : "dub";

    document.getElementById("details").style.display = "grid";
    renderDetails(json.data.anime);
    renderEpisodes();
    updatePlayer();
    document.title = (json.data.anime.title || "Watch") + " — AnikotoTV";

    loadRecommendations();
  }

  function setLoading(isLoading){
    idLoadBtn.disabled = isLoading;
    idLoadText.textContent = isLoading ? "Loading…" : "Load";
  }

  function setHint(text, kind){
    idHint.textContent = text;
    idHint.className = "id-box-hint" + (kind ? " " + kind : "");
  }

  idInput.addEventListener("keydown", (e) => { if(e.key === "Enter") loadSeries(); });

  renderEpisodes();
  updatePlayer();

  // ---- Auto-load if the page was opened as watch.html?id=8904 ----
  const urlId = new URLSearchParams(window.location.search).get("id");
  if(urlId){
    idInput.value = urlId;
    loadSeries();
  }

  // ---- MegaPlay player events (postMessage) ----
  const retryTip = document.getElementById("retry-tip");
  window.addEventListener("message", function (event) {
    let data = event.data;
    if (typeof data === "string") {
      try { data = JSON.parse(data); } catch (e) { return; }
    }
    if (!data || typeof data !== "object") return;

    if (data.channel === "megacloud") {
      if (data.event === "complete") {
        if (window.AVTV && window.__anime && currentEp) AVTV.markWatched(window.__anime.id, currentEp.number);
        retryTip.classList.remove("alert");
        retryTip.textContent = "Episode not starting? Click it again, or switch Sub/Dub — occasional API hiccups clear up fast.";
        const idx = episodes.findIndex(e => e.number === currentEp.number);
        const next = episodes[idx + 1];
        if (next) selectEpisode(next.number);
      }
      if (data.event === "error") {
        badgeText.textContent = "EP " + currentEp.number + " · playback error";
        retryTip.classList.add("alert");
        retryTip.textContent = "Playback error on this episode — click it again in the list below, or switch Sub/Dub.";
      }
    }
  });

  // ---- Recommendations strip, fed by the recent-anime API ----
  function statusBadge(status){
    if(!status) return "";
    if(/airing/i.test(status)){
      return '<span class="card-badge airing"><span class="dot"></span>Airing</span>';
    }
    if(/finish|complet/i.test(status)){
      return '<span class="card-badge finished">Finished</span>';
    }
    return `<span class="card-badge">${status}</span>`;
  }

  function makeRecCard(anime, i){
    const a = document.createElement("a");
    a.className = "anime-card";
    a.style.setProperty("--i", i);
    a.href = "details.html?id=" + encodeURIComponent(anime.id);

    a.innerHTML = `
      <div class="card-poster">
        <img src="${anime.poster || ""}" alt="${(anime.title || "").replace(/"/g,'&quot;')}" loading="lazy">
        <div class="card-badges">
          ${statusBadge(anime.status)}
        </div>
      </div>
      <div class="card-title">${anime.title || "Untitled"}</div>
    `;
    return a;
  }

  async function loadRecommendations(){
    const grid = document.getElementById("recs-grid");
    const label = document.getElementById("recs-label");
    try{
      const randomPage = Math.floor(Math.random() * 5) + 1; // light variety across loads
      const res = await fetch(`${RECENT_API}?page=${randomPage}&per_page=8`, { headers: { Accept: "application/json" } });
      if(!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      if(!json.ok || !Array.isArray(json.data) || json.data.length === 0) return;

      grid.innerHTML = "";
      json.data
        .filter(a => String(a.id) !== String(currentEp ? idInput.value.trim() : ""))
        .forEach((anime, i) => grid.appendChild(makeRecCard(anime, i)));
      label.style.display = "flex";
    } catch(err){
      // fail silently — recommendations are a bonus, not core functionality
    }
  }

  // ---- Basic inspect deterrents ----
  // Cosmetic only — the real protection is the /api proxy above, which
  // keeps upstream API URLs out of the network tab entirely.
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("keydown", e => {
    const k = e.key;
    if(
      k === "F12" ||
      (e.ctrlKey && e.shiftKey && (k === "I" || k === "J" || k === "C")) ||
      (e.ctrlKey && k === "U")
    ){
      e.preventDefault();
    }
  });

  document.getElementById("id-load-btn").addEventListener("click", loadSeries);
  document.getElementById("btn-sub").addEventListener("click", () => setAudio("sub"));
  document.getElementById("btn-dub").addEventListener("click", () => setAudio("dub"));
