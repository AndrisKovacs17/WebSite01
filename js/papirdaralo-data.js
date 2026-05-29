/* ================================================================
   papirdaralo-data.js  –  Papírdaráló
   12 fiktív A4-es dokumentum. Frontend-only, nincs adatmentés.
   FONTOS: minden dokumentum KITALÁLT. Nincs valódi személyes adat,
   nincs valós hivatalos formátum, állami címer vagy logó.
   Mezők:
     id, title, type (rövid típusleírás), stamp (sarokpecsét felirat),
     lines (halvány dokumentum-sorok, kitöltés-imitáció),
     decision: "shred" | "review"  (ajánlott helyes döntés),
     good   (visszajelzés helyes döntésnél),
     suggest(javasolt döntés szövege a visszajelző blokkban),
     lesson (tanulság).
   ================================================================ */
(function () {
  "use strict";

  window.PD_DOCS = [
    {
      id: "kulugyi-titkos",
      title: "KÜLÜGYI TITKOS ANYAG",
      type: "fiktív titkosított papír",
      stamp: "TITKOS",
      lines: ["Iktatószám: ████ / 20██", "Tárgy: ███████████████", "Minősítés: ██████████"],
      decision: "review",
      good: "Jó döntés. A túl komolynak tűnő papírt előbb azonosítottad.",
      suggest: "Az ilyen, fontosnak látszó papírt előbb érdemes azonosítani, nem azonnal darálni.",
      lesson: "A túl komolynak tűnő papírokat előbb érdemes azonosítani."
    },
    {
      id: "lakas-2009",
      title: "2009-es lakásbiztosítási kötvény",
      type: "régi biztosítás",
      stamp: "BIZTOSÍTÁS",
      lines: ["Kötvényszám: 2009-LAK-██████", "Biztosítási összeg: a 2009-es érték", "Évforduló: minden tavasszal"],
      decision: "review",
      good: "Jó döntés. Ezt tényleg jobb volt előbb átnézni.",
      suggest: "Ezt előbb érdemes átnézni: a fedezet és az érték elavulhatott.",
      lesson: "A régi kötvény nem biztos, hogy rossz, de valószínűleg nem a mai értékekre készült."
    },
    {
      id: "lejart-kgfb",
      title: "Lejárt KGFB igazolás",
      type: "lejárt dokumentum",
      stamp: "LEJÁRT",
      lines: ["Érvényesség vége: tavalyelőtt", "Rendszám: ABC-███", "Státusz: már nem aktuális"],
      decision: "shred",
      good: "Jó döntés. Ezt tényleg nem kell őrizgetni, ha már van új.",
      suggest: "Ha már van új, aktuális igazolásod, ez darálható.",
      lesson: "A lejárt igazolás önmagában nem érték, de az aktuális fedezetet mindig ellenőrizni kell."
    },
    {
      id: "jelszolista",
      title: "Kézzel írt jelszólista",
      type: "veszélyes papír",
      stamp: "VESZÉLYES",
      lines: ["banki belépés: ********", "e-mail: ********", "wifi: ********"],
      decision: "shred",
      good: "Jó döntés. Ennek tényleg a darálóban a helye.",
      suggest: "Ezt jobb ledarálni: érzékeny adat ne heverjen papíron.",
      lesson: "A jelszavak nem valók papíron az íróasztal szélére."
    },
    {
      id: "karbejelento-foto-nelkul",
      title: "Kárbejelentő fotók nélkül",
      type: "hiányos kárügy",
      stamp: "KÁRÜGY",
      lines: ["Káresemény dátuma: ████", "Csatolt fotók: hiányoznak", "Leírás: rövid, hiányos"],
      decision: "review",
      good: "Jó döntés. Kárügyben jobb előbb átnézni.",
      suggest: "Ezt előbb érdemes lett volna átnézni, nem darálni.",
      lesson: "Kárügyben a hiányos dokumentáció később lassíthatja az ügyintézést."
    },
    {
      id: "ures-ajanlatkero",
      title: "Üres ajánlatkérő lap",
      type: "használatlan dokumentum",
      stamp: "ÜRES",
      lines: ["Név: ____________", "Igény: ____________", "Aláírás: ____________"],
      decision: "shred",
      good: "Jó döntés. A felesleges üres laptól nyugodtan meg lehet válni.",
      suggest: "Ez egy kitöltetlen, felesleges lap — darálható.",
      lesson: "A felesleges üres papíroktól nyugodtan meg lehet válni."
    },
    {
      id: "elet-kedvezmenyezett-nelkul",
      title: "Életbiztosítás kedvezményezett nélkül",
      type: "fontos szerződés",
      stamp: "SZERZŐDÉS",
      lines: ["Biztosított: megvan", "Kedvezményezett: ____________", "Szolgáltatás: életre szól"],
      decision: "review",
      good: "Jó döntés. Az üres mezőt jobb most rendezni.",
      suggest: "Ezt érdemes átnézni: a hiányzó kedvezményezett később gond lehet.",
      lesson: "Az üresen hagyott mezők később komoly kérdéseket okozhatnak."
    },
    {
      id: "flotta-regi-lista",
      title: "Céges flotta régi járműlistája",
      type: "elavult céges dokumentum",
      stamp: "FLOTTA",
      lines: ["Járművek száma: a tavalyi", "Frissítve: rég volt", "Megjegyzés: változott a flotta"],
      decision: "review",
      good: "Jó döntés. Flottánál fontos a naprakész lista.",
      suggest: "Ezt előbb ellenőrizni kell: a járműlista lehet, hogy elavult.",
      lesson: "Flottánál fontos, hogy a járműlista naprakész legyen."
    },
    {
      id: "beazas-szamla",
      title: "Beázásról készült számla",
      type: "kárügyi bizonylat",
      stamp: "BIZONYLAT",
      lines: ["Számla kelte: ████", "Tétel: helyreállítás", "Összeg: ██████ Ft"],
      decision: "review",
      good: "Jó döntés. Kárügyi bizonylatot jobb megőrizni.",
      suggest: "Ezt ne daráld: kárügyben a számla fontos lehet.",
      lesson: "Kárügyben a számlák és bizonylatok fontosak lehetnek."
    },
    {
      id: "reklam-szorolap",
      title: "Régi reklámszórólap",
      type: "felesleges papír",
      stamp: "REKLÁM",
      lines: ["Akció: már lejárt", "Kedvezmény: nem érvényes", "Apróbetű: nincs jelentősége"],
      decision: "shred",
      good: "Jó döntés. Ez tényleg nem érték.",
      suggest: "Ez egy lejárt reklám — nyugodtan darálható.",
      lesson: "Nem minden papír értékes. Ez például valószínűleg nem az."
    },
    {
      id: "casco-onresz",
      title: "Casco önrész tájékoztató",
      type: "fontos feltétel",
      stamp: "FELTÉTEL",
      lines: ["Önrész mértéke: ██ %", "Minimum: ██████ Ft", "Alkalmazás: minden kárnál"],
      decision: "review",
      good: "Jó döntés. Az önrészt érdemes érteni kár előtt.",
      suggest: "Ezt érdemes átnézni: az önrész kár esetén valódi pénz.",
      lesson: "Az önrész kár esetén nagyon is valódi pénz."
    },
    {
      id: "majd-egyszer-feltetel",
      title: "„Majd egyszer elolvasom” szerződési feltétel",
      type: "halogatott dokumentum",
      stamp: "FELTÉTEL",
      lines: ["Oldalszám: sok", "Apróbetű: sűrű", "Elolvasva: még nem"],
      decision: "review",
      good: "Jó döntés. A feltételt jobb kár előtt érteni.",
      suggest: "Ezt érdemes átnézni — kár előtt, nem utána.",
      lesson: "A feltételeket jobb kár előtt megérteni, nem utána."
    }
  ];

  /* Visszajelző szövegkészletek (a döntés helyességéhez). */
  window.PD_FEEDBACK = {
    goodShred: ["Jó döntés.", "Ezt tényleg nem kell őrizgetni.", "Mehet a darálóba."],
    goodReview: ["Jó döntés.", "Ezt jobb volt előbb átnézni.", "Okos lépés: előbb megérteni."],
    badShred: [
      "Ezt lehet, hogy nem kellett volna rögtön ledarálni.",
      "Bizonyos dokumentumokat kárügy vagy szerződésmódosítás miatt érdemes megőrizni.",
      "A régi szerződés nem mindig szemét. Néha pont az mutatja meg, mit kell frissíteni."
    ],
    badReview: [
      "Ezt nyugodtan ledarálhattad volna — nem volt rá szükség.",
      "Nem minden papírt kell megőrizni; ez mehetett volna a darálóba.",
      "Ez felesleges papír volt, a tárolásával nem nyersz semmit."
    ]
  };

  /* Eredménytípusok. A controller a darálási/átnézési arány és a
     helyes döntések alapján választ közülük. */
  window.PD_RESULTS = {
    keeper: {
      title: "Iratmegőrző Mester",
      text: "Sok fontos dokumentumot mentettél meg az átnézésre. A papírjaid jó kezekben vannak."
    },
    minimalist: {
      title: "Darálókezű Minimalista",
      text: "Sok mindent ledaráltál. A rend megvan — csak a fontos papírokra figyelj oda legközelebb."
    },
    archeologist: {
      title: "Óvatos Kötvényrégész",
      text: "Sokszor választottad az átnézést. Inkább megérted a papírt, mielőtt döntesz — ez jó hozzáállás."
    },
    survivor: {
      title: "Papírkáosz Túlélő",
      text: "Vegyes döntéseid voltak. Néha daráltál, néha őriztél — a lényeg, hogy a fontosat átnézted."
    }
  };
})();
