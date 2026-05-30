// ══════════════════════════════════════════════════════
// Közös SVG térkép generátor függvény
// params:
//   mountId     – az elem id, amibe az SVG kerül
//   tooltipId   – tooltip element id
//   darkMode    – bool, sötét háttérre való stílus
//   wrapId      – az egér-koordináta-számításhoz
// ══════════════════════════════════════════════════════
(function() {
  var NS = 'http://www.w3.org/2000/svg';

  // ── SVG forrás betöltése (az index-prototype.html-ből inline másolva)
  // A térkép SVG tartalmát fetch-csel töltjük be a meglévő fájlból
  var COUNTY_PATHS = [
    // Szabolcs – külön, kiemelve
    { id: 'HUSZ', cls: 'hu-county hu-szabolcs', d: 'M857.6 225.9l-0.1-0.1-2.8-3.7-2.7-11.5-2.3-3.5-6.2 7-3.5-3.5 0.7-5.2-3.8-6.9-9.4-5.3-4.5 0.3-3.3 5.6-1.6 4.2-2.5 2.5-2.8-1.7-2.4-3-2.7-1.1-2.9 0-5.6-2.1-2.6-2.5-6.6-1.4-2.2-3.1-12.6-9.9 0.6-11.2 1.7-10.7-1.4-4.2-4.2-1.5-5.2 3.1-21.7 1.7-6 2.4-11.1-8.9-9.7-1.3 0.8-5.2 0.9-2.5 1.5-1.5 5.8-3.9 0.9-0.2 3.3 0.2 1.4-0.6 0.5-1.2 0.4-1.4 0.9-1 2.2-0.1 1.4 1.2 1.2 1.7 1.6 1.4 1.9 0.4 6.4-0.4-0.9 0 4.5-0.2 4.6-1.3 3.4-3.4 1.3-6.3-0.4-2.7-1-1.6-0.7-1.8 0.2-3.5 1-2.8 1.5-2.9 1.9-2.4 2-1.4 2.5-0.4 8.6 0.4 5-0.7 2.2 0 5.3 2.6 2.6 0.4 2.5-0.4 10.2-6.4 1.6-0.4 2.2-0.1 2.5-2 2.4-2.6 2-1.5 8.5-0.6 2.6-0.9 1.9-1.6 3.8-4.5 4.5-6.7 0.8-0.8 1.6-0.2 2.6 1.4 1.2 0.3 3.7-2.4 2.8-4.6 5-10.6 2.8-3.1z m-40.8-81.4l-7.1-0.6 0-6-3.8-2.8-5.1 3.6-2.4-2.5-6.8 0.5-2.3 4.5-1.3 4.3-1 10.1-1 12.1 8.1 2.6 9.2 2.5 4.4 3 7.4-1.5 3.1-6.6 0.3-7.1 4.4-1 0.4-7.6-0.4-7-2.7-3.1-3.4 2.6z', name: 'Szabolcs-Szatmár-Bereg' },
    // Többi megye – összefoglalt path adat nélkül, helyette fetch-csel töltjük be
  ];

  // Fetch az SVG-t az index-prototype.html-ből
  fetch('../index-prototype/')
    .then(function(r) { return r.text(); })
    .then(function(html) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      var sourceSvg = doc.querySelector('svg');
      if (!sourceSvg) return;

      // Minden variánshoz létrehozzuk a térképet
      buildMap('svg-mount-a', 'map-tooltip-a', false,  'map-wrap-a',  sourceSvg);
      buildMap('svg-mount-b', null,             false,  'svg-mount-b', sourceSvg, true);
      buildMap('svg-mount-c', 'map-tooltip-c', true,  'map-wrap-c',  sourceSvg);
    })
    .catch(function(e) { console.warn('SVG betöltési hiba:', e); });

  function buildMap(mountId, tooltipId, darkMode, wrapId, sourceSvg, bgOnly) {
    var mount = document.getElementById(mountId);
    if (!mount) return;

    // SVG klónozása
    var svg = sourceSvg.cloneNode(true);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', 'auto');
    svg.style.overflow = 'hidden';

    // Sötét módban a megyék átszínezése
    if (darkMode) {
      svg.querySelectorAll('.hu-county').forEach(function(p) {
        if (!p.classList.contains('hu-szabolcs')) {
          p.style.fill = 'rgba(255,255,255,0.06)';
          p.style.stroke = 'rgba(255,255,255,0.14)';
        }
      });
    }

    // 3D shadow a features csoportra
    var features = svg.getElementById('features');
    if (features) {
      if (darkMode) {
        features.style.filter =
          'drop-shadow(0px 4px 0px rgba(0,0,0,0.9)) ' +
          'drop-shadow(0px 14px 2px rgba(0,0,0,0.6)) ' +
          'drop-shadow(0px 32px 4px rgba(0,0,0,0.3))';
      } else if (!bgOnly) {
        features.style.filter =
          'drop-shadow(0px 5px 0px rgba(10,18,55,0.80)) ' +
          'drop-shadow(0px 16px 2px rgba(10,18,55,0.50)) ' +
          'drop-shadow(0px 38px 5px rgba(10,18,55,0.22))';
      }
    }

    mount.appendChild(svg);

    // Mesh hálózat generálás
    buildMesh(svg, darkMode, bgOnly);

    // Tooltip
    if (tooltipId) {
      var tooltip = document.getElementById(tooltipId);
      var wrap = document.getElementById(wrapId);
      svg.querySelectorAll('.hu-county').forEach(function(path) {
        var name = path.getAttribute('name');
        if (!name || !tooltip) return;
        path.addEventListener('mouseenter', function() { tooltip.textContent = name; tooltip.style.opacity = '1'; });
        path.addEventListener('mousemove', function(e) {
          var r = wrap.getBoundingClientRect();
          tooltip.style.left = (e.clientX - r.left + 14) + 'px';
          tooltip.style.top  = (e.clientY - r.top  - 36) + 'px';
        });
        path.addEventListener('mouseleave', function() { tooltip.style.opacity = '0'; });
      });
    }
  }

  function buildMesh(svg, darkMode, bgOnly) {
    var defs = svg.querySelector('defs') || svg.insertBefore(document.createElementNS(NS, 'defs'), svg.firstChild);

    // Egyedi ID-k generálása (több példány esetén ne ütközzenek)
    var uid = Math.random().toString(36).slice(2, 7);

    // Magyarország maszk
    var mask = document.createElementNS(NS, 'mask');
    mask.setAttribute('id', 'hungarymask_' + uid);
    var mbg = document.createElementNS(NS, 'rect');
    mbg.setAttribute('x','0'); mbg.setAttribute('y','0');
    mbg.setAttribute('width','1000'); mbg.setAttribute('height','613');
    mbg.setAttribute('fill','black');
    mask.appendChild(mbg);
    svg.querySelectorAll('.hu-county').forEach(function(p) {
      var clone = p.cloneNode(false);
      clone.setAttribute('fill', 'white');
      clone.setAttribute('stroke', 'white');
      clone.setAttribute('stroke-width', '2');
      clone.removeAttribute('class');
      clone.removeAttribute('filter');
      mask.appendChild(clone);
    });
    defs.appendChild(mask);

    // Glow filter
    var filt = document.createElementNS(NS, 'filter');
    filt.setAttribute('id', 'webglow_' + uid);
    filt.setAttribute('x', '-60%'); filt.setAttribute('y', '-60%');
    filt.setAttribute('width', '220%'); filt.setAttribute('height', '220%');
    filt.innerHTML = '<feGaussianBlur stdDeviation="0.8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>';
    defs.appendChild(filt);

    // Spot gradient
    var spotGrad = document.createElementNS(NS, 'radialGradient');
    spotGrad.setAttribute('id', 'spotgrad_' + uid);
    spotGrad.setAttribute('gradientUnits', 'userSpaceOnUse');
    spotGrad.setAttribute('cx', '-999'); spotGrad.setAttribute('cy', '-999'); spotGrad.setAttribute('r', '200');
    var sg1 = document.createElementNS(NS, 'stop');
    sg1.setAttribute('offset', '0'); sg1.setAttribute('stop-color', 'white'); sg1.setAttribute('stop-opacity', '1');
    var sg2 = document.createElementNS(NS, 'stop');
    sg2.setAttribute('offset', '0.5'); sg2.setAttribute('stop-color', 'white'); sg2.setAttribute('stop-opacity', '0.45');
    var sg3 = document.createElementNS(NS, 'stop');
    sg3.setAttribute('offset', '1'); sg3.setAttribute('stop-color', 'white'); sg3.setAttribute('stop-opacity', '0');
    spotGrad.appendChild(sg1); spotGrad.appendChild(sg2); spotGrad.appendChild(sg3);
    defs.appendChild(spotGrad);

    var spotMask = document.createElementNS(NS, 'mask');
    spotMask.setAttribute('id', 'spotmask_' + uid);
    var spotRect = document.createElementNS(NS, 'rect');
    spotRect.setAttribute('x','0'); spotRect.setAttribute('y','0');
    spotRect.setAttribute('width','1000'); spotRect.setAttribute('height','613');
    spotRect.setAttribute('fill', 'url(#spotgrad_' + uid + ')');
    spotMask.appendChild(spotRect);
    defs.appendChild(spotMask);

    // Pontok generálása
    var ss = 1337 + (darkMode ? 100 : 0);
    function rnd() { ss = (ss * 1664525 + 1013904223) >>> 0; return ss / 4294967295; }

    var seats = [
      [400,225],[170,165],[97,280],[155,380],[280,430],[390,485],
      [415,420],[315,295],[250,330],[228,215],[510,98],[595,148],
      [665,118],[802,155],[784,238],[555,295],[500,390],[730,390],
      [635,485],[165,450]
    ];

    var pts = [];
    for (var i = 0; i < seats.length; i++) { pts.push([seats[i][0], seats[i][1]]); }
    for (var i = 0; i < seats.length; i++) {
      var n = 3 + Math.floor(rnd() * 2);
      for (var k = 0; k < n; k++) {
        var a = rnd() * Math.PI * 2, d = 28 + rnd() * 48;
        pts.push([seats[i][0] + Math.cos(a)*d, seats[i][1] + Math.sin(a)*d]);
      }
    }
    for (var i = 0; i < 22; i++) { pts.push([rnd() * 920 + 40, rnd() * 530 + 40]); }

    var MAX  = 115;
    var LCOL = darkMode ? 'rgba(255,167,38,' : 'rgba(190,110,0,';
    var DCOL = darkMode ? 'rgba(255,180,50,' : 'rgba(200,120,0,';

    var webMesh = svg.getElementById('web-mesh');
    if (!webMesh) {
      webMesh = document.createElementNS(NS, 'g');
      webMesh.setAttribute('id', 'web-mesh');
      webMesh.setAttribute('pointer-events', 'none');
      svg.appendChild(webMesh);
    }

    var gDim = document.createElementNS(NS, 'g');
    var baseOp = bgOnly ? 0.22 : 0.30;
    for (var i = 0; i < pts.length; i++) {
      for (var j = i + 1; j < pts.length; j++) {
        var dx = pts[i][0]-pts[j][0], dy = pts[i][1]-pts[j][1];
        var dd = Math.sqrt(dx*dx + dy*dy);
        if (dd < MAX) {
          var ln = document.createElementNS(NS, 'line');
          ln.setAttribute('x1', pts[i][0].toFixed(1)); ln.setAttribute('y1', pts[i][1].toFixed(1));
          ln.setAttribute('x2', pts[j][0].toFixed(1)); ln.setAttribute('y2', pts[j][1].toFixed(1));
          var op = (baseOp * (1 - dd / MAX)).toFixed(3);
          ln.setAttribute('stroke', LCOL + op + ')');
          ln.setAttribute('stroke-width', '0.7');
          gDim.appendChild(ln);
        }
      }
    }
    for (var i = 0; i < pts.length; i++) {
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', pts[i][0].toFixed(1)); c.setAttribute('cy', pts[i][1].toFixed(1));
      c.setAttribute('r', i < seats.length ? '2.8' : '1.6');
      c.setAttribute('fill', DCOL + (i < seats.length ? '0.80)' : '0.50)'));
      gDim.appendChild(c);
    }
    webMesh.appendChild(gDim);

    // Hot réteg (spotlight glow)
    var gHot = document.createElementNS(NS, 'g');
    gHot.setAttribute('mask', 'url(#spotmask_' + uid + ')');
    for (var i = 0; i < pts.length; i++) {
      for (var j = i + 1; j < pts.length; j++) {
        var dx = pts[i][0]-pts[j][0], dy = pts[i][1]-pts[j][1];
        var dd = Math.sqrt(dx*dx + dy*dy);
        if (dd < MAX) {
          var ln = document.createElementNS(NS, 'line');
          ln.setAttribute('x1', pts[i][0].toFixed(1)); ln.setAttribute('y1', pts[i][1].toFixed(1));
          ln.setAttribute('x2', pts[j][0].toFixed(1)); ln.setAttribute('y2', pts[j][1].toFixed(1));
          var op = (0.95 * (1 - dd / MAX)).toFixed(3);
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
    webMesh.appendChild(gHot);

    webMesh.setAttribute('filter', 'url(#webglow_' + uid + ')');
    webMesh.setAttribute('mask', 'url(#hungarymask_' + uid + ')');

    // Egér spotlight
    var sg = spotGrad;
    svg.addEventListener('mousemove', function(e) {
      var pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      var sp = pt.matrixTransform(svg.getScreenCTM().inverse());
      sg.setAttribute('cx', sp.x.toFixed(1));
      sg.setAttribute('cy', sp.y.toFixed(1));
    });
    svg.addEventListener('mouseleave', function() {
      sg.setAttribute('cx', '-999');
      sg.setAttribute('cy', '-999');
    });
  }

}());