/* ============================================================
   WhatsApp contact button  —  Karla's Design & Stitch
   ------------------------------------------------------------
   Self-contained. Injects a floating "Message us on WhatsApp"
   button on every page it's loaded on. Tapping it opens the
   customer's WhatsApp with a friendly, page-aware message
   already typed in; the customer just hits send.

   >>> TO GO LIVE: replace WA_NUMBER below with Karla's WhatsApp
   >>> Business number — digits only, country code first, NO
   >>> "+", spaces, or dashes.
   >>>   e.g.  US (619) 555-0123   ->   "16195550123"
   >>>         MX (664) 123-4567   ->   "526641234567"

   To remove this feature entirely: delete this file and the
   <script src="js/whatsapp.js"> line at the bottom of each page.
   ============================================================ */
(function KarlaWhatsApp() {
  "use strict";

  // --- CONFIG -------------------------------------------------
  var WA_NUMBER = "16195379944";           // LIVE: Karla's WhatsApp Business number — (619) 537-9944
  var BUTTON_LABEL = "Message us";          // text shown beside the icon on desktop

  // Page-aware opening message. Falls back to DEFAULT for any
  // page not listed. Keep these warm and specific — it's the
  // first thing a customer sends, so it should start the sale.
  var MESSAGES = {
    "commissions": "Hi Karla! I'd love a quote for a custom commission —",
    "alterations": "Hi Karla! I'd like to book an alteration —",
    "customize":   "Hi Karla! I have a piece I'd love to customize —",
    "shop":        "Hi Karla! I have a question about an item in your shop —",
    "about":       "Hi Karla! I found your site and wanted to reach out —",
    "DEFAULT":     "Hi Karla! I saw your site and I'd love to ask about —"
  };
  // ------------------------------------------------------------

  // Guard: never inject twice (some pages load main.js more than once)
  if (document.getElementById("wa-float")) return;

  // Pick the message for this page based on the filename
  function pickMessage() {
    var file = (location.pathname.split("/").pop() || "index.html")
      .replace(".html", "").toLowerCase();
    return MESSAGES[file] || MESSAGES.DEFAULT;
  }

  var href = "https://wa.me/" + WA_NUMBER +
             "?text=" + encodeURIComponent(pickMessage());

  // --- Styles (scoped to #wa-float, safe to delete) -----------
  var css = ''
    + '#wa-float{position:fixed;right:20px;bottom:20px;z-index:940;'
    +   'display:inline-flex;align-items:center;gap:10px;'
    +   'background:#25D366;color:#fff;text-decoration:none;'
    +   'padding:13px 18px;border-radius:50px;'
    +   'font-family:"Inter",-apple-system,sans-serif;font-weight:600;'
    +   'font-size:0.95rem;line-height:1;'
    +   'box-shadow:0 6px 20px rgba(37,211,102,0.35),0 2px 6px rgba(31,56,56,0.2);'
    +   'transition:transform .18s ease,box-shadow .18s ease;'
    +   'opacity:0;transform:translateY(12px);}'
    + '#wa-float.wa-in{opacity:1;transform:translateY(0);}'
    + '#wa-float:hover{transform:translateY(-2px);text-decoration:none;'
    +   'box-shadow:0 10px 26px rgba(37,211,102,0.45),0 3px 8px rgba(31,56,56,0.25);}'
    + '#wa-float:focus-visible{outline:3px solid #1F3838;outline-offset:3px;}'
    + '#wa-float svg{width:26px;height:26px;flex:0 0 auto;display:block;}'
    + '#wa-float .wa-label{white-space:nowrap;}'
    /* On phones: show just the round icon to stay out of the way */
    + '@media (max-width:600px){'
    +   '#wa-float{padding:0;width:56px;height:56px;justify-content:center;right:16px;bottom:16px;}'
    +   '#wa-float .wa-label{display:none;}'
    + '}'
    + '@media (prefers-reduced-motion:reduce){'
    +   '#wa-float{transition:none;opacity:1;transform:none;}'
    + '}';

  var style = document.createElement("style");
  style.id = "wa-float-style";
  style.textContent = css;
  document.head.appendChild(style);

  // --- Button -------------------------------------------------
  var a = document.createElement("a");
  a.id = "wa-float";
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener";
  a.setAttribute("aria-label", "Message Karla on WhatsApp");
  a.innerHTML =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15' +
    '-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475' +
    '-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52' +
    '.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207' +
    '-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372' +
    '-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487' +
    '.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413' +
    '.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0' +
    '1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436' +
    '-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 ' +
    '9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.945c0 2.096' +
    '.549 4.14 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.71 1.454h.006c6.585 0 11.946-5.359 ' +
    '11.949-11.945a11.821 11.821 0 00-3.487-8.464z"/></svg>' +
    '<span class="wa-label">' + BUTTON_LABEL + '</span>';

  function mount() {
    document.body.appendChild(a);
    // gentle entrance once it's on the page
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { a.classList.add("wa-in"); });
    });
    if (WA_NUMBER === "15550000000") {
      console.info("[WhatsApp] Using PLACEHOLDER number — set WA_NUMBER in js/whatsapp.js to go live.");
    }
  }

  if (document.body) {
    mount();
  } else {
    document.addEventListener("DOMContentLoaded", mount);
  }
})();
