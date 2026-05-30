(function () {
  /* ── Megye tooltip ── */
  var tooltip = document.getElementById('map-tooltip');
  var mapWrap = document.querySelector('.map-wrap');
  document.querySelectorAll('.hu-county').forEach(function (path) {
    var name = path.getAttribute('name');
    if (!name) return;
    path.addEventListener('mouseenter', function () { tooltip.textContent = name; tooltip.style.opacity = '1'; });
    path.addEventListener('mousemove', function (e) {
      var r = mapWrap.getBoundingClientRect();
      tooltip.style.left = (e.clientX - r.left + 14) + 'px';
      tooltip.style.top  = (e.clientY - r.top  - 36) + 'px';
    });
    path.addEventListener('mouseleave', function () { tooltip.style.opacity = '0'; });
  });

  /* ── Pókháló mesh generálás ── */
  var NS  = 'http://www.w3.org/2000/svg';
  var svg = document.querySelector('.map-wrap svg');

  /* SVG overflow levágása */
  svg.style.overflow = 'hidden';

  /* Glow filter + megye-maszk hozzáadása a defs-hez */
  var defs = svg.querySelector('defs') || svg.insertBefore(document.createElementNS(NS, 'defs'), svg.firstChild);

  /* Magyarország maszk: csak a county path-okon látszik a háló */
  var mask = document.createElementNS(NS, 'mask');
  mask.setAttribute('id', 'hungarymask');
  /* fekete alap = minden rejtett */
  var mbg = document.createElementNS(NS, 'rect');
  mbg.setAttribute('x','0'); mbg.setAttribute('y','0');
  mbg.setAttribute('width','1000'); mbg.setAttribute('height','613');
  mbg.setAttribute('fill','black');
  mask.appendChild(mbg);
  /* minden megye path klónozása fehérrel = megmutatja */
  document.querySelectorAll('.hu-county').forEach(function(p) {
    var clone = p.cloneNode(false);
    clone.setAttribute('fill', 'white');
    clone.setAttribute('stroke', 'white');
    clone.setAttribute('stroke-width', '2');
    clone.removeAttribute('class');
    clone.removeAttribute('filter');
    mask.appendChild(clone);
  });
  defs.appendChild(mask);

  var filt = document.createElementNS(NS, 'filter');
  filt.setAttribute('id', 'webglow');
  filt.setAttribute('x', '-60%'); filt.setAttribute('y', '-60%');
  filt.setAttribute('width', '220%'); filt.setAttribute('height', '220%');
  filt.innerHTML = '<feGaussianBlur stdDeviation="0.8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>';
  defs.appendChild(filt);

  /* ── 3D lift: blur=0/1, nagy Y-offset – shadow a lap ALATT van, nem köré ── */
  document.getElementById('features').style.filter =
    'drop-shadow(0px 5px 0px rgba(10,18,55,0.80)) ' +
    'drop-shadow(0px 16px 2px rgba(10,18,55,0.50)) ' +
    'drop-shadow(0px 38px 5px rgba(10,18,55,0.22))';

  /* Determinisztikus pseudo-random (seed) */
  var s = 1337;
  function rnd() { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967295; }

  /* ── Megyeszékhelyek (SVG koordináták) ── */
  var seats = [
    [400,225],[170,165],[97,280],[155,380],[280,430],[390,485],
    [415,420],[315,295],[250,330],[228,215],[510,98],[595,148],
    [665,118],[802,155],[784,238],[555,295],[500,390],[730,390],
    [635,485],[165,450]
  ];

  /* Székhelyenként 3–4 műholdpont 30–65px-en belül */
  var pts = [];
  for (var i = 0; i < seats.length; i++) {
    pts.push([seats[i][0], seats[i][1]]);
  }
  for (var i = 0; i < seats.length; i++) {
    var n = 3 + Math.floor(rnd() * 2);
    for (var k = 0; k < n; k++) {
      var a = rnd() * Math.PI * 2, d = 28 + rnd() * 48;
      pts.push([seats[i][0] + Math.cos(a)*d, seats[i][1] + Math.sin(a)*d]);
    }
  }
  /* 22 egyenletes scatter a fedetlen területekre */
  for (var i = 0; i < 22; i++) {
    pts.push([rnd() * 920 + 40, rnd() * 530 + 40]);
  }

  var g    = document.getElementById('web-mesh');
  var MAX  = 115;
  var LCOL = 'rgba(190,110,0,';
  var DCOL = 'rgba(200,120,0,';

  var gDim = document.createElementNS(NS, 'g');
  for (var i = 0; i < pts.length; i++) {
    for (var j = i + 1; j < pts.length; j++) {
      var dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1];
      var d  = Math.sqrt(dx * dx + dy * dy);
      if (d < MAX) {
        var ln = document.createElementNS(NS, 'line');
        ln.setAttribute('x1', pts[i][0].toFixed(1)); ln.setAttribute('y1', pts[i][1].toFixed(1));
        ln.setAttribute('x2', pts[j][0].toFixed(1)); ln.setAttribute('y2', pts[j][1].toFixed(1));
        var op = (0.30 * (1 - d / MAX)).toFixed(3);
        ln.setAttribute('stroke', LCOL + op + ')');
        ln.setAttribute('stroke-width', '0.7');
        gDim.appendChild(ln);
      }
    }
  }
  for (var i = 0; i < pts.length; i++) {
    var c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', pts[i][0].toFixed(1)); c.setAttribute('cy', pts[i][1].toFixed(1));
    var isSeat = i < seats.length;
    c.setAttribute('r', isSeat ? '2.8' : '1.6');
    c.setAttribute('fill', DCOL + (isSeat ? '0.80)' : '0.50)'));
    gDim.appendChild(c);
  }
  g.appendChild(gDim);

  /* ── Egér-spotlight: radialGradient mask – organikus lágy fálydás ── */
  var spotGrad = document.createElementNS(NS, 'radialGradient');
  spotGrad.setAttribute('id', 'spotgrad');
  spotGrad.setAttribute('gradientUnits', 'userSpaceOnUse');
  spotGrad.setAttribute('cx', '-999'); spotGrad.setAttribute('cy', '-999'); spotGrad.setAttribute('r', '220');
  var sg1 = document.createElementNS(NS, 'stop');
  sg1.setAttribute('offset', '0');    sg1.setAttribute('stop-color', 'white'); sg1.setAttribute('stop-opacity', '1');
  var sg2 = document.createElementNS(NS, 'stop');
  sg2.setAttribute('offset', '0.5'); sg2.setAttribute('stop-color', 'white'); sg2.setAttribute('stop-opacity', '0.45');
  var sg3 = document.createElementNS(NS, 'stop');
  sg3.setAttribute('offset', '1');    sg3.setAttribute('stop-color', 'white'); sg3.setAttribute('stop-opacity', '0');
  spotGrad.appendChild(sg1); spotGrad.appendChild(sg2); spotGrad.appendChild(sg3);
  defs.appendChild(spotGrad);

  var spotMask = document.createElementNS(NS, 'mask');
  spotMask.setAttribute('id', 'spotmask');
  var spotRect = document.createElementNS(NS, 'rect');
  spotRect.setAttribute('x', '0'); spotRect.setAttribute('y', '0');
  spotRect.setAttribute('width', '1000'); spotRect.setAttribute('height', '613');
  spotRect.setAttribute('fill', 'url(#spotgrad)');
  spotMask.appendChild(spotRect);
  defs.appendChild(spotMask);

  /* ── Erős (glow) réteg – csak az egér körül, organikusan fadől ── */
  var gHot = document.createElementNS(NS, 'g');
  gHot.setAttribute('mask', 'url(#spotmask)');
  for (var i = 0; i < pts.length; i++) {
    for (var j = i + 1; j < pts.length; j++) {
      var dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1];
      var d  = Math.sqrt(dx * dx + dy * dy);
      if (d < MAX) {
        var ln = document.createElementNS(NS, 'line');
        ln.setAttribute('x1', pts[i][0].toFixed(1)); ln.setAttribute('y1', pts[i][1].toFixed(1));
        ln.setAttribute('x2', pts[j][0].toFixed(1)); ln.setAttribute('y2', pts[j][1].toFixed(1));
        var op = (0.95 * (1 - d / MAX)).toFixed(3);
        ln.setAttribute('stroke', LCOL + op + ')');
        ln.setAttribute('stroke-width', '1.5');
        gHot.appendChild(ln);
      }
    }
  }
  for (var i = 0; i < pts.length; i++) {
    var c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', pts[i][0].toFixed(1)); c.setAttribute('cy', pts[i][1].toFixed(1));
    c.setAttribute('r', '2.6'); c.setAttribute('fill', DCOL + '0.9)');
    gHot.appendChild(c);
  }
  g.appendChild(gHot);

  /* ── Egér pozíció követés ── */
  svg.addEventListener('mousemove', function(e) {
    var pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    var sp = pt.matrixTransform(svg.getScreenCTM().inverse());
    spotGrad.setAttribute('cx', sp.x.toFixed(1));
    spotGrad.setAttribute('cy', sp.y.toFixed(1));
  });
  svg.addEventListener('mouseleave', function() {
    spotGrad.setAttribute('cx', '-999');
    spotGrad.setAttribute('cy', '-999');
  });

  g.setAttribute('filter', 'url(#webglow)');
  g.setAttribute('mask', 'url(#hungarymask)');
}());