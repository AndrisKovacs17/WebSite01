/* ================================================================
   biztositasi-horoszkop.js  –  Biztosítási Horoszkóp vezérlő (v2)
   Feed-forward teszt + folyadékkal töltődő avatar + score logika.
   Frontend-only. Nincs backend, API vagy adatmentés.
   ================================================================ */
(function () {
  "use strict";

  var QUESTIONS = window.BH_QUESTIONS || [];
  var RESULTS = window.BH_RESULTS || [];
  var LOADING = window.BH_LOADING || [];

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* DOM */
  var elIntro, elStart, elStage, elCard, elQnum, elQuestion, elMicro, elAnswers,
      elBack, elProgressFill, elCounter, elPercent, elStatus, elLiquid, elAvatarCol,
      elResult, elLive;

  /* állapot */
  var idx = 0;             // aktuális kérdés indexe
  var answers = [];        // answers[qIndex] = kiválasztott válasz indexe
  var total = QUESTIONS.length;
  var maxDim = {};         // dimenziónkénti maximális elérhető pont
  var locked = false;      // animáció közbeni zár
  var KEYS = ["A", "B", "C", "D", "E", "F"];

  /* ---- score normalizáláshoz: max elérhető pont dimenziónként ---- */
  function computeMax() {
    maxDim = {};
    QUESTIONS.forEach(function (q) {
      var m = {};
      q.answers.forEach(function (a) {
        for (var k in a.scores) { if (a.scores[k] > (m[k] || 0)) m[k] = a.scores[k]; }
      });
      for (var k2 in m) { maxDim[k2] = (maxDim[k2] || 0) + m[k2]; }
    });
  }

  function rawScores() {
    var sc = {};
    for (var i = 0; i < answers.length; i++) {
      if (answers[i] == null) continue;
      var s = QUESTIONS[i].answers[answers[i]].scores;
      for (var k in s) { sc[k] = (sc[k] || 0) + s[k]; }
    }
    return sc;
  }

  /* nyertes + másodlagos típus normalizált, súlyozott score alapján */
  function selectResult() {
    if (!RESULTS.length) return { primary: null, secondary: null };
    var raw = rawScores();
    var norm = {};
    for (var k in maxDim) { norm[k] = maxDim[k] ? (raw[k] || 0) / maxDim[k] : 0; }

    var ranked = RESULTS.map(function (r) {
      var v = (norm[r.primaryScore] || 0) * 3;
      (r.secondaryScores || []).forEach(function (s) { v += (norm[s] || 0); });
      return { r: r, v: v };
    }).sort(function (a, b) { return b.v - a.v; });

    var best = ranked[0];
    var second = ranked[1];
    var showSecond = second && best.v > 0 && second.v >= best.v * 0.8 && second.r.id !== best.r.id;
    return { primary: best.r, secondary: showSecond ? second.r : null };
  }

  /* ---- avatar folyadékszint ---- */
  function setLevel(level) {
    if (level < 0) level = 0; if (level > 1) level = 1;
    if (elLiquid) {
      var y = ((1 - level) * 130).toFixed(1);
      elLiquid.setAttribute("transform", "translate(0," + y + ")");
    }
    if (elPercent) elPercent.textContent = Math.round(level * 100) + "%";
  }

  function statusForLevel(level) {
    if (!LOADING.length) return "";
    var i = Math.min(LOADING.length - 1, Math.floor(level * LOADING.length));
    return LOADING[i];
  }

  /* ---- kérdés render ---- */
  function renderQuestion(animClass) {
    var q = QUESTIONS[idx];
    var level = idx / total;

    elQnum.textContent = (idx + 1) + " / " + total + ". kérdés";
    elQuestion.textContent = q.question;
    if (q.microcopy) { elMicro.textContent = q.microcopy; elMicro.style.display = ""; }
    else { elMicro.textContent = ""; elMicro.style.display = "none"; }

    elProgressFill.style.width = Math.round(level * 100) + "%";
    elCounter.textContent = (idx + 1) + " / " + total + " kérdés";
    setLevel(level);
    if (elStatus) elStatus.textContent = statusForLevel(level);
    elBack.disabled = idx === 0;

    buildAnswers(q);

    // belépő animáció
    elCard.classList.remove("is-out", "is-out-back");
    if (animClass) {
      elCard.classList.add(animClass);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { elCard.classList.remove(animClass); });
      });
    }
    announce("Kérdés " + (idx + 1) + " / " + total + ": " + q.question);
    if (elQuestion && elQuestion.focus) {
      try { elQuestion.focus({ preventScroll: true }); } catch (e) { elQuestion.focus(); }
    }
  }

  function buildAnswers(q) {
    elAnswers.innerHTML = "";
    var isImage = q.type === "image";
    elAnswers.className = "bh-answers" + (isImage ? " is-image" : "");
    var chosen = answers[idx];

    q.answers.forEach(function (a, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("data-i", i);

      if (isImage) {
        btn.className = "bh-img-answer" + (chosen === i ? " is-selected" : "");
        var grad = a.gradient ? "linear-gradient(135deg," + a.gradient[0] + "," + a.gradient[1] + ")" : "linear-gradient(135deg,#FFA726,#FB8C00)";
        var inner = '<span class="bh-img-thumb" style="background:' + grad + '">'
          + '<i class="fa ' + esc(a.icon || "fa-paw") + '" aria-hidden="true"></i>';
        if (a.image) {
          inner += '<img src="' + esc(a.image) + '" alt="' + esc(a.label) + '" loading="lazy" '
            + 'onerror="this.remove();" />';
        }
        inner += '</span>'
          + '<span class="bh-img-meta"><span class="bh-img-name">' + esc(a.label) + '</span>'
          + '<span class="bh-img-mood">' + esc(a.mood || "") + '</span></span>';
        btn.innerHTML = inner;
        btn.setAttribute("aria-label", a.label + (a.mood ? " – " + a.mood : ""));
      } else {
        btn.className = "bh-answer" + (chosen === i ? " is-selected" : "");
        btn.innerHTML = '<span class="bh-answer-key" aria-hidden="true">' + KEYS[i] + '</span>'
          + '<span class="bh-answer-label">' + esc(a.label) + '</span>';
      }

      btn.addEventListener("click", function () { choose(i); });
      elAnswers.appendChild(btn);
    });
  }

  /* ---- válasz kiválasztása ---- */
  function choose(answerIndex) {
    if (locked) return;
    locked = true;
    answers[idx] = answerIndex;

    var nodes = elAnswers.children;
    for (var n = 0; n < nodes.length; n++) {
      nodes[n].classList.toggle("is-selected", Number(nodes[n].getAttribute("data-i")) === answerIndex);
    }

    setTimeout(function () {
      if (idx < total - 1) {
        elCard.classList.add("is-out");
        setTimeout(function () { idx++; renderQuestion("is-out"); locked = false; }, 260);
      } else {
        finish();
      }
    }, 320);
  }

  function back() {
    if (locked || idx === 0) return;
    locked = true;
    elCard.classList.add("is-out-back");
    setTimeout(function () { idx--; renderQuestion("is-out-back"); locked = false; }, 240);
  }

  /* ---- befejezés + eredmény ---- */
  function finish() {
    elProgressFill.style.width = "100%";
    elCounter.textContent = "Kész!";
    setLevel(1);
    if (elStatus) elStatus.textContent = "Profil összeállítva.";
    if (elAvatarCol) elAvatarCol.classList.add("is-complete");
    announce("A teszt elkészült, eredmény betöltése.");

    setTimeout(function () {
      elStage.style.display = "none";
      showResult();
      locked = false;
    }, 900);
  }

  var CTA_LINKS = {
    atnezetem:   { href: "/kapcsolat", icon: "fa-file-alt", label: "Átnézetem" },
    ajanlatkeres:{ href: "/kapcsolat", icon: "fa-paper-plane", label: "Ajánlatkérés" },
    kapcsolat:   { href: "/kapcsolat", icon: "fa-paper-plane", label: "Kapcsolat" },
    visszahivas: { href: "tel:+36706258201", icon: "fa-phone-alt", label: "Visszahívást kérek" }
  };

  function showResult() {
    var pick = selectResult();
    var r = pick.primary;
    if (!r) return;
    var grad = "linear-gradient(135deg," + r.gradient[0] + "," + r.gradient[1] + ")";

    var html = '<div class="bh-result-card">'
      + '<div class="bh-result-head" style="background:' + grad + '">'
      + '<div class="bh-result-ico"><i class="fa ' + esc(r.icon) + '" aria-hidden="true"></i></div>'
      + '<div class="bh-result-eyebrow">A te biztosítási karaktered</div>'
      + '<h3 class="bh-result-name">' + esc(r.name) + '</h3>'
      + '<p class="bh-result-tagline">' + esc(r.tagline) + '</p>';
    if (pick.secondary) {
      html += '<div class="bh-result-secondary"><i class="fa fa-bolt" aria-hidden="true"></i> Másodlagos energiád: '
        + esc(pick.secondary.name) + '</div>';
    }
    html += '</div>'; // head

    html += '<div class="bh-result-body">'
      + '<p class="bh-result-desc">' + esc(r.description) + '</p>'
      + '<div class="bh-traits">'
      + '<div class="bh-trait bh-trait-strength"><div class="bh-trait-label"><i class="fa fa-check-circle" aria-hidden="true"></i> Erősség</div><p>' + esc(r.strength) + '</p></div>'
      + '<div class="bh-trait bh-trait-weakness"><div class="bh-trait-label"><i class="fa fa-exclamation-circle" aria-hidden="true"></i> Gyenge pont</div><p>' + esc(r.weakness) + '</p></div>'
      + '</div>'
      + '<div class="bh-advice"><div class="bh-advice-label">Biztosítási tanács</div><p>' + esc(r.advice) + '</p></div>';

    html += '<h4 class="bh-tips-title">3 személyre szabott javaslat</h4><ul class="bh-tips">';
    (r.tips || []).forEach(function (t) {
      html += '<li><i class="fa fa-angle-right" aria-hidden="true"></i><span>' + esc(t) + '</span></li>';
    });
    html += '</ul>';

    // CTA
    var primaryCta = CTA_LINKS[r.cta] || CTA_LINKS.atnezetem;
    html += '<div class="bh-cta"><h4>Ez az eredmény valós?</h4>'
      + '<p>Egy ingyenes, kötelezettségmentes átnézésen közösen megnézzük, tényleg rendben van-e a biztosítási védelmed.</p>'
      + '<div class="bh-cta-btns">'
      + '<a class="bh-btn" href="' + primaryCta.href + '"><i class="fa ' + primaryCta.icon + '" aria-hidden="true"></i> ' + primaryCta.label + '</a>'
      + '<a class="bh-btn bh-btn-ghost" href="/kapcsolat"><i class="fa fa-paper-plane" aria-hidden="true"></i> Ajánlatkérés</a>'
      + '<a class="bh-btn bh-btn-ghost" href="tel:+36706258201"><i class="fa fa-phone-alt" aria-hidden="true"></i> Visszahívást kérek</a>'
      + '<a class="bh-btn bh-btn-ghost" href="/jatekzona/"><i class="fa fa-gamepad" aria-hidden="true"></i> Vissza a Játékzónába</a>'
      + '<button type="button" class="bh-btn bh-btn-ghost" id="bhRestart"><i class="fa fa-undo" aria-hidden="true"></i> Újrakezdem</button>'
      + '</div></div>';

    html += '</div></div>'; // body + card

    elResult.innerHTML = html;
    elResult.classList.add("is-visible");
    var rb = $("bhRestart");
    if (rb) rb.addEventListener("click", restart);
    announce("Az eredményed: " + r.name + ". " + r.tagline);
    elResult.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function restart() {
    idx = 0; answers = []; locked = false;
    elResult.classList.remove("is-visible");
    elResult.innerHTML = "";
    if (elAvatarCol) elAvatarCol.classList.remove("is-complete");
    elStage.style.display = "";
    renderQuestion(null);
    elStage.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function start() {
    if (elIntro) elIntro.style.display = "none";
    elStage.style.display = "";
    idx = 0; answers = []; locked = false;
    renderQuestion(null);
    elStage.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function announce(msg) { if (elLive) elLive.textContent = msg; }

  /* billentyűzet: 1-5 / A-E válasz, bal nyíl = vissza */
  function onKey(e) {
    if (elStage.style.display === "none") return;
    var tag = (e.target.tagName || "").toUpperCase();
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    if (e.key === "ArrowLeft" || e.key === "Backspace") {
      if (idx > 0) { e.preventDefault(); back(); }
      return;
    }
    var q = QUESTIONS[idx];
    if (!q) return;
    var n = -1;
    if (/^[1-9]$/.test(e.key)) n = parseInt(e.key, 10) - 1;
    else {
      var up = e.key.toUpperCase();
      var ki = KEYS.indexOf(up);
      if (ki >= 0) n = ki;
    }
    if (n >= 0 && n < q.answers.length) { e.preventDefault(); choose(n); }
  }

  function init() {
    elIntro = $("bhIntro"); elStart = $("bhStart");
    elStage = $("bhStage"); elCard = $("bhCard");
    elQnum = $("bhQnum"); elQuestion = $("bhQuestion"); elMicro = $("bhMicrocopy");
    elAnswers = $("bhAnswers"); elBack = $("bhBack");
    elProgressFill = $("bhProgressFill"); elCounter = $("bhCounter"); elPercent = $("bhPercent");
    elStatus = $("bhStatusText"); elLiquid = $("bhLiquid"); elAvatarCol = $("bhAvatarCol");
    elResult = $("bhResult"); elLive = $("bhLive");

    if (!elStage || !elCard || !QUESTIONS.length) return;

    computeMax();
    total = QUESTIONS.length;

    if (elStart) elStart.addEventListener("click", start);
    if (elBack) elBack.addEventListener("click", back);
    document.addEventListener("keydown", onKey);

    // kezdő avatar állapot
    setLevel(0);
    if (elCounter) elCounter.textContent = total + " kérdés";
    if (elStatus) elStatus.textContent = "Készen állsz?";

    // ha nincs intro, induljon azonnal
    if (!elIntro) start();
    else elStage.style.display = "none";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
