/**
 * Vetés Döntés – Mezőgazdasági biztosítási döntési játék
 * Mechanika: 4×3 grid, klikkeléssel biztosítsd a közelgő káreset előtt a mezőt
 * 3 szezon, növekvő nehézség, korlátozott biztosítási keret
 */
(function () {
  'use strict';

  var canvas = document.getElementById('vetesdont-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  // ── Konstansok ─────────────────────────────────────────────────────────────
  var COLS = 4, ROWS = 3;
  var CELL_PAD = 8;

  var HAZARD_TYPES = [
    { id: 'jeg',    icon: '🧊', label: 'Jégkár',  r: 100, g: 181, b: 246 },
    { id: 'aszaly', icon: '☀️', label: 'Aszály',  r: 255, g: 213, b: 79  },
    { id: 'fagy',   icon: '❄️', label: 'Fagykár', r: 179, g: 229, b: 252 },
    { id: 'vihar',  icon: '⛈️', label: 'Vihar',   r: 189, g: 189, b: 189 },
  ];

  var SEASONS = [
    { name: 'Tavasz', budget: 5, count: 4, interval: 3800, speed: 0.17 },
    { name: 'Nyár',   budget: 4, count: 5, interval: 3200, speed: 0.22 },
    { name: 'Ősz',    budget: 4, count: 6, interval: 2600, speed: 0.28 },
  ];

  var HUD_H = 68;
  var BOTTOM_H = 34;

  // ── Állapot ────────────────────────────────────────────────────────────────
  var state = 'idle'; // idle | playing | seasonEnd | gameover | win
  var score = 0, health = 100;
  var budget = 0;
  var seasonIdx = 0;
  var insured = [];   // insured[row][col] = bool
  var hazards = [];   // { col, row, progress, htype }
  var effects = [];   // { x, y, text, color, alpha, vy }
  var flashes = [];   // { col, row, r, g, b, alpha }
  var spawnTimer = 0;
  var hazardsSpawned = 0, hazardsResolved = 0;
  var animId = null, lastTs = 0;

  // ── Layout ─────────────────────────────────────────────────────────────────
  var LW = 0, LH = 0;
  var cellW = 0, cellH = 0;
  var gridX = 0, gridY = 0;

  function resize() {
    var col = canvas.closest('[class*="col-"]') || canvas.parentElement;
    LW = Math.min(920, col ? col.offsetWidth : 860);
    LH = Math.round(LW * 0.60);
    var dpr = window.devicePixelRatio || 1;
    canvas.width  = Math.round(LW * dpr);
    canvas.height = Math.round(LH * dpr);
    canvas.style.width  = LW + 'px';
    canvas.style.height = LH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var pad = 14;
    gridX = pad;
    gridY = HUD_H + 8;
    var gridW = LW - pad * 2;
    var gridH = LH - gridY - BOTTOM_H - 8;
    cellW = gridW / COLS;
    cellH = gridH / ROWS;
    if (state === 'idle') drawIdle();
  }

  window.addEventListener('resize', resize);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function cellRect(c, r) {
    return {
      x: gridX + c * cellW + CELL_PAD,
      y: gridY + r * cellH + CELL_PAD,
      w: cellW - CELL_PAD * 2,
      h: cellH - CELL_PAD * 2,
    };
  }

  function resetInsured() {
    insured = [];
    for (var r = 0; r < ROWS; r++) {
      insured[r] = [];
      for (var c = 0; c < COLS; c++) insured[r][c] = false;
    }
  }

  function rr(x, y, w, h, rad) {
    rad = Math.min(rad, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
  }

  // ── Draw: HUD ──────────────────────────────────────────────────────────────
  function drawHUD() {
    ctx.fillStyle = '#142b14';
    ctx.fillRect(0, 0, LW, HUD_H);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(0, HUD_H - 2, LW, 2);

    var s = SEASONS[seasonIdx];
    var fsSm = Math.round(LW * 0.018);
    var fsMd = Math.round(LW * 0.022);

    // Szezon neve (bal)
    ctx.font = 'bold ' + fsMd + 'px sans-serif';
    ctx.fillStyle = '#81C784';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.name + '  –  ' + (seasonIdx + 1) + '. szezon / 3', 16, HUD_H * 0.36);

    // Keret info (bal, kisebb sor)
    ctx.font = fsSm + 'px sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Biztosítási keret: ' + budget + ' db  ·  Kattints a mezőre', 16, HUD_H * 0.70);

    // Pont (közép)
    ctx.font = 'bold ' + Math.round(LW * 0.026) + 'px sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.fillText(score + ' pont', LW / 2, HUD_H * 0.36);

    // Káreset számláló (közép, kisebb)
    ctx.font = fsSm + 'px sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText(hazardsResolved + ' / ' + s.count + ' káreset', LW / 2, HUD_H * 0.70);

    // HP sáv (jobb)
    var barW = Math.round(LW * 0.16);
    var barH = 9;
    var barX = LW - barW - 16;
    var barMidY = HUD_H * 0.55;
    ctx.fillStyle = '#0d1f0d';
    rr(barX, barMidY - barH / 2, barW, barH, 4);
    ctx.fill();
    var hpFrac = health / 100;
    var hpColor = health > 60 ? '#66BB6A' : health > 30 ? '#FFA726' : '#EF5350';
    ctx.fillStyle = hpColor;
    rr(barX, barMidY - barH / 2, barW * hpFrac, barH, 4);
    ctx.fill();

    ctx.font = 'bold ' + fsSm + 'px sans-serif';
    ctx.fillStyle = hpColor;
    ctx.textAlign = 'right';
    ctx.fillText('❤️  ' + health + '%', LW - 16, HUD_H * 0.28);
  }

  // ── Draw: egy mező ─────────────────────────────────────────────────────────
  function drawCell(c, r) {
    var rect = cellRect(c, r);
    var isEven = (c + r) % 2 === 0;

    // Alap
    ctx.fillStyle = isEven ? '#1e4a10' : '#183d0d';
    rr(rect.x, rect.y, rect.w, rect.h, 7);
    ctx.fill();

    // Barázdák
    ctx.strokeStyle = isEven ? '#2a6314' : '#245610';
    ctx.lineWidth = 1;
    for (var i = 1; i <= 3; i++) {
      var lx = rect.x + (rect.w / 4) * i;
      ctx.beginPath();
      ctx.moveTo(lx, rect.y + 5);
      ctx.lineTo(lx, rect.y + rect.h - 5);
      ctx.stroke();
    }

    // Kultúra
    var cropSz = Math.round(Math.min(rect.w, rect.h) * 0.34);
    ctx.font = cropSz + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌾', rect.x + rect.w / 2, rect.y + rect.h / 2);

    // Biztosított overlay
    if (insured[r] && insured[r][c]) {
      ctx.fillStyle = 'rgba(80,200,80,0.22)';
      rr(rect.x, rect.y, rect.w, rect.h, 7);
      ctx.fill();

      ctx.font = Math.round(Math.min(rect.w, rect.h) * 0.40) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.88;
      ctx.fillText('🛡️', rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.globalAlpha = 1;

      ctx.strokeStyle = '#66BB6A';
      ctx.lineWidth = 2.5;
      rr(rect.x, rect.y, rect.w, rect.h, 7);
      ctx.stroke();
    }
  }

  // ── Draw: flash overlay-ek (a grid fölé) ──────────────────────────────────
  function drawFlashes() {
    for (var fi = 0; fi < flashes.length; fi++) {
      var fc = flashes[fi];
      if (fc.alpha <= 0) continue;
      var rect = cellRect(fc.col, fc.row);
      ctx.fillStyle = 'rgba(' + fc.r + ',' + fc.g + ',' + fc.b + ',' + fc.alpha + ')';
      rr(rect.x, rect.y, rect.w, rect.h, 7);
      ctx.fill();
    }
  }

  // ── Draw: közelgő veszélyek ────────────────────────────────────────────────
  function drawHazards(now) {
    for (var i = 0; i < hazards.length; i++) {
      var h = hazards[i];
      var rect = cellRect(h.col, h.row);
      var cx = rect.x + rect.w / 2;
      var p = h.progress;

      // Countdown sáv (a mező teteje felett)
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(rect.x, rect.y - 9, rect.w, 5);
      var gr = Math.round(Math.min(255, p * 2 * 255));
      var gg = Math.round(Math.max(0, (1 - p) * 255));
      ctx.fillStyle = 'rgb(' + gr + ',' + gg + ',0)';
      ctx.fillRect(rect.x, rect.y - 9, rect.w * p, 5);

      // Ikon a mező fölé ereszkedik
      var iconY = rect.y - 28 + p * 42;
      var pulse = 1 + 0.14 * Math.sin(now / 240);
      var iconSz = Math.round(Math.min(rect.w, rect.h) * 0.48 * pulse);
      ctx.font = iconSz + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.45 + p * 0.55;
      ctx.fillText(h.htype.icon, cx, iconY);
      ctx.globalAlpha = 1;

      // Figyelmeztető keret a mezőn
      var borderA = 0.35 + 0.45 * Math.sin(now / 170);
      ctx.strokeStyle = 'rgba(255,' + Math.round(120 - p * 120) + ',0,' + borderA + ')';
      ctx.lineWidth = 3;
      rr(rect.x, rect.y, rect.w, rect.h, 7);
      ctx.stroke();
    }
  }

  // ── Draw: lebegő szöveg effektek ───────────────────────────────────────────
  function drawEffects() {
    for (var i = 0; i < effects.length; i++) {
      var e = effects[i];
      if (e.alpha <= 0) continue;
      ctx.globalAlpha = e.alpha;
      ctx.font = 'bold ' + Math.round(LW * 0.023) + 'px sans-serif';
      ctx.fillStyle = e.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.text, e.x, e.y);
    }
    ctx.globalAlpha = 1;
  }

  // ── Draw: gomb ─────────────────────────────────────────────────────────────
  function drawBtn(cx, cy, label, bg, fg, bw) {
    bw = bw || Math.round(LW * 0.24);
    var bh = 44;
    ctx.fillStyle = bg;
    rr(cx - bw / 2, cy - bh / 2, bw, bh, 9);
    ctx.fill();
    ctx.font = 'bold ' + Math.round(LW * 0.021) + 'px sans-serif';
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, cx, cy);
  }

  // ── Draw: idle képernyő ────────────────────────────────────────────────────
  function drawIdle() {
    ctx.fillStyle = '#0f2010';
    ctx.fillRect(0, 0, LW, LH);

    ctx.globalAlpha = 0.30;
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) drawCell(c, r);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(0,8,0,0.75)';
    ctx.fillRect(0, 0, LW, LH);

    ctx.font = 'bold ' + Math.round(LW * 0.046) + 'px sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌾  Vetés Döntés', LW / 2, LH * 0.26);

    ctx.font = Math.round(LW * 0.022) + 'px sans-serif';
    ctx.fillStyle = '#ccc';
    ctx.fillText('Melyik mezőt biztosítod be?', LW / 2, LH * 0.40);

    ctx.font = Math.round(LW * 0.017) + 'px sans-serif';
    ctx.fillStyle = '#999';
    ctx.fillText('Időjárási veszélyek közelednek. Korlátozott keretből döntsd el, melyiket véded.', LW / 2, LH * 0.52);
    ctx.fillText('Fedetlen mező találat: –20% egészség. 3 szezon, növekvő nehézség.', LW / 2, LH * 0.61);

    drawBtn(LW / 2, LH * 0.78, '▶  JÁTÉK INDÍTÁSA', '#2E7D32', '#fff');
  }

  // ── Draw: szezon vége overlay ──────────────────────────────────────────────
  function drawSeasonEnd() {
    ctx.fillStyle = 'rgba(0,8,0,0.78)';
    ctx.fillRect(0, 0, LW, LH);

    var isLast = seasonIdx >= SEASONS.length - 1;
    ctx.font = 'bold ' + Math.round(LW * 0.038) + 'px sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isLast ? '🏁  Év lezárva!' : SEASONS[seasonIdx].name + ' vége', LW / 2, LH * 0.30);

    ctx.font = Math.round(LW * 0.022) + 'px sans-serif';
    ctx.fillStyle = '#ccc';
    ctx.fillText('Pont eddig: ' + score + '  ·  Egészség: ' + health + '%', LW / 2, LH * 0.44);

    drawBtn(LW / 2, LH * 0.66, isLast ? 'Eredmény  ▶' : 'Következő szezon  ▶', '#1565C0', '#fff');
  }

  // ── Draw: befejező képernyő ────────────────────────────────────────────────
  function drawEnd(won) {
    ctx.fillStyle = won ? 'rgba(0,20,0,0.88)' : 'rgba(25,0,0,0.88)';
    ctx.fillRect(0, 0, LW, LH);

    ctx.font = 'bold ' + Math.round(LW * 0.044) + 'px sans-serif';
    ctx.fillStyle = won ? '#FFD700' : '#EF5350';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(won ? '🏆  Sikeres gazdálkodási év!' : '💸  Csőd!', LW / 2, LH * 0.24);

    ctx.font = Math.round(LW * 0.025) + 'px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('Végeredmény: ' + score + ' pont', LW / 2, LH * 0.38);

    ctx.font = Math.round(LW * 0.018) + 'px sans-serif';
    ctx.fillStyle = '#aaa';
    var msg = won
      ? 'Ügyesen döntöttél a kockázatok között. A valódi mezőgazdasági biztosításnál mi segítünk.'
      : 'A fedetlen kockázat drága. Kérjen összehasonlítást – nekünk nem kerül semmibe.';
    ctx.fillText(msg, LW / 2, LH * 0.50);

    var gap = Math.round(LW * 0.27);
    drawBtn(LW / 2 - gap / 2, LH * 0.70, '🔄  Újra', '#37474F', '#fff', Math.round(LW * 0.22));
    drawBtn(LW / 2 + gap / 2, LH * 0.70, 'Ajánlatkérés →', '#2E7D32', '#fff', Math.round(LW * 0.27));
  }

  // ── Fő rajzolás ────────────────────────────────────────────────────────────
  function draw(now) {
    now = now || performance.now();
    ctx.clearRect(0, 0, LW, LH);
    ctx.fillStyle = '#0f2010';
    ctx.fillRect(0, 0, LW, LH);

    if (state === 'playing' || state === 'seasonEnd') {
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) drawCell(c, r);
      }
      drawFlashes();
      if (state === 'playing') {
        drawHazards(now);
        drawHUD();
        drawEffects();
      } else {
        drawSeasonEnd();
      }
    } else if (state === 'gameover') {
      drawEnd(false);
    } else if (state === 'win') {
      drawEnd(true);
    } else {
      drawIdle();
    }
  }

  // ── Játék logika ────────────────────────────────────────────────────────────
  function startGame() {
    score = 0; health = 100; seasonIdx = 0;
    startSeason();
  }

  function startSeason() {
    var s = SEASONS[seasonIdx];
    budget = s.budget;
    hazards = []; effects = []; flashes = [];
    spawnTimer = 0; hazardsSpawned = 0; hazardsResolved = 0;
    resetInsured();
    state = 'playing';
    spawnHazard();
    lastTs = performance.now();
    if (!animId) animId = requestAnimationFrame(loop);
  }

  function spawnHazard() {
    var s = SEASONS[seasonIdx];
    if (hazardsSpawned >= s.count) return;

    // Szabad mezők (amelyeken nincs már aktív veszély)
    var free = [];
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var busy = false;
        for (var i = 0; i < hazards.length; i++) {
          if (hazards[i].col === c && hazards[i].row === r) { busy = true; break; }
        }
        if (!busy) free.push({ c: c, r: r });
      }
    }
    if (free.length === 0) return;

    var cell = free[Math.floor(Math.random() * free.length)];
    var htype = HAZARD_TYPES[Math.floor(Math.random() * HAZARD_TYPES.length)];
    hazards.push({ col: cell.c, row: cell.r, progress: 0, htype: htype });
    hazardsSpawned++;
  }

  function loop(ts) {
    if (state !== 'playing') { animId = null; return; }

    var dt = Math.min((ts - lastTs) / 1000, 0.10);
    lastTs = ts;
    var s = SEASONS[seasonIdx];

    // Spawn időzítő
    spawnTimer += dt * 1000;
    if (spawnTimer >= s.interval && hazardsSpawned < s.count) {
      spawnHazard();
      spawnTimer = 0;
    }

    // Veszélyek frissítése
    for (var i = hazards.length - 1; i >= 0; i--) {
      hazards[i].progress += s.speed * dt;
      if (hazards[i].progress >= 1) {
        resolveHazard(i);
        if (state !== 'playing') { draw(ts); animId = null; return; }
      }
    }

    // Effektek fade-out
    for (var j = effects.length - 1; j >= 0; j--) {
      effects[j].y  += effects[j].vy * dt;
      effects[j].alpha -= 1.8 * dt;
      if (effects[j].alpha <= 0) effects.splice(j, 1);
    }

    // Flash fade-out
    for (var k = flashes.length - 1; k >= 0; k--) {
      flashes[k].alpha -= 4.5 * dt;
      if (flashes[k].alpha <= 0) flashes.splice(k, 1);
    }

    // Szezon vége?
    if (hazardsResolved >= s.count && hazards.length === 0) {
      endSeason(); return;
    }

    draw(ts);
    animId = requestAnimationFrame(loop);
  }

  function resolveHazard(idx) {
    var h = hazards[idx];
    var rect = cellRect(h.col, h.row);
    var cx = rect.x + rect.w / 2;
    var cy = rect.y + rect.h / 2 - 10;

    if (insured[h.row][h.col]) {
      score += 15;
      effects.push({ x: cx, y: cy, text: '+15 ✓', color: '#66BB6A', alpha: 1, vy: -58 });
      flashes.push({ col: h.col, row: h.row, r: 80, g: 220, b: 80, alpha: 0.75 });
      insured[h.row][h.col] = false;
    } else {
      health = Math.max(0, health - 20);
      effects.push({ x: cx, y: cy, text: '–20% 💸', color: '#EF5350', alpha: 1, vy: -58 });
      flashes.push({ col: h.col, row: h.row, r: 255, g: 50, b: 50, alpha: 0.80 });
    }

    hazards.splice(idx, 1);
    hazardsResolved++;
    if (health <= 0) endGame(false);
  }

  function endSeason() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    state = 'seasonEnd';
    draw();
  }

  function endGame(won) {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    state = won ? 'win' : 'gameover';
    draw();
  }

  // ── Interakció ─────────────────────────────────────────────────────────────
  function handleClick(lx, ly) {
    if (state === 'idle') { startGame(); return; }

    if (state === 'seasonEnd') {
      var bcy = LH * 0.66, bh = 44, bw = Math.round(LW * 0.24);
      if (ly >= bcy - bh / 2 && ly <= bcy + bh / 2 &&
          lx >= LW / 2 - bw / 2 && lx <= LW / 2 + bw / 2) {
        if (seasonIdx >= SEASONS.length - 1) {
          endGame(health > 0);
        } else {
          seasonIdx++;
          startSeason();
        }
      }
      return;
    }

    if (state === 'gameover' || state === 'win') {
      var bcy2 = LH * 0.70, bh2 = 44;
      var gap = Math.round(LW * 0.27);
      var w1 = Math.round(LW * 0.22);
      var w2 = Math.round(LW * 0.27);
      if (ly >= bcy2 - bh2 / 2 && ly <= bcy2 + bh2 / 2) {
        var cx1 = LW / 2 - gap / 2, cx2 = LW / 2 + gap / 2;
        if (lx >= cx1 - w1 / 2 && lx <= cx1 + w1 / 2) { startGame(); return; }
        if (lx >= cx2 - w2 / 2 && lx <= cx2 + w2 / 2) {
          window.location.href = '/mezogazdasagi-biztositas-ajanlatkeres';
        }
      }
      return;
    }

    if (state === 'playing') {
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          var rect = cellRect(c, r);
          if (lx >= rect.x && lx <= rect.x + rect.w &&
              ly >= rect.y && ly <= rect.y + rect.h) {
            toggleInsure(c, r); return;
          }
        }
      }
    }
  }

  function toggleInsure(c, r) {
    if (insured[r][c]) {
      insured[r][c] = false;
      budget++;
    } else {
      if (budget <= 0) {
        var rect = cellRect(c, r);
        effects.push({
          x: rect.x + rect.w / 2, y: rect.y + rect.h / 2,
          text: 'Nincs keret!', color: '#FFA726', alpha: 1, vy: -44
        });
        return;
      }
      insured[r][c] = true;
      budget--;
    }
  }

  function toLogical(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (LW / rect.width),
      y: (clientY - rect.top)  * (LH / rect.height),
    };
  }

  canvas.addEventListener('click', function (e) {
    var p = toLogical(e.clientX, e.clientY);
    handleClick(p.x, p.y);
  });

  canvas.addEventListener('touchend', function (e) {
    e.preventDefault();
    var t = e.changedTouches[0];
    var p = toLogical(t.clientX, t.clientY);
    handleClick(p.x, p.y);
  }, { passive: false });

  // ── Init ───────────────────────────────────────────────────────────────────
  resize();
})();
