/* =========================================================================
   Karla's Design & Stitch — floating Contact widget
   Self-contained. Loads on every page via the existing tag before </body>:
       <script src="js/whatsapp.js" defer></script>
   (Filename kept as whatsapp.js on purpose so the HTML pages don't change.)

   Tapping the button opens a small menu: WhatsApp + Email + Call + Text.
   Email / Call / Text need NO app installed — they work on every device.

   >>> SET THESE THREE VALUES, then commit + push <<<
   ========================================================================= */
(function () {
  "use strict";

  var WA_NUMBER     = "16195379944";                    // WhatsApp: digits only, country code first, no + or spaces
  var CONTACT_EMAIL = "Lunita5_@hotmail.com";  // <-- Karla's business email address
  var CONTACT_PHONE = "16195379944";                    // Call / Text number (the Google Voice number works). Digits only.

  var LAUNCHER_COLOR = "#2D7D7D";  // brand teal (--thread). Change to "#25D366" if you want WhatsApp green instead.

  /* ---- page-aware pre-filled message ---------------------------------- */
  function pageIntro() {
    var p = (location.pathname || "").toLowerCase();
    if (p.indexOf("commission") > -1) return "Hi Karla! I'd like to ask about a custom commission —";
    if (p.indexOf("customize")  > -1) return "Hi Karla! I'd like to customize a piece —";
    if (p.indexOf("alteration") > -1) return "Hi Karla! I have an alteration I'd like help with —";
    if (p.indexOf("shop")       > -1) return "Hi Karla! I saw something in your shop and —";
    if (p.indexOf("about")      > -1) return "Hi Karla! I read your About page and —";
    return "Hi Karla! I saw your site and I'd love to ask about —";
  }

  var msg    = pageIntro();
  var encMsg = encodeURIComponent(msg);

  var LINKS = {
    wa:    "https://wa.me/" + WA_NUMBER + "?text=" + encMsg,
    email: "mailto:" + CONTACT_EMAIL +
             "?subject=" + encodeURIComponent("Website inquiry — Karla's Design & Stitch") +
             "&body=" + encMsg,
    call:  "tel:+" + CONTACT_PHONE,
    text:  "sms:+" + CONTACT_PHONE + "?&body=" + encMsg
  };

  /* ---- styles --------------------------------------------------------- */
  var css = ''
    + '.kds-contact{position:fixed;right:20px;bottom:20px;z-index:99999;'
    +   'font-family:"Inter",system-ui,-apple-system,sans-serif;}'
    + '.kds-launcher{display:flex;align-items:center;gap:9px;border:none;cursor:pointer;'
    +   'background:' + LAUNCHER_COLOR + ';color:#fff;font-size:15px;font-weight:600;'
    +   'padding:13px 20px;border-radius:999px;box-shadow:0 6px 20px rgba(0,0,0,.22);'
    +   'transition:transform .15s ease,box-shadow .15s ease;}'
    + '.kds-launcher:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(0,0,0,.28);}'
    + '.kds-launcher svg{width:22px;height:22px;flex:0 0 auto;}'
    + '.kds-menu{position:absolute;right:0;bottom:64px;width:236px;background:#fff;'
    +   'border-radius:16px;padding:8px;box-shadow:0 14px 40px rgba(0,0,0,.22);'
    +   'opacity:0;visibility:hidden;transform:translateY(10px);pointer-events:none;'
    +   'transition:opacity .18s ease,transform .18s ease,visibility .18s;}'
    + '.kds-contact.open .kds-menu{opacity:1;visibility:visible;transform:translateY(0);pointer-events:auto;}'
    + '.kds-title{font-size:12px;font-weight:600;color:#6b7d7d;text-transform:uppercase;'
    +   'letter-spacing:.06em;padding:8px 12px 6px;}'
    + '.kds-item{display:flex;align-items:center;gap:12px;text-decoration:none;'
    +   'padding:11px 12px;border-radius:12px;color:#1F3838;font-size:14.5px;font-weight:500;'
    +   'transition:background .12s ease;}'
    + '.kds-item:hover{background:#F0F7F5;}'
    + '.kds-item small{display:block;font-size:11.5px;font-weight:400;color:#7c8a8a;margin-top:1px;}'
    + '.kds-ic{width:34px;height:34px;border-radius:50%;flex:0 0 auto;display:flex;'
    +   'align-items:center;justify-content:center;}'
    + '.kds-ic svg{width:18px;height:18px;fill:#fff;}'
    + '@media(max-width:600px){'
    +   '.kds-launcher .kds-label{display:none;}'
    +   '.kds-launcher{padding:15px;border-radius:50%;}'
    + '}';

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  /* ---- icons (inline SVG) --------------------------------------------- */
  var IC = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    wa:   '<svg viewBox="0 0 24 24"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1s-.5-.1-.7.2-.8 1-.9 1.2-.3.2-.6.1a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5s0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5H8c-.2 0-.5.1-.7.3a3 3 0 0 0-1 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.6 4c.6.3 1.1.5 1.5.6a3.6 3.6 0 0 0 1.6.1 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.2c0-.2-.2-.2-.5-.4zM12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5z"/></svg>',
    call: '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.2 11 11 0 0 0 3.5.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11 11 0 0 0 .6 3.5 1 1 0 0 1-.2 1z"/></svg>',
    text: '<svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM7 9h10v2H7zm0 4h7v2H7z"/></svg>'
  };

  function item(href, bg, icon, label, sub) {
    return '<a class="kds-item" href="' + href + '">'
      +   '<span class="kds-ic" style="background:' + bg + '">' + icon + '</span>'
      +   '<span>' + label + '<small>' + sub + '</small></span>'
      + '</a>';
  }

  /* ---- build ---------------------------------------------------------- */
  var wrap = document.createElement("div");
  wrap.className = "kds-contact";
  wrap.innerHTML =
      '<div class="kds-menu" role="menu">'
    +   '<div class="kds-title">Chat with us</div>'
    +   item(LINKS.wa,    "#25D366", IC.wa,   "WhatsApp", "Fastest reply")
    +   item(LINKS.email, "#2D7D7D", IC.mail, "Email",    "We\'ll get back to you")
    +   item(LINKS.call,  "#1F3838", IC.call, "Call us",  "Talk to Karla")
    +   item(LINKS.text,  "#8A9B9B", IC.text, "Text us",  "Send a message")
    + '</div>'
    + '<button class="kds-launcher" type="button" aria-label="Contact us" aria-expanded="false">'
    +   IC.chat + '<span class="kds-label">Message us</span>'
    + '</button>';

  document.body.appendChild(wrap);

  var launcher = wrap.querySelector(".kds-launcher");
  launcher.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = wrap.classList.toggle("open");
    launcher.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // close when tapping elsewhere
  document.addEventListener("click", function (e) {
    if (!wrap.contains(e.target)) {
      wrap.classList.remove("open");
      launcher.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      wrap.classList.remove("open");
      launcher.setAttribute("aria-expanded", "false");
    }
  });
})();
