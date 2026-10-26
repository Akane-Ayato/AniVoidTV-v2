/* user.html: public profile */
(function () {
  "use strict";
  const esc = AVTV.esc, IC = AVTV.icons, $ = (s) => document.querySelector(s);
  const name = (new URLSearchParams(location.search).get("u") || "").trim();
  const root = $("#pf-root");
  let filter = "all", canList = true;

  async function load() {
    if (!name) { root.innerHTML = '<div class="box soon-box">' + AVTV.liquid("search", "sky", 64) + "<h3>No user selected</h3><p>Open a profile from a comment or the account menu.</p></div>"; return; }
    try {
      const u = (await AVTV.api("/users/" + encodeURIComponent(name))).results;
      document.title = u.name + " (@" + u.username + ") \u2014 AnivoidTV";
      canList = u.stats.list_counts !== null;
      const mine = AVTV.user && AVTV.user.username === u.username;
      const actions = mine ? '<a class="btn sm" href="profile.html#customize">' + IC.palette + "Customize</a>" : '<button class="btn sm ghost" type="button" id="report-user">' + IC.flag + "Report</button>";
      const pics = u.pictures || [];
      root.innerHTML = PF.headerHTML(u, actions) +
        '<div class="pf-grid"><div>' +
        '<div class="box"><h3>Badges <small>' + u.badges.filter((b) => b.earned).length + " earned</small></h3>" + PF.badgesHTML(u.badges) + "</div>" +
        '<div class="box"><h3>Favorites</h3>' + PF.favsHTML(u.favorites, false) + "</div>" +
        (pics.length > 1 ? '<div class="box"><h3>Pictures <small>' + pics.length + '</small></h3><div class="gal">' + pics.map((id) => '<div class="gal-item"><img src="' + AVTV.mediaUrl(id) + '" alt="" loading="lazy" data-lightbox="' + esc(id) + '"></div>').join("") + "</div></div>" : "") +
        (canList ? '<div class="box"><h3>Watch list</h3><div class="chips" id="chips"></div><div id="list-body"><div class="grid-status">Loading\u2026</div></div></div>' : "") +
        '</div><aside><div class="box"><h3>Rank</h3>' + PF.rankHTML(u.rank, u.vp) + '</div><div class="box"><h3>Stats</h3>' + PF.statsHTML(u.stats) + '</div><div class="box"><h3>Anime stats</h3>' + PF.barsHTML(u.stats.list_counts) + "</div></aside></div>";
      if (canList) loadList(u.stats.list_counts);
      const rb = $("#report-user");
      if (rb) rb.onclick = async () => {
        if (!AVTV.user) return AVTV.openAuth("login", "Sign in to report a profile.");
        const reason = prompt("What's wrong with this profile? (optional)"); if (reason === null) return;
        try { await AVTV.api("/report", { method: "POST", body: { type: "user", target: u.username, reason: reason.slice(0, 300) } }); AVTV.toast("Thanks, a moderator will take a look.", "ok"); } catch (e) { AVTV.toast(e.message, "err"); }
      };
    } catch (e) {
      root.innerHTML = '<div class="box soon-box">' + AVTV.liquid("search", "sky", 64) + "<h3>" + (e.status === 404 ? "User not found" : "Couldn't load this profile") + "</h3><p>" + esc(e.status === 404 ? "There is no profile called \u201c" + name + "\u201d." : e.message) + "</p></div>";
    }
  }
  async function loadList(counts) {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    $("#chips").innerHTML = '<button type="button" data-f="all" class="' + (filter === "all" ? "on" : "") + '">All (' + total + ")</button>" + AVTV.STATUS.map(([k, n]) => '<button type="button" data-f="' + k + '" class="' + (filter === k ? "on" : "") + '">' + n + " (" + (counts[k] || 0) + ")</button>").join("");
    try { $("#list-body").innerHTML = PF.listCardsHTML((await AVTV.api("/users/" + encodeURIComponent(name) + "/list?status=" + filter)).results, false); }
    catch (e) { $("#list-body").innerHTML = '<p class="empty-note">' + esc(e.message) + "</p>"; }
    $("#chips").onclick = (e) => { const b = e.target.closest("[data-f]"); if (b) { filter = b.dataset.f; loadList(counts); } };
  }
  AVTV.ready ? AVTV.ready.then(load) : load();
})();
