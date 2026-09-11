// netlify/functions/create-checkout.js
//
// Receives cart items from the browser: [{ priceId, qty }, ...]
// Creates a Stripe Checkout Session server-side (the secret key lives only
// here, as a Netlify environment variable -- never in the repo, never in
// the browser). Returns a URL the browser redirects to for hosted checkout.
//
// Delivery: physical goods get a shipping address + a weight-based flat
// rate, and free local pickup is always offered alongside it. Service-only
// orders (hem, resize, repair, consultation) skip all of that -- there is
// nothing to ship.
//
// NOTE: there is no inventory tracking anywhere in this flow. Two people
// can buy the same one-off piece and both charges will succeed.
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
};

// Flat-rate tiers. Karla's real postage runs about $7-9 for a single
// ~1.4 lb costume, so tier 1 covers postage plus a mailer with a little
// margin. Revisit these once there are real shipments to average.
const SHIPPING_TIERS = [
  { maxOz: 40, cents: 1000, label: "Standard Shipping (USPS)" },
  { maxOz: 72, cents: 1800, label: "Standard Shipping (USPS)" },
  { maxOz: Infinity, cents: 2800, label: "Standard Shipping (USPS)" },
];

function shippingRateFor(totalOz) {
  const tier = SHIPPING_TIERS.find((t) => totalOz <= t.maxOz);
  return {
    shipping_rate_data: {
      type: "fixed_amount",
      fixed_amount: { amount: tier.cents, currency: "usd" },
      display_name: tier.label,
      delivery_estimate: {
        minimum: { unit: "business_day", value: 3 },
        maximum: { unit: "business_day", value: 7 },
      },
    },
  };
}

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

    const siteUrl = process.env.URL || "http://localhost:8888";

    const params = {
      mode: "payment",
      line_items,
      success_url: `${siteUrl}/confirmation.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/shop.html?checkout=cancelled`,
    };

    if (totalOz > 0) {
      // US only for now. Canada is handled by conversation -- customers are
      // pointed at the contact widget to agree a rate directly with Karla.
      params.shipping_address_collection = { allowed_countries: ["US"] };
      params.shipping_options = [shippingRateFor(totalOz), LOCAL_PICKUP];
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
