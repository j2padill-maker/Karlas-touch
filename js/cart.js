/* ===========================================================
   CART — localStorage-backed, multi-item
   =========================================================== */
const CART_KEY = "atelier_cart_v1";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

function addToCart(product, qty = 1) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stripePriceId: product.stripePriceId,
      qty,
    });
  }
  saveCart(cart);
  showToast(`Added "${product.name}" to your cart`);
  openCart();
}

function removeFromCart(id) {
  const cart = getCart().filter((i) => i.id !== id);
  saveCart(cart);
}

function updateQty(id, qty) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, qty);
  saveCart(cart);
}

function cartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

function updateCartCount() {
  const count = getCart().reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = count;
    el.style.display = count > 0 ? "inline-block" : "none";
  });
}

function renderCart() {
  const container = document.querySelector("[data-cart-items]");
  const totalEl = document.querySelector("[data-cart-total]");
  if (!container) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = `<p class="cart-empty">Your cart is empty — browse the shop to add a piece.</p>`;
  } else {
    container.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <div class="name">${item.name}</div>
          <div class="qty-controls">
            <button onclick="updateQty('${item.id}', ${item.qty - 1})">−</button>
            <span>${item.qty}</span>
            <button onclick="updateQty('${item.id}', ${item.qty + 1})">+</button>
          </div>
          <div class="muted">$${(item.price * item.qty).toFixed(2)}</div>
          <span class="remove" onclick="removeFromCart('${item.id}')">Remove</span>
        </div>
      </div>`
      )
      .join("");
  }

  if (totalEl) totalEl.textContent = `$${cartTotal().toFixed(2)}`;
}

function openCart() {
  document.querySelector("[data-cart-drawer]")?.classList.add("open");
  document.querySelector("[data-cart-overlay]")?.classList.add("open");
}
function closeCart() {
  document.querySelector("[data-cart-drawer]")?.classList.remove("open");
  document.querySelector("[data-cart-overlay]")?.classList.remove("open");
}

function showToast(msg) {
  const toast = document.querySelector("[data-toast]");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}

/* ===========================================================
   CHECKOUT — calls Netlify Function, which talks to Stripe
   =========================================================== */
async function startCheckout() {
  const cart = getCart();
  if (cart.length === 0) return;

  const btn = document.querySelector("[data-checkout-btn]");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Redirecting to secure checkout…";
  }

  try {
    const res = await fetch("/.netlify/functions/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((i) => ({ priceId: i.stripePriceId, qty: i.qty })),
      }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error(data.error || "Checkout failed to start");
    }
  } catch (err) {
    showToast("Something went wrong starting checkout. Please try again.");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Checkout";
    }
    console.error(err);
  }
}

/* ===========================================================
   BUY NOW — single-item checkout, bypasses the cart entirely.
   Used on standalone product buttons (alterations, costumes,
   consultation deposit, etc.) where a customer wants to pay
   for just one thing immediately, without going through the
   multi-item cart flow.
   =========================================================== */
async function buyNow(stripePriceId, btn) {
  const originalText = btn ? btn.textContent : "";
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Redirecting to secure checkout…";
  }

  try {
    const res = await fetch("/.netlify/functions/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ priceId: stripePriceId, qty: 1 }],
      }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error(data.error || "Checkout failed to start");
    }
  } catch (err) {
    showToast("Something went wrong starting checkout. Please try again.");
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalText || "Buy Now";
    }
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  updateCartCount();
});
