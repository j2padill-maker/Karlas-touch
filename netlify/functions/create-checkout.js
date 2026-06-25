// netlify/functions/create-checkout.js
//
// Receives cart items from the browser: [{ priceId, qty }, ...]
// Creates a Stripe Checkout Session server-side (secret key lives only here,
// as a Netlify environment variable — never in the repo, never in the browser).
// Returns a URL the browser redirects to for secure, hosted checkout.
//
// Stripe handles inventory limits per-Price if you set "limit quantity" /
// inventory tracking on the Product in the Stripe dashboard.

const Stripe = require("stripe");

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

    // IMPORTANT: prices come from Stripe Price IDs, never from the client.
    // This prevents a customer from tampering with prices in dev tools.
    const line_items = items.map((item) => ({
      price: item.priceId,
      quantity: item.qty,
    }));

    const siteUrl = process.env.URL || "http://localhost:8888";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${siteUrl}/shop.html?checkout=success`,
      cancel_url: `${siteUrl}/shop.html?checkout=cancelled`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
