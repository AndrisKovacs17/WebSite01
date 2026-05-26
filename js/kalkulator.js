/**
 * biztor-kalkulator.js
 * Flotta biztosítás díjbecslő + Jégkár becslő widget
 * Függőség: Bootstrap 5 modal (már betöltve az oldalakon)
 */
(function () {
  'use strict';

  /* ── Helpers ─────────────────────────────────────────── */
  function fmt(n) {
    return Math.round(n).toLocaleString('hu-HU') + ' Ft';
  }
  function el(id) { return document.getElementById(id); }

  /* ── KGFB Flotta becslő ───────────────────────────────── */
  function calcKgfbFlotta() {
    var jarmu   = parseInt(el('kalk-jarmu-szam').value, 10) || 5;
    var tipus   = el('kalk-jarmu-tipus').value;

    // Tájékoztató jellegű éves egységdíj (HUF) típusonként (flotta kedvezménnyel)
    var egysegdij = { szemely: 42000, kisteher: 68000, teher: 115000 };
    var alap = egysegdij[tipus] || 42000;

    // Flottaméret-kedvezmény: 2-4 jármű 10%, 5-9 → 20%, 10-19 → 30%, 20+ → 40%
    var kedv = jarmu >= 20 ? 0.40 : jarmu >= 10 ? 0.30 : jarmu >= 5 ? 0.20 : 0.10;
    var evesdij = jarmu * alap * (1 - kedv);
    var min = Math.round(evesdij * 0.85);
    var max = Math.round(evesdij * 1.20);

    el('kalk-result-kgfb').innerHTML =
      '<div class="alert alert-primary border-0 mt-4">' +
        '<div class="d-flex align-items-center gap-3">' +
          '<i class="fa fa-calculator fa-2x text-primary"></i>' +
          '<div>' +
            '<div class="fw-bold fs-5">' + fmt(min) + ' – ' + fmt(max) + ' / év</div>' +
            '<small class="text-muted">Tájékoztató becslés ' + jarmu + ' db ' +
              { szemely: 'személyautóra', kisteher: 'kisteherautóra', teher: 'tehergépjárműre' }[tipus] +
            '. Adókedvezmény nélkül, ' + Math.round(kedv * 100) + '% flottakedvezménnyel számolva.</small>' +
          '</div>' +
        '</div>' +
        '<hr class="my-3">' +
        '<p class="mb-2 small">Pontos ajánlathoz vegye fel velünk a kapcsolatot:</p>' +
        '<a href="./kapcsolat.html" class="btn btn-primary btn-sm me-2">' +
          '<i class="fa fa-envelope me-2"></i>Ajánlatot kérek</a>' +
        '<a href="tel:+36425952480" class="btn btn-outline-primary btn-sm">' +
          '<i class="fa fa-phone me-2"></i>+36 42 595 248</a>' +
      '</div>';
  }

  /* ── CASCO döntéssegítő: megéri-e? önrész-összehasonlító ─ */
  function calcCascoOnresz() {
    var ertek  = parseInt((el('kalk-casco-ertek').value || '0').replace(/\D/g, ''), 10) || 0;
    var kor    = (el('kalk-casco-kor')    || { value: '4-7' }).value;
    var finanz = (el('kalk-casco-finanz') || { value: 'sajat' }).value;

    if (ertek < 500000) {
      el('kalk-result-casco').innerHTML =
        '<div class="alert alert-warning mt-4">Kérjük, adjon meg legalább 500 000 Ft értéket.</div>';
      return;
    }

    // Kor → díjszorzó (idősebb autó = alacsonyabb éves díj)
    var korSzorzo = { '1-3': 1.00, '4-7': 0.85, '8-10': 0.68, '10plus': 0.52 };
    var sz = korSzorzo[kor] || 0.85;

    // Javaslat logika
    var rec, recClass, recIcon;
    if (finanz === 'hitel') {
      rec = 'Teljes CASCO kötelező (hitel / lízing esetén a finanszírozó megköveteli)';
      recClass = 'success'; recIcon = 'fa-check-circle';
    } else if (kor === '1-3') {
      rec = 'Teljes CASCO ajánlott – értékes, új jármű, megéri a fedezet';
      recClass = 'success'; recIcon = 'fa-check-circle';
    } else if (kor === '4-7') {
      rec = 'Teljes CASCO érdemes megfontolni – a jármű értéke még indokolja';
      recClass = 'primary'; recIcon = 'fa-info-circle';
    } else if (kor === '8-10') {
      rec = 'Részleges CASCO javasolt – teljes CASCO ennél a kornál ritkán éri meg';
      recClass = 'warning'; recIcon = 'fa-exclamation-triangle';
    } else {
      rec = 'Általában csak részleges CASCO ajánlott – lopás és elemi kár fedezete';
      recClass = 'secondary'; recIcon = 'fa-times-circle';
    }

    // Alap díjtartomány (1,5–4% / év × korszorzó)
    var baseMin = ertek * 0.015 * sz;
    var baseMax = ertek * 0.040 * sz;

    // 4 önrész szint
    var szintek = [
      { pct: 10, label: '10%',  kedv: 0.00, ajanlott: kor === '1-3' || finanz === 'hitel' },
      { pct: 15, label: '15%',  kedv: 0.12, ajanlott: kor === '4-7' },
      { pct: 20, label: '20%',  kedv: 0.22, ajanlott: kor === '8-10' },
      { pct: 30, label: '30%',  kedv: 0.32, ajanlott: kor === '10plus' },
    ];

    var rows = szintek.map(function (s) {
      var onresz  = Math.max(ertek * s.pct / 100, 50000);
      var dijMin  = baseMin * (1 - s.kedv);
      var dijMax  = baseMax * (1 - s.kedv);
      var haviMin = dijMin / 12;
      var haviMax = dijMax / 12;
      var meg     = s.kedv > 0 ? ('<span class="badge bg-success">–' + Math.round(s.kedv * 100) + '%</span>') : '<span class="badge bg-light text-secondary">–</span>';
      var sor = s.ajanlott
        ? '<tr class="table-primary fw-semibold">'
        : '<tr>';
      return sor +
        '<td class="py-2 pe-3">' + s.label + (s.ajanlott ? ' <span class="badge bg-primary ms-1" style="font-size:.7rem;">javasolt</span>' : '') + '</td>' +
        '<td class="py-2">' + fmt(onresz) + '</td>' +
        '<td class="py-2">' + fmt(Math.round(dijMin)) + '&nbsp;–&nbsp;' + fmt(Math.round(dijMax)) + '</td>' +
        '<td class="py-2">' + fmt(Math.round(haviMin)) + '&nbsp;–&nbsp;' + fmt(Math.round(haviMax)) + '</td>' +
        '<td class="py-2">' + meg + '</td>' +
      '</tr>';
    });

    var kuszob = fmt(Math.max(ertek * 0.10, 50000));

    el('kalk-result-casco').innerHTML =
      '<div class="mt-4">' +
        '<div class="alert alert-' + recClass + ' border-0 d-flex align-items-start gap-2 mb-3">' +
          '<i class="fa ' + recIcon + ' fa-lg mt-1 flex-shrink-0"></i>' +
          '<span class="fw-semibold">' + rec + '</span>' +
        '</div>' +
        '<div class="table-responsive">' +
          '<table class="table mb-0" style="font-size:.875rem;">' +
            '<thead class="table-light">' +
              '<tr>' +
                '<th class="py-2">Önrész szint</th>' +
                '<th class="py-2">Önrész összege</th>' +
                '<th class="py-2">Éves díj (tól–ig)</th>' +
                '<th class="py-2">Havi díj (tól–ig)</th>' +
                '<th class="py-2">Díjmegtakarítás</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' + rows.join('') + '</tbody>' +
          '</table>' +
        '</div>' +
        '<div class="d-flex align-items-start gap-2 border-start border-primary border-3 ps-3 py-2 mt-3 bg-white rounded-end small">' +
          '<i class="fa fa-lightbulb text-primary mt-1 flex-shrink-0"></i>' +
          '<span><strong>Kárbejelentési küszöb:</strong> ' + kuszob + ' alatti kárnál általában nem érdemes bejelenteni, hogy megőrizze a kármentességi kedvezményt (bonus).</span>' +
        '</div>' +
        '<p class="text-muted small mt-3 mb-3">Tájékoztató jellegű becslés. Biztosítónként eltér. Pontosan csak az alkusz által bekért ajánlatokból dönthető el.</p>' +
        '<div class="cta-strip text-center mt-2">' +
          '<p class="lead mb-4">Pontosan azért vagyunk, hogy a valós ajánlatokat egymás mellé tegyük az Ön járművére.</p>' +
          '<div class="d-flex flex-column flex-sm-row justify-content-center gap-3">' +
            '<a href="/ajanlatkeres/casco" class="btn btn-light btn-lg rounded-pill px-5 py-3 hover-lift"><i class="fa fa-file-text me-2"></i>Ajánlatkérés online</a>' +
            '<a href="tel:+36706258201" class="btn btn-outline-light btn-lg rounded-pill px-5 py-3 hover-lift phone-link"><i class="fa fa-phone-alt me-2"></i>+36 70 625 8201</a>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* ── Jégkár / elemi kár becslő ───────────────────────── */
  function calcJegkar() {
    var ertek = parseInt((el('kalk-vegyon-ertek').value || '0').replace(/\D/g,''), 10) || 0;
    var tipus = el('kalk-vegyon-tipus').value;

    if (ertek < 1000000) {
      el('kalk-result-jegkar').innerHTML =
        '<div class="alert alert-warning mt-4">Kérjük, adjon meg legalább 1 000 000 Ft értéket.</div>';
      return;
    }

    var rateMin = { epulet: 0.0030, gep: 0.0045, termeny: 0.0060, jarmu: 0.0025 };
    var rateMax = { epulet: 0.0070, gep: 0.0100, termeny: 0.0120, jarmu: 0.0055 };
    var min = ertek * (rateMin[tipus] || 0.003);
    var max = ertek * (rateMax[tipus] || 0.007);
    var tipusLabel = {
      epulet: 'épület / ingatlan', gep: 'gép és berendezés',
      termeny: 'termény / készlet', jarmu: 'gépjármű flotta'
    };

    el('kalk-result-jegkar').innerHTML =
      '<div class="alert alert-primary border-0 mt-4">' +
        '<div class="fw-bold fs-5 mb-1">' + fmt(min) + ' – ' + fmt(max) + ' / év</div>' +
        '<small class="text-muted">Elemi kár fedezet (jégkár, szélkár, árvíz) ' + tipusLabel[tipus] + ' esetén.<br>' +
          'Biztosított vagyon: ' + fmt(ertek) + ' – tájékoztató jellegű.</small>' +
        '<hr class="my-3">' +
        '<a href="./kapcsolat.html" class="btn btn-primary btn-sm me-2">' +
          '<i class="fa fa-envelope me-2"></i>Ajánlatot kérek</a>' +
        '<a href="tel:+36425952480" class="btn btn-outline-primary btn-sm">' +
          '<i class="fa fa-phone me-2"></i>+36 42 595 248</a>' +
      '</div>';
  }

  /* ── Bind events ──────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var btnKgfb = el('kalk-btn-kgfb');
    if (btnKgfb) btnKgfb.addEventListener('click', calcKgfbFlotta);

    var btnCasco = el('kalk-btn-casco');
    if (btnCasco) btnCasco.addEventListener('click', calcCascoOnresz);

    var btnJegkar = el('kalk-btn-jegkar');
    if (btnJegkar) btnJegkar.addEventListener('click', calcJegkar);

    // Format currency inputs on blur
    ['kalk-casco-ertek', 'kalk-vegyon-ertek'].forEach(function(id) {
      var inp = el(id);
      if (!inp) return;
      inp.addEventListener('blur', function() {
        var v = parseInt(inp.value.replace(/\D/g,''), 10);
        if (!isNaN(v) && v > 0) inp.value = v.toLocaleString('hu-HU');
      });
      inp.addEventListener('focus', function() {
        inp.value = inp.value.replace(/\D/g,'');
      });
    });

    // Live slider label for kgfb
    var slider = el('kalk-jarmu-szam');
    var sliderLabel = el('kalk-jarmu-szam-label');
    if (slider && sliderLabel) {
      slider.addEventListener('input', function() {
        sliderLabel.textContent = slider.value + ' db';
      });
    }
  });
})();
