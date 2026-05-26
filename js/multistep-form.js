/**
 * multistep-form.js
 * Typeform-style multi-step form wizard for Biztor Alkusz Kft.
 *
 * Supports:
 *  - API forms (fetch POST JSON)  → form[action^="/api/forms/"]
 *  - EmailJS forms                 → form[data-msf-type="emailjs"]
 *
 * HTML structure expected:
 *   <div class="msf-wrapper">
 *     <div class="msf-progress"><div class="msf-progress-fill"></div></div>
 *     <form class="msf-form" action="/api/forms/..." method="post">
 *       <div class="msf-step"> ... </div>
 *       ...
 *       <div class="msf-nav">
 *         <button type="button" class="msf-btn msf-btn-back">…</button>
 *         <div class="msf-nav-right">
 *           <button type="button" class="msf-btn msf-btn-next">…</button>
 *           <button type="submit"  class="msf-btn msf-btn-submit" style="display:none">…</button>
 *         </div>
 *       </div>
 *     </form>
 *     <div class="msf-success" style="display:none"> … </div>
 *   </div>
 *
 * Auto-advance (choice steps):  add data-auto-advance="true" to the .msf-step
 */
(function () {
  'use strict';

  /* ---- Constructor ---- */
  function MSF(wrapper) {
    this.wrapper  = wrapper;
    this.form     = wrapper.querySelector('form.msf-form');
    if (!this.form) return;

    this.steps    = Array.from(wrapper.querySelectorAll('.msf-step'));
    this.total    = this.steps.length;
    this.current  = 0;
    this.fill     = wrapper.querySelector('.msf-progress-fill');

    this._init();
  }

  /* ---- Init ---- */
  MSF.prototype._init = function () {
    var self = this;

    this._showStep(0, 'forward');

    // Back / Next buttons
    var backBtn = this.wrapper.querySelector('.msf-btn-back');
    if (backBtn) backBtn.addEventListener('click', function () { self.goBack(); });

    var nextBtn = this.wrapper.querySelector('.msf-btn-next');
    if (nextBtn) nextBtn.addEventListener('click', function () { self.goNext(); });

    // Form submit (triggered by msf-btn-submit inside form)
    this.form.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopPropagation();
      self._submit();
    });

    // Enter key = next (skip for textarea / submit buttons / nav)
    this.form.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var t = e.target;
      if (t.tagName === 'TEXTAREA') return;
      if (t.type === 'submit') return;
      if (t.closest('.msf-nav')) return;
      e.preventDefault();
      self.goNext();
    });

    // Choice cards: auto-advance if step has data-auto-advance="true"
    this.wrapper.querySelectorAll('.msf-choice input[type="radio"]').forEach(function (inp) {
      inp.addEventListener('change', function () {
        var step = inp.closest('.msf-step');
        if (step && step.dataset.autoAdvance === 'true') {
          setTimeout(function () { self.goNext(); }, 300);
        }
      });
    });

    // Clear invalid class and inline error on input / change
    this.form.addEventListener('input', function (e) {
      e.target.classList.remove('msf-invalid');
      var errEl = e.target.parentNode.querySelector('.msf-field-error[data-for="' + (e.target.name || '') + '"]');
      if (errEl) { errEl.style.display = 'none'; }
      self._hideBanner('msf-validation-error');
    });
    this.form.addEventListener('change', function (e) {
      e.target.classList.remove('msf-invalid');
      var errEl = e.target.parentNode.querySelector('.msf-field-error[data-for="' + (e.target.name || '') + '"]');
      if (errEl) { errEl.style.display = 'none'; }
      self._hideBanner('msf-validation-error');
    });
  };

  /* ---- Show Step ---- */
  MSF.prototype._showStep = function (index, direction) {
    var prev = this.steps[this.current];
    var next = this.steps[index];
    var wrapper = this.wrapper;

    // Lock wrapper height before hiding prev step to prevent height jump
    var lockedH = wrapper.offsetHeight;
    if (lockedH > 0) {
      wrapper.style.minHeight = lockedH + 'px';
    }

    // Clear field errors on the previous step when leaving
    if (prev && prev !== next) {
      this._clearFieldErrors(prev);
      prev.classList.remove('msf-active', 'msf-enter-forward', 'msf-enter-back');
      prev.style.display = 'none';
    }

    this.current = index;
    next.style.display = 'block';

    // Force reflow so CSS animation triggers
    void next.offsetWidth; // eslint-disable-line no-void

    next.classList.add('msf-active');
    next.classList.remove('msf-enter-forward', 'msf-enter-back');
    next.classList.add(direction === 'back' ? 'msf-enter-back' : 'msf-enter-forward');

    this._updateProgress();
    this._updateNav();

    // Populate summary on the last step
    if (index === this.total - 1) {
      this._populateSummary();
    }

    // Release height lock after transition completes, allowing natural resize
    setTimeout(function () {
      wrapper.style.minHeight = '';
    }, 380);

    // Sync form-container min-height to active panel (absolute panels don't stretch parent)
    var panel = this.wrapper.closest('.form-panel');
    var container = panel && panel.closest('.form-container');
    if (container && panel) {
      requestAnimationFrame(function () {
        // Only update when this panel is actually visible (not the opacity:0 one)
        if (parseFloat(window.getComputedStyle(panel).opacity) > 0.5) {
          var h = panel.offsetHeight;
          if (h > 0) container.style.minHeight = h + 'px';
        }
      });
    }

    // Focus first editable field after animation
    setTimeout(function () {
      var first = next.querySelector(
        'input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]), textarea, select'
      );
      if (first) { try { first.focus(); } catch (ex) { /* ignore */ } }
    }, 360);
  };

  /* ---- Progress & Nav ---- */
  MSF.prototype._updateProgress = function () {
    if (this.fill) {
      var pct = this.total > 1 ? (this.current / (this.total - 1)) * 100 : 100;
      this.fill.style.width = pct + '%';
    }
  };

  MSF.prototype._updateNav = function () {
    var isLast  = this.current === this.total - 1;
    var backBtn = this.wrapper.querySelector('.msf-btn-back');
    var nextBtn = this.wrapper.querySelector('.msf-btn-next');
    var subBtn  = this.wrapper.querySelector('.msf-btn-submit');

    if (backBtn) backBtn.style.visibility = this.current === 0 ? 'hidden' : 'visible';
    if (nextBtn) nextBtn.style.display    = isLast ? 'none'        : 'inline-flex';
    if (subBtn)  subBtn.style.display     = isLast ? 'inline-flex' : 'none';
  };

  /* ---- Hungarian field name → label map ---- */
  var MSF_FIELD_LABELS = {
    'gname':                 'Neve',
    'cname':                 'Telefonszám',
    'gmail':                 'E-mail cím',
    'message':               'Megjegyzés',
    'cage':                  'Érdeklődési terület',
    'applicant[name]':       'Neve',
    'applicant[phone]':      'Telefonszám',
    'applicant[email]':      'E-mail cím',
    'applicant[note]':       'Megjegyzés',
    'vehicle[registration]': 'Rendszám',
    'vehicle[brand]':        'Gépjármű márkája',
    'vehicle[model]':        'Gépjármű típusa',
    'property[type]':        'Ingatlan típusa',
    'property[address]':     'Cím',
    'property[size]':        'Alapterület'
  };

  /* ---- Per-field Hungarian error message ---- */
  MSF.prototype._getFieldError = function (f) {
    if (f.type === 'email') {
      if (!f.value.trim()) return 'Kérjük, adja meg az e-mail címét.';
      return 'Kérjük, adjon meg egy érvényes e-mail címet. (pl. pelda@email.hu)';
    }
    if (f.type === 'tel') {
      return 'Kérjük, adja meg a telefonszámát.';
    }
    if (f.type === 'checkbox') {
      return 'Az adatkezelési tájékoztató elfogadása szükséges a küldéshez.';
    }
    if (f.name && (f.name.indexOf('name') !== -1 || f.name === 'gname')) {
      return 'Kérjük, adja meg a nevét.';
    }
    return 'Ezt a mezőt ki kell tölteni a folytatáshoz.';
  };

  /* ---- Show / hide inline field error ---- */
  MSF.prototype._setFieldError = function (f, msg) {
    var errEl = f.parentNode.querySelector('.msf-field-error[data-for="' + f.name + '"]');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.className = 'msf-field-error';
      errEl.setAttribute('data-for', f.name || '');
      f.parentNode.insertBefore(errEl, f.nextSibling);
    }
    errEl.textContent = msg;
    errEl.style.display = msg ? 'block' : 'none';
  };

  MSF.prototype._clearFieldErrors = function (step) {
    step.querySelectorAll('.msf-field-error').forEach(function (el) {
      el.style.display = 'none';
      el.textContent = '';
    });
  };

  /* ---- Validation ---- */
  MSF.prototype._validate = function () {
    var self  = this;
    var step  = this.steps[this.current];
    var valid = true;
    var first = null;

    this._clearFieldErrors(step);

    // Standard required fields (skip radios — handled by groups logic below)
    step.querySelectorAll('[required]').forEach(function (f) {
      if (f.type === 'radio') return;
      if (!f.checkValidity()) {
        f.classList.add('msf-invalid');
        self._setFieldError(f, self._getFieldError(f));
        valid = false;
        if (!first) first = f;
      } else {
        f.classList.remove('msf-invalid');
        self._setFieldError(f, '');
      }
    });

    // Radio groups (at least one in group must be checked)
    // Collect group names from required radios, then check ALL radios in that group
    var groups = {};
    step.querySelectorAll('input[type="radio"][required]').forEach(function (r) {
      if (!groups[r.name]) groups[r.name] = r;
    });
    Object.keys(groups).forEach(function (name) {
      var allInGroup = Array.from(step.querySelectorAll('input[type="radio"][name="' + name + '"]'));
      var checked = allInGroup.some(function (r) { return r.checked; });
      if (!checked) {
        valid = false;
        if (!first) first = groups[name];
        // Show error below the choices container
        var choicesEl = step.querySelector('.msf-choices');
        if (choicesEl) {
          var errEl = choicesEl.parentNode.querySelector('.msf-field-error[data-for="' + name + '"]');
          if (!errEl) {
            errEl = document.createElement('p');
            errEl.className = 'msf-field-error';
            errEl.setAttribute('data-for', name);
            choicesEl.parentNode.insertBefore(errEl, choicesEl.nextSibling);
          }
          errEl.textContent = 'Kérjük, válasszon az opciók közül.';
          errEl.style.display = 'block';
        }
      }
    });

    if (!valid && first) { try { first.focus(); } catch (ex) { /* ignore */ } }
    return valid;
  };

  /* ---- Summary: populate .msf-review on last step ---- */
  MSF.prototype._populateSummary = function () {
    var lastStep = this.steps[this.total - 1];
    if (!lastStep) return;
    var reviewEl = lastStep.querySelector('.msf-review');
    if (!reviewEl) return;

    var items = [];

    for (var i = 0; i < this.total - 1; i++) {
      var step = this.steps[i];

      // Checked radios
      step.querySelectorAll('input[type="radio"]:checked').forEach(function (r) {
        var label = MSF_FIELD_LABELS[r.name] || 'Kiválasztott';
        // Avoid duplicates
        for (var k = 0; k < items.length; k++) {
          if (items[k].label === label) { items[k].value = r.value; return; }
        }
        items.push({ label: label, value: r.value });
      });

      // Text / email / tel / textarea (non-hidden, non-empty)
      step.querySelectorAll(
        'input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]), textarea'
      ).forEach(function (inp) {
        var val = inp.value.trim();
        if (!val) return;
        var label = MSF_FIELD_LABELS[inp.name] ||
                    (inp.placeholder && !inp.placeholder.match(/^(pl\.|[+0-9])/) ? inp.placeholder : null) ||
                    inp.name || 'Adat';
        items.push({ label: label, value: val });
      });
    }

    if (!items.length) {
      reviewEl.innerHTML = '<p class="msf-review-empty">A megadott adatok itt jelennek meg.</p>';
      return;
    }

    var html = '<dl class="msf-review-list">';
    items.forEach(function (item) {
      html += '<div class="msf-review-item">' +
              '<dt>' + _esc(item.label) + '</dt>' +
              '<dd>' + _esc(item.value) + '</dd>' +
              '</div>';
    });
    html += '</dl>';
    reviewEl.innerHTML = html;
  };

  function _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ---- Error / Banner helpers ---- */
  MSF.prototype._showBanner = function (msg, cls) {
    var el = this.wrapper.querySelector('.' + cls);
    if (!el) {
      el = document.createElement('div');
      el.className = cls;
      var nav = this.wrapper.querySelector('.msf-nav');
      if (nav) nav.parentNode.insertBefore(el, nav);
    }
    el.textContent = msg;
    el.style.display = 'block';
  };

  MSF.prototype._hideBanner = function (cls) {
    var el = this.wrapper.querySelector('.' + cls);
    if (el) el.style.display = 'none';
  };

  /* ---- Navigation ---- */
  MSF.prototype.goNext = function () {
    if (!this._validate()) {
      // Banner shown only if no inline errors are visible (fallback)
      var hasInline = this.steps[this.current].querySelector('.msf-field-error[style*="block"]');
      if (!hasInline) {
        this._showBanner('Kérjük, töltse ki a kötelező mezőket a folytatáshoz!', 'msf-validation-error');
      } else {
        this._hideBanner('msf-validation-error');
      }
      return;
    }
    this._hideBanner('msf-validation-error');
    if (this.current < this.total - 1) {
      this._showStep(this.current + 1, 'forward');
    }
  };

  MSF.prototype.goBack = function () {
    this._hideBanner('msf-validation-error');
    if (this.current > 0) {
      this._showStep(this.current - 1, 'back');
    }
  };

  /* ---- Payload builder (bracket notation → nested object) ---- */
  MSF.prototype._buildPayload = function () {
    var payload  = {};
    var formData = new FormData(this.form);

    formData.forEach(function (value, key) {
      var m = key.match(/^([^\[]+)\[([^\]]+)\]$/);
      if (m) {
        if (!payload[m[1]]) payload[m[1]] = {};
        payload[m[1]][m[2]] = value;
      } else {
        payload[key] = value;
      }
    });

    return payload;
  };

  /* ---- Submit ---- */
  MSF.prototype._submit = function () {
    var self = this;

    if (!this._validate()) {
      this._showBanner('Kérjük, töltse ki a kötelező mezőket!', 'msf-validation-error');
      return;
    }
    this._hideBanner('msf-validation-error');
    this._hideBanner('msf-api-error');

    var subBtn = this.wrapper.querySelector('.msf-btn-submit');
    if (subBtn) {
      if (!subBtn.dataset.originalText) subBtn.dataset.originalText = subBtn.textContent;
      subBtn.disabled = true;
      subBtn.textContent = 'Küldés…';
    }

    var isEmailJS = this.form.dataset.msfType === 'emailjs';

    if (isEmailJS) {
      /* -- EmailJS path -- */
      if (typeof emailjs === 'undefined') {
        self._onError(subBtn, 'A küldési funkció most nem elérhető. Kérjük, hívjon minket: +36 70 625 8201');
        return;
      }
      emailjs.sendForm(
        this.form.dataset.emailjsService,
        this.form.dataset.emailjsTemplate,
        this.form
      )
      .then(function () { self._onSuccess(); })
      .catch(function (err) {
        console.error('EmailJS error:', err);
        self._onError(subBtn, 'Hiba történt a küldés során. Kérjük, próbálja újra!');
      });

    } else {
      /* -- API fetch path -- */
      fetch(this.form.action, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(this._buildPayload())
      })
      .then(function (resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
      })
      .then(function () { self._onSuccess(); })
      .catch(function (err) {
        console.error('API error:', err);
        self._onError(
          subBtn,
          'Hiba történt a küldés során. Kérjük, próbálja meg újra, vagy hívjon minket: +36 70 625 8201'
        );
      });
    }
  };

  MSF.prototype._onSuccess = function () {
    this.steps.forEach(function (s) { s.style.display = 'none'; });

    var progress = this.wrapper.querySelector('.msf-progress');
    var nav      = this.wrapper.querySelector('.msf-nav');
    if (progress) progress.style.display = 'none';
    if (nav)      nav.style.display      = 'none';

    this._hideBanner('msf-validation-error');
    this._hideBanner('msf-api-error');

    var success = this.wrapper.querySelector('.msf-success');
    if (success) success.style.display = 'block';

    try { this.form.reset(); } catch (ex) { /* ignore */ }
  };

  MSF.prototype._onError = function (subBtn, msg) {
    if (subBtn) {
      subBtn.disabled = false;
      subBtn.textContent = subBtn.dataset.originalText || 'Elküldöm';
    }
    this._showBanner(msg, 'msf-api-error');
  };

  /* ---- Boot ---- */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.msf-wrapper').forEach(function (w) { new MSF(w); });
  });

}());
