  const API_BASE = "/api/series";

  const id = new URLSearchParams(location.search).get("id");

  const skeleton = document.getElementById("skeleton");
  const errorBox = document.getElementById("error-box");
  const errorMessage = document.getElementById("error-message");
  const detailsContent = document.getElementById("details-content");
  const heroBackdrop = document.getElementById("hero-backdrop");

  function capitalize(s){
    return typeof s === "string" && s.length ? s[0].toUpperCase() + s.slice(1) : s;
  }

  function makeTag(text, isGenre){
    const span = document.createElement("span");
    span.className = "tag" + (isGenre ? " genre" : "");
    span.textContent = text;
    return span;
  }

  function showError(msg){
    skeleton.style.display = "none";
    detailsContent.classList.remove("visible");
    errorBox.style.display = "block";
    errorMessage.textContent = msg;
  }

  function renderDetails(anime, episodeCount){
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
      if(/airing/i.test(anime.status)) chips.push({ html: '<span class="dot"></span>Airing', cls: "airing" });
      else if(/finish|complet/i.test(anime.status)) chips.push({ text: "Finished", cls: "finished" });
      else chips.push({ text: anime.status });
    }
    if(anime.score) chips.push({ text: "Score " + anime.score, cls: "score" });
    const type = anime.terms_by_type && anime.terms_by_type.type && anime.terms_by_type.type[0];
    if(type) chips.push({ text: type });
    if(anime.season && anime.year) chips.push({ text: capitalize(anime.season) + " " + anime.year });
    if(episodeCount) chips.push({ text: episodeCount + (episodeCount === 1 ? " episode" : " episodes"), cls: "episodes" });
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

    if(anime.background_image){
      heroBackdrop.style.backgroundImage = `url(${anime.background_image})`;
      heroBackdrop.classList.add("visible");
    }

    document.title = (anime.title || "Details") + " — AnikotoTV";
    window.dispatchEvent(new CustomEvent("avtv:anime", { detail: { id: id, anime: anime } }));
  }

  function goWatch(){
    window.location.href = "watch.html?id=" + encodeURIComponent(id);
  }

  async function load(){
    if(!id){
      showError("No anime ID was given. Go back and pick a show from Recent.");
      return;
    }

    try{
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(API_BASE + "/" + encodeURIComponent(id), {
        signal: controller.signal,
        headers: { Accept: "application/json" }
      });
      clearTimeout(timer);
      if(!res.ok) throw new Error("HTTP " + res.status);

      const json = await res.json();
      if(!json.ok || !json.data || !json.data.anime){
        throw new Error(json.message || "Anime not found");
      }

      const episodeCount = (json.data.episodes || []).length;

      skeleton.style.display = "none";
      renderDetails(json.data.anime, episodeCount);
      detailsContent.classList.add("visible");

    } catch(err){
      showError("Try again in a moment, or head back to Recent.");
    }
  }

  load();

  // Basic inspect deterrents — cosmetic only
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("keydown", e => {
    const k = e.key;
    if(k === "F12" || (e.ctrlKey && e.shiftKey && (k === "I" || k === "J" || k === "C")) || (e.ctrlKey && k === "U")){
      e.preventDefault();
    }
  });

document.getElementById("watch-btn").addEventListener("click", goWatch);
