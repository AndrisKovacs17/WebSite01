(function () {
  "use strict";

  const quizData = {
    lakas: {
      questions: [
        {
          q: "A belvízkár minden lakásbiztosításban alapfedezetként automatikusan szerepel.",
          a: false,
          e: "<strong>Tévhit.</strong> Az alapcsomagok nagy részéből a belvízkár kimarad. Nyíregyháza alacsonyabban fekvő részein ez különösen fontos fedezet, amit külön kell kérni vagy ellenőrizni.",
        },
        {
          q: "Alulbiztosítottság esetén a biztosító csak arányosan téríti meg a kárt.",
          a: true,
          e: "<strong>Igaz.</strong> Ha az újjáépítési értéknek csak 60%-ára van biztosítva az otthon, kárkor is csak 60%-ot fizethet a biztosító. Ez az egyik leggyakoribb és legköltségesebb hiba.",
        },
        {
          q: "A napelemet nem szükséges külön jelezni, mert az alap lakásbiztosítás automatikusan lefedi.",
          a: false,
          e: "<strong>Tévhit.</strong> A napelem értékét és pontos elhelyezését érdemes külön jelezni, mert biztosítónként eltérhet, hogy alapfedezetben vagy kiegészítőként térül.",
        },
        {
          q: "Ha egyszer megkötöttem a lakásbiztosítást, az mindig ugyanolyan jó ajánlat marad.",
          a: false,
          e: "<strong>Tévhit.</strong> A díjak, limitek és feltételek évente változhatnak. Egy régi szerződés lehet drágább vagy gyengébb fedezetű, mint egy aktuális ajánlat.",
        },
        {
          q: "Bérlőként elég a tulajdonos lakásbiztosítása, külön bérlői biztosítás nem szükséges.",
          a: false,
          e: "<strong>Tévhit.</strong> A tulajdonos biztosítása főként az épületet védi. A bérlő saját ingóságai és felelőssége külön fedezetet igényelhetnek.",
        },
      ],
      resultDescriptions: [
        "Ne aggódjon, ezért vagyunk itt. Megnézzük a meglévő biztosítását, és jelezzük, ha jobb lehetőség van.",
        "Sok a tévhit ezen a területen. Alkuszunk szívesen segít a kérdéseivel.",
        "Jó alap! Ha konkrét ajánlatot szeretne, hozza el a meglévő kötvényét, összehasonlítjuk.",
        "Képben van! Kérjen összehasonlítást, megnézzük, nem tud-e spórolni.",
        "Szinte mindent tud! Megnézzük, van-e kedvezőbb ajánlat az Ön adataival.",
        "Lakásbiztosítási szakértő! Kérjen ajánlatot, átnézzük a díjakat és a feltételeket.",
      ],
    },
    kgfb: {
      questions: [
        {
          q: "Ha biztosítót váltok, elveszítem a bónusz-fokozatomat.",
          a: false,
          e: "<strong>Tévhit.</strong> A bónusz-málusz fokozatot a MABISZ közhiteles nyilvántartásában tárolják. Az új biztosító automatikusan átveszi, egyetlen fokozatot sem veszít el.",
        },
        {
          q: "A KGFB csak Magyarországon érvényes.",
          a: false,
          e: "<strong>Tévhit.</strong> Az érvényes KGFB az EU/EGT összes tagállamában fedezetet nyújt. Egyes országokba papíralapú Zöldkártya is szükséges lehet.",
        },
        {
          q: "Ha nem fizetek KGFB-díjat, az nem von maga után azonnali következményt.",
          a: false,
          e: "<strong>Tévhit.</strong> A MABISZ fedezetlenségi díjat szab ki minden napra: 2026-ban személyautónál 990 és 2 510 Ft között mozog naponta.",
        },
        {
          q: "Biztosítás kötéséhez mindig személyesen kell megjelenni az irodában.",
          a: false,
          e: "<strong>Tévhit.</strong> A KGFB online is megköthető. Az ajánlatkérőt pár perc kitölteni, és visszahívjuk az összehasonlított ajánlatokkal.",
        },
        {
          q: "Minden biztosítónál ugyanolyan KGFB-díjat kell fizetni.",
          a: false,
          e: "<strong>Tévhit.</strong> Ugyanarra a járműre biztosítónként jelentős díjeltérés is előfordulhat. Összehasonlítással sokszor érdemi összeg spórolható.",
        },
      ],
      resultDescriptions: [
        "Ne aggódjon, ezért vagyunk itt. Segítünk eligazodni a KGFB tévhitei között.",
        "Sok a tévhit ezen a területen. Alkuszunk szívesen segít a kérdéseivel.",
        "Jó alap! Ha konkrét ajánlatot szeretne, pár perc alatt elküldheti kérését.",
        "Képben van! Kérjen összehasonlítást, megnézzük, nem tud-e spórolni.",
        "Szinte mindent tud! Megnézzük, van-e kedvezőbb ajánlat az Ön adataival.",
        "KGFB-szakértő! Kérjen ajánlatot, alaposan átnézzük a díjakat és feltételeket.",
      ],
    },
    egeszseg: {
      questions: [
        {
          q: "Az egészségbiztosítás minden korábbi betegséget automatikusan fedez.",
          a: false,
          e: "<strong>Tévhit.</strong> Az előzménybetegségek, kizárások, várakozási idők és limitek biztosítónként, illetve csomagonként eltérhetnek. Ezt ajánlat előtt mindig külön ellenőrizni kell.",
        },
        {
          q: "A szolgáltatásfinanszírozó egészségbiztosítás ellátást is szervezhet, nem csak pénzt fizet.",
          a: true,
          e: "<strong>Igaz.</strong> Ilyen csomagoknál a biztosító vagy partnere jellemzően segíthet az ellátás megszervezésében, időpontfoglalásban és a szerződés szerinti finanszírozásban.",
        },
        {
          q: "A legolcsóbb egészségbiztosítási csomag mindig ugyanazt tudja, mint a drágább.",
          a: false,
          e: "<strong>Tévhit.</strong> A csomagszintek között eltérhet a szolgáltatási kör, az éves limit, a diagnosztika, a szűrés, a betegútszervezés és a térítési összeg.",
        },
        {
          q: "Céges egészségbiztosításnál az adminisztráció és a jogosultságkezelés is fontos.",
          a: true,
          e: "<strong>Igaz.</strong> Munkáltatói csomagnál nem csak a díj számít: a beléptetés, kiléptetés, létszámváltozás, kommunikáció és bővíthetőség is része a döntésnek.",
        },
        {
          q: "A szolgáltatói hálózatot és az éves limiteket ajánlat előtt érdemes ellenőrizni.",
          a: true,
          e: "<strong>Igaz.</strong> A csomag akkor használható igazán, ha a szükséges ellátás elérhető helyen, érthető folyamattal és megfelelő kerettel vehető igénybe.",
        },
      ],
      resultDescriptions: [
        "Ne aggódjon, ezért érdemes alkusszal átnézni. Segítünk tisztázni a kizárásokat, limiteket és a használati folyamatot.",
        "Sok a félreértés ezen a területen. Egy rövid igényfelmérés után sokkal könnyebb összehasonlítani a csomagokat.",
        "Jó alap! Már látszik, mire kell figyelni, most érdemes a konkrét csomagfeltételeket is egymás mellé tenni.",
        "Képben van! Ajánlatkérésnél már nem csak a havidíjat fogjuk nézni, hanem a tényleges használhatóságot is.",
        "Szinte mindent tud! Megnézzük, melyik csomag illik legjobban az Ön vagy a cége helyzetéhez.",
        "Egészségbiztosítási szakértő! Jöhet az összehasonlítás: limitek, szolgáltatói hálózat, kizárások és ár egy helyen.",
      ],
    },
    utas: {
      questions: [
        {
          q: "Az Európai Egészségbiztosítási Kártya teljesen kiváltja az utasbiztosítást.",
          a: false,
          e: "<strong>Tévhit.</strong> Az EU-kártya hasznos, de nem teljes utasbiztosítás. Nem ad ugyanúgy poggyász-, assistance-, hazaszállítási vagy útlemondási védelmet, ezért az utazás célja szerint külön érdemes biztosítást választani.",
        },
        {
          q: "Minden sport és aktív program automatikusan benne van az alap utasbiztosításban.",
          a: false,
          e: "<strong>Tévhit.</strong> A síelés, búvárkodás, motorozás vagy más kockázatosabb program külön sport- vagy extrémsport-kiegészítőt igényelhet. Indulás előtt mindig ellenőrizni kell a feltételeket.",
        },
        {
          q: "Poggyászkárnál elég bemondani, mi veszett el vagy sérült meg.",
          a: false,
          e: "<strong>Tévhit.</strong> A biztosító jellemzően kérhet jegyzőkönyvet, csomagcímkét, számlát, fotót vagy egyéb igazolást. Minél rendezettebb a dokumentáció, annál könnyebb a kárrendezés.",
        },
        {
          q: "Baleset vagy sürgős orvosi helyzet esetén érdemes mielőbb felhívni a biztosító assistance számát.",
          a: true,
          e: "<strong>Igaz.</strong> Az assistance segíthet a megfelelő ellátóhely, a szükséges teendők és a dokumentumok tisztázásában, ezért a kötvényszámot és a segélyhívót érdemes indulás előtt elmenteni.",
        },
        {
          q: "Útlemondási fedezetnél mindegy, mikor kötjük meg a biztosítást.",
          a: false,
          e: "<strong>Tévhit.</strong> Útlemondási kiegészítőnél gyakori, hogy a foglaláshoz közeli időpontban vagy külön feltételekkel köthető. Ezt nem érdemes az utolsó pillanatra hagyni.",
        },
      ],
      resultDescriptions: [
        "Semmi gond, az utasbiztosítás pont az a terület, ahol sok apró feltétel számít. Átnézzük az úticélt, programot és limiteket.",
        "Sok félreértés van az utasbiztosítás körül. Egy rövid igényfelméréssel gyorsan kiderül, mire érdemes figyelni.",
        "Jó alap! Már látja a fő buktatókat, most érdemes a konkrét fedezeteket és kizárásokat egymás mellé tenni.",
        "Képben van! Ajánlatkérésnél már nem csak az árat, hanem a célországot, sportot, poggyászt és assistance-t is nézzük.",
        "Szinte mindent tud! Megnézzük, melyik csomag illik legjobban az útjához és az utazókhoz.",
        "Utasbiztosítási szakértő! Jöhet az összehasonlítás: egészségügyi limit, poggyász, sport, útlemondás és assistance egy helyen.",
      ],
    },
    baleset: {
      questions: [
        {
          q: "A balesetbiztosítás csak munkaidőben nyújt védelmet.",
          a: false,
          e: "<strong>Tévhit.</strong> A legtöbb egyéni balesetbiztosítás 24 órás fedezetet nyújt: munkahelyen, otthon és szabadidőben egyaránt. A munkahelyi TB-biztosítás ettől különálló.",
        },
        {
          q: "Alkohol hatása alatt bekövetkező baleset is térül az alapfedezetből.",
          a: false,
          e: "<strong>Tévhit.</strong> Az alkohol vagy kábítószer hatása alatt bekövetkező balesetek a legtöbb szerződésből kizártak. Ez az egyik leggyakoribb kizárás, amit érdemes ismerni.",
        },
        {
          q: "Rokkantsági kártérítésnél a biztosítási összeget arányosan, a rokkantság fokának megfelelő százalékban fizetik.",
          a: true,
          e: "<strong>Igaz.</strong> A biztosítók rokkantsági táblázat alapján fizetnek: a sérülés típusától függően a biztosítási összeg meghatározott százalékát térítik, nem feltétlenül az egészet.",
        },
        {
          q: "Külföldi balesetnél a balesetbiztosítás teljesen kiváltja az utasbiztosítást.",
          a: false,
          e: "<strong>Tévhit.</strong> A balesetbiztosítás külföldi balesetnél is érvényes lehet, de a helyszíni gyógykezelés megszervezéséhez, szállításhoz és assistance-hez külön utasbiztosítás ajánlott.",
        },
        {
          q: "A kárbejelentési határidő biztosítónként eltérő lehet.",
          a: true,
          e: "<strong>Igaz.</strong> A határidő általában 8–30 nap a baleset dátumától számítva, de ez szerződésenként különbözik. Érdemes előre tudni, hogy a saját biztosítónál mennyi áll rendelkezésre.",
        },
      ],
      resultDescriptions: [
        "Ne aggódjon, ezért érdemes alkusszal átnézni. Megmutatjuk, mire figyeljen kötés előtt és kárbejelentésnél.",
        "Sok a tévhit a balesetbiztosítás körül. Rövid igényfelmérés után sokkal könnyebb összehasonlítani az ajánlatokat.",
        "Jó alap! Már látja a fő buktatókat – most érdemes a konkrét fedezeteket és rokkantsági táblázatokat egymás mellé tenni.",
        "Képben van! Ajánlatkérésnél már nem csak a havi díjat, hanem a kizárásokat és rokkantsági arányokat is megnézzük.",
        "Szinte mindent tud! Megnézzük, melyik csomag illik legjobban az Ön vagy a cége helyzetéhez.",
        "Balesetbiztosítási szakértő! Jöhet az összehasonlítás: fedezetek, kizárások, rokkantsági táblázat és ár egy helyen.",
      ],
    },
    casco: {
      questions: [
        {
          q: "A KGFB biztosítás fedezi a saját jármű sérülését is, ha mi vagyunk a hibások.",
          a: false,
          e: "<strong>Tévhit.</strong> A KGFB csak a másik fél felé okozott kárt fedezi. Ha saját hibából törik fel az autó, a saját jármű sérülésére CASCO szükséges.",
        },
        {
          q: "Régi autóra soha nem érdemes CASCO-t kötni.",
          a: false,
          e: "<strong>Nem ennyire egyszerű.</strong> 8–10 évnél idősebb autónál a teljes CASCO valóban ritkán éri meg. De részleges CASCO, lopás és elemi kár fedezet idős autóra is hasznos lehet.",
        },
        {
          q: "Lopásnál a biztosító a jármű eredeti vételárát téríti meg.",
          a: false,
          e: "<strong>Tévhit.</strong> Lopásnál és total kárnál a biztosító a kár időpontjában érvényes piaci értéket fizeti, nem a vételárat. A roncs értékét le is vonják belőle.",
        },
        {
          q: "Magasabb önrész vállalásával csökkenthető a CASCO éves díja.",
          a: true,
          e: "<strong>Igaz.</strong> Magasabb önrész esetén a biztosító kevesebb kockázatot vállal, ezért a díj 20–35%-kal is csökkenhet. Kisebb kárnál viszont az önrész terheli a javítási költséget.",
        },
        {
          q: "CASCO-nál a kárbejelentési határidő rugalmas, nem kell sietni.",
          a: false,
          e: "<strong>Tévhit.</strong> Az ajánlott határidő általában 2 munkanap a káresemény után. Ha ennél később jelenti be, a biztosító részben elutasíthatja. Javítás előtt érdemes lefotózni a sérülést.",
        },
      ],
      resultDescriptions: [
        "A CASCO területén sok a félreértés. Alkuszként segítünk tisztázni, melyik fedezet illik az Ön járművéhez.",
        "Jó kiindulópont. Az önrész és a kizárások pontosabb megismerésével sokat spórolhat.",
        "Látja a fő különbségeket. Érdemes most megnézni, milyen önrésszel éri meg konkrétan az Ön autójára CASCO-t kötni.",
        "Képben van! Az ajánlatok összehasonlításakor nemcsak a díjat, hanem a total kár határát és az önrészt is megmutatjuk.",
        "Szinte mindent tud. Jöhet az összehasonlítás: fedezetek, önrész, kizárások egy helyen.",
        "CASCO szakértő! Megmutatjuk, melyik biztosító ajánlata illik legjobban az Ön vagy a cége járműflottájához.",
      ],
    },
    kegyeleti: {
      questions: [
        {
          q: "A temetés átlagos költsége Magyarországon 100 000 Ft alatt van.",
          a: false,
          e: "<strong>Tévhit.</strong> Egy átlagos temetés valódi költsége 400 000–1 000 000 Ft között mozog. Ez magában foglalja a koporsót, sírhely kiváltását, szertartást és az egyéb adminisztrációs díjakat.",
        },
        {
          q: "Az állami temetési segély teljes egészében fedezi a temetési kiadásokat.",
          a: false,
          e: "<strong>Tévhit.</strong> Az önkormányzati temetési segély összege általában 30 000–100 000 Ft, ami egy átlagos temetési költség töredékét sem fedezi.",
        },
        {
          q: "Kegyeleti biztosítást egyes biztosítóknál 70–85 éves korig is lehet kötni.",
          a: true,
          e: "<strong>Igaz.</strong> Több biztosítónál 70–85 éves korig köthető kegyeleti biztosítás, egyes termékeknél orvosi vizsgálat nélkül is. A díj és a karencia azonban eltér a fiatalabb korban kötöttektől.",
        },
        {
          q: "A kegyeleti biztosítás betegségi halálesetre azonnal, karencia nélkül teljes fedezetet nyújt.",
          a: false,
          e: "<strong>Tévhit.</strong> A legtöbb kegyeleti biztosításnál 6–12 hónapos karencia van betegségi halálesetre. Baleseti halálesetre általában a karencia alatt is érvényes a fedezet.",
        },
        {
          q: "A megjelölt kedvezményezett személye a szerződés futamideje alatt módosítható.",
          a: true,
          e: "<strong>Igaz.</strong> A kedvezményezett személye általában bármikor módosítható írásos bejelentéssel, ami fontos, ha a családi helyzet megváltozik.",
        },
      ],
      resultDescriptions: [
        "A kegyeleti biztosítás területén sok a tévhit. Alkuszként segítünk tisztázni, melyik fedezet illik a helyzetéhez.",
        "Jó kiindulópont. A karencia és a kizárások pontosabb megismerésével elkerülheti a kellemetlen meglepetéseket.",
        "Látja a fő különbségeket. Érdemes most megnézni, milyen összeggel és karenciával éri meg konkrétan kötni.",
        "Képben van! Ajánlatkérésnél nemcsak a díjat, hanem a karenciát és a kizárásokat is megmutatjuk.",
        "Szinte mindent tud. Jöhet az összehasonlítás: fedezetek, karencia, kizárások egy helyen.",
        "Kegyeleti biztosítási szakértő! Megmutatjuk, melyik biztosító ajánlata illik legjobban a helyzetéhez.",
      ],
    },
    megtakaritas: {
      questions: [
        {
          q: "A unit-linked biztosításnál a hozam mindig garantált.",
          a: false,
          e: "<strong>Tévhit.</strong> A megtakarítás értéke a választott eszközalapok teljesítményétől függ, ezért akár csökkenhet is. A garanciákat és a kockázati szintet szerződésenként kell ellenőrizni.",
        },
        {
          q: "A TKM segít összehasonlítani a megtakarítási jellegű életbiztosítások költségszintjét.",
          a: true,
          e: "<strong>Igaz.</strong> A Teljes Költségmutató azt mutatja meg, hogy a költségek várhatóan mennyivel csökkenthetik az elérhető hozamot, ezért ajánlatok összevetésénél fontos támpont.",
        },
        {
          q: "Nyugdíjbiztosításnál a befizetések 20%-a, legfeljebb évi 130 000 Ft adójóváírásként igényelhető, ha teljesülnek a feltételek.",
          a: true,
          e: "<strong>Igaz.</strong> A NAV tájékoztatása szerint nyugdíjbiztosítási szerződésnél a befizetések 20%-a, legfeljebb évi 130 000 Ft lehet a felső korlát. Több nyugdíjcélú megtakarításnál külön éves keret is számíthat.",
        },
        {
          q: "Ha idő előtt megszüntetem a szerződést, biztosan visszakapom az összes befizetést.",
          a: false,
          e: "<strong>Tévhit.</strong> A visszavásárlási érték az első években különösen alacsony lehet, és költségek, piaci mozgások vagy adózási következmények is érinthetik a kifizetést.",
        },
        {
          q: "A havi díj önmagában elég a döntéshez.",
          a: false,
          e: "<strong>Tévhit.</strong> A döntésnél a cél, időtáv, kockázatvállalás, költségszint, rugalmasság, likviditás és biztosítási szolgáltatás együtt számít.",
        },
      ],
      resultDescriptions: [
        "Semmi gond, ez pont az a terület, ahol a rövid kifejezések mögött sok feltétel van. Átnézzük, melyik konstrukció illik a céljához.",
        "Jó, hogy most tisztázzuk. Egy igényfelmérés után sokkal könnyebb különválasztani a valódi előnyt a hangzatos ígéretektől.",
        "Megvan az alap! A következő lépés a TKM, időtáv, kockázat és visszavásárlási feltételek egymás mellé tétele.",
        "Képben van! Ajánlatkérésnél már nem csak a havi díjat, hanem a teljes szerződés működését is érdemes nézni.",
        "Szinte mindent tud! Megnézzük, melyik megtakarítási biztosítás passzol a nyugdíj-, családi vagy tartalékképzési célhoz.",
        "Megtakarítási biztosítási szakértő! Jöhet az összehasonlítás: TKM, kockázat, időtáv, adójóváírás és rugalmasság egy helyen.",
      ],
    },
  };

  const resultEmoji = ["😟", "😕", "🤔", "😊", "🌟", "🏆"];
  const resultTitle = [
    "Érdemes utánanézni!",
    "Próbáljuk újra!",
    "Nem rossz!",
    "Szép eredmény!",
    "Majdnem tökéletes!",
    "Tökéletes!",
  ];

  function byId(id) {
    return document.getElementById(id);
  }

  function toggleFlipCard(card) {
    card.classList.toggle("flipped");
    card.setAttribute(
      "aria-pressed",
      card.classList.contains("flipped") ? "true" : "false"
    );
  }

  function initFlipCards() {
    document.querySelectorAll(".flip-card").forEach((card) => {
      card.addEventListener("click", () => toggleFlipCard(card));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleFlipCard(card);
        }
      });
    });
  }

  function setQuestionButtonState(key, enabled) {
    const trueButton = byId(`${key}BtnTrue`);
    const falseButton = byId(`${key}BtnFalse`);

    [trueButton, falseButton].forEach((button) => {
      if (button) {
        button.disabled = !enabled;
      }
    });
  }

  function initQuiz(key, config) {
    const total = config.questions.length;
    const elements = {
      questionPanel: byId(`${key}QPanel`),
      resultPanel: byId(`${key}RPanel`),
      questionText: byId(`${key}QTxt`),
      counter: byId(`${key}Ctr`),
      progress: byId(`${key}Prog`),
      points: byId(`${key}Pts`),
      feedback: byId(`${key}Fb`),
      nextWrap: byId(`${key}NxtWrap`),
      nextButton: byId(`${key}NxtBtn`),
      resultEmoji: byId(`${key}REmoji`),
      resultTitle: byId(`${key}RTitle`),
      resultDescription: byId(`${key}RDesc`),
    };

    if (
      !elements.questionPanel ||
      !elements.resultPanel ||
      !elements.questionText ||
      !elements.counter ||
      !elements.progress
    ) {
      return;
    }

    let questionIndex = 0;
    let points = 0;

    function renderQuestion() {
      const current = config.questions[questionIndex];
      elements.questionText.textContent = `${questionIndex + 1}. ${current.q}`;
      elements.counter.textContent = `${questionIndex + 1} / ${total}. kérdés`;
      elements.progress.style.width = `${((questionIndex + 1) / total) * 100}%`;
      elements.progress.setAttribute("aria-valuenow", String(questionIndex + 1));

      if (elements.feedback) {
        elements.feedback.hidden = true;
        elements.feedback.innerHTML = "";
      }

      if (elements.nextWrap) {
        elements.nextWrap.hidden = true;
      }

      setQuestionButtonState(key, true);

      if (elements.nextButton) {
        elements.nextButton.innerHTML =
          questionIndex === total - 1
            ? 'Eredmény <i class="fa fa-trophy ms-1"></i>'
            : 'Következő <i class="fa fa-arrow-right ms-1"></i>';
      }
    }

    function answerQuestion(value) {
      const current = config.questions[questionIndex];
      const isCorrect = value === current.a;

      if (isCorrect) {
        points += 1;
        if (elements.points) {
          elements.points.textContent = String(points);
        }
      }

      if (elements.feedback) {
        elements.feedback.className = `rounded-3 p-3 mb-3 small alert ${
          isCorrect ? "alert-success" : "alert-warning"
        }`;
        elements.feedback.innerHTML = `${
          isCorrect
            ? "<strong>&#10003; Helyes!</strong> "
            : "<strong>&#10007; Nem ez a helyes válasz.</strong> "
        }${current.e}`;
        elements.feedback.hidden = false;
      }

      setQuestionButtonState(key, false);

      if (elements.nextWrap) {
        elements.nextWrap.hidden = false;
      }
    }

    function showResult() {
      elements.questionPanel.hidden = true;
      elements.resultPanel.hidden = false;

      if (elements.resultEmoji) {
        elements.resultEmoji.textContent = resultEmoji[points];
      }
      if (elements.resultTitle) {
        elements.resultTitle.textContent = `${points} / ${total} pont - ${resultTitle[points]}`;
      }
      if (elements.resultDescription) {
        elements.resultDescription.textContent = config.resultDescriptions[points];
      }
    }

    function nextQuestion() {
      questionIndex += 1;
      if (questionIndex < total) {
        renderQuestion();
      } else {
        showResult();
      }
    }

    function restartQuiz() {
      questionIndex = 0;
      points = 0;
      if (elements.points) {
        elements.points.textContent = "0";
      }
      elements.resultPanel.hidden = true;
      elements.questionPanel.hidden = false;
      renderQuestion();
    }

    document
      .querySelectorAll(`[data-quiz="${key}"][data-quiz-answer]`)
      .forEach((button) => {
        button.addEventListener("click", () => {
          answerQuestion(button.dataset.quizAnswer === "true");
        });
      });

    document
      .querySelectorAll(`[data-quiz="${key}"][data-quiz-next]`)
      .forEach((button) => {
        button.addEventListener("click", nextQuestion);
      });

    document
      .querySelectorAll(`[data-quiz="${key}"][data-quiz-restart]`)
      .forEach((button) => {
        button.addEventListener("click", restartQuiz);
      });

    renderQuestion();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initFlipCards();
    Object.entries(quizData).forEach(([key, config]) => initQuiz(key, config));
  });
})();
