(function() {
    'use strict';

    /* ─── SCROLL PROGRESS BAR ─── */
    var spbar = document.getElementById('scroll-progress-bar');
    function updateScrollBar() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docH = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      spbar.style.width = (docH > 0 ? (scrollTop / docH * 100) : 0) + '%';
    }
    window.addEventListener('scroll', updateScrollBar, { passive: true });

    /* ─── STICKY CTA BAR ─── */
    var ctaBar = document.getElementById('sticky-cta-bar');
    var ctaClose = document.getElementById('sticky-cta-close');
    var ctaDismissed = false;
    ctaClose.addEventListener('click', function() { ctaDismissed = true; ctaBar.classList.remove('visible'); });
    window.addEventListener('scroll', function() {
      if (ctaDismissed) return;
      if (window.scrollY > 600) ctaBar.classList.add('visible');
      else ctaBar.classList.remove('visible');
    }, { passive: true });

    /* ─── TYPEWRITER HEADLINE ─── */
    var phrases = [
      'KGFB biztosítást',
      'Lakásbiztosítást',
      'Életbiztosítást',
      'Utasbiztosítást',
      'Egészségbiztosítást',
      'Nyugdíjcélú megtakarítást'
    ];
    var twEl = document.getElementById('tw-text');
    if (twEl) {
      var pIdx = 0, cIdx = 0, deleting = false, delay = 100;
      function typeStep() {
        var phrase = phrases[pIdx];
        if (!deleting) {
          twEl.textContent = phrase.slice(0, cIdx + 1);
          cIdx++;
          if (cIdx === phrase.length) { deleting = true; delay = 2000; }
          else { delay = 80; }
        } else {
          twEl.textContent = phrase.slice(0, cIdx - 1);
          cIdx--;
          if (cIdx === 0) { deleting = false; pIdx = (pIdx + 1) % phrases.length; delay = 300; }
          else { delay = 45; }
        }
        setTimeout(typeStep, delay);
      }
      setTimeout(typeStep, 800);
    }

    /* ─── PARTICLE CANVAS ─── */
    var pCanvas = document.getElementById('particle-canvas');
    if (pCanvas) {
      var pCtx = pCanvas.getContext('2d');
      var pMouse = { x: null, y: null };
      var particles = [];
      function resizePC() {
        var r = pCanvas.parentElement.getBoundingClientRect();
        pCanvas.width = r.width; pCanvas.height = r.height;
      }
      resizePC();
      window.addEventListener('resize', resizePC);
      pCanvas.parentElement.addEventListener('mousemove', function(e) {
        var r = pCanvas.getBoundingClientRect();
        pMouse.x = e.clientX - r.left;
        pMouse.y = e.clientY - r.top;
      });
      pCanvas.parentElement.addEventListener('mouseleave', function() { pMouse.x = null; });
      for (var i = 0; i < 60; i++) {
        particles.push({
          x: Math.random() * 1000, y: Math.random() * 400,
          vx: (Math.random() - .5) * .6, vy: (Math.random() - .5) * .6,
          r: Math.random() * 2.5 + 1
        });
      }
      function animParticles() {
        requestAnimationFrame(animParticles);
        pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
        var W = pCanvas.width, H = pCanvas.height;
        particles.forEach(function(p) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
          if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
          if (pMouse.x !== null) {
            var dx = p.x - pMouse.x, dy = p.y - pMouse.y, dist = Math.sqrt(dx*dx+dy*dy);
            if (dist < 100) { p.x += dx/dist * 1.2; p.y += dy/dist * 1.2; }
          }
          pCtx.beginPath();
          pCtx.arc(p.x, p.y, p.r, 0, Math.PI*2);
          pCtx.fillStyle = 'rgba(255,167,38,.6)';
          pCtx.fill();
        });
        for (var a = 0; a < particles.length; a++) {
          for (var b = a + 1; b < particles.length; b++) {
            var dx = particles[a].x - particles[b].x;
            var dy = particles[a].y - particles[b].y;
            var dist = Math.sqrt(dx*dx+dy*dy);
            if (dist < 100) {
              pCtx.beginPath();
              pCtx.moveTo(particles[a].x, particles[a].y);
              pCtx.lineTo(particles[b].x, particles[b].y);
              pCtx.strokeStyle = 'rgba(255,167,38,' + (1 - dist/100) * .25 + ')';
              pCtx.lineWidth = .8;
              pCtx.stroke();
            }
          }
        }
      }
      animParticles();
    }

    /* ─── 3D TILT ─── */
    document.querySelectorAll('[data-tilt]').forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var r = card.getBoundingClientRect();
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var rx = (e.clientY - cy) / (r.height / 2) * -12;
        var ry = (e.clientX - cx) / (r.width / 2) * 12;
        card.style.transform = 'perspective(600px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) scale3d(1.04,1.04,1.04)';
        var shine = card.querySelector('.tilt-shine');
        if (shine) {
          var px = ((e.clientX - r.left) / r.width * 100);
          var py = ((e.clientY - r.top) / r.height * 100);
          shine.style.background = 'radial-gradient(circle at ' + px + '% ' + py + '%, rgba(255,255,255,.25) 0%, rgba(255,255,255,0) 60%)';
        }
      });
      card.addEventListener('mouseleave', function() {
        card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale3d(1,1,1)';
      });
    });

    /* ─── RIPPLE ─── */
    window.addRipple = function(btn, e) {
      var r = btn.getBoundingClientRect();
      var size = Math.max(r.width, r.height) * 2;
      var x = e.clientX - r.left - size/2;
      var y = e.clientY - r.top - size/2;
      var wave = document.createElement('span');
      wave.className = 'ripple-wave';
      wave.style.cssText = 'width:'+size+'px;height:'+size+'px;left:'+x+'px;top:'+y+'px;';
      btn.appendChild(wave);
      wave.addEventListener('animationend', function() { wave.remove(); });
    };
    document.querySelectorAll('.ripple-btn').forEach(function(b) {
      b.addEventListener('click', function(e) { addRipple(b, e); });
    });

    /* ─── MAGNETIC BUTTON ─── */
    var magBtn = document.getElementById('mag-btn-1');
    if (magBtn) {
      var magWrap = magBtn.closest('.mag-wrap');
      magWrap.addEventListener('mousemove', function(e) {
        var r = magWrap.getBoundingClientRect();
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var dx = (e.clientX - cx) * .35, dy = (e.clientY - cy) * .35;
        magBtn.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
      });
      magWrap.addEventListener('mouseleave', function() {
        magBtn.style.transform = 'translate(0,0)';
      });
    }

    /* ─── SPOTLIGHT CARDS ─── */
    document.querySelectorAll('[data-spotlight]').forEach(function(card) {
      var glow = card.querySelector('.sp-glow');
      card.addEventListener('mousemove', function(e) {
        var r = card.getBoundingClientRect();
        glow.style.left = (e.clientX - r.left) + 'px';
        glow.style.top = (e.clientY - r.top) + 'px';
      });
    });

    /* ─── ANIMATED COUNTER ─── */
    function animateCounter(el) {
      var target = parseInt(el.dataset.target, 10);
      var suffix = el.dataset.suffix || '';
      var dur = 1800, start = null;
      function step(ts) {
        if (!start) start = ts;
        var prog = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - prog, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (prog < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    var counterDone = false;
    var counterGrid = document.getElementById('counter-grid');
    if (counterGrid) {
      var obs = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting && !counterDone) {
          counterDone = true;
          counterGrid.querySelectorAll('[data-target]').forEach(function(el, i) {
            setTimeout(function() { animateCounter(el); }, i * 150);
          });
        }
      }, { threshold: .4 });
      obs.observe(counterGrid);
    }

    /* ─── SCROLL TIMELINE ─── */
    var stItems = document.querySelectorAll('.st-item[data-st]');
    if (stItems.length) {
      var stObs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            stObs.unobserve(entry.target);
          }
        });
      }, { threshold: .6 });
      stItems.forEach(function(item, i) {
        setTimeout(function() { stObs.observe(item); }, i * 100);
      });
    }

    /* ─── BEFORE/AFTER SLIDER ─── */
    var baWrap = document.getElementById('ba-wrap');
    if (baWrap) {
      var baAfter = document.getElementById('ba-after');
      var baDiv = document.getElementById('ba-div');
      var baHandle = document.getElementById('ba-handle');
      var baDragging = false;
      function setBA(pct) {
        pct = Math.max(5, Math.min(95, pct));
        baAfter.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
        baDiv.style.left = pct + '%';
        baHandle.style.left = pct + '%';
      }
      setBA(50);
      function getX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
      baWrap.addEventListener('mousedown', function() { baDragging = true; });
      baWrap.addEventListener('touchstart', function() { baDragging = true; }, { passive: true });
      window.addEventListener('mousemove', function(e) {
        if (!baDragging) return;
        var r = baWrap.getBoundingClientRect();
        setBA((getX(e) - r.left) / r.width * 100);
      });
      window.addEventListener('touchmove', function(e) {
        if (!baDragging) return;
        var r = baWrap.getBoundingClientRect();
        setBA((getX(e) - r.left) / r.width * 100);
      }, { passive: true });
      window.addEventListener('mouseup', function() { baDragging = false; });
      window.addEventListener('touchend', function() { baDragging = false; });
    }

    /* ─── PRICE ESTIMATOR ─── */
    var peSlider = document.getElementById('pe-slider');
    var pePrice = document.getElementById('pe-price');
    var peLabel = document.getElementById('pe-car-age-label');
    if (peSlider) {
      // Approx annual KGFB price vs car age (older = slightly cheaper base but higher risk category)
      var prices = [52000,50000,48000,46500,45600,44000,42000,40000,38500,37000,36000,35500,35000,34500,34000,33500,33000,32500,32000,31500];
      function updatePE() {
        var v = parseInt(peSlider.value, 10);
        var p = prices[v - 1] || 40000;
        peLabel.textContent = v + ' éves';
        var fmt = p.toLocaleString('hu-HU');
        pePrice.textContent = fmt;
        pePrice.classList.remove('changed');
        void pePrice.offsetWidth;
        pePrice.classList.add('changed');
        var pct = ((v - 1) / 19 * 100);
        peSlider.style.background = 'linear-gradient(90deg, #FFA726 ' + pct + '%, #f0f0f0 ' + pct + '%)';
      }
      peSlider.addEventListener('input', updatePE);
      updatePE();
    }

    /* ─── CURSOR TRAIL ─── */
    var trailArea = document.getElementById('cursor-trail-area');
    if (trailArea && window.matchMedia('(pointer:fine)').matches) {
      var trailDots = [];
      var maxDots = 12;
      trailArea.addEventListener('mousemove', function(e) {
        var r = trailArea.getBoundingClientRect();
        var x = e.clientX - r.left, y = e.clientY - r.top;
        var dot = document.createElement('div');
        dot.className = 'trail-dot';
        dot.style.left = x + 'px'; dot.style.top = y + 'px';
        dot.style.opacity = '1';
        trailArea.appendChild(dot);
        trailDots.push(dot);
        if (trailDots.length > maxDots) {
          var old = trailDots.shift();
          old.style.opacity = '0'; old.style.width = '2px'; old.style.height = '2px';
          setTimeout(function() { if (old.parentElement) old.remove(); }, 300);
        }
        trailDots.forEach(function(d, i) {
          var alpha = (i + 1) / trailDots.length;
          d.style.opacity = (alpha * 0.8).toString();
          var sz = (alpha * 8) + 2 + 'px';
          d.style.width = sz; d.style.height = sz;
        });
      });
      trailArea.addEventListener('mouseleave', function() {
        trailDots.forEach(function(d) { if (d.parentElement) d.remove(); });
        trailDots = [];
      });
    }

    /* ─── SMOOTH ACCORDION ─── */
    document.querySelectorAll('.smooth-acc-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var key = btn.dataset.sacc;
        var body = document.getElementById('sacc-' + key);
        var inner = body.querySelector('.smooth-acc-body-inner');
        var isOpen = btn.classList.contains('open');
        // close all
        document.querySelectorAll('.smooth-acc-btn.open').forEach(function(ob) {
          ob.classList.remove('open');
          var obKey = ob.dataset.sacc;
          document.getElementById('sacc-' + obKey).style.maxHeight = '0';
        });
        if (!isOpen) {
          btn.classList.add('open');
          body.style.maxHeight = inner.scrollHeight + 'px';
        }
      });
    });

    /* ─── CONFETTI ─── */
    var confCanvas = document.getElementById('confetti-canvas');
    var confCtx = confCanvas.getContext('2d');
    var confPieces = [];
    var confRunning = false;
    function resizeConf() { confCanvas.width = window.innerWidth; confCanvas.height = window.innerHeight; }
    resizeConf();
    window.addEventListener('resize', resizeConf);
    window.fireConfetti = function() {
      confPieces = [];
      for (var i = 0; i < 120; i++) {
        confPieces.push({
          x: window.innerWidth / 2, y: window.innerHeight / 2,
          vx: (Math.random() - .5) * 14,
          vy: -(Math.random() * 10 + 5),
          color: ['#FFA726','#ff9800','#15233C','#22c55e','#3b82f6','#ef4444'][Math.floor(Math.random()*6)],
          w: Math.random() * 10 + 5, h: Math.random() * 5 + 3,
          rot: Math.random() * 360, rv: (Math.random() - .5) * 8,
          life: 1
        });
      }
      if (!confRunning) { confRunning = true; animConf(); }
    };
    function animConf() {
      confCtx.clearRect(0, 0, confCanvas.width, confCanvas.height);
      confPieces = confPieces.filter(function(p) { return p.life > 0; });
      confPieces.forEach(function(p) {
        p.vy += .25; p.x += p.vx; p.y += p.vy; p.rot += p.rv; p.life -= .012;
        confCtx.save();
        confCtx.globalAlpha = Math.max(0, p.life);
        confCtx.translate(p.x, p.y); confCtx.rotate(p.rot * Math.PI / 180);
        confCtx.fillStyle = p.color;
        confCtx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        confCtx.restore();
      });
      if (confPieces.length > 0) requestAnimationFrame(animConf);
      else { confRunning = false; }
    }

    /* ─── SOCIAL PROOF TOASTS ─── */
    var toastNames = ['Kovács Péter','Nagy Anna','Tóth Gábor','Szabó Mária','Horváth Zoltán','Kiss Erzsébet','Varga Péter','Farkas Ágnes'];
    var toastActions = ['ajánlatot kért','összehasonlítást kért','visszahívást kért','KGFB-t kötött','lakásbiztosítást váltott'];
    var toastTimes = ['1 perce','3 perce','7 perce','12 perce','éppen most'];
    var toastContainer = document.getElementById('sp-toast-container');
    window.showRandomToast = function() {
      var name = toastNames[Math.floor(Math.random()*toastNames.length)];
      var action = toastActions[Math.floor(Math.random()*toastActions.length)];
      var time = toastTimes[Math.floor(Math.random()*toastTimes.length)];
      var initials = name.split(' ').map(function(w){return w[0];}).join('');
      var toast = document.createElement('div');
      toast.className = 'sp-toast';
      toast.innerHTML = '<div class="sp-av">' + initials + '</div><div class="sp-txt"><strong>' + name + '</strong><span>' + action + '</span></div><span class="sp-time">' + time + '</span>';
      toastContainer.appendChild(toast);
      setTimeout(function() {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', function() { toast.remove(); });
      }, 4000);
    };
    // Auto-show after delays
    [2500, 8000, 14000, 21000].forEach(function(delay) {
      setTimeout(showRandomToast, delay);
    });

  })();