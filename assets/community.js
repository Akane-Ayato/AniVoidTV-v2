/* details page: "Add to list" button + comments. Mounts when details.html fires `avtv:anime`. */
(function () {
  "use strict";
  const esc = AVTV.esc, $ = (s, r) => (r || document).querySelector(s);

  /* ---------------- add to list ---------------- */
  function mountList(host, animeId, anime) {
    let status = null;
    const label = () => (status ? AVTV.STATUS.find((s) => s[0] === status)[1] : "Add to list");
    host.innerHTML =
      '<div class="list-wrap"><button class="btn" id="list-btn" type="button" aria-haspopup="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg><span id="list-label">Add to list</span></button>' +
      '<div class="list-menu" id="list-menu"></div></div>';
    const btn = $("#list-btn", host), menu = $("#list-menu", host);

    function paint() {
      $("#list-label", host).textContent = label();
      btn.classList.toggle("primary", !!status);
      menu.innerHTML = AVTV.STATUS.map(([k, n]) => '<button type="button" data-s="' + k + '" class="' + (k === status ? "on" : "") + '"><span class="dot st-' + k + '"></span>' + n + "</button>").join("") +
        (status ? '<button type="button" class="rm" data-s="__remove">Remove from list</button>' : "");
    }
    async function refresh() {
      status = null;
      if (AVTV.user) { try { status = (await AVTV.api("/list/" + animeId)).results.status; } catch (e) { /* ignore */ } }
      paint();
    }
    btn.onclick = (e) => {
      e.stopPropagation();
      if (!AVTV.user) { AVTV.requireAuth("Sign in to add anime to your list.", () => { refresh().then(() => menu.classList.add("open")); }); return; }
      menu.classList.toggle("open");
    };
    document.addEventListener("click", (e) => { if (!host.contains(e.target)) menu.classList.remove("open"); });
    menu.onclick = async (e) => {
      const b = e.target.closest("button[data-s]"); if (!b) return;
      menu.classList.remove("open");
      try {
        if (b.dataset.s === "__remove") { await AVTV.api("/list/" + animeId, { method: "DELETE" }); status = null; AVTV.toast("Removed from your list"); }
        else {
          const j = await AVTV.api("/list/" + animeId, { method: "PUT", body: { status: b.dataset.s, title: anime.title || "", poster: anime.poster || "" } });
          status = j.results.status; AVTV.toast("Saved as “" + label() + "”" + (j.results.vp_gained ? " · +" + j.results.vp_gained + " VP" : ""), "ok");
        }
        paint();
      } catch (err) { AVTV.toast(err.message, "err"); }
    };
    AVTV.ready && AVTV.ready.then(refresh);
    document.addEventListener("avtv:user", refresh);
    paint();
  }

  /* ---------------- comments ---------------- */
  function mountComments(host, animeId) {
    const st = { sort: "new", page: 1, total: 0, hasNext: false, items: [] };

    host.innerHTML =
      '<div class="cm-head"><h2>Comments <small id="cm-count"></small></h2><div class="cm-sort" id="cm-sort"><button type="button" data-sort="new" class="on">Newest</button><button type="button" data-sort="top">Top</button></div></div>' +
      '<div id="cm-compose"></div><div id="cm-list"></div><button class="btn cm-more" id="cm-more" type="button" style="display:none">Load more comments</button>';
    const list = $("#cm-list", host), compose = $("#cm-compose", host), more = $("#cm-more", host);

    function renderCompose() {
      const u = AVTV.user;
      if (!u) { compose.innerHTML = '<div class="cm-login">Want to join the conversation? <a id="cm-signin">Sign in</a> or create a profile to comment.</div>'; $("#cm-signin", host).onclick = () => AVTV.openAuth("login", "Sign in to comment on this anime."); return; }
      compose.innerHTML = '<div class="cm-compose">' + AVTV.avatarHTML(u.avatar, u.username, 40) +
        '<div class="box"><textarea id="cm-text" maxlength="1000" placeholder="Share your thoughts…  (no links, please)"></textarea>' +
        '<div class="row"><span id="cm-left">1000</span><button class="btn primary sm" id="cm-send" type="button">Post comment</button></div></div></div>';
      const ta = $("#cm-text", host);
      ta.oninput = () => ($("#cm-left", host).textContent = 1000 - ta.value.length);
      $("#cm-send", host).onclick = () => send(ta, null, $("#cm-send", host));
    }

    function cHTML(c, isReply) {
      const acts = '<button type="button" data-a="like" class="' + (c.my_vote === 1 ? "on" : "") + '">👍 ' + c.likes + '</button>' +
        '<button type="button" data-a="dislike" class="' + (c.my_vote === -1 ? "on" : "") + '">👎 ' + c.dislikes + "</button>" +
        '<button type="button" data-a="reply">↩ Reply</button>' + (c.mine ? '<button type="button" data-a="delete">🗑 Delete</button>' : "") +
        (!isReply && c.reply_count ? '<button type="button" data-a="replies">▾ ' + c.reply_count + (c.reply_count > 1 ? " replies" : " reply") + "</button>" : "");
      return '<div class="cm" data-id="' + esc(c.id) + '">' + AVTV.avatarHTML(c.user.avatar, c.user.username, isReply ? 32 : 40) +
        '<div class="cm-body"><div class="cm-meta"><a href="user.html?u=' + encodeURIComponent(c.user.username) + '">' + esc(c.user.username) + "</a>" +
        (c.user.rank ? '<span class="rank-pill">' + esc(c.user.rank) + "</span>" : "") + "<span>" + esc(AVTV.timeAgo(c.created_at)) + "</span></div>" +
        '<div class="cm-text">' + esc(c.text) + '</div><div class="cm-actions">' + acts + '</div><div class="reply-box"></div>' +
        (isReply ? "" : '<div class="cm-replies" style="display:none"></div>') + "</div></div>";
    }

    function paint() {
      $("#cm-count", host).textContent = st.total ? "· " + st.total.toLocaleString() : "";
      list.innerHTML = st.items.length ? st.items.map((c) => cHTML(c)).join("") : '<div class="cm-empty">No comments yet. Be the first to say something!</div>';
      more.style.display = st.hasNext ? "" : "none";
    }

    async function load(reset) {
      if (reset) { st.page = 1; st.items = []; }
      try {
        const j = (await AVTV.api("/comments?anime_id=" + animeId + "&page=" + st.page + "&sort=" + st.sort)).results;
        st.items = st.items.concat(j.data); st.total = j.pagination.totalItems; st.hasNext = j.pagination.hasNext;
        paint();
      } catch (e) {
        list.innerHTML = '<div class="cm-empty">' + (e.status === 503 ? "Comments aren't available yet." : "Couldn't load comments.") + "</div>";
        more.style.display = "none";
      }
    }

    async function send(ta, parentId, btn) {
      const text = ta.value.trim();
      if (!text) return AVTV.toast("Write something first.", "err");
      btn.disabled = true;
      try {
        const j = await AVTV.api("/comments", { method: "POST", body: { anime_id: Number(animeId), text, parent_id: parentId } });
        ta.value = "";
        if (j.results.vp_gained) AVTV.toast("Comment posted · +" + j.results.vp_gained + " VP", "ok");
        if (parentId) { await showReplies(host.querySelector('.cm[data-id="' + parentId + '"]'), true); const p = st.items.find((c) => c.id === parentId); if (p) { p.reply_count++; } }
        else { st.items.unshift(j.results); st.total++; paint(); }
        const left = $("#cm-left", host); if (left && !parentId) left.textContent = "1000";
        return true;
      } catch (e) {
        if (e.status === 401) AVTV.openAuth("login", "Sign in to comment on this anime."); else AVTV.toast(e.message, "err");
        return false;
      } finally { btn.disabled = false; }
    }

    async function showReplies(row, force) {
      const box = $(".cm-replies", row), id = row.dataset.id;
      if (!force && box.style.display !== "none") { box.style.display = "none"; return; }
      try {
        const j = (await AVTV.api("/comments/" + id + "/replies")).results;
        box.innerHTML = j.data.map((c) => cHTML(c, true)).join(""); box.style.display = "";
        const btn = $('[data-a="replies"]', row); if (btn) btn.textContent = "▴ Hide replies";
      } catch (e) { AVTV.toast("Couldn't load replies.", "err"); }
    }

    host.addEventListener("click", async (e) => {
      const b = e.target.closest("button[data-a]"); if (!b) return;
      const row = b.closest(".cm"), id = row.dataset.id, a = b.dataset.a;
      if (a === "replies") return showReplies(row.closest(".cm-replies") ? row : row);
      if (!AVTV.user && a !== "replies") return AVTV.openAuth("login", "Sign in to join the conversation.");
      if (a === "like" || a === "dislike") {
        const want = a === "like" ? 1 : -1, was = b.classList.contains("on");
        try {
          const r = (await AVTV.api("/comments/" + id + "/vote", { method: "POST", body: { value: was ? 0 : want } })).results;
          const acts = b.parentElement;
          const [lk, dk] = acts.querySelectorAll('[data-a="like"],[data-a="dislike"]');
          lk.textContent = "👍 " + r.likes; dk.textContent = "👎 " + r.dislikes;
          lk.classList.toggle("on", r.my_vote === 1); dk.classList.toggle("on", r.my_vote === -1);
        } catch (err) { AVTV.toast(err.message, "err"); }
      } else if (a === "delete") {
        if (!confirm("Delete this comment?")) return;
        try { await AVTV.api("/comments/" + id, { method: "DELETE" }); AVTV.toast("Comment deleted"); await load(true); } catch (err) { AVTV.toast(err.message, "err"); }
      } else if (a === "reply") {
        const box = $(".reply-box", row);
        if (box.firstChild) { box.innerHTML = ""; return; }
        box.innerHTML = '<div class="cm-compose" style="margin:10px 0 0"><div class="box"><textarea maxlength="1000" placeholder="Write a reply…"></textarea><div class="row"><span></span><button class="btn primary sm" type="button">Reply</button></div></div></div>';
        const ta = $("textarea", box); ta.focus();
        $("button", box).onclick = (ev) => { const root = row.closest(".cm-replies") ? row.parentElement.closest(".cm") : row; send(ta, root.dataset.id, ev.currentTarget).then((ok) => { if (ok) box.innerHTML = ""; }); };
      }
    });
    $("#cm-sort", host).onclick = (e) => {
      const b = e.target.closest("button[data-sort]"); if (!b) return;
      host.querySelectorAll("#cm-sort button").forEach((x) => x.classList.toggle("on", x === b));
      st.sort = b.dataset.sort; load(true);
    };
    more.onclick = () => { st.page++; load(false); };

    renderCompose();
    load(true);
    document.addEventListener("avtv:user", () => { renderCompose(); load(true); });
  }

  window.addEventListener("avtv:anime", (e) => {
    const { id, anime } = e.detail;
    const lh = $("#list-host"), ch = $("#comments");
    if (lh) mountList(lh, id, anime);
    if (ch) mountComments(ch, id);
  });
})();
