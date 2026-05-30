(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  /* ── Konfiguráció a 3 variánshoz ── */
  var VARIANTS = [
    { svgMount: 'svg-mount-c1', tooltip: 'tooltip-c1', track: 'track-c1', inner: 'inner-c1', left: 'left-c1', meshCol: 'rgba(50,80,200,' },
    { svgMount: 'svg-mount-c2', tooltip: 'tooltip-c2', track: 'track-c2', inner: 'inner-c2', left: 'left-c2', meshCol: 'rgba(190,100,0,' },
    { svgMount: 'svg-mount-c3', tooltip: 'tooltip-c3', track: 'track-c3', inner: 'inner-c3', left: 'left-c3', meshCol: 'rgba(20,120,60,' }
  ];

  /* ── Drag kezelő ── */
  function attachDrag(trackEl, innerEl) {
    var isDragging = false;
    var startX = 0;
    var currentX = 0;
    var maxShift = 0;

    function getMaxShift() {
      /* a map-drag-inner szélessége - a track szélessége = max húzható px */
      return innerEl.offsetWidth - trackEl.offsetWidth;
    }

    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    function setX(x) {
      currentX = clamp(x, -getMaxShift(), 0);
      innerEl.style.transform = 'translateY(-50%) translateX(' + currentX + 'px)';
    }

    /* Egér */
    trackEl.addEventListener('mousedown', function (e) {
      isDragging = true;
      startX = e.clientX - currentX;
      trackEl.style.cursor = 'grabbing';
      e.preventDefault();
    });
    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      setX(e.clientX - startX);
    });
    window.addEventListener('mouseup', function () {
      if (!isDragging) return;
      isDragging = false;
      trackEl.style.cursor = 'grab';
    });

    /* Touch */
    trackEl.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX - currentX;
    }, { passive: true });
    trackEl.addEventListener('touchmove', function (e) {
      setX(e.touches[0].clientX - startX);
    }, { passive: true });
  }

  /* ── Mesh generátor ── */
  function buildMesh(svg, meshLineColor, uid) {
    var defs = svg.querySelector('defs') ||
               svg.insertBefore(document.createElementNS(NS, 'defs'), svg.firstChild);

    /* Magyarország maszk */
    var mask = document.createElementNS(NS, 'mask');
    mask.setAttribute('id', 'hm_' + uid);
    var mbg = document.createElementNS(NS, 'rect');
    mbg.setAttribute('x', '0'); mbg.setAttribute('y', '0');
    mbg.setAttribute('width', '1000'); mbg.setAttribute('height', '613');
    mbg.setAttribute('fill', 'black');
    mask.appendChild(mbg);
    svg.querySelectorAll('.hu-county').forEach(function (p) {
      var cl = p.cloneNode(false);
      cl.setAttribute('fill', 'white');
      cl.setAttribute('stroke', 'white');
      cl.setAttribute('stroke-width', '2');
      cl.removeAttribute('class');
      cl.removeAttribute('filter');
      mask.appendChild(cl);
    });
    defs.appendChild(mask);

    /* Glow filter */
    var filt = document.createElementNS(NS, 'filter');
    filt.setAttribute('id', 'wg_' + uid);
    filt.setAttribute('x', '-60%'); filt.setAttribute('y', '-60%');
    filt.setAttribute('width', '220%'); filt.setAttribute('height', '220%');
    filt.innerHTML = '<feGaussianBlur stdDeviation="0.8" result="b"/>' +
                     '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>';
    defs.appendChild(filt);

    /* Spot gradient */
    var sg = document.createElementNS(NS, 'radialGradient');
    sg.setAttribute('id', 'sg_' + uid);
    sg.setAttribute('gradientUnits', 'userSpaceOnUse');
    sg.setAttribute('cx', '-999'); sg.setAttribute('cy', '-999'); sg.setAttribute('r', '220');
    [[0,'white',1],[0.5,'white',0.45],[1,'white',0]].forEach(function (s) {
      var st = document.createElementNS(NS, 'stop');
      st.setAttribute('offset', s[0]);
      st.setAttribute('stop-color', s[1]);
      st.setAttribute('stop-opacity', s[2]);
      sg.appendChild(st);
    });
    defs.appendChild(sg);

    var smask = document.createElementNS(NS, 'mask');
    smask.setAttribute('id', 'sm_' + uid);
    var sr = document.createElementNS(NS, 'rect');
    sr.setAttribute('x','0'); sr.setAttribute('y','0');
    sr.setAttribute('width','1000'); sr.setAttribute('height','613');
    sr.setAttribute('fill', 'url(#sg_' + uid + ')');
    smask.appendChild(sr);
    defs.appendChild(smask);

    /* Pontok */
    var ss = 1337;
    function rnd() { ss = (ss * 1664525 + 1013904223) >>> 0; return ss / 4294967295; }

    var seats = [
      [400,225],[170,165],[97,280],[155,380],[280,430],[390,485],
      [415,420],[315,295],[250,330],[228,215],[510,98],[595,148],
      [665,118],[802,155],[784,238],[555,295],[500,390],[730,390],
      [635,485],[165,450]
    ];
    var pts = seats.slice();
    seats.forEach(function (s) {
      var n = 3 + Math.floor(rnd() * 2);
      for (var k = 0; k < n; k++) {
        var a = rnd() * Math.PI * 2, d = 28 + rnd() * 48;
        pts.push([s[0] + Math.cos(a)*d, s[1] + Math.sin(a)*d]);
      }
    });
    for (var i = 0; i < 22; i++) { pts.push([rnd()*920+40, rnd()*530+40]); }

    var MAX = 115;
    var LC = meshLineColor;
    var DC = meshLineColor;

    var webMesh = svg.getElementById('web-mesh');
    if (!webMesh) {
      webMesh = document.createElementNS(NS, 'g');
      webMesh.setAttribute('id', 'web-mesh');
      webMesh.setAttribute('pointer-events', 'none');
      svg.appendChild(webMesh);
    }

    /* Halvány alap réteg */
    var gDim = document.createElementNS(NS, 'g');
    pts.forEach(function (pi, i) {
      pts.forEach(function (pj, j) {
        if (j <= i) return;
        var dx = pi[0]-pj[0], dy = pi[1]-pj[1], dd = Math.sqrt(dx*dx+dy*dy);
        if (dd < MAX) {
          var ln = document.createElementNS(NS, 'line');
          ln.setAttribute('x1', pi[0].toFixed(1)); ln.setAttribute('y1', pi[1].toFixed(1));
          ln.setAttribute('x2', pj[0].toFixed(1)); ln.setAttribute('y2', pj[1].toFixed(1));
          ln.setAttribute('stroke', LC + (0.28*(1-dd/MAX)).toFixed(3) + ')');
          ln.setAttribute('stroke-width', '0.7');
          gDim.appendChild(ln);
        }
      });
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', pi[0].toFixed(1)); c.setAttribute('cy', pi[1].toFixed(1));
      c.setAttribute('r', i < seats.length ? '2.8' : '1.6');
      c.setAttribute('fill', DC + (i < seats.length ? '0.75)' : '0.45)'));
      gDim.appendChild(c);
    });
    webMesh.appendChild(gDim);

    /* Spotlight réteg */
    var gHot = document.createElementNS(NS, 'g');
    gHot.setAttribute('mask', 'url(#sm_' + uid + ')');
    pts.forEach(function (pi, i) {
      pts.forEach(function (pj, j) {
        if (j <= i) return;
        var dx = pi[0]-pj[0], dy = pi[1]-pj[1], dd = Math.sqrt(dx*dx+dy*dy);
        if (dd < MAX) {
          var ln = document.createElementNS(NS, 'line');
          ln.setAttribute('x1', pi[0].toFixed(1)); ln.setAttribute('y1', pi[1].toFixed(1));
          ln.setAttribute('x2', pj[0].toFixed(1)); ln.setAttribute('y2', pj[1].toFixed(1));
          ln.setAttribute('stroke', LC + (0.9*(1-dd/MAX)).toFixed(3) + ')');
          ln.setAttribute('stroke-width', '1.5');
          gHot.appendChild(ln);
        }
      });
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', pi[0].toFixed(1)); c.setAttribute('cy', pi[1].toFixed(1));
      c.setAttribute('r', '2.6');
      c.setAttribute('fill', DC + '0.88)');
      gHot.appendChild(c);
    });
    webMesh.appendChild(gHot);

    webMesh.setAttribute('filter', 'url(#wg_' + uid + ')');
    webMesh.setAttribute('mask', 'url(#hm_' + uid + ')');

    /* Egér spotlight */
    svg.addEventListener('mousemove', function (e) {
      var pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      var sp = pt.matrixTransform(svg.getScreenCTM().inverse());
      sg.setAttribute('cx', sp.x.toFixed(1));
      sg.setAttribute('cy', sp.y.toFixed(1));
    });
    svg.addEventListener('mouseleave', function () {
      sg.setAttribute('cx', '-999'); sg.setAttribute('cy', '-999');
    });
  }

  /* ── Térkép építő egy variánshoz ── */
  function buildVariant(cfg, sourceSvg, idx) {
    var mount = document.getElementById(cfg.svgMount);
    if (!mount) return;

    var svg = sourceSvg.cloneNode(true);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', 'auto');
    svg.style.overflow = 'hidden';
    svg.style.display = 'block';

    /* 3D shadow */
    var features = svg.getElementById('features');
    if (features) {
      features.style.filter =
        'drop-shadow(0px 4px 0px rgba(0,0,0,0.18)) ' +
        'drop-shadow(0px 14px 2px rgba(0,0,0,0.10)) ' +
        'drop-shadow(0px 30px 4px rgba(0,0,0,0.05))';
    }

    mount.appendChild(svg);

    var uid = 'v' + idx;
    buildMesh(svg, cfg.meshCol, uid);

    /* Tooltip */
    var tooltip = document.getElementById(cfg.tooltip);
    var innerEl = document.getElementById(cfg.inner);
    if (tooltip) {
      svg.querySelectorAll('.hu-county').forEach(function (path) {
        var name = path.getAttribute('name');
        if (!name) return;
        path.style.pointerEvents = 'all';
        path.addEventListener('mouseenter', function () {
          tooltip.textContent = name; tooltip.style.opacity = '1';
        });
        path.addEventListener('mousemove', function (e) {
          var r = innerEl.getBoundingClientRect();
          tooltip.style.left = (e.clientX - r.left + 14) + 'px';
          tooltip.style.top  = (e.clientY - r.top  - 36) + 'px';
        });
        path.addEventListener('mouseleave', function () {
          tooltip.style.opacity = '0';
        });
      });
    }

    /* Drag */
    var trackEl = document.getElementById(cfg.track);
    if (trackEl && innerEl) {
      attachDrag(trackEl, innerEl);
    }
  }

  /* ── SVG forrás betöltése ── */
  fetch('../index-prototype/')
    .then(function (r) { return r.text(); })
    .then(function (html) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      var sourceSvg = doc.querySelector('svg');
      if (!sourceSvg) { console.error('SVG nem található'); return; }

      VARIANTS.forEach(function (cfg, idx) {
        buildVariant(cfg, sourceSvg, idx);
      });
    })
    .catch(function (e) { console.error('Betöltési hiba:', e); });

}());