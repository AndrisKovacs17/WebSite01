(function () {
    'use strict';
    var NS = 'http://www.w3.org/2000/svg';

    /* Szabolcs-ra fókuszált kezdő viewport */
    var VB = { x: 575, y: 15, w: 430, h: 330 };
    var SZABOLCS_VB = { x: 575, y: 15, w: 430, h: 330 };
    var FULL_VB = { x: -10, y: -10, w: 1020, h: 633 };
    var svgRef = null;

    function applyVB(svg) {
      svg.setAttribute('viewBox', VB.x.toFixed(1) + ' ' + VB.y.toFixed(1) + ' ' + VB.w.toFixed(1) + ' ' + VB.h.toFixed(1));
    }

    function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

    /* Zoom egy ponthoz képest */
    function zoomAround(svg, screenX, screenY, factor) {
      var pt = svg.createSVGPoint();
      pt.x = screenX; pt.y = screenY;
      var sp = pt.matrixTransform(svg.getScreenCTM().inverse());
      VB.x = sp.x - (sp.x - VB.x) * factor;
      VB.y = sp.y - (sp.y - VB.y) * factor;
      VB.w = clamp(VB.w * factor, 60, 1100);
      VB.h = VB.w * 0.613;
      applyVB(svg);
    }

    /* Zoom a nézet közepéhez képest */
    function zoomCenter(svg, factor) {
      var cx = VB.x + VB.w / 2;
      var cy = VB.y + VB.h / 2;
      VB.w = clamp(VB.w * factor, 60, 1100);
      VB.h = VB.w * 0.613;
      VB.x = cx - VB.w / 2;
      VB.y = cy - VB.h / 2;
      applyVB(svg);
    }

    /* Drag állapot */
    var drag = { active: false, lastX: 0, lastY: 0 };

    function buildMesh(svg, uid) {
      var defs = svg.querySelector('defs') ||
                 svg.insertBefore(document.createElementNS(NS, 'defs'), svg.firstChild);

      /* Maszk: Magyarország kontúr */
      var mask = document.createElementNS(NS, 'mask');
      mask.setAttribute('id', 'hm_' + uid);
      var mbg = document.createElementNS(NS, 'rect');
      mbg.setAttribute('x', '0'); mbg.setAttribute('y', '0');
      mbg.setAttribute('width', '1000'); mbg.setAttribute('height', '613');
      mbg.setAttribute('fill', 'black');
      mask.appendChild(mbg);
      svg.querySelectorAll('.hu-county').forEach(function (p) {
        var cl = p.cloneNode(false);
        cl.setAttribute('fill', 'white'); cl.setAttribute('stroke', 'white');
        cl.setAttribute('stroke-width', '2');
        cl.removeAttribute('class'); cl.removeAttribute('filter');
        mask.appendChild(cl);
      });
      defs.appendChild(mask);

      /* Glow filter */
      var filt = document.createElementNS(NS, 'filter');
      filt.setAttribute('id', 'wg_' + uid);
      filt.setAttribute('x', '-60%'); filt.setAttribute('y', '-60%');
      filt.setAttribute('width', '220%'); filt.setAttribute('height', '220%');
      filt.innerHTML = '<feGaussianBlur stdDeviation="0.7" result="b"/>' +
                       '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>';
      defs.appendChild(filt);

      /* Spotlight gradiens */
      var sg = document.createElementNS(NS, 'radialGradient');
      sg.setAttribute('id', 'sg_' + uid);
      sg.setAttribute('gradientUnits', 'userSpaceOnUse');
      sg.setAttribute('cx', '-999'); sg.setAttribute('cy', '-999'); sg.setAttribute('r', '200');
      [[0,'white',1],[0.5,'white',0.5],[1,'white',0]].forEach(function (s) {
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
      sr.setAttribute('x', '0'); sr.setAttribute('y', '0');
      sr.setAttribute('width', '1000'); sr.setAttribute('height', '613');
      sr.setAttribute('fill', 'url(#sg_' + uid + ')');
      smask.appendChild(sr);
      defs.appendChild(smask);

      /* Csomópontok */
      var seed = 1337;
      function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967295; }

      var seats = [
        [400,225],[170,165],[97,280],[155,380],[280,430],[390,485],
        [415,420],[315,295],[250,330],[228,215],[510,98],[595,148],
        [665,118],[802,155],[784,238],[555,295],[500,390],[730,390],
        [635,485],[165,450]
      ];
      var pts = seats.slice();
      seats.forEach(function (s) {
        var n = 3 + Math.floor(rnd() * 3);
        for (var k = 0; k < n; k++) {
          var a = rnd() * Math.PI * 2, d = 25 + rnd() * 55;
          pts.push([s[0] + Math.cos(a)*d, s[1] + Math.sin(a)*d]);
        }
      });
      for (var i = 0; i < 25; i++) { pts.push([rnd()*920+40, rnd()*530+40]); }

      var MAX = 115;
      var LC = 'rgba(50,80,200,';

      var webMesh = document.createElementNS(NS, 'g');
      webMesh.setAttribute('id', 'web-mesh-' + uid);
      webMesh.setAttribute('pointer-events', 'none');

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
            ln.setAttribute('stroke', LC + (0.25*(1-dd/MAX)).toFixed(3) + ')');
            ln.setAttribute('stroke-width', '0.7');
            gDim.appendChild(ln);
          }
        });
        var c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', pi[0].toFixed(1)); c.setAttribute('cy', pi[1].toFixed(1));
        c.setAttribute('r', i < seats.length ? '2.8' : '1.5');
        c.setAttribute('fill', LC + (i < seats.length ? '0.7)' : '0.4)'));
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
            ln.setAttribute('stroke', LC + (0.85*(1-dd/MAX)).toFixed(3) + ')');
            ln.setAttribute('stroke-width', '1.5');
            gHot.appendChild(ln);
          }
        });
        var c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', pi[0].toFixed(1)); c.setAttribute('cy', pi[1].toFixed(1));
        c.setAttribute('r', '2.5');
        c.setAttribute('fill', LC + '0.9)');
        gHot.appendChild(c);
      });
      webMesh.appendChild(gHot);

      webMesh.setAttribute('filter', 'url(#wg_' + uid + ')');
      webMesh.setAttribute('mask', 'url(#hm_' + uid + ')');

      svg.appendChild(webMesh);

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

    function initHero(sourceSvg) {
      var mount = document.getElementById('map-svg-mount');
      if (!mount) return;

      var svg = sourceSvg.cloneNode(true);
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      applyVB(svg);
      svgRef = svg;

      /* 3D árnyék a features rétegre */
      var features = svg.getElementById('features');
      if (features) {
        features.style.filter =
          'drop-shadow(0px 5px 0px rgba(0,0,0,.2)) ' +
          'drop-shadow(0px 18px 3px rgba(0,0,0,.10)) ' +
          'drop-shadow(0px 35px 6px rgba(0,0,0,.05))';
      }

      mount.appendChild(svg);
      buildMesh(svg, 'hero');

      /* Tooltip */
      var tooltip = document.getElementById('map-tooltip');
      svg.querySelectorAll('.hu-county').forEach(function (path) {
        var name = path.getAttribute('name');
        if (!name || !tooltip) return;
        path.style.pointerEvents = 'all';
        path.addEventListener('mouseenter', function () {
          tooltip.textContent = name; tooltip.style.opacity = '1';
        });
        path.addEventListener('mousemove', function (e) {
          var r = mount.getBoundingClientRect();
          tooltip.style.left = (e.clientX - r.left + 14) + 'px';
          tooltip.style.top  = (e.clientY - r.top  - 36) + 'px';
        });
        path.addEventListener('mouseleave', function () {
          tooltip.style.opacity = '0';
        });
      });

      /* ── Drag kezelők ── */
      var container = document.getElementById('hero-left');

      container.addEventListener('mousedown', function (e) {
        if (e.target.closest('.map-zoom-controls')) return;
        drag.active = true;
        drag.lastX = e.clientX;
        drag.lastY = e.clientY;
        e.preventDefault();
      });
      window.addEventListener('mousemove', function (e) {
        if (!drag.active || !svgRef) return;
        var dx = e.clientX - drag.lastX;
        var dy = e.clientY - drag.lastY;
        drag.lastX = e.clientX;
        drag.lastY = e.clientY;
        var r = svgRef.getBoundingClientRect();
        VB.x -= dx * (VB.w / r.width);
        VB.y -= dy * (VB.h / r.height);
        applyVB(svgRef);
      });
      window.addEventListener('mouseup', function () { drag.active = false; });

      /* Touch drag */
      var touchStart = { x: 0, y: 0 };
      container.addEventListener('touchstart', function (e) {
        touchStart.x = e.touches[0].clientX;
        touchStart.y = e.touches[0].clientY;
      }, { passive: true });
      container.addEventListener('touchmove', function (e) {
        if (!svgRef) return;
        var dx = e.touches[0].clientX - touchStart.x;
        var dy = e.touches[0].clientY - touchStart.y;
        touchStart.x = e.touches[0].clientX;
        touchStart.y = e.touches[0].clientY;
        var r = svgRef.getBoundingClientRect();
        VB.x -= dx * (VB.w / r.width);
        VB.y -= dy * (VB.h / r.height);
        applyVB(svgRef);
      }, { passive: true });

      /* Touch pinch zoom */
      var lastDist = 0;
      container.addEventListener('touchstart', function (e) {
        if (e.touches.length === 2) {
          lastDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
        }
      }, { passive: true });
      container.addEventListener('touchmove', function (e) {
        if (e.touches.length !== 2 || !svgRef) return;
        var dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (lastDist > 0) {
          var factor = lastDist / dist;
          var mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          var my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
          zoomAround(svgRef, mx, my, factor);
        }
        lastDist = dist;
      }, { passive: true });

      /* Görgős zoom */
      container.addEventListener('wheel', function (e) {
        e.preventDefault();
        if (!svgRef) return;
        zoomAround(svgRef, e.clientX, e.clientY, e.deltaY > 0 ? 1.18 : 0.847);
      }, { passive: false });

      /* Zoom gombok */
      document.getElementById('zoom-in').addEventListener('click', function () {
        if (svgRef) zoomCenter(svgRef, 0.72);
      });
      document.getElementById('zoom-out').addEventListener('click', function () {
        if (svgRef) zoomCenter(svgRef, 1.38);
      });
      document.getElementById('zoom-szabolcs').addEventListener('click', function () {
        VB.x = SZABOLCS_VB.x; VB.y = SZABOLCS_VB.y;
        VB.w = SZABOLCS_VB.w; VB.h = SZABOLCS_VB.h;
        if (svgRef) applyVB(svgRef);
      });
    }

    /* SVG betöltése */
    fetch('/index-prototype')
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var src = doc.querySelector('svg');
        if (!src) { console.error('SVG nem található'); return; }
        initHero(src);
      })
      .catch(function (e) { console.error('Betöltési hiba:', e); });

    /* Services toggle (main.js ezt nem kezeli, itt pótoljuk) */
    document.addEventListener('DOMContentLoaded', function () {
      var toggleBtn  = document.getElementById('toggle-services');
      var toggleText = document.getElementById('toggle-text');
      var hidden     = document.getElementById('hidden-services');
      if (!toggleBtn || !hidden) return;
      toggleBtn.addEventListener('click', function () {
        var isHidden = hidden.classList.contains('d-none');
        hidden.classList.toggle('d-none', !isHidden);
        toggleText.textContent = isHidden ? 'Kevesebb szolgáltatás' : 'További szolgáltatások';
      });
    });

  }());