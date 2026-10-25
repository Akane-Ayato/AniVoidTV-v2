/* profile.html: your dashboard (hash tabs: overview, friends, continue, list, notifications, settings) */
(function () {
  "use strict";
  const esc = AVTV.esc, I = AVTV.icons, $ = (s, r) => (r || document).querySelector(s);
  const root = $("#pf-root");
  const TABS = [["overview", "Profile", I.user], ["friends", "Friends", I.users], ["continue", "Continue Watching", I.history], ["list", "Watch List", I.bookmark], ["notifications", "Notification", I.bell], ["settings", "Settings", I.cog]];
  let tab = (location.hash || "#overview").slice(1);
  if (!TABS.some((t) => t[0] === tab)) tab = "overview";
  let listFilter = "all", editFavs = false, draftAvatar = null, draftBio = null;

  const me = () => AVTV.user;
  async function reloadMe() { AVTV.user = (await AVTV.api("/me")).results; }

  function render() {
    const u = me();
    if (!u) {
      root.className = "pf-wrap single";
      root.innerHTML = '<div class="box soon-box"><div class="big">🔐</div><h3>Sign in to see your profile</h3><p>Create a profile to build a watch list, comment on anime, keep your Continue Watching in sync and earn VP.</p><div class="row-btns" style="justify-content:center;margin-top:18px"><button class="btn primary" id="pf-signin" type="button">Sign in / Register</button></div></div>';
      $("#pf-signin").onclick = () => AVTV.openAuth("login", "Sign in to view your profile.");
      return;
    }
    root.className = "pf-wrap";
    root.innerHTML = sideHTML(u) + '<section class="pf-main"><nav class="pf-tabs" aria-label="Profile sections">' +
      TABS.map(([k, n, ic]) => '<a href="#' + k + '" class="' + (k === tab ? "on" : "") + '">' + ic + n + "</a>").join("") + '</nav><div id="pf-panel"></div></section>';
    $("#checkin").onclick = checkin;
    $("#side-logout").onclick = () => $("#logout-btn") ? $("#logout-btn").click() : null;
    panel();
  }

  function sideHTML(u) {
    return '<aside class="box pf-side">' + AVTV.avatarHTML(u.avatar, u.username, 104) + "<h2>" + esc(u.username) + '</h2><span class="rank-chip">' + esc(u.rank.title) + "</span>" +
      '<div class="side-rows"><div><span>Void Points</span><b>' + u.vp.toLocaleString() + '</b></div><div><span>Streak</span><b>' + (u.streak || 0) + ' day' + (u.streak === 1 ? "" : "s") + '</b></div><div><span>Joined</span><b>' + esc(PF.joined(u.joined)) + '</b></div><div><span>Watch list</span><b>' + u.stats.list_total + "</b></div></div>" +
      '<div class="side-btns"><button class="btn primary" id="checkin" type="button"' + (u.checked_in_today ? " disabled" : "") + ">" + (u.checked_in_today ? "✓ Checked in today" : "🎁 Daily check-in") + '</button>' +
      '<a class="btn" href="user.html?u=' + encodeURIComponent(u.username) + '">View public profile</a><button class="btn danger" id="side-logout" type="button">Log out</button></div></aside>';
  }

  async function checkin() {
    try {
      const r = (await AVTV.api("/me/checkin", { method: "POST" })).results;
      AVTV.toast(r.already ? "Already checked in today." : "+" + r.granted + " VP · " + r.streak + "-day streak 🔥", r.already ? "" : "ok");
      await reloadMe(); render();
    } catch (e) { AVTV.toast(e.message, "err"); }
  }

  /* ---------- panels ---------- */
  async function panel() {
    const host = $("#pf-panel"), u = me();
    if (tab === "overview") {
      host.innerHTML =
        '<div class="box"><h3>Rank <small>earn VP by watching, commenting &amp; checking in daily</small></h3>' + PF.rankHTML(u.rank, u.vp) + "</div>" +
        '<div class="box"><h3>Stats</h3>' + PF.statsHTML(u.stats) + "</div>" +
        '<div class="box"><h3>Anime stats</h3>' + PF.barsHTML(u.stats.list_counts) + "</div>" +
        '<div class="box"><h3>Badges <small>' + u.badges.filter((b) => b.earned).length + " / " + u.badges.length + " earned</small></h3>" + PF.badgesHTML(u.badges) + "</div>" +
        '<div class="box"><h3>Favorites <small>' + u.favorites.length + ' / 10 <button class="btn sm" id="fav-edit" type="button" style="margin-left:8px">' + (editFavs ? "Done" : "Edit") + "</button></small></h3>" +
        PF.favsHTML(u.favorites, editFavs) + (editFavs ? favEditorHTML() : "") + "</div>" +
        '<div class="box"><h3>Earning history <button class="btn sm" id="vp-load" type="button">Show</button></h3><div id="vp-hist"></div></div>';
      $("#fav-edit").onclick = () => { editFavs = !editFavs; panel(); };
      $("#vp-load").onclick = loadVP;
      bindFavs();
    } else if (tab === "continue") {
      host.innerHTML = '<div class="box"><h3>Continue Watching <button class="btn sm danger" id="cw-clear" type="button">Clear all</button></h3><div id="cw-grid" class="mini-grid"><div class="grid-status">Loading…</div></div></div>';
      await AVTV.cw.sync(); paintCW();
      $("#cw-clear").onclick = async () => { if (confirm("Remove everything from Continue Watching?")) { await AVTV.cw.clear(); paintCW(); } };
    } else if (tab === "list") {
      host.innerHTML = '<div class="box"><h3>Watch List</h3><div class="chips" id="chips"></div><div id="list-body"><div class="grid-status">Loading…</div></div></div>';
      loadList();
    } else if (tab === "settings") {
      settings(host, u);
    } else {
      const soon = tab === "friends"
        ? ["👥", "Friends", "Add friends, see what they're watching and compare anime stats. Coming in the next update."]
        : ["🔔", "Notifications", "Get notified about replies to your comments, friend requests and new episodes of your list. Coming in the next update."];
      host.innerHTML = '<div class="box soon-box"><div class="big">' + soon[0] + "</div><h3>" + soon[1] + "</h3><p>" + soon[2] + "</p></div>";
    }
  }

  function paintCW() {
    const g = $("#cw-grid"); if (!g) return;
    const items = AVTV.cw.list();
    g.innerHTML = items.length ? items.map((i) => AVTV.cw.cardHTML(i)).join("") : '<p class="empty-note" style="grid-column:1/-1">Nothing here yet. Start an episode and it will show up here.</p>';
    g.onclick = async (e) => { const x = e.target.closest("[data-remove]"); if (x) { await AVTV.cw.remove(x.dataset.remove); paintCW(); AVTV.toast("Removed"); } };
  }

  async function loadVP() {
    try {
      const rows = (await AVTV.api("/me/vp")).results;
      const names = { checkin: "Daily check-in", comment: "Comment", episode: "Episode watched", list_add: "Added to list", welcome: "Welcome bonus" };
      $("#vp-hist").innerHTML = '<div class="vp-hist">' + (rows.length ? rows.map((r) => "<div><span>" + esc(names[r.reason] || r.reason) + " · " + esc(AVTV.timeAgo(r.at)) + "</span><b>+" + r.delta + "</b></div>").join("") : '<p class="empty-note">No activity yet.</p>') + "</div>";
    } catch (e) { AVTV.toast(e.message, "err"); }
  }

  /* favorites editor */
  const favEditorHTML = () => '<div class="fav-edit"><div class="field"><input id="fav-q" type="search" placeholder="Search an anime to add…" style="padding-left:14px" maxlength="100"></div><div class="res" id="fav-res"></div></div>';
  async function saveFavs(favs) {
    try { AVTV.user = (await AVTV.api("/me", { method: "PATCH", body: { favorites: favs } })).results; panel(); } catch (e) { AVTV.toast(e.message, "err"); }
  }
  function bindFavs() {
    document.querySelectorAll("[data-fav-rm]").forEach((b) => (b.onclick = () => saveFavs(me().favorites.filter((f) => String(f.id) !== b.dataset.favRm))));
    const q = $("#fav-q"); if (!q) return;
    let t = null;
    q.oninput = () => {
      clearTimeout(t); const v = q.value.trim(); if (v.length < 2) { $("#fav-res").innerHTML = ""; return; }
      t = setTimeout(async () => {
        try {
          const rows = (await AVTV.api("/search?keyword=" + encodeURIComponent(v))).results.data.filter((r) => r.id).slice(0, 8);
          $("#fav-res").innerHTML = rows.map((r) => '<button type="button" data-add=\'' + esc(JSON.stringify({ id: r.id, title: r.title, poster: r.poster })) + "'><img src=\"" + esc(r.poster) + '" alt=""><span>' + esc(r.title) + "</span></button>").join("") || '<p class="empty-note">No matches.</p>';
        } catch (e) { $("#fav-res").innerHTML = '<p class="empty-note">Search unavailable.</p>'; }
      }, 350);
    };
    $("#fav-res").onclick = (e) => {
      const b = e.target.closest("[data-add]"); if (!b) return;
      const f = JSON.parse(b.dataset.add), cur = me().favorites;
      if (cur.length >= 10) return AVTV.toast("You can have up to 10 favorites.", "err");
      if (cur.some((x) => x.id === f.id)) return AVTV.toast("Already in your favorites.");
      saveFavs(cur.concat([f]));
    };
  }

  /* watch list */
  async function loadList() {
    try {
      const j = (await AVTV.api("/list?status=" + listFilter)).results;
      const total = Object.values(j.counts).reduce((a, b) => a + b, 0);
      $("#chips").innerHTML = '<button type="button" data-f="all" class="' + (listFilter === "all" ? "on" : "") + '">All (' + total + ")</button>" +
        AVTV.STATUS.map(([k, n]) => '<button type="button" data-f="' + k + '" class="' + (listFilter === k ? "on" : "") + '">' + n + " (" + (j.counts[k] || 0) + ")</button>").join("");
      $("#list-body").innerHTML = PF.listCardsHTML(j.data, true);
    } catch (e) { $("#list-body").innerHTML = '<div class="grid-status err">Couldn\'t load your list.</div>'; }
  }
  document.addEventListener("click", async (e) => {
    const f = e.target.closest("#chips [data-f]");
    if (f) { listFilter = f.dataset.f; loadList(); return; }
    const rm = e.target.closest("[data-list-rm]");
    if (rm) { try { await AVTV.api("/list/" + rm.dataset.listRm, { method: "DELETE" }); AVTV.toast("Removed from your list"); loadList(); reloadMe(); } catch (err) { AVTV.toast(err.message, "err"); } }
  });
  document.addEventListener("change", async (e) => {
    const s = e.target.closest("[data-status]"); if (!s) return;
    const card = s.closest(".li-card");
    try {
      await AVTV.api("/list/" + s.dataset.status, { method: "PUT", body: { status: s.value, title: card.querySelector(".t").textContent, poster: card.querySelector("img").getAttribute("src") } });
      AVTV.toast("List updated", "ok"); loadList(); reloadMe();
    } catch (err) { AVTV.toast(err.message, "err"); }
  });

  /* settings */
  function settings(host, u) {
    const a = draftAvatar = draftAvatar || Object.assign({}, u.avatar);
    const pwNote = u.has_password ? "" : '<p class="hint">Your account signs in with Google. Set a password here if you also want to log in with your username.</p>';
    host.innerHTML =
      '<div class="box"><h3>Profile</h3><div class="set-grid"><div><label for="bio">Bio <span id="bio-n" style="float:right">' + (draftBio != null ? draftBio : u.bio).length + ' / 200</span></label><div class="field"><textarea id="bio" maxlength="200" placeholder="Tell people about yourself (plain text, no links)">' + esc(draftBio != null ? draftBio : u.bio) + "</textarea></div></div>" +
      '<div class="row-btns"><button class="btn primary" id="save-bio" type="button">Save bio</button></div></div></div>' +
      '<div class="box"><h3>Avatar &amp; effects</h3><div class="av-preview" id="av-prev"></div><div class="set-grid">' +
      '<div><label>Colour</label><div class="swatches" id="sw">' + Array.from({ length: u.avatar_bg_count }, (_, i) => '<button type="button" class="bg' + i + (i === a.bg ? " on" : "") + '" data-bg="' + i + '" aria-label="Colour ' + (i + 1) + '"></button>').join("") + "</div></div>" +
      '<div><label>Icon</label><div class="swatches icons" id="ic">' + u.avatar_icons.map((x) => '<button type="button" class="' + (x === a.icon ? "on" : "") + '" data-ic="' + esc(x) + '">' + (x === "initial" ? esc(u.username.charAt(0).toUpperCase()) : esc(x)) + "</button>").join("") + "</div></div>" +
      '<div><label>Profile effect <span style="color:var(--muted)">(unlock more by ranking up)</span></label><div class="frames" id="fr">' + u.frames.map((f) => '<div class="frame-card' + (f.key === a.frame ? " on" : "") + (f.unlocked ? "" : " locked") + '" data-fr="' + f.key + '" data-ok="' + (f.unlocked ? 1 : 0) + '" tabindex="0">' + AVTV.avatarHTML({ bg: a.bg, icon: a.icon, frame: f.key }, u.username, 46) + "<b style=\"text-transform:capitalize\">" + (f.key === "none" ? "No effect" : f.key) + "</b><small>" + (f.unlocked ? "Unlocked" : "🔒 " + esc(f.unlock_rank)) + "</small></div>").join("") + "</div></div>" +
      '<div class="row-btns"><button class="btn primary" id="save-av" type="button">Save avatar</button></div></div></div>' +
      '<div class="box"><h3>Privacy</h3><label class="switch"><input type="checkbox" id="show-list"' + (u.privacy.show_list ? " checked" : "") + '> Show my watch list &amp; list stats on my public profile</label><div class="row-btns" style="margin-top:12px"><button class="btn" id="save-priv" type="button">Save</button></div></div>' +
      '<div class="box"><h3>Username</h3><div class="set-grid"><div class="field"><input id="un" value="' + esc(u.username) + '" maxlength="20" autocomplete="off"></div>' +
      (u.has_password ? '<div class="field pw"><input id="un-pw" type="password" placeholder="Your password" autocomplete="current-password"></div>' : "") +
      '<p class="hint">3-20 characters: letters, numbers, underscore. You can change it once every 30 days.</p><div class="row-btns"><button class="btn" id="save-un" type="button">Change username</button></div></div></div>' +
      '<div class="box"><h3>Password</h3>' + pwNote + '<div class="set-grid">' +
      (u.has_password ? '<div class="field pw"><input id="pw0" type="password" placeholder="Current password" autocomplete="current-password"></div>' : "") +
      '<div class="field pw"><input id="pw1" type="password" placeholder="New password" autocomplete="new-password" maxlength="64"></div><div class="field pw"><input id="pw2" type="password" placeholder="Confirm new password" autocomplete="new-password" maxlength="64"></div>' +
      '<div class="row-btns"><button class="btn" id="save-pw" type="button">' + (u.has_password ? "Change password" : "Set password") + "</button></div></div></div>" +
      '<div class="box"><h3>Account</h3><div class="side-rows" style="border:0;margin:0;padding:0"><div><span>Email</span><b>' + esc(u.email || "none (password account)") + "</b></div><div><span>Google sign-in</span><b>" + (u.google_linked ? "Connected" : "Not connected") + "</b></div></div>" +
      '<div class="row-btns" style="margin-top:14px"><button class="btn" id="copy-url" type="button">Copy public profile link</button></div></div>';
    paintPrev();
    $("#bio").oninput = (e) => { draftBio = e.target.value; $("#bio-n").textContent = e.target.value.length + " / 200"; };
    $("#save-bio").onclick = () => patch({ bio: $("#bio").value }, "Bio saved").then((ok) => { if (ok) draftBio = null; });
    $("#sw").onclick = (e) => { const b = e.target.closest("[data-bg]"); if (b) { a.bg = Number(b.dataset.bg); settings(host, me()); } };
    $("#ic").onclick = (e) => { const b = e.target.closest("[data-ic]"); if (b) { a.icon = b.dataset.ic; settings(host, me()); } };
    $("#fr").onclick = (e) => { const c = e.target.closest("[data-fr]"); if (!c) return; if (c.dataset.ok !== "1") return AVTV.toast("Reach a higher rank to unlock this effect.", "err"); a.frame = c.dataset.fr; settings(host, me()); };
    $("#save-av").onclick = () => patch({ avatar: a }, "Avatar saved").then((ok) => { if (ok) draftAvatar = null; });
    $("#save-priv").onclick = () => patch({ privacy: { show_list: $("#show-list").checked } }, "Privacy saved");
    $("#save-un").onclick = async () => {
      try { AVTV.user = (await AVTV.api("/me/username", { method: "POST", body: { username: $("#un").value.trim(), password: u.has_password ? $("#un-pw").value : "" } })).results; AVTV.toast("Username updated", "ok"); render(); } catch (e) { AVTV.toast(e.message, "err"); }
    };
    $("#save-pw").onclick = async () => {
      const p1 = $("#pw1").value;
      if (p1 !== $("#pw2").value) return AVTV.toast("New passwords don't match.", "err");
      try { await AVTV.api("/me/password", { method: "POST", body: { current: u.has_password ? $("#pw0").value : "", new: p1 } }); AVTV.toast("Password updated", "ok"); await reloadMe(); render(); } catch (e) { AVTV.toast(e.message, "err"); }
    };
    $("#copy-url").onclick = () => { const url = location.origin + "/user.html?u=" + encodeURIComponent(u.username); (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => AVTV.toast("Link copied", "ok")).catch(() => prompt("Copy your profile link:", url)); };
    function paintPrev() { $("#av-prev").innerHTML = AVTV.avatarHTML(a, u.username, 72) + "<div><b>" + esc(u.username) + '</b><div class="cm-meta">Live preview</div></div>'; }
  }
  async function patch(body, okMsg) {
    try { AVTV.user = (await AVTV.api("/me", { method: "PATCH", body })).results; AVTV.toast(okMsg, "ok"); render(); return true; }
    catch (e) { AVTV.toast(e.message, "err"); return false; }
  }

  window.addEventListener("hashchange", () => { const t = (location.hash || "#overview").slice(1); if (TABS.some((x) => x[0] === t)) { tab = t; draftAvatar = null; render(); } });
  document.addEventListener("avtv:user", render);
  AVTV.ready ? AVTV.ready.then(render) : render();
})();
