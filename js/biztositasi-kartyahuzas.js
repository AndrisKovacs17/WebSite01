/* ================================================================
   biztositasi-kartyahuzas.js  –  Biztosítási Kártyahúzás vezérlő
   Keverés → 3 random lap → kártyák + magyarázó csíkok. Frontend-only.
   ================================================================ */
(function () {
  "use strict";

  var CARDS  = window.BK_CARDS || [];
  var STATUS = window.BK_STATUS || { idle: "", shuffling: "", drawn: "" };

  /* visualHint → Font Awesome 5 ikon */
  var ICONS = {
    "document-seal": "fa-file-contract",
    "folder": "fa-folder",
    "coins": "fa-coins",
    "ban": "fa-ban",
    "hourglass": "fa-hourglass-half",
    "scale": "fa-balance-scale",
    "water": "fa-tint",
    "bolt": "fa-bolt",
    "price-tag": "fa-tags",
    "shield": "fa-shield-alt",
    "calendar": "fa-calendar-alt",
    "lamp": "fa-lightbulb",
    "home": "fa-home",
    "warehouse": "fa-warehouse",
    "clipboard": "fa-clipboard-list",
    "receipt": "fa-receipt",
    "rain": "fa-cloud-rain",
    "car-crash": "fa-car-crash",
    "car": "fa-car",
    "id-card": "fa-id-card",
    "warning": "fa-exclamation-triangle",
    "signature": "fa-signature",
    "suitcase": "fa-suitcase",
    "luggage": "fa-suitcase-rolling",
    "ski": "fa-skiing",
    "key": "fa-key",
    "user-shield": "fa-user-shield",
    "laptop": "fa-laptop",
    "gears": "fa-cogs",
    "truck": "fa-truck",
    "compass": "fa-compass",
    "health": "fa-heartbeat",
    "injury": "fa-user-injured",
    "bell": "fa-concierge-bell",
    "helping-hand": "fa-hands-helping",
    "limit": "fa-sliders-h",
    "contract": "fa-file-signature",
    "advisor": "fa-user-tie",
    "folder-open": "fa-folder-open",
    "calm": "fa-mug-hot"
  };
  function iconFor(hint) { return ICONS[hint] || "fa-file-alt"; }

  var SHUFFLE_MS = 1100;

  /* DOM */
  var page, btn, statusEl, deckStage, deck, deckHint, results, cardsEl, explainEl, live;
  var state = "idle";
  var locked = false;

  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function announce(msg) { if (live) live.textContent = msg; }

  function setStatus(key) {
    if (!statusEl) return;
    statusEl.innerHTML = '<span class="bk-status-dot" aria-hidden="true"></span><span>' +
      esc(STATUS[key] || "") + "</span>";
  }

  /* Fisher–Yates keverés, majd az első 3 különböző lap */
  function drawThree() {
    var pool = CARDS.slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    return pool.slice(0, 3);
  }

  function renderCards(drawn) {
    var html = "";
    for (var i = 0; i < drawn.length; i++) {
      var c = drawn[i];
      html +=
        '<article class="bk-card d' + i + '">' +
          '<div class="bk-card-visual">' +
            '<span class="bk-card-cat">' + esc(c.category) + '</span>' +
            '<i class="fa ' + iconFor(c.visualHint) + '" aria-hidden="true"></i>' +
          '</div>' +
          '<div class="bk-card-body">' +
            '<h3 class="bk-card-name">' + esc(c.name) + '</h3>' +
            '<p class="bk-card-sub">' + esc(c.subtitle) + '</p>' +
            '<p class="bk-card-line">„' + esc(c.shortLine) + '”</p>' +
          '</div>' +
        '</article>';
    }
    cardsEl.innerHTML = html;
  }

  function renderExplanations(drawn) {
    var html = "";
    for (var i = 0; i < drawn.length; i++) {
      var c = drawn[i];
      html +=
        '<section class="bk-explain d' + i + '">' +
          '<div class="bk-explain-head">' +
            '<span class="bk-explain-ico"><i class="fa ' + iconFor(c.visualHint) + '" aria-hidden="true"></i></span>' +
            '<div class="bk-explain-titles">' +
              '<h3>' + esc(c.name) + '</h3>' +
              '<span>' + esc(c.category) + '</span>' +
            '</div>' +
          '</div>' +
          '<dl class="bk-explain-grid">' +
            block("fa-comment-dots", "Mit jelent ez a lap?", c.meaning, false) +
            block("fa-exclamation-circle", "Mire figyelj?", c.watchOut, false) +
            block("fa-search", "Mit érdemes most átnézni?", c.reviewNow, false) +
            block("fa-lightbulb", "Biztor-tanulság", c.lesson, true) +
          '</dl>' +
        '</section>';
    }
    explainEl.innerHTML = html;
  }

  function block(icon, title, text, isLesson) {
    return '<div class="bk-explain-block' + (isLesson ? " is-lesson" : "") + '">' +
      '<dt><i class="fa ' + icon + '" aria-hidden="true"></i> ' + esc(title) + '</dt>' +
      '<dd>' + esc(text) + '</dd>' +
    '</div>';
  }

  function startShuffle() {
    if (locked) return;
    locked = true;
    state = "shuffling";
    page.classList.add("is-shuffling");

    // pakli nézet vissza, eredmény elrejtve a keverés idejére
    results.hidden = true;
    deckStage.hidden = false;
    deck.classList.add("is-shuffling");
    if (deckHint) deckHint.textContent = "A lapok keverednek…";

    btn.disabled = true;
    setStatus("shuffling");
    announce("Keverés folyamatban.");

    var wait = reducedMotion() ? 200 : SHUFFLE_MS;
    window.setTimeout(finishDraw, wait);
  }

  function finishDraw() {
    deck.classList.remove("is-shuffling");
    page.classList.remove("is-shuffling");

    var drawn = drawThree();
    renderCards(drawn);
    renderExplanations(drawn);

    deckStage.hidden = true;
    results.hidden = false;

    state = "drawn";
    locked = false;
    btn.disabled = false;
    setStatus("drawn");
    btn.innerHTML = '<i class="fa fa-redo" aria-hidden="true"></i> Új húzás';

    var names = drawn.map(function (c) { return c.name; }).join(", ");
    announce("Három lapot húztál: " + names + ". A magyarázatok a kártyák alatt olvashatók.");

    var firstName = cardsEl.querySelector(".bk-card-name");
    if (firstName && firstName.focus) {
      firstName.setAttribute("tabindex", "-1");
      try { firstName.focus({ preventScroll: true }); } catch (e) { firstName.focus(); }
    }
  }

  function init() {
    page      = document.body;
    btn       = document.getElementById("bkShuffle");
    statusEl  = document.getElementById("bkStatus");
    deckStage = document.getElementById("bkDeckStage");
    deck      = document.getElementById("bkDeck");
    deckHint  = document.getElementById("bkDeckHint");
    results   = document.getElementById("bkResults");
    cardsEl   = document.getElementById("bkCards");
    explainEl = document.getElementById("bkExplain");
    live      = document.getElementById("bkLive");

    if (!btn || !deck || !cardsEl || !explainEl || !CARDS.length) return;

    setStatus("idle");
    btn.addEventListener("click", startShuffle);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
