/* shared renderers for profile.html, user.html and shop.html */
(function () {
  "use strict";
  const esc = AVTV.esc, IC = AVTV.icons;
  const COLORS = { watching: "#4fc3ff", completed: "#38d6a0", on_hold: "#ffc46b", dropped: "#ff6b86", plan_to_watch: "#bdb2a1" };
  const PF = (window.PF = {});
  const fx = AVTV.fxClass;

  PF.tile = (icon, tone, value, label) => '<div class="stat">' + AVTV.liquid(icon, tone, 42) + "<div><b>" + esc(value) + "</b><span>" + label + "</span></div></div>";
  PF.statsHTML = (s) => '<div class="stat-grid">' + PF.tile("clock", "aqua", s.hours.toLocaleString(), "Hours watched") + PF.tile("play", "iris", s.episodes.toLocaleString(), "Episodes watched") +
    PF.tile("chat", "rose", s.comments.toLocaleString(), "Comments") + PF.tile("calendar", "amber", s.days_on_site.toLocaleString(), "Days on site") + "</div>";

  PF.barsHTML = (counts) => {
    if (!counts) return '<p class="empty-note">This user keeps their list private.</p>';
    const total = Math.max(1, Object.values(counts).reduce((a, b) => a + b, 0));
    return '<div class="bars">' + AVTV.STATUS.map(([k, n]) => '<div class="bar-row"><span>' + n + '</span><i><s style="width:' + Math.round((counts[k] || 0) / total * 100) + "%;background:" + COLORS[k] + '"></s></i><em>' + (counts[k] || 0) + "</em></div>").join("") + "</div>";
  };

  PF.rankHTML = (rank, vp) => '<div class="rank-top"><b>' + esc(rank.title) + "</b><span>" + vp.toLocaleString() + " VP" + (rank.next_at ? " \u00b7 next: " + esc(rank.next_title) + " at " + rank.next_at.toLocaleString() : " \u00b7 max rank") + "</span></div>" +
    '<div class="meter"><s style="width:' + rank.progress + '%"></s></div><div class="ladder">' + rank.ladder.map((l, i) => '<div class="' + (i < rank.index ? "done" : i === rank.index ? "cur" : "") + '">' + esc(l.title) + "<b>" + l.at.toLocaleString() + "</b></div>").join("") + "</div>";

  PF.badgesHTML = (badges) => '<div class="badge-grid">' + badges.map((b) => '<div class="badge ' + (b.earned ? "" : "lock") + '" title="' + esc(b.desc) + '">' + AVTV.badgeIcon(b.icon, b.earned, 44) + "<div><b>" + esc(b.name) + "</b><small>" + esc(b.desc) + "</small></div></div>").join("") + "</div>";

  PF.favsHTML = (favs, editable) => favs && favs.length
    ? '<div class="fav-grid">' + favs.map((f) => '<div class="fav"><a href="details.html?id=' + f.id + '"><img src="' + esc(f.poster) + '" alt="" loading="lazy"></a><span>' + esc(f.title) + "</span>" + (editable ? '<button class="x" type="button" data-fav-rm="' + f.id + '" aria-label="Remove ' + esc(f.title) + '">' + IC.x + "</button>" : "") + "</div>").join("") + "</div>"
    : '<p class="empty-note">' + (editable ? "No favorites yet. Add up to 10 anime you love." : "No favorites picked yet.") + "</p>";

  PF.listCardsHTML = (items, editable) => items.length
    ? '<div class="mini-grid">' + items.map((i) => '<div class="li-card"><a class="p" href="details.html?id=' + i.anime_id + '"><img src="' + esc(i.poster) + '" alt="" loading="lazy"></a><a class="t" href="details.html?id=' + i.anime_id + '">' + esc(i.title || "Anime #" + i.anime_id) + "</a>" +
        (editable ? '<select data-status="' + i.anime_id + '">' + AVTV.STATUS.map(([k, n]) => '<option value="' + k + '"' + (k === i.status ? " selected" : "") + ">" + n + "</option>").join("") + '</select><button class="rm" type="button" data-list-rm="' + i.anime_id + '">Remove</button>' : '<span class="cm-meta">' + esc((AVTV.STATUS.find((s) => s[0] === i.status) || [0, i.status])[1]) + "</span>") + "</div>").join("") + "</div>"
    : '<p class="empty-note">Nothing here yet.</p>';

  PF.joined = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "");

  /* banner: uploaded picture or a free print-pattern preset, plus the equipped animated scene */
  PF.bannerHTML = (u, overrideFx) => {
    const b = u.banner || {}, id = overrideFx !== undefined ? overrideFx : u.fx && u.fx.banner;
    const base = b.pic ? '<img class="bn" src="' + AVTV.mediaUrl(b.pic) + '" alt="" decoding="async">' : '<div class="bn bp-' + esc(b.preset || "p1") + '"></div>';
    return '<div class="pf-banner">' + base + '<div class="bfx">' + (id && AVTV.bannerFx ? AVTV.bannerFx(id) : "") + "</div></div>";
  };

  /* Telegram-style profile card: cover, centred avatar, name + status, round action tiles, info rows */
  PF.infoRow = (icon, value, label, extra) => '<div class="tg-row"><span class="tg-ic">' + IC[icon] + '</span><div class="tg-v"><b>' + value + "</b><small>" + label + "</small></div>" + (extra || "") + "</div>";
  PF.act = (id, icon, label, href, disabled) => (href ? '<a class="tg-act" id="' + id + '" href="' + href + '">' : '<button class="tg-act" type="button" id="' + id + '"' + (disabled ? " disabled" : "") + ">") + IC[icon] + "<span>" + label + "</span>" + (href ? "</a>" : "</button>");
  PF.tgHTML = (u, acts) => {
    const rows = PF.infoRow("user", "@" + esc(u.username), "Username", '<button class="tg-copy" type="button" data-copy="@' + esc(u.username) + '" aria-label="Copy username">' + IC.link + "</button>") +
      (u.bio ? PF.infoRow("chat", '<span class="tg-bio">' + esc(u.bio) + "</span>", "Bio") : "") +
      PF.infoRow("trophy", esc(u.rank.title) + " \u00b7 " + u.vp.toLocaleString() + " VP", "Rank") +
      PF.infoRow("flame", (u.streak || 0) + " day" + (u.streak === 1 ? "" : "s"), "Check-in streak") +
      PF.infoRow("calendar", esc(PF.joined(u.joined)), "Member since");
    return '<section class="pf-card tg cardfx' + fx(u.fx && u.fx.card) + '">' + PF.bannerHTML(u) +
      '<div class="pf-head"><button type="button" class="pf-av" data-lightbox="' + esc(u.avatar.pic || "") + '" aria-label="View picture">' + AVTV.avatarHTML(u.avatar, u.name, 120, u.fx) + "</button>" +
      '<div class="pf-id"><h1>' + AVTV.whoHTML(u) + '</h1><div class="meta">' + esc(u.rank.title) + " \u00b7 @" + esc(u.username) + "</div></div></div>" +
      '<div class="tg-actions">' + acts + '</div><div class="tg-info">' + rows + "</div></section>";
  };
  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-copy]"); if (!c) return;
    (navigator.clipboard ? navigator.clipboard.writeText(c.dataset.copy) : Promise.reject()).then(() => AVTV.toast("Copied", "ok")).catch(() => AVTV.toast("Couldn't copy", "err"));
  });

  /* lightbox for pictures */
  PF.lightbox = (id) => {
    if (!id) return;
    let lb = document.querySelector(".lightbox");
    if (!lb) { lb = document.createElement("div"); lb.className = "lightbox"; lb.innerHTML = '<button type="button" aria-label="Close">' + IC.x + "</button><img alt=\"\">"; document.body.appendChild(lb); lb.addEventListener("click", (e) => { if (e.target === lb || e.target.closest("button")) lb.classList.remove("open"); }); document.addEventListener("keydown", (e) => { if (e.key === "Escape") lb.classList.remove("open"); }); }
    lb.querySelector("img").src = AVTV.mediaUrl(id); lb.classList.add("open");
  };
  document.addEventListener("click", (e) => { const t = e.target.closest("[data-lightbox]"); if (t) PF.lightbox(t.dataset.lightbox); });

  /* live preview of any shop item, rendered with the viewer's own avatar and name */
  PF.previewHTML = (item, u) => {
    const nm = u.name || u.username;
    switch (item.kind) {
      case "frame": return '<div class="pv pv-frame">' + AVTV.avatarHTML(u.avatar, nm, 64, { frame: item.id }) + "</div>";
      case "name": return '<div class="pv pv-name"><span class="nm' + fx(item.id) + '" data-text="' + esc(nm) + '">' + esc(nm) + "</span></div>";
      case "banner": return '<div class="pv pv-banner">' + PF.bannerHTML(u, item.id) + "</div>";
      case "card": return '<div class="pv pv-card"><div class="cardfx' + fx(item.id) + ' pv-bubble">' + AVTV.avatarHTML(u.avatar, nm, 28) + "<span>Great episode, loved it!</span></div></div>";
      case "title": return '<div class="pv pv-title">' + AVTV.titleHTML({ name: item.name, rarity: item.rarity, color: u.equipped ? u.equipped.title_color : null }) + "</div>";
      case "pack": { const ids = AVTV.STICKER_PACKS[item.id.slice(5)] || []; return '<div class="pv pv-pack">' + ids.slice(0, 4).map((i) => '<span class="mini-st">' + AVTV.sticker(item.id.slice(5) + ":" + i) + "</span>").join("") + "</div>"; }
      default: return "";
    }
  };
})();
