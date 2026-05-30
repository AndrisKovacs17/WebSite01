// Info Hub filter, search, hero carousel, hash navigation - moved from inline script
// ── ic-link saját szín hover ──
      document.querySelectorAll('.ic-link').forEach(function(el) {
        var clr = el.style.color || getComputedStyle(el).color;
        el.style.setProperty('--ic-clr', clr);
      });

      // ── Info Hub filter & search ──
      (function () {
        var allWraps = document.querySelectorAll('.info-card-wrap');
        var tabs = document.querySelectorAll('.filter-tab');
        var searchDesktop = document.getElementById('infoSearch');
        var searchMobile = document.getElementById('infoSearchMobile');
        var resultCount = document.getElementById('resultCount');
        var emptyState = document.getElementById('emptyState');
        var sectionLabels = document.querySelectorAll('.cat-section-label').forEach;

        // Category section containers
        var sections = {
          gepjarmu: { grid: document.getElementById('grid-gepjarmu'), label: document.querySelector('#gepjarmu .cat-section-label') ? document.querySelector('#gepjarmu') : null },
          ingatlan: { grid: document.getElementById('grid-ingatlan'), label: document.querySelector('#ingatlan') },
          utazas:   { grid: document.getElementById('grid-utazas'),   label: document.querySelector('#utazas') },
          admin:    { grid: document.getElementById('grid-admin'),     label: document.querySelector('#admin') }
        };

        var currentCat = 'all';
        var currentQ = '';

        function applyFilter() {
          var visible = 0;
          allWraps.forEach(function (wrap) {
            var cat = wrap.dataset.cat;
            var title = wrap.dataset.title || '';
            var desc = wrap.dataset.desc || '';
            var catOk = currentCat === 'all' || cat === currentCat;
            var qOk = currentQ === '' || title.includes(currentQ) || desc.includes(currentQ);
            if (catOk && qOk) {
              wrap.classList.remove('hidden');
              visible++;
            } else {
              wrap.classList.add('hidden');
            }
          });

          // Show/hide section headers based on visibility
          ['gepjarmu', 'ingatlan', 'utazas', 'admin'].forEach(function (key) {
            var grid = document.getElementById('grid-' + key);
            var anchor = document.getElementById(key);
            var headLabel = anchor ? anchor.nextElementSibling : null;
            // check if any card in this grid is visible
            var anyVisible = grid && grid.querySelector('.info-card-wrap:not(.hidden)');
            if (grid) grid.style.display = anyVisible ? '' : 'none';
            // find the cat-section-label preceding the grid
            if (anchor) {
              anchor.style.display = anyVisible ? '' : 'none';
            }
          });

          resultCount.textContent = visible + ' cikk';
          emptyState.style.display = visible === 0 ? 'block' : 'none';
        }

        tabs.forEach(function (tab) {
          tab.addEventListener('click', function () {
            tabs.forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');
            currentCat = tab.dataset.cat;
            applyFilter();
            // Scroll to cards
            if (currentCat !== 'all') {
              var anchor = document.getElementById(currentCat);
              if (anchor) { setTimeout(function() { anchor.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50); }
            }
          });
        });

        function onSearch(e) {
          currentQ = e.target.value.toLowerCase().trim();
          // sync both search inputs
          if (searchDesktop) searchDesktop.value = e.target.value;
          if (searchMobile) searchMobile.value = e.target.value;
          // reset cat filter to all when typing
          if (currentQ) {
            tabs.forEach(function (t) { t.classList.remove('active'); });
            document.querySelector('[data-cat="all"]').classList.add('active');
            currentCat = 'all';
          }
          applyFilter();
        }

        if (searchDesktop) searchDesktop.addEventListener('input', onSearch);
        if (searchMobile) searchMobile.addEventListener('input', onSearch);

        // Global reset
        function resetFilter() {
          currentCat = 'all';
          currentQ = '';
          if (searchDesktop) searchDesktop.value = '';
          if (searchMobile) searchMobile.value = '';
          tabs.forEach(function (t) { t.classList.remove('active'); });
          document.querySelector('[data-cat="all"]').classList.add('active');
          applyFilter();
        }
        var resetBtn = document.getElementById('infok-reset-btn');
        if (resetBtn) resetBtn.addEventListener('click', resetFilter);

        // ── Hero carousel ──
        (function () {
          var strip = document.getElementById('hero-strip');
          if (!strip) return;
          var cards = Array.from(strip.querySelectorAll('[data-hc]'));
          var spacers = Array.from(strip.querySelectorAll('[data-hcsp]'));
          var dotsEl = document.getElementById('hero-dots');

          cards.forEach(function (_, i) {
            var d = document.createElement('div');
            d.className = 'hc-dot';
            d.addEventListener('click', function () { scrollToCard(i); });
            dotsEl.appendChild(d);
          });

          function updateSpacer() {
            if (!cards.length) return;
            var pad = Math.max(20, strip.clientWidth / 2 - cards[0].offsetWidth / 2);
            spacers.forEach(function (s) { s.style.minWidth = pad + 'px'; s.style.flexShrink = '0'; });
          }

          function findCenter() {
            var cx = strip.scrollLeft + strip.clientWidth / 2;
            var best = null, bestDist = Infinity;
            cards.forEach(function (c) {
              var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - cx);
              if (d < bestDist) { bestDist = d; best = c; }
            });
            cards.forEach(function (c, i) {
              var on = c === best;
              c.classList.toggle('is-center', on);
              if (dotsEl.children[i]) dotsEl.children[i].classList.toggle('on', on);
            });
          }

          function scrollToCard(i) {
            var c = cards[i];
            if (!c) return;
            smoothScrollTo(c.offsetLeft - strip.clientWidth / 2 + c.offsetWidth / 2);
          }

          var _target = 0, _raf = null;
          function smoothScrollTo(dest) {
            var max = strip.scrollWidth - strip.clientWidth;
            _target = Math.max(0, Math.min(dest, max));
            if (!_raf) _raf = requestAnimationFrame(_tick);
          }
          function _tick() {
            var diff = _target - strip.scrollLeft;
            if (Math.abs(diff) < 0.6) {
              strip.scrollLeft = _target; findCenter(); _raf = null; return;
            }
            strip.scrollLeft += diff * 0.13;
            findCenter();
            _raf = requestAnimationFrame(_tick);
          }

          strip.addEventListener('wheel', function (e) {
            var max = strip.scrollWidth - strip.clientWidth;
            if (max <= 0) return; // nincs scrollolható tartalom
            var next = Math.max(0, Math.min(_target + e.deltaY * 1.1, max));
            // Ha már a szélén vagyunk és ugyanabba az irányba görgetnek → átadjuk az oldalnak
            if (next === _target) return;
            e.preventDefault();
            _target = next;
            if (!_raf) _raf = requestAnimationFrame(_tick);
          }, { passive: false });

          var drag = false, startX = 0, startSL = 0;
          strip.addEventListener('mousedown', function (e) {
            drag = true; startX = e.clientX; startSL = strip.scrollLeft;
            _target = strip.scrollLeft;
            if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
            strip.classList.add('grabbing'); e.preventDefault();
          });
          document.addEventListener('mouseup', function () {
            if (!drag) return; drag = false; strip.classList.remove('grabbing');
          });
          strip.addEventListener('mousemove', function (e) {
            if (!drag) return;
            var nx = startSL - (e.clientX - startX);
            strip.scrollLeft = nx; _target = nx;
          });

          strip.addEventListener('scroll', findCenter, { passive: true });

          requestAnimationFrame(function () {
            updateSpacer();
            requestAnimationFrame(function () {
              _target = cards[0]
                ? cards[0].offsetLeft - strip.clientWidth / 2 + cards[0].offsetWidth / 2
                : 0;
              strip.scrollLeft = _target;
              findCenter();
            });
          });
          window.addEventListener('resize', function () { updateSpacer(); findCenter(); });
        })();

        // Anchor hash navigation → activate corresponding tab
        function checkHash() {
          var hash = window.location.hash.replace('#', '');
          var hashToCat = { gepjarmu: 'gepjarmu', ingatlan: 'ingatlan', utazas: 'utazas', admin: 'admin' };
          if (hashToCat[hash]) {
            tabs.forEach(function (t) { t.classList.remove('active'); });
            var matchTab = document.querySelector('[data-cat="' + hashToCat[hash] + '"]');
            if (matchTab) matchTab.classList.add('active');
            currentCat = hashToCat[hash];
            applyFilter();
          }
        }
        window.addEventListener('hashchange', checkHash);
        checkHash();
      })();