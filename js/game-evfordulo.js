/**
 * Évforduló Radar v2 – KGFB reakcióidő játék
 * - markerAngle körönként véletlenszerű → ablakok helye minden körben más
 * - Canvas wrapper aspect-ratio CSS → nincs pop-effekt
 * - Space / Enter = Felmondás billentyűparancs
 */
(function () {
  'use strict';

  var canvas = document.getElementById('evfordulo-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var TAU        = Math.PI * 2;
  var DAYS       = 365;
  var GREEN_DAYS = 30;
  var WARN_DAYS  = 75;
  var LATE_DAYS  = 8;
  var MAX_ROUNDS = 3;

  var GREEN_ARC = TAU * GREEN_DAYS / DAYS;
  var WARN_ARC  = TAU * WARN_DAYS  / DAYS;
  var LATE_ARC  = TAU * LATE_DAYS  / DAYS;

  var ROUND_SPEEDS = [TAU / 7, TAU / 4.8, TAU / 3.1];

  var state       = 'idle';
  var angle       = 0;
  var markerAngle = 0;
  var round       = 0;
  var stars       = [];
  var animId      = null;
  var lastTs      = 0;
  var frozen      = false;

  var LW = 0, LH = 0;

  function ca(a) { return a - Math.PI / 2; }

  function distAfter(a) {
    return ((a - markerAngle) % TAU + TAU) % TAU;
  }

  function getZone(a) {
    var d = distAfter(a);
    if (d < LATE_ARC)        return 'late';
    if (d > TAU - GREEN_ARC) return 'green';
    if (d > TAU - WARN_ARC)  return 'warn';
    return 'early';
  }

  function daysLeft(a) {
    var d = distAfter(a);
    if (d < LATE_ARC) return 0;
    return Math.round((TAU - d) / TAU * DAYS);
  }

  function resize() {
    LW = canvas.offsetWidth;
    LH = canvas.offsetHeight;
    if (!LW || !LH) return;
    var dpr = window.devicePixelRatio || 1;
    canvas.width  = Math.round(LW * dpr);
    canvas.height = Math.round(LH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (state !== 'playing') drawIdle(); else draw();
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 60);
  });
  setTimeout(resize, 80);

  document.addEventListener('keydown', function (e) {
    if ((e.key === ' ' || e.key === 'Enter') && state === 'playing' && !frozen) {
      e.preventDefault();
      window.evfordFelmond();
    }
  });

  function cx() { return LW / 2; }
  function cy() { return LH * 0.50; }
  function cr() { return Math.min(LW, LH) * 0.37; }
  function sw() { return Math.max(11, Math.round(cr() * 0.13)); }

  function loop(ts) {
    if (frozen) { animId = null; return; }
    var dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;
    angle = (angle + ROUND_SPEEDS[Math.min(round, MAX_ROUNDS - 1)] * dt) % TAU;
    draw();
    if (state === 'playing') animId = requestAnimationFrame(loop);
  }

  function drawBg() {
    var gr = ctx.createLinearGradient(0, 0, 0, LH);
    gr.addColorStop(0, '#f0f4ff');
    gr.addColorStop(1, '#e8eef8');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, LW, LH);
  }

  function arcSeg(x, y, r, a0, a1, color, lw) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth   = lw;
    ctx.lineCap     = 'butt';
    ctx.beginPath();
    ctx.arc(x, y, r, ca(a0), ca(a1), false);
    ctx.stroke();
    ctx.restore();
  }

  function drawClock(x, y, r, s) {
    arcSeg(x, y, r, 0, TAU, '#dee2e6', s);
    arcSeg(x, y, r, markerAngle - WARN_ARC, markerAngle - GREEN_ARC, '#ffc107', s);
    arcSeg(x, y, r, markerAngle - GREEN_ARC, markerAngle, '#28a745', s + 5);
    arcSeg(x, y, r, markerAngle, markerAngle + LATE_ARC, '#dc3545', s);

    for (var i = 0; i < 12; i++) {
      var ta  = i * TAU / 12;
      var o   = r - s / 2 - 2;
      var inn = i % 3 === 0 ? o - 11 : o - 6;
      ctx.save();
      ctx.strokeStyle = '#adb5bd';
      ctx.lineWidth   = i % 3 === 0 ? 2.5 : 1.2;
      ctx.lineCap     = 'round';
      var cta = ca(ta);
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(cta) * o,   y + Math.sin(cta) * o);
      ctx.lineTo(x + Math.cos(cta) * inn, y + Math.sin(cta) * inn);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.strokeStyle = '#dc3545';
    ctx.lineWidth   = 5;
    ctx.lineCap     = 'round';
    var cma = ca(markerAngle);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(cma) * (r - s / 2 + 2),  y + Math.sin(cma) * (r - s / 2 + 2));
    ctx.lineTo(x + Math.cos(cma) * (r + s / 2 + 14), y + Math.sin(cma) * (r + s / 2 + 14));
    ctx.stroke();
    ctx.globalAlpha  = 1;
    ctx.fillStyle    = '#000000';
    ctx.font         = Math.round(LH * 0.038) + 'px serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\uD83D\uDCC5',
      x + Math.cos(cma) * (r + s / 2 + 30),
      y + Math.sin(cma) * (r + s / 2 + 30));
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(21,35,60,0.06)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.arc(x, y, r - s / 2 - 5, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  function drawHand(x, y, r, s, a) {
    var zone     = getZone(a);
    var COLORS   = { green: '#28a745', warn: '#e6a800', late: '#dc3545', early: '#15233C' };
    var tipColor = frozen ? (COLORS[zone] || '#15233C') : '#15233C';
    var handLen  = r - s / 2 - 12;
    var pha      = ca(a);
    var hx = x + Math.cos(pha) * handLen;
    var hy = y + Math.sin(pha) * handLen;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.22)';
    ctx.shadowBlur  = 10;
    ctx.strokeStyle = tipColor;
    ctx.lineWidth   = 5;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(hx, hy);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = tipColor;
    ctx.beginPath();
    ctx.arc(hx, hy, 8, 0, TAU);
    ctx.fill();

    ctx.fillStyle = '#15233C';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, TAU);
    ctx.fill();
  }

  function drawCenter(x, y, a) {
    if (!LW) return;
    var zone   = getZone(a);
    var COLORS = { green: '#28a745', warn: '#b57a00', late: '#dc3545', early: '#6c757d' };
    ctx.save();
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLORS[zone] || '#6c757d';
    ctx.font = 'bold ' + Math.round(LH * 0.065) + 'px Inter, system-ui, Arial';
    ctx.fillText(zone === 'late' ? 'K\u00e9s\u0151!' : daysLeft(a) + ' nap', x, y - 8);
    ctx.fillStyle = 'rgba(21,35,60,0.45)';
    ctx.font = Math.round(LH * 0.028) + 'px Inter, system-ui, Arial';
    ctx.fillText(zone === 'late' ? 'lek\u00e9ste' : 'az \u00e9vfordul\u00f3ig', x, y + 16);
    ctx.restore();
  }

  function draw() {
    if (!LW || !LH) return;
    ctx.clearRect(0, 0, LW, LH);
    drawBg();
    var x = cx(), y = cy(), r = cr(), s = sw();
    drawClock(x, y, r, s);
    drawHand(x, y, r, s, angle);
    if (state === 'playing') drawCenter(x, y, angle);
  }

  function drawIdle() {
    if (!LW || !LH) return;
    markerAngle = Math.PI * 0.85;
    angle = (markerAngle + TAU * 0.52) % TAU;
    draw();
  }

  var FB = {
    green: '\u2705 Helyes! A felmondás pontosan a 30 napos ablakban érkezett be.',
    warn:  '\u26A0\uFE0F Még {N} nap az évfordulóig – ez a sárga zóna. Az optimális az utolsó 30 nap.',
    late:  '\u274C Lekéste! Az évforduló már elmúlt, a szerződés megújult. Alkusszal ez nem fordulhat elő.',
    early: '\u26A0\uFE0F Még {N} nap van hátra a zöld ablakig!'
  };

  function showFeedback(zone, a) {
    var msg = (FB[zone] || '').replace('{N}', daysLeft(a));
    var CLS = { green: 'alert-success', warn: 'alert-warning', late: 'alert-danger', early: 'alert-warning' };
    var fb  = document.getElementById('evfordulo-feedback');
    if (!fb) return;
    fb.className = 'alert ' + (CLS[zone] || 'alert-secondary') + ' small mt-3 mb-0 rounded-3';
    fb.textContent = msg;
    fb.hidden    = false;
  }

  function hideFeedback() {
    var fb = document.getElementById('evfordulo-feedback');
    if (fb) fb.hidden = true;
  }

  function showPanel(id) {
    ['evfordulo-panel-start', 'evfordulo-panel-play', 'evfordulo-panel-result'].forEach(function (pid) {
      var el = document.getElementById(pid);
      if (el) el.classList.toggle('d-none', pid !== id);
    });
  }

  function updateHud() {
    var se = document.getElementById('evfordulo-hud-stars');
    if (se) se.textContent = stars.map(function (s) { return s ? '\u2B50' : '\uD83D\uDC94'; }).join(' ');
    var re = document.getElementById('evfordulo-hud-round');
    if (re) re.textContent = (round + 1) + ' / ' + MAX_ROUNDS + '. kör';
  }

  function startRound() {
    markerAngle = Math.random() * TAU;
    angle = (markerAngle + TAU * 0.42 + Math.random() * TAU * 0.16) % TAU;
    frozen = false;
    state  = 'playing';
    updateHud();
    lastTs = performance.now();
    cancelAnimationFrame(animId);
    animId = requestAnimationFrame(loop);
  }

  window.evfordStart = function () {
    round = 0;
    stars = [];
    hideFeedback();
    showPanel('evfordulo-panel-play');
    startRound();
  };

  window.evfordFelmond = function () {
    if (state !== 'playing' || frozen) return;
    frozen = true;
    cancelAnimationFrame(animId);
    animId = null;
    var zone = getZone(angle);
    stars.push(zone === 'green');
    draw();
    showFeedback(zone, angle);
    updateHud();
    round++;
    if (round < MAX_ROUNDS) {
      setTimeout(function () { hideFeedback(); startRound(); }, 2100);
    } else {
      setTimeout(function () { hideFeedback(); state = 'idle'; showResult(); }, 2500);
    }
  };

  window.evfordRestart = function () { window.evfordStart(); };

  function showResult() {
    var hit = stars.filter(Boolean).length;
    var DATA = [
      { e: '\u23F0', t: 'Érdemes alkusszal intézni!',
        d: 'Most nem sikerült – de valóságban mi nyilvántartjuk az évfordulókat és időben szólunk.' },
      { e: '\uD83D\uDE05', t: 'Van hova fejlődni!',
        d: 'Egyszer sikerült az ablak. Emlékezzen: a felmondásnak beérkeznie kell – nem elég postára adni az évforduló napján.' },
      { e: '\u2B50', t: 'Nagyon jó – csaknem profi!',
        d: '2/3-szor sikerült. Egy rossz időzítés valóságban automatikus megújulást jelent. Alkusszal biztosan nem csúszik el.' },
      { e: '\uD83C\uDFC6', t: 'Kiváló! Alkusz-szintű pontosság!',
        d: 'Mindháromszor benne volt a zöld ablakban. Mi figyeljük az évfordulókat – Önnek nem kell fejben tartani.' }
    ][hit];
    var rp = document.getElementById('evfordulo-panel-result');
    if (rp) {
      var q = function (sel) { return rp.querySelector(sel); };
      if (q('.evf-r-emoji')) q('.evf-r-emoji').textContent = DATA.e;
      if (q('.evf-r-stars')) q('.evf-r-stars').textContent = stars.map(function (s) { return s ? '\u2B50' : '\uD83D\uDC94'; }).join(' ');
      if (q('.evf-r-title')) q('.evf-r-title').textContent = DATA.t;
      if (q('.evf-r-desc'))  q('.evf-r-desc').textContent  = DATA.d;
    }
    drawIdle();
    showPanel('evfordulo-panel-result');
  }

  showPanel('evfordulo-panel-start');

})();