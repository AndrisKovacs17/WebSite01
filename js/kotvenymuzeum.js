/* ================================================================
   kotvenymuzeum.js  –  Kötvénymúzeum vezérlő
   Renderel: KM_ROOMS, KM_SECRET, KM_CURATOR (kotvenymuzeum-data.js).
   Interakciók: nagyított nézet (modal), háromszori kattintásos
   átszakadás, porletörlés (canvas), titkos terem feloldás.
   Frontend-only — nincs adatmentés, nincs hálózat.
   ================================================================ */
(function () {
  "use strict";

  var ROOMS   = window.KM_ROOMS || [];
  var SECRET  = window.KM_SECRET || null;
  var CURATOR = window.KM_CURATOR || { dust: [], torn: [], secret: "", intro: "" };

  /* ── ÁLLAPOT ──────────────────────────────────────────────────
     A titkos terem feloldási küszöbei itt állíthatók át:        */
  var UNLOCK = { torn: 1, dust: 2 };   // tornFrames>=1  VAGY  dustCleanedFrames>=2

  var STATE = {
    viewedFrames: new Set(),
    tornFrames: 0,
    dustCleanedFrames: 0,
    secretRoomUnlocked: false
  };

  var REDUCED = window.matchMedia &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* DOM */
  var roomsEl, secretEl, liveEl, toastEl, modalEl, filtersEl;
  var toastTimer = null;
  var lastFocused = null;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function pick(arr) {
    if (!arr || !arr.length) return "";
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /* ── FRAME MARKUP ─────────────────────────────────────────── */
  function frameMarkup(ex) {
    var hasImg = ex.image ? true : false;
    var artLayers = "";

    /* alap papír-placeholder (mindig ott van, a kép mögött) */
    artLayers +=
      '<div class="km-art-fallback" aria-hidden="true">' +
        '<span class="km-art-ph-label">Kép helye</span>' +
        '<span class="km-art-ph-cat">' + esc(ex.category) + '</span>' +
      '</div>';

    if (hasImg) {
      artLayers +=
        '<img class="km-art-img" src="' + esc(ex.image) + '" alt="' +
        esc(ex.title) + ' – kiállított szerződés (illusztráció)"' +
        ' onerror="this.remove()">';
    }

    /* átszakadó (tearable) rétegek */
    if (ex.tearable) {
      artLayers += '<div class="km-hidden-art" aria-hidden="true">';
      if (ex.hidden) {
        artLayers += '<img class="km-hidden-img" src="' + esc(ex.hidden) +
          '" alt="" onerror="this.remove()">';
      }
      artLayers +=
          '<i class="fas fa-folder-open"></i>' +
          '<span>A fal mögött találtunk még valamit.</span>' +
        '</div>' +
        '<div class="km-front" aria-hidden="true">' +
          '<div class="km-front-half km-front-l"><span class="km-front-mark">Régi kötvény</span></div>' +
          '<div class="km-front-half km-front-r"><span class="km-front-mark">Régi kötvény</span></div>' +
        '</div>' +
        '<div class="km-crack" aria-hidden="true"></div>';
    }

    /* poros (dusty) canvas réteg */
    if (ex.dusty) {
      artLayers += '<canvas class="km-dust" aria-hidden="true"></canvas>';
    }

    artLayers += '<span class="km-donttouch" aria-hidden="true">Ne nyúljon a kötvényhez</span>';

    var dustTag = ex.dusty
      ? '<span class="km-dust-tag"><i class="fas fa-wind"></i> Poros példány</span>'
      : "";

    var hint = ex.tearable
      ? "Tipp: kattintson rá többször."
      : (ex.dusty ? "Tipp: törölje le róla a port." : "Kattintson a részletekért.");

    return '' +
      '<div class="km-frame' + (ex.dusty ? " is-dusty" : "") + '"' +
        ' role="button" tabindex="0"' +
        ' data-id="' + esc(ex.id) + '"' +
        ' aria-label="' + esc(ex.title) + ' – ' + esc(ex.category) + '. ' + hint + '">' +
        '<div class="km-frame-art">' + artLayers + '</div>' +
        '<div class="km-plaque">' +
          '<div class="km-plaque-cat">' + esc(ex.category) + '</div>' +
          '<h3>' + esc(ex.title) + '</h3>' +
          '<div class="km-plaque-era"><i class="fas fa-hourglass-half"></i> ' + esc(ex.era) + '</div>' +
          '<p class="km-plaque-note">' + esc(ex.label) + '</p>' +
          dustTag +
          '<button type="button" class="km-frame-detail km-btn-ghost">Részletek</button>' +
        '</div>' +
      '</div>';
  }

  function exhibitById(id) {
    var all = [];
    ROOMS.forEach(function (r) { all = all.concat(r.exhibits); });
    if (SECRET) all = all.concat(SECRET.exhibits);
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }

  /* ── RENDER TERMEK ────────────────────────────────────────── */
  function renderRooms() {
    var html = "";
    ROOMS.forEach(function (room) {
      html +=
        '<section class="km-room" data-room="' + esc(room.id) + '">' +
          '<div class="km-room-head">' +
            '<span class="km-room-num">Terem ' + esc(room.num) + '</span>' +
            '<h2>' + esc(room.name) + '</h2>' +
          '</div>' +
          '<p class="km-room-intro">' + esc(room.intro) + '</p>' +
          '<div class="km-wall"><div class="km-frames">' +
            room.exhibits.map(frameMarkup).join("") +
          '</div></div>' +
        '</section>';
    });
    roomsEl.innerHTML = html;
    initFrames(roomsEl);
  }

  function renderSecret() {
    if (!SECRET) return;
    secretEl.innerHTML =
      '<div class="km-secret-inner">' +
        '<div class="km-secret-head">' +
          '<span class="km-secret-badge"><i class="fas fa-key"></i> Titkos terem</span>' +
          '<h2>' + esc(SECRET.name) + '</h2>' +
          '<p>' + esc(SECRET.subtitle) + '</p>' +
        '</div>' +
        '<div class="km-frames">' +
          SECRET.exhibits.map(frameMarkup).join("") +
        '</div>' +
      '</div>';
    initFrames(secretEl);
  }

  /* ── FRAME INTERAKCIÓK ───────────────────────────────────── */
  function initFrames(scope) {
    var frames = scope.querySelectorAll(".km-frame");
    Array.prototype.forEach.call(frames, function (frame) {
      var ex = exhibitById(frame.getAttribute("data-id"));
      if (!ex) return;

      /* "Részletek" gomb – mindig nyitja a modalt (a11y garancia) */
      var detailBtn = frame.querySelector(".km-frame-detail");
      if (detailBtn) {
        detailBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          openModal(ex);
        });
      }

      if (ex.dusty) setupDust(frame, ex);

      /* fő aktiválás (egér) */
      frame.addEventListener("click", function (e) {
        if (e.target.closest(".km-frame-detail")) return;
        if (frame._dragged) { frame._dragged = false; return; }
        if (ex.tearable && !frame._torn) { handleTear(frame, ex); return; }
        openModal(ex);
      });

      /* billentyűzet */
      frame.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
        if (e.target.closest(".km-frame-detail")) return;
        e.preventDefault();
        if (ex.tearable && !frame._torn) { handleTear(frame, ex); return; }
        if (ex.dusty && !frame._cleaned) { wipeDustFully(frame, ex); return; }
        openModal(ex);
      });
    });
  }

  /* ── ÁTSZAKADÁS (3 kattintás) ─────────────────────────────── */
  function handleTear(frame, ex) {
    frame._cc = (frame._cc || 0) + 1;
    if (frame._cc === 1) {
      frame.classList.add("cc1");
    } else if (frame._cc === 2) {
      frame.classList.remove("cc1");
      frame.classList.add("cc2");
    } else if (frame._cc >= 3) {
      frame.classList.remove("cc1", "cc2");
      frame.classList.add("is-torn");
      frame._torn = true;
      STATE.tornFrames++;
      announce("A " + ex.title + " kerete átszakadt. A rejtett dokumentum előbukkant.");
      curatorToast("Kurátori megjegyzés", pick(CURATOR.torn));
      checkSecret();
    }
  }

  /* ── PORLETÖRLÉS (canvas) ─────────────────────────────────── */
  function setupDust(frame, ex) {
    var canvas = frame.querySelector(".km-dust");
    var art = frame.querySelector(".km-frame-art");
    if (!canvas || !art) return;

    function size() {
      var w = art.clientWidth, h = art.clientHeight;
      if (!w || !h) return;
      canvas.width = w; canvas.height = h;
      paintDust(canvas);
    }
    requestAnimationFrame(size);
    window.addEventListener("resize", debounce(function () {
      if (!frame._cleaned) size();
    }, 250));

    if (REDUCED) {
      /* reduced motion: nincs húzás, kattintásra/Enterre eltűnik */
      canvas.style.cursor = "pointer";
      canvas.addEventListener("click", function (e) {
        e.stopPropagation();
        wipeDustFully(frame, ex);
      });
      return;
    }

    var drawing = false;
    var r = function () { return Math.max(14, canvas.width * 0.13); };

    function eraseAt(clientX, clientY) {
      var rect = canvas.getBoundingClientRect();
      var x = (clientX - rect.left) * (canvas.width / rect.width);
      var y = (clientY - rect.top) * (canvas.height / rect.height);
      var ctx = canvas.getContext("2d");
      ctx.globalCompositeOperation = "destination-out";
      var rad = r();
      var g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(.7, "rgba(0,0,0,.9)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }

    canvas.addEventListener("pointerdown", function (e) {
      if (frame._cleaned) return;
      e.stopPropagation();
      drawing = true;
      canvas.style.cursor = "grabbing";
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      eraseAt(e.clientX, e.clientY);
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!drawing || frame._cleaned) return;
      frame._dragged = true;
      eraseAt(e.clientX, e.clientY);
    });
    function endDraw(e) {
      if (!drawing) return;
      drawing = false;
      canvas.style.cursor = "grab";
      if (clearedRatio(canvas) >= 0.5) markCleaned(frame, ex, canvas);
    }
    canvas.addEventListener("pointerup", endDraw);
    canvas.addEventListener("pointercancel", endDraw);
    canvas.addEventListener("pointerleave", endDraw);
  }

  function paintDust(canvas) {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(196,184,158,0.86)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    /* finom, papíros szemcse */
    var dots = Math.floor((canvas.width * canvas.height) / 900);
    for (var i = 0; i < dots; i++) {
      var x = Math.random() * canvas.width;
      var y = Math.random() * canvas.height;
      var a = 0.04 + Math.random() * 0.10;
      ctx.fillStyle = Math.random() > 0.5
        ? "rgba(120,108,86," + a + ")"
        : "rgba(255,250,240," + a + ")";
      ctx.fillRect(x, y, 1.6, 1.6);
    }
  }

  function clearedRatio(canvas) {
    try {
      var ctx = canvas.getContext("2d");
      var w = canvas.width, h = canvas.height;
      if (!w || !h) return 0;
      var data = ctx.getImageData(0, 0, w, h).data;
      var total = 0, clear = 0;
      for (var i = 3; i < data.length; i += 40) { // minden ~10. pixel alfája
        total++;
        if (data[i] < 40) clear++;
      }
      return total ? clear / total : 0;
    } catch (err) { return 0; }
  }

  function wipeDustFully(frame, ex) {
    var canvas = frame.querySelector(".km-dust");
    if (!canvas || frame._cleaned) return;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    markCleaned(frame, ex, canvas);
  }

  function markCleaned(frame, ex, canvas) {
    if (frame._cleaned) return;
    frame._cleaned = true;
    canvas.classList.add("is-clean");
    STATE.dustCleanedFrames++;
    announce("A " + ex.title + " kerete letisztult.");
    curatorToast("Restaurátor", pick(CURATOR.dust));
    checkSecret();
  }

  /* ── TITKOS TEREM FELOLDÁS ────────────────────────────────── */
  function checkSecret() {
    if (STATE.secretRoomUnlocked) return;
    if (STATE.tornFrames >= UNLOCK.torn || STATE.dustCleanedFrames >= UNLOCK.dust) {
      STATE.secretRoomUnlocked = true;
      renderSecret();
      secretEl.hidden = false;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { secretEl.classList.add("is-open"); });
      });
      announce("Titkos terem feloldva: " + (SECRET ? SECRET.name : "") + ". " + CURATOR.secret);
      curatorToast("Kurátori megjegyzés", CURATOR.secret);
    }
  }

  /* ── MODAL (nagyított nézet) ──────────────────────────────── */
  function modalArt(ex) {
    var html = '<div class="km-art-fallback" aria-hidden="true">' +
        '<span class="km-art-ph-label">Kép helye</span>' +
        '<span class="km-art-ph-cat">' + esc(ex.category) + '</span>' +
      '</div>';
    if (ex.image) {
      html += '<img class="km-art-img" src="' + esc(ex.image) + '" alt="' +
        esc(ex.title) + ' – kiállított szerződés (illusztráció)" onerror="this.remove()">';
    }
    return html;
  }

  function openModal(ex) {
    STATE.viewedFrames.add(ex.id);
    lastFocused = document.activeElement;

    modalEl.innerHTML =
      '<div class="km-modal-card" role="dialog" aria-modal="true" aria-labelledby="kmModalTitle">' +
        '<div class="km-modal-art">' + modalArt(ex) + '</div>' +
        '<div class="km-modal-body">' +
          '<button type="button" class="km-modal-close" aria-label="Vissza a teremhez">' +
            '<i class="fas fa-times"></i></button>' +
          '<div class="km-modal-cat">' + esc(ex.category) + '</div>' +
          '<h2 id="kmModalTitle">' + esc(ex.title) + '</h2>' +
          '<span class="km-modal-era"><i class="fas fa-hourglass-half"></i> Kor: ' + esc(ex.era) + '</span>' +
          '<dl>' +
            section("Miért érdekes", ex.why) +
            section("Mire figyeljen az ügyfél", ex.watchOut) +
            section("Mit érdemes átnézni", ex.reviewNow) +
          '</dl>' +
          (ex.curator ? '<div class="km-modal-curator"><span>Kurátori megjegyzés</span>' + esc(ex.curator) + '</div>' : "") +
          (ex.lesson ? section("Mit tanulunk ebből?", ex.lesson, true) : "") +
          '<div class="km-modal-cta">' +
            '<a class="km-btn" href="/kapcsolat/">Átnézetem <i class="fas fa-arrow-right"></i></a>' +
          '</div>' +
        '</div>' +
      '</div>';

    modalEl.classList.add("is-open");
    document.body.style.overflow = "hidden";

    var closeBtn = modalEl.querySelector(".km-modal-close");
    closeBtn.addEventListener("click", closeModal);
    modalEl.addEventListener("mousedown", onBackdrop);
    document.addEventListener("keydown", onModalKey);
    closeBtn.focus();
  }

  function section(label, value, asDl) {
    if (!value) return "";
    return '<div class="km-modal-sec">' +
      '<dt>' + esc(label) + '</dt>' +
      '<dd>' + esc(value) + '</dd>' +
    '</div>';
  }

  function onBackdrop(e) { if (e.target === modalEl) closeModal(); }
  function onModalKey(e) {
    if (e.key === "Escape") { closeModal(); return; }
    if (e.key === "Tab") trapFocus(e);
  }
  function trapFocus(e) {
    var f = modalEl.querySelectorAll('a[href], button:not([disabled])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function closeModal() {
    modalEl.classList.remove("is-open");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onModalKey);
    modalEl.removeEventListener("mousedown", onBackdrop);
    setTimeout(function () { if (!modalEl.classList.contains("is-open")) modalEl.innerHTML = ""; }, 300);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  /* ── KURÁTORI TOAST + ARIA-LIVE ───────────────────────────── */
  function curatorToast(kicker, msg) {
    if (!toastEl || !msg) return;
    toastEl.innerHTML = '<span class="km-toast-k">' + esc(kicker) + '</span>' + esc(msg);
    toastEl.classList.add("is-show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-show"); }, 4200);
  }
  function announce(msg) { if (liveEl) liveEl.textContent = msg; }

  /* ── SZŰRŐK (termek szerint) ──────────────────────────────── */
  function buildFilters() {
    if (!filtersEl) return;
    var btns = '<button type="button" class="km-filter is-active" data-room="all">Minden terem</button>';
    ROOMS.forEach(function (r) {
      btns += '<button type="button" class="km-filter" data-room="' + esc(r.id) + '">' + esc(r.name) + '</button>';
    });
    filtersEl.innerHTML = btns;
    filtersEl.addEventListener("click", function (e) {
      var b = e.target.closest(".km-filter");
      if (!b) return;
      Array.prototype.forEach.call(filtersEl.querySelectorAll(".km-filter"), function (x) {
        x.classList.toggle("is-active", x === b);
      });
      var room = b.getAttribute("data-room");
      Array.prototype.forEach.call(roomsEl.querySelectorAll(".km-room"), function (sec) {
        sec.style.display = (room === "all" || sec.getAttribute("data-room") === room) ? "" : "none";
      });
    });
  }

  function debounce(fn, ms) {
    var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); };
  }

  /* ── INIT ─────────────────────────────────────────────────── */
  function init() {
    roomsEl   = document.getElementById("kmRooms");
    secretEl  = document.getElementById("kmSecret");
    liveEl    = document.getElementById("kmLive");
    toastEl   = document.getElementById("kmToast");
    modalEl   = document.getElementById("kmModal");
    filtersEl = document.getElementById("kmFilters");
    if (!roomsEl) return;

    var introEl = document.getElementById("kmIntroText");
    if (introEl && CURATOR.intro) introEl.textContent = CURATOR.intro;

    buildFilters();
    renderRooms();

    var enterBtn = document.getElementById("kmEnter");
    if (enterBtn) {
      enterBtn.addEventListener("click", function (e) {
        e.preventDefault();
        var first = document.getElementById("kmMuseum");
        if (first) first.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
        var f = roomsEl.querySelector(".km-frame");
        if (f) f.focus();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
