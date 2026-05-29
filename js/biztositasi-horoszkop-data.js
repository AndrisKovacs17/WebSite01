/* ============================================================
   Biztosítási Horoszkóp – kérdések, eredménytípusok, állapotok
   Frontend-only adatstruktúra. Nincs backend, nincs adatmentés.
   window.BH_QUESTIONS / window.BH_RESULTS / window.BH_LOADING
   ============================================================ */
(function () {
  "use strict";

  /* Score dimenziók:
     riskAware, priceFocused, detailReader, chaosEnergy, trustExpert,
     proactive, minimalist, overinsured, lastMinute, premiumSeeker */

  var QUESTIONS = [
    {
      id: "first-check",
      question: "Amikor biztosítást kötsz, először mit nézel meg?",
      type: "single",
      answers: [
        { label: "Az árat.", scores: { priceFocused: 2 } },
        { label: "Mire fizet ténylegesen.", scores: { riskAware: 2, detailReader: 1 } },
        { label: "A kizárásokat és limiteket.", scores: { detailReader: 3 } },
        { label: "Megkérdezek valakit, aki ért hozzá.", scores: { trustExpert: 2 } }
      ]
    },
    {
      id: "feltetel-18-oldal",
      question: "Mit csinálsz, ha kapsz egy 18 oldalas biztosítási feltételt?",
      type: "single",
      answers: [
        { label: "Letöltöm, aztán soha többé nem nyitom meg.", scores: { chaosEnergy: 2, lastMinute: 1 } },
        { label: "Átfutom a fő részeket.", scores: { riskAware: 2 } },
        { label: "Keresem benne a kizárásokat.", scores: { detailReader: 3 } },
        { label: "Elküldöm valakinek, hogy fordítsa le emberi nyelvre.", scores: { trustExpert: 2 } }
      ]
    },
    {
      id: "lakaskar-reakcio",
      question: "Kár történik a lakásban. Mi az első reakciód?",
      type: "single",
      answers: [
        { label: "Pánik, majd telefon.", scores: { chaosEnergy: 2, proactive: 2 } },
        { label: "Fotózok, dokumentálok, bejelentem.", scores: { proactive: 3, riskAware: 1 } },
        { label: "Megnézem, van-e erre fedezet.", scores: { detailReader: 2, riskAware: 1 } },
        { label: "Megkérdezem: „Ez most biztosításos dolog?”", scores: { trustExpert: 1, chaosEnergy: 1 } }
      ]
    },
    {
      id: "olcso-ajanlat",
      question: "Egy ajánlat nagyon olcsó. Mit gondolsz?",
      type: "single",
      answers: [
        { label: "Tökéletes, kérem.", scores: { priceFocused: 3 } },
        { label: "Gyanúsan jó.", scores: { riskAware: 2 } },
        { label: "Megnézem, mi nincs benne.", scores: { detailReader: 2 } },
        { label: "Attól függ, ki ajánlja.", scores: { trustExpert: 2 } }
      ]
    },
    {
      id: "kedvenc-allat",
      question: "A következő 4 kép közül melyik a kedvenced?",
      microcopy: "Nincs rossz válasz – inkább a megérzésedre hagyatkozz.",
      type: "image",
      answers: [
        {
          label: "Bagoly", mood: "Elemző, feltételolvasó, óvatos.",
          image: "/assets/images/game-placeholders/animal-owl.jpg",
          icon: "fa-feather", gradient: ["#8d6e63", "#4e342e"],
          scores: { detailReader: 3, riskAware: 1 }
        },
        {
          label: "Róka", mood: "Ravasz, árérzékeny, ügyesen keres kedvezményt.",
          image: "/assets/images/game-placeholders/animal-fox.jpg",
          icon: "fa-paw", gradient: ["#FB8C00", "#E65100"],
          scores: { priceFocused: 3 }
        },
        {
          label: "Teknős", mood: "Lassú, de hosszú távon gondolkodik.",
          image: "/assets/images/game-placeholders/animal-turtle.jpg",
          icon: "fa-leaf", gradient: ["#558b2f", "#33691e"],
          scores: { riskAware: 2, minimalist: 2 }
        },
        {
          label: "Sas", mood: "Nagy képet néz, gyorsan dönt, szakértőre támaszkodik.",
          image: "/assets/images/game-placeholders/animal-eagle.jpg",
          icon: "fa-dove", gradient: ["#455a64", "#263238"],
          scores: { premiumSeeker: 3, trustExpert: 1 }
        }
      ]
    },
    {
      id: "kedvenc-kenyer",
      question: "Melyik a kedvenc kenyérfajtád?",
      microcopy: "Igen, ez most tényleg kenyérről szól. Vagy mégsem.",
      type: "single",
      answers: [
        { label: "Fehér kenyér – klasszikus, egyszerű megoldások híve.", scores: { minimalist: 3 } },
        { label: "Kovászos – tudatos, hosszabb távon gondolkodik.", scores: { riskAware: 2, proactive: 1 } },
        { label: "Teljes kiőrlésű – részletekre figyel.", scores: { detailReader: 2 } },
        { label: "Bármi, ami akciós.", scores: { priceFocused: 3 } },
        { label: "Nem eszem kenyeret, csak szerződési feltételeket.", scores: { detailReader: 3, chaosEnergy: 1 } }
      ]
    },
    {
      id: "atnezes-gyakorisag",
      question: "Milyen gyakran nézed át a biztosításaidat?",
      type: "single",
      answers: [
        { label: "Évente.", scores: { proactive: 3 } },
        { label: "Ha változik valami az életemben.", scores: { riskAware: 1, proactive: 2 } },
        { label: "Csak ha baj van.", scores: { lastMinute: 2 } },
        { label: "Őszintén? Nem tudom, hol vannak.", scores: { chaosEnergy: 2, lastMinute: 2 } }
      ]
    },
    {
      id: "onresz",
      question: "Mit jelent számodra az önrész?",
      type: "single",
      answers: [
        { label: "Valami, amit majd kárnál értek meg.", scores: { chaosEnergy: 2 } },
        { label: "Az a rész, amit nekem kell vállalnom.", scores: { riskAware: 1, detailReader: 1 } },
        { label: "Fontos döntési szempont.", scores: { detailReader: 2, proactive: 1 } },
        { label: "Attól függ, mennyivel olcsóbb tőle a díj.", scores: { priceFocused: 3 } }
      ]
    },
    {
      id: "sok-kiegeszito",
      question: "Ha egy biztosításban sok kiegészítő van, mit gondolsz?",
      type: "single",
      answers: [
        { label: "Jó, akkor mindenre is véd.", scores: { overinsured: 3, premiumSeeker: 1 } },
        { label: "Megnézem, melyikre van tényleg szükségem.", scores: { riskAware: 1, minimalist: 2 } },
        { label: "Félek, hogy csak drágítja.", scores: { priceFocused: 1, minimalist: 2 } },
        { label: "Szeretem, ha valaki segít kiválogatni.", scores: { trustExpert: 2 } }
      ]
    },
    {
      id: "hataridok",
      question: "Hogyan állsz a határidőkhöz?",
      type: "single",
      answers: [
        { label: "Naptárban vezetem.", scores: { proactive: 3 } },
        { label: "Általában figyelek, de néha csúszok.", scores: { riskAware: 1, proactive: 1 } },
        { label: "Az „évforduló” szó hallatán is stresszelek.", scores: { chaosEnergy: 2 } },
        { label: "Határidő? Az mi?", scores: { lastMinute: 3, chaosEnergy: 1 } }
      ]
    },
    {
      id: "utazo-tipus",
      question: "Milyen típusú utazó vagy?",
      type: "single",
      answers: [
        { label: "Mindent előre lefoglalok és bebiztosítok.", scores: { proactive: 2, overinsured: 2 } },
        { label: "Spontán megyek, de utasbiztosítást kötök.", scores: { riskAware: 2 } },
        { label: "Majd a reptéren megoldom.", scores: { lastMinute: 3 } },
        { label: "A poggyászom már többször kalandosabb életet élt, mint én.", scores: { chaosEnergy: 2 } }
      ]
    },
    {
      id: "vallalkozas",
      question: "Ha vállalkozásod lenne, mit biztosítanál először?",
      type: "single",
      answers: [
        { label: "Vagyontárgyakat, eszközöket.", scores: { minimalist: 2, riskAware: 1 } },
        { label: "Felelősségi kockázatokat.", scores: { riskAware: 2, detailReader: 1 } },
        { label: "Mindent, amit lehet.", scores: { overinsured: 3 } },
        { label: "Először megkérdezném, mi a reális.", scores: { trustExpert: 2 } }
      ]
    },
    {
      id: "nem-ertem",
      question: "Mit csinálsz, ha valamit nem értesz a szerződésben?",
      type: "single",
      answers: [
        { label: "Átugrom.", scores: { chaosEnergy: 2, minimalist: 2 } },
        { label: "Rákeresek.", scores: { proactive: 2, detailReader: 1 } },
        { label: "Megkérdezek szakértőt.", scores: { trustExpert: 3 } },
        { label: "Úgy teszek, mintha érteném, de belül pánikolok.", scores: { chaosEnergy: 3 } }
      ]
    },
    {
      id: "kozeli-mondat",
      question: "Melyik mondat áll hozzád legközelebb?",
      type: "single",
      answers: [
        { label: "„Legyen olcsó, de azért működjön.”", scores: { priceFocused: 2, minimalist: 2 } },
        { label: "„Inkább értsük meg rendesen.”", scores: { detailReader: 2, riskAware: 1 } },
        { label: "„Nem szeretem a meglepetéseket.”", scores: { riskAware: 2, detailReader: 1 } },
        { label: "„Majd akkor foglalkozom vele, ha muszáj.”", scores: { lastMinute: 3 } }
      ]
    },
    {
      id: "harom-ajanlat",
      question: "Kapsz három ajánlatot. Mit választasz?",
      type: "single",
      answers: [
        { label: "A legolcsóbbat.", scores: { priceFocused: 3 } },
        { label: "A legjobb ár-érték arányút.", scores: { riskAware: 2 } },
        { label: "Azt, amelyikben a legkevesebb kérdőjel marad.", scores: { detailReader: 2 } },
        { label: "Azt, amit egy megbízható alkusz is javasol.", scores: { trustExpert: 3 } }
      ]
    },
    {
      id: "legnagyobb-felelem",
      question: "Mi a legnagyobb biztosítási félelmed?",
      type: "single",
      answers: [
        { label: "Hogy túl sokat fizetek.", scores: { priceFocused: 3 } },
        { label: "Hogy kárnál nem fizet.", scores: { riskAware: 2, detailReader: 1 } },
        { label: "Hogy nem értem, mit kötöttem.", scores: { detailReader: 1, chaosEnergy: 2 } },
        { label: "Hogy elfelejtek valami fontos határidőt.", scores: { lastMinute: 3 } }
      ]
    },
    {
      id: "dzsungeltura-targy",
      question: "Válassz egy tárgyat, amit vinnél egy biztosítási dzsungeltúrára.",
      microcopy: "Csak egyet vihetsz. Válassz bölcsen.",
      type: "single",
      answers: [
        { label: "Nagyító", scores: { detailReader: 3 } },
        { label: "Kalkulátor", scores: { priceFocused: 2 } },
        { label: "Iratmappa", scores: { proactive: 2, riskAware: 1 } },
        { label: "Telefon egy alkusz számával", scores: { trustExpert: 3 } }
      ]
    },
    {
      id: "ha-beszelne",
      question: "Ha a biztosításod beszélni tudna, mit mondana neked?",
      type: "single",
      answers: [
        { label: "„Nézz már rám néha.”", scores: { lastMinute: 2, chaosEnergy: 1 } },
        { label: "„Nem vagyok olyan rossz, csak érteni kell.”", scores: { detailReader: 2 } },
        { label: "„Van pár apróbetűm, amit meg kéne beszélnünk.”", scores: { detailReader: 2, riskAware: 1 } },
        { label: "„Nyugi, engem jól raktak össze.”", scores: { proactive: 2, premiumSeeker: 2 } }
      ]
    }
  ];

  /* Eredménytípusok. A nyertes = max( scores[primaryScore]*3 + Σ scores[secondaryScores] ). */
  var RESULTS = [
    {
      id: "aprobetu-magus",
      name: "Apróbetű Mágus",
      tagline: "Te azt is elolvasod, amit más csak dekorációnak néz.",
      icon: "fa-search",
      gradient: ["#5e35b1", "#311b92"],
      primaryScore: "detailReader",
      secondaryScores: ["riskAware", "proactive"],
      description: "Mindent elolvasol, néha azt is, amit más csak dekorációnak néz. A feltételek, kizárások és limitek nem rejtenek sok meglepetést számodra.",
      strength: "Ritkán ér teljesen váratlanul egy kizárás vagy limit.",
      weakness: "Néha túlagyalod a döntést.",
      advice: "Jól áll neked a részletes összehasonlítás, de érdemes szakértővel gyorsítani a döntést.",
      tips: [
        "Készíts rövid checklistet a számodra fontos kizárásokról és limitekről.",
        "Egy alkusz segíthet a sok részletet gyors döntéssé alakítani.",
        "Évente nézd át, hogy a részletek még mindig az életedhez illenek-e."
      ],
      cta: "atnezetem"
    },
    {
      id: "kedvezmenyvadasz-roka",
      name: "Kedvezményvadász Róka",
      tagline: "Az árakat azonnal kiszúrod, az akciókat megérzed.",
      icon: "fa-paw",
      gradient: ["#FB8C00", "#E65100"],
      primaryScore: "priceFocused",
      secondaryScores: ["minimalist"],
      description: "Az árakat azonnal kiszúrod, az akciókat megérzed. Nem szeretsz feleslegesen drágán fizetni semmiért.",
      strength: "Nem fizetsz feleslegesen drágán.",
      weakness: "A túl olcsó ajánlat néha kevesebb fedezetet jelent.",
      advice: "Ne csak a díjat nézd, hanem a limiteket, kizárásokat és önrészt is.",
      tips: [
        "Hasonlítsd össze, mit tartalmaz az ár – ne csak a számot nézd.",
        "Ellenőrizd a limiteket és az önrészt a végső döntés előtt.",
        "Kérj több ajánlatot, hogy lásd a valódi ár-érték arányt."
      ],
      cta: "ajanlatkeres"
    },
    {
      id: "karpanik-harcos",
      name: "Kárpánik Harcos",
      tagline: "Amikor baj van, gyorsan kapcsolsz – néha túl gyorsan.",
      icon: "fa-bolt",
      gradient: ["#e53935", "#b71c1c"],
      primaryScore: "chaosEnergy",
      secondaryScores: ["proactive"],
      description: "Amikor baj van, gyorsan kapcsolsz, de közben minden ablak nyitva van a fejedben. A lényeg, hogy nem hagyod figyelmen kívül a problémát.",
      strength: "Nem hagyod figyelmen kívül a problémát.",
      weakness: "A kapkodás miatt kimaradhat dokumentáció vagy határidő.",
      advice: "Kárnál fotó, bejelentés, dokumentumok. Ha bizonytalan vagy, kérj segítséget.",
      tips: [
        "Tarts egy egyszerű kárbejelentési checklistet elérhető helyen.",
        "Fotózz és gyűjtsd a számlákat, mielőtt bármit eldobnál vagy javítanál.",
        "Mentsd el az alkuszod elérhetőségét, hogy pánik helyett hívhass."
      ],
      cta: "kapcsolat"
    },
    {
      id: "nyugalom-teknos",
      name: "Nyugalomra Szerződött Teknős",
      tagline: "Nem kapkodsz, hosszú távon gondolkodsz.",
      icon: "fa-leaf",
      gradient: ["#558b2f", "#33691e"],
      primaryScore: "riskAware",
      secondaryScores: ["minimalist", "proactive"],
      description: "Nem kapkodsz, hosszú távon gondolkodsz. Szereted a stabil, kiszámítható megoldásokat, amikre építeni lehet.",
      strength: "Szereted a stabil, kiszámítható megoldásokat.",
      weakness: "Néha túl sokáig halogatod az átnézést.",
      advice: "Évente egyszer érdemes ránézni, hogy a szerződés még mindig hozzád illik-e.",
      tips: [
        "Tegyél egy fix dátumot a naptárba az éves átnézésre.",
        "Életesemény (költözés, gyerek, autó) után nézd át a fedezeteket.",
        "A stabilitás jó – de a túl régi szerződés könnyen elavul."
      ],
      cta: "atnezetem"
    },
    {
      id: "premium-sas",
      name: "Prémium Sas",
      tagline: "Nem csak az árat nézed, hanem a teljes képet.",
      icon: "fa-dove",
      gradient: ["#FFA726", "#EF6C00"],
      primaryScore: "premiumSeeker",
      secondaryScores: ["riskAware", "trustExpert"],
      description: "Nem csak az árat nézed, hanem a teljes képet. Érted, hogy a jó fedezet néha fontosabb, mint a legalacsonyabb díj.",
      strength: "Érted, hogy a jó fedezet néha fontosabb, mint a legalacsonyabb díj.",
      weakness: "Könnyen választhatsz túl sok extrát is.",
      advice: "A prémium megoldás akkor jó, ha tényleg a te élethelyzetedre van szabva.",
      tips: [
        "Nézd át, hogy minden extra valóban a te kockázataidra szól-e.",
        "A magas fedezet mellé is érdemes a limiteket ellenőrizni.",
        "Egy alkusz segít kiszűrni a felesleges, de drága kiegészítőket."
      ],
      cta: "ajanlatkeres"
    },
    {
      id: "utolso-pillanat-ninja",
      name: "Utolsó Pillanat Ninja",
      tagline: "A határidők nem zavarnak, amíg már majdnem késő nincs.",
      icon: "fa-hourglass-half",
      gradient: ["#6d4c41", "#3e2723"],
      primaryScore: "lastMinute",
      secondaryScores: ["chaosEnergy"],
      description: "A határidők nem zavarnak, amíg már majdnem késő nincs. Stressz alatt is képes vagy dönteni, de ez nem mindig a legolcsóbb stratégia.",
      strength: "Stressz alatt is képes vagy dönteni.",
      weakness: "Évfordulók, díjfizetés és kárbejelentés terén ez kockázatos lehet.",
      advice: "Állíts be emlékeztetőket, és ne hagyd az átnézést az utolsó hétre.",
      tips: [
        "Állíts be naptári emlékeztetőt az évfordulóra és a díjfizetésre.",
        "Automatikus díjfizetéssel elkerülheted a véletlen lejáratot.",
        "Egy korai átnézés általában olcsóbb, mint a kapkodás."
      ],
      cta: "visszahivas"
    },
    {
      id: "alkuszra-tamaszkodo-diplomata",
      name: "Alkuszra Támaszkodó Diplomata",
      tagline: "Nem akarsz mindent egyedül megfejteni, inkább kérdezel.",
      icon: "fa-user-tie",
      gradient: ["#1565c0", "#0d47a1"],
      primaryScore: "trustExpert",
      secondaryScores: ["proactive", "riskAware"],
      description: "Nem akarsz mindent egyedül megfejteni, inkább kérdezel. Jó döntéshez jó kérdéseket teszel fel a megfelelő embernek.",
      strength: "Jó döntéshez jó kérdéseket teszel fel.",
      weakness: "Fontos, hogy tényleg megbízható szakértővel dolgozz.",
      advice: "Egy jó alkusz segít érthetővé tenni a különbséget ajánlat és ajánlat között.",
      tips: [
        "Válassz független alkuszt, aki több biztosítót is összehasonlít.",
        "Készíts listát a kérdéseidről a konzultáció előtt.",
        "Kérd, hogy emberi nyelven magyarázzák el a kizárásokat és limiteket."
      ],
      cta: "kapcsolat"
    },
    {
      id: "biztositasi-minimalista",
      name: "Biztosítási Minimalista",
      tagline: "Legyen egyszerű, érthető, működő.",
      icon: "fa-feather",
      gradient: ["#00897b", "#004d40"],
      primaryScore: "minimalist",
      secondaryScores: ["priceFocused"],
      description: "Nem szereted a túlbonyolított dolgokat. Legyen egyszerű, érthető, működő – a felesleges extrákat nyugodtan elhagyod.",
      strength: "Nem fizetsz szívesen felesleges extrákért.",
      weakness: "Néha pont egy hasznos kiegészítő maradhat ki.",
      advice: "A minimalista csomag is lehet jó, ha a lényegi kockázatokat lefedi.",
      tips: [
        "Listázd a számodra valóban fontos kockázatokat, és azokra fókuszálj.",
        "Az egyszerű csomag mellett is ellenőrizd a fő limiteket.",
        "Néha egy olcsó kiegészítő nagy kockázatot fed le – ezt érdemes megnézni."
      ],
      cta: "atnezetem"
    },
    {
      id: "tulbiztosito-gyujtogeto",
      name: "Túlbiztosító Gyűjtögető",
      tagline: "Ha lehet valamire kiegészítőt kötni, legalább elgondolkodsz rajta.",
      icon: "fa-layer-group",
      gradient: ["#8e24aa", "#4a148c"],
      primaryScore: "overinsured",
      secondaryScores: ["premiumSeeker", "riskAware"],
      description: "Ha lehet valamire kiegészítőt kötni, legalább elgondolkodsz rajta. Kevés kockázat marad nálad teljesen figyelmen kívül.",
      strength: "Kevés kockázat marad teljesen figyelmen kívül.",
      weakness: "Lehet, hogy olyasmiért is fizetsz, amire nincs szükséged.",
      advice: "Érdemes megnézni, mely fedezetek valóban relevánsak.",
      tips: [
        "Nézd át a kiegészítőket, és húzd ki, ami duplán fedez valamit.",
        "Rangsorold a fedezeteket aszerint, mennyire valószínű a kár.",
        "Egy alkusz segíthet kiszűrni az átfedő vagy felesleges elemeket."
      ],
      cta: "atnezetem"
    },
    {
      id: "kotvenykaosz-tulelo",
      name: "Kötvénykáosz Túlélő",
      tagline: "Valahol biztosan megvan minden, csak senki nem tudja, hol.",
      icon: "fa-folder-open",
      gradient: ["#757575", "#424242"],
      primaryScore: "chaosEnergy",
      secondaryScores: ["lastMinute"],
      description: "Valahol biztosan megvan minden, csak senki nem tudja pontosan, hol. A jó hír: érzed, hogy ezzel foglalkozni kellene.",
      strength: "Legalább érzed, hogy ezzel foglalkozni kellene.",
      weakness: "Kár vagy évforduló esetén a káosz sok időt vihet el.",
      advice: "Első lépésként érdemes összegyűjteni és átnézni a meglévő szerződéseket.",
      tips: [
        "Gyűjtsd egy helyre (mappa vagy felhő) az összes kötvényt.",
        "Készíts egy rövid listát: mid van, hol és mikor jár le.",
        "Egy átnézés segít kiszűrni a duplikációkat és a hiányokat."
      ],
      cta: "visszahivas"
    }
  ];

  /* Vicces státuszszövegek a progress mellé (folyadékszinthez kötve). */
  var LOADING = [
    "Kockázatérzék töltése…",
    "Apróbetű-tűrés elemzése…",
    "Kötvénykarma számítása…",
    "Biztosítási ösztön kalibrálása…",
    "Önrész-reflex tesztelése…",
    "Kárpánik-szint mérése…"
  ];

  window.BH_QUESTIONS = QUESTIONS;
  window.BH_RESULTS = RESULTS;
  window.BH_LOADING = LOADING;
})();
