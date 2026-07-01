/* ===========================================================
   GSAP — entrance + scroll-triggered animation, used sitewide
   =========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  if (window.gsap) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance
    gsap.from(".hero-eyebrow, .hero h1, .hero p.lede, .hero-actions", {
      y: 18,
      opacity: 0,
      duration: 0.7,
      ease: "power2.out",
      stagger: 0.12,
    });

    // Stitched underline "sews" itself in under the hero headline
    const stitchPath = document.querySelector(".stitch-underline path");
    if (stitchPath) {
      const len = stitchPath.getTotalLength();
      gsap.set(stitchPath, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(stitchPath, {
        strokeDashoffset: 0,
        duration: 1,
        delay: 0.5,
        ease: "power1.inOut",
      });
    }

    // Scroll-reveal for cards/sections
    gsap.utils.toArray(".reveal").forEach((el) => {
      gsap.from(el, {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
    });

    gsap.utils.toArray(".reveal-stagger").forEach((group) => {
      gsap.from(group.children, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: group, start: "top 88%" },
      });
    });
  }

  // Mobile nav toggle
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navLinks = document.querySelector(".nav-links");
  navToggle?.addEventListener("click", () => navLinks.classList.toggle("open"));

  // Cart drawer wiring
  document.querySelector("[data-cart-open]")?.addEventListener("click", openCart);
  document.querySelector("[data-cart-close]")?.addEventListener("click", closeCart);
  document.querySelector("[data-cart-overlay]")?.addEventListener("click", closeCart);
  document.querySelector("[data-checkout-btn]")?.addEventListener("click", startCheckout);
});

/* ===========================================================
   SHOP — render products from data/products.json
   Products are split into two grids based on their tag:
     "Standard Costume"          → data-shop-grid-costumes
     "Designed Piece — One of a Kind" → data-shop-grid-designed
   Adding a new product to either section requires only a new
   entry in data/products.json with the correct tag — no HTML
   changes needed.
   =========================================================== */
function productCardHTML(p) {
  return `
    <div class="card reveal">
      <img src="${p.image}" alt="${p.name}" loading="lazy">
      <div class="card-body">
        <span class="tag">${p.tag}</span>
        <h4>${p.name}</h4>
        <p class="muted" style="font-size:0.88rem;">${p.description}</p>
        <div class="price">$${p.price.toFixed(2)}</div>
        <button class="btn btn-primary" style="margin-top:10px; width:100%;"
          onclick='addToCart(${JSON.stringify(p)})'>
          Add to cart
        </button>
        <button class="btn btn-secondary" style="margin-top:6px; width:100%;"
          onclick='buyNow("${p.stripePriceId}", this)'>
          Buy Now
        </button>
      </div>
    </div>`;
}

async function renderShop() {
  const costumeGrid  = document.querySelector("[data-shop-grid-costumes]");
  const designedGrid = document.querySelector("[data-shop-grid-designed]");
  if (!costumeGrid && !designedGrid) return;

  const res = await fetch("data/products.json");
  const products = await res.json();

  const costumes  = products.filter(p => p.tag === "Standard Costume");
  const designed  = products.filter(p => p.tag !== "Standard Costume");

  if (costumeGrid)  costumeGrid.innerHTML  = costumes.map(productCardHTML).join("");
  if (designedGrid) designedGrid.innerHTML = designed.map(productCardHTML).join("");

  if (window.ScrollTrigger) ScrollTrigger.refresh();
}

document.addEventListener("DOMContentLoaded", renderShop);

/* ===========================================================
   PORTFOLIO — simple tag filter (commissions page)
   =========================================================== */
function filterPortfolio(tag) {
  document.querySelectorAll("[data-portfolio-item]").forEach((item) => {
    const show = tag === "all" || item.dataset.portfolioItem === tag;
    item.style.display = show ? "" : "none";
  });
  document.querySelectorAll("[data-filter-btn]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filterBtn === tag);
  });
}
