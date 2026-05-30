// Játékzóna easter egg + ghost animation + secret overlay + Konami code
(function () {
      var eggHint      = document.getElementById('jz-egg-hint');
      var eggMsgEl     = document.getElementById('jz-egg-msg');
      var ghostAnnounce= document.getElementById('jz-ghost-announce');
      var secretOverlay= document.getElementById('jzSecretOverlay');
      var secretClose  = document.getElementById('jzSecretClose');
      var konamiFlash  = document.getElementById('jzKonamiFlash');

      // ── Easter egg: 3-lépéses trigger + kötvényszellem ──────────────
      var eggClicks  = 0;
      var eggCooldown= false;
      var msgTimer   = null;

      function showEggMsg(text) {
        if (!eggMsgEl) return;
        eggMsgEl.style.opacity = '1';
        eggMsgEl.textContent = text;
        clearTimeout(msgTimer);
        msgTimer = setTimeout(function () { eggMsgEl.style.opacity = '0'; }, 4500);
      }

      function handleEggActivation() {
        if (eggCooldown) return;
        eggClicks++;

        if (eggClicks === 1) {
          eggHint.classList.add('jz-egg-shake');
          setTimeout(function () { eggHint.classList.remove('jz-egg-shake'); }, 600);
          showEggMsg('Mintha mozdult volna valami a fal m\u00f6g\u00f6tt\u2026');

        } else if (eggClicks === 2) {
          eggHint.classList.add('jz-egg-flash');
          setTimeout(function () { eggHint.classList.remove('jz-egg-flash'); }, 900);
          showEggMsg('A k\u00f6tv\u00e9nyek k\u00f6z\u00f6tt valami zizeg\u2026');

        } else if (eggClicks >= 3) {
          eggClicks = 0;
          eggCooldown = true;
          launchGhost();
          showEggMsg('A k\u00f6tv\u00e9nyszellem \u00e1tsuhant a termen.');
          if (ghostAnnounce) {
            ghostAnnounce.textContent = 'K\u00f6tv\u00e9nyszellem aktiv\u00e1lva.';
            setTimeout(function () { ghostAnnounce.textContent = ''; }, 3000);
          }
          setTimeout(function () { eggCooldown = false; }, 3500);
        }
      }

      if (eggHint) {
        eggHint.addEventListener('click', handleEggActivation);
      }

      // ── Kötvényszellem animáció ──────────────────────────────────────
      function launchGhost() {
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var ghostW = Math.min(72, Math.max(44, vw * 0.16));
        var ghostH = ghostW * 1.25;

        var edges = ['left', 'right', 'top', 'bottom'];
        var si = Math.floor(Math.random() * 4);
        var ei = (si + 2 + (Math.random() > .5 ? 1 : 0)) % 4;

        function edgePos(edge) {
          if (edge === 'left')   return { x: -ghostW - 10, y: 30 + Math.random() * (vh - 60) };
          if (edge === 'right')  return { x: vw + 10,       y: 30 + Math.random() * (vh - 60) };
          if (edge === 'top')    return { x: 30 + Math.random() * (vw - 60), y: -ghostH - 10 };
          /* bottom */           return { x: 30 + Math.random() * (vw - 60), y: vh + 10 };
        }

        var start    = edgePos(edges[si]);
        var end      = edgePos(edges[ei]);
        var duration = 2.5 + Math.random() * 1.3;

        var ghost = document.createElement('div');
        ghost.className = 'museum-ghost';
        ghost.setAttribute('aria-hidden', 'true');
        ghost.style.width  = ghostW + 'px';
        ghost.style.height = ghostH + 'px';
        ghost.style.left   = start.x + 'px';
        ghost.style.top    = start.y + 'px';
        ghost.style.setProperty('--dx', (end.x - start.x) + 'px');
        ghost.style.setProperty('--dy', (end.y - start.y) + 'px');
        ghost.style.setProperty('--ghost-duration', duration + 's');

        ghost.innerHTML =
          '<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg" class="museum-ghost__svg" aria-hidden="true">' +
          '<path class="museum-ghost__body" d="M12,44 Q12,8 40,8 Q68,8 68,44 L68,80 Q64,70 60,80 Q56,70 52,80 Q48,70 44,80 Q40,70 36,80 Q32,70 28,80 Q24,70 20,80 Q16,70 12,80 Z"/>' +
          '<line class="museum-ghost__line" x1="24" y1="31" x2="56" y2="31"/>' +
          '<line class="museum-ghost__line" x1="24" y1="39" x2="56" y2="39"/>' +
          '<line class="museum-ghost__line" x1="24" y1="47" x2="46" y2="47"/>' +
          '<circle class="museum-ghost__eye" cx="31" cy="59" r="3.5"/>' +
          '<circle class="museum-ghost__eye" cx="49" cy="59" r="3.5"/>' +
          '</svg>';

        document.body.appendChild(ghost);
        requestAnimationFrame(function () { ghost.classList.add('is-flying'); });
        setTimeout(function () { if (ghost.parentNode) ghost.parentNode.removeChild(ghost); }, (duration + 0.3) * 1000);
      }

      // ── Secret overlay – akadálymentes nyitás/zárás ──────────────────
      var lastFocusedBeforeSecret = null;
      var ariaHiddenElements = [];

      function getSecretFocusable() {
        if (!secretOverlay) return [];
        return Array.prototype.slice.call(
          secretOverlay.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter(function (el) { return el.offsetParent !== null; });
      }

      function openSecret() {
        if (!secretOverlay) return;
        lastFocusedBeforeSecret =
          document.activeElement && typeof document.activeElement.focus === 'function'
            ? document.activeElement
            : null;
        document.body.style.overflow = 'hidden';
        ariaHiddenElements = [];
        Array.prototype.forEach.call(document.body.children, function(el) {
          if (el !== secretOverlay && !el.getAttribute('aria-hidden')) {
            el.setAttribute('aria-hidden', 'true');
            ariaHiddenElements.push(el);
          }
        });
        secretOverlay.classList.add('visible');
        if (secretClose) { secretClose.focus(); }
      }

      function closeSecret() {
        if (!secretOverlay) return;
        secretOverlay.classList.remove('visible');
        document.body.style.overflow = '';
        ariaHiddenElements.forEach(function(el) { el.removeAttribute('aria-hidden'); });
        ariaHiddenElements = [];
        if (lastFocusedBeforeSecret &&
            lastFocusedBeforeSecret !== document.body &&
            lastFocusedBeforeSecret.isConnected) {
          lastFocusedBeforeSecret.focus();
        }
        lastFocusedBeforeSecret = null;
      }

      if (secretClose) {
        secretClose.addEventListener('click', closeSecret);
      }
      if (secretOverlay) {
        secretOverlay.addEventListener('click', function (e) {
          if (e.target === secretOverlay) closeSecret();
        });
        secretOverlay.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' || e.key === 'Esc') {
            e.preventDefault();
            closeSecret();
            return;
          }
          if (e.key === 'Tab') {
            var f = getSecretFocusable();
            if (!f.length) { e.preventDefault(); return; }
            var first = f[0];
            var last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        });
      }

      // ── Konami code ──────────────────────────────────────────────────
      var konami    = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
      var konamiIdx = 0;
      document.addEventListener('keydown', function (e) {
        if (e.key === konami[konamiIdx]) {
          konamiIdx++;
          if (konamiIdx === konami.length) {
            konamiIdx = 0;
            konamiFlash.style.display = 'block';
            setTimeout(function () { konamiFlash.style.display = 'none'; }, 700);
            openSecret();
          }
        } else { konamiIdx = 0; }
      });

      // ── Logo spin ────────────────────────────────────────────────────
      var logo = document.querySelector('.jz-logo-spin');
      if (logo) {
        logo.addEventListener('click', function () {
          konamiFlash.style.display = 'block';
          setTimeout(function () { konamiFlash.style.display = 'none'; }, 700);
        });
      }
    })();