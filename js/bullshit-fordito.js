/* =========================================================
   Bullshit Fordító — kereső + UI vezérlő
   Adat: window.BF_GLOSSARY  (js/bullshit-fordito-glossary.js)
   Publikus API: window.BF { normalize, searchGlossary, categoryIcon }
   ========================================================= */
(function () {
  "use strict";

  /* ── Kategória → Font Awesome ikon ────────────────────── */
  var CATEGORY_ICON = {
    "Általános":            "fa-file-contract",
    "Gépjármű":             "fa-car",
    "Lakás":                "fa-home",
    "Életbiztosítás":       "fa-heart",
    "Baleset és egészség":  "fa-heartbeat",
    "Utasbiztosítás":       "fa-plane",
    "Vállalati":            "fa-building",
    "Felelősség":           "fa-balance-scale",
    "Kárügyintézés":        "fa-tools",
    "Díj és szerződés":     "fa-file-invoice-dollar",
    "Mezőgazdaság":         "fa-seedling",
    "Pénzügyi":             "fa-coins"
  };
  function categoryIcon(cat) { return CATEGORY_ICON[cat] || "fa-file-alt"; }

  /* ── Normalizálás: kisbetű, ékezet le, szóköz össze ───── */
  function normalize(str) {
    return (str || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /* ── Pontozó: kisebb = jobb találat ───────────────────── */
  function scoreEntry(entry, nq) {
    var nt = normalize(entry.term);
    if (nt === nq) return 1;
    var aliases = entry.aliases || [];
    var i;
    for (i = 0; i < aliases.length; i++) {
      if (normalize(aliases[i]) === nq) return 2;
    }
    if (nt.indexOf(nq) === 0) return 3;
    for (i = 0; i < aliases.length; i++) {
      if (normalize(aliases[i]).indexOf(nq) === 0) return 4;
    }
    if (nt.indexOf(nq) !== -1) return 5;
    for (i = 0; i < aliases.length; i++) {
      if (normalize(aliases[i]).indexOf(nq) !== -1) return 6;
    }
    /* szó-szintű: minden beírt szó szerepel a termben/aliasban */
    var words = nq.split(" ").filter(Boolean);
    if (words.length > 0) {
      var allInTerm = words.every(function (w) { return nt.indexOf(w) !== -1; });
      if (allInTerm) return 7;
      for (i = 0; i < aliases.length; i++) {
        var na = normalize(aliases[i]);
        if (words.every(function (w) { return na.indexOf(w) !== -1; })) return 7;
      }
      /* a beírt szöveg valamely szava szerepel a termben (gyenge) */
      var anyWordHit = words.some(function (w) { return w.length >= 3 && nt.indexOf(w) !== -1; });
      if (anyWordHit) return 8;
    }
    return 0;
  }

  /**
   * @param {string} query
   * @returns {{status:'empty'|'found'|'not-found', result:object|null, suggestions:object[]}}
   */
  function searchGlossary(query) {
    var glossary = window.BF_GLOSSARY || [];
    var nq = normalize(query);
    if (!nq) return { status: "empty", result: null, suggestions: [] };

    var scored = [];
    for (var i = 0; i < glossary.length; i++) {
      var s = scoreEntry(glossary[i], nq);
      if (s > 0) scored.push({ entry: glossary[i], score: s });
    }
    if (scored.length === 0) {
      return { status: "not-found", result: null, suggestions: [] };
    }
    scored.sort(function (a, b) { return a.score - b.score; });

    var best = scored[0];
    /* erős egyezés → közvetlen találat */
    if (best.score <= 3 && (scored.length === 1 || scored[1].score > best.score)) {
      return { status: "found", result: best.entry, suggestions: [] };
    }
    if (best.score <= 2) {
      return { status: "found", result: best.entry, suggestions: [] };
    }
    /* több / gyengébb egyezés → javaslatok */
    var seen = {};
    var suggestions = [];
    for (var j = 0; j < scored.length && suggestions.length < 6; j++) {
      var id = scored[j].entry.id || scored[j].entry.term;
      if (!seen[id]) { seen[id] = true; suggestions.push(scored[j].entry); }
    }
    /* ha egyetlen erős starts-with találat van, mutassuk eredményként */
    if (best.score <= 4 && suggestions.length === 1) {
      return { status: "found", result: best.entry, suggestions: [] };
    }
    return { status: "not-found", result: null, suggestions: suggestions };
  }

  window.BF = { normalize: normalize, searchGlossary: searchGlossary, categoryIcon: categoryIcon };

  /* ════════════════════ UI VEZÉRLŐ ════════════════════ */
  function initController() {
    var machine    = document.getElementById("bfMachine");
    if (!machine) return; /* nem a fordító oldal */

    var inputEl    = document.getElementById("bfInput");
    var btn        = document.getElementById("bfBtn");
    var errorEl    = document.getElementById("bfError");
    var tokenText  = document.getElementById("bfTokenText");
    var resultCard = document.getElementById("bfResultCard");
    var noMatch    = document.getElementById("bfNoMatch");
    var steps      = Array.prototype.slice.call(machine.querySelectorAll(".translator-step"));

    var termsGrid  = document.getElementById("bfTermsGrid");
    var glossSearch= document.getElementById("bfGlossarySearch");
    var glossCount = document.getElementById("bfGlossaryCount");
    var catTabs    = Array.prototype.slice.call(document.querySelectorAll(".bf-cat-tab"));

    var prefersReduced = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var processing = false;
    var activeCat = "mind";

    function esc(str) {
      return String(str == null ? "" : str)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function clearStates() {
      machine.classList.remove("is-processing", "has-result", "no-result");
      steps.forEach(function (s) { s.classList.remove("active", "done"); });
    }

    function showError(msg) {
      errorEl.innerHTML = '<i class="fa fa-info-circle"></i> ' + esc(msg);
      errorEl.classList.add("visible");
    }
    function hideError() {
      errorEl.classList.remove("visible");
      errorEl.innerHTML = "";
    }

    /* ── Fordítás futtatása ─────────────────────────────── */
    function runTranslation(query) {
      query = (query || "").trim();
      hideError();
      if (!query) {
        showError("Írj be egy kifejezést, amit lefordíthatunk.");
        inputEl.focus();
        return;
      }
      if (query.length > 120) {
        showError("Kicsit rövidebb kifejezést adj meg.");
        return;
      }
      if (processing) return;
      processing = true;

      clearStates();
      tokenText.textContent = query;
      machine.classList.add("is-processing");
      btn.setAttribute("aria-busy", "true");

      var stepDelay = prefersReduced ? 80 : 340;

      function activate(i) {
        if (steps[i]) steps[i].classList.add("active");
      }
      function complete(i) {
        if (steps[i]) { steps[i].classList.remove("active"); steps[i].classList.add("done"); }
      }

      activate(0);
      setTimeout(function () { complete(0); activate(1); }, stepDelay);
      setTimeout(function () { complete(1); activate(2); }, stepDelay * 2);
      setTimeout(function () {
        complete(2);
        finish(query);
      }, stepDelay * 3);
    }

    function finish(query) {
      machine.classList.remove("is-processing");
      btn.removeAttribute("aria-busy");
      processing = false;

      var res = searchGlossary(query);
      if (res.status === "found" && res.result) {
        renderResult(res.result);
        machine.classList.add("has-result");
        scrollIntoView(resultCard);
      } else {
        renderNoMatch(query, res.suggestions || []);
        machine.classList.add("no-result");
        scrollIntoView(noMatch);
      }
    }

    function scrollIntoView(el) {
      if (el && el.scrollIntoView) {
        el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "nearest" });
      }
    }

    /* ── Eredménykártya renderelés ──────────────────────── */
    function section(icoClass, labelClass, faIcon, label, text) {
      if (!text) return "";
      return '<div class="bf-result-section">'
        + '<span class="bf-result-ico ' + icoClass + '" aria-hidden="true"><i class="fa ' + faIcon + '"></i></span>'
        + '<div><div class="bf-result-label ' + labelClass + '">' + esc(label) + '</div>'
        + '<div class="bf-result-text">' + esc(text) + '</div></div></div>';
    }

    function renderResult(entry) {
      var relHtml = "";
      if (entry.relatedTerms && entry.relatedTerms.length) {
        relHtml = '<div class="bf-related"><div class="bf-related-label">Kapcsolódó fogalmak</div>'
          + '<div class="bf-related-chips">';
        entry.relatedTerms.forEach(function (rt) {
          relHtml += '<button type="button" class="bf-related-chip" data-term="' + esc(rt) + '">'
            + '<i class="fa fa-link bf-rel-ico" aria-hidden="true"></i>' + esc(rt) + '</button>';
        });
        relHtml += '</div></div>';
      }

      var body = "";
      body += section("", "", "fa-comment-dots", "Mit jelent?", entry.plainExplanation);
      body += section("", "", "fa-bullseye", "Miért fontos?", entry.whyItMatters);
      body += section("", "", "fa-search", "Mire figyelj?", entry.whatToCheck);
      body += section("warn", "warn", "fa-exclamation-triangle", "Gyakori félreértés", entry.commonMisunderstanding);
      body += section("", "", "fa-lightbulb", "Példa", entry.example);

      resultCard.innerHTML =
        '<div class="bf-result-header">'
        + '<span class="bf-result-head-ico" aria-hidden="true"><i class="fa ' + categoryIcon(entry.category) + '"></i></span>'
        + '<div><div class="bf-result-term">' + esc(entry.term) + '</div>'
        + (entry.shortDefinition ? '<div class="bf-result-short">' + esc(entry.shortDefinition) + '</div>' : '')
        + '</div>'
        + '<span class="bf-result-cat-badge">' + esc(entry.category) + '</span>'
        + '</div>'
        + '<div class="bf-result-body">' + body + '</div>'
        + relHtml
        + '<div class="bf-result-cta">'
        + '<div class="bf-result-cta-hint">' + esc(entry.ctaHint || "Ha kérdése van egy fogalomról, szívesen segítünk.") + '</div>'
        + '<a href="/kapcsolat" class="bf-cta-primary"><i class="fa fa-file-alt" aria-hidden="true"></i> Átnézetem</a>'
        + '<a href="tel:+36706258201" class="bf-cta-outline phone-link"><i class="fa fa-phone-alt" aria-hidden="true"></i> Visszahívást kérek</a>'
        + '</div>';

      wireRelated();
    }

    function wireRelated() {
      resultCard.querySelectorAll(".bf-related-chip").forEach(function (chip) {
        chip.addEventListener("click", function () {
          var t = chip.getAttribute("data-term");
          if (t) { inputEl.value = t; runTranslation(t); }
        });
      });
    }

    /* ── Nincs találat renderelés ───────────────────────── */
    function renderNoMatch(query, suggestions) {
      var html = '<div class="bf-nomatch-title"><i class="fa fa-search" aria-hidden="true"></i> Ezt a kifejezést még nem találtuk meg pontosan</div>';
      if (suggestions.length) {
        html += '<div class="bf-nomatch-body">A „' + esc(query) + '" kifejezésre nincs pontos egyezés. Lehet, hogy ezek valamelyikére gondoltál:</div>';
        html += '<div class="bf-suggestions">';
        suggestions.forEach(function (s) {
          html += '<button type="button" class="bf-suggestion-btn" data-term="' + esc(s.term) + '">'
            + '<i class="fa ' + categoryIcon(s.category) + ' bf-sug-ico" aria-hidden="true"></i>' + esc(s.term) + '</button>';
        });
        html += '</div>';
      } else {
        html += '<div class="bf-nomatch-body">A „' + esc(query) + '" kifejezést egyelőre nem ismerjük. Írd le nekünk, és segítünk értelmezni.</div>';
        html += '<div class="bf-suggestions">'
          + '<a href="/kapcsolat" class="bf-suggestion-btn"><i class="fa fa-comment-dots bf-sug-ico" aria-hidden="true"></i> Kapcsolat</a>'
          + '<a href="tel:+36706258201" class="bf-suggestion-btn phone-link"><i class="fa fa-phone-alt bf-sug-ico" aria-hidden="true"></i> Visszahívást kérek</a>'
          + '</div>';
      }
      noMatch.innerHTML = html;

      noMatch.querySelectorAll(".bf-suggestion-btn[data-term]").forEach(function (b) {
        b.addEventListener("click", function () {
          var t = b.getAttribute("data-term");
          if (t) { inputEl.value = t; runTranslation(t); }
        });
      });
    }

    /* ── Fogalomtár böngésző ────────────────────────────── */
    function renderGrid() {
      if (!termsGrid) return;
      var glossary = window.BF_GLOSSARY || [];
      var q = glossSearch ? normalize(glossSearch.value) : "";

      var list = glossary.filter(function (e) {
        if (activeCat !== "mind" && e.category !== activeCat) return false;
        if (!q) return true;
        if (normalize(e.term).indexOf(q) !== -1) return true;
        if (normalize(e.shortDefinition || "").indexOf(q) !== -1) return true;
        return (e.aliases || []).some(function (a) { return normalize(a).indexOf(q) !== -1; });
      });

      termsGrid.innerHTML = "";
      if (!list.length) {
        termsGrid.innerHTML = '<div class="bf-glossary-empty">Nincs találat erre a szűrésre. Próbálj másik kategóriát vagy kifejezést.</div>';
        if (glossCount) glossCount.textContent = "";
        return;
      }

      var frag = document.createDocumentFragment();
      list.forEach(function (entry) {
        var card = document.createElement("div");
        card.className = "bf-term-card";
        card.setAttribute("role", "listitem");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", entry.term + " — " + entry.category);
        card.innerHTML =
          '<div class="bf-term-head">'
          + '<span class="bf-term-ico" aria-hidden="true"><i class="fa ' + categoryIcon(entry.category) + '"></i></span>'
          + '<div><div class="bf-term-name">' + esc(entry.term) + '</div>'
          + '<div class="bf-term-cat">' + esc(entry.category) + '</div></div>'
          + '</div>'
          + '<div class="bf-term-peek">' + esc(entry.shortDefinition || entry.plainExplanation) + '</div>';
        card.addEventListener("click", function () { pickTerm(entry.term); });
        card.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickTerm(entry.term); }
        });
        frag.appendChild(card);
      });
      termsGrid.appendChild(frag);
      if (glossCount) {
        glossCount.textContent = list.length + " fogalom"
          + (activeCat === "mind" ? " összesen" : " ebben a kategóriában")
          + (q ? " a keresésre" : "") + ".";
      }
    }

    function pickTerm(term) {
      inputEl.value = term;
      runTranslation(term);
      var sec = document.getElementById("bf-fordito");
      if (sec && sec.scrollIntoView) sec.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
    }

    /* ── Eseménykötések ─────────────────────────────────── */
    btn.addEventListener("click", function () { runTranslation(inputEl.value); });
    inputEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); runTranslation(inputEl.value); }
    });
    inputEl.addEventListener("input", function () { if (errorEl.classList.contains("visible")) hideError(); });

    document.querySelectorAll(".bf-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        var t = chip.getAttribute("data-term");
        if (t) pickTerm(t);
      });
    });

    catTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        catTabs.forEach(function (t) { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        activeCat = tab.getAttribute("data-cat");
        renderGrid();
      });
    });

    if (glossSearch) {
      var t = null;
      glossSearch.addEventListener("input", function () {
        clearTimeout(t);
        t = setTimeout(renderGrid, 160);
      });
    }

    /* ── Indítás (megvárja az adatfájlt) ────────────────── */
    function boot(tries) {
      if (window.BF_GLOSSARY && window.BF_GLOSSARY.length) {
        renderGrid();
      } else if ((tries || 0) < 25) {
        setTimeout(function () { boot((tries || 0) + 1); }, 120);
      } else if (termsGrid) {
        termsGrid.innerHTML = '<div class="bf-glossary-empty">A fogalomtár nem töltött be. Frissítsd az oldalt.</div>';
      }
    }
    boot(0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initController);
  } else {
    initController();
  }
})();
