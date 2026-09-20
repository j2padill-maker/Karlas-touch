/* ===========================================================
   SHOP-THE-RACK — animated hanging-products component
   - Shop page: hosts [data-rack="costumes"] and [data-rack="designed"]
     read data/products.json; cards wire to global addToCart()/buyNow().
   - Commissions: host [data-rack="portfolio"] with data-items JSON;
     cards scroll to #commission-form; rkFilterPortfolio(tag) filters.
   Standard: up to 4 per rack; every card is one fixed width, so the
   hook seating (set proportionally per render) is pixel-accurate at any size.
   Requires: css/rack.css and images/rack/{rod,hanger-front,hanger-back}.png
   =========================================================== */
(function () {
  const A = { rod: "images/rack/rod.png", hf: "images/rack/hanger-front.png", hb: "images/rack/hanger-back.png" };
  const MAXCOLS = 4;           // never more than 4 items on a rod
  const CARD_CAP = 260;        // max card width (px) so images stay tidy on wide screens
  const cartSvg =
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12.2a1.5 1.5 0 0 0 1.5 1.2h8.2a1.5 1.5 0 0 0 1.5-1.2L22 7H6"/></svg>';

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const gapPx = () => Math.min(20, Math.max(10, Math.round(window.innerWidth * 0.016)));
  const colsForWidth = (w) => (w < 520 ? 2 : w < 900 ? 3 : MAXCOLS);
  function balancedRows(n, mc) {
    const r = Math.max(1, Math.ceil(n / mc)), b = Math.floor(n / r), e = n % r, s = [];
    for (let i = 0; i < r; i++) s.push(b + (i < e ? 1 : 0));
    return s;
  }
  function swayVars(i) {
    const a = (2 + (i % 3) * 0.35).toFixed(2), d = (3.3 + (i % 4) * 0.35).toFixed(2),
      dl = (-(i % 5) * 0.6).toFixed(2), dir = i % 2 ? -1 : 1;
    return `--a:${dir * a}deg;--dur:${d}s;--delay:${dl}s;`;
  }
  // Seat the hook proportionally to the hanger's on-screen width so it never drifts.
  function applySeating(host, cellW) {
    const wh = 0.82 * cellW; // hanger image = 82% of the card cell
    host.style.setProperty("--rk-rod-top", (0.251 * wh).toFixed(1) + "px");
    host.style.setProperty("--rk-rod-h", (0.137 * wh).toFixed(1) + "px");
    host.style.setProperty("--rk-row-top", (0.229 * wh).toFixed(1) + "px");
    host.style.setProperty("--rk-pivot", (0.034 * wh).toFixed(1) + "px");
  }
  function shopCard(p) {
    const ooak = /one of a kind|designed piece/i.test(p.tag || "");
    return `<div class="rk-card">
        ${p.tag ? `<span class="rk-stamp ${ooak ? "rk-ooak" : ""}">${esc(p.tag)}</span>` : ""}
        <span class="rk-frame"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy"></span>
        <div class="rk-cap"><div class="rk-name">${esc(p.name)}</div>
          <div class="rk-price">$${Number(p.price).toFixed(2)}</div>
          <div class="rk-actions">
            <button class="rk-btn rk-btn-add" type="button">${cartSvg} Add</button>
            <button class="rk-btn rk-btn-buy" type="button">Buy now</button>
          </div></div></div>`;
  }
  function portfolioCard(p) {
    return `<button class="rk-card rk-link" type="button">
        ${p.tag ? `<span class="rk-stamp">${esc(p.tag)}</span>` : ""}
        <span class="rk-frame"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy"></span>
        <div class="rk-cap"><div class="rk-name">${esc(p.name)}</div>
          <div class="rk-cta">Commission one like this &rarr;</div></div></button>`;
  }
  function renderRack(host, items, mode) {
    const hostW = host.clientWidth || window.innerWidth;
    const perRow = colsForWidth(hostW);
    const gap = gapPx();
    const cellW = Math.min(CARD_CAP, Math.floor((hostW - (perRow - 1) * gap) / perRow));
    applySeating(host, cellW);
    const rows = balancedRows(items.length, perRow);
    let idx = 0, html = "";
    for (const count of rows) {
      const cols = `repeat(${count}, ${cellW}px)`;
      let tips = "", hangs = "";
      for (let k = 0; k < count; k++) {
        const p = items[idx];
        tips += `<div class="rk-cell"><img class="rk-hookback" src="${A.hb}" alt="" aria-hidden="true"></div>`;
        hangs += `<div class="rk-hang" style="${swayVars(idx)}"><img class="rk-hookfront" src="${A.hf}" alt="" aria-hidden="true">${mode === "shop" ? shopCard(p) : portfolioCard(p)}</div>`;
        idx++;
      }
      html += `<div class="rack"><div class="rk-tips" style="grid-template-columns:${cols};justify-content:center">${tips}</div>` +
        `<div class="rk-rod"></div><div class="rk-hangers" style="grid-template-columns:${cols};justify-content:center">${hangs}</div>` +
        `<div class="rk-rodfront"></div><span class="rk-bracket rk-bracket-l"></span><span class="rk-bracket rk-bracket-r"></span></div>`;
    }
    host.innerHTML = html;
    host.querySelectorAll(".rk-hang").forEach((hang, i) => {
      const p = items[i];
      if (mode === "shop") {
        const add = hang.querySelector(".rk-btn-add"), buy = hang.querySelector(".rk-btn-buy");
        if (add) add.addEventListener("click", () => window.addToCart && window.addToCart(p));
        if (buy) buy.addEventListener("click", (e) => window.buyNow && window.buyNow(p.stripePriceId, e.currentTarget));
      } else {
        const link = hang.querySelector(".rk-link");
        if (link) link.addEventListener("click", () => {
          const f = document.getElementById("commission-form");
          if (f) f.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    });
  }

  let SHOP = null, PORT = null;
  function drawShop() {
    if (!SHOP) return;
    if (SHOP.costHost) renderRack(SHOP.costHost, SHOP.products.filter((p) => p.tag === "Standard Costume"), "shop");
    if (SHOP.desHost) renderRack(SHOP.desHost, SHOP.products.filter((p) => p.tag !== "Standard Costume"), "shop");
  }
  function drawPortfolio() {
    if (!PORT) return;
    const items = PORT.filter === "all" ? PORT.items : PORT.items.filter((p) => p.cat === PORT.filter);
    renderRack(PORT.host, items, "portfolio");
  }
  window.rkFilterPortfolio = function (tag) {
    if (!PORT) return;
    PORT.filter = tag; drawPortfolio();
    document.querySelectorAll("[data-rk-filter]").forEach((b) =>
      b.classList.toggle("active", b.getAttribute("data-rk-filter") === tag));
  };

  async function init() {
    const costHost = document.querySelector('[data-rack="costumes"]');
    const desHost = document.querySelector('[data-rack="designed"]');
    if (costHost || desHost) {
      try {
        const products = await fetch("data/products.json").then((r) => r.json());
        SHOP = { costHost, desHost, products };
        drawShop();
      } catch (e) { console.error("[rack] products load failed", e); }
    }
    const portHost = document.querySelector('[data-rack="portfolio"]');
    if (portHost) {
      let items = [];
      try { items = JSON.parse(portHost.getAttribute("data-items") || "[]"); } catch (e) {}
      PORT = { host: portHost, items, filter: "all" };
      drawPortfolio();
    }
    // Pause the sway animation while a rack is scrolled off-screen. Animated
    // layers that keep repainting are a common cause of janky mobile scrolling;
    // pausing them off-screen keeps scrolling smooth with no visual change.
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => e.target.classList.toggle("rk-paused", !e.isIntersecting));
      }, { rootMargin: "150px 0px" });
      document.querySelectorAll(".rackwrap").forEach((w) => io.observe(w));
    }
  }
  document.addEventListener("DOMContentLoaded", init);
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { drawShop(); drawPortfolio(); }, 160); });
})();
