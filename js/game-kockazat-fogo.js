/**
 * Kockázat Fogó – Életbiztosítás mini játék v1
 * Fogd meg az életbiztosítás által fedezett kockázatokat (☠️ 😷 🤕 🦽 🏥)
 * Kerüld a csapdákat (💣 ❌) amelyeket az életbiztosítás NEM fed le!
 * Séma: game-hazadat.js alapján, canvas + overlay overlay-ek
 */
(function () {
  'use strict';

  var canvas = document.getElementById('kockazat-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  // ── Méret konstansok ────────────────────────────────────────────────────────
  var SHIELD_W = 60, SHIELD_H = 52;
  var GROUND_H = 22;

  // ── Logikai canvas méret ────────────────────────────────────────────────────
  var LW = 0, LH = 0;

  // ── Állapot ─────────────────────────────────────────────────────────────────
  var state     = 'idle'; // idle | playing | dead
  var score     = 0;
  var health    = 100;
  var gameTime  = 0;
  var items     = [];
  var particles = [];
  var animId    = null;
  var lastTs    = 0;
  var spawnTimer = 0;

  var shieldX  = 0;
  var shieldVX = 0;
  var mouseX   = -1;
  var mouseOnCanvas = false;
  var keys = {};

  // ── Elemtípusok ─────────────────────────────────────────────────────────────
  // Catch = életbiztosítás fedezi (zöld pont)
  var CATCH_ITEMS = [
    { e: '☠️', label: 'Haláleset',   pts: 20, w: 44, h: 44, spd: 155 },
    { e: '😷', label: 'Betegség',    pts: 15, w: 44, h: 44, spd: 140 },
    { e: '🤕', label: 'Baleset',     pts: 18, w: 44, h: 44, spd: 168 },
    { e: '🦽', label: 'Rokkantság',  pts: 20, w: 44, h: 44, spd: 138 },
    { e: '🏥', label: 'Kórházi',     pts: 15, w: 44, h: 44, spd: 152 },
  ];
  // Avoid = NEM fedett, csapda (piros ütés)
  var AVOID_ITEMS = [
    { e: '💣', label: 'Csapda!',   dmg: 30, w: 42, h: 42, spd: 205 },
    { e: '❌', label: 'Nem fedett', dmg: 22, w: 38, h: 38, spd: 190 },
  ];

  // ── Canvas resize ────────────────────────────────────────────────────────────
  function resize() {
    var col = canvas.closest('[class*="col-"]') || canvas.parentElement;
    LW = Math.min(900, col ? col.offsetWidth : 800);
    LH = Math.round(LW * 0.56);
    var dpr = window.devicePixelRatio || 1;
    canvas.width  = Math.round(LW * dpr);
    canvas.height = Math.round(LH * dpr);
    canvas.style.width  = LW + 'px';
    canvas.style.height = LH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    shieldX = LW / 2 - SHIELD_W / 2;
    if (state === 'idle') drawIdle();
  }
  window.addEventListener('resize', resize);
  resize();

  // ── Input: billentyűzet ──────────────────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    keys[e.key] = true;
    if (e.key === ' ' && state === 'idle') { kockazatStart(); return; }
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && state === 'playing') {
      e.preventDefault();
    }
  });
  document.addEventListener('keyup', function (e) { keys[e.key] = false; });

  // ── Input: egér / érintés ────────────────────────────────────────────────────
  function toLogicalX(clientX) {
    var rect = canvas.getBoundingClientRect();
    return (clientX - rect.left) / rect.width * LW;
  }
  canvas.addEventListener('pointermove',  function (e) { mouseX = toLogicalX(e.clientX); mouseOnCanvas = true; });
  canvas.addEventListener('pointerenter', function (e) { mouseX = toLogicalX(e.clientX); mouseOnCanvas = true; });
  canvas.addEventListener('pointerleave', function ()  { mouseOnCanvas = false; });

  // ── Spawn ────────────────────────────────────────────────────────────────────
  function spawnItem() {
    var isCatch = Math.random() < 0.65; // 65% fedezett, 35% csapda
    var pool = isCatch ? CATCH_ITEMS : AVOID_ITEMS;
    var t    = pool[Math.floor(Math.random() * pool.length)];
    items.push({
      e: t.e, label: t.label,
      pts: t.pts || 0, dmg: t.dmg || 0,
      w: t.w, h: t.h, spd: t.spd + gameTime * 1.8,
      isCatch: isCatch,
      x: Math.random() * (LW - t.w), y: -t.h
    });
  }

  // ── Főhurok ──────────────────────────────────────────────────────────────────
  function loop(ts) {
    var dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;
    update(dt);
    draw();
    if (state === 'playing') animId = requestAnimationFrame(loop);
  }

  function update(dt) {
    gameTime += dt;
    spawnTimer += dt;
    var interval = Math.max(0.42, 1.5 - gameTime * 0.022);
    if (spawnTimer >= interval) { spawnItem(); spawnTimer = 0; }

    // Pajzs mozgása
    var MAX_SPEED = 340;
    var DEAD_ZONE = 18;
    if (keys['ArrowLeft']) {
      shieldVX = -MAX_SPEED;
    } else if (keys['ArrowRight']) {
      shieldVX = MAX_SPEED;
    } else if (mouseOnCanvas && mouseX >= 0) {
      var cx   = shieldX + SHIELD_W / 2;
      var dist = mouseX - cx;
      if (Math.abs(dist) > DEAD_ZONE) {
        var sign   = dist > 0 ? 1 : -1;
        var factor = Math.min(1, (Math.abs(dist) - DEAD_ZONE) / 100);
        shieldVX   = sign * MAX_SPEED * (0.3 + factor * 0.7);
      } else {
        shieldVX *= 0.5;
      }
    } else {
      shieldVX *= 0.72;
    }
    shieldX = Math.max(0, Math.min(LW - SHIELD_W, shieldX + shieldVX * dt));

    // Ütközések
    var sy = LH - GROUND_H - SHIELD_H;
    for (var i = items.length - 1; i >= 0; i--) {
      var item = items[i];
      item.y += item.spd * dt;
      var hit = item.x         < shieldX + SHIELD_W - 8  &&
                item.x + item.w - 8 > shieldX             &&
                item.y         < sy + SHIELD_H - 6        &&
                item.y + item.h - 6 > sy;
      if (hit) {
        if (item.isCatch) {
          score += item.pts;
          emitParticles(shieldX + SHIELD_W / 2, sy, '#28a745');
        } else {
          health = Math.max(0, health - item.dmg);
          emitParticles(shieldX + SHIELD_W / 2, sy, '#dc3545');
        }
        items.splice(i, 1);
        if (health <= 0) { gameOver(); return; }
        continue;
      }
      if (item.y > LH) {
        if (item.isCatch) {
          // Kiesett fedezett kockázat – védelmi veszteség
          health = Math.max(0, health - 12);
          emitParticles(item.x + item.w / 2, LH - GROUND_H, '#ffc107');
          if (health <= 0) { items.splice(i, 1); gameOver(); return; }
        }
        items.splice(i, 1);
      }
    }

    // Részecskék
    for (var j = particles.length - 1; j >= 0; j--) {
      var p = particles[j];
      p.x   += p.vx * dt * 60;
      p.y   += p.vy * dt * 60;
      p.vy  += 0.2;
      p.life -= dt * 2.5;
      if (p.life <= 0) particles.splice(j, 1);
    }
  }

  function emitParticles(cx, cy, color) {
    for (var i = 0; i < 12; i++) {
      particles.push({
        x: cx, y: cy,
        vx: (Math.random() - 0.5) * 7,
        vy: -(Math.random() * 4 + 1.5),
        life: 1,
        color: color
      });
    }
  }

  // ── Rajzolás ─────────────────────────────────────────────────────────────────
  function drawBg() {
    var sky = ctx.createLinearGradient(0, 0, 0, LH);
    sky.addColorStop(0,    '#e3f0ff');
    sky.addColorStop(0.65, '#f0f8ff');
    sky.addColorStop(1,    '#d6eeff');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, LW, LH);
    // Nap
    ctx.save();
    ctx.shadowColor = 'rgba(255,220,50,0.45)';
    ctx.shadowBlur  = 18;
    ctx.fillStyle   = '#FFD700';
    ctx.beginPath();
    ctx.arc(LW - 50, 40, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Felhők
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    drawCloud(LW * 0.12, 30, 30);
    drawCloud(LW * 0.52, 18, 22);
    drawCloud(LW * 0.80, 34, 26);
    // Gyep
    ctx.fillStyle = '#c8e6c9';
    ctx.fillRect(0, LH - GROUND_H, LW, GROUND_H);
    ctx.fillStyle = '#a5d6a7';
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
      ctx.rect(x, y, w, h);
    }
    ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, LW, LH);
    drawBg();

    // Egér iránynyíl (játék közben)
    if (mouseOnCanvas && state === 'playing') {
      ctx.save();
      ctx.strokeStyle = 'rgba(13,110,253,0.22)';
      ctx.lineWidth   = 1.5;
      ctx.setLineDash([5, 7]);
      ctx.beginPath();
      ctx.moveTo(mouseX, 0);
      ctx.lineTo(mouseX, LH - GROUND_H);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Elemek
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      ctx.font      = Math.round(item.h * 0.85) + 'px serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.e, item.x, item.y + item.h);
    }

    // Pajzs
    var sy = LH - GROUND_H - SHIELD_H;
    ctx.font      = SHIELD_H + 'px serif';
    ctx.textAlign = 'left';
    ctx.fillText('🛡️', shieldX, sy + SHIELD_H);

    // Részecskék
    for (var j = 0; j < particles.length; j++) {
      var p = particles[j];
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle   = p.color;
      ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
    }
    ctx.globalAlpha = 1;

    // HUD: védettség sáv
    var bW = Math.min(220, LW * 0.44), bH = 20, bX = LW / 2 - bW / 2, bY = 10;
    drawRoundedBar(bX, bY, bW, bH, 10, 'rgba(0,0,0,0.18)');
    var pct      = health / 100;
    var barColor = pct > 0.5 ? '#28a745' : pct > 0.25 ? '#ffc107' : '#dc3545';
    drawRoundedBar(bX + 2, bY + 2, Math.max(0, (bW - 4) * pct), bH - 4, 8, barColor);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur  = 3;
    ctx.fillStyle   = '#fff';
    ctx.font        = 'bold 11px Inter, system-ui, Arial, sans-serif';
    ctx.textAlign   = 'center';
    ctx.fillText('🛡 Védettség: ' + Math.round(health) + '%', LW / 2, bY + 14);
    // Pont
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font      = 'bold 13px Inter, system-ui, Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('⭐ ' + score + ' pont', LW - 10, 26);
    ctx.restore();

    // Irányítás tipp (első 4 mp)
    if (gameTime < 4 && !mouseOnCanvas) {
      ctx.save();
      ctx.fillStyle = 'rgba(13,110,253,0.72)';
      ctx.font      = '11px Inter, system-ui, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('← mozgasd az egeret, vagy nyomd a nyíl billentyűket →', LW / 2, LH - GROUND_H - 8);
      ctx.restore();
    }
  }

  function drawIdle() {
    ctx.clearRect(0, 0, LW, LH);
    drawBg();
    // Pajzs középen
    ctx.font      = SHIELD_H + 'px serif';
    ctx.textAlign = 'left';
    ctx.fillText('🛡️', LW / 2 - SHIELD_W / 2, LH - GROUND_H);
    // Hullámzó kockázatok
    ctx.font      = '38px serif';
    ctx.textAlign = 'center';
    ctx.fillText('☠️', LW * 0.18, LH * 0.30);
    ctx.fillText('😷', LW * 0.50, LH * 0.16);
    ctx.fillText('💣', LW * 0.80, LH * 0.32);
    ctx.fillText('🤕', LW * 0.36, LH * 0.46);
    ctx.fillText('❌', LW * 0.68, LH * 0.48);
  }

  // ── Játék vége ────────────────────────────────────────────────────────────────
  function gameOver() {
    state = 'dead';
    cancelAnimationFrame(animId);
    draw();
    var go = document.getElementById('kockazat-gameover');
    var sd = document.getElementById('kockazat-score-display');
    if (go) go.classList.remove('d-none');
    if (sd) sd.textContent = score + ' pontot szerzett · ' + Math.floor(gameTime) + ' másodperc';
  }

  // ── Publikus API ──────────────────────────────────────────────────────────────
  window.kockazatStart = function () {
    var s = document.getElementById('kockazat-start');
    var g = document.getElementById('kockazat-gameover');
    if (s) s.classList.add('d-none');
    if (g) g.classList.add('d-none');
    state     = 'playing';
    score     = 0;
    health    = 100;
    gameTime  = 0;
    items     = [];
    particles = [];
    spawnTimer = 0;
    shieldVX   = 0;
    mouseX     = -1;
    mouseOnCanvas = false;
    shieldX   = LW / 2 - SHIELD_W / 2;
    lastTs    = performance.now();
    animId    = requestAnimationFrame(loop);
  };

  window.kockazatRestart = function () {
    window.kockazatStart();
  };

})();


// Button bindings (moved from HTML onclick attributes)
(function () {
  function bind(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener('click', fn); }
  bind('kockazat-start-btn', window.kockazatStart);
  bind('kockazat-restart-btn', window.kockazatRestart);
}());