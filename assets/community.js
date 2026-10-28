/* details page: "Add to list" button + comments (reactions, stickers, display names, card effects). */
(function () {
  "use strict";
  const esc = AVTV.esc, $ = (s, r) => (r || document).querySelector(s), IC = AVTV.icons;
  const REACTIONS = ["like", "love", "haha", "wow", "sad", "angry", "fire", "clap"];
  const PACK_NAMES = { blobs: "Blobbies", words: "Hype Words", spirits: "Little Spirits", sparks: "Living Sparks", critters: "Critter Club" };

  /* ---------------- add to list ---------------- */
  function mountList(host, animeId, anime) {
    let status = null;
    const label = () => (status ? AVTV.STATUS.find((s) => s[0] === status)[1] : "Add to list");
    host.innerHTML = '<div class="list-wrap"><button class="btn" id="list-btn" type="button" aria-haspopup="true">' + IC.bookmark + '<span id="list-label">Add to list</span></button><div class="list-menu" id="list-menu"></div></div>';
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
          status = j.results.status; AVTV.toast("Saved as \u201c" + label() + "\u201d" + (j.results.vp_gained ? " \u00b7 +" + j.results.vp_gained + " VP" : ""), "ok");
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
    const st = { sort: "new", page: 1, total: 0, hasNext: false, items: [], sticker: null };

    host.innerHTML =
      '<div class="cm-head"><h2>Comments <small id="cm-count"></small></h2><div class="cm-sort" id="cm-sort"><button type="button" data-sort="new" class="on">Newest</button><button type="button" data-sort="top">Top</button></div></div>' +
      '<div id="cm-compose"></div><div id="cm-list"></div><button class="btn cm-more" id="cm-more" type="button" style="display:none">Load more comments</button>';
    const list = $("#cm-list", host), compose = $("#cm-compose", host), more = $("#cm-more", host);

    /* ----- sticker picker (shared by the main composer and reply boxes) ----- */
    function pickerHTML() {
      const owned = new Set((AVTV.user && AVTV.user.packs) || []);
      const packs = AVTV.PACK_ORDER;
      return '<div class="sticker-picker"><div class="sp-tabs">' + packs.map((p, i) => '<button type="button" data-pack="' + p + '" class="' + (i === 0 ? "on" : "") + '">' + esc(PACK_NAMES[p]) + (owned.has(p) ? "" : " " + IC.lock.replace("<svg ", '<svg width="11" height="11" ')) + "</button>").join("") +
        '</div><div class="sp-body"></div></div>';
    }
    function fillPicker(picker, pack, onPick) {
      const owned = new Set((AVTV.user && AVTV.user.packs) || []);
      const body = $(".sp-body", picker);
      if (!owned.has(pack)) { body.innerHTML = '<div class="sp-lock">This pack is locked.<br><a class="btn primary sm" style="margin-top:10px" href="shop.html#stickers">Get it in the Void Shop</a></div>'; return; }
      body.innerHTML = '<div class="sp-grid">' + AVTV.STICKER_PACKS[pack].map((id) => '<button type="button" data-code="' + pack + ":" + id + '" aria-label="' + esc(id.replace(/_/g, " ")) + '">' + AVTV.sticker(pack + ":" + id) + "</button>").join("") + "</div>";
      body.onclick = (e) => { const b = e.target.closest("[data-code]"); if (b) { onPick(b.dataset.code); picker.classList.remove("open"); } };
    }
    function wirePicker(wrap, onPick) {
      const btn = $(".st-btn", wrap), picker = $(".sticker-picker", wrap);
      fillPicker(picker, AVTV.PACK_ORDER[0], onPick);
      btn.onclick = (e) => { e.stopPropagation(); picker.classList.toggle("open"); };
      picker.onclick = (e) => {
        e.stopPropagation();
        const t = e.target.closest("[data-pack]"); if (!t) return;
        picker.querySelectorAll(".sp-tabs button").forEach((x) => x.classList.toggle("on", x === t));
        fillPicker(picker, t.dataset.pack, onPick);
      };
    }
    document.addEventListener("click", () => host.querySelectorAll(".sticker-picker.open,.rx-pop.open").forEach((p) => p.classList.remove("open")));

    function renderCompose() {
      const u = AVTV.user;
      if (!u) { compose.innerHTML = '<div class="cm-login">Want to join the conversation? <a id="cm-signin">Sign in</a> or create a profile to comment, react and send stickers.</div>'; $("#cm-signin", host).onclick = () => AVTV.openAuth("login", "Sign in to comment on this anime."); return; }
      st.sticker = null;
      compose.innerHTML = '<div class="cm-compose">' + AVTV.avatarHTML(u.avatar, u.name, 44, u.fx) + '<div class="box"><div class="cm-who">' + AVTV.whoHTML(u) + '</div>' +
        '<textarea id="cm-text" maxlength="1000" placeholder="Share your thoughts\u2026  (no links, please)"></textarea><div id="cm-attached"></div>' +
        '<div class="row"><span class="st-wrap" style="position:relative"><button type="button" class="btn sm ghost st-btn">' + IC.smile + 'Stickers</button>' + pickerHTML() + '</span><span id="cm-left">1000</span><button class="btn primary sm" id="cm-send" type="button">' + IC.send + 'Post</button></div></div></div>';
      const ta = $("#cm-text", host);
      ta.oninput = () => ($("#cm-left", host).textContent = 1000 - ta.value.length);
      wirePicker($(".st-wrap", compose), (code) => { st.sticker = code; attach(); });
      $("#cm-send", host).onclick = () => send(ta, null, $("#cm-send", host), st.sticker);
      function attach() {
        $("#cm-attached", host).innerHTML = st.sticker ? '<div class="attached"><div class="sticker-pic">' + AVTV.sticker(st.sticker) + '</div><button type="button" class="btn sm ghost" id="cm-unattach">' + IC.x + "Remove</button></div>" : "";
        const r = $("#cm-unattach", host); if (r) r.onclick = () => { st.sticker = null; attach(); };
      }
    }

    function reactionsHTML(c) {
      const counts = c.reactions || {};
      const chips = REACTIONS.filter((k) => counts[k]).map((k) => '<button type="button" class="rx-chip' + (c.my_reaction === k ? " on" : "") + '" data-rx="' + k + '" title="' + esc(AVTV.REACTION_LABELS[k]) + '">' + AVTV.reaction(k, 19) + counts[k] + "</button>").join("");
      const pop = '<span class="rx-pop">' + REACTIONS.map((k) => '<button type="button" data-rx="' + k + '" title="' + esc(AVTV.REACTION_LABELS[k]) + '">' + AVTV.reaction(k, 28) + "</button>").join("") + "</span>";
      return '<div class="rx-bar">' + chips + '<span class="rx-add"><button type="button" data-a="rxopen">' + IC.smile + "React</button>" + pop + "</span></div>";
    }

    function cHTML(c, isReply) {
      const u = c.user, cardFx = u.fx && u.fx.card ? " " + AVTV.fxClass(u.fx.card) : "";
      return '<div class="cm cardfx' + cardFx + '" data-id="' + esc(c.id) + '">' + AVTV.avatarHTML(u.avatar, u.name, isReply ? 34 : 44, u.fx) +
        '<div class="cm-body"><div class="cm-meta">' + AVTV.whoHTML(u, true) + (u.rank ? '<span class="rank-pill">' + esc(u.rank) + "</span>" : "") + "<span>@" + esc(u.username) + " \u00b7 " + esc(AVTV.timeAgo(c.created_at)) + "</span></div>" +
        (c.text ? '<div class="cm-text">' + esc(c.text) + "</div>" : "") + (c.sticker ? '<div class="sticker-pic">' + AVTV.sticker(c.sticker) + "</div>" : "") +
        reactionsHTML(c) +
        '<div class="cm-actions"><button type="button" class="cm-btn" data-a="reply">' + IC.reply + "Reply</button>" + (c.mine ? '<button type="button" class="cm-btn" data-a="delete">' + IC.trash + "Delete</button>" : '<button type="button" class="cm-btn" data-a="report">' + IC.flag + "Report</button>") +
        (!isReply && c.reply_count ? '<button type="button" class="cm-btn" data-a="replies">' + IC.down + c.reply_count + (c.reply_count > 1 ? " replies" : " reply") + "</button>" : "") + '</div><div class="reply-box"></div>' +
        (isReply ? "" : '<div class="cm-replies" style="display:none"></div>') + "</div></div>";
    }

    function paint() {
      $("#cm-count", host).textContent = st.total ? "\u00b7 " + st.total.toLocaleString() : "";
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

    async function send(ta, parentId, btn, sticker) {
      const text = ta.value.trim();
      if (!text && !sticker) { AVTV.toast("Write something or pick a sticker.", "err"); return false; }
      btn.disabled = true;
      try {
        const j = await AVTV.api("/comments", { method: "POST", body: { anime_id: Number(animeId), text, parent_id: parentId, sticker: sticker || null } });
        ta.value = "";
        if (j.results.vp_gained) AVTV.toast("Comment posted \u00b7 +" + j.results.vp_gained + " VP", "ok");
        if (parentId) { await showReplies(host.querySelector('.cm[data-id="' + parentId + '"]'), true); }
        else { st.items.unshift(j.results); st.total++; paint(); st.sticker = null; renderCompose(); }
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
      } catch (e) { AVTV.toast("Couldn't load replies.", "err"); }
    }

    async function react(row, key) {
      if (!AVTV.user) return AVTV.openAuth("login", "Sign in to react to comments.");
      const id = row.dataset.id, was = row.querySelector('.rx-chip.on');
      const next = was && was.dataset.rx === key ? null : key;
      try {
        const r = (await AVTV.api("/comments/" + id + "/react", { method: "POST", body: { key: next } })).results;
        const holder = row.querySelector(".rx-bar");
        const tmp = document.createElement("div");
        tmp.innerHTML = reactionsHTML({ reactions: r.reactions, my_reaction: r.my_reaction });
        holder.replaceWith(tmp.firstChild);
      } catch (err) { AVTV.toast(err.message, "err"); }
    }

    host.addEventListener("click", async (e) => {
      const rxb = e.target.closest("[data-rx]");
      if (rxb) { e.stopPropagation(); return react(rxb.closest(".cm"), rxb.dataset.rx); }
      const b = e.target.closest("button[data-a]"); if (!b) return;
      const row = b.closest(".cm"), id = row.dataset.id, a = b.dataset.a;
      if (a === "rxopen") { e.stopPropagation(); const pop = b.parentElement.querySelector(".rx-pop"); const was = pop.classList.contains("open"); host.querySelectorAll(".rx-pop.open").forEach((p) => p.classList.remove("open")); if (!was) pop.classList.add("open"); return; }
      if (a === "replies") return showReplies(row);
      if (!AVTV.user) return AVTV.openAuth("login", "Sign in to join the conversation.");
      if (a === "delete") {
        if (!confirm("Delete this comment?")) return;
        try { await AVTV.api("/comments/" + id, { method: "DELETE" }); AVTV.toast("Comment deleted"); await load(true); } catch (err) { AVTV.toast(err.message, "err"); }
      } else if (a === "report") {
        const reason = prompt("What's wrong with this comment? (optional)"); if (reason === null) return;
        try { await AVTV.api("/report", { method: "POST", body: { type: "comment", target: id, reason: reason.slice(0, 300) } }); AVTV.toast("Thanks, a moderator will take a look.", "ok"); } catch (err) { AVTV.toast(err.message, "err"); }
      } else if (a === "reply") {
        const box = $(".reply-box", row);
        if (box.firstChild) { box.innerHTML = ""; return; }
        let sticker = null;
        box.innerHTML = '<div class="cm-compose" style="margin:10px 0 0"><div class="box"><textarea maxlength="1000" placeholder="Write a reply\u2026"></textarea><div class="att"></div><div class="row"><span class="st-wrap" style="position:relative"><button type="button" class="btn sm ghost st-btn">' + IC.smile + "Sticker</button>" + pickerHTML() + '</span><span></span><button class="btn primary sm send" type="button">Reply</button></div></div></div>';
        const ta = $("textarea", box); ta.focus();
        wirePicker($(".st-wrap", box), (code) => { sticker = code; $(".att", box).innerHTML = '<div class="sticker-pic" style="width:90px;height:90px">' + AVTV.sticker(code) + "</div>"; });
        $(".send", box).onclick = async (ev) => {
          const root = row.closest(".cm-replies") ? row.parentElement.closest(".cm") : row;
          if (await send(ta, root.dataset.id, ev.currentTarget, sticker)) box.innerHTML = "";
        };
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
