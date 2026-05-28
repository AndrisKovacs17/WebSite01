/* =========================================================
   Bullshit Fordító — Biztosítási Fogalomtár
   window.BF_GLOSSARY  (50 fogalom)
   ========================================================= */

window.BF_GLOSSARY = [
  /* ── Általános fogalmak ────────────────────────────── */
  {
    term: "önrész",
    aliases: ["casco önrész", "önrészesedés", "saját rész", "franchise önrész", "onresz"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Az az összeg vagy százalék, amit kár esetén neked kell vállalnod. A biztosító a maradék részt fizeti ki.",
    whyItMatters: "Minél magasabb az önrész, annál olcsóbb a díj — de kár esetén többet fizetsz saját zsebből. A kettő egyensúlya kulcsfontosságú.",
    whatToCheck: "Nézd meg, hogy fix összeg, százalék, vagy a kettő kombinációja szerepel-e a szerződésben. Lehet minimum és maximum értéke is.",
    commonMisunderstanding: "Sokan azt hiszik, a biztosító minden kárt teljes egészében kifizet. Önrész esetén ez nem így van — a vállalt részt mindig az ügyfél viseli.",
    example: "Ha a kár 300 000 Ft és az önrész 10% (min. 30 000 Ft), akkor 30 000 Ft-ot te fizetsz, 270 000 Ft-ot a biztosító.",
    ctaHint: "Ha nem biztos abban, mekkora önrészt vállal a szerződésében, érdemes szakértőt kérni."
  },
  {
    term: "kizárás",
    aliases: ["kizárt kockázat", "fedezet alól kizárt", "kizarás"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Olyan esemény vagy ok, amire a biztosítás nem fizet. Ezeket a biztosító kizárja a fedezetből.",
    whyItMatters: "Ha nem ismered a kizárásokat, kellemetlen meglepetés érhet kár esetén — pont akkor nem fizet a biztosító, amikor számítanál rá.",
    whatToCheck: "A szerződési feltételekben keress 'kizárások' vagy 'mentesülési okok' fejezetet. Különösen figyelj a szándékos károkozásra, háborúra, nukleáris eseményekre.",
    commonMisunderstanding: "Sokan azt gondolják, az 'all risk' biztosítás mindent fed. Valójában az all risk-nek is vannak kizárásai, csak kevesebb.",
    example: "Egy lakásbiztosítás kizárja a szándékos károkozást. Ha te magad rongálod meg az ingatlant, a biztosító nem fizet.",
    ctaHint: "Kérjen segítséget a kizárások értelmezéséhez, mielőtt aláírja a szerződést."
  },
  {
    term: "várakozási idő",
    aliases: ["karencia", "karenciaidő", "várakozási időszak", "varakozasi ido"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Egy időszak a szerződéskötés után, amikor a biztosítás már érvényes, de bizonyos károkra még nem fizet.",
    whyItMatters: "Ha azonnal kár keletkezik a kötvény megkötése után, a várakozási idő alatt nem kapsz térítést a lefedett eseményekre.",
    whatToCheck: "Ellenőrizd, melyik kockázatnál van várakozási idő és mennyi az (pl. 30–90 nap). Baleset esetén általában nincs, betegségre sokszor igen.",
    commonMisunderstanding: "Sokan azt hiszik, ha megkötötték a biztosítást, az azonnal teljes védelmet nyújt. Ez nem mindig van így.",
    example: "Egészségbiztosítás esetén egy 60 napos várakozási idő azt jelenti, hogy az első 60 napban bekövetkező betegség miatti kezelést a biztosító nem téríti.",
    ctaHint: "Kérdezze meg tanácsadóját a várakozási időkről, mielőtt dönt a biztosításáról."
  },
  {
    term: "kockázatviselés kezdete",
    aliases: ["fedezet kezdete", "biztosítás kezdete", "kockázatviselés kezdet"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Az a nap és óra, amikortól a biztosító ténylegesen elkezdi fedezni a kockázatot — vagyis kár esetén fizet.",
    whyItMatters: "A szerződés aláírása és a kockázatviselés kezdete eltérhet egymástól. Az első díj befizetése előtt nincs fedezet.",
    whatToCheck: "A kötvényen szerepel a pontos dátum és időpont (pl. 2025.06.01. 00:00). Ellenőrizd, hogy az első díjat megfizette-e.",
    commonMisunderstanding: "Sokan azt hiszik, az aláírásnap a fedezet kezdete. Valójában sok biztosítónál az első díj tényleges megfizetése az, ami elindítja a fedezetet.",
    example: "Ha a biztosítást január 2-án kötöd, de az első díjat csak január 10-én fizeted be, akkor január 10. előtt nincs fedezet.",
    ctaHint: "Tisztázza pontosan, mikor kezdődik a fedezete, különösen, ha sürgős védelemre van szüksége."
  },
  {
    term: "biztosítási összeg",
    aliases: ["fedezeti összeg", "biztosított összeg", "limit összeg"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Az a maximális összeg, amennyit a biztosító egy kár esetén kifizet. Nem feltétlenül egyenlő a tényleges kárral.",
    whyItMatters: "Ha a biztosítási összeg alacsonyabb a valós értéknél, alulbiztosítottság áll fenn, és kár esetén arányosan kevesebbet kap.",
    whatToCheck: "A biztosítási összeget rendszeresen érdemes felülvizsgálni, különösen inflációs időszakban vagy ha értékes dolgokat szerzett be.",
    commonMisunderstanding: "Sok ügyfél azt gondolja, a biztosítási összeg és a kárkifizetés azonos. Valójában a tényleges kifizetés függ az önrésztől, avultatástól és más tényezőktől is.",
    example: "Ha az otthona 20 millió Ft-ra van biztosítva, de a teljes kár 25 millió Ft, a biztosító maximum 20 millió Ft-ot fizet.",
    ctaHint: "Ellenőriztesse szakértővel, hogy a biztosítási összeg valóban fedezi-e az ingatlanát vagy vagyonát."
  },
  {
    term: "alulbiztosítottság",
    aliases: ["alul biztosítottság", "alul biztosított", "alulbiztosított"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Ha a biztosítási összeg alacsonyabb a biztosított vagyontárgy valós értékénél, a biztosítás nem fed le mindent.",
    whyItMatters: "Alulbiztosítottság esetén kár esetén a biztosító arányosan kevesebbet fizet ki — a különbség az ügyfelet terheli.",
    whatToCheck: "A biztosítási összeget legalább évente egyszer hasonlítsa össze az ingatlan, berendezés vagy gépjármű aktuális értékével.",
    commonMisunderstanding: "Sokan azt gondolják, a régen megkötött biztosítás összege még mindig megfelelő. Az infláció és az értéknövekedés miatt ez ritkán igaz.",
    example: "Ha az épület valós értéke 40 millió Ft, de csak 25 millió Ft-ra van biztosítva, totálkárnál maximum 25 millió Ft-ot kap.",
    ctaHint: "Kérje meg alkuszát, hogy vizsgálja felül a biztosítási összegét és szükség esetén emelje meg."
  },
  {
    term: "túlbiztosítottság",
    aliases: ["túl biztosítottság", "túlbiztosított"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Ha a biztosítási összeg magasabb a biztosított vagyontárgy valós értékénél, a biztosító csak a tényleges kárértékig fizet.",
    whyItMatters: "Túlbiztosítottság esetén feleslegesen fizetsz magasabb díjat, mert a valósnál nagyobb összeget biztosítasz — ami valójában nem kerülhet kifizetésre.",
    whatToCheck: "A biztosítók nem téríthetnek a tényleges értéknél többet. A magasabb összeg csak magasabb díjat jelent, nem magasabb kártérítést.",
    commonMisunderstanding: "Sokan gondolják, hogy minél nagyobb összegre biztosítanak valamit, annál többet kapnak kár esetén. Ez nem igaz — csak a tényleges kárértéket térítik.",
    example: "Ha az ingatlan értéke 20 millió Ft, de 35 millió Ft-ra biztosítják, a biztosító totálkárnál is csak 20 millió Ft-ot fizet.",
    ctaHint: "Ne fizessen feleslegesen — kérje meg alkuszát, hogy valós értéken biztosítsa vagyonát."
  },
  {
    term: "indexálás",
    aliases: ["indexalás", "értékkövetés", "inflációkövetés", "automatikus értékemelés"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "A biztosítási összeg és díj automatikus emelése az infláció vagy egy meghatározott index alapján, hogy a fedezet ne csökkenjen reálértéken.",
    whyItMatters: "Indexálás nélkül néhány év alatt a biztosítás reálértéken csökken — az ugyanolyan összeg kevesebbet fed le inflációs környezetben.",
    whatToCheck: "Nézd meg, hogy az indexálás automatikus-e, vagy beleegyezést igényel. Ellenőrizd, melyik indexhez van kötve (pl. fogyasztói árindex, CPI).",
    commonMisunderstanding: "Sokan nem értik, miért nő a díjuk évről évre anélkül, hogy változtattak volna a szerződésen. Az indexálás ezt okozza — de a fedezet is nő.",
    example: "Ha a biztosítási összeg 10 millió Ft és az indexálás 5%, jövőre 10,5 millió Ft-ra emelkedik a fedezet — és arányosan a díj is.",
    ctaHint: "Kérdezze meg alkuszát, hogyan működik az indexálás az Ön szerződésében."
  },
  {
    term: "avultatás",
    aliases: ["avultatas", "avulás", "értékcsökkenés", "amortizáció"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "A vagyontárgy értékcsökkenésének figyelembevétele kárkifizetésnél. A régi vagy használt dolgokért kevesebbet fizet a biztosító.",
    whyItMatters: "Avultatás esetén a kár után nem az újabb értéket, hanem a tényleges (kopott, régi) értéket kapod meg — ez jelentősen csökkentheti a kifizetést.",
    whatToCheck: "Ellenőrizd, hogy a szerződés 'valós értéken' vagy 'újértéken' ad-e térítést. Az újérték biztosítás drágább, de kár esetén a helyettesítési árat kapod.",
    commonMisunderstanding: "Sok ügyfél azt várja, hogy kár esetén az eszköz jelenlegi piaci értékét kapja meg. Avultatásnál ez kevesebb lehet, ha az eszköz régi.",
    example: "Egy 5 éves TV tönkremegy. Ha a biztosítás avultatással dolgozik, nem a mai piaci árat fizeti, hanem a 5 évvel ezelőtt vett ár mínusz az értékcsökkenés összegét.",
    ctaHint: "Kérdezze meg, hogy a biztosítása újérték vagy valós érték alapján térít-e."
  },
  {
    term: "totálkár",
    aliases: ["teljes kár", "total loss", "totálkáros"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Amikor a kár olyan mértékű, hogy a biztosított dolog megjavítása nem éri meg, vagy nem lehetséges — a biztosító a teljes értéket fizeti ki.",
    whyItMatters: "Totálkár esetén a biztosítás a dolog teljes értékét téríti, de nem a javítási költséget. A kifizetett összeg az avultatástól és a biztosítási összegtől is függ.",
    whatToCheck: "Nézd meg, mi a totálkár küszöbe a szerződésben (pl. ha a javítás meghaladja a gépjármű értékének 70%-át, totálkárnak minősül).",
    commonMisunderstanding: "Sokan azt hiszik, totálkár esetén automatikusan egy új terméket kapnak. Valójában általában a biztosított értéket fizeti ki, és te magad vásárolsz újat.",
    example: "Ha a gépjármű értéke 3 millió Ft és a javítási költség 2,5 millió Ft (>70%), totálkárt állapítanak meg. A biztosító kb. 3 millió Ft-ot fizet (önrész levonásával).",
    ctaHint: "Érdemes alkusszal átbeszélni, hogy totálkár esetén pontosan mire számíthat."
  },
  {
    term: "részkár",
    aliases: ["részleges kár", "rész kár"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Olyan kár, amely nem semmisíti meg teljesen a biztosított vagyontárgyat, hanem csak részben tesz benne kárt — és javítással helyrehozható.",
    whyItMatters: "Részkár esetén a biztosító a javítási vagy helyreállítási költséget fizeti meg (önrész és avultatás levonásával), nem a teljes értéket.",
    whatToCheck: "Kérjen szakértői szemlét a pontos kárösszeg meghatározásához. Ellenőrizze az önrész mértékét, ami részkárnál is levonásra kerül.",
    commonMisunderstanding: "Sokan azt gondolják, hogy kis kár esetén nem érdemes bejelenteni. A saját döntésük, de a biztosítás éppen ilyen esetekre van.",
    example: "Egy vihar betör egy ablakot a lakásban. Ez részkár — a biztosító az ablak cseréjének költségét téríti, de csak az önrész felett lévő részt.",
    ctaHint: "Minden káreseményt érdemes bejelenteni, a biztosítóval közösen dönthetik el, érdemes-e eljárást indítani."
  },
  {
    term: "mentesülés",
    aliases: ["biztosító mentesülése", "kizáró ok", "kizárás alapja"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Olyan helyzet, amikor a biztosítónak törvény vagy szerződés alapján joga van visszautasítani a kártérítést, bár a kár egyébként fedezett lenne.",
    whyItMatters: "Ha mentesülési ok merül fel (pl. szándékos károkozás, ittas állapot, valótlan adatszolgáltatás), a biztosító nem köteles fizetni.",
    whatToCheck: "Olvasd át a szerződésben a 'mentesülési okok' részt. A leggyakoribbak: szándékosság, durva gondatlanság, alkohol/drog, hamis adatok.",
    commonMisunderstanding: "Sokan azt hiszik, hogy ha díjat fizet, a biztosító mindenképpen fizet. A mentesülési okok meglétekor ez nem igaz.",
    example: "Ha ittas vezet és balesetet okoz, a biztosító KGFB-ből fizet a károsultnak, de a saját Cascoja nem téríti a gépjármű kárát.",
    ctaHint: "Kérje meg alkuszát, hogy magyarázza el a mentesülési okokat az Ön szerződésében."
  },
  {
    term: "fedezet",
    aliases: ["biztosítási fedezet", "kockázati fedezet", "védelem"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Azok az esemény- és kártípusok, amelyekre a biztosítás ténylegesen fizet. A fedezet meghatározza, mi van és mi nincs benne a biztosításban.",
    whyItMatters: "A fedezet ismerete nélkül nem tudhatod, mire számíthatsz kár esetén. Sok vita abból ered, hogy az ügyfél másra gondolt, mint amit a szerződés tartalmaz.",
    whatToCheck: "Kérdezd meg pontosan, milyen kockázatokra terjed ki a fedezet és milyenekre nem. Különös figyelmet érdemelnek a kizárások.",
    commonMisunderstanding: "Sok ügyfél azt hiszi, hogy a biztosítás 'mindenre' kiterjed. Valójában minden biztosítás csak meghatározott kockázatokat fed.",
    example: "Egy alap lakásbiztosítás fedezi a tűzkárt, de lehet, hogy nem fedezi az árvízkárt — az külön kiegészítőként kell.",
    ctaHint: "Kérjen részletes fedezeti tájékoztatót, mielőtt dönt a biztosításáról."
  },
  {
    term: "záradék",
    aliases: ["záradékok", "kiegészítő feltétel", "endorsement"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "A biztosítási szerződés alapfeltételein túlmutató, azt módosító vagy kiegészítő írott kikötés. Szűkítheti vagy bővítheti a fedezetet.",
    whyItMatters: "A záradékok komolyan megváltoztathatják, mire vonatkozik a biztosítás. Egy rossz záradék kizárhatja a leglényegesebb kockázatot.",
    whatToCheck: "Mindig olvasd el a záradékokat a kötvényen. Ne fogadj el olyan záradékot, amit nem értesz — kérd meg az alkuszt, hogy magyarázza el.",
    commonMisunderstanding: "Sokan figyelmen kívül hagyják a záradékokat, mondván 'az apró betű'. Ezek azonban jogilag érvényes feltételek, amelyek módosíthatják az egész szerződést.",
    example: "Egy vállalati vagyonbiztosítás záradéka kizárhatja az elektronikus eszközöket — ezeket külön kell biztosítani.",
    ctaHint: "Kérjen segítséget a záradékok értelmezéséhez, mielőtt aláírja a kötvényt."
  },
  {
    term: "díjnemfizetés",
    aliases: ["nem fizet díjat", "díj nemfizetés", "díjhátralék", "elmaradó díj"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Ha az esedékes biztosítási díjat nem fizetik meg határidőre, a biztosítás szünetelhet, majd megszűnhet — fedezet nélkül maradhat.",
    whyItMatters: "Díjnemfizetés esetén a biztosítás nem nyújt védelmet, és kár esetén a biztosító nem köteles fizetni.",
    whatToCheck: "Nézd meg a szerződésben a türelmi idő hosszát (általában 30 nap) — ez az az időszak, amíg a díjat még megfizethetik, de a fedezet szünetel.",
    commonMisunderstanding: "Sokan azt hiszik, hogy ha egy hónapot késnek a díjjal, még mindig van fedezetük. A türelmi idő lejárta után ez nem igaz.",
    example: "A biztosítási díj minden hónap 1-jén esedékes. Ha március 1-én nem fizeti be és nincs 30 napos türelmi időszak, március 31. után megszűnik a fedezete.",
    ctaHint: "Állítson be automatikus banki átutalást, hogy ne maradjon fedezet nélkül figyelmetlen­ség miatt."
  },
  {
    term: "biztosítási évforduló",
    aliases: ["évforduló", "biztosítás évfordulója", "megújítás", "renewal"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Az a nap, amikor a biztosítási szerződés egy éve megkötésre vagy megújításra kerül. Ekkor általában lehet változtatni a feltételeken.",
    whyItMatters: "Az évfordulón felmondható vagy módosítható a szerződés. Ha az ügyfél nem él ezzel a jogával, a biztosítás általában automatikusan megújul.",
    whatToCheck: "Jegyezd meg az évfordulót, és legalább 30 nappal előtte vizsgáld felül a szerződésed, ha változtatni szeretnél vagy másik biztosítót választanál.",
    commonMisunderstanding: "Sokan csak az évfordulón akarnak felmondani — de a felmondást általában 30 nappal előre kell bejelenteni.",
    example: "Ha a biztosítást március 15-én kötötted, az évforduló minden év március 15-e. Ha felmondást tervezel, február 14-ig kell jelezned.",
    ctaHint: "Naptárba veszi az évfordulót és legalább 45 nappal előtte értékeltesse felül az ajánlatát."
  },
  {
    term: "kedvezményezett",
    aliases: ["kedvezményezett személy", "beneficiary", "kedvezmenyezett"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Az a személy (vagy szervezet), aki a biztosítási összeg kifizetésekor a pénzt megkapja — nem feltétlenül ugyanaz, aki a biztosítást köti.",
    whyItMatters: "Életbiztosításnál különösen fontos: ha a biztosított meghal, a kedvezményezett kapja az összeget. Ha nincs megnevezve, a hagyaték öröklési szabályai érvényesek.",
    whatToCheck: "Ellenőrizd, hogy ki van megnevezve kedvezményezettként. Életesemények (születés, válás, haláleset) után érdemes felülvizsgálni.",
    commonMisunderstanding: "Sokan azt hiszik, hogy az életbiztosítás automatikusan a házastársnak vagy gyereknek jár. Ha nincs megnevezve, hagyaték útján jut el hozzájuk — ami lassabb és bonyolultabb.",
    example: "Ha a kedvezményezett az édesanya, és a biztosított házasodik, érdemes átírni a kedvezményezettet a házastársra.",
    ctaHint: "Ellenőrizze, hogy a kedvezményezett megnevezése aktuális és megfelel a szándékainak."
  },
  {
    term: "biztosított",
    aliases: ["biztosított személy", "insured"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Az a személy vagy dolog, akinek/aminek az érdekében a biztosítás szól. A kár az ő személyét, egészségét vagy vagyonát érinti.",
    whyItMatters: "A biztosított nem feltétlenül ugyanaz, aki a szerződést köti (szerződő) és nem feltétlenül ugyanaz, aki a kifizetést kapja (kedvezményezett).",
    whatToCheck: "Több személy biztosítása esetén ellenőrizd, ki van ténylegesen biztosítva. Fontos ez utasbiztosításnál, csoportos biztosításoknál.",
    commonMisunderstanding: "Sokan összekeverik a biztosítottat, a szerződőt és a kedvezményezettet. Mindhárom lehet ugyanaz a személy, de nem szükségszerűen.",
    example: "Egy vállalati baleset-biztosítás esetén a szerződő a cég, a biztosítottak az alkalmazottak, a kedvezményezett az alkalmazott vagy hozzátartozói.",
    ctaHint: "Ellenőrizze, hogy a biztosítotti kör valóban azokat a személyeket tartalmazza, akiket védelemben szeretne részesíteni."
  },
  {
    term: "szerződő",
    aliases: ["biztosítást kötő fél", "policy holder", "szerződő fél"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Az a személy vagy cég, aki a biztosítási szerződést a biztosítóval megköti és a díjat fizeti. Nem feltétlenül egyezik a biztosítottal.",
    whyItMatters: "A szerződő fizeti a díjat és kommunikál a biztosítóval. Halál vagy megszűnés esetén fontos tudni, kinek van joga módosítani vagy felmondani a szerződést.",
    whatToCheck: "Vállalati biztosítások esetén különösen fontos, hogy a szerződő adatai naprakészek legyenek.",
    commonMisunderstanding: "Sokan azt gondolják, hogy csak a biztosított szólhat bele a szerződésbe. Valójában a szerződőnek van joga módosítani vagy felmondani.",
    example: "Egy szülő köt életbiztosítást a gyermekére: a szülő a szerződő, a gyerek a biztosított.",
    ctaHint: "Ellenőrizze, hogy a szerződői adatok (cím, telefonszám, e-mail) naprakészek a biztosítónál."
  },
  {
    term: "kárhányad",
    aliases: ["kár hányad", "loss ratio", "káros hányad"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "A kifizetett károk és a begyűjtött díjak aránya. Magas kárhányad esetén a biztosítótársaság veszteségesen működik és megemelheti a díjakat.",
    whyItMatters: "Ha egy adott terméknél vagy területen magas a kárhányad, a biztosítók díjemelést hajtanak végre — ezt az ügyfél is megérzi.",
    whatToCheck: "Ez inkább biztosítói belső mutató, de az ügyfél is találkozhat vele díjemelési indoklásban.",
    commonMisunderstanding: "Sokan azt hiszik, hogy ha nincs káruk, miért kell díjat fizetniük. A kárhányad mutatja, hogy a közös díjbefizetés fedezi-e a közös károkat.",
    example: "Ha egy biztosító 100 Ft díjbevételre 85 Ft kárkifizetést számol, a kárhányada 85% — ami már nyomás alatt tartja az árat.",
    ctaHint: "Kérdezze meg alkuszát, miért emelkedett a díja — a kárhányad-változás is indok lehet."
  },
  {
    term: "regressz",
    aliases: ["visszkereseti jog", "regresz", "visszakeresés"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Ha a biztosító kifizet egy kárt, amelyet harmadik fél okozott, a biztosítónak joga van a harmadik féltől visszakövetelni az összeget.",
    whyItMatters: "Ez védi az ügyfelet és a biztosítót is. A kárt okozó felet nem menti fel a kártérítési felelősség alól csak azért, mert a biztosító már fizetett.",
    whatToCheck: "Ha Te okozol kárt, a KGFB alapján a biztosítód fizet, de ha pl. ittas voltál, a biztosítónak regressz joga van irántad.",
    commonMisunderstanding: "Sokan azt hiszik, hogy ha a biztosító fizet, az ügy lezárul. Ha az ügyfél gondatlan vagy szabálysértő volt, a biztosító visszakövetelheti tőle a kifizetett összeget.",
    example: "Egy fuvarozó biztosítója kifizeti a sérült áru kárát. Ha a fuvarozó hibájából keletkezett a kár, a biztosítónak regressz joga van a fuvarozó felé.",
    ctaHint: "Kérdezze meg alkuszát, mikor keletkezhet regressz-igény az Ön biztosításánál."
  },
  {
    term: "bonus-malus",
    aliases: ["bm rendszer", "bónusz-málusz", "bonus malus rendszer", "bm besorolás"],
    category: "Gépjármű",
    catIcon: "🚗",
    plainExplanation: "A gépjármű kötelező felelősségbiztosítás díját befolyásoló rendszer: jó vezető (kevés kár) alacsonyabb díjat fizet (bónusz), rossz vezető (sok kár) magasabbat (málusz).",
    whyItMatters: "A BM besorolás közvetlen hatással van a KGFB díjára. Egy-egy bejelentett kár évekig megemelheti a díjat.",
    whatToCheck: "Minden év elején kap besorolási értesítőt. Ellenőrizze, hogy a fokozata megfelelő-e, és kérje ki a kárhistóriát, ha kérdéses.",
    commonMisunderstanding: "Sokan azt hiszik, hogy egy kis kár bejelentése érdemes — de a BM rendszerben ez malmába helyezési kárával kisebb kár esetén drágább lehet, mint magán fizetni a javítást.",
    example: "A0 fokozat a legjobb bónusz — akár 55% kedvezmény. Az M4 fokozat a legrosszabb málusz — akár 200%-os pótdíj.",
    ctaHint: "Kérjen számítást: megéri-e bejelenteni a kisebb károkat a BM-változás figyelembevételével."
  },
  {
    term: "franchise",
    aliases: ["franchise önrész", "időbeli franchise", "francise"],
    category: "Gépjármű",
    catIcon: "🚗",
    plainExplanation: "Egy típusú önrész: ha a kár kisebb, mint a franchise összege, a biztosító nem fizet semmit; ha nagyobb, a biztosító fizeti a teljes kárt (nem csak a különbséget).",
    whyItMatters: "A franchise-os szerződésnél fontos tudni, hogy kis kárnál teljesen önköltséges vagy, de nagyobb kárnál a biztosító az összes többi részt állja.",
    whatToCheck: "Nézd meg, levonásos franchise-ról vagy integrált franchise-ról van-e szó — a kettő lényegesen különbözik.",
    commonMisunderstanding: "Sokan összekeverik a hagyományos önrésszel: franchise esetén ha a kár eléri a küszöböt, a biztosító az EGÉSZ kárt fizeti (nem kiszámolja a különbséget).",
    example: "Ha a franchise 50 000 Ft és a kár 49 000 Ft, a biztosító nem fizet. Ha a kár 51 000 Ft, a biztosító integrált franchise esetén 51 000 Ft-ot fizet.",
    ctaHint: "Kérdezze meg alkuszát, hogy franchise vagy hagyományos önrész szerepel a szerződésében."
  },
  {
    term: "all risk",
    aliases: ["all-risk", "mindenkockázat", "mindenre kiterjedő", "all risks"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Olyan biztosítási fedezet, amely elvben minden kockázatra kiterjed, kivéve, amit a szerződés kifejezetten kizár.",
    whyItMatters: "All risk biztosítás széleskörű védelmet nyújt, és nem kell előre felsorolni, milyen kockázatokra vonatkozik — de a kizárásokra figyelni kell.",
    whatToCheck: "Olvasd el gondosan a kizárásokat — még az all risk biztosításnak is van. Különösen: szándékos károkozás, háború, nukleáris kockázat.",
    commonMisunderstanding: "Sokan azt hiszik, all risk esetén tényleg minden kockázatra fedezetet kapnak. Valójában a kizárások listája here is meghatározó.",
    example: "Egy vállalati vagyon all risk biztosítás fedezi a tüzet, betörést, vihart — de kizárja a gépek normál kopását és a háborút.",
    ctaHint: "Kérje meg alkuszát, hogy pontosan ismertesse az all risk szerződés kizárásait."
  },
  {
    term: "biztosítási díj",
    aliases: ["díj", "biztosítási premium", "premium", "díjfizetés"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Az összeg, amit a biztosítottnak fizetnie kell a biztosítónak a fedezet fenntartásáért. Általában havonta, negyedévente vagy évente esedékes.",
    whyItMatters: "A díj a biztosítás 'ára'. Csak akkor tart fenn fedezetet, ha a díj rendszeresen és időben be van fizetve.",
    whatToCheck: "Ellenőrizd a díjfizetés időpontját, módját és összegét. Kérdezz rá, mi változhat éves megújításkor (pl. indexálás).",
    commonMisunderstanding: "Sokan azt hiszik, hogy az olcsóbb díj rosszabb biztosítást jelent. Valójában a díj számos tényezőtől függ, és az összehasonlítás az ajánlatok között fontos.",
    example: "Egy KGFB éves díja 50 000 Ft, havi fizetésnél kb. 4 500 Ft/hó. Ha késik a fizetés, a fedezet megszűnhet.",
    ctaHint: "Kérjen több biztosítótól ajánlatot — az alkusz ingyenesen összehasonlítja a lehetőségeket."
  },
  {
    term: "díjfizetési gyakoriság",
    aliases: ["díjfizetés gyakorisága", "fizetési ütemezés", "havi díj", "negyedéves díj"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Milyen időközönként kell megfizetni a biztosítási díjat: havi, negyedéves, féléves vagy éves. Általában az éves fizetés a legolcsóbb.",
    whyItMatters: "Havi fizetésnél általában pótdíjat számítanak fel — az éves díj egybeni befizetése olcsóbb lehet 5–15%-kal.",
    whatToCheck: "Kérdezd meg, mekkora a különbség éves és havi fizetés között. Érdemes átváltani, ha lehetséges.",
    commonMisunderstanding: "Sokan azt hiszik, hogy ha havonta fizetnek, ugyanannyiba kerül összesen az éves díj. Valójában havi fizetésnél általában magasabb a teljes éves összeg.",
    example: "Évi díj: 60 000 Ft. Havi díj: 5 500 Ft × 12 = 66 000 Ft — évi 6 000 Ft-ot spórolhatsz éves fizetéssel.",
    ctaHint: "Kérdezze meg, mennyit spórolhat éves díjfizetéssel az Ön szerződésénél."
  },
  {
    term: "kárbejelentés",
    aliases: ["kár bejelentés", "kár bejelentése", "kárjelentés"],
    category: "Kárügyintézés",
    catIcon: "🔧",
    plainExplanation: "A káresemény hivatalos bejelentése a biztosítónak, amellyel elindul a kárrendezési folyamat. Határideje van, elmulasztása elveszítheti a kártérítési jogot.",
    whyItMatters: "A bejelentés módja és ideje meghatározza, mennyit kap a kártérítésből. Késedelem vagy hiányos bejelentés csökkentheti vagy elveszítheti a térítést.",
    whatToCheck: "Nézd meg a szerződésben a bejelentési határidőt (pl. 5 munkanap). Gyűjtsd össze a dokumentumokat: fotók, rendőrségi igazolás, számla, szükség esetén szakértői vélemény.",
    commonMisunderstanding: "Sokan azt hiszik, a biztosítónak automatikusan tudomása van a kárról. Aktívan be kell jelenteni, különben nem indul el a kárrendezés.",
    example: "Lakástűz esetén azonnal (vagy 24 órán belül) be kell jelenteni a kárt a biztosítónak. Fényképezze le a károkat bejelentés előtt, és ne takarítson el mindent.",
    ctaHint: "Mentse el a biztosítója kárbejelentési számát — káresemény esetén nem lesz idő keresgetni."
  },
  {
    term: "szemle",
    aliases: ["kárszemle", "helyszíni szemle", "kárfelvétel"],
    category: "Kárügyintézés",
    catIcon: "🔧",
    plainExplanation: "A biztosító által delegált szakértő helyszíni látogatása a kár felmérésére. Ennek eredménye alapján határozzák meg a kártérítés összegét.",
    whyItMatters: "A szemlén felvett adatok meghatározzák a kártérítés mértékét. Ha hiányos a dokumentáció, kevesebbet kaphat.",
    whatToCheck: "A szemle előtt gyűjtse össze az összes releváns dokumentumot. Legyen jelen a szemlén, és ne egyezzen bele semmibe, amivel nem ért egyet.",
    commonMisunderstanding: "Sokan azt hiszik, a szemléző automatikusan a maximumot ítéli meg. Valójában ők csak felmérnek — az összeg az alkuharcban és az irattárban dől el.",
    example: "Vihar után a biztosító küld egy szemlézőt. Ő felméreti a tetőkárt, és meghatározza a javítási költség biztosító által elfogadott összegét.",
    ctaHint: "Ne fogadjon el elsőre alacsony kárösszegot — fellebbezési jog megilleti. Alkusszal is felülvizsgáltathatja."
  },
  {
    term: "pótlási érték",
    aliases: ["helyreállítási érték", "csere érték", "pótlás értéke"],
    category: "Kárügyintézés",
    catIcon: "🔧",
    plainExplanation: "Az az összeg, amennyiért a károsult vagyontárgy helyett egy hasonlóan funkcióképes, de nem feltétlenül új dolog vásárolható.",
    whyItMatters: "A pótlási érték alapján az ügyfél nem feltétlenül kap annyit, hogy új terméket vegyen — csak egy hasonlót.",
    whatToCheck: "Kérdezd meg, pótlási értéken vagy újértéken térít-e a biztosítás. A különbség nagy lehet régebbi eszközöknél.",
    commonMisunderstanding: "Sokan összekeverik az újértékkel. Pótlási érték = hasonló használt dolog piaci ára; újérték = hasonló minőségű új dolog ára.",
    example: "Egy 5 éves mosógép tönkremegy. Pótlási érték lehet 50 000 Ft (hasonló korú, működő gép), újérték 120 000 Ft (ugyanolyan új gép).",
    ctaHint: "Kérje meg alkuszát, hogy az újérték-biztosítás lehetőségét is vizsgálja meg, főleg drága eszközöknél."
  },
  {
    term: "újérték",
    aliases: ["új érték", "replacement value", "ujérték"],
    category: "Kárügyintézés",
    catIcon: "🔧",
    plainExplanation: "Olyan biztosítás, ahol kár esetén nem az avult, hanem az új csere értéke alapján térít a biztosító — vagyis a kár előtti állapot visszaállítható.",
    whyItMatters: "Az újérték biztosítás drágább díjjal jár, de kár esetén nem az avult értéket kapja, hanem annyit, amennyiért valóban tud újat venni.",
    whatToCheck: "Nézd meg, van-e újérték kiegészítő a szerződésedben. Ha nincs, kérdezd meg, mennyibe kerülne hozzáadni.",
    commonMisunderstanding: "Sokan azt hiszik, hogy az alap biztosítás automatikusan újértéken térít. Általában nem — az avultatás csökkenti a kifizetést.",
    example: "Egy 3 éves laptop avultatással talán 50 000 Ft-ot ér. Újértéken 200 000 Ft-ot kap — amennyiért valóban vehet hasonlót.",
    ctaHint: "Fontolja meg az újérték kiegészítőt, főleg ingóság- és elektronikai eszközökre."
  },
  {
    term: "valós érték",
    aliases: ["piaci érték", "forgalmi érték", "actual cash value", "valós érték"],
    category: "Kárügyintézés",
    catIcon: "🔧",
    plainExplanation: "A vagyontárgy jelenlegi piaci értéke a kár időpontjában — figyelembe veszi a korát, állapotát és az avultatást.",
    whyItMatters: "Ha a biztosítás valós értéken térít (nem újértéken), régi tárgyak esetén jóval kevesebbet kap, mint amennyi az újra való csere kerülne.",
    whatToCheck: "Ellenőrizze, hogy a szerződésben valós értéken vagy újértéken térít-e a biztosító, és döntse el, melyik fedezi a tényleges szükségleteit.",
    commonMisunderstanding: "Sokan azt hiszik, 'valós érték' azt jelenti, amit az eszköz ténylegesen ér nekik személyesen. Valójában ez egy piaci alapú kalkuláció.",
    example: "Egy 10 éves autó újértéke 5 millió Ft lenne, de valós értéke (kora, kopása miatt) csak 2 millió Ft lehet.",
    ctaHint: "Kérjen egyértelmű tájékoztatást a kártérítés alapjáról, mielőtt dönt a biztosításról."
  },
  /* ── Gépjármű ───────────────────────────────────────── */
  {
    term: "casco",
    aliases: ["casco biztosítás", "kasko", "gépjármű casco"],
    category: "Gépjármű",
    catIcon: "🚗",
    plainExplanation: "Saját gépjárműre kötött önkéntes biztosítás, ami az autó saját kárait is fedezi — nem csak az általad okozott más autókban keletkező károkat.",
    whyItMatters: "KGFB önmagában csak a másik fél kárát fedezi. Casco nélkül a saját autód javítási költségét te viseled.",
    whatToCheck: "Teljes és részleges casco között különbség van. Teljes casco fedezi a baleseteket, lopást, természeti károkat; részleges casco általában csak az utóbbiakat.",
    commonMisunderstanding: "Sokan azt hiszik, a KGFB-vel védve van a saját autójuk is. A KGFB csak a harmadik félt védi, a saját autódat nem.",
    example: "Ha te okozol balesetet és az autód megrongálódik, a KGFB fizet a másik autójára, de a tiédre csak Casco fizet.",
    ctaHint: "Kérjen Casco ajánlatot — különösen hitelre vett autóknál ez általában kötelező is."
  },
  {
    term: "kgfb",
    aliases: ["kötelező biztosítás", "kötelező felelősségbiztosítás", "kgfb biztosítás", "kötelező gépjármű"],
    category: "Gépjármű",
    catIcon: "🚗",
    plainExplanation: "Kötelező Gépjármű Felelősségbiztosítás — minden forgalomban lévő jármű esetén kötelező. Csak a másik félnek okozott kárt fedezi, a sajátját nem.",
    whyItMatters: "KGFB nélkül nem lehet forgalomban tartani gépjárművet. Ha balesetet okozol, a biztosítód fizet a másik fél kárára.",
    whatToCheck: "Érdemes összehasonlítani a díjakat — azonos fedezetet nyújtó biztosítók között nagy különbségek lehetnek. A BM besorolás is befolyásolja a díjat.",
    commonMisunderstanding: "Sokan azt hiszik, hogy KGFB esetén a saját autójuk is be van biztosítva. Ez téves — a KGFB csak a harmadik felet védi.",
    example: "Te okozol egy kereszteződésben balesetet, és a másik autó roncs lesz. A te KGFB biztosítód fizet a másik autó javítására — a tiédre nem.",
    ctaHint: "Kérjen KGFB összehasonlítást — akár 30-40%-ot is spórolhat más biztosítónál azonos fedezet mellett."
  },
  {
    term: "önkéntes kárrendezés",
    aliases: ["direktkár rendezés", "saját kárrendezés", "direktkárrendezés"],
    category: "Kárügyintézés",
    catIcon: "🔧",
    plainExplanation: "Ha neked okoznak KGFB-s balesetet, a saját biztosítódhoz is fordulhatsz a kárrendezésért — nem kell a másik fél biztosítóját kergetni.",
    whyItMatters: "Gyorsabb és egyszerűbb lehet: a saját biztosítód kezeli a kárrendezést, majd az elszámol a másik biztosítóval.",
    whatToCheck: "Nem minden biztosító tagja az önkéntes kárrendezési rendszernek, és nem minden kárnál alkalmazható. Kérdezd meg a biztosítódat.",
    commonMisunderstanding: "Sokan azt hiszik, hogy az önkéntes kárrendezés csak nekik okoz plusz díjat. Valójában ez egy ügyfélbarát megoldás, ami gyorsítja a kárrendezést.",
    example: "A zöld lámpánál hátulról megütnek. Az önkéntes kárrendezés keretében a saját biztosítódnál is bejelentheted, nem kell a másik fél biztosítójára várnod.",
    ctaHint: "Kérdezze meg alkuszát, mikor érdemes önkéntes kárrendezést igénybe venni."
  },
  {
    term: "felelősségbiztosítás",
    aliases: ["felelősség biztosítás", "liability insurance", "polgári felelősség"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Olyan biztosítás, amely véd, ha te okozol kárt másnak — a biztosító fizet a károsult helyett neked.",
    whyItMatters: "Ha véletlenül kárt okozol másnak, te lennél köteles megtéríteni. A felelősségbiztosítás ezt vállalja át.",
    whatToCheck: "Ellenőrizd a limiteket: mekkora összegig fizet a biztosító. Vállalatok esetén ez kritikus — egy nagyobb káreset limites kifizetéssel is milliókba kerülhet.",
    commonMisunderstanding: "Sokan azt hiszik, hogy a felelősségbiztosítás a saját káraikat is fedezi. Nem — csak a másoknak okozott károkra vonatkozik.",
    example: "Egy vendéglátós üzlet padlóján megcsúszik egy vendég és eltöri a karját. A vállalkozói felelősségbiztosítás fedezi az orvosi költségeket.",
    ctaHint: "Kérjen szakmai felelősségbiztosítási ajánlatot, különösen, ha ügyfelekkel van kapcsolatban."
  },
  /* ── Lakás ──────────────────────────────────────────── */
  {
    term: "lakásbiztosítás",
    aliases: ["lakhely biztosítás", "ingatlan biztosítás", "otthon biztosítás"],
    category: "Lakás",
    catIcon: "🏠",
    plainExplanation: "Az otthonra és a benne lévő tárgyakra kötött biztosítás, amely tüz, vihar, betörés és más káresemények esetén kártérítést fizet.",
    whyItMatters: "Az otthon általában az ember legnagyobb vagyona — egy súlyos kár (pl. tűz, árvíz) katasztrofális anyagi következményekkel járhat biztosítás nélkül.",
    whatToCheck: "Ellenőrizd, hogy az épületre és az ingóságokra is kiterjed-e a fedezet. Kérdezz rá a természeti károkra (árvíz, földrengés) is, mert ezek sokszor külön fedezetet igényelnek.",
    commonMisunderstanding: "Sokan azt hiszik, hogy az alap lakásbiztosítás minden természeti katasztrófára kiterjed. Általában az árvíz, földrengés különálló fedezeti elem.",
    example: "Egy vihar kidönti a fát, ami betöri a tetőt. Az épületre vonatkozó lakásbiztosítás fedezi a tető javítási költségét.",
    ctaHint: "Ellenőriztesse alkusszal, hogy a lakásbiztosítása lefedi-e az aktuális piaci értéket és a legfontosabb kockázatokat."
  },
  /* ── Élet és egészség ────────────────────────────────── */
  {
    term: "életbiztosítás",
    aliases: ["élet biztosítás", "halál esetére szóló biztosítás", "life insurance"],
    category: "Élet és egészség",
    catIcon: "❤️",
    plainExplanation: "Olyan biztosítás, ami halál esetén pénzösszeget fizet a kedvezményezettnek. Lehet tisztán haláleseti (kockázati) vagy megtakarítási elemmel is rendelkező.",
    whyItMatters: "Ha eltartottak vannak, a haláleset nem csak érzelmi, hanem komoly anyagi csapást is jelenthet. Az életbiztosítás ezt a terhet csökkenti.",
    whatToCheck: "Kérdezd meg, hogy kockázati vagy megtakarítási típusú a biztosítás. A kockázati olcsóbb, a megtakarítási hosszú távra szól.",
    commonMisunderstanding: "Sokan azt hiszik, hogy az életbiztosítás kizárólag halál esetén fizet. Bizonyos típusok életre is kifizetnek meghatározott életkor esetén.",
    example: "Egy fiatal szülő köt életbiztosítást, hogy ha meghal, a gyerekek és a házastárs 10 millió Ft-ot kapjanak a hiteltörlesztés és a megélhetés fedezetére.",
    ctaHint: "Kérjen életbiztosítási tanácsadást — a megfelelő típus kiválasztása fontos döntés."
  },
  {
    term: "balesetbiztosítás",
    aliases: ["baleset biztosítás", "accident insurance", "baleseti biztosítás"],
    category: "Élet és egészség",
    catIcon: "❤️",
    plainExplanation: "Baleseti esemény (törés, rokkantság, halál) esetén egyszeri összeget fizet a biztosított vagy kedvezményezettje számára.",
    whyItMatters: "Kiegészíti az egészségbiztosítást — a balesetből eredő rokkantság hosszú távú anyagi terhet jelenthet balesetbiztosítás nélkül.",
    whatToCheck: "Ellenőrizd a rokkantság-fokozatokat és a hozzájuk tartozó kifizetési arányokat. Kérdezz rá, mit tekint a biztosító balesetnek, és mi a kizárás.",
    commonMisunderstanding: "Sokan azt hiszik, hogy a balesetbiztosítás a betegségekre is kiterjed. Általában csak baleseti eredetre vonatkozik, betegségből eredő rokkantságra nem.",
    example: "Ha munkahely-baleset következtében 40%-os rokkant lesz az ügyfél, és a szerződés 10 millió Ft-ot tartalmaz rokkantságra, a biztosító 4 millió Ft-ot fizet.",
    ctaHint: "Kérjen balesetbiztosítási ajánlatot, főleg fizikai munkát végzőknek vagy aktív sportolóknak."
  },
  {
    term: "egészségbiztosítás",
    aliases: ["egészség biztosítás", "health insurance", "egészségügyi biztosítás"],
    category: "Élet és egészség",
    catIcon: "❤️",
    plainExplanation: "Az egészségügyi ellátás (műtét, kezelés, rehabilitáció) költségeit részben vagy egészben fedező biztosítás. Magánklinikai ellátást is fedezhet.",
    whyItMatters: "Az állami egészségügy várólistái hosszúak lehetnek. Az egészségbiztosítás gyorsabb, kényelmesebb ellátáshoz nyújthat hozzáférést.",
    whatToCheck: "Ellenőrizd a várakozási időt, a kizárt betegségeket (pl. meglévő betegség) és a hálózati kórházak listáját.",
    commonMisunderstanding: "Sokan azt hiszik, az egészségbiztosítás mindent fed. Meglévő, előzetesen diagnosztizált betegségek általában ki vannak zárva.",
    example: "Ha egy ügyfélnek magánklinikán kell appendix-műtét, az egészségbiztosítás fedezi a műtéti és kórházi költségeket a megállapodott limiten belül.",
    ctaHint: "Kérjen egészségbiztosítási összehasonlítást — az ár-érték arány biztosítónként sokat változhat."
  },
  {
    term: "utasbiztosítás",
    aliases: ["utas biztosítás", "travel insurance", "utazási biztosítás"],
    category: "Élet és egészség",
    catIcon: "❤️",
    plainExplanation: "Utazás alatt bekövetkező betegség, baleset, poggyászkár, útlemondás vagy egyéb kellemetlenség esetén fizető biztosítás.",
    whyItMatters: "Külföldi orvosi kezelés katasztrofálisan drága lehet (főleg USA, Ausztrália). Utasbiztosítás nélkül egyetlen mentőrepülés csőddel fenyegethet.",
    whatToCheck: "Ellenőrizd a fedezeti összeget (orvosi kezelésre), a meglévő betegség-kizárásokat, a sport-tevékenységek fedezetét és a poggyász limitjét.",
    commonMisunderstanding: "Sokan azt hiszik, az EU-s kártyával (TAJ) mindenhol ingyenes az ellátás. Csak az EU-ban, és csak a kötelező alapellátásra vonatkozik — magánklinikára, mentőrepülőre nem.",
    example: "Egy síelő eltöri a lábát Ausztriában. Utasbiztosítás nélkül a mentőheli és a kórházi kezelés több millió Ft is lehet.",
    ctaHint: "Minden külföldi utazás előtt kössön utasbiztosítást — néhány ezer Ft-ba kerül, de megvéd milliós kiadásoktól."
  },
  /* ── Vállalati ──────────────────────────────────────── */
  {
    term: "vállalati vagyonbiztosítás",
    aliases: ["cégbiztosítás", "üzleti vagyonbiztosítás", "vállalkozói vagyonbiztosítás"],
    category: "Vállalati",
    catIcon: "🏢",
    plainExplanation: "A vállalkozás ingatlanát, berendezéseit, készleteit és más vagyonát fedező biztosítás tűz, betörés, természeti károk és egyéb veszélyek ellen.",
    whyItMatters: "Egy vállalkozás vagyona jelenti az üzlet alapját. Komoly kár (pl. tűzvész, betörés) biztosítás nélkül a cég megszűnéséhez vezethet.",
    whatToCheck: "Ellenőrizd, hogy minden vagyonelem (épület, gép, készlet, számítógép) benne van-e a biztosításban, és az összegek valós értéket tükröznek-e.",
    commonMisunderstanding: "Sokan azt hiszik, hogy a lakásbiztosítás fedi az otthoni vállalkozást is. Általában nem — a vállalkozói vagyon külön biztosítást igényel.",
    example: "Egy kis üzlet raktárát feltörik, 2 millió Ft értékű árut visznek el. Vállalati vagyonbiztosítás fedezi a veszteséget.",
    ctaHint: "Kérjen vállalati biztosítási auditot — meglepő lehet, milyen kockázatok vannak fedetlenül."
  },
  {
    term: "szállítmánybiztosítás",
    aliases: ["cargo biztosítás", "fuvarozói biztosítás", "szállitmány biztosítás"],
    category: "Vállalati",
    catIcon: "🏢",
    plainExplanation: "A szállítás közben megsérülő, elvesző vagy ellopott árut fedező biztosítás. Fontos import/export és logisztikai cégeknek.",
    whyItMatters: "A szállítás közbeni kár komoly pénzügyi veszteséget okozhat — a fuvarozó felelőssége korlátozott, az áru értékét nem feltétlenül téríti meg.",
    whatToCheck: "Kérdezz rá, hogy az összes szállítási módra (közút, légi, tengeri) kiterjed-e, és mi a kizárás (pl. nem megfelelő csomagolás).",
    commonMisunderstanding: "Sokan azt hiszik, a fuvarozó biztosítja az árut. Valójában a fuvarozó felelőssége korlátozott, és az ügyfél áruja nincs automatikusan biztosítva.",
    example: "Egy exportáló cég elektronikát szállít Ázsiából. A konténer tartalmának 30%-a megsérül tengeri viharban — a szállítmánybiztosítás fedezi a veszteséget.",
    ctaHint: "Ha rendszeresen szállít értékes árut, kérjen szállítmánybiztosítási ajánlatot."
  },
  {
    term: "géptörésbiztosítás",
    aliases: ["gép biztosítás", "machinery breakdown", "gép törés biztosítás"],
    category: "Vállalati",
    catIcon: "🏢",
    plainExplanation: "A termelési és ipari gépek, berendezések váratlan meghibásodása esetén fizető biztosítás — nem az avulásra, hanem a hirtelen törésre.",
    whyItMatters: "Egy kulcsgép leállása komoly termeléskiesést okozhat. A géptörésbiztosítás fedezi a javítási és csere-alkatrész költségeket.",
    whatToCheck: "Nézd meg, pontosan milyen meghibásodásokra vonatkozik, és mit zár ki (pl. normál kopás, tervszerű karbantartás elmulasztása).",
    commonMisunderstanding: "Sokan azt hiszik, hogy ha a gép elromlik, a vagyonbiztosítás fedezi. Általában nem — a géptörés külön fedezeti elem.",
    example: "Egy élelmiszeripari cég CNC-gépe váratlanul meghibásodik és egy alkatrész cseréje 500 000 Ft-ba kerül. A géptörésbiztosítás fedezi ezt.",
    ctaHint: "Kérjen géptörés-fedezet felmérést, ha termelőgépekkel dolgozik."
  },
  /* ── Kárügyintézés ──────────────────────────────────── */
  {
    term: "kárenyhítési kötelezettség",
    aliases: ["kár enyhítési kötelezettség", "kárelhárítás", "kár minimalizálás"],
    category: "Kárügyintézés",
    catIcon: "🔧",
    plainExplanation: "A biztosítottnak kötelessége mindent megtenni, hogy a kár ne növekedjen tovább. Ennek elmulasztása csökkentheti a kártérítést.",
    whyItMatters: "Ha nem tesz lépéseket a kár megállítására (pl. vízcsapot elzárni betört cső esetén), a biztosító csökkentheti a kifizetést.",
    whatToCheck: "Kár esetén azonnal tegyen lépéseket a kár megállítására és minimalizálására — ezt dokumentálja is (fotók, számlák).",
    commonMisunderstanding: "Sokan azt hiszik, ha van biztosításuk, mindent a biztosítóra bízhatnak. A kárenyhítési kötelezettség az ügyfél aktív részvételét is megköveteli.",
    example: "Megreped a vízvezeték és elkezd folyni. Az ügyfél köteles elzárni a vizet és kihívni a szerelőt — ha csak nézi, ahogy ázik a lakás, a biztosító csökkentheti a térítést.",
    ctaHint: "Kár esetén azonnal cselekedjen és dokumentáljon mindent — ez a kárrendezés alapja."
  },
  {
    term: "szerződésmódosítás",
    aliases: ["kötvény módosítás", "biztosítás módosítás", "policy amendment"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "A meglévő biztosítási szerződés feltételeinek, összegeinek, fedezetének vagy egyéb elemeinek megváltoztatása a futamidő alatt.",
    whyItMatters: "Életesemények (gyerek születése, ingatlanvásárlás, fizetésemelés) után érdemes felülvizsgálni és szükség esetén módosítani a szerződést.",
    whatToCheck: "Kérdezd meg, mikor lehet módosítani a szerződést és van-e extra cost. Egyes módosítások csak az évfordulón lehetségesek.",
    commonMisunderstanding: "Sokan azt hiszik, hogy a megkötött szerződésen nem lehet változtatni. Általában lehet, de egyes módosítások díjmódosítással is járhatnak.",
    example: "Egy lakásbiztosítást 10 éve kötöttek 15 millió Ft-os biztosítási összeggel. Az ingatlan most 35 millió Ft-ot ér — érdemes módosítani a biztosítási összeget.",
    ctaHint: "Legalább évente egyszer vizsgálja felül a szerződését alkuszával, és szükség esetén kérjen módosítást."
  },
  {
    term: "limit",
    aliases: ["fedezeti limit", "biztosítási limit", "maximum fedezet"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "Az a maximális összeg, amennyit a biztosító egy káreseményre vagy egy éven belül összesen kifizet. A tényleges kár feletti részt az ügyfél viseli.",
    whyItMatters: "Ha a kár meghaladja a limitet, a különbözetet saját zsebből kell állni. Különösen fontos felelősségbiztosításnál és vállalati biztosításnál.",
    whatToCheck: "Kérdezd meg, hogy eseménylimit van-e (per kár) vagy éves összesített limit, esetleg mindkettő egyszerre.",
    commonMisunderstanding: "Sokan azt hiszik, a biztosítás korlátlanul fizet. Valójában minden biztosításnál van maximum összeg.",
    example: "Egy felelősségbiztosítás 50 millió Ft-os limittel rendelkezik. Ha a kár 70 millió Ft, a biztosító 50 millió Ft-ot fizet, a maradék 20 millió Ft a vállalkozóé.",
    ctaHint: "Ellenőrizze a limiteket — főleg felelősségi és vállalati biztosításnál, ahol a kár összege korlátlan lehet."
  },
  {
    term: "kockázatfelmérés",
    aliases: ["kockázat felmérés", "risk assessment", "underwriting"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "A biztosító által elvégzett folyamat, amelynek során felmérjük a biztosítani kívánt kockázatot, és eldöntjük, milyen feltételekkel és díjon vállalják a fedezetet.",
    whyItMatters: "A kockázatfelmérés eredménye meghatározza, kapsz-e biztosítást, és milyen feltételekkel. Egyes kockázatokra a biztosítók nem vállalnak fedezetet.",
    whatToCheck: "Adjon meg pontos és teljes adatokat — a valótlan adatszolgáltatás mentesülést okozhat kár esetén.",
    commonMisunderstanding: "Sokan azt hiszik, hogy a biztosítási kérdőív csak formalitás. Valójában a hamis adatok komoly következményekkel járhatnak.",
    example: "Egy fogorvos egészségbiztosítást keres. A biztosító megkérdezi a meglévő betegségeket, korábbi műtéteket — ezek alapján szabja meg a díjat és a kizárásokat.",
    ctaHint: "Mindig pontosan és teljes körűen válaszolja meg a biztosítói kérdőívet."
  },
  {
    term: "kötvény",
    aliases: ["biztosítási kötvény", "policy", "kötvény dokumentum"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "A biztosítási szerződés hivatalos írásos dokumentuma, amely tartalmazza a felek adatait, a fedezeteket, az összeget, a díjat és a szerződési feltételeket.",
    whyItMatters: "A kötvény a biztosítás jogi bizonyítéka — kár esetén ennek alapján fizet a biztosító. Elvesztése pótolható, de biztonságos helyen kell tartani.",
    whatToCheck: "Ellenőrizze, hogy a kötvényen szereplő adatok (név, cím, fedezetek, összegek) helyesek. Egy elírás vitát okozhat kárrendezéskor.",
    commonMisunderstanding: "Sokan azt hiszik, hogy az ajánlatadás vagy a szóbeli megállapodás már fedezetet jelent. A tényleges fedezet a kötvény kiállításától és a díjfizetéstől függhet.",
    example: "A kötvény tartalmazza: biztosított neve, tárgy, fedezetek listája, biztosítási összeg, éves díj, kezdő és záró dátum, kizárások.",
    ctaHint: "Tartsa kötvényét elérhető helyen — digitálisan is mentse el. Kár esetén ez az első szükséges dokumentum."
  },
  {
    term: "értékkövetés",
    aliases: ["ertek kovetes", "automatikus értéknövelés", "CPI indexálás"],
    category: "Általános",
    catIcon: "📄",
    plainExplanation: "A biztosítási összeg automatikus növelése az infláció vagy az építési költségek emelkedéséhez igazodva, hogy a fedezet reálértéke ne csökkenjen.",
    whyItMatters: "Értékkövetés nélkül néhány év alatt a biztosítás alulbiztosítottá válhat, mert az épület vagy berendezés valós értéke nőtt, de a biztosítási összeg nem.",
    whatToCheck: "Kérdezd meg, milyen indexhez van kötve az értékkövetés (CPI, építési árak), és mikor alkalmazzák (általában évfordulókor).",
    commonMisunderstanding: "Sokan összekeverik az indexálással. Az indexálás a díjra vonatkozik, az értékkövetés a biztosított összeg növelésére.",
    example: "2020-ban 15 millió Ft-ra biztosítottad az ingatlanodat. 2025-re az értékkövetéssel 19 millió Ft-ra nőtt a biztosítási összeg — ahogy az ingatlan értéke is nőtt.",
    ctaHint: "Kérdezze meg alkuszát, hogy a biztosításán van-e értékkövetési klauzula."
  }
];

/* ── Segédfüggvények ──────────────────────────────────── */
(function () {
  "use strict";

  /* Ékezetek eltávolítása + kisbetűsítés */
  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, " ")
      .trim();
  }

  /* Keresési súlyok:
     1 = pontos egyezés      (term)
     2 = alias pontos        (alias)
     3 = starts-with term
     4 = starts-with alias
     5 = contains term
     6 = contains alias
     7 = word match term
     0 = nincs találat
  */
  function scoreEntry(entry, q) {
    const nq = normalize(q);
    const nt = normalize(entry.term);

    if (nt === nq) return 1;
    for (const a of entry.aliases || []) {
      if (normalize(a) === nq) return 2;
    }
    if (nt.startsWith(nq)) return 3;
    for (const a of entry.aliases || []) {
      if (normalize(a).startsWith(nq)) return 4;
    }
    if (nt.includes(nq)) return 5;
    for (const a of entry.aliases || []) {
      if (normalize(a).includes(nq)) return 6;
    }
    /* szó-szintű egyezés */
    const words = nq.split(/\s+/).filter(Boolean);
    if (words.length > 0 && words.every((w) => nt.includes(w))) return 7;
    for (const a of entry.aliases || []) {
      const na = normalize(a);
      if (words.length > 0 && words.every((w) => na.includes(w))) return 7;
    }
    return 0;
  }

  /**
   * Keresi a fogalmat a szószedetben.
   * @param {string} query
   * @returns {{ found: boolean, result: object|null, suggestions: object[] }}
   */
  function searchGlossary(query) {
    if (!query || !query.trim()) {
      return { found: false, result: null, suggestions: [] };
    }
    const scored = window.BF_GLOSSARY.map((e) => ({
      entry: e,
      score: scoreEntry(e, query),
    })).filter((s) => s.score > 0);

    scored.sort((a, b) => a.score - b.score);

    if (scored.length === 0) {
      return { found: false, result: null, suggestions: [] };
    }

    const best = scored[0];
    if (best.score <= 2) {
      return { found: true, result: best.entry, suggestions: [] };
    }
    /* részleges egyezés: mutasd a legjobb 3-at választási lehetőségként */
    if (best.score <= 4) {
      if (scored.length === 1) {
        return { found: true, result: best.entry, suggestions: [] };
      }
      return {
        found: false,
        result: null,
        suggestions: scored.slice(0, 4).map((s) => s.entry),
      };
    }
    /* gyengébb egyezés */
    return {
      found: false,
      result: null,
      suggestions: scored.slice(0, 4).map((s) => s.entry),
    };
  }

  /* Publikus API */
  window.BF = { normalize, searchGlossary };
})();
