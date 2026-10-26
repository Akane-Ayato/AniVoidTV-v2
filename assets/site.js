/* ============================================================
   AniVoid TV: shared site layer
   auth popup · profile menu · avatars · continue-watching store · footer · toast
   Every page loads:  nav.js (drawer)  then  site.js
   ============================================================ */
(function () {
  "use strict";
  const API = "/api/v1";
  const AVTV = (window.AVTV = window.AVTV || {});

  /* ---------- helpers ---------- */
  AVTV.esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const esc = AVTV.esc;
  const $ = (sel, root) => (root || document).querySelector(sel);

  AVTV.api = async function (path, opts) {
    opts = opts || {};
    const res = await fetch(API + path, {
      method: opts.method || "GET",
      credentials: "same-origin",
      headers: Object.assign({ Accept: "application/json", "X-AVTV": "1" }, opts.raw ? { "Content-Type": "application/octet-stream" } : opts.body ? { "Content-Type": "application/json" } : {}),
      body: opts.raw ? opts.raw : opts.body ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    });
    let json = null;
    try { json = await res.json(); } catch (e) { /* non-json */ }
    if (!res.ok || (json && json.success === false)) {
      const err = new Error((json && json.message) || "Request failed (" + res.status + ")");
      err.status = res.status; err.data = json;
      throw err;
    }
    return json;
  };

  AVTV.toast = function (msg, kind) {
    let wrap = $(".toast-wrap");
    if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; document.body.appendChild(wrap); }
    const t = document.createElement("div");
    t.className = "toast " + (kind || "");
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => { t.style.transition = "opacity .3s"; t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 3200);
  };

  const IC = AVTV.icons; // defined by assets/icons.js (loaded before this file)

  AVTV.STATUS = [["watching", "Watching"], ["completed", "Completed"], ["on_hold", "On-Hold"], ["dropped", "Dropped"], ["plan_to_watch", "Plan to Watch"]];
  AVTV.timeAgo = function (iso) {
    const s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
    if (s < 60) return "just now";
    const t = [[31536000, "year"], [2592000, "month"], [86400, "day"], [3600, "hour"], [60, "minute"]];
    for (const [n, w] of t) if (s >= n) { const v = Math.floor(s / n); return v + " " + w + (v > 1 ? "s" : "") + " ago"; }
    return "just now";
  };

  /* ---------- avatars ---------- */
  const fxClass = (id) => (id ? " fx-" + String(id).replace(".", "-").replace(/[^a-z0-9_-]/gi, "") : "");
  AVTV.fxClass = fxClass;
  AVTV.mediaUrl = (id) => API + "/media/" + encodeURIComponent(id);
  /* av: {bg, icon, pic}; fx (optional): {frame}. pic = uploaded picture id, icon = glyph key or "initial" */
  AVTV.avatarHTML = function (av, name, size, fx) {
    av = av || {};
    let inner;
    if (av.pic) inner = '<img src="' + AVTV.mediaUrl(av.pic) + '" alt="" loading="lazy" decoding="async">';
    else if (av.icon && av.icon !== "initial" && AVTV.hasIcon(av.icon)) inner = AVTV.glyph(av.icon);
    else inner = esc((name || "?").charAt(0).toUpperCase());
    return '<span class="av' + fxClass(fx && fx.frame) + '" style="--s:' + (size || 40) + 'px"><span class="av-ring"></span><span class="av-ring2"></span>' +
           '<span class="av-in bg' + (Number(av.bg) || 0) + '">' + inner + "</span></span>";
  };
  AVTV.nameHTML = function (name, fx) {
    return '<span class="nm' + fxClass(fx && fx.name) + '" data-text="' + esc(name) + '">' + esc(name) + "</span>";
  };
  AVTV.titleHTML = function (t) {
    if (!t) return "";
    return '<span class="ttl r-' + esc(t.rarity) + (t.color != null ? " tc" + Number(t.color) : "") + '">' + esc(t.name) + "</span>";
  };
  /* name + title for any user object that has {name, username, fx} */
  AVTV.whoHTML = (u, link) => '<span class="who">' + (link ? '<a class="nm-link" href="user.html?u=' + encodeURIComponent(u.username) + '">' : "") + AVTV.nameHTML(u.name || u.username, u.fx) + (link ? "</a>" : "") + AVTV.titleHTML(u.fx && u.fx.title) + "</span>";

  /* ---------- continue watching store (guest: localStorage, account: synced) ---------- */
  const CW_KEY = "avtv_cw", CW_OWNER = "avtv_cw_owner";
  const cw = (AVTV.cw = {
    list() { try { return JSON.parse(localStorage.getItem(CW_KEY) || "[]"); } catch (e) { return []; } },
    _save(arr) { try { localStorage.setItem(CW_KEY, JSON.stringify(arr.slice(0, 30))); } catch (e) { /* storage full */ } },
    get(id) { return this.list().find((x) => x.anime_id === Number(id)) || null; },
    upsert(item) {
      item = Object.assign({ audio: "sub" }, item, { anime_id: Number(item.anime_id), updated_at: Date.now() });
      this._save([item].concat(this.list().filter((x) => x.anime_id !== item.anime_id)));
      if (AVTV.user) AVTV.api("/continue/" + item.anime_id, { method: "PUT", body: { title: item.title, poster: item.poster, episode: item.episode, audio: item.audio } }).catch(() => {});
    },
    remove(id) {
      id = Number(id);
      this._save(this.list().filter((x) => x.anime_id !== id));
      if (AVTV.user) return AVTV.api("/continue/" + id, { method: "DELETE" }).catch(() => {});
    },
    clear() { this._save([]); if (AVTV.user) return AVTV.api("/continue", { method: "DELETE" }).catch(() => {}); },
    async sync() {
      if (!AVTV.user) return this.list();
      const mine = String(AVTV.user.id);
      const owner = localStorage.getItem(CW_OWNER);
      try {
        const j = owner === mine ? await AVTV.api("/continue")
          : await AVTV.api("/continue/merge", { method: "POST", body: { items: owner === "guest" || !owner ? this.list() : [] } });
        this._save(j.results.map((r) => Object.assign({}, r, { updated_at: Date.parse(r.updated_at) || Date.now() })));
        localStorage.setItem(CW_OWNER, mine);
      } catch (e) { /* offline: keep local */ }
      return this.list();
    },
    cardHTML(it, opts) {
      opts = opts || {};
      return '<div class="cw-card" data-id="' + it.anime_id + '">' +
        '<a class="cw-link" href="watch.html?id=' + it.anime_id + "&ep=" + (it.episode || 1) + '">' +
        '<img src="' + esc(it.poster) + '" alt="" loading="lazy"><span class="cw-ep">EP ' + (it.episode || 1) + " · " + esc((it.audio || "sub").toUpperCase()) + '</span>' +
        '<span class="cw-play"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg></span></a>' +
        '<button class="cw-x" title="Remove from Continue Watching" aria-label="Remove ' + esc(it.title) + '" data-remove="' + it.anime_id + '">' + IC.x + '</button>' +
        '<a class="cw-title" href="details.html?id=' + it.anime_id + '">' + esc(it.title) + "</a></div>";
    },
  });

  /* ---------- watch tracking (used by watch.html) ---------- */
  let watchTimer = null;
  AVTV.trackWatch = function (anime, episode, audio) {
    if (!anime || !anime.id) return;
    cw.upsert({ anime_id: anime.id, title: anime.title || "", poster: anime.poster || "", episode: episode, audio: audio });
    clearTimeout(watchTimer);
    watchTimer = setTimeout(() => AVTV.markWatched(anime.id, episode), 90000); // stayed 90s => counts as watched
  };
  AVTV.markWatched = async function (animeId, episode) {
    clearTimeout(watchTimer);
    if (!AVTV.user) return;
    try {
      const j = await AVTV.api("/watch/complete", { method: "POST", body: { anime_id: Number(animeId), episode: Number(episode) } });
      if (j.results.counted && j.results.vp_gained) AVTV.toast("+" + j.results.vp_gained + " VP · episode counted", "ok");
    } catch (e) { /* ignore */ }
  };

  /* ---------- account state ---------- */
  AVTV.user = null;
  let cfgPromise = null;
  const getConfig = () => (cfgPromise = cfgPromise || AVTV.api("/config").then((j) => j.results).catch(() => ({ accounts: false })));
  const authedCbs = [];

  AVTV.requireAuth = function (reason, cb) {
    if (AVTV.user) { if (cb) cb(); return true; }
    if (cb) authedCbs.push(cb);
    openAuth("login", reason);
    return false;
  };

  function onAuthed(user) {
    AVTV.user = user;
    closeAuth();
    renderSlot();
    AVTV.toast("Welcome, " + user.username + "!", "ok");
    cw.sync().finally(() => {
      document.dispatchEvent(new CustomEvent("avtv:user", { detail: AVTV.user }));
      authedCbs.splice(0).forEach((f) => { try { f(); } catch (e) { /* ignore */ } });
    });
  }

  async function loadUser() {
    try { AVTV.user = (await AVTV.api("/me")).results; } catch (e) { AVTV.user = null; }
    renderSlot();
    if (AVTV.user) await cw.sync(); else if (localStorage.getItem(CW_OWNER) && localStorage.getItem(CW_OWNER) !== "guest") { cw._save([]); localStorage.setItem(CW_OWNER, "guest"); }
    else localStorage.setItem(CW_OWNER, "guest");
    document.dispatchEvent(new CustomEvent("avtv:user", { detail: AVTV.user }));
  }
  AVTV.ready = null;

  /* ---------- nav slot (sign-in button / avatar + dropdown) ---------- */
  function ensureSlot() {
    let slot = $("#nav-slot");
    if (!slot) {
      const right = $(".nav-right");
      if (!right) return null;
      slot = document.createElement("div");
      slot.id = "nav-slot";
      right.insertBefore(slot, right.firstChild);
    }
    slot.classList.add("nav-slot");
    return slot;
  }

  function renderSlot() {
    const slot = ensureSlot();
    if (!slot) return;
    const u = AVTV.user;
    if (!u) {
      slot.innerHTML = '<button class="signin-btn" id="signin-btn" type="button">Sign in ' + IC.arrow + "</button>";
      $("#signin-btn").onclick = () => openAuth("login");
      return;
    }
    const nm = esc(u.username);
    slot.innerHTML =
      '<button class="avatar-btn" id="avatar-btn" aria-label="Account menu" aria-haspopup="true">' + AVTV.avatarHTML(u.avatar, u.username, 38, u.fx) + "</button>" +
      '<div class="profile-menu" id="profile-menu" role="menu">' +
      '<div class="pm-head">' + AVTV.avatarHTML(u.avatar, u.username, 42, u.fx) + "<div><b>" + esc(u.name) + "</b><small>@" + nm + " · " + esc(u.rank.title) + " · " + u.vp.toLocaleString() + " VP</small></div></div>" +
      '<a class="pm-link" href="profile.html#overview">' + IC.user + "Profile</a>" +
      '<a class="pm-link" href="user.html?u=' + encodeURIComponent(u.username) + '">' + IC.eye + "Public profile</a>" +
      '<a class="pm-link" href="profile.html#friends">' + IC.users + 'Friends<span class="soon">soon</span></a>' +
      '<a class="pm-link" href="profile.html#continue">' + IC.clock + "Continue Watching</a>" +
      '<a class="pm-link" href="profile.html#list">' + IC.bookmark + "Watch List</a>" +
      '<a class="pm-link" href="profile.html#notifications">' + IC.bell + 'Notification<span class="soon">soon</span></a>' +
      '<a class="pm-link" href="shop.html">' + IC.bag + "Void Shop</a>" +
      '<a class="pm-link" href="profile.html#settings">' + IC.cog + "Settings</a>" +
      '<button class="pm-link out" id="logout-btn" type="button">' + IC.out + "Logout</button></div>";
    const btn = $("#avatar-btn"), menu = $("#profile-menu");
    btn.onclick = (e) => { e.stopPropagation(); menu.classList.toggle("open"); };
    $("#logout-btn").onclick = async () => {
      try { await AVTV.api("/auth/logout", { method: "POST" }); } catch (e) { /* ignore */ }
      localStorage.removeItem(CW_KEY); localStorage.setItem(CW_OWNER, "guest");
      location.href = "home.html";
    };
  }
  document.addEventListener("click", (e) => {
    const m = $("#profile-menu");
    if (m && m.classList.contains("open") && !m.contains(e.target)) m.classList.remove("open");
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { const m = $("#profile-menu"); if (m) m.classList.remove("open"); closeAuth(); } });

  /* ---------- auth popup ---------- */
  let modal = null, mode = "login", gTicket = null, gReady = false;
  const F = {}; // form refs

  function field(icon, html) { return '<div class="field' + (html.indexOf('type="password"') > -1 ? " pw" : "") + '">' + icon + html + "</div>"; }
  function captchaBlock(k) {
    return '<div class="captcha-row"><div class="cap-img"><img alt="Captcha" data-cap-img="' + k + '" draggable="false"></div>' +
      '<button type="button" class="refresh" data-cap-refresh="' + k + '" aria-label="New captcha">' + IC.refresh + "</button></div>" +
      field(IC.lock, '<input data-cap-input="' + k + '" type="text" placeholder="Enter the captcha" autocomplete="off" maxlength="8" autocapitalize="characters" spellcheck="false">');
  }
  const eyeBtn = '<button class="eye" type="button" data-eye aria-label="Show password">' + IC.eye + "</button>";

  function buildModal() {
    if (modal) return;
    const petals = Array.from({ length: 9 }, (_, i) => '<span class="petal" style="left:' + (i * 11 + 4) + "%;animation-duration:" + (7 + (i % 4) * 2) + "s;animation-delay:-" + i * 1.3 + 's"></span>').join("");
    modal = document.createElement("div");
    modal.className = "auth-overlay";
    modal.innerHTML =
      '<div class="auth-modal" role="dialog" aria-modal="true" aria-label="Sign in">' +
      '<button class="auth-x" type="button" aria-label="Close">×</button>' +
      '<aside class="auth-art">' + petals + '<img src="assets/logo.jpg" alt=""><h3>Anivoid<span>TV</span></h3>' +
      "<p>Your profile unlocks the full experience.</p><ul><li>" + AVTV.liquid("chat", "rose", 26) + "Comment, react &amp; send stickers</li><li>" + AVTV.liquid("books", "violet", 26) + "Build your watch list</li><li>" + AVTV.liquid("clock", "aqua", 26) + "Continue watching anywhere</li><li>" + AVTV.liquid("sparkle", "amber", 26) + "Earn VP and unlock 100+ effects</li></ul></aside>" +
      '<div class="auth-body">' +
      '<div class="auth-notice" id="auth-notice"></div>' +
      // login
      '<form id="form-login" novalidate><h2>Login</h2><p class="sub">Welcome back!</p>' +
      field(IC.user, '<input name="username" type="text" placeholder="Username or email" autocomplete="username" maxlength="64">') +
      field(IC.lock, '<input name="password" type="password" placeholder="Password" autocomplete="current-password" maxlength="64">' + eyeBtn) +
      captchaBlock("login") + '<div class="auth-msg" data-msg></div><button class="btn primary" type="submit">Login</button>' +
      '<div class="g-block"><div class="auth-or">or</div><div class="g-slot" data-g></div></div>' +
      '<p class="auth-switch">Don\'t have an account? <a data-switch="register">Register</a></p></form>' +
      // register
      '<form id="form-register" novalidate style="display:none"><h2>Register</h2><p class="sub">Create a profile to use the full range of features.</p>' +
      field(IC.user, '<input name="username" type="text" placeholder="Username" autocomplete="username" maxlength="20">') +
      '<p class="hint">3-20 characters: letters, numbers and underscore.</p>' +
      field(IC.lock, '<input name="password" type="password" placeholder="Password" autocomplete="new-password" maxlength="64">' + eyeBtn) +
      field(IC.lock, '<input name="confirm" type="password" placeholder="Confirm password" autocomplete="new-password" maxlength="64">' + eyeBtn) +
      '<p class="hint">8+ characters. Letters, numbers and symbols are all fine.</p>' +
      captchaBlock("register") + '<div class="auth-msg" data-msg></div><button class="btn primary" type="submit">Register</button>' +
      '<div class="g-block"><div class="auth-or">or sign up faster</div><div class="g-slot" data-g></div></div>' +
      '<p class="auth-switch">Already have an account? <a data-switch="login">Sign in</a></p></form>' +
      // google: choose username
      '<form id="form-username" novalidate style="display:none"><h2>Almost there</h2><p class="sub" id="g-email">Pick a username for your new profile.</p>' +
      field(IC.user, '<input name="username" type="text" placeholder="Choose a username" autocomplete="username" maxlength="20">') +
      '<p class="hint">3-20 characters: letters, numbers and underscore.</p><div class="auth-msg" data-msg></div><button class="btn primary" type="submit">Create profile</button></form>' +
      "</div></div>";
    document.body.appendChild(modal);
    ["login", "register", "username"].forEach((k) => (F[k] = $("#form-" + k, modal)));

    $(".auth-x", modal).onclick = closeAuth;
    modal.addEventListener("mousedown", (e) => { if (e.target === modal) closeAuth(); });
    modal.addEventListener("click", (e) => {
      const sw = e.target.closest("[data-switch]");
      if (sw) setMode(sw.dataset.switch);
      const rf = e.target.closest("[data-cap-refresh]");
      if (rf) loadCaptcha(rf.dataset.capRefresh);
      const ey = e.target.closest("[data-eye]");
      if (ey) { const inp = ey.parentElement.querySelector("input"); inp.type = inp.type === "password" ? "text" : "password"; }
    });
    F.login.addEventListener("submit", (e) => { e.preventDefault(); submitLogin(); });
    F.register.addEventListener("submit", (e) => { e.preventDefault(); submitRegister(); });
    F.username.addEventListener("submit", (e) => { e.preventDefault(); submitGoogleUsername(); });
  }

  function msg(form, text, ok) { const m = $("[data-msg]", F[form]); m.textContent = text || ""; m.className = "auth-msg" + (ok ? " ok" : ""); }
  function busy(form, on) { const b = $('button[type="submit"]', F[form]); b.disabled = on; }

  async function loadCaptcha(k) {
    const img = $('[data-cap-img="' + k + '"]', modal), inp = $('[data-cap-input="' + k + '"]', modal);
    inp.value = ""; img.removeAttribute("src");
    try { const j = await AVTV.api("/auth/captcha"); F[k].dataset.token = j.results.token; img.src = j.results.image; }
    catch (e) { msg(k, e.status === 503 ? "Accounts aren't enabled on this server yet." : "Couldn't load the captcha. Tap refresh."); }
  }

  function setMode(m) {
    mode = m;
    Object.keys(F).forEach((k) => (F[k].style.display = k === m ? "" : "none"));
    ["login", "register", "username"].forEach((k) => F[k] && msg(k, ""));
    if (m !== "username") loadCaptcha(m);
    setTimeout(() => { const i = F[m].querySelector("input"); if (i) i.focus(); }, 60);
  }

  async function openAuth(m, reason) {
    buildModal();
    const n = $("#auth-notice", modal);
    n.style.display = reason ? "block" : "none"; n.textContent = reason || "";
    const cfg = await getConfig();
    if (!cfg.accounts) { AVTV.toast("Accounts are not enabled on this server yet.", "err"); return; }
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    setMode(m || "login");
    initGoogle(cfg);
  }
  AVTV.openAuth = openAuth;

  function closeAuth() {
    if (!modal) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
    authedCbs.length = 0;
  }

  const USER_RE = /^[A-Za-z0-9_]{3,20}$/;
  const val = (form, name) => { const el = form.querySelector('[name="' + name + '"]'); return el ? el.value : ""; };
  async function submitLogin() {
    const f = F.login, u = val(f, "username").trim(), p = val(f, "password"), a = $('[data-cap-input="login"]', f).value.trim();
    if (!u || !p) return msg("login", "Enter your username and password.");
    if (!a) return msg("login", "Enter the captcha.");
    busy("login", true); msg("login", "");
    try {
      const j = await AVTV.api("/auth/login", { method: "POST", body: { username: u, password: p, captcha_token: f.dataset.token, captcha_answer: a } });
      onAuthed(j.results);
    } catch (e) { msg("login", e.message); loadCaptcha("login"); }
    finally { busy("login", false); }
  }

  async function submitRegister() {
    const f = F.register, u = val(f, "username").trim(), p = val(f, "password"), c = val(f, "confirm"), a = $('[data-cap-input="register"]', f).value.trim();
    if (!USER_RE.test(u)) return msg("register", "Username: 3-20 characters, letters, numbers and underscore only.");
    if (!/^[\x21-\x7E]{8,64}$/.test(p)) return msg("register", "Password must be 8-64 characters, no spaces.");
    if (p !== c) return msg("register", "Passwords don't match.");
    if (!a) return msg("register", "Enter the captcha.");
    busy("register", true); msg("register", "");
    try {
      const j = await AVTV.api("/auth/register", { method: "POST", body: { username: u, password: p, confirm: c, captcha_token: f.dataset.token, captcha_answer: a } });
      onAuthed(j.results);
    } catch (e) { msg("register", e.message); loadCaptcha("register"); }
    finally { busy("register", false); }
  }

  async function submitGoogleUsername() {
    const u = val(F.username, "username").trim();
    if (!USER_RE.test(u)) return msg("username", "Username: 3-20 characters, letters, numbers and underscore only.");
    busy("username", true);
    try { onAuthed((await AVTV.api("/auth/google/complete", { method: "POST", body: { ticket: gTicket, username: u } })).results); }
    catch (e) { msg("username", e.message); }
    finally { busy("username", false); }
  }

  function initGoogle(cfg) {
    const blocks = modal.querySelectorAll(".g-block");
    if (!cfg.google_client_id) { blocks.forEach((b) => (b.style.display = "none")); return; }
    const draw = () => modal.querySelectorAll("[data-g]").forEach((el) => {
      if (el.dataset.drawn) return; el.dataset.drawn = "1";
      window.google.accounts.id.renderButton(el, { theme: "filled_black", size: "large", text: "continue_with", shape: "pill", width: Math.min(300, el.clientWidth || 300) });
    });
    if (gReady) return draw();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client"; s.async = true;
    s.onload = () => {
      window.google.accounts.id.initialize({ client_id: cfg.google_client_id, callback: onGoogle, auto_select: false });
      gReady = true; draw();
    };
    s.onerror = () => blocks.forEach((b) => (b.style.display = "none"));
    document.head.appendChild(s);
  }

  async function onGoogle(resp) {
    try {
      const j = await AVTV.api("/auth/google", { method: "POST", body: { credential: resp.credential } });
      if (j.results.status === "ok") return onAuthed(j.results.user);
      gTicket = j.results.ticket;
      $("#g-email", modal).textContent = "Signed in with " + j.results.email + ". Pick a username for your new profile.";
      setMode("username");
    } catch (e) { AVTV.toast(e.message, "err"); }
  }

  /* ---------- footer ---------- */
  function mountFooter() {
    if ($(".site-footer")) return;
    const f = document.createElement("footer");
    f.className = "site-footer";
    f.innerHTML =
      '<div class="sf-inner"><div class="sf-brand"><a class="logo" href="home.html"><img class="logo-mark" src="assets/logo.jpg" alt=""><div class="logo-word">Anivoid<span>TV</span></div></a>' +
      "<p>Watch ongoing and completed anime for free with English subtitles or dubbed audio. New episodes land daily.</p>" +
      '<a class="sf-join" data-telegram-link href="#" target="_blank" rel="noopener">' + IC.tg + "Join our Telegram</a></div>" +
      '<div class="sf-col"><h4>Browse</h4><a href="home.html">Home</a><a href="recent.html">Recent</a><a href="aired.html">Finished Anime</a><a href="upcoming.html">Upcoming</a><a href="search.html">Search</a></div>' +
      '<div class="sf-col"><h4>Help</h4><a data-telegram-link href="#" target="_blank" rel="noopener">Telegram</a><a data-contact-link href="#" target="_blank" rel="noopener">Contact</a><a href="index.html">Watch by ID</a></div></div>' +
      '<div class="sf-bottom">© AnivoidTV · All rights reserved.<br>This site does not store any files on its server. All contents are provided by non-affiliated third parties.</div>';
    const host = $("#site-footer");
    if (host) host.replaceWith(f); else document.body.appendChild(f);
    if (window.AVTV_fillLinks) window.AVTV_fillLinks();
  }

  /* ---------- boot ---------- */
  function boot() {
    AVTV.mountDefs();
    mountFooter();
    ensureSlot();
    renderSlot();
    AVTV.ready = loadUser();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
