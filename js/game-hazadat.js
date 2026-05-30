/**
 * Védd a Házadat! – Mini játék + Alulbiztosítottság-kalkulátor v2
 * Adatforrás: KSH Stadat 4.6.3 (2024), TERC kiadói árjegyzék 2025
 * v2: Retina/HiDPI canvas, egér-követő mozgás, jobb HUD
 */
(function () {
  'use strict';

  var canvas = document.getElementById('hazadat-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  // ── Méret konstansok (logikai px-ben) ────────────────────────────────────
  var HOUSE_W = 70, HOUSE_H = 68, GROUND_H = 24;

  // ── Állapot ──────────────────────────────────────────────────────────────
  var state = 'idle'; // idle | playing | dead
  var score = 0, health = 100;
  var hazards = [], particles = [];
  var animId = null, lastTs = 0, spawnTimer = 0;
  var houseX = 0, houseVX = 0;

  // Egér pozíció (logikai canvas px)
  var mouseX = -1;
  var mouseOnCanvas = false;

  // Logikai canvas méretek (CSS px)
  var LW = 0, LH = 0;

  // ── Retina / HiDPI canvas ─────────────────────────────────────────────────
  function resize() {
    var col = canvas.closest('[class*="col-"]') || canvas.parentElement;
    LW = Math.min(960, col ? col.offsetWidth : 900);
    LH = Math.round(LW * 0.58);
    var dpr = window.devicePixelRatio || 1;
    canvas.width  = Math.round(LW * dpr);
    canvas.height = Math.round(LH * dpr);
    canvas.style.width  = LW + 'px';
    canvas.style.height = LH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    houseX = LW / 2 - HOUSE_W / 2;
    if (state === 'idle') drawIdle();
  }
  window.addEventListener('resize', resize);
  resize();

  // ── Billentyűzet ──────────────────────────────────────────────────────────
  var keys = {};
  document.addEventListener('keydown', function (e) {
    keys[e.key] = true;
    if (e.key === ' ' && state === 'idle') { hazadatStart(); return; }
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && state === 'playing') {
      e.preventDefault();
    }
  });
  document.addEventListener('keyup', function (e) { keys[e.key] = false; });

  // ── Egér / érintés – logikai px ───────────────────────────────────────────
  function toLogicalX(clientX) {
    var rect = canvas.getBoundingClientRect();
    return (clientX - rect.left) / rect.width * LW;
  }

  canvas.addEventListener('pointermove', function (e) {
    mouseX = toLogicalX(e.clientX);
    mouseOnCanvas = true;
  });
  canvas.addEventListener('pointerenter', function (e) {
    mouseX = toLogicalX(e.clientX);
    mouseOnCanvas = true;
  });
  canvas.addEventListener('pointerleave', function () {
    mouseOnCanvas = false;
  });

  // ── Veszélyek ─────────────────────────────────────────────────────────────
  var HAZARD_TYPES = [
    { e: '🌧️', dmg: 15, speed: 155, w: 52, h: 52 },
    { e: '⚡',  dmg: 28, speed: 295, w: 38, h: 54 },
    { e: '🔥', dmg: 22, speed: 140, w: 52, h: 52 },
    { e: '❄️', dmg: 12, speed: 115, w: 46, h: 46 },
    { e: '🌪️', dmg: 20, speed: 205, w: 52, h: 52 },
  ];

  function spawnHazard() {
    var t = HAZARD_TYPES[Math.floor(Math.random() * HAZARD_TYPES.length)];
    hazards.push({ e: t.e, dmg: t.dmg, speed: t.speed, w: t.w, h: t.h,
      x: Math.random() * (LW - t.w), y: -t.h });
  }

  // ── Fő hurok ──────────────────────────────────────────────────────────────
  function loop(ts) {
    var dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;
    update(dt);
    draw();
    if (state === 'playing') animId = requestAnimationFrame(loop);
  }

  function update(dt) {
    score += dt;
    spawnTimer += dt;
    var interval = Math.max(0.48, 1.65 - score * 0.032);
    if (spawnTimer >= interval) { spawnHazard(); spawnTimer = 0; }

    // Ház mozgása – egér-követő
    var MAX_SPEED = 320;
    var DEAD_ZONE = 20;
    if (keys['ArrowLeft']) {
      houseVX = -MAX_SPEED;
    } else if (keys['ArrowRight']) {
      houseVX = MAX_SPEED;
    } else if (mouseOnCanvas && mouseX >= 0) {
      var houseCX = houseX + HOUSE_W / 2;
      var dist    = mouseX - houseCX;
      if (Math.abs(dist) > DEAD_ZONE) {
        var sign   = dist > 0 ? 1 : -1;
        var factor = Math.min(1, (Math.abs(dist) - DEAD_ZONE) / 110);
        houseVX    = sign * MAX_SPEED * (0.3 + factor * 0.7);
      } else {
        houseVX *= 0.5;
      }
    } else {
      houseVX *= 0.72;
    }
    houseX = Math.max(0, Math.min(LW - HOUSE_W, houseX + houseVX * dt));

    // Ütközések
    var hy = LH - GROUND_H - HOUSE_H;
    for (var i = hazards.length - 1; i >= 0; i--) {
      var h = hazards[i];
      h.y += h.speed * dt;
      if (h.x < houseX + HOUSE_W - 10 && h.x + h.w - 10 > houseX &&
          h.y < hy + HOUSE_H - 8  && h.y + h.h - 8  > hy) {
        health = Math.max(0, health - h.dmg);
        emitParticles(houseX + HOUSE_W / 2, hy + HOUSE_H / 2);
        hazards.splice(i, 1);
        if (health <= 0) { gameOver(); return; }
        continue;
      }
      if (h.y > LH) hazards.splice(i, 1);
    }

    // Részecskék
    for (var j = particles.length - 1; j >= 0; j--) {
      var p = particles[j];
      p.x  += p.vx * dt * 60;
      p.y  += p.vy * dt * 60;
      p.vy += 0.22;
      p.life -= dt * 2.2;
      if (p.life <= 0) particles.splice(j, 1);
    }
  }

  function emitParticles(cx, cy) {
    for (var i = 0; i < 14; i++) {
      particles.push({
        x: cx, y: cy,
        vx: (Math.random() - 0.5) * 6,
        vy: -(Math.random() * 4.5 + 1.5),
        life: 1
      });
    }
  }

  // ── Rajzolás ──────────────────────────────────────────────────────────────
  // ── Rajzolás ──────────────────────────────────────────────────────────────
  function drawSky() {
    var sky = ctx.createLinearGradient(0, 0, 0, LH);
    sky.addColorStop(0,   '#5aadde');
    sky.addColorStop(0.6, '#87CEEB');
    sky.addColorStop(1,   '#c8eeff');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, LW, LH);
    // Nap
    ctx.save();
    ctx.shadowColor = 'rgba(255,220,50,0.55)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(LW - 52, 42, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Felhők
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    drawCloud(LW * 0.15, 28, 38);
    drawCloud(LW * 0.55, 18, 26);
    drawCloud(LW * 0.78, 36, 32);
    // Gyep
    ctx.fillStyle = '#4a7c2f';
    ctx.fillRect(0, LH - GROUND_H, LW, GROUND_H);
    ctx.fillStyle = '#5a9e38';
    ctx.fillRect(0, LH - GROUND_H, LW, 5);
  }

  function drawCloud(cx, cy, r) {
    ctx.beginPath();
    ctx.arc(cx,             cy,     r * 0.7,  0, Math.PI * 2);
    ctx.arc(cx + r,         cy + 4, r * 0.55, 0, Math.PI * 2);
    ctx.arc(cx - r * 0.6,  cy + 6, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawRoundedBar(x, y, w, h, r, color) {
    if (w <= 0) return;
    ctx.fillStyle = color;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r);
    } else {
      var rr = Math.min(r, w / 2, h / 2);
      ctx.moveTo(x + rr, y);
      ctx.lineTo(x + w - rr, y);
      ctx.arcTo(x + w, y,     x + w, y + rr,    rr);
      ctx.lineTo(x + w, y + h - rr);
      ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
      ctx.lineTo(x + rr, y + h);
      ctx.arcTo(x, y + h,     x, y + h - rr,    rr);
      ctx.lineTo(x, y + rr);
      ctx.arcTo(x, y,         x + rr, y,         rr);
      ctx.closePath();
    }
    ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, LW, LH);
    drawSky();

    // Egér célvonal (játék közben)
    if (mouseOnCanvas && state === 'playing') {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 7]);
      ctx.beginPath();
      ctx.moveTo(mouseX, 0);
      ctx.lineTo(mouseX, LH - GROUND_H);
      ctx.stroke();
      ctx.setLineDash([]);
      // Iránymutató nyíl a ház fölött
      var houseCX = houseX + HOUSE_W / 2;
      var dist    = mouseX - houseCX;
      if (Math.abs(dist) > 24) {
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.65;
        ctx.fillText(dist > 0 ? '→' : '←', houseCX + (dist > 0 ? 40 : -40), LH - GROUND_H - HOUSE_H / 2);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }

    // Ház
    var hy = LH - GROUND_H - HOUSE_H;
    ctx.font = HOUSE_H + 'px serif';
    ctx.textAlign = 'left';
    ctx.fillText('🏠', houseX, hy + HOUSE_H);

    // Veszélyek
    for (var i = 0; i < hazards.length; i++) {
      var h = hazards[i];
      ctx.font = Math.round(h.h * 0.88) + 'px serif';
      ctx.textAlign = 'left';
      ctx.fillText(h.e, h.x, h.y + h.h);
    }

    // Részecskék
    for (var j = 0; j < particles.length; j++) {
      var p = particles[j];
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = '#FF4500';
      ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
    }
    ctx.globalAlpha = 1;

    // HUD: életerő sáv
    var bW = Math.min(230, LW * 0.46), bH = 22, bX = LW / 2 - bW / 2, bY = 10;
    drawRoundedBar(bX, bY, bW, bH, 11, 'rgba(0,0,0,0.25)');
    var pct      = health / 100;
    var barColor = pct > 0.5 ? '#28a745' : pct > 0.25 ? '#ffc107' : '#dc3545';
    drawRoundedBar(bX + 2, bY + 2, Math.max(0, (bW - 4) * pct), bH - 4, 9, barColor);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur  = 4;
    ctx.fillStyle   = '#fff';
    ctx.font        = 'bold 11px Inter, system-ui, Arial, sans-serif';
    ctx.textAlign   = 'center';
    ctx.fillText('🛡 Fedezettség: ' + Math.round(health) + '%', LW / 2, bY + 15);

    // HUD: idő
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font      = 'bold 13px Inter, system-ui, Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('⏱ ' + Math.floor(score) + ' mp', LW - 10, 28);
    ctx.restore();

    // Irányítás tipp (első 5 mp, egér nincs a canvason)
    if (score < 5 && !mouseOnCanvas) {
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      ctx.font      = '11px Inter, system-ui, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('← mozgasd az egeret, vagy nyomd a nyíl billentyűket →', LW / 2, LH - GROUND_H - 8);
      ctx.restore();
    }
  }

  function drawIdle() {
    ctx.clearRect(0, 0, LW, LH);
    drawSky();
    ctx.font = HOUSE_H + 'px serif';
    ctx.textAlign = 'left';
    ctx.fillText('🏠', LW / 2 - HOUSE_W / 2, LH - GROUND_H);
    ctx.font = '40px serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡',  LW * 0.18, LH * 0.32);
    ctx.fillText('🌧️', LW * 0.50, LH * 0.18);
    ctx.fillText('🔥', LW * 0.82, LH * 0.34);
  }

  function gameOver() {
    state = 'dead';
    cancelAnimationFrame(animId);
    draw();
    var go = document.getElementById('hazadat-gameover');
    var sd = document.getElementById('hazadat-score-display');
    if (go) { go.classList.remove('d-none'); }
    if (sd) sd.textContent = Math.floor(score) + ' másodpercig állt ellen a ház';
  }

  // ── Publikus API ──────────────────────────────────────────────────────────
  window.hazadatStart = function () {
    var s = document.getElementById('hazadat-start');
    var g = document.getElementById('hazadat-gameover');
    var calc = document.getElementById('hazadat-calc');
    if (s) s.classList.add('d-none');
    if (g) g.classList.add('d-none');
    if (calc) calc.classList.add('d-none');
    state = 'playing';
    score = 0; health = 100;
    hazards = []; particles = [];
    spawnTimer = 0; houseVX = 0;
    mouseX = -1; mouseOnCanvas = false;
    houseX = LW / 2 - HOUSE_W / 2;
    lastTs = performance.now();
    animId = requestAnimationFrame(loop);
  };

  window.hazadatRestart = function () {
    window.hazadatStart();
  };

  window.hazadatShowCalc = function () {
    var go   = document.getElementById('hazadat-gameover');
    var calc = document.getElementById('hazadat-calc');
    if (go) go.classList.add('d-none');
    if (calc) {
      calc.classList.remove('d-none');
      setTimeout(function () {
        calc.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  };

  // ── Kalkulátor ─────────────────────────────────────────────────────────────
  /**
   * Fajlagos újjáépítési értékek (Ft/m²), 2025 árak:
   *   Panel:              390 000 – KSH panel lakás felújítási költség + MNB becslések
   *   Tégla egyszerű:     460 000 – KSH Stadat 4.6.3 alsó sáv
   *   Tégla közepes:      540 000 – KSH Stadat 4.6.3 átlag (~490k) + TERC 2025 infláció
   *   Tégla jó minőség:   640 000 – TERC 2025 prémium sáv
   *   Könnyűszerkezetes:  430 000 – TERC 2025 / Ácsmester adatok
   *   Prémium/egyedi:     780 000 – TERC 2025 egyedi tervezés
   */
  window.hazadatCalc = function () {
    var meret   = parseFloat(document.getElementById('hc-meret').value);
    var tipus   = parseFloat(document.getElementById('hc-tipus').value);
    var kotvenyM = parseFloat(document.getElementById('hc-kotveny').value);

    if (!meret || meret < 20 || meret > 1500 || !tipus) {
      document.getElementById('hc-meret').focus();
      return;
    }

    var ujjaepites  = meret * tipus;
    var ujjaM       = (ujjaepites / 1e6).toFixed(1);
    var fajlagos    = Math.round(tipus / 1000);

    var resultEl = document.getElementById('hc-result');
    var boxesEl  = document.getElementById('hc-result-boxes');
    var verdictEl = document.getElementById('hc-verdict');

    boxesEl.innerHTML =
      '<div class="col-sm-4"><div class="border rounded-3 p-3"><div class="text-muted small mb-1">Alapterület</div>' +
      '<div class="fw-bold fs-5">' + meret + ' m²</div></div></div>' +
      '<div class="col-sm-4"><div class="border rounded-3 p-3"><div class="text-muted small mb-1">Fajlagos ktg.</div>' +
      '<div class="fw-bold fs-5">' + fajlagos + ' eFt/m²</div></div></div>' +
      '<div class="col-sm-4"><div class="border rounded-3 p-3" style="background:rgba(255,167,38,.1)">' +
      '<div class="text-muted small mb-1">Becsült újjáépítési érték</div>' +
      '<div class="fw-bold fs-5" style="color:var(--primary)">' + ujjaM + ' M Ft</div></div></div>';

    if (!isNaN(kotvenyM) && kotvenyM > 0) {
      var kotvenyFt = kotvenyM * 1e6;
      var arany     = kotvenyFt / ujjaepites;
      var hianyM    = ((ujjaepites - kotvenyFt) / 1e6).toFixed(1);
      var szazalek  = Math.round((1 - arany) * 100);

      if (arany >= 0.95) {
        verdictEl.className = 'alert alert-success rounded-3 p-3 mb-3';
        verdictEl.innerHTML = '<i class="fa fa-check-circle me-2"></i><strong>Rendben van!</strong> A kötvény értéke közel van a becsült újjáépítési értékhez. Érdemes évente felülvizsgálni az árak emelkedése miatt.';
      } else if (arany >= 0.75) {
        verdictEl.className = 'alert alert-warning rounded-3 p-3 mb-3';
        verdictEl.innerHTML = '<i class="fa fa-exclamation-triangle me-2"></i><strong>Enyhe alulbiztosítottság.</strong> A kötvény kb. <strong>' + hianyM + ' M Ft-tal</strong> marad el a becsült értéktől. Teljes kárná arányosan kevesebbet kapna vissza.';
      } else {
        verdictEl.className = 'alert alert-danger rounded-3 p-3 mb-3';
        verdictEl.innerHTML = '<i class="fa fa-times-circle me-2"></i><strong>Komoly alulbiztosítottság!</strong> A kötvény értéke ~<strong>' + szazalek + '%-kal</strong> alacsonyabb a becsült újjáépítési értéknél (<strong>' + hianyM + ' M Ft különbség</strong>). Nagy kárná a biztosító arányosan kevesebbet fizet.';
      }
    } else {
      verdictEl.className = 'alert alert-info rounded-3 p-3 mb-3';
      verdictEl.innerHTML = '<i class="fa fa-info-circle me-2"></i>A becsült újjáépítési érték <strong>' + ujjaM + ' M Ft</strong>. Hasonlítsa össze a kötvényén szereplő biztosítási összeggel – ha alacsonyabb, érdemes felülvizsgálni.';
    }

    resultEl.hidden = false;
    setTimeout(function () {
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
  };

  // Enter a kalkulátor inputokon
  ['hc-meret','hc-tipus','hc-kotveny'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') hazadatCalc();
    });
  });

})();


// Button bindings (moved from HTML onclick attributes)
(function () {
  function bind(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener('click', fn); }
  bind('hazadat-start-btn', window.hazadatStart);
  bind('hazadat-restart-btn', window.hazadatRestart);
  bind('hazadat-show-calc-btn', window.hazadatShowCalc);
  bind('hazadat-calc-btn', window.hazadatCalc);
}());