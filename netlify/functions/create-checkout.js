// netlify/functions/create-checkout.js
//
// Receives cart items from the browser: [{ priceId, qty }, ...]
// Creates a Stripe Checkout Session server-side (the secret key lives only
// here, as a Netlify environment variable -- never in the repo, never in
// the browser). Returns a URL the browser redirects to for hosted checkout.
//
// Delivery: physical goods get a shipping address and a flat $5 shipping
// rate, upgraded to FREE when the order subtotal is $75 or more. Free local
// pickup is always offered alongside. Service-only orders (hem, resize,
// repair, consultation) skip all of that -- there is nothing to ship.
//
// The subtotal is computed from Stripe Price amounts (retrieved server-side),
// never from the client, so a customer cannot tamper with the cart to unlock
// free shipping.
//
// NOTE: there is no inventory tracking anywhere in this flow. Two people
// can buy the same one-off piece and both charges will succeed.
//
// TODO (tail-risk cap): free shipping is NOT weight-capped yet. A large,
// heavy, cross-country order over $75 ships free and can cost far more than
// the margin on that order. Add a weight cap using totalOz here once real
// per-item weights are confirmed with Karla.
const Stripe = require("stripe");

// Shipping weight in ounces, keyed by live Stripe Price ID.
// A price ID that is not listed here is treated as a service (no shipping).
// Add a line here whenever a new PHYSICAL product is added to
// data/products.json, and keep the weightOz values in the two files in sync.
const SHIP_WEIGHT_OZ = {
  price_1UEJ7fEVUqiTP8VuM1tf9sw3: 23, // Ninja Turtle Costume
  price_1UEEc0EVUqiTP8VurUShiFlS: 23, // Turtle Shell Costume
  price_1UEEokEVUqiTP8VugLTdZNmg: 23, // Roblox/Minecraft Costume
  price_1UEEcWEVUqiTP8VuEmFhKsa3: 32, // Fridah Khalo Jacket
  price_1UGkjdEVUqiTP8Vu9d3yEvL7: 10, // Custom Photo Pillow — Standard
  price_1UGkkgEVUqiTP8Vuij9kMwc1: 24, // Custom Photo Pillow — Large
  price_1UGkejEVUqiTP8VuC18X92SN: 23, // Bendy Costume
  price_1UGkdxEVUqiTP8VuN9VvP1Rr: 16, // Joy Costume
  price_1UGkZSEVUqiTP8VuKijqHx6o: 32, // Denim Jacket with Crochet Sleeves
};

// Flat $5 shipping, upgraded to free at or above a $75 subtotal.
const FLAT_SHIPPING_CENTS = 500;
const FREE_SHIPPING_THRESHOLD_CENTS = 7500;

const STANDARD_SHIPPING = {
  shipping_rate_data: {
    type: "fixed_amount",
    fixed_amount: { amount: FLAT_SHIPPING_CENTS, currency: "usd" },
    display_name: "Standard Shipping (USPS)",
    delivery_estimate: {
      minimum: { unit: "business_day", value: 3 },
      maximum: { unit: "business_day", value: 7 },
    },
  },
};

const FREE_SHIPPING = {
  shipping_rate_data: {
    type: "fixed_amount",
    fixed_amount: { amount: 0, currency: "usd" },
    display_name: "Free Shipping (USPS)",
    delivery_estimate: {
      minimum: { unit: "business_day", value: 3 },
      maximum: { unit: "business_day", value: 7 },
    },
  },
};

const LOCAL_PICKUP = {
  shipping_rate_data: {
    type: "fixed_amount",
    fixed_amount: { amount: 0, currency: "usd" },
    display_name: "Local pickup — San Diego / Tijuana (free)",
    delivery_estimate: {
      minimum: { unit: "business_day", value: 2 },
      maximum: { unit: "business_day", value: 7 },
    },
  },
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const { items } = JSON.parse(event.body);

    if (!Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "Cart is empty" }) };
    }

    // IMPORTANT: amounts come from Stripe Price IDs, never from the client,
    // so a customer can't tamper with prices in dev tools.
    const line_items = items.map((item) => ({
      price: item.priceId,
      quantity: item.qty,
    }));

    // Total shippable weight. Services contribute nothing.
    const totalOz = items.reduce((sum, item) => {
      const oz = SHIP_WEIGHT_OZ[item.priceId] || 0;
      return sum + oz * (Number(item.qty) || 1);
    }, 0);

    // Order subtotal, computed from Stripe Price amounts (never the client),
    // to decide whether free shipping applies. Each unique price is fetched
    // once and reused.
    const priceCache = {};
    let subtotalCents = 0;
    for (const item of items) {
      if (!priceCache[item.priceId]) {
        priceCache[item.priceId] = await stripe.prices.retrieve(item.priceId);
      }
      const unit = priceCache[item.priceId].unit_amount || 0;
      subtotalCents += unit * (Number(item.qty) || 1);
    }

    // product vs service decides what the confirmation page shows.
    const orderKind = totalOz > 0 ? "product" : "service";

    const siteUrl = process.env.URL || "http://localhost:8888";

    const params = {
      mode: "payment",
      line_items,
      success_url: `${siteUrl}/confirmation.html?session_id={CHECKOUT_SESSION_ID}&kind=${orderKind}`,
      cancel_url: `${siteUrl}/shop.html?checkout=cancelled`,
    };

    if (totalOz > 0) {
      // US only for now. Canada is handled by conversation -- customers are
      // pointed at the contact widget to agree a rate directly with Karla.
      params.shipping_address_collection = { allowed_countries: ["US"] };
      const shipRate =
        subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
          ? FREE_SHIPPING
          : STANDARD_SHIPPING;
      params.shipping_options = [shipRate, LOCAL_PICKUP];
      // Stripe Tax needs an address, so it is only enabled on these sessions.
      // With no tax registration configured it simply calculates $0.
      params.automatic_tax = { enabled: true };
    }

    const session = await stripe.checkout.sessions.create(params);

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
