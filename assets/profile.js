/* profile.html: your dashboard. Hash tabs: overview, customize, pictures, continue, list, friends, notifications, settings */
(function () {
  "use strict";
  const esc = AVTV.esc, IC = AVTV.icons, $ = (s, r) => (r || document).querySelector(s);
  const root = $("#pf-root");
  const TABS = [["overview", "Overview", IC.user], ["customize", "Customize", IC.palette], ["pictures", "Pictures", IC.image], ["continue", "Continue Watching", IC.clock], ["list", "Watch List", IC.bookmark],
    ["friends", "Friends", IC.users], ["notifications", "Notifications", IC.bell], ["settings", "Settings", IC.cog]];
  const SLOTS = [["frame", "Avatar effect"], ["name", "Name effect"], ["banner", "Banner animation"], ["card", "Comment & card style"], ["title", "Title"]];
  let tab = (location.hash || "#overview").slice(1);
  if (!TABS.some((t) => t[0] === tab)) tab = "overview";
  let listFilter = "all", editFavs = false, shop = null, draftBio = null, draftName = null;

  const me = () => AVTV.user;
  async function reloadMe() { AVTV.user = (await AVTV.api("/me")).results; }
  const fail = (e) => AVTV.toast(e.message || "Something went wrong", "err");
  async function loadShop(force) { if (!shop || force) shop = (await AVTV.api("/shop")).results; return shop; }

  function render() {
    const u = me();
    if (!u) {
      root.innerHTML = '<div class="box soon-box">' + AVTV.liquid("lock", "iris", 64) + '<h3>Sign in to see your profile</h3><p>Create a profile to build a watch list, comment with stickers and reactions, collect effects and keep Continue Watching in sync.</p><div class="row-btns" style="justify-content:center;margin-top:18px"><button class="btn primary" id="pf-signin" type="button">Sign in / Register</button></div></div>';
      $("#pf-signin").onclick = () => AVTV.openAuth("login", "Sign in to view your profile.");
      return;
    }
    const acts = PF.act("checkin", "gift", u.checked_in_today ? "Checked in" : "Check in", "", u.checked_in_today) + PF.act("shop-link", "bag", "Shop", "shop.html") +
      PF.act("custom-link", "palette", "Customize", "#customize") + PF.act("share", "link", "Share");
    root.innerHTML = '<div class="tg-layout"><aside>' + PF.tgHTML(u, acts) + '</aside><section class="tg-main"><nav class="pf-tabs" aria-label="Profile sections">' + TABS.map(([k, n, ic]) => '<a href="#' + k + '" class="' + (k === tab ? "on" : "") + '">' + ic + n + "</a>").join("") + '</nav><div id="pf-panel"></div></section></div>';
    $("#share").onclick = () => { const url = location.origin + "/user.html?u=" + encodeURIComponent(u.username); (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => AVTV.toast("Profile link copied", "ok")).catch(() => prompt("Copy your profile link:", url)); };
    $("#checkin").onclick = checkin;
    panel();
  }

  async function checkin() {
    try {
      const r = (await AVTV.api("/me/checkin", { method: "POST" })).results;
      AVTV.toast(r.already ? "Already checked in today." : "+" + r.granted + " VP \u00b7 " + r.streak + "-day streak", r.already ? "" : "ok");
      await reloadMe(); render();
    } catch (e) { fail(e); }
  }

  async function panel() {
    const host = $("#pf-panel"), u = me();
    if (tab === "overview") {
      host.innerHTML =
        '<div class="box"><h3>Rank <small>earn VP by watching, commenting &amp; checking in daily</small></h3>' + PF.rankHTML(u.rank, u.vp) + "</div>" +
        '<div class="box"><h3>Stats</h3>' + PF.statsHTML(u.stats) + '</div><div class="box"><h3>Anime stats</h3>' + PF.barsHTML(u.stats.list_counts) + "</div>" +
        '<div class="box"><h3>Badges <small>' + u.badges.filter((b) => b.earned).length + " / " + u.badges.length + " earned</small></h3>" + PF.badgesHTML(u.badges) + "</div>" +
        '<div class="box"><h3>Favorites <small>' + u.favorites.length + ' / 10 <button class="btn sm" id="fav-edit" type="button">' + (editFavs ? "Done" : "Edit") + "</button></small></h3>" + PF.favsHTML(u.favorites, editFavs) + (editFavs ? favEditorHTML() : "") + "</div>" +
        '<div class="box"><h3>Earning history <button class="btn sm" id="vp-load" type="button">Show</button></h3><div id="vp-hist"></div></div>';
      $("#fav-edit").onclick = () => { editFavs = !editFavs; panel(); };
      $("#vp-load").onclick = loadVP;
      bindFavs();
    } else if (tab === "customize") { customize(host, u); }
    else if (tab === "pictures") { pictures(host); }
    else if (tab === "continue") {
      host.innerHTML = '<div class="box"><h3>Continue Watching <button class="btn sm danger" id="cw-clear" type="button">Clear all</button></h3><div id="cw-grid" class="mini-grid"><div class="grid-status">Loading\u2026</div></div></div>';
      await AVTV.cw.sync(); paintCW();
      $("#cw-clear").onclick = async () => { if (confirm("Remove everything from Continue Watching?")) { await AVTV.cw.clear(); paintCW(); } };
    } else if (tab === "list") {
      host.innerHTML = '<div class="box"><h3>Watch List</h3><div class="chips" id="chips"></div><div id="list-body"><div class="grid-status">Loading\u2026</div></div></div>';
      loadList();
    } else if (tab === "settings") { settings(host, u); }
    else {
      const soon = tab === "friends" ? ["users", "aqua", "Friends", "Add friends, see what they're watching and compare stats. Coming in the next update."] : ["bell", "rose", "Notifications", "Get notified about replies, reactions and new episodes from your list. Coming in the next update."];
      host.innerHTML = '<div class="box soon-box">' + AVTV.liquid(soon[0], soon[1], 64) + "<h3>" + soon[2] + "</h3><p>" + soon[3] + "</p></div>";
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
      const names = { checkin: "Daily check-in", comment: "Comment", episode: "Episode watched", list_add: "Added to list", welcome: "Welcome bonus", shop: "Shop purchase" };
      $("#vp-hist").innerHTML = '<div class="vp-hist">' + (rows.length ? rows.map((r) => "<div><span>" + esc(names[r.reason] || r.reason) + " \u00b7 " + esc(AVTV.timeAgo(r.at)) + '</span><b class="' + (r.delta < 0 ? "minus" : "plus") + '">' + (r.delta > 0 ? "+" : "") + r.delta + "</b></div>").join("") : '<p class="empty-note">No activity yet.</p>') + "</div>";
    } catch (e) { fail(e); }
  }

  /* ---------- favorites ---------- */
  const favEditorHTML = () => '<div class="fav-edit"><div class="field"><input id="fav-q" type="search" placeholder="Search an anime to add\u2026" style="padding-left:14px" maxlength="100"></div><div class="res" id="fav-res"></div></div>';
  async function saveFavs(favs) { try { AVTV.user = (await AVTV.api("/me", { method: "PATCH", body: { favorites: favs } })).results; panel(); } catch (e) { fail(e); } }
  function bindFavs() {
    document.querySelectorAll("[data-fav-rm]").forEach((b) => (b.onclick = () => saveFavs(me().favorites.filter((f) => String(f.id) !== b.dataset.favRm))));
    const q = $("#fav-q"); if (!q) return;
    let t = null;
    q.oninput = () => {
      clearTimeout(t); const v = q.value.trim(); if (v.length < 2) { $("#fav-res").innerHTML = ""; return; }
      t = setTimeout(async () => {
        try {
          const rows = (await AVTV.api("/search?keyword=" + encodeURIComponent(v))).results.data.filter((r) => r.id).slice(0, 8);
          $("#fav-res").innerHTML = rows.map((r) => '<button type="button" data-add="' + esc(JSON.stringify({ id: r.id, title: r.title, poster: r.poster })) + '"><img src="' + esc(r.poster) + '" alt=""><span>' + esc(r.title) + "</span></button>").join("") || '<p class="empty-note">No matches.</p>';
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

  /* ---------- watch list ---------- */
  async function loadList() {
    try {
      const j = (await AVTV.api("/list?status=" + listFilter)).results;
      const total = Object.values(j.counts).reduce((a, b) => a + b, 0);
      $("#chips").innerHTML = '<button type="button" data-f="all" class="' + (listFilter === "all" ? "on" : "") + '">All (' + total + ")</button>" + AVTV.STATUS.map(([k, n]) => '<button type="button" data-f="' + k + '" class="' + (listFilter === k ? "on" : "") + '">' + n + " (" + (j.counts[k] || 0) + ")</button>").join("");
      $("#list-body").innerHTML = PF.listCardsHTML(j.data, true);
    } catch (e) { $("#list-body").innerHTML = '<div class="grid-status err">Couldn\'t load your list.</div>'; }
  }
  document.addEventListener("click", async (e) => {
    const f = e.target.closest("#chips [data-f]");
    if (f) { listFilter = f.dataset.f; loadList(); return; }
    const rm = e.target.closest("[data-list-rm]");
    if (rm) { try { await AVTV.api("/list/" + rm.dataset.listRm, { method: "DELETE" }); AVTV.toast("Removed from your list"); loadList(); reloadMe(); } catch (err) { fail(err); } }
  });
  document.addEventListener("change", async (e) => {
    const s = e.target.closest("[data-status]"); if (!s) return;
    const card = s.closest(".li-card");
    try { await AVTV.api("/list/" + s.dataset.status, { method: "PUT", body: { status: s.value, title: card.querySelector(".t").textContent, poster: card.querySelector("img").getAttribute("src") } }); AVTV.toast("List updated", "ok"); loadList(); reloadMe(); }
    catch (err) { fail(err); }
  });

  /* ---------- customize: name, effects, banner preset, default avatar ---------- */
  async function customize(host, u) {
    host.innerHTML = '<div class="grid-status">Loading\u2026</div>';
    try { await loadShop(true); } catch (e) { host.innerHTML = '<div class="grid-status err">Couldn\'t load your items.</div>'; return; }
    const eq = u.equipped || {};
    const nameVal = draftName != null ? draftName : u.display_name || "";
    host.innerHTML =
      '<div class="box"><h3>Display name <small>shown on comments and your public profile</small></h3><div class="set-grid"><div class="field"><input id="dname" value="' + esc(nameVal) + '" maxlength="24" placeholder="' + esc(u.username) + '" autocomplete="off"></div>' +
      '<p class="hint">2-24 characters: letters, numbers, spaces and _ - . \' ! ~ . Your @' + esc(u.username) + " handle stays the same. Leave empty to use it.</p>" +
      '<div class="row-btns"><button class="btn primary" id="save-dname" type="button">Save name</button></div></div></div>' +
      '<div class="box"><h3>Your look <small><a href="shop.html" style="color:var(--aqua)">Get more in the Void Shop</a></small></h3>' + SLOTS.map(([k, label]) => slotHTML(k, label, u, eq)).join("") + "</div>" +
      '<div class="box"><h3>Banner presets <small>or upload your own in Pictures</small></h3><div class="bp-grid" id="bp">' + u.banner_presets.map((p) => '<button type="button" class="bp-' + p + (!u.banner.pic && u.banner.preset === p ? " on" : "") + '" data-bp="' + p + '" aria-label="Banner ' + p + '"></button>').join("") + "</div></div>" +
      '<div class="box"><h3>Default avatar <small>used when you have no picture</small></h3><div class="set-grid"><div><span class="lbl">Colour</span><div class="swatches" id="sw">' + Array.from({ length: u.avatar_bg_count }, (_, i) => '<button type="button" class="bg' + i + (i === u.avatar.bg ? " on" : "") + '" data-bg="' + i + '" aria-label="Colour ' + (i + 1) + '"></button>').join("") + "</div></div>" +
      '<div><span class="lbl">Icon</span><div class="swatches glyphs" id="gl">' + u.avatar_glyphs.map((g) => '<button type="button" class="' + (g === u.avatar.icon ? "on" : "") + '" data-g="' + g + '" aria-label="' + g + '">' + (g === "initial" ? esc((u.name || u.username).charAt(0).toUpperCase()) : AVTV.glyph(g)) + "</button>").join("") + "</div></div></div></div>";

    $("#dname").oninput = (e) => (draftName = e.target.value);
    $("#save-dname").onclick = async () => { try { AVTV.user = (await AVTV.api("/me", { method: "PATCH", body: { display_name: $("#dname").value } })).results; draftName = null; AVTV.toast("Display name saved", "ok"); render(); } catch (e) { fail(e); } };
    host.onclick = async (e) => {
      const pick = e.target.closest("[data-equip]");
      if (pick) { const [slot, item] = pick.dataset.equip.split("|"); try { await AVTV.api("/shop/equip", { method: "POST", body: { slot, item: item || null } }); await reloadMe(); AVTV.toast("Look updated", "ok"); render(); } catch (err) { fail(err); } return; }
      const tc = e.target.closest("[data-tc]");
      if (tc) { try { await AVTV.api("/shop/title-color", { method: "POST", body: { color: tc.dataset.tc === "" ? null : Number(tc.dataset.tc) } }); await reloadMe(); render(); } catch (err) { fail(err); } return; }
      const bp = e.target.closest("[data-bp]");
      if (bp) { try { AVTV.user = (await AVTV.api("/me", { method: "PATCH", body: { banner: { preset: bp.dataset.bp } } })).results; render(); } catch (err) { fail(err); } return; }
      const bg = e.target.closest("[data-bg]"), gl = e.target.closest("[data-g]");
      if (bg || gl) { try { AVTV.user = (await AVTV.api("/me", { method: "PATCH", body: { avatar: bg ? { bg: Number(bg.dataset.bg) } : { icon: gl.dataset.g } } })).results; render(); } catch (err) { fail(err); } }
    };
  }

  function slotHTML(kind, label, u, eq) {
    const items = shop.items.filter((i) => i.kind === kind && i.owned);
    const view = Object.assign({}, u, { equipped: eq });
    const cur = eq[kind] || "";
    const none = '<button type="button" class="pick' + (!cur ? " on" : "") + '" data-equip="' + kind + '|"><div class="pv"><span class="empty-note">None</span></div>No ' + (kind === "title" ? "title" : "effect") + "</button>";
    const cards = items.map((i) => '<button type="button" class="pick' + (cur === i.id ? " on" : "") + '" data-equip="' + kind + "|" + esc(i.id) + '"><div class="pv">' + PF.previewHTML(i, view) + "</div>" + esc(i.name) + '<small><span class="rar ' + esc(i.rarity) + '"></span>' + esc(i.rarity) + "</small></button>").join("");
    const colors = kind === "title" && cur ? '<div class="swatches" style="margin-top:6px">' + Array.from({ length: shop.title_colors }, (_, i) => '<button type="button" class="ttl tc' + i + (eq.title_color === i ? " on" : "") + '" style="width:26px;height:26px;padding:0;justify-content:center;border-radius:50%" data-tc="' + i + '" aria-label="Title colour ' + (i + 1) + '"></button>').join("") + '<button type="button" class="btn sm ghost" data-tc="">Default colour</button></div>' : "";
    return '<div class="slot"><div class="slot-h"><b>' + label + '</b><small class="hint" style="margin:0">' + items.length + " owned</small></div><div class=\"pick-row\">" + none + cards + "</div>" + colors + "</div>";
  }

  /* ---------- pictures ---------- */
  async function pictures(host) {
    host.innerHTML = '<div class="grid-status">Loading\u2026</div>';
    let g;
    try { g = (await AVTV.api("/me/pictures")).results; } catch (e) { host.innerHTML = '<div class="grid-status err">Couldn\'t load your pictures.</div>'; return; }
    const tile = (m, kind) => '<div class="gal-item' + (m.main ? " main" : "") + '"><img src="' + AVTV.mediaUrl(m.id) + '" alt="" loading="lazy" data-view="' + m.id + '">' + (m.main ? '<span class="tag">' + (kind === "avatar" ? "MAIN" : "ACTIVE") + "</span>" : "") +
      '<div class="tools">' + (m.main ? "" : '<button class="btn sm" type="button" data-main="' + m.id + '">' + IC.check + "Use</button>") + '<button class="btn sm danger" type="button" data-del="' + m.id + '" aria-label="Delete">' + IC.trash + "</button></div></div>";
    host.innerHTML =
      '<div class="box"><h3>Profile pictures <small>' + g.avatars.length + " / " + g.limits.avatar + '</small></h3><div class="gal">' + '<button class="gal-add" type="button" data-add="avatar">' + IC.plus + "Add picture</button>" + g.avatars.map((m) => tile(m, "avatar")).join("") + '</div><p class="hint" style="margin-top:12px">Upload as many as you like and pick which one is your main picture. It shows on comments and your profile.</p></div>' +
      '<div class="box"><h3>Banners <small>' + g.banners.length + " / " + g.limits.banner + '</small></h3><div class="gal banners">' + '<button class="gal-add" type="button" data-add="banner">' + IC.plus + "Add banner</button>" + g.banners.map((m) => tile(m, "banner")).join("") + "</div></div>";
    host.onclick = async (e) => {
      const add = e.target.closest("[data-add]");
      if (add) {
        const kind = add.dataset.add, size = kind === "avatar" ? { w: 384, h: 384, label: "profile picture" } : { w: 1500, h: 500, label: "banner" };
        try {
          const blob = await AVTV.pickAndCrop(size); if (!blob) return;
          add.disabled = true;
          await AVTV.uploadPicture(kind, blob); AVTV.toast("Picture uploaded", "ok"); await reloadMe(); render();
        } catch (err) { fail(err); add.disabled = false; }
        return;
      }
      const main = e.target.closest("[data-main]");
      if (main) { try { await AVTV.api("/me/pictures/" + main.dataset.main + "/main", { method: "POST" }); await reloadMe(); AVTV.toast("Updated", "ok"); render(); } catch (err) { fail(err); } return; }
      const del = e.target.closest("[data-del]");
      if (del) { if (!confirm("Delete this picture?")) return; try { await AVTV.api("/me/pictures/" + del.dataset.del, { method: "DELETE" }); await reloadMe(); render(); } catch (err) { fail(err); } return; }
      const view = e.target.closest("[data-view]"); if (view) PF.lightbox(view.dataset.view);
    };
  }

  /* ---------- settings ---------- */
  async function settings(host, u) {
    const pwNote = u.has_password ? "" : '<p class="hint">Your account signs in with Google. Set a password if you also want to log in with your username.</p>';
    host.innerHTML =
      '<div class="box"><h3>Bio</h3><div class="set-grid"><div><label for="bio">About you <span id="bio-n" style="float:right">' + (draftBio != null ? draftBio : u.bio).length + ' / 200</span></label><div class="field"><textarea id="bio" maxlength="200" placeholder="Tell people about yourself (plain text, no links)">' + esc(draftBio != null ? draftBio : u.bio) + '</textarea></div></div><div class="row-btns"><button class="btn primary" id="save-bio" type="button">Save bio</button></div></div></div>' +
      '<div class="box"><h3>Privacy</h3><label class="switch"><input type="checkbox" id="show-list"' + (u.privacy.show_list ? " checked" : "") + '> Show my watch list &amp; list stats on my public profile</label><div class="row-btns" style="margin-top:12px"><button class="btn" id="save-priv" type="button">Save</button></div></div>' +
      '<div class="box"><h3>Username <small>your @handle, used to log in</small></h3><div class="set-grid"><div class="field"><input id="un" value="' + esc(u.username) + '" maxlength="20" autocomplete="off"></div>' + (u.has_password ? '<div class="field pw"><input id="un-pw" type="password" placeholder="Your password" autocomplete="current-password"></div>' : "") +
      '<p class="hint">3-20 characters: letters, numbers, underscore. You can change it once every 30 days. To change the name people see, use Display name in Customize.</p><div class="row-btns"><button class="btn" id="save-un" type="button">Change username</button></div></div></div>' +
      '<div class="box"><h3>Password</h3>' + pwNote + '<div class="set-grid">' + (u.has_password ? '<div class="field pw"><input id="pw0" type="password" placeholder="Current password" autocomplete="current-password"></div>' : "") +
      '<div class="field pw"><input id="pw1" type="password" placeholder="New password" autocomplete="new-password" maxlength="64"></div><div class="field pw"><input id="pw2" type="password" placeholder="Confirm new password" autocomplete="new-password" maxlength="64"></div><div class="row-btns"><button class="btn" id="save-pw" type="button">' + (u.has_password ? "Change password" : "Set password") + '</button></div></div></div>' +
      '<div class="box"><h3>Where you\'re signed in <button class="btn sm danger" id="out-all" type="button">Sign out everywhere</button></h3><div class="sess" id="sess"><div class="grid-status">Loading\u2026</div></div></div>' +
      '<div class="box"><h3>Account</h3><div class="sess"><div class="sess-row">' + IC.shield + '<div class="grow">Email<small>' + esc(u.email || "none (password account)") + '</small></div></div><div class="sess-row">' + IC.link + '<div class="grow">Google sign-in<small>' + (u.google_linked ? "Connected" : "Not connected") + '</small></div></div></div><div class="row-btns" style="margin-top:14px"><button class="btn" id="copy-url" type="button">' + IC.link + "Copy public profile link</button></div></div>";
    $("#bio").oninput = (e) => { draftBio = e.target.value; $("#bio-n").textContent = e.target.value.length + " / 200"; };
    $("#save-bio").onclick = async () => { try { AVTV.user = (await AVTV.api("/me", { method: "PATCH", body: { bio: $("#bio").value } })).results; draftBio = null; AVTV.toast("Bio saved", "ok"); render(); } catch (e) { fail(e); } };
    $("#save-priv").onclick = async () => { try { AVTV.user = (await AVTV.api("/me", { method: "PATCH", body: { privacy: { show_list: $("#show-list").checked } } })).results; AVTV.toast("Privacy saved", "ok"); } catch (e) { fail(e); } };
    $("#save-un").onclick = async () => { try { AVTV.user = (await AVTV.api("/me/username", { method: "POST", body: { username: $("#un").value.trim(), password: u.has_password ? $("#un-pw").value : "" } })).results; AVTV.toast("Username updated", "ok"); render(); } catch (e) { fail(e); } };
    $("#save-pw").onclick = async () => {
      const p1 = $("#pw1").value;
      if (p1 !== $("#pw2").value) return AVTV.toast("New passwords don't match.", "err");
      try { await AVTV.api("/me/password", { method: "POST", body: { current: u.has_password ? $("#pw0").value : "", new: p1 } }); AVTV.toast("Password updated. Other devices were signed out.", "ok"); await reloadMe(); render(); } catch (e) { fail(e); }
    };
    $("#copy-url").onclick = () => { const url = location.origin + "/user.html?u=" + encodeURIComponent(u.username); (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => AVTV.toast("Link copied", "ok")).catch(() => prompt("Copy your profile link:", url)); };
    $("#out-all").onclick = async () => { if (!confirm("Sign out of every device, including this one?")) return; try { await AVTV.api("/auth/logout-all", { method: "POST" }); location.href = "home.html"; } catch (e) { fail(e); } };
    try {
      const rows = (await AVTV.api("/me/sessions")).results;
      $("#sess").innerHTML = rows.map((s) => '<div class="sess-row">' + IC.device + '<div class="grow">' + esc(s.device) + (s.current ? ' <span class="now">THIS DEVICE</span>' : "") + "<small>" + esc(s.ip) + " \u00b7 active " + esc(AVTV.timeAgo(s.last_seen)) + "</small></div>" + (s.current ? "" : '<button class="btn sm danger" type="button" data-revoke="' + esc(s.id) + '">Sign out</button>') + "</div>").join("");
      $("#sess").onclick = async (e) => { const b = e.target.closest("[data-revoke]"); if (!b) return; try { await AVTV.api("/me/sessions/" + encodeURIComponent(b.dataset.revoke), { method: "DELETE" }); settings(host, me()); } catch (err) { fail(err); } };
    } catch (e) { $("#sess").innerHTML = '<p class="empty-note">Couldn\'t load sessions.</p>'; }
  }

  window.addEventListener("hashchange", () => { const t = (location.hash || "#overview").slice(1); if (TABS.some((x) => x[0] === t)) { tab = t; draftBio = null; render(); } });
  document.addEventListener("avtv:user", render);
  AVTV.ready ? AVTV.ready.then(render) : render();
})();
