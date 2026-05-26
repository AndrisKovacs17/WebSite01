/**
 * Zebrás Bácsi – Frogger mini játék, emoji verzió
 * Nyugdíjbiztosítás oldal
 * v4: explicit globalAlpha=1 + háttér lap emoji mögé
 */
(function () {
  'use strict';

  var CAR_EMOJIS = ['🚗','🚕','🚙','🏎️','🚌','🚐','🚑','🚒'];
  var EMOJI_BACSI = '🧑‍🦯';
  var EMOJI_DEAD  = '💀';

  // Sáv háttérszín (emoji mögé festett "tábla")
  var LANE_COLORS = ['#e17055','#0984e3','#e67e22','#6c3483','#16a085','#c0392b'];

  function init() {
    var canvas = document.getElementById('zebras-bacsi-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var DPR = Math.min(window.devicePixelRatio || 1, 3);
    var W   = 640;
    var H   = 520;
    var ROWS = 8;
    var RH   = H / ROWS;   // 65 logikai px / sor

    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    ctx.scale(DPR, DPR);

    var FONT_CAR   = '42px serif';
    var FONT_BACSI = '50px serif';
    var FONT_FLAGS = '30px serif';

    // Hitboxok (logikai px)
    var CAR_W = 54, CAR_H = RH * 0.72;
    var P_W   = 32, P_H   = 48;

    var LANE_CFG = [
      { row: 1, speed: 1.4, dir:  1, count: 3 },
      { row: 2, speed: 2.1, dir: -1, count: 2 },
      { row: 3, speed: 1.7, dir:  1, count: 3 },
      { row: 4, speed: 2.5, dir: -1, count: 2 },
      { row: 5, speed: 1.9, dir:  1, count: 3 },
      { row: 6, speed: 2.3, dir: -1, count: 2 },
    ];

    var player, lanes, state, rafId, moveLock;

    function pickEmoji() { return CAR_EMOJIS[Math.floor(Math.random() * CAR_EMOJIS.length)]; }

    function resetGame() {
      player   = { row: ROWS - 1 };
      moveLock = false;
      state    = 'idle';
      lanes    = LANE_CFG.map(function (cfg, idx) {
        return Object.assign({}, cfg, {
          color: LANE_COLORS[idx % LANE_COLORS.length],
          cars: Array.from({ length: cfg.count }, function (_, i) {
            return {
              x:     (W / cfg.count) * i + (Math.random() * 50 - 25),
              emoji: pickEmoji(),
            };
          }),
        });
      });
    }

    resetGame();

    var overlay  = document.getElementById('zebras-bacsi-overlay');
    var retryBtn = document.getElementById('zebras-bacsi-retry');
    var oTitle   = document.getElementById('zebras-result-title');
    var oSub     = document.getElementById('zebras-result-sub');
    var oCta     = document.getElementById('zebras-result-cta');

    function showOverlay(won) {
      if (!overlay) return;
      overlay.style.background = won ? 'rgba(39,174,96,0.93)' : 'rgba(192,57,43,0.93)';
      if (oTitle) oTitle.textContent = won ? 'Átért a Bácsi! 🎉' : 'Elütötték a Bácsit! 💥';
      if (oSub)   oSub.textContent   = won ? 'A jövőre is ilyen gondosan tervez?' : 'Jobb lett volna előre tervezni... Próbálja újra!';
      if (oCta) oCta.style.display = won ? 'block' : 'none';
      overlay.style.display = 'flex';
    }
    function hideOverlay() { if (overlay) overlay.style.display = 'none'; }

    if (retryBtn) retryBtn.addEventListener('click', function () { hideOverlay(); resetGame(); startGame(); });

    document.addEventListener('keydown', function (e) {
      var rect = canvas.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) return;
      if (['ArrowUp','ArrowDown'].includes(e.key) && state === 'playing') e.preventDefault();
      if (state !== 'playing') {
        if ([' ','Enter','ArrowUp'].includes(e.key)) { hideOverlay(); resetGame(); startGame(); }
        return;
      }
      if (moveLock) return;
      if (e.key === 'ArrowUp'   || e.key === 'w') stepUp();
      if (e.key === 'ArrowDown' || e.key === 's') stepDown();
    });
    canvas.addEventListener('click', handleTap);
    canvas.addEventListener('touchstart', function (e) { e.preventDefault(); handleTap(); }, { passive: false });

    function handleTap() {
      if (state !== 'playing') { hideOverlay(); resetGame(); startGame(); return; }
      stepUp();
    }

    function startGame() { state = 'playing'; if (rafId) cancelAnimationFrame(rafId); loop(); }
    function stepUp() {
      if (moveLock || state !== 'playing') return;
      player.row = Math.max(0, player.row - 1);
      lock();
      if (player.row === 0) { state = 'won'; showOverlay(true); }
    }
    function stepDown() {
      if (moveLock || state !== 'playing') return;
      player.row = Math.min(ROWS - 1, player.row + 1);
      lock();
    }
    function lock() { moveLock = true; setTimeout(function () { moveLock = false; }, 130); }

    function loop() {
      if (state !== 'playing') { draw(); return; }
      lanes.forEach(function (lane) {
        lane.cars.forEach(function (car) {
          car.x += lane.speed * lane.dir;
          if (lane.dir ===  1 && car.x > W + 20)      car.x = -CAR_W - 10;
          if (lane.dir === -1 && car.x + CAR_W < -20) car.x = W + 10;
        });
      });
      var px = W / 2 - P_W / 2;
      var py = player.row * RH + (RH - P_H) / 2;
      for (var li = 0; li < lanes.length; li++) {
        var lane = lanes[li];
        if (lane.row !== player.row) continue;
        for (var ci = 0; ci < lane.cars.length; ci++) {
          var car = lane.cars[ci];
          var cy = lane.row * RH + (RH - CAR_H) / 2;
          if (px < car.x + CAR_W && px + P_W > car.x &&
              py < cy + CAR_H    && py + P_H  > cy) {
            state = 'dead'; showOverlay(false); draw(); return;
          }
        }
      }
      draw();
      rafId = requestAnimationFrame(loop);
    }

    // ─── Segéd: kerekített tégla ──────────────────────────────────────
    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    // ─── Segéd: emoji rajzolása MINDIG teljes opacitással ─────────────
    function drawEmoji(emoji, cx, cy, font, flip) {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle   = '#000000';   // opaque – nem befolyásolja a color emojit, de az alphát igen
      ctx.font        = font;
      ctx.textBaseline = 'middle';
      ctx.textAlign   = 'center';
      if (flip) {
        ctx.translate(cx, cy);
        ctx.scale(-1, 1);
        ctx.fillText(emoji, 0, 0);
      } else {
        ctx.fillText(emoji, cx, cy);
      }
      ctx.restore();
    }

    // ─── Rajzolás ────────────────────────────────────────────────────────
    function draw() {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, W, H);

      // ── Sorok háttere ──
      for (var r = 0; r < ROWS; r++) {
        var ry = r * RH;

        if (r === 0) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#27ae60';
          ctx.fillRect(0, ry, W, RH);
          ctx.fillStyle = 'rgba(255,255,255,0.78)';
          for (var zi = 0; zi < W; zi += 40) ctx.fillRect(zi, ry, 20, RH);
          // Zászlók
          drawEmoji('🏁', 44,     ry + RH * 0.5, FONT_FLAGS, false);
          drawEmoji('🏁', W - 44, ry + RH * 0.5, FONT_FLAGS, false);
          // Szöveg
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#145a32';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('BIZTONSÁGOS OLDAL', W / 2, ry + RH * 0.5);

        } else if (r === ROWS - 1) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#aab8c2';
          ctx.fillRect(0, ry, W, RH);
          ctx.strokeStyle = 'rgba(0,0,0,0.18)';
          ctx.lineWidth = 1.5;
          for (var gi = 0; gi < W; gi += 22) {
            ctx.beginPath(); ctx.moveTo(gi, ry); ctx.lineTo(gi, ry + RH); ctx.stroke();
          }
          ctx.beginPath(); ctx.moveTo(0, ry + RH * 0.5); ctx.lineTo(W, ry + RH * 0.5); ctx.stroke();
          ctx.fillStyle = 'rgba(0,0,0,0.07)';
          ctx.fillRect(0, ry, W, 4);

        } else {
          ctx.globalAlpha = 1;
          ctx.fillStyle = r % 2 === 0 ? '#1a1a2e' : '#16213e';
          ctx.fillRect(0, ry, W, RH);
          ctx.setLineDash([18, 12]);
          ctx.strokeStyle = 'rgba(253,203,110,0.60)';
          ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.moveTo(0, ry + RH * 0.5); ctx.lineTo(W, ry + RH * 0.5); ctx.stroke();
          ctx.setLineDash([]);
          ctx.strokeStyle = 'rgba(255,255,255,0.06)';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(W, ry); ctx.stroke();
        }
      }

      // ── Autók ──
      lanes.forEach(function (lane) {
        var mcy = lane.row * RH + RH * 0.5;        // sor közepe (y)
        var plateH = RH * 0.78;
        var plateY = mcy - plateH / 2;

        lane.cars.forEach(function (car) {
          var ecx = car.x + (CAR_W + 6) / 2;
          drawEmoji(car.emoji, ecx, mcy, FONT_CAR, lane.dir === -1);
        });
      });

      // ── Bácsi ──
      var bcx = W / 2;
      var bcy = player.row * RH + RH * 0.5;
      var bradius = RH * 0.40;

      drawEmoji(state === 'dead' ? EMOJI_DEAD : EMOJI_BACSI, bcx, bcy, FONT_BACSI, false);

      // ── Idle felirat ──
      if (state === 'idle') {
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(0,0,0,0.70)';
        ctx.fillRect(0, H / 2 - 38, W, 76);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👆 Kattintson vagy nyomja az ↑ nyilat a kezdéshez', W / 2, H / 2);
      }

      ctx.restore();
    }

    draw();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
