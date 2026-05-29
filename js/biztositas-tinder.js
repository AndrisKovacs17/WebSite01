/* =========================================================
   Biztosítás Tinder — swipe vezérlő
   Adat: window.BT_CARDS  (js/biztositas-tinder-cards.js)
   Frontend-only: nincs adatmentés, nincs backend.
   ========================================================= */
(function () {
  "use strict";

  function init() {
    var deck = document.getElementById("btDeck");
    if (!deck) return;

    var cards      = (window.BT_CARDS || []).slice();
    var stage      = document.getElementById("btStage");
    var cardEl     = document.getElementById("btCard");
    var stampLike  = document.getElementById("btStampLike");
    var stampSkip  = document.getElementById("btStampSkip");
    var actionsEl  = document.getElementById("btActions");
    var btnSkip    = document.getElementById("btSkip");
    var btnLike    = document.getElementById("btLike");
    var btnUndo    = document.getElementById("btUndo");
    var progFill   = document.getElementById("btProgressFill");
    var progText   = document.getElementById("btProgressText");
    var resultEl   = document.getElementById("btResult");
    var statusEl   = document.getElementById("btStatus");
    var hintEl     = document.getElementById("btHint");

    var prefersReduced = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var current = 0;
    var decisions = [];        // { card, verdict: 'like'|'skip' }
    var animating = false;

    function esc(s) {
      return String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
    function toneLabel(t) {
      return t === "good" ? "Jó match" : (t === "problem" ? "Átnézésre vár" : "Vegyes eset");
    }

    function announce(msg) { if (statusEl) statusEl.textContent = msg; }

    function updateProgress() {
      var pct = cards.length ? Math.round((current / cards.length) * 100) : 0;
      if (progFill) progFill.style.width = pct + "%";
      if (progText) progText.textContent = Math.min(current + 1, cards.length) + " / " + cards.length;
    }

    /* ── Kártya kirajzolás ──────────────────────────────── */
    function renderCard(c) {
      var photoStyle = c.image
        ? 'background-image:url(\'' + esc(c.image) + '\')'
        : 'background-image:linear-gradient(135deg,' + esc(c.gradient[0]) + ',' + esc(c.gradient[1]) + ')';

      var hobbies = (c.hobbies || []).map(function (h) { return '<li>' + esc(h) + '</li>'; }).join("");

      cardEl.innerHTML =
        '<div class="bt-card-photo" style="' + photoStyle + '" role="img" aria-label="' + esc(c.name) + ' – illusztráció">'
        + '<span class="bt-card-type">' + esc(c.type) + '</span>'
        + '<span class="bt-card-tone tone-' + esc(c.tone) + '">' + esc(toneLabel(c.tone)) + '</span>'
        + '<i class="fa ' + esc(c.icon) + ' bt-card-photo-ico" aria-hidden="true"></i>'
        + '</div>'
        + '<div class="bt-card-body">'
        + '<div class="bt-card-name">' + esc(c.name) + '</div>'
        + '<div class="bt-card-meta">'
        + '<span><i class="fa fa-hourglass-half" aria-hidden="true"></i>' + esc(c.age) + '</span>'
        + '<span><i class="fa fa-map-marker-alt" aria-hidden="true"></i>' + esc(c.place) + '</span>'
        + '</div>'
        + '<div class="bt-card-bio">' + esc(c.bio) + '</div>'
        + field("fa-heart", "Hobbi", '<ul>' + hobbies + '</ul>', "", true)
        + field("fa-smoking-ban", "Dohányzik", esc(c.smoking), "")
        + field("fa-bullseye", "Mit akar", esc(c.wants), "")
        + field("fa-flag", "Red flag", esc(c.redFlag), "flag-red")
        + field("fa-leaf", "Green flag", esc(c.greenFlag), "flag-green")
        + field("fa-thumbs-up", "Ajánlás", esc(c.recommendation), "field-rec")
        + field("fa-info-circle", "Szakmai magyarázat", esc(c.explanation), "field-explain")
        + '</div>';

      cardEl.scrollTop = 0;
      var body = cardEl.querySelector(".bt-card-body");
      if (body) body.scrollTop = 0;
    }

    function field(icon, label, html, extra, isList) {
      return '<div class="bt-field ' + extra + '">'
        + '<div class="bt-field-label"><i class="fa ' + icon + '" aria-hidden="true"></i>' + label + '</div>'
        + (isList ? html : '<div class="bt-field-text">' + html + '</div>')
        + '</div>';
    }

    function showCurrent(entering) {
      if (current >= cards.length) { showResult(); return; }
      renderCard(cards[current]);
      cardEl.style.transform = "";
      cardEl.style.opacity = "";
      cardEl.classList.remove("is-leaving", "dragging");
      setStamp(0);
      if (entering && !prefersReduced) {
        cardEl.classList.remove("is-entering");
        void cardEl.offsetWidth;
        cardEl.classList.add("is-entering");
      }
      updateProgress();
      if (btnUndo) btnUndo.disabled = decisions.length === 0;
    }

    /* ── Bélyeg láthatóság a húzás arányában ────────────── */
    function setStamp(dx) {
      var t = Math.max(-1, Math.min(1, dx / 120));
      stampLike.style.opacity = t > 0 ? t.toFixed(2) : "0";
      stampSkip.style.opacity = t < 0 ? (-t).toFixed(2) : "0";
    }

    /* ── Döntés véglegesítése ───────────────────────────── */
    function commit(verdict) {
      if (animating || current >= cards.length) return;
      animating = true;
      var c = cards[current];
      decisions.push({ card: c, verdict: verdict });

      var dir = verdict === "like" ? 1 : -1;
      var endX = dir * (window.innerWidth * 0.9 + 200);
      stampLike.style.opacity = verdict === "like" ? "1" : "0";
      stampSkip.style.opacity = verdict === "skip" ? "1" : "0";

      announce(c.name + " — " + (verdict === "like" ? "Átnézném" : "Kihagyom") +
        ". " + (current + 1) + " / " + cards.length + " kész.");

      if (prefersReduced) {
        cardEl.style.opacity = "0";
        setTimeout(next, 200);
      } else {
        cardEl.classList.add("is-leaving");
        cardEl.style.transform = "translateX(" + endX + "px) rotate(" + (dir * 18) + "deg)";
        cardEl.style.opacity = "0";
        setTimeout(next, 420);
      }

      function next() {
        current++;
        animating = false;
        showCurrent(true);
      }
    }

    function undo() {
      if (animating || decisions.length === 0) return;
      decisions.pop();
      current = Math.max(0, current - 1);
      if (resultEl.classList.contains("visible")) {
        resultEl.classList.remove("visible");
        stage.style.display = "";
      }
      showCurrent(true);
      announce("Visszavonva. Újra a(z) " + (current + 1) + ". kártyánál.");
    }

    /* ── Pointer-alapú húzás (axis-lock) ────────────────── */
    var drag = null;
    cardEl.addEventListener("pointerdown", function (e) {
      if (animating) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag = { x0: e.clientX, y0: e.clientY, dx: 0, axis: null, id: e.pointerId };
    });

    cardEl.addEventListener("pointermove", function (e) {
      if (!drag || drag.id !== e.pointerId) return;
      var dx = e.clientX - drag.x0;
      var dy = e.clientY - drag.y0;

      if (!drag.axis) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (drag.axis === "x") {
          try { cardEl.setPointerCapture(e.pointerId); } catch (err) {}
          cardEl.classList.add("dragging");
        }
      }
      if (drag.axis !== "x") return;   // függőleges → belső görgetés marad
      e.preventDefault();
      drag.dx = dx;
      var rot = dx / 18;
      cardEl.style.transform = "translateX(" + dx + "px) rotate(" + rot + "deg)";
      setStamp(dx);
    });

    function endDrag(e) {
      if (!drag || drag.id !== e.pointerId) return;
      var dx = drag.dx, axis = drag.axis;
      try { cardEl.releasePointerCapture(e.pointerId); } catch (err) {}
      cardEl.classList.remove("dragging");
      drag = null;
      if (axis !== "x") return;
      if (Math.abs(dx) > 110) {
        commit(dx > 0 ? "like" : "skip");
      } else {
        cardEl.style.transform = "";
        setStamp(0);
      }
    }
    cardEl.addEventListener("pointerup", endDrag);
    cardEl.addEventListener("pointercancel", endDrag);

    /* ── Gombok ─────────────────────────────────────────── */
    btnSkip.addEventListener("click", function () { commit("skip"); });
    btnLike.addEventListener("click", function () { commit("like"); });
    if (btnUndo) btnUndo.addEventListener("click", undo);

    /* ── Billentyűzet ───────────────────────────────────── */
    document.addEventListener("keydown", function (e) {
      if (current >= cards.length) return;
      var tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft")  { e.preventDefault(); commit("skip"); }
      else if (e.key === "ArrowRight") { e.preventDefault(); commit("like"); }
      else if (e.key === "Backspace") { e.preventDefault(); undo(); }
    });

    /* ── Eredmény ───────────────────────────────────────── */
    function showResult() {
      var likes = decisions.filter(function (d) { return d.verdict === "like"; });
      var skips = decisions.filter(function (d) { return d.verdict === "skip"; });
      var likedProblem = likes.filter(function (d) { return d.card.tone === "problem"; }).length;
      var likedGood    = likes.filter(function (d) { return d.card.tone === "good"; }).length;
      var total = decisions.length;

      var headline, lead, ico = "fa-clipboard-check";
      if (total === 0) {
        headline = "Nem maradt kártya"; lead = "Nézd át újra a profilokat, és döntsd el, mire néznél rá szívesebben.";
      } else if (skips.length >= likes.length && skips.length >= Math.ceil(total * 0.6)) {
        ico = "fa-eye";
        headline = "Most csak körülnéztél";
        lead = "Lehet, hogy most csak körülnéztél, de pár kártyánál érdemes lehet később visszatérni. A biztosításokat nem kell egyszerre rendbe tenni – elég lépésről lépésre.";
      } else if (likedProblem >= likedGood && likedProblem > 0) {
        ico = "fa-search";
        headline = "Több helyzet is megér egy átnézést";
        lead = "Úgy tűnik, több olyan biztosítási helyzet is van, aminél megállnál egy átnézésre. Pont ezekből szokott kiderülni, hol érdemes pontosítani a fedezetet vagy a limiteket.";
      } else if (likedGood > 0) {
        ico = "fa-star";
        headline = "A jól felépített megoldások vonzanak";
        lead = "Látszik, hogy a jól felépített biztosítási megoldások érdekelnek. Érdemes lehet megnézni, a saját szerződéseid is ilyen erősek-e – néha egy apró részlet tesz nagy különbséget.";
      } else {
        ico = "fa-clipboard-check";
        headline = "Vegyes kép alakult ki";
        lead = "Volt, ami megtetszett, és volt, amit kihagytál. Egy nyugodt átnézéssel tisztább lehet, melyik szerződés hol tart.";
      }

      var breakdown = decisions.map(function (d) {
        var like = d.verdict === "like";
        return '<div class="bt-breakdown-item">'
          + '<span class="bt-bd-ico ' + (like ? "bt-bd-like" : "bt-bd-skip") + '">'
          + '<i class="fa ' + (like ? "fa-heart" : "fa-times") + '" aria-hidden="true"></i></span>'
          + '<span class="bt-bd-name">' + esc(d.card.name) + '</span>'
          + '<span class="bt-bd-verdict">' + (like ? "Átnézném" : "Kihagytam") + '</span>'
          + '</div>';
      }).join("");

      resultEl.innerHTML =
        '<div class="bt-result-card">'
        + '<div class="bt-result-ico"><i class="fa ' + ico + '" aria-hidden="true"></i></div>'
        + '<h2>' + esc(headline) + '</h2>'
        + '<p class="bt-result-lead">' + esc(lead) + '</p>'
        + '<div class="bt-result-stats">'
        + '<div class="bt-stat"><div class="bt-stat-num">' + likes.length + '</div><div class="bt-stat-label">Átnézném</div></div>'
        + '<div class="bt-stat"><div class="bt-stat-num">' + skips.length + '</div><div class="bt-stat-label">Kihagytam</div></div>'
        + '<div class="bt-stat"><div class="bt-stat-num">' + total + '</div><div class="bt-stat-label">Összes kártya</div></div>'
        + '</div>'
        + '<div class="bt-result-breakdown">' + breakdown + '</div>'
        + '<button type="button" class="bt-act-btn bt-act-skip bt-act-main" id="btRestart"><i class="fa fa-undo" aria-hidden="true"></i> <span>Újrakezdem</span></button>'
        + '</div>'
        + '<div class="bt-result-cta">'
        + '<h3>Nézzük meg élesben is</h3>'
        + '<p>Egy ingyenes átnézéssel kiderül, mit érdemes tartani és min lehet javítani – kötelezettség nélkül.</p>'
        + '<div class="bt-cta-btns">'
        + '<a href="/kapcsolat" class="bt-cta-btn bt-cta-primary"><i class="fa fa-file-alt" aria-hidden="true"></i> Átnézetem</a>'
        + '<a href="/kapcsolat" class="bt-cta-btn bt-cta-outline"><i class="fa fa-paper-plane" aria-hidden="true"></i> Ajánlatkérés</a>'
        + '<a href="tel:+36706258201" class="bt-cta-btn bt-cta-outline phone-link"><i class="fa fa-phone-alt" aria-hidden="true"></i> Visszahívást kérek</a>'
        + '<a href="/jatekzona/" class="bt-cta-btn bt-cta-outline"><i class="fa fa-gamepad" aria-hidden="true"></i> Vissza a Játékzónába</a>'
        + '</div></div>';

      stage.style.display = "none";
      resultEl.classList.add("visible");
      announce("Vége. " + headline + ". " + likes.length + " átnézendő, " + skips.length + " kihagyott.");

      var restart = document.getElementById("btRestart");
      if (restart) restart.addEventListener("click", function () {
        current = 0; decisions = [];
        resultEl.classList.remove("visible");
        resultEl.innerHTML = "";
        stage.style.display = "";
        showCurrent(true);
        if (stage.scrollIntoView) stage.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
      });
      if (resultEl.scrollIntoView) resultEl.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
    }

    /* ── Indítás ────────────────────────────────────────── */
    if (!cards.length) {
      stage.innerHTML = '<p style="text-align:center;color:#6b7280;">A kártyák nem töltöttek be. Frissítsd az oldalt.</p>';
      return;
    }
    showCurrent(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
