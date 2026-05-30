// Balesetbiztositas specialist profiler - moved from inline script
(function () {
      var profilData = {
        "munkavallaló": {
          ikon: "fa-briefcase",
          cim: "Munkavállaló: mit ad a balesetbiztosítás a TB mellé?",
          szoveg: "A munkahelyi TB-biztosítás csak a munkavégzés közben és az oda vezető úton bekövetkező balesetekre érvényes. Otthon, hétvégén, sport közben nincs fedezet. Egy egyéni balesetbiztosítás ezt a hiányt tölti be: 24 órás védelem, rokkantsági térítés és kórházi napidíj munkaidőn kívülre is.",
          mire: [
            "Nézze meg, mit fedez pontosan a munkahelyi TB, és hol van a határa.",
            "Az egyéni csomagban a rokkantsági táblázatot és a kórházi napidíj összegét érdemes összehasonlítani.",
            "Fizikai munkánál magasabb biztosítási összeg javasolt, irodai munkánál az alap csomag általában elegendő."
          ],
          res: 58,
          resLabel: "Közepes fedezeti hiány – munkaidőn kívüli védelme nincs",
          kerdesek: [
            "Pontosan meddig terjed a munkahelyi TB, és mit fed otthoni balesetnél?",
            "Melyik csomagnál mekkora a rokkantsági táblázatban a különbség?"
          ]
        },
        "vallalkozo": {
          ikon: "fa-laptop",
          cim: "Vállalkozó / Szabadúszó: nekik különösen fontos",
          szoveg: "Önálló vállalkozóknál és szabadúszóknál a munkáltatói TB-védelem nem feltétlenül áll fenn, és baleset esetén a keresőképtelenség bevételkiesést jelent. Egy megfelelő balesetbiztosítás kórházi napidíjjal és keresőképtelenségi fedezettel csökkentheti ezt a hatást.",
          mire: [
            "Van-e keresőképtelenségi fedezet, és mennyi a napi kifizetés összege?",
            "A biztosítási összeget érdemes az éves bevételhez arányosítani.",
            "Egyéni csomagnál különösen fontosak a kizárások: mi nem térül?"
          ],
          res: 30,
          resLabel: "Nagy fedezeti hiány – munkáltatói TB-védelem általában nincs",
          kerdesek: [
            "Van keresőképtelenségi fedezet a csomagban, és mennyi napi összeg jár?",
            "Hogyan arányosítsam az éves bevételemhez a biztosítási összeget?"
          ]
        },
        "sportoló": {
          ikon: "fa-running",
          cim: "Aktívan sportoló: a sportkiegészítő dönthet",
          szoveg: "Az alap balesetbiztosítások egyes sportfajtákat – búvárkodás, ejtőernyőzés, versenysport – kizárhatnak, vagy csak magasabb díjú kiegészítővel fednek. Ha rendszeresen edz vagy intenzív hobbit folytat, pontosan ellenőrizni kell, hogy a csomag kiterjed-e az adott tevékenységre.",
          mire: [
            "Ellenőrizze a kizárások listájában, hogy a sportja szerepel-e benne.",
            "Ha versenyen is indul, ezt kötéskor külön jelezni kell.",
            "Csonttörési díj és kórházi napidíj összege sportolóknál különösen releváns."
          ],
          res: 52,
          resLabel: "Közepes fedezeti hiány – alap csomag a sportot kizárhatja",
          kerdesek: [
            "A csomag kifejezetten kizárja-e az én sportfajtámat?",
            "Versenyzőknél a kiegészítő mennyivel drágítja a havi díjat?"
          ]
        },
        "szulo": {
          ikon: "fa-child",
          cim: "Szülő / gyermek: a 24 órás fedezet a kulcs",
          szoveg: "Gyermekeknél az iskolai, sportolás közbeni és szabadidős balesetek a leggyakoribbak. Az egyéni vagy szülői szerződésbe vont gyermek-balesetbiztosítás 24 órás védelmet nyújt, és kórházi napidíjjal, csonttörési díjjal csökkenti a váratlan kiadásokat.",
          mire: [
            "Ellenőrizze, hogy a gyermekre is kiterjed-e a fedezet, és milyen korhatárig.",
            "A kórházi napidíj és csonttörési összeg gyermekeknél legyen megfelelő.",
            "Iskolai sport és kirándulás általában fedezett, de ezt érdemes pontosan elolvasni."
          ],
          res: 72,
          resLabel: "Kisebb fedezeti hiány – iskolai biztosítás általában van, de korlátozott",
          kerdesek: [
            "Milyen korhatárig vehető fel a gyermek a szülői szerződésbe?",
            "Az iskolai baleseti biztosítás mennyire fedi az iskolán kívüli baleseteket?"
          ]
        }
      };

      // Szín a fedezeti csíkhoz (hiány mértéke alapján)
      function resColor(res) {
        var hian = 100 - res;
        if (hian >= 60) return "#dc3545";   // nagy hiány: piros
        if (hian >= 40) return "#fd7e14";   // közepes: narancs
        return "#ffc107";                    // kisebb: sárga
      }

      document.addEventListener("DOMContentLoaded", function () {
        var btns = document.querySelectorAll(".profil-btn");
        var result = document.getElementById("profilResult");
        var contentEl = document.getElementById("profilContent");
        if (!btns.length || !result || !contentEl) return;

        btns.forEach(function (btn) {
          btn.addEventListener("click", function () {
            btns.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
            btn.setAttribute("aria-pressed", "true");

            var key = btn.getAttribute("data-profil");
            var d = profilData[key];
            if (!d) return;

            var hian = 100 - d.res;
            var barColor = resColor(d.res);

            var h = '';
            // Fejléc
            h += '<div class="d-flex align-items-center gap-3 mb-4">';
            h += '<div class="service-icon bg-primary rounded d-flex align-items-center justify-content-center flex-shrink-0" style="width:52px;height:52px;">';
            h += '<i class="fa ' + d.ikon + ' text-white fa-lg"></i></div>';
            h += '<h3 class="h5 mb-0">' + d.cim + '</h3></div>';
            // Szöveg
            h += '<p class="text-muted mb-4">' + d.szoveg + '</p>';
            // Fedezeti hézag csík
            h += '<h4 class="h6 fw-semibold mb-2">Fedezeti lefedettség most:</h4>';
            h += '<div class="mb-1" style="height:14px;border-radius:8px;overflow:hidden;background:#e9ecef;">';
            h += '<div style="height:100%;width:' + d.res + '%;background:var(--primary);border-radius:8px 0 0 8px;transition:width 0.6s ease;"></div></div>';
            h += '<div class="d-flex justify-content-between small mb-1"><span class="fw-semibold text-primary">' + d.res + '% fedett</span>';
            h += '<span style="color:' + barColor + ';font-weight:600;">' + hian + '% hiány</span></div>';
            h += '<p class="small mb-4" style="color:' + barColor + ';">' + d.resLabel + '</p>';
            // Figyeljen rá lista
            h += '<h4 class="h6 fw-semibold mb-3">Mire figyeljen kötés előtt:</h4><ul class="list-unstyled mb-4">';
            d.mire.forEach(function (m) {
              h += '<li class="mb-2 hover-effect-item"><i class="fa fa-check-circle text-primary me-2"></i>' + m + '</li>';
            });
            h += '</ul>';
            // Kérdések az alkusznak
            h += '<div class="rounded-3 p-3 mb-4" style="background:rgba(13,110,253,.07);">';
            h += '<h4 class="h6 fw-semibold mb-2"><i class="fa fa-question-circle text-primary me-2"></i>Tegye fel az alkusznak:</h4>';
            h += '<ul class="list-unstyled mb-0">';
            d.kerdesek.forEach(function (k) {
              h += '<li class="small mb-1"><i class="fa fa-chevron-right text-primary me-1"></i>' + k + '</li>';
            });
            h += '</ul></div>';
            // CTA
            h += '<a href="/ajanlatkeres/baleset" class="btn btn-primary rounded-pill px-4 py-2">Ajánlatkérés <i class="fa fa-arrow-right ms-1"></i></a>';

            contentEl.innerHTML = h;
            result.classList.remove("d-none");
            result.scrollIntoView({ behavior: "smooth", block: "nearest" });
          });
        });
      });
    })();