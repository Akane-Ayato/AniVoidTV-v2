/* shop.html: Void Shop (buy + equip with Void Points) */
(function () {
  "use strict";
  const esc = AVTV.esc, IC = AVTV.icons, $ = (s, r) => (r || document).querySelector(s);
  const root = $("#shop-root");
  const TABS = [["frame", "Avatar effects", "user"], ["name", "Name effects", "edit"], ["banner", "Banners", "image"], ["card", "Card styles", "palette"], ["title", "Titles", "tag"], ["stickers", "Sticker packs", "smile"]];
  const RARITY_ORDER = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
  let tab = (location.hash || "#frame").slice(1); if (!TABS.some((t) => t[0] === tab)) tab = "frame";
  let data = null, rarity = "all", onlyMine = false;
  const fail = (e) => AVTV.toast(e.message || "Something went wrong", "err");

  async function load() {
    try {
      data = (await AVTV.api("/shop")).results;
      AVTV.user = (await AVTV.api("/me")).results;
    } catch (e) { data = null; }
    render();
  }

  function render() {
    const u = AVTV.user;
    if (!u || !data) {
      root.innerHTML = '<div class="box soon-box">' + AVTV.liquid("bag", "violet", 64) + '<h3>Open the Void Shop</h3><p>Sign in to spend your Void Points on 100+ avatar effects, name styles, banners, card styles, titles and sticker packs.</p><div class="row-btns" style="justify-content:center;margin-top:18px"><button class="btn primary" id="shop-signin" type="button">Sign in / Register</button></div></div>';
      const b = $("#shop-signin"); if (b) b.onclick = () => AVTV.openAuth("login", "Sign in to use the Void Shop.");
      return;
    }
    const kind = tab === "stickers" ? "pack" : tab;
    let items = data.items.filter((i) => i.kind === kind);
    if (rarity !== "all") items = items.filter((i) => i.rarity === rarity);
    if (onlyMine) items = items.filter((i) => i.owned);
    items.sort((a, b) => (a.price - b.price) || (RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]) || a.name.localeCompare(b.name));
    const eq = data.equipped || {};
    const view = Object.assign({}, u, { equipped: eq });

    root.innerHTML =
      '<div class="shop-head"><div><h1>Void Shop</h1><p>Spend Void Points on looks no one else has. Earn VP by watching, commenting and checking in daily.</p></div>' +
      '<div class="vp-pill">' + AVTV.liquid("gem", "iris", 40) + "<div>" + data.vp.toLocaleString() + "<small>VOID POINTS \u00b7 " + esc(data.rank_names[data.rank]) + "</small></div></div></div>" +
      '<nav class="pf-tabs" aria-label="Shop sections">' + TABS.map(([k, n, ic]) => '<a href="#' + k + '" class="' + (k === tab ? "on" : "") + '">' + IC[ic] + n + "</a>").join("") + "</nav>" +
      '<div class="shop-tools"><div class="chips" style="margin:0" id="rar">' + ["all", "common", "uncommon", "rare", "epic", "legendary"].map((r) => '<button type="button" data-r="' + r + '" class="' + (rarity === r ? "on" : "") + '">' + (r === "all" ? "All" : r[0].toUpperCase() + r.slice(1)) + "</button>").join("") + '</div><label class="switch"><input type="checkbox" id="mine"' + (onlyMine ? " checked" : "") + "> Owned only</label></div>" +
      '<div class="shop-grid">' + (items.map((i) => itemHTML(i, view, u, eq)).join("") || '<p class="empty-note">Nothing matches these filters.</p>') + "</div>";
  }

  function itemHTML(i, view, u, eq) {
    const isEq = !i.id.startsWith("pack.") && eq[i.kind] === i.id;
    let action;
    if (i.owned) {
      action = i.id.startsWith("pack.") ? '<div class="owned">' + (i.free ? "Included" : "Owned") + " \u2713</div>" : '<button class="btn sm' + (isEq ? "" : " primary") + '" type="button" data-equip="' + esc(i.id) + '" data-kind="' + i.kind + '">' + (isEq ? "Unequip" : "Equip") + "</button>";
    } else if (!i.rank_ok) {
      action = '<button class="btn sm" type="button" disabled>' + IC.lock.replace("<svg ", '<svg width="14" height="14" ') + " Rank: " + esc(i.unlock_rank) + "</button>";
    } else {
      const short = data.vp < i.price;
      action = '<button class="btn sm primary" type="button" data-buy="' + esc(i.id) + '"' + (short ? " disabled" : "") + '><span class="price"><i></i>' + i.price.toLocaleString() + "</span>" + (short ? " \u00b7 need " + (i.price - data.vp).toLocaleString() : " \u00b7 Buy") + "</button>";
    }
    const note = i.free && !i.owned ? "free at " + i.unlock_rank : i.free ? "free unlock" : i.rarity;
    return '<div class="item">' + '<div class="pv-wrap">' + PF.previewHTML(i, view) + "</div><b>" + esc(i.name) + '</b><div class="rline"><span class="rar ' + esc(i.rarity) + '"></span>' + esc(note) + "</div>" + action + "</div>";
  }

  root.addEventListener("click", async (e) => {
    const r = e.target.closest("[data-r]"); if (r) { rarity = r.dataset.r; return render(); }
    const buy = e.target.closest("[data-buy]");
    if (buy) {
      const it = data.items.find((x) => x.id === buy.dataset.buy);
      if (!confirm("Buy " + it.name + " for " + it.price.toLocaleString() + " VP?")) return;
      buy.disabled = true;
      try { await AVTV.api("/shop/buy", { method: "POST", body: { item: it.id } }); AVTV.toast("Unlocked " + it.name, "ok"); await load(); } catch (err) { fail(err); buy.disabled = false; }
      return;
    }
    const eqb = e.target.closest("[data-equip]");
    if (eqb) {
      const kind = eqb.dataset.kind, on = (data.equipped || {})[kind] === eqb.dataset.equip;
      try { await AVTV.api("/shop/equip", { method: "POST", body: { slot: kind, item: on ? null : eqb.dataset.equip } }); AVTV.toast(on ? "Unequipped" : "Equipped", "ok"); await load(); } catch (err) { fail(err); }
    }
  });
  root.addEventListener("change", (e) => { if (e.target.id === "mine") { onlyMine = e.target.checked; render(); } });
  window.addEventListener("hashchange", () => { const t = (location.hash || "#frame").slice(1); if (TABS.some((x) => x[0] === t)) { tab = t; render(); } });
  document.addEventListener("avtv:user", load);
  AVTV.ready ? AVTV.ready.then(load) : load();
})();
