  // floating petals on the banner
  (function(){
    const b = document.querySelector(".banner");
    for(let i = 0; i < 12; i++){
      const s = document.createElement("span");
      s.className = "petal";
      s.style.left = (i * 8.5 + 2) + "%"; s.style.animationDuration = (6 + (i % 5) * 2) + "s"; s.style.animationDelay = "-" + (i * 1.1) + "s";
      b.appendChild(s);
    }
  })();

  document.getElementById("s-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = document.getElementById("s-input").value.trim();
    if(q) location.href = "search.html?keyword=" + encodeURIComponent(q);
  });

  // popular searches from the weekly top list (falls back to the static text)
  fetch("/api/v1/top-ten").then(r => r.ok ? r.json() : null).then(j => {
    const list = j && j.results && j.results.week;
    if(!list || !list.length) return;
    document.getElementById("popular").innerHTML = list.slice(0, 8).map(a => '<a href="search.html?keyword=' + encodeURIComponent(a.title) + '">' + AVTV.esc(a.title) + "</a>").join(", ");
  }).catch(() => {});

  document.querySelectorAll(".feat [data-ic]").forEach((d) => { const [n, t] = d.dataset.ic.split("|"); const w = document.createElement("span"); w.innerHTML = AVTV.liquid(n, t, 38); w.style.gridRow = "1 / span 2"; d.prepend(w.firstChild); });
  const input = document.getElementById("id-entry-input");
  const status = document.getElementById("id-status");
  const btn = document.getElementById("watch-btn");

  function goWatch(){
    const id = input.value.trim();
    if(!id){ status.textContent = "Enter an anime ID first."; status.classList.add("err"); input.focus(); return; }
    status.classList.remove("err");
    btn.disabled = true;
    window.location.href = "watch.html?id=" + encodeURIComponent(id);
  }
  document.getElementById("watch-btn").addEventListener("click", goWatch);
  input.addEventListener("keydown", (e) => { if(e.key === "Enter") goWatch(); });
  input.addEventListener("input", () => { status.textContent = ""; status.classList.remove("err"); });

  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("keydown", e => {
    const k = e.key;
    if(k === "F12" || (e.ctrlKey && e.shiftKey && (k === "I" || k === "J" || k === "C")) || (e.ctrlKey && k === "U")) e.preventDefault();
  });
