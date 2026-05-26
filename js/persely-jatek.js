(function () {
  'use strict';

  const scene = document.getElementById('persely-scene');
  if (!scene) return;

  const TOTAL = 8;
  let dropped = 0;

  /* Stilusok */
  const style = document.createElement('style');
  style.textContent = `
    #persely-scene {
      position: relative;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 20px 52px;
      min-height: 480px;
      padding: 32px 24px 28px;
      background: linear-gradient(150deg, #fff8ef 0%, #eff4ff 100%);
      border-radius: 14px;
      overflow: hidden;
      user-select: none;
      -webkit-user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .ps-coins-panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }
    .ps-hint {
      font-size: 15px;
      font-weight: 700;
      color: #15233c;
      text-align: center;
      line-height: 1.5;
    }
    .ps-hint small {
      display: block;
      font-weight: 400;
      font-size: 12px;
      color: #888;
      margin-top: 3px;
    }
    .ps-coins-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px 8px;
    }
    .ps-coin {
      font-size: 54px;
      line-height: 1.1;
      cursor: grab;
      display: block;
      text-align: center;
      transition: transform 0.15s, filter 0.15s, opacity 0.22s;
      touch-action: none;
    }
    .ps-coin:not(.ps-coin-used):not(.ps-dragging):hover {
      transform: scale(1.24) rotate(-9deg);
      filter: drop-shadow(0 4px 12px rgba(245,168,32,0.65));
    }
    .ps-coin.ps-dragging  { opacity: 0.28; transform: scale(0.82); cursor: grabbing; }
    .ps-coin.ps-coin-used { opacity: 0;    pointer-events: none; }
    .ps-ghost {
      position: fixed;
      pointer-events: none;
      z-index: 99999;
      font-size: 62px;
      line-height: 1;
      transform: translate(-50%, -50%) scale(1.20) rotate(16deg);
      filter: drop-shadow(0 12px 22px rgba(0,0,0,0.30));
    }
    .ps-pig-panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      flex-shrink: 0;
    }
    .ps-slot-label {
      font-size: 11px;
      font-weight: 700;
      color: #0d6efd;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .ps-dropzone {
      width: 96px;
      height: 58px;
      border: 3px dashed #0d6efd;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      background: rgba(255,255,255,0.80);
      transition: background 0.18s, transform 0.18s, box-shadow 0.18s;
    }
    .ps-dropzone.ps-over {
      background: rgba(13,110,253,0.14);
      transform: scale(1.13);
      box-shadow: 0 0 0 5px rgba(13,110,253,0.22);
      border-style: solid;
    }
    .ps-pig {
      font-size: 180px;
      line-height: 0.93;
      display: block;
    }
    .ps-pig.ps-shake { animation: ps-shake 0.42s ease; }
    @keyframes ps-shake {
      0%,100% { transform: rotate(0)     scale(1);    }
      18%      { transform: rotate(-8deg) scale(1.09); }
      36%      { transform: rotate(8deg)  scale(1.13); }
      54%      { transform: rotate(-5deg) scale(1.07); }
      72%      { transform: rotate(4deg)  scale(1.04); }
    }
    .ps-pile {
      min-height: 42px;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: flex-start;
      gap: 1px 2px;
      max-width: 240px;
      padding-top: 4px;
    }
    .ps-pile-coin {
      font-size: 30px;
      display: inline-block;
      animation: ps-pop 0.38s cubic-bezier(0.34,1.56,0.64,1) forwards;
    }
    @keyframes ps-pop {
      from { transform: scale(0) translateY(-34px); opacity: 0; }
      to   { transform: scale(1) translateY(0);     opacity: 1; }
    }
    .ps-counter {
      font-size: 19px;
      font-weight: 800;
      color: #15233c;
      margin-top: 10px;
    }
    .ps-counter.ps-done { color: #0f5132; font-size: 24px; }
    .ps-sparkle {
      position: absolute;
      font-size: 22px;
      pointer-events: none;
      z-index: 20;
      animation: ps-fly 0.92s ease-out forwards;
    }
    @keyframes ps-fly {
      from { opacity: 1; transform: translate(0,0) scale(1) rotate(0); }
      to   { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0.2) rotate(210deg); }
    }
  `;
  document.head.appendChild(style);

  /* DOM */
  scene.innerHTML =
    '<div class="ps-coins-panel">' +
      '<div class="ps-hint">Húzd be az érméket!<small>fogd meg \uD83E\uDE99 &rarr; ejtsd a nyílásra</small></div>' +
      '<div class="ps-coins-grid" id="ps-grid"></div>' +
    '</div>' +
    '<div class="ps-pig-panel">' +
      '<div class="ps-slot-label">&darr; nyílás</div>' +
      '<div class="ps-dropzone" id="ps-dz">\uD83D\uDD73\uFE0F</div>' +
      '<div class="ps-pig" id="ps-pig">\uD83D\uDC37</div>' +
      '<div class="ps-pile" id="ps-pile"></div>' +
      '<div class="ps-counter" id="ps-counter">0 / ' + TOTAL + ' érme</div>' +
    '</div>';

  var grid    = document.getElementById('ps-grid');
  var dz      = document.getElementById('ps-dz');
  var pig     = document.getElementById('ps-pig');
  var pile    = document.getElementById('ps-pile');
  var counter = document.getElementById('ps-counter');

  for (var i = 0; i < TOTAL; i++) {
    var coin = document.createElement('span');
    coin.className   = 'ps-coin';
    coin.textContent = '\uD83E\uDE99';
    grid.appendChild(coin);
    addDrag(coin);
  }

  var ghost   = null;
  var dragSrc = null;
  var overDZ  = false;

  function xy(e) {
    return e.touches
      ? { x: e.touches[0].clientX,        y: e.touches[0].clientY }
      : { x: e.clientX,                   y: e.clientY };
  }
  function xyEnd(e) {
    return e.changedTouches
      ? { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
      : { x: e.clientX,                   y: e.clientY };
  }

  function addDrag(el) {
    el.addEventListener('mousedown',  onStart);
    el.addEventListener('touchstart', onStart, { passive: false });
  }

  function onStart(e) {
    if (dragSrc) return;
    var el = e.currentTarget;
    if (el.classList.contains('ps-coin-used')) return;
    e.preventDefault();
    dragSrc = el;
    el.classList.add('ps-dragging');
    ghost = document.createElement('span');
    ghost.className   = 'ps-ghost';
    ghost.textContent = '\uD83E\uDE99';
    document.body.appendChild(ghost);
    var p = xy(e);
    ghost.style.left = p.x + 'px';
    ghost.style.top  = p.y + 'px';
    document.addEventListener('mousemove',   onMove);
    document.addEventListener('mouseup',     onEnd);
    document.addEventListener('touchmove',   onMove,  { passive: false });
    document.addEventListener('touchend',    onEnd);
    document.addEventListener('touchcancel', onEnd);
  }

  function onMove(e) {
    e.preventDefault();
    var p = xy(e);
    if (ghost) {
      ghost.style.left = p.x + 'px';
      ghost.style.top  = p.y + 'px';
    }
    var r    = dz.getBoundingClientRect();
    var over = p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;
    if (over !== overDZ) {
      overDZ = over;
      dz.classList.toggle('ps-over', over);
    }
  }

  function onEnd(e) {
    document.removeEventListener('mousemove',   onMove);
    document.removeEventListener('mouseup',     onEnd);
    document.removeEventListener('touchmove',   onMove);
    document.removeEventListener('touchend',    onEnd);
    document.removeEventListener('touchcancel', onEnd);
    if (ghost) { ghost.remove(); ghost = null; }
    dz.classList.remove('ps-over');
    overDZ = false;
    var p   = xyEnd(e);
    var r   = dz.getBoundingClientRect();
    var hit = p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;
    if (dragSrc) {
      dragSrc.classList.remove('ps-dragging');
      if (hit) {
        dragSrc.classList.add('ps-coin-used');
        onCoinIn();
      }
      dragSrc = null;
    }
  }

  function onCoinIn() {
    dropped++;
    var mini = document.createElement('span');
    mini.className   = 'ps-pile-coin';
    mini.textContent = '\uD83E\uDE99';
    pile.appendChild(mini);
    pig.classList.remove('ps-shake');
    void pig.offsetWidth;
    pig.classList.add('ps-shake');
    burst(7);
    if (dropped < TOTAL) {
      counter.textContent = dropped + ' / ' + TOTAL + ' \u00E9rme';
    } else {
      counter.textContent = '\uD83C\uDF89 Tele van!';
      counter.classList.add('ps-done');
      setTimeout(function() { burst(24); }, 180);
      setTimeout(function() { burst(18); }, 500);
      revealCTA();
    }
  }

  var SPARKS = ['\u2728','\uD83D\uDCDB','\uD83C\uDF1F','\uD83D\uDCAB','\uD83C\uDF8A','\u2B50','\uD83C\uDF89','\uD83D\uDCB0','\uD83D\uDFE1'];

  function burst(n) {
    var pr = pig.getBoundingClientRect();
    var sr = scene.getBoundingClientRect();
    var cx = pr.left - sr.left + pr.width  / 2;
    var cy = pr.top  - sr.top  + pr.height / 3.2;
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      s.className   = 'ps-sparkle';
      s.textContent = SPARKS[Math.floor(Math.random() * SPARKS.length)];
      s.style.left  = cx + 'px';
      s.style.top   = cy + 'px';
      var a = Math.random() * Math.PI * 2;
      var d = 55 + Math.random() * 135;
      s.style.setProperty('--tx', (Math.cos(a) * d).toFixed(1) + 'px');
      s.style.setProperty('--ty', (Math.sin(a) * d - 48).toFixed(1) + 'px');
      scene.appendChild(s);
      setTimeout(function(el) { return function() { el.remove(); }; }(s), 980);
    }
  }

  function revealCTA() {
    var cta = document.getElementById('persely-cta');
    if (!cta) return;
    setTimeout(function() {
      cta.style.cssText = 'opacity:0;transform:translateY(18px);transition:opacity .7s ease,transform .7s ease;';
      cta.classList.remove('d-none');
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          cta.style.opacity   = '1';
          cta.style.transform = 'translateY(0)';
        });
      });
    }, 750);
  }
})();
