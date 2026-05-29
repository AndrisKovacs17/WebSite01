/* ================================================================
   papirdaralo.js  –  Papírdaráló vezérlő
   Renderel: PD_DOCS, PD_FEEDBACK, PD_RESULTS (papirdaralo-data.js).
   Interakciók: drag&drop a darálóba, gombos döntés (darálás / átnézés),
   darálás-animáció, cafat-generálás, döntési logika, eredményképernyő.
   Frontend-only — nincs adatmentés, nincs hálózat.
   ================================================================ */
(function () {
  "use strict";

  var DOCS     = window.PD_DOCS || [];
  var FEEDBACK = window.PD_FEEDBACK || { goodShred: [], goodReview: [], badShred: [], badReview: [] };
  var RESULTS  = window.PD_RESULTS || {};

  var REDUCED = window.matchMedia &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var SHRED_CAP = 180;   // max cafat a tárolóban (teljesítmény)

  var STATE = {
    index: 0,
    busy: false,
    shredCount: 0,
    reviewCount: 0,
    correct: 0,
    keptImportant: 0,
    log: [],
    advanceTimer: null
  };

  /* DOM */
  var docEl, actionsEl, progressEl, feedEl, machineEl, shredderCol,
      binEl, feedbackEl, resultEl, gameEl, liveEl;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function pick(arr) { return (arr && arr.length) ? arr[Math.floor(Math.random() * arr.length)] : ""; }
  function announce(msg) { if (liveEl) liveEl.textContent = msg; }

  /* ── AKTUÁLIS DOKUMENTUM RENDER ──────────────────────────── */
  function renderDoc(withEntrance) {
    var doc = DOCS[STATE.index];
    if (!doc) { showResult(); return; }

    var linesHtml = (doc.lines || []).map(function (l) {
      return '<div class="pd-doc-line">' + esc(l) + '</div>';
    }).join("");

    docEl.innerHTML =
      '<span class="pd-doc-stamp">' + esc(doc.stamp) + '</span>' +
      '<h3 class="pd-doc-title">' + esc(doc.title) + '</h3>' +
      '<div class="pd-doc-type">' + esc(doc.type) + '</div>' +
      '<div class="pd-doc-lines">' + linesHtml + '</div>';
    docEl.setAttribute("draggable", "true");
    docEl.setAttribute("aria-label", "Dokumentum: " + doc.title + ". Húzd a darálóba, vagy válassz a gombokkal.");
    docEl.style.display = "";
    docEl.style.transform = "";
    docEl.style.opacity = "";
    docEl.classList.remove("is-dragging", "is-entering");

    if (withEntrance && !REDUCED) {
      void docEl.offsetWidth; // reflow, hogy az animáció újrainduljon
      docEl.classList.add("is-entering");
    }

    progressEl.textContent = (STATE.index + 1) + " / " + DOCS.length + " dokumentum";

    setActionsDisabled(false);
    STATE.busy = false;

    if (withEntrance) {
      docEl.focus();
    }
  }

  function setActionsDisabled(d) {
    Array.prototype.forEach.call(actionsEl.querySelectorAll("button"), function (b) {
      b.disabled = d;
    });
  }

  /* ── DÖNTÉS ──────────────────────────────────────────────── */
  function decide(choice) {
    if (STATE.busy) return;
    var doc = DOCS[STATE.index];
    if (!doc) return;
    STATE.busy = true;
    setActionsDisabled(true);

    var correct = (doc.decision === choice);
    if (correct) STATE.correct++;
    if (choice === "shred") STATE.shredCount++;
    else STATE.reviewCount++;
    if (doc.decision === "review" && choice === "review") STATE.keptImportant++;
    STATE.log.push({ doc: doc, choice: choice, correct: correct });

    if (choice === "shred") runShred(doc, correct);
    else runReview(doc, correct);
  }

  /* darálás */
  function runShred(doc, correct) {
    machineEl.classList.add("is-shredding");
    machineEl.classList.toggle("is-good", correct);
    machineEl.classList.toggle("is-wrong", !correct);
    announce("Darálás: " + doc.title);

    if (REDUCED) {
      docEl.style.display = "none";
      spawnShreds(28);
      stopShredAndFeedback(doc, correct, "shred");
      return;
    }

    /* etetett lap animáció */
    feedEl.textContent = doc.title;
    feedEl.classList.remove("is-feeding");
    void feedEl.offsetWidth; // reflow
    feedEl.classList.add("is-feeding");
    docEl.style.display = "none";

    /* cafatok fokozatosan, ahogy a lap "eltűnik" */
    var bursts = 0;
    var timer = setInterval(function () {
      spawnShreds(10);
      if (++bursts >= 3) clearInterval(timer);
    }, 220);

    setTimeout(function () {
      feedEl.classList.remove("is-feeding");
      stopShredAndFeedback(doc, correct, "shred");
    }, 980);
  }

  /* átnézés (nincs darálás) */
  function runReview(doc, correct) {
    machineEl.classList.toggle("is-good", correct);
    machineEl.classList.toggle("is-wrong", !correct);
    announce("Átnézésre félretéve: " + doc.title);

    if (REDUCED) {
      docEl.style.display = "none";
      stopShredAndFeedback(doc, correct, "review");
      return;
    }
    docEl.style.transition = "transform .5s ease, opacity .5s ease";
    docEl.style.transform = "translateX(-40%) rotate(-6deg)";
    docEl.style.opacity = "0";
    setTimeout(function () {
      docEl.style.display = "none";
      docEl.style.transition = "";
      stopShredAndFeedback(doc, correct, "review");
    }, 520);
  }

  function stopShredAndFeedback(doc, correct, choice) {
    machineEl.classList.remove("is-shredding");
    showFeedback(doc, correct, choice);
  }

  /* ── CAFAT-GENERÁLÁS ─────────────────────────────────────── */
  function spawnShreds(n) {
    var binW = binEl.clientWidth || 360;
    var binH = binEl.clientHeight || 200;
    var holder = binEl.querySelector(".pd-bin-shreds");
    if (!holder) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var s = document.createElement("span");
      s.className = "paper-shred " + (REDUCED ? "is-static" : "is-fall");
      var w = 4 + Math.random() * 6;
      var h = 14 + Math.random() * 18;
      var left = Math.random() * (binW - w);
      var end = binH - h - 6 - Math.random() * (binH * 0.55);
      var rot = (Math.random() * 36 - 18).toFixed(1) + "deg";
      s.style.left = left.toFixed(0) + "px";
      s.style.width = w.toFixed(1) + "px";
      s.style.height = h.toFixed(1) + "px";
      s.style.setProperty("--pd-end", Math.max(10, end).toFixed(0) + "px");
      s.style.setProperty("--pd-rot", rot);
      if (!REDUCED) {
        s.style.setProperty("--pd-dur", (0.7 + Math.random() * 0.6).toFixed(2) + "s");
        s.style.setProperty("--pd-delay", (Math.random() * 0.35).toFixed(2) + "s");
      }
      var tone = Math.random();
      s.style.background = tone > 0.6
        ? "linear-gradient(180deg,#fff,#efeadd)"
        : (tone > 0.3 ? "linear-gradient(180deg,#fbfbf7,#e7e2d4)" : "linear-gradient(180deg,#f4f4ef,#ddd8c9)");
      frag.appendChild(s);
    }
    holder.appendChild(frag);

    /* tároló cap: a legrégebbi cafatok eltávolítása */
    var kids = holder.children;
    while (kids.length > SHRED_CAP) holder.removeChild(kids[0]);
  }

  /* ── VISSZAJELZÉS ────────────────────────────────────────── */
  function showFeedback(doc, correct, choice) {
    var verdictTxt, verdictIcon, pool;
    if (correct) {
      verdictIcon = "fa-check-circle";
      pool = (choice === "shred") ? FEEDBACK.goodShred : FEEDBACK.goodReview;
      verdictTxt = doc.good || pick(pool);
    } else {
      verdictIcon = "fa-exclamation-circle";
      pool = (choice === "shred") ? FEEDBACK.badShred : FEEDBACK.badReview;
      verdictTxt = (choice === "shred" && doc.badShred) ? doc.badShred
                 : (choice === "review" && doc.badReview) ? doc.badReview
                 : pick(pool);
    }

    var choiceTxt = (choice === "shred") ? "Darálóba tetted" : "Átnézésre tetted";
    var suggestTxt = (doc.decision === "shred") ? "Ezt nyugodtan ledarálhattad." : "Ezt érdemes előbb átnézni.";

    feedbackEl.className = "pd-feedback " + (correct ? "is-good" : "is-wrong");
    feedbackEl.innerHTML =
      '<p class="pd-feedback-verdict"><i class="fa ' + verdictIcon + '" aria-hidden="true"></i>' + esc(verdictTxt) + '</p>' +
      '<div class="pd-fb-row"><strong>Dokumentum:</strong> ' + esc(doc.title) + '</div>' +
      '<div class="pd-fb-row"><strong>Döntésed:</strong> ' + esc(choiceTxt) + '</div>' +
      '<div class="pd-fb-row"><strong>Javaslat:</strong> ' + esc(doc.suggest || suggestTxt) + '</div>' +
      '<div class="pd-fb-lesson">' + esc(doc.lesson) + '</div>' +
      '<div class="pd-scoreline">' +
        '<span>Jól kezelt: <b>' + STATE.correct + '</b></span>' +
        '<span>Ledarálva: <b>' + STATE.shredCount + '</b></span>' +
        '<span>Átnézésre: <b>' + STATE.reviewCount + '</b></span>' +
      '</div>';

    requestAnimationFrame(function () { feedbackEl.classList.add("is-show"); });
    announce(verdictTxt + " " + doc.lesson);

    /* automatikus továbblépés – nincs szükség "Következő" gombra */
    if (STATE.advanceTimer) clearTimeout(STATE.advanceTimer);
    STATE.advanceTimer = setTimeout(advanceToNext, REDUCED ? 400 : 1600);
  }

  function advanceToNext() {
    STATE.advanceTimer = null;
    feedbackEl.classList.remove("is-show");
    machineEl.classList.remove("is-good", "is-wrong");
    var fadeDelay = REDUCED ? 0 : 300;
    setTimeout(function () {
      feedbackEl.innerHTML = "";
      STATE.index++;
      if (STATE.index >= DOCS.length) {
        showResult();
      } else {
        renderDoc(true);
      }
    }, fadeDelay);
  }

  /* ── EREDMÉNYKÉPERNYŐ ────────────────────────────────────── */
  function chooseResult() {
    if (STATE.keptImportant >= 6) return RESULTS.keeper;
    if (STATE.shredCount >= 7) return RESULTS.minimalist;
    if (STATE.reviewCount >= 7) return RESULTS.archeologist;
    return RESULTS.survivor;
  }

  function showResult() {
    if (STATE.advanceTimer) { clearTimeout(STATE.advanceTimer); STATE.advanceTimer = null; }
    var r = chooseResult() || { title: "Eredmény", text: "" };
    gameEl.hidden = true;
    resultEl.hidden = false;
    resultEl.innerHTML =
      '<div class="pd-result">' +
        '<span class="pd-result-badge"><i class="fa fa-award" aria-hidden="true"></i> Eredmény</span>' +
        '<h2>' + esc(r.title) + '</h2>' +
        '<p class="pd-result-text">' + esc(r.text) + '</p>' +
        '<div class="pd-result-stats">' +
          stat(STATE.correct, "jó döntés") +
          stat(STATE.shredCount, "ledarálva") +
          stat(STATE.reviewCount, "átnézésre") +
          stat(DOCS.length, "dokumentum") +
        '</div>' +
        '<div class="pd-result-cta">' +
          '<a href="/kapcsolat" class="pd-btn"><i class="fa fa-file-alt" aria-hidden="true"></i> Átnézetem</a>' +
          '<a href="/kapcsolat" class="pd-btn pd-btn-ghost"><i class="fa fa-paper-plane" aria-hidden="true"></i> Kapcsolat</a>' +
          '<a href="tel:+36706258201" class="pd-btn pd-btn-ghost phone-link"><i class="fa fa-phone-alt" aria-hidden="true"></i> Visszahívást kérek</a>' +
          '<button type="button" class="pd-btn pd-btn-ghost" id="pdRestart"><i class="fa fa-redo" aria-hidden="true"></i> Újrakezdem</button>' +
          '<a href="/jatekzona/" class="pd-btn pd-btn-ghost"><i class="fa fa-gamepad" aria-hidden="true"></i> Vissza a Játékzónába</a>' +
        '</div>' +
      '</div>';
    announce("Játék vége. Eredmény: " + r.title);
    resultEl.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });

    var restart = document.getElementById("pdRestart");
    if (restart) { restart.addEventListener("click", restartGame); restart.focus(); }
  }

  function stat(num, lab) {
    return '<div class="pd-stat"><div class="pd-stat-num">' + num + '</div><div class="pd-stat-lab">' + esc(lab) + '</div></div>';
  }

  function restartGame() {
    if (STATE.advanceTimer) { clearTimeout(STATE.advanceTimer); STATE.advanceTimer = null; }
    STATE.index = 0; STATE.busy = false;
    STATE.shredCount = 0; STATE.reviewCount = 0; STATE.correct = 0; STATE.keptImportant = 0;
    STATE.log = [];
    var holder = binEl.querySelector(".pd-bin-shreds");
    if (holder) holder.innerHTML = "";
    feedbackEl.classList.remove("is-show");
    feedbackEl.innerHTML = "";
    resultEl.hidden = true;
    resultEl.innerHTML = "";
    gameEl.hidden = false;
    machineEl.classList.remove("is-good", "is-wrong", "is-shredding");
    renderDoc();
    gameEl.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
  }

  /* ── DRAG & DROP ─────────────────────────────────────────── */
  function setupDnD() {
    docEl.addEventListener("dragstart", function (e) {
      if (STATE.busy) { e.preventDefault(); return; }
      docEl.classList.add("is-dragging");
      try { e.dataTransfer.setData("text/plain", "doc"); e.dataTransfer.effectAllowed = "move"; } catch (err) {}
    });
    docEl.addEventListener("dragend", function () { docEl.classList.remove("is-dragging"); });

    function over(e) { if (!STATE.busy) { e.preventDefault(); shredderCol.classList.add("is-dropzone"); } }
    shredderCol.addEventListener("dragover", over);
    shredderCol.addEventListener("dragenter", over);
    shredderCol.addEventListener("dragleave", function (e) {
      if (!shredderCol.contains(e.relatedTarget)) shredderCol.classList.remove("is-dropzone");
    });
    shredderCol.addEventListener("drop", function (e) {
      e.preventDefault();
      shredderCol.classList.remove("is-dropzone");
      decide("shred");
    });
  }

  /* ── INIT ─────────────────────────────────────────────────── */
  function init() {
    gameEl       = document.getElementById("pdGame");
    docEl        = document.getElementById("pdDoc");
    actionsEl    = document.getElementById("pdActions");
    progressEl   = document.getElementById("pdProgress");
    feedEl       = document.getElementById("pdFeed");
    machineEl    = document.getElementById("pdMachine");
    shredderCol  = document.getElementById("pdShredderCol");
    binEl        = document.getElementById("pdBin");
    feedbackEl   = document.getElementById("pdFeedback");
    resultEl     = document.getElementById("pdResult");
    liveEl       = document.getElementById("pdLive");
    if (!gameEl || !docEl || !DOCS.length) return;

    actionsEl.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-choice]");
      if (!b) return;
      decide(b.getAttribute("data-choice"));
    });

    var startBtn = document.getElementById("pdStart");
    if (startBtn) {
      startBtn.addEventListener("click", function (e) {
        e.preventDefault();
        gameEl.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
        docEl.focus();
      });
    }

    setupDnD();
    renderDoc();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
