/* shared renderers for profile.html and user.html */
(function () {
  "use strict";
  const esc = AVTV.esc;
  const COLORS = { watching: "#3fa8e8", completed: "#6fd6a0", on_hold: "#e8a854", dropped: "#ff6b6b", plan_to_watch: "#9a90a8" };
  const PF = (window.PF = {});

  PF.statsHTML = (s) =>
    '<div class="stat-grid">' +
    [[s.hours.toLocaleString(), "Hours watched"], [s.episodes.toLocaleString(), "Episodes watched"], [s.comments.toLocaleString(), "Comments"], [s.days_on_site.toLocaleString(), "Days on site"]]
      .map(([v, l]) => '<div class="stat"><b>' + esc(v) + "</b><span>" + l + "</span></div>").join("") + "</div>";

  PF.barsHTML = (counts) => {
    if (!counts) return '<p class="empty-note">This user keeps their list private.</p>';
    const total = Math.max(1, Object.values(counts).reduce((a, b) => a + b, 0));
    return '<div class="bars">' + AVTV.STATUS.map(([k, n]) =>
      '<div class="bar-row"><span>' + n + '</span><i><s style="width:' + Math.round((counts[k] || 0) / total * 100) + "%;background:" + COLORS[k] + '"></s></i><em>' + (counts[k] || 0) + "</em></div>").join("") + "</div>";
  };

  PF.rankHTML = (rank, vp) =>
    '<div class="rank-top"><b>' + esc(rank.title) + "</b><span>" + vp.toLocaleString() + " VP" + (rank.next_at ? " · next: " + esc(rank.next_title) + " at " + rank.next_at.toLocaleString() : " · max rank") + "</span></div>" +
    '<div class="meter"><s style="width:' + rank.progress + '%"></s></div>' +
    '<div class="ladder">' + rank.ladder.map((l, i) => '<div class="' + (i < rank.index ? "done" : i === rank.index ? "cur" : "") + '">' + esc(l.title) + "<b>" + l.at.toLocaleString() + "</b></div>").join("") + "</div>";

  PF.badgesHTML = (badges) => '<div class="badge-grid">' + badges.map((b) =>
    '<div class="badge ' + (b.earned ? "" : "lock") + '" title="' + esc(b.desc) + '"><span class="ic">' + esc(b.icon) + "</span><div><b>" + esc(b.name) + "</b><small>" + esc(b.desc) + "</small></div></div>").join("") + "</div>";

  PF.favsHTML = (favs, editable) => favs && favs.length
    ? '<div class="fav-grid">' + favs.map((f) => '<div class="fav"><a href="details.html?id=' + f.id + '"><img src="' + esc(f.poster) + '" alt="" loading="lazy"></a><span>' + esc(f.title) + "</span>" +
        (editable ? '<button class="x" type="button" data-fav-rm="' + f.id + '" aria-label="Remove ' + esc(f.title) + '">✕</button>' : "") + "</div>").join("") + "</div>"
    : '<p class="empty-note">' + (editable ? "No favorites yet. Add up to 10 anime you love." : "No favorites picked yet.") + "</p>";

  PF.listCardsHTML = (items, editable) => items.length
    ? '<div class="mini-grid">' + items.map((i) => '<div class="li-card"><a class="p" href="details.html?id=' + i.anime_id + '"><img src="' + esc(i.poster) + '" alt="" loading="lazy"></a><a class="t" href="details.html?id=' + i.anime_id + '">' + esc(i.title || "Anime #" + i.anime_id) + "</a>" +
        (editable ? '<select data-status="' + i.anime_id + '">' + AVTV.STATUS.map(([k, n]) => '<option value="' + k + '"' + (k === i.status ? " selected" : "") + ">" + n + "</option>").join("") + '</select><button class="rm" type="button" data-list-rm="' + i.anime_id + '">Remove</button>'
          : '<span class="cm-meta">' + esc((AVTV.STATUS.find((s) => s[0] === i.status) || [0, i.status])[1]) + "</span>") + "</div>").join("") + "</div>"
    : '<p class="empty-note">Nothing here yet.</p>';

  PF.joined = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "");
})();
