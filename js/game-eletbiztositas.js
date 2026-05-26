/**
 * Életbiztosítás Típusteszt v1
 * – 3 kérdés: élethelyzet alapján melyik biztosítástípus a legjobb?
 * – Canvas: animált "Életút" – 3 életszakasz ikonnal (fiatal, középkorú, idős)
 * – Oldalpanel: kérdés + 3 válaszgomb (KGFB-játékhoz hasonló séma)
 * – aspect-ratio CSS wrapper → nincs pop-effekt
 */
(function () {
  'use strict';

  var canvas = document.getElementById('eletbiztos-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var LW = 0, LH = 0;
  var TAU = Math.PI * 2;

  /* ── Játékállapot ─────────────────────────────────── */
  var state   = 'idle';    // idle | playing | done
  var qIndex  = 0;
  var score   = 0;
  var lastAns = null;      // 'correct' | 'wrong' | null
  var flashT  = 0;
  var animId  = null;
  var tick    = 0;

  /* ── Kérdések ─────────────────────────────────────── */
  var QUESTIONS = [
    {
      age: 32,
      label: 'Fiatal',
      icon: '\uD83C\uDFE0',
      ctx_: '32 éves, most vett fel lakáshitelt, 1 kisgyermeke van.',
      q: 'Melyik típus a legolcsóbb és megfelelő hitelfedezetre?',
      opts: [
        { text: 'Kockázati életbiztosítás', correct: true },
        { text: 'Vegyes életbiztosítás',    correct: false },
        { text: 'Unit-linked (befektetési)', correct: false }
      ],
      explain: 'Kockázati: csak halálesetre fizet – ez pontosan elég a bank fedezéséhez, a legalacsonyabb díjon.'
    },
    {
      age: 42,
      label: 'Középkorú',
      icon: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67',
      ctx_: '42 éves vállalkozó, 2 gyermeke van, nyugdíjra is takarékoskodna.',
      q: 'Melyik nyújt egyszerre védelmet és adókedvezményes megtakarítást?',
      opts: [
        { text: 'Kockázati életbiztosítás', correct: false },
        { text: 'Nyugdíjbiztosítás (vegyes)', correct: true },
        { text: 'Unit-linked (befektetési)', correct: false }
      ],
      explain: 'Nyugdíjbiztosítás: halálesetre fizet ÉS megtakarítást épít fel, évente max. 130 000 Ft adókedvezmény igényelhető.'
    },
    {
      age: 56,
      label: 'Idősebb',
      icon: '\uD83D\uDC74',
      ctx_: '56 éves, gyermekei felnőttek, megtakarítását rugalmasan szeretné befektetni.',
      q: 'Melyik típus nyújt rugalmas befektetési lehetőséget?',
      opts: [
        { text: 'Kockázati életbiztosítás', correct: false },
        { text: 'Vegyes életbiztosítás',    correct: false },
        { text: 'Unit-linked (befektetési)', correct: true }
      ],
      explain: 'Unit-linked: a befizetések eszközalapokba kerülnek – rugalmas portfólió, magasabb hozampotenciál, de kockázattal.'
    }
  ];

  /* ── Gombok ───────────────────────────────────────── */
  function getBtn() { return document.getElementById('eletbiztos-btn-wrap'); }
  function getFeedback() { return document.getElementById('eletbiztos-feedback'); }

  function showPanel(id) {
    ['eletbiztos-panel-start', 'eletbiztos-panel-play', 'eletbiztos-panel-result'].forEach(function (pid) {
      var el = document.getElementById(pid);
      if (el) el.classList.toggle('d-none', pid !== id);
    });
  }

  function updatePlayPanel() {
    var q = QUESTIONS[qIndex];
    var ctxEl = document.getElementById('eletbiztos-q-ctx');
    var qEl   = document.getElementById('eletbiztos-q-text');
    var hudEl = document.getElementById('eletbiztos-hud');
    if (ctxEl) ctxEl.textContent = q.ctx_;
    if (qEl)   qEl.textContent   = q.q;
    if (hudEl) hudEl.textContent = (qIndex + 1) + ' / ' + QUESTIONS.length + '. kérdés';

    var bw = getBtn();
    if (!bw) return;
    bw.innerHTML = '';
    q.opts.forEach(function (opt, i) {
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline-primary rounded-pill px-3 py-2 mb-2 w-100 text-start hover-lift';
      btn.textContent = opt.text;
      btn.onclick = function () { answerQ(i); };
      bw.appendChild(btn);
    });
  }

  function answerQ(idx) {
    if (state !== 'playing') return;
    var q = QUESTIONS[qIndex];
    var correct = q.opts[idx].correct;
    if (correct) score++;
    lastAns = correct ? 'correct' : 'wrong';
    flashT = 0;

    /* Feedback szöveg */
    var fb = getFeedback();
    if (fb) {
      fb.className = 'alert small mt-3 mb-0 rounded-3 ' + (correct ? 'alert-success' : 'alert-warning');
      fb.innerHTML = (correct ? '\u2705 <strong>Helyes!</strong> ' : '\u26A0\uFE0F <strong>Nem ez a legjobb!</strong> ') + q.explain;
      fb.hidden = false;
    }

    /* Gombok letiltása */
    var bw = getBtn();
    if (bw) bw.querySelectorAll('button').forEach(function (b) { b.disabled = true; });

    setTimeout(function () {
      if (fb) fb.hidden = true;
      lastAns = null;
      qIndex++;
      if (qIndex < QUESTIONS.length) {
        updatePlayPanel();
      } else {
        state = 'done';
        showResult();
      }
    }, 2400);
  }

  function showResult() {
    var hit = score;
    var DATA = [
      { e: '\uD83D\uDCDA', t: 'Érdemes alkusszal konzultálni!',
        d: 'Az életbiztosítási típusok között könnyű eltévedni. Mi megmutatjuk, melyik illik az Ön élethelyzetéhez – ingyenesen.' },
      { e: '\uD83D\uDC4D', t: 'Jó alapok – van még hova fejlődni!',
        d: '1 helyes válasz. Az életbiztosítás választása összetett döntés – nézzük meg együtt a részleteket.' },
      { e: '\u2B50', t: 'Szinte profi szinten!',
        d: '2/3-szor jó volt. Egy kis finomhangolással tökéletes döntést hozhat. Alkuszunk segít a maradék kérdésben is.' },
      { e: '\uD83C\uDFC6', t: 'Kifogástalan! Alkusz-szintű tudás!',
        d: 'Mindhárom élethelyzetre a legjobb megoldást választotta. Kérjen személyre szabott ajánlatot – az utolsó lépés a konkrét számokra hozni a döntést.' }
    ][hit];

    var rp = document.getElementById('eletbiztos-panel-result');
    if (rp) {
      var q = function (sel) { return rp.querySelector(sel); };
      if (q('.elb-r-emoji')) q('.elb-r-emoji').textContent = DATA.e;
      if (q('.elb-r-stars')) q('.elb-r-stars').textContent = Array.from({length: hit}, function () { return '\u2B50'; }).join(' ') + Array.from({length: QUESTIONS.length - hit}, function () { return '\uD83D\uDC94'; }).join(' ');
      if (q('.elb-r-title')) q('.elb-r-title').textContent = DATA.t;
      if (q('.elb-r-desc'))  q('.elb-r-desc').textContent  = DATA.d;
    }
    showPanel('eletbiztos-panel-result');
  }

  /* ── Canvas: animált életút ───────────────────────── */
  function resize() {
    LW = canvas.offsetWidth;
    LH = canvas.offsetHeight;
    if (!LW || !LH) return;
    var dpr = window.devicePixelRatio || 1;
    canvas.width  = Math.round(LW * dpr);
    canvas.height = Math.round(LH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 60);
  });
  setTimeout(resize, 80);

  function lerp(a, b, t) { return a + (b - a) * t; }

  function stageX(i) {
    /* 3 állomás vízszintesen */
    return LW * (0.18 + i * 0.32);
  }
  function stageY() { return LH * 0.52; }
  function stageR() { return Math.min(LW, LH) * 0.11; }

  function drawBg() {
    var gr = ctx.createLinearGradient(0, 0, 0, LH);
    gr.addColorStop(0, '#f0f7ff');
    gr.addColorStop(1, '#e6f0fb');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, LW, LH);
  }

  function drawPath() {
    /* Szaggatott életút-vonal */
    ctx.save();
    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = '#c8d8f0';
    ctx.lineWidth   = 2.5;
    ctx.beginPath();
    ctx.moveTo(stageX(0), stageY());
    ctx.lineTo(stageX(2), stageY());
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function stageState(i) {
    if (state === 'idle') return 'idle';
    if (state === 'done') return 'done';
    if (i < qIndex) return 'correct'; /* lezárt körök */
    if (i === qIndex) return 'active';
    return 'idle';
  }

  function drawStage(i) {
    var x    = stageX(i);
    var y    = stageY();
    var r    = stageR();
    var q    = QUESTIONS[i];
    var st   = stageState(i);
    var pulse = (st === 'active') ? 0.08 * Math.sin(tick * 0.08) : 0;

    /* Háttérkör */
    var bgColor = '#e8f0fb';
    if (st === 'active')  bgColor = '#dbeafe';
    if (st === 'correct') bgColor = '#d1fae5';
    if (st === 'done')    bgColor = '#d1fae5';

    ctx.save();
    ctx.shadowColor = st === 'active' ? 'rgba(37,99,235,0.25)' : 'rgba(0,0,0,0.06)';
    ctx.shadowBlur  = st === 'active' ? 18 : 6;
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.arc(x, y, r * (1 + pulse), 0, TAU);
    ctx.fill();
    ctx.restore();

    /* Keret */
    ctx.save();
    ctx.strokeStyle = st === 'active' ? '#3b82f6' : st === 'correct' ? '#22c55e' : '#cbd5e1';
    ctx.lineWidth   = st === 'active' ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.arc(x, y, r * (1 + pulse), 0, TAU);
    ctx.stroke();
    ctx.restore();

    /* Emoji ikon */
    ctx.save();
    ctx.globalAlpha  = 1;
    ctx.fillStyle    = '#000000';
    ctx.font         = Math.round(r * 0.85) + 'px serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(q.icon, x, y - r * 0.08);
    ctx.restore();

    /* Kor és felirat */
    ctx.save();
    ctx.fillStyle    = '#15233C';
    ctx.font         = 'bold ' + Math.round(r * 0.45) + 'px Inter, system-ui, Arial';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(q.age + ' év', x, y + r + 6);
    ctx.fillStyle = '#64748b';
    ctx.font      = Math.round(r * 0.36) + 'px Inter, system-ui, Arial';
    ctx.fillText(q.label, x, y + r + Math.round(r * 0.48) + 8);
    ctx.restore();

    /* Pipa: lezárt kör */
    if (st === 'correct' || st === 'done') {
      ctx.save();
      ctx.globalAlpha  = 1;
      ctx.fillStyle    = '#22c55e';
      ctx.font         = Math.round(r * 0.6) + 'px serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u2714', x + r * 0.58, y - r * 0.58);
      ctx.restore();
    }

    /* Flash keret helyes/rossz */
    if (st === 'active' && lastAns !== null) {
      var alpha = Math.max(0, 1 - flashT / 30);
      ctx.save();
      ctx.strokeStyle = lastAns === 'correct'
        ? 'rgba(34,197,94,' + alpha + ')'
        : 'rgba(239,68,68,' + alpha + ')';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x, y, r + 8, 0, TAU);
      ctx.stroke();
      ctx.restore();
      flashT++;
    }
  }

  function drawTitle() {
    if (!LW || !LH) return;
    ctx.save();
    ctx.fillStyle    = '#15233C';
    ctx.font         = 'bold ' + Math.round(LH * 0.055) + 'px Inter, system-ui, Arial';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Életút-állomások', LW / 2, LH * 0.06);
    ctx.fillStyle = '#64748b';
    ctx.font      = Math.round(LH * 0.038) + 'px Inter, system-ui, Arial';
    var sub = state === 'idle'  ? 'Kattintson a kérdés aktiválásához!'
            : state === 'done'  ? 'Köszönjük a részvételt!'
            : 'Aktív: ' + QUESTIONS[qIndex].age + ' éves szituáció';
    ctx.fillText(sub, LW / 2, LH * 0.06 + Math.round(LH * 0.068));
    ctx.restore();
  }

  function draw() {
    if (!LW || !LH) return;
    ctx.clearRect(0, 0, LW, LH);
    drawBg();
    drawPath();
    for (var i = 0; i < QUESTIONS.length; i++) drawStage(i);
    drawTitle();
  }

  function loop() {
    tick++;
    draw();
    if (state === 'playing') animId = requestAnimationFrame(loop);
  }

  /* ── Publikus API ─────────────────────────────────── */
  window.eletbiztosStart = function () {
    state   = 'playing';
    qIndex  = 0;
    score   = 0;
    lastAns = null;
    flashT  = 0;
    tick    = 0;
    var fb = getFeedback();
    if (fb) fb.hidden = true;
    showPanel('eletbiztos-panel-play');
    updatePlayPanel();
    cancelAnimationFrame(animId);
    animId = requestAnimationFrame(loop);
  };

  window.eletbiztosRestart = function () { window.eletbiztosStart(); };

  showPanel('eletbiztos-panel-start');
  draw();

})();
