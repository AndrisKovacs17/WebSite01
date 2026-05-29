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
  var ORDINAL = ["Első", "Második", "Harmadik", "Negyedik", "Ötödik"];

  /* DOM */
  var page, btn, statusEl, deckStage, deck, deckHint, results, cardsEl, live;
  var state = "idle";
  var locked = false;

  /* Kihúzott lapok + felfordítási állapot */
  var drawn = [];
  var flipped = null; /* Set, init()-ben jön létre */

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

  /* ── KÁRTYÁK KIOSZTÁSA (lefelé fordítva) ─────────────────── */
  function renderCards(cards) {
    var html = "";
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var ord = ORDINAL[i] || (i + 1) + ".";
      html +=
        '<div class="bk-draw d' + i + '">' +
          '<div class="bk-flip" role="button" tabindex="0" aria-pressed="false"' +
            ' data-idx="' + i + '"' +
            ' aria-label="' + esc(ord) + ' kihúzott lap felfordítása">' +
            '<div class="bk-flip-inner">' +
              /* HÁTLAP */
              '<div class="bk-flip-face bk-flip-back">' +
                '<div class="bk-back-art" aria-hidden="true">' +
                  '<span class="bk-back-pattern"></span>' +
                  '<span class="bk-back-logo"><i class="fa fa-shield-alt"></i></span>' +
                  '<span class="bk-back-label">Biztosítási lap</span>' +
                  '<span class="bk-back-hint"><i class="fa fa-hand-pointer"></i> Kattints a felfordításhoz</span>' +
                '</div>' +
              '</div>' +
              /* ELŐLAP */
              '<div class="bk-flip-face bk-flip-front" aria-hidden="true">' +
                '<div class="bk-card-visual">' +
                  '<span class="bk-card-cat">' + esc(c.category) + '</span>' +
                  '<i class="fa ' + iconFor(c.visualHint) + '" aria-hidden="true"></i>' +
                '</div>' +
                '<div class="bk-card-body">' +
                  '<h3 class="bk-card-name">' + esc(c.name) + '</h3>' +
                  '<p class="bk-card-sub">' + esc(c.subtitle) + '</p>' +
                  '<p class="bk-card-line">„' + esc(c.shortLine) + '”</p>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          /* SAJÁT MAGYARÁZÓ BLOKK (a kártya alatt, felfordításig üres) */
          '<div class="bk-explain-slot" data-idx="' + i + '"></div>' +
        '</div>';
    }
    cardsEl.innerHTML = html;
    bindFlips();
  }

  /* ── EGY LAP SAJÁT MAGYARÁZATA ───────────────────────────── */
  function explanationHTML(c) {
    return '' +
      '<section class="bk-explain" role="region" aria-label="' + esc(c.name) + ' – magyarázat">' +
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

  function block(icon, title, text, isLesson) {
    return '<div class="bk-explain-block' + (isLesson ? " is-lesson" : "") + '">' +
      '<dt><i class="fa ' + icon + '" aria-hidden="true"></i> ' + esc(title) + '</dt>' +
      '<dd>' + esc(text) + '</dd>' +
    '</div>';
  }

  /* ── FELFORDÍTÁS ─────────────────────────────────────────── */
  function bindFlips() {
    var flips = cardsEl.querySelectorAll(".bk-flip");
    Array.prototype.forEach.call(flips, function (el) {
      el.addEventListener("click", function () { flipCard(el); });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          flipCard(el);
        }
      });
    });
  }

  function flipCard(el) {
    var idx = parseInt(el.getAttribute("data-idx"), 10);
    if (isNaN(idx) || flipped.has(idx) || !drawn[idx]) return; /* már fel van fordítva */
    flipped.add(idx);

    var c = drawn[idx];
    var ord = ORDINAL[idx] || (idx + 1) + ".";
    el.classList.add("is-flipped");
    el.setAttribute("aria-pressed", "true");
    el.setAttribute("aria-label", ord + " kihúzott lap felfordítva: " + c.name);
    var front = el.querySelector(".bk-flip-front");
    if (front) front.removeAttribute("aria-hidden");

    var slot = cardsEl.querySelector('.bk-explain-slot[data-idx="' + idx + '"]');
    if (slot && !slot.innerHTML) slot.innerHTML = explanationHTML(c);

    announce("A(z) " + c.name + " lap felfordítva, a magyarázat megjelent.");
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

    drawn = drawThree();
    flipped.clear();           /* állapot nullázás minden húzásnál */
    renderCards(drawn);

    deckStage.hidden = true;
    results.hidden = false;

    state = "drawn";
    locked = false;
    btn.disabled = false;
    setStatus("drawn");
    btn.innerHTML = '<i class="fa fa-redo" aria-hidden="true"></i> Új húzás';

    announce("Három lapot húztál, mindegyik lefelé fordítva. Fordítsd fel a lapokat egyenként a magyarázatért.");

    var firstFlip = cardsEl.querySelector(".bk-flip");
    if (firstFlip && firstFlip.focus) {
      try { firstFlip.focus({ preventScroll: true }); } catch (e) { firstFlip.focus(); }
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
    live      = document.getElementById("bkLive");
    flipped   = (typeof Set === "function") ? new Set() : null;

    if (!btn || !deck || !cardsEl || !flipped || !CARDS.length) return;

    setStatus("idle");
    btn.addEventListener("click", startShuffle);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
