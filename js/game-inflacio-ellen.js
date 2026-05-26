(function () {
  'use strict';

  const canvas = document.getElementById('inflacio-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* ── Konstansok ────────────────────────────────────────────── */
  const TOTAL_YEARS   = 10;
  const YEAR_MS       = 5000;   // 1 játékév ennyi ms
  const COIN_INTERVAL = 750;    // érmék között ennyi ms
  const SPEED_BASE    = 110;
  const SPEED_PER_YEAR = 14;

  const LANE_CFG = [
    { label: 'Párna alatt',              sub: '−8% / év (infláció)',  mulPts: -3, coinColor0: '#adb5bd', coinColor1: '#6c757d' },
    { label: 'Bankbetét',                sub: '+2% / év',             mulPts:  1, coinColor0: '#ffd700', coinColor1: '#e09b00' },
    { label: 'Befektetési biztosítás',   sub: '+7% / év (adóelőny)', mulPts:  5, coinColor0: '#6fd08c', coinColor1: '#198754' }
  ];

  const PRIMARY      = '#0d6efd';
  const HUD_H        = 36;
  const PADDLE_REL_X = 0.40;   // paddle X pozíció (canvas szélességéhez képest)

  /* ── Állapot ──────────────────────────────────────────────── */
  let LANE_H, PADDLE_X;
  let state = 'intro';
  let paddle, coins, score, year, yearMs, lastTs, coinTimer;
  let coinsCaught, totalCoins, comboCount, comboMax;
  let rafId;
  let GAME_W = 0, GAME_H = 0;

  /* ── Canvas méretezés ─────────────────────────────────────── */
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const w   = Math.min(canvas.parentElement.clientWidth, 720);
    const h   = Math.round(w * 0.56);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    GAME_W   = w;
    GAME_H   = h;
    LANE_H   = Math.floor((h - HUD_H) / 3);
    PADDLE_X = Math.round(w * PADDLE_REL_X);
  }
  resize();
  window.addEventListener('resize', () => {
    resize();
    if (state === 'intro')  drawIntro();
    if (state === 'result') drawResult();
  });

  /* ── Segédfüggvények ──────────────────────────────────────── */
  function laneY(laneIdx) { return HUD_H + laneIdx * LANE_H + LANE_H * 0.5; }
  function paddleLaneY(laneIdx) { return laneY(laneIdx); }

  function fmtNum(n) {
    return new Intl.NumberFormat('hu-HU').format(Math.round(n));
  }

  /* ── Inicializálás ────────────────────────────────────────── */
  function initGame() {
    if (rafId) cancelAnimationFrame(rafId);
    paddle     = { y: laneY(1), targetLane: 1 };
    coins      = [];
    score      = 0;
    year       = 1;
    yearMs     = 0;
    lastTs     = null;
    coinTimer  = 0;
    coinsCaught = [0, 0, 0];
    totalCoins  = 0;
    comboCount  = 0;
    comboMax    = 0;
    state = 'play';
    rafId = requestAnimationFrame(loop);
  }

  /* ── Vezérlés ─────────────────────────────────────────────── */
  let mouseY = null;

  canvas.addEventListener('mousemove', e => {
    if (state !== 'play') return;
    const rect = canvas.getBoundingClientRect();
    mouseY = (e.clientY - rect.top) * (GAME_H / rect.height);
    setPaddleLaneFromY(mouseY);
  });

  canvas.addEventListener('mouseleave', () => { mouseY = null; });

  canvas.addEventListener('click', e => {
    if (state === 'intro')  { initGame(); return; }
    if (state === 'result') { initGame(); return; }
    const rect = canvas.getBoundingClientRect();
    const y    = (e.clientY - rect.top) * (GAME_H / rect.height);
    setPaddleLaneFromY(y);
  });

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    if (state === 'intro')  { initGame(); return; }
    if (state === 'result') { initGame(); return; }
    const rect  = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const y     = (touch.clientY - rect.top) * (GAME_H / rect.height);
    setPaddleLaneFromY(y);
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (state !== 'play') return;
    const rect  = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const y     = (touch.clientY - rect.top) * (GAME_H / rect.height);
    setPaddleLaneFromY(y);
  }, { passive: false });

  document.addEventListener('keydown', e => {
    if (state !== 'play') return;
    if (e.key === 'ArrowUp')   { setPaddleLane(Math.max(0, paddle.targetLane - 1)); e.preventDefault(); }
    if (e.key === 'ArrowDown') { setPaddleLane(Math.min(2, paddle.targetLane + 1)); e.preventDefault(); }
    if (e.key === '1') setPaddleLane(0);
    if (e.key === '2') setPaddleLane(1);
    if (e.key === '3') setPaddleLane(2);
  });

  function setPaddleLaneFromY(y) {
    const laneIdx = Math.max(0, Math.min(2, Math.floor((y - HUD_H) / LANE_H)));
    setPaddleLane(laneIdx);
  }

  function setPaddleLane(laneIdx) {
    paddle.targetLane = laneIdx;
  }

  /* ── Érmék spawnolása ─────────────────────────────────────── */
  function spawnCoin() {
    const lane  = Math.floor(Math.random() * 3);
    const value = (10 + Math.floor(Math.random() * 5) * 5) * 1000; // 10–30k
    const speed = SPEED_BASE + (year - 1) * SPEED_PER_YEAR + Math.random() * 40;
    coins.push({
      x: GAME_W + 36,
      lane,
      targetLane: lane,
      y: laneY(lane),
      value,
      baseValue: value,
      speed,
      radius: 21,
      shrink: 1,       // Párna alatt sávban csökken
      alpha: 1,
      deflected: false,
      sparkTimer: 0    // vizuális visszajelzés deflect esetén
    });
    totalCoins++;
  }

  /* ── Game loop ────────────────────────────────────────────── */
  function loop(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    if (state !== 'play') return;

    // Évek haladása
    yearMs += dt * 1000;
    if (yearMs >= YEAR_MS) {
      yearMs -= YEAR_MS;
      year++;
      if (year > TOTAL_YEARS) {
        state = 'result';
        drawResult();
        return;
      }
    }

    // Érmék spawnolása
    coinTimer += dt * 1000;
    if (coinTimer >= COIN_INTERVAL) {
      coinTimer -= COIN_INTERVAL;
      spawnCoin();
    }

    // Paddle simítás
    const targY = paddleLaneY(paddle.targetLane);
    paddle.y += (targY - paddle.y) * Math.min(dt * 14, 1);

    // Érmék frissítése
    for (let i = coins.length - 1; i >= 0; i--) {
      const c = coins[i];
      c.x -= c.speed * dt;

      // Párna alatt → érmék zsugorodnak (infláció)
      if (c.lane === 0) {
        c.shrink = Math.max(0.48, c.shrink - dt * 0.22);
      }

      // Spark timer csökkentése
      if (c.sparkTimer > 0) c.sparkTimer -= dt;

      // Deflect vizsgálat: ha az érme eléri a paddle X-et
      if (!c.deflected && c.x <= PADDLE_X + 8 && c.x >= PADDLE_X - 32) {
        c.deflected = true;
        c.lane = paddle.targetLane;
        c.y    = laneY(c.lane);
        c.sparkTimer = 0.35;
      }

      // Sávban tartás (y simítás a sávban)
      const targCY = laneY(c.lane);
      c.y += (targCY - c.y) * Math.min(dt * 18, 1);

      // Lefut a bal oldalon
      if (c.x < -50) {
        const lane = c.lane;
        const pts  = LANE_CFG[lane].mulPts * Math.round(c.baseValue / 1000);
        score += pts;
        coinsCaught[lane]++;
        if (lane === 2) comboCount++;
        else comboCount = 0;
        comboMax = Math.max(comboMax, comboCount);
        coins.splice(i, 1);
      }
    }

    draw();
    rafId = requestAnimationFrame(loop);
  }

  /* ── Rajzolás ─────────────────────────────────────────────── */
  function draw() {
    ctx.clearRect(0, 0, GAME_W, GAME_H);

    const stripeColors = ['#f8f9fa', '#ffffff', '#f3fff7'];

    // Sávok
    for (let i = 0; i < 3; i++) {
      const y0 = HUD_H + i * LANE_H;

      ctx.fillStyle = stripeColors[i];
      ctx.fillRect(0, y0, GAME_W, LANE_H);

      // Sáv elválasztó
      if (i > 0) {
        ctx.beginPath();
        ctx.moveTo(0, y0); ctx.lineTo(GAME_W, y0);
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Sávcímke jobb oldalon
      ctx.save();
      ctx.textAlign = 'right';
      ctx.textBaseline = 'alphabetic';
      const fSize = Math.max(11, Math.round(LANE_H * 0.19));
      ctx.font = `700 ${fSize}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = i === 2 ? '#0f5132' : i === 1 ? '#0a3880' : '#6c757d';
      ctx.globalAlpha = 0.85;
      ctx.fillText(LANE_CFG[i].label, GAME_W - 10, y0 + LANE_H * 0.46);
      ctx.font = `${Math.max(10, Math.round(LANE_H * 0.16))}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#888';
      ctx.globalAlpha = 0.75;
      ctx.fillText(LANE_CFG[i].sub, GAME_W - 10, y0 + LANE_H * 0.72);
      ctx.restore();
    }

    // Paddle
    const pH = LANE_H * 0.72;
    const pW = 13;
    ctx.save();
    ctx.shadowColor = PRIMARY;
    ctx.shadowBlur  = 18;
    const pGrad = ctx.createLinearGradient(PADDLE_X - pW / 2, 0, PADDLE_X + pW / 2, 0);
    pGrad.addColorStop(0, '#6ea8fe');
    pGrad.addColorStop(1, PRIMARY);
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.roundRect(PADDLE_X - pW / 2, paddle.y - pH / 2, pW, pH, 7);
    ctx.fill();
    ctx.restore();

    // Paddle nyíl-hint
    ctx.save();
    ctx.fillStyle = '#0d6efd';
    ctx.globalAlpha = 0.28;
    ctx.font = `${Math.round(LANE_H * 0.23)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (paddle.targetLane > 0) ctx.fillText('▲', PADDLE_X, paddle.y - pH / 2 - 11);
    if (paddle.targetLane < 2) ctx.fillText('▼', PADDLE_X, paddle.y + pH / 2 + 11);
    ctx.restore();

    // Szaggatott vonal a paddle X-nél (segédvonal)
    ctx.save();
    ctx.strokeStyle = '#0d6efd';
    ctx.globalAlpha = 0.10;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(PADDLE_X, HUD_H);
    ctx.lineTo(PADDLE_X, GAME_H);
    ctx.stroke();
    ctx.restore();

    // Érmék
    for (const c of coins) {
      const r  = c.radius * c.shrink;
      const cy = c.y;

      ctx.save();

      // Spark villanás deflect esetén
      if (c.sparkTimer > 0) {
        const t = c.sparkTimer / 0.35;
        ctx.shadowColor = '#fff';
        ctx.shadowBlur  = 30 * t;
      }

      // Érmék megjelenítése sáv szerinti glow-val
      const glowColors = ['rgba(220,53,69,0.35)', 'rgba(255,193,7,0.30)', 'rgba(25,135,84,0.35)'];
      ctx.shadowColor = glowColors[c.lane];
      ctx.shadowBlur  = 12;

      // Érmék gradiens
      const cGrad = ctx.createRadialGradient(c.x - r * 0.28, cy - r * 0.28, r * 0.05, c.x, cy, r);
      cGrad.addColorStop(0, LANE_CFG[c.lane].coinColor0);
      cGrad.addColorStop(1, LANE_CFG[c.lane].coinColor1);
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.arc(c.x, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Érmén felirat: érték Ft-ban
      ctx.shadowBlur = 0;
      ctx.fillStyle  = '#fff';
      const label = (c.baseValue >= 10000)
        ? (c.baseValue / 1000) + 'e'
        : c.baseValue + '';
      ctx.font = `700 ${Math.round(r * 0.68)}px Inter, system-ui, sans-serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, c.x, cy);

      // Zsugorodás jelzése: vörös X ha <60%
      if (c.shrink < 0.75) {
        ctx.fillStyle   = 'rgba(220,53,69,0.7)';
        ctx.font        = `700 ${Math.round(r * 0.55)}px sans-serif`;
        ctx.textBaseline = 'alphabetic';
        ctx.fillText('↓', c.x + r * 0.55, cy - r * 0.45);
      }

      ctx.restore();
    }

    // HUD sáv felül
    ctx.save();
    const hudGrad = ctx.createLinearGradient(0, 0, GAME_W, 0);
    hudGrad.addColorStop(0, '#0a3880');
    hudGrad.addColorStop(1, PRIMARY);
    ctx.fillStyle = hudGrad;
    ctx.fillRect(0, 0, GAME_W, HUD_H);

    // Évszámláló
    ctx.fillStyle    = '#fff';
    ctx.font         = `700 ${Math.max(12, Math.round(HUD_H * 0.42))}px Inter, system-ui, sans-serif`;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${year}. év / ${TOTAL_YEARS}`, 12, HUD_H / 2);

    // Év progress bar
    const bx   = GAME_W * 0.22;
    const bw   = GAME_W * 0.35;
    const bh   = HUD_H * 0.35;
    const by   = (HUD_H - bh) / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.20)';
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 3); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.roundRect(bx, by, bw * (yearMs / YEAR_MS), bh, 3); ctx.fill();

    // Kombó
    if (comboCount >= 2) {
      ctx.fillStyle = '#ffd700';
      ctx.font      = `700 ${Math.max(11, Math.round(HUD_H * 0.38))}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`🔥 ×${comboCount} kombó`, GAME_W * 0.60, HUD_H / 2);
    }

    // Pontszám
    ctx.fillStyle    = '#fff';
    ctx.font         = `700 ${Math.max(12, Math.round(HUD_H * 0.42))}px Inter, system-ui, sans-serif`;
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${score} pont`, GAME_W - 12, HUD_H / 2);

    ctx.restore();
  }

  /* ── Intro képernyő ───────────────────────────────────────── */
  function drawIntro() {
    ctx.clearRect(0, 0, GAME_W, GAME_H);

    // Háttér
    const bgGrad = ctx.createLinearGradient(0, 0, 0, GAME_H);
    bgGrad.addColorStop(0, '#eef3fb');
    bgGrad.addColorStop(1, '#f3fff7');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    const cx = GAME_W / 2;

    // Cím
    ctx.save();
    ctx.fillStyle    = PRIMARY;
    ctx.font         = `800 ${Math.round(GAME_W * 0.062)}px Inter, system-ui, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Infláció Ellen', cx, GAME_H * 0.13);
    ctx.restore();

    // Alcím
    ctx.save();
    ctx.fillStyle    = '#495057';
    ctx.font         = `${Math.round(GAME_W * 0.032)}px Inter, system-ui, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Tereld a pénzérméket a legjobb sávba, mielőtt az infláció elviszi!', cx, GAME_H * 0.24);
    ctx.restore();

    // 3 sáv példa
    const lH = GAME_H * 0.105;
    const lW = GAME_W * 0.62;
    const lX = (GAME_W - lW) / 2;
    const laneColors2  = ['#fff3cd', '#cfe2ff', '#d1e7dd'];
    const laneTexts    = ['#856404', '#084298', '#0f5132'];
    const introCfg = [
      ['Párna alatt',             '−8% / év',  '⛔'],
      ['Bankbetét',               '+2% / év',  '🟡'],
      ['Befektetési biztosítás',  '+7% / év',  '✅']
    ];
    for (let i = 0; i < 3; i++) {
      const y0 = GAME_H * 0.33 + i * (lH + 6);
      ctx.save();
      ctx.fillStyle = laneColors2[i];
      ctx.beginPath(); ctx.roundRect(lX, y0, lW, lH, 8); ctx.fill();
      ctx.fillStyle    = laneTexts[i];
      ctx.font         = `700 ${Math.round(lH * 0.34)}px Inter, system-ui, sans-serif`;
      ctx.textAlign    = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${introCfg[i][2]}  ${introCfg[i][0]}`, lX + 14, y0 + lH * 0.4);
      ctx.font      = `${Math.round(lH * 0.28)}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#555';
      ctx.fillText(introCfg[i][1], lX + 14, y0 + lH * 0.73);
      ctx.restore();
    }

    // Vezérlés hint
    ctx.save();
    ctx.fillStyle    = '#6c757d';
    ctx.font         = `${Math.round(GAME_W * 0.027)}px Inter, system-ui, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Egér / érintés / ↑↓ nyilak — tereld az érméket a biztosítás sávba', cx, GAME_H * 0.78);
    ctx.restore();

    // Gomb
    const btnW = Math.round(GAME_W * 0.38);
    const btnH = Math.round(GAME_H * 0.10);
    const btnX = cx - btnW / 2;
    const btnY = GAME_H * 0.86;
    ctx.save();
    ctx.shadowColor = PRIMARY;
    ctx.shadowBlur  = 16;
    const btnGrad = ctx.createLinearGradient(btnX, 0, btnX + btnW, 0);
    btnGrad.addColorStop(0, '#0a3880');
    btnGrad.addColorStop(1, PRIMARY);
    ctx.fillStyle = btnGrad;
    ctx.beginPath(); ctx.roundRect(btnX, btnY, btnW, btnH, 10); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle    = '#fff';
    ctx.font         = `700 ${Math.round(btnH * 0.42)}px Inter, system-ui, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Játék indítása ▶', cx, btnY + btnH / 2);
    ctx.restore();
  }

  /* ── Eredmény képernyő ────────────────────────────────────── */
  function drawResult() {
    ctx.clearRect(0, 0, GAME_W, GAME_H);

    const bgGrad = ctx.createLinearGradient(0, 0, 0, GAME_H);
    bgGrad.addColorStop(0, '#eef3fb');
    bgGrad.addColorStop(1, '#f3fff7');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    const cx = GAME_W / 2;
    const total = coinsCaught.reduce((a, b) => a + b, 0) || 1;
    const pct2  = coinsCaught[2] / total;

    // Cím
    const titleColor = pct2 >= 0.55 ? '#0f5132' : pct2 >= 0.35 ? '#664d03' : '#842029';
    const titleText  = pct2 >= 0.55 ? '10 év eltelt — Remek teljesítmény!' :
                       pct2 >= 0.35 ? '10 év eltelt — Jó, de lehetett volna több!' :
                                       '10 év eltelt — Az infláció nyert...';
    ctx.save();
    ctx.fillStyle    = titleColor;
    ctx.font         = `800 ${Math.round(GAME_W * 0.046)}px Inter, system-ui, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(titleText, cx, GAME_H * 0.10);
    ctx.restore();

    // Pontszám + kombó
    ctx.save();
    ctx.fillStyle    = PRIMARY;
    ctx.font         = `700 ${Math.round(GAME_W * 0.038)}px Inter, system-ui, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Végső pont: ${score}  |  Leghosszabb kombó: ×${comboMax}`, cx, GAME_H * 0.195);
    ctx.restore();

    // Sávok elosztása – vízszintes progress bar
    const barW  = GAME_W * 0.60;
    const barH  = GAME_H * 0.072;
    const barX  = (GAME_W - barW) / 2;
    const barColors2 = ['#dc3545', '#ffc107', '#198754'];
    const laneLabels = ['Párna alatt', 'Bankbetét', 'Biztosítás'];
    for (let i = 0; i < 3; i++) {
      const pct   = coinsCaught[i] / total;
      const y0    = GAME_H * 0.275 + i * (barH + GAME_H * 0.065);

      // Label + szám
      ctx.save();
      ctx.font         = `600 ${Math.round(barH * 0.52)}px Inter, system-ui, sans-serif`;
      ctx.fillStyle    = '#333';
      ctx.textAlign    = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${laneLabels[i]}: ${coinsCaught[i]} érme  (${Math.round(pct * 100)}%)`, barX, y0 - barH * 0.5);
      ctx.restore();

      // Háttér
      ctx.fillStyle = '#dee2e6';
      ctx.beginPath(); ctx.roundRect(barX, y0, barW, barH, 5); ctx.fill();

      // Kitöltés
      ctx.fillStyle = barColors2[i];
      ctx.beginPath(); ctx.roundRect(barX, y0, Math.max(pct * barW, barH * 0.4), barH, 5); ctx.fill();
    }

    // Tanulság szöveg
    const tipText = pct2 >= 0.55
      ? 'A legtöbb megtakarítás a biztosításban kötött ki — az infláció keveset tudott elvinni.'
      : pct2 >= 0.35
      ? 'Átlagos eredmény. Hosszú távon a megfelelő sáv megválasztása sokat számít.'
      : 'Az infláció felőrölte a Párna alatti összegek értékét. Érdemes befektetési biztosítást mérlegelni.';
    ctx.save();
    ctx.fillStyle    = '#444';
    ctx.font         = `${Math.round(GAME_W * 0.028)}px Inter, system-ui, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    // Szöveg tördelés
    wrapText(ctx, tipText, cx, GAME_H * 0.78, GAME_W * 0.80, Math.round(GAME_W * 0.034));
    ctx.restore();

    // Újra gomb
    const btnW = Math.round(GAME_W * 0.32);
    const btnH = Math.round(GAME_H * 0.09);
    const btnX = cx - btnW / 2;
    const btnY = GAME_H * 0.875;
    ctx.save();
    ctx.shadowColor = PRIMARY;
    ctx.shadowBlur  = 14;
    ctx.fillStyle   = PRIMARY;
    ctx.beginPath(); ctx.roundRect(btnX, btnY, btnW, btnH, 9); ctx.fill();
    ctx.shadowBlur    = 0;
    ctx.fillStyle     = '#fff';
    ctx.font          = `700 ${Math.round(btnH * 0.44)}px Inter, system-ui, sans-serif`;
    ctx.textAlign     = 'center';
    ctx.textBaseline  = 'middle';
    ctx.fillText('Újra játszom', cx, btnY + btnH / 2);
    ctx.restore();
  }

  /* ── Szövegtördelés segédfüggvény ─────────────────────────── */
  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line  = '';
    let lineY = y;
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (context.measureText(test).width > maxWidth && line) {
        context.fillText(line, x, lineY);
        line  = word;
        lineY += lineHeight;
      } else {
        line = test;
      }
    }
    context.fillText(line, x, lineY);
  }

  // Első rajzolás
  drawIntro();
})();

