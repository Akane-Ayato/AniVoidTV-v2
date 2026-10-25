/* user.html: public profile */
(function () {
  "use strict";
  const esc = AVTV.esc, $ = (s) => document.querySelector(s);
  const name = (new URLSearchParams(location.search).get("u") || "").trim();
  const root = $("#pf-root");
  let filter = "all", canList = true;

  async function load() {
    if (!name) { root.innerHTML = '<div class="box soon-box"><div class="big">🤔</div><h3>No user selected</h3><p>Open a profile from a comment or the account menu.</p></div>'; return; }
    try {
      const u = (await AVTV.api("/users/" + encodeURIComponent(name))).results;
      document.title = u.username + " — AnivoidTV";
      canList = u.stats.list_counts !== null;
      root.innerHTML =
        '<div class="box"><div class="pub-head">' + AVTV.avatarHTML(u.avatar, u.username, 96) + '<div><h1>' + esc(u.username) + '</h1><span class="rank-chip">' + esc(u.rank.title) + '</span><div class="meta">Joined ' + esc(PF.joined(u.joined)) + " · " + u.vp.toLocaleString() + " VP" + (u.streak ? " · 🔥 " + u.streak + "-day streak" : "") + "</div></div></div>" +
        (u.bio ? '<p class="pub-bio">' + esc(u.bio) + "</p>" : "") + "</div>" +
        '<div class="box"><h3>Stats</h3>' + PF.statsHTML(u.stats) + "</div>" +
        '<div class="box"><h3>Anime stats</h3>' + PF.barsHTML(u.stats.list_counts) + "</div>" +
        '<div class="box"><h3>Badges <small>' + u.badges.filter((b) => b.earned).length + " earned</small></h3>" + PF.badgesHTML(u.badges) + "</div>" +
        '<div class="box"><h3>Favorites</h3>' + PF.favsHTML(u.favorites, false) + "</div>" +
        (canList ? '<div class="box"><h3>Watch list</h3><div class="chips" id="chips"></div><div id="list-body"><div class="grid-status">Loading…</div></div></div>' : "");
      if (canList) loadList(u.stats.list_counts);
    } catch (e) {
      root.innerHTML = '<div class="box soon-box"><div class="big">🕳️</div><h3>' + (e.status === 404 ? "User not found" : "Couldn't load this profile") + "</h3><p>" + esc(e.status === 404 ? "There is no profile called “" + name + "”." : e.message) + "</p></div>";
    }
  }
  async function loadList(counts) {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    $("#chips").innerHTML = '<button type="button" data-f="all" class="' + (filter === "all" ? "on" : "") + '">All (' + total + ")</button>" + AVTV.STATUS.map(([k, n]) => '<button type="button" data-f="' + k + '" class="' + (filter === k ? "on" : "") + '">' + n + " (" + (counts[k] || 0) + ")</button>").join("");
    try { $("#list-body").innerHTML = PF.listCardsHTML((await AVTV.api("/users/" + encodeURIComponent(name) + "/list?status=" + filter)).results, false); }
    catch (e) { $("#list-body").innerHTML = '<p class="empty-note">' + esc(e.message) + "</p>"; }
    $("#chips").onclick = (e) => { const b = e.target.closest("[data-f]"); if (b) { filter = b.dataset.f; loadList(counts); } };
  }
  load();
})();
