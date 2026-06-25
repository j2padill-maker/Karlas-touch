# Atelier — Site Setup Guide

Placeholder name throughout — rename once you and Karla pick a real business name
(search/replace "Atelier" in the HTML files, and rename the repo + domain to match).

## What's in here

- Static multi-page site: `index.html`, `shop.html`, `commissions.html`, `alterations.html`, `about.html`
- `css/styles.css` — design system (warm/handmade palette, stitched/skeuomorphic accents)
- `js/cart.js` — multi-item cart, stored in the browser via localStorage
- `js/main.js` — GSAP animations, shop rendering, portfolio filtering
- `data/products.json` — your ready-to-ship costume listings (edit name/price/image/description here)
- `netlify/functions/create-checkout.js` — serverless function that creates a Stripe Checkout Session (keeps your Stripe secret key safe, off the browser)
- `netlify.toml` — tells Netlify where the functions live

## One-time setup, in order

### 1. Push to GitHub
Same as you've always done — create a repo, commit, push.

### 2. Connect Netlify to the repo
On netlify.com: "Add new site" → "Import an existing project" → pick this GitHub repo.
Leave build command blank (no build step needed), publish directory `.`.

### 3. Create a Stripe account
At stripe.com. Free to create; Stripe only takes a cut (2.9% + 30¢) per transaction, no monthly fee.

### 4. Add your products in Stripe
For each costume in `data/products.json`:
- Stripe Dashboard → Products → Add Product
- Set a price (this creates a **Price ID**, looks like `price_1AbC...`)
- Turn on inventory/quantity limits if you want Stripe to auto-stop sales when stock hits 0
  (Stripe Dashboard → that Product → enable "Limit quantity")
- Copy the Price ID into the matching product in `data/products.json` under `"stripePriceId"`

### 5. Add your Stripe secret key to Netlify (never to GitHub)
Netlify Dashboard → Site settings → Environment variables → Add variable:
- Key: `STRIPE_SECRET_KEY`
- Value: your secret key from Stripe Dashboard → Developers → API keys (starts with `sk_`)

This key is only ever read by `create-checkout.js`, running on Netlify's servers. It is
never included in anything sent to a visitor's browser.

### 6. Point your Namecheap domain at Netlify
Netlify Dashboard → Domain settings → Add custom domain → follow the exact DNS records
Netlify shows you, add them in Namecheap's DNS panel. SSL certificate is automatic.

### 7. Turn on Netlify Forms
No setup needed beyond what's already in `commissions.html` and `alterations.html`
(the `data-netlify="true"` attribute). Submissions show up in Netlify Dashboard → Forms.
You can add an email notification there (Forms → Settings → add a notification) so
Karla gets emailed the moment someone submits a request.

## Before going live

- [ ] Replace all images in `images/products/` and `images/portfolio/` with real photos
- [ ] Replace placeholder copy in `about.html` with Karla's real bio
- [ ] Replace "Atelier" placeholder name everywhere once a real name is chosen
- [ ] Test a full purchase using Stripe's test mode (test card: 4242 4242 4242 4242)
- [ ] Switch Stripe from test keys to live keys in Netlify env vars once ready for real sales
