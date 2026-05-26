(function () {
  'use strict';

  var haviEl   = document.getElementById('kk-havi');
  var evekEl   = document.getElementById('kk-evek');
  var hozamEl  = document.getElementById('kk-hozam');
  if (!haviEl || !evekEl || !hozamEl) return;

  var evekVal    = document.getElementById('kk-evek-val');
  var hozamVal   = document.getElementById('kk-hozam-val');
  var elBefiz    = document.getElementById('kk-befizetve');
  var elNyer     = document.getElementById('kk-nyereseg');
  var elVeg      = document.getElementById('kk-vegosszeg');
  var barDep     = document.getElementById('kk-bar-deposit');
  var barYield   = document.getElementById('kk-bar-yield');

  var animTimer  = null;
  var displayedVal = 0;

  function fmt(n) {
    return new Intl.NumberFormat('hu-HU').format(Math.round(n)) + ' Ft';
  }

  function calc() {
    var havi  = Math.max(0, parseFloat(haviEl.value)  || 0);
    var evek  = parseInt(evekEl.value,  10);
    var hozam = parseFloat(hozamEl.value);
    var r     = hozam / 100 / 12;
    var n     = evek * 12;

    evekVal.textContent  = evek  + ' év';
    hozamVal.textContent = hozam + '%';

    var vegosszeg, befizetve;
    if (r === 0) {
      vegosszeg = havi * n;
    } else {
      vegosszeg = havi * (Math.pow(1 + r, n) - 1) / r;
    }
    befizetve = havi * n;
    var nyereseg = vegosszeg - befizetve;

    elBefiz.textContent = fmt(befizetve);
    elNyer.textContent  = fmt(nyereseg);

    /* Animált végösszeg */
    if (animTimer) clearInterval(animTimer);
    var target   = vegosszeg;
    var steps    = 40;
    var stepTime = 15;
    var current  = displayedVal;
    var delta    = (target - current) / steps;
    var count    = 0;
    animTimer = setInterval(function () {
      count++;
      current += delta;
      if (count >= steps) { current = target; clearInterval(animTimer); animTimer = null; }
      displayedVal = current;
      elVeg.textContent = fmt(current);
    }, stepTime);

    /* Progress bar */
    var depPct   = vegosszeg > 0 ? (befizetve / vegosszeg) * 100 : 0;
    var yieldPct = vegosszeg > 0 ? (nyereseg  / vegosszeg) * 100 : 0;
    barDep.style.width   = depPct.toFixed(1)   + '%';
    barYield.style.width = yieldPct.toFixed(1) + '%';
  }

  haviEl.addEventListener('input',  calc);
  evekEl.addEventListener('input',  calc);
  hozamEl.addEventListener('input', calc);

  calc();
})();
