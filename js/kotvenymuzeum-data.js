/* ================================================================
   kotvenymuzeum-data.js  –  Kötvénymúzeum
   Kiállítási termek és tárgyak. Frontend-only, nincs adatmentés.
   A képek PLACEHOLDER útvonalak — később manuálisan cserélhetők:
     /assets/images/museum-placeholders/kotveny-XX.jpg  (kiállított lap)
     /assets/images/museum-placeholders/hidden-0X.jpg   (rejtett, átszakadás mögötti)
   Ha a fájl nem létezik, elegáns CSS papír-placeholder marad.
   ================================================================ */
(function () {
  "use strict";

  /* Mezők:
     id, title, era, category, label (rövid múzeumi címke),
     dusty (poros példány), tearable (háromszori kattintásra átszakad),
     image (placeholder), hidden (átszakadás mögötti placeholder),
     why (miért érdekes), watchOut (mire figyelj),
     reviewNow (mit érdemes átnézni), curator (kurátori magyarázat),
     lesson (tanulság). */

  window.KM_ROOMS = [
    {
      id: "regi-kotvenyek",
      num: "I",
      name: "Régi kötvények terme",
      intro: "Elavult, átnézetlen szerződések, amelyek megálltak az időben — miközben az élet ment tovább.",
      exhibits: [
        {
          id: "lakas-12ev",
          title: "A 12 éve nem látott lakásbiztosítás",
          era: "12 év",
          category: "Lakásbiztosítás",
          label: "Felújított lakás, régi biztosítási összeggel.",
          dusty: true, tearable: false,
          image: "/assets/images/museum-placeholders/kotveny-01.jpg",
          hidden: "",
          why: "A lakás azóta megújult, az értéke nőtt — a szerződésben szereplő összeg viszont a régi maradt.",
          watchOut: "Alulbiztosítás esetén a biztosító kárnál arányosan csökkentheti a térítést.",
          reviewNow: "A biztosítási összeg és a lakás mai újraépítési értéke.",
          curator: "A leggyakoribb múzeumi darab. Nem rossz szerződés — csak megállt egy olyan évben, amikor a konyha még a régi volt.",
          lesson: "A lakás értéke változhat, a szerződés viszont nem frissül magától."
        },
        {
          id: "felujitott-haz",
          title: "A felújított ház régi biztosítási összeggel",
          era: "8 év",
          category: "Lakásbiztosítás",
          label: "Új tető, új nyílászárók, régi kötvény.",
          dusty: true, tearable: false,
          image: "/assets/images/museum-placeholders/kotveny-02.jpg",
          hidden: "",
          why: "A felújítás után a ház többet ér, de a fedezet a beruházás előtti állapotot tükrözi.",
          watchOut: "A korszerűsítés értékét érdemes bejelenteni, különben kimaradhat a fedezetből.",
          reviewNow: "Felújítás utáni érték, és hogy a beépített berendezések is fedezve vannak-e.",
          curator: "Aki felújít, ritkán gondol a kötvényre. Pedig pont olyankor változik a legtöbbet a védendő érték.",
          lesson: "A nagyobb beruházás után a biztosítás is megérdemel egy frissítést."
        },
        {
          id: "regi-motor",
          title: "A régi motor biztosítása a garázs mélyéről",
          era: "15 év",
          category: "Gépjármű",
          label: "Ritkán mozgatott darab.",
          dusty: true, tearable: false,
          image: "/assets/images/museum-placeholders/kotveny-03.jpg",
          hidden: "",
          why: "A motor évek óta a garázsban áll, a biztosítás viszont csendben fut tovább — vagy épp megszűnt, csak senki nem vette észre.",
          watchOut: "Szüneteltetett használatnál nem mindegy, él-e a kötelező és van-e értelme a teljes díjnak.",
          reviewNow: "Aktív-e még a szerződés, és illik-e a jelenlegi használathoz.",
          curator: "A garázs mélyén az idő máshogy telik. A kötvényen viszont ugyanúgy peregnek az évek.",
          lesson: "Ha a használat megváltozik, a biztosítást is érdemes hozzáigazítani."
        }
      ]
    },
    {
      id: "aprobetuk-fala",
      num: "II",
      name: "Apróbetűk fala",
      intro: "Itt a tanulság a kizárásban, a limitben, az önrészben vagy egy félreértett feltételben rejlik.",
      exhibits: [
        {
          id: "casco-onresz",
          title: "A casco, amit csak az önrész tart össze",
          era: "5 év",
          category: "Casco",
          label: "Szép fedezet, meglepő önrésszel.",
          dusty: false, tearable: false,
          image: "/assets/images/museum-placeholders/kotveny-04.jpg",
          hidden: "",
          why: "A díj kedvező volt, de a magas önrész miatt a kisebb károknál alig marad térítés.",
          watchOut: "Egy alacsony díj mögött gyakran magas önrész áll — kis koccanásnál nem is éri meg bejelenteni.",
          reviewNow: "Az önrész mértéke és típusai káreseményenként.",
          curator: "A látogatók kedvence: kívülről teljes védelem, belül egy szám, ami mindent eldönt.",
          lesson: "Az önrészt a kárnál érti meg az ember — jobb előbb tudni róla."
        },
        {
          id: "kizaras-vegig-ott",
          title: "A kizárás, ami végig ott volt",
          era: "7 év",
          category: "Feltételek",
          label: "A tanulság a papír mögött lapult.",
          dusty: false, tearable: true,
          image: "/assets/images/museum-placeholders/kotveny-05.jpg",
          hidden: "/assets/images/museum-placeholders/hidden-01.jpg",
          why: "A fedezet rendben tűnt, de a feltételek között ott volt egy kizárás, ami pont a bekövetkezett kárra vonatkozott.",
          watchOut: "A kizárások listája dönti el, mire NEM számíthatsz — érdemes előre elolvasni.",
          reviewNow: "Kizárások, korlátozó záradékok és a kapcsolódó feltételek.",
          curator: "Háromszori határozott mozdulattal kiderül, mi volt a főcím mögött. A kizárás nem bújt el — csak nem néztük meg.",
          lesson: "A kizárás akkor is létezik, ha nem olvastad el."
        },
        {
          id: "kotveny-kar-utan",
          title: "A kötvény, amit csak kár után olvastak el",
          era: "9 év",
          category: "Szerződés",
          label: "Poros példány.",
          dusty: true, tearable: false,
          image: "/assets/images/museum-placeholders/kotveny-06.jpg",
          hidden: "",
          why: "A szerződés évekig olvasatlanul pihent, és csak a kár pillanatában derült ki, mit is tartalmaz valójában.",
          watchOut: "Kárnál már nehéz módosítani — a feltételeket kötés után, nyugodt fejjel érdemes átfutni.",
          reviewNow: "A fedezet köre, a limitek és a kárbejelentés menete.",
          curator: "Sokan itt értik meg, hogy a feltételfüzet nem dekoráció. Csak épp egy kárral később.",
          lesson: "A szerződést nem kárnál, hanem előtte érdemes megismerni."
        }
      ]
    },
    {
      id: "elfelejtett-sarok",
      num: "III",
      name: "Elfelejtett szerződések sarka",
      intro: "Olyan biztosítások, amelyeket évek óta nem nézett át senki — pedig közben az élet átrendeződött.",
      exhibits: [
        {
          id: "kgfb-dijnemfizetes",
          title: "A KGFB, ami majdnem díjnemfizetéssel törlődött",
          era: "3 év",
          category: "Kötelező gfb",
          label: "Egy kihagyott csekken múlt.",
          dusty: false, tearable: false,
          image: "/assets/images/museum-placeholders/kotveny-07.jpg",
          hidden: "",
          why: "A díj egyszer elmaradt, és a kötelező hajszál híján megszűnt — fedezetlen autóval az úton.",
          watchOut: "A díjnemfizetés miatt megszűnt KGFB-t nem lehet csak úgy visszaállítani, és bírság is járhat.",
          reviewNow: "A díjfizetés módja és egy automatikus emlékeztető beállítása.",
          curator: "A sarok legidegesebb darabja. Boldog véget ért — de csak egy hajszálon múlt.",
          lesson: "A kötelező csak addig véd, amíg a díj rendben befut."
        },
        {
          id: "elet-ures-kedvezmenyezett",
          title: "Az életbiztosítás üres kedvezményezettel",
          era: "11 év",
          category: "Életbiztosítás",
          label: "Egy hiányzó név a papír mögött.",
          dusty: false, tearable: true,
          image: "/assets/images/museum-placeholders/kotveny-08.jpg",
          hidden: "/assets/images/museum-placeholders/hidden-02.jpg",
          why: "A szerződés rendben volt, csak épp a legfontosabb mezőt — a kedvezményezettet — soha nem töltötték ki vagy frissítették.",
          watchOut: "Kedvezményezett hiányában a szolgáltatás a törvényes öröklés útját járja, ami lassabb és bonyolultabb.",
          reviewNow: "Ki a jelenlegi kedvezményezett, és még mindig őt szeretnéd-e.",
          curator: "Háromszori mozdulattal előkerül a hiány. Nem a betűkkel volt baj, hanem azzal, ami kimaradt.",
          lesson: "Egy életbiztosítás annyit ér, amennyire pontos a kedvezményezett."
        },
        {
          id: "majd-egyszer-atnezem",
          title: "A „majd egyszer átnézem” típusú szerződés",
          era: "6 év",
          category: "Vegyes",
          label: "Poros példány.",
          dusty: true, tearable: false,
          image: "/assets/images/museum-placeholders/kotveny-09.jpg",
          hidden: "",
          why: "A klasszikus halogatás emlékműve: a szándék megvolt, az átnézés viszont mindig a következő hónapra csúszott.",
          watchOut: "A halogatott átnézés alatt az élethelyzet sokszor teljesen átalakul a szerződés körül.",
          reviewNow: "Egy konkrét időpont a naptárban a tényleges átnézésre.",
          curator: "A leggyakrabban kölcsönkért gondolat a múzeumban. Mindenki ráismer, kevesen vallják be.",
          lesson: "A „majd egyszer” ritkán jön el magától — érdemes dátumot adni neki."
        },
        {
          id: "tulbiztositott-funyirotraktor",
          title: "A túlbiztosított garázsban álló fűnyírótraktor",
          era: "4 év",
          category: "Vagyon",
          label: "Több fedezet, mint amennyit ér.",
          dusty: false, tearable: false,
          image: "/assets/images/museum-placeholders/kotveny-10.jpg",
          hidden: "",
          why: "A lelkesedés néha túllő a célon: erre a gépre több fedezet jutott, mint amennyit valaha érhet.",
          watchOut: "A túlbiztosításért fizetsz, de kárnál így is csak a tényleges értéket kapod vissza.",
          reviewNow: "A biztosított érték és a vagyontárgy valós értéke közötti különbség.",
          curator: "A túlbuzgóság emléke. Kedves darab, de a díja évek óta egy traktort hizlal papíron.",
          lesson: "A felesleges fedezet is pénzbe kerül — épp úgy, mint az alulbiztosítás."
        }
      ]
    },
    {
      id: "jo-peldak",
      num: "IV",
      name: "Jó példák vitrinsora",
      intro: "Frissen átnézett, jól összerakott, értelmes fedezetű szerződések — a múzeum büszkeségei.",
      exhibits: [
        {
          id: "utasbiztositas-jo",
          title: "Az utasbiztosítás, ami tényleg jól sikerült",
          era: "Friss",
          category: "Utasbiztosítás",
          label: "A jó döntés emléke.",
          dusty: false, tearable: false,
          image: "/assets/images/museum-placeholders/kotveny-11.jpg",
          hidden: "",
          why: "Megfelelő orvosi limit, hazaszállítás, a tevékenységhez illő fedezet — pontosan az utazáshoz szabva.",
          watchOut: "A jó utasbiztosításnál is érdemes ellenőrizni a sport- és poggyászfedezetet.",
          reviewNow: "Orvosi limit, hazaszállítás és a tervezett programokhoz illő kiegészítők.",
          curator: "Ritka, de létezik: egy szerződés, amire kár esetén tényleg lehetett számítani.",
          lesson: "A jó fedezet nem a legdrágább, hanem a helyzethez illő."
        },
        {
          id: "vallalkozoi-felelosseg-ido",
          title: "A vállalkozói felelősségbiztosítás, ami időben érkezett",
          era: "2 év",
          category: "Vállalkozás",
          label: "A jókor meghozott döntés.",
          dusty: false, tearable: false,
          image: "/assets/images/museum-placeholders/kotveny-12.jpg",
          hidden: "",
          why: "A fedezet még a baj előtt megvolt, így egy ügyfélnek okozott kár nem rengette meg a vállalkozást.",
          watchOut: "A szakmai és az általános felelősség nem ugyanaz — érdemes tudni, melyikre van szükség.",
          reviewNow: "A felelősségfedezet köre és a kártérítési limit.",
          curator: "A vitrin nyugodt darabja. Nem hősködik — egyszerűen ott volt, amikor kellett.",
          lesson: "A felelősségbiztosítás akkor ér a legtöbbet, ha a baj előtt köti meg az ember."
        },
        {
          id: "rendben-iratmappa",
          title: "A rendben tartott iratmappa dicsősége",
          era: "Folyamatos",
          category: "Rendszerezés",
          label: "Minden a helyén.",
          dusty: false, tearable: false,
          image: "/assets/images/museum-placeholders/kotveny-13.jpg",
          hidden: "",
          why: "Nem egy szerződés, hanem egy szokás: minden kötvény egy helyen, naprakészen, megtalálhatóan.",
          watchOut: "A rendszer csak akkor ér valamit, ha évente legalább egyszer frissül.",
          reviewNow: "Egy helyen vannak-e a kötvények, és melyik aktív még.",
          curator: "A múzeum csendes hőse. Unalmasnak tűnik — pont ez benne a zseniális.",
          lesson: "A rendezett papír kárnál többet ér, mint a legjobb emlékezet."
        },
        {
          id: "csotores-szamla",
          title: "A csőtörés után előkerült számla",
          era: "1 év",
          category: "Lakásbiztosítás",
          label: "A jól dokumentált kár.",
          dusty: false, tearable: false,
          image: "/assets/images/museum-placeholders/kotveny-14.jpg",
          hidden: "",
          why: "A vízkár kellemetlen volt, de a megőrzött számlák és fotók miatt a kárrendezés gördülékenyen ment.",
          watchOut: "Értékesebb javításnál a biztosító kérheti a számlát — érdemes megőrizni.",
          reviewNow: "Milyen dokumentumot kér kárnál a biztosítód, és hol tárolod ezeket.",
          curator: "A bizonyíték dicsérete. Egy fénykép és egy számla néha többet ér, mint tíz telefonhívás.",
          lesson: "A jó kárrendezés a dokumentációval kezdődik, nem a panasszal."
        },
        {
          id: "cyber-elso",
          title: "A cyber biztosítás első példánya",
          era: "Új korszak",
          category: "Cyber",
          label: "A digitális kor belépője.",
          dusty: false, tearable: false,
          image: "/assets/images/museum-placeholders/kotveny-15.jpg",
          hidden: "",
          why: "Az első olyan kiállított darab, amelynél a kockázat nem fizikai, hanem egy adatszivárgás vagy zsarolóvírus.",
          watchOut: "Sok vállalkozás a fizikai vagyonát biztosítja, a digitálisat viszont nem.",
          reviewNow: "Van-e cyber fedezet, és mit fedez egy incidens esetén.",
          curator: "A legfiatalabb tárgy a teremben. Húsz éve még senki nem értette volna, ma egyre többeknek nélkülözhetetlen.",
          lesson: "A betörő ma sokszor billentyűzeten át érkezik, nem az ablakon."
        },
        {
          id: "flotta-rendszerezve",
          title: "A flottaszerződés, ahol végre minden rendszerezve lett",
          era: "3 év",
          category: "Flotta",
          label: "Sok autó, egy átlátható rendszer.",
          dusty: false, tearable: false,
          image: "/assets/images/museum-placeholders/kotveny-16.jpg",
          hidden: "",
          why: "A korábbi káosz helyett egységes, átlátható flottakezelés — minden járműről tudni, mire van fedezve.",
          watchOut: "Vegyes korú és értékű flottánál nem mindegy, melyik autóra milyen szint kell.",
          reviewNow: "A flotta egységes kezelése, a casco-szintek és a vezetői kör.",
          curator: "A rend diadala nagyban. Aki valaha keresett egy autó kötvényét tíz között, az megérti.",
          lesson: "Sok jármű mellett az áttekinthetőség legalább annyit ér, mint a díj."
        }
      ]
    }
  ];

  window.KM_SECRET = {
    id: "titkos-terem",
    num: "?",
    name: "Titkos terem",
    subtitle: "A fal mögött talált kötvények.",
    exhibits: [
      {
        id: "mindenki-kereste",
        title: "A kötvény, amit mindenki keresett, de senki nem nyitott meg",
        era: "Ismeretlen",
        category: "Legenda",
        label: "A fiók mélyének klasszikusa.",
        dusty: false, tearable: false,
        image: "/assets/images/museum-placeholders/hidden-03.jpg",
        hidden: "",
        why: "Mindenki tudta, hogy létezik, mindenki kereste kárnál — és pont olyankor nem volt sehol.",
        watchOut: "Egy biztosítás csak akkor segít, ha akkor is megtalálod, amikor baj van.",
        reviewNow: "Hol tárolod a kötvényeket, és van-e róluk egy egyszerű lista.",
        curator: "A titkos terem nyitódarabja. A létezése sosem volt kérdés — a helye annál inkább.",
        lesson: "A megtalálhatóság is a fedezet része."
      },
      {
        id: "tul-olcso",
        title: "A biztosítás, ami túl olcsó volt, hogy igaz legyen",
        era: "Ismeretlen",
        category: "Legenda",
        label: "Gyanúsan fényes darab.",
        dusty: false, tearable: false,
        image: "/assets/images/museum-placeholders/hidden-04.jpg",
        hidden: "",
        why: "A díja annyira alacsony volt, hogy az már önmagában üzenet volt — kevesebb fedezetről, szűkebb körről.",
        watchOut: "A díj-összehasonlítás csak azonos fedezeti tartalom mellett fair.",
        reviewNow: "Mit tartalmaz pontosan az olcsó csomag, és mi maradt ki belőle.",
        curator: "A terem legcsillogóbb tárgya. Messziről tökéletes — közelről tele kérdőjellel.",
        lesson: "Az ár sosem mond el mindent arról, mit kapsz érte."
      },
      {
        id: "vegre-minden-rendben",
        title: "A mappa, amiben végre minden rendben volt",
        era: "Ritkaság",
        category: "Legenda",
        label: "A múzeum legnyugodtabb darabja.",
        dusty: false, tearable: false,
        image: "/assets/images/museum-placeholders/hidden-05.jpg",
        hidden: "",
        why: "Naprakész szerződések, kitöltött mezők, beírt évfordulók — egy mappa, amiben nem volt mit javítani.",
        watchOut: "A nyugalom akkor tartós, ha évente egyszer ránézel, nem változott-e az életed.",
        reviewNow: "Évente egy gyors átnézés: élethelyzet, érték, határidők.",
        curator: "A legenda, amiben mindenki hisz, de kevesen látták. Most itt van — bizonyítékként, hogy lehetséges.",
        lesson: "A legjobb biztosítási élmény az, amikor kárnál nincs meglepetés."
      }
    ]
  };

  /* Kurátori esemény-üzenetek (rövid, emberi, nem AI-szagú). */
  window.KM_CURATOR = {
    dust: [
      "A restaurátor szerint ez még menthető.",
      "Ez a kötvény már nagyon várta az átnézést.",
      "A por alatt is ugyanaz a tanulság: néha rá kell nézni a régi szerződésekre."
    ],
    torn: [
      "A fal mögött ritkán jó hírek vannak, de tanulság szinte mindig.",
      "A régi papír mögött ott volt a valódi tanulság."
    ],
    secret: "Gratulálunk, megtalálta a biztosítási régészet mélyebb rétegét.",
    intro: "A régi kötvények ritkán veszélyesek önmagukban. A gond ott kezdődik, amikor az élethelyzet már teljesen más, de a szerződés még mindig ugyanaz."
  };
})();
