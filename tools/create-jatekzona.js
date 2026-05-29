"use strict";
/**
 * tools/create-jatekzona.js
 * Generates the Biztor Játékzóna hub + 6 game pages in clean URL structure.
 * Run: node tools/create-jatekzona.js
 *
 * FIGYELEM: Ez a script csak akkor futtatandó, ha teljesen új játékoldalakat
 * kell létrehozni. A jelenlegi játékoldalak (bullshit-fordito/, biztositas-tinder/,
 * stb.) már kész, működő tartalmat tartalmaznak – ezt a scriptet nem szabad
 * rajtuk futtatni, mert felülírná a valós game-logikát placeholder tartalommal.
 *
 * Végleges URL-struktúra:
 *   /jatekzona/
 *   /bullshit-fordito/
 *   /biztositas-tinder/
 *   /biztositasi-horoszkop/
 *   /biztositasi-kartyahuzas/
 *   /kotvenymuzeum/
 *   /papirdaralo/
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const GAMES = [
  {
    slug: "bullshit-fordito",
    title: "Biztosítási Bullshit Fordító",
    description:
      "Megérthetetlen biztosítási szöveget kaptál? Másold be, és lefordítjuk emberi nyelvre – ironikusan, de pontosan.",
    h1: "Biztosítási Bullshit Fordító",
    intro:
      "Bedobod a zsargont, mi visszaadjuk érthetően. A biztosítási szakszövegek fordítója – humorral fűszerezve.",
    icon: "🗣️",
  },
  {
    slug: "biztositas-tinder",
    title: "Biztosítás Tinder – Swipe a megfelelő fedezetre",
    description:
      "Swipelj igent vagy nemet a biztosítási szituációkra, és megmutatjuk, milyen biztosítás illik hozzád igazán.",
    h1: "Biztosítás Tinder",
    intro:
      "Bal vagy jobb? Swipeld végig a helyzeteket, és kiderül, milyen biztosítási profil vagy valójában.",
    icon: "❤️",
  },
  {
    slug: "biztositasi-horoszkop",
    title: "Biztosítási Horoszkóp – Milyen biztosítás illik a csillagjegyedhez?",
    description:
      "Add meg a csillagjegyed, és megmondjuk, milyen biztosítási kockázati profil vagy – és mire figyelj.",
    h1: "Biztosítási Horoszkóp",
    intro:
      "A csillagok megmondják, milyen biztosítás véd meg igazán. Kattints a csillagjegyedre!",
    icon: "⭐",
  },
  {
    slug: "biztositasi-kartyahuzas",
    title: "Biztosítási Kártyahúzás – Húzz egy kártyát és kiderül, mi vár rád",
    description:
      "Húzz egy kártyát és kiderül, milyen biztosítási szituáció vár rád – és hogyan kerülheted el.",
    h1: "Biztosítási Kártyahúzás",
    intro:
      "Szerencse? Meglátjuk. Húzz egy lapot, és kiderül, mit hoz a sors – és hogyan védekezhetsz ellene.",
    icon: "🃏",
  },
  {
    slug: "kotvenymuzeum",
    title: "Kötvénymúzeum – A biztosítás legfurcsább pillanatai",
    description:
      "Valódi (és kitalált) furcsaság-kötvények, abszurd biztosítási esetek és kuriózumok gyűjteménye.",
    h1: "Kötvénymúzeum",
    intro:
      "Üdvözöl a biztosítás világ legelvetemültebb gyűjteménye. Valódi kuriózumok, legendás kötvények.",
    icon: "🏛️",
  },
  {
    slug: "papirdaralo",
    title: "Papírdaráló – Dobd be a régi kötvényed",
    description:
      "Írd be a régi kötvényed legfontosabb adatait, és megmutatjuk, miben veszíthetsz – és mit nyerhetsz egy váltással.",
    h1: "Papírdaráló",
    intro:
      "Húzd be a régi biztosításod adatait. Mi megdaráljuk, és megmutatjuk, mit rejt valójában.",
    icon: "📄",
  },
];

const JATEKZONA = {
  slug: "jatekzona",
  title: "Biztor Játékzóna – Biztosítási játékok és kvízek",
  description:
    "Fedezd fel a Biztor Játékzónát: szórakoztató biztosítási kvízek, játékok és interaktív eszközök, amelyek segítenek megérteni a biztosítások világát.",
  h1: "Biztor Játékzóna",
  intro:
    "Egy hely, ahol a biztosítás nem unalmas. Játssz, fedezz fel, és közben megtanulod, ami valóban számít.",
};

function head(slug, title, description, canonical, breadcrumbName) {
  return `<!DOCTYPE html>
<html lang="hu">
  <head>
    <meta charset="utf-8" />
    <title>${title} | Biztor Alkusz Kft.</title>
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <meta name="description" content="${description}" />
    <link rel="canonical" href="https://biztor.hu/${slug}/" />
    <meta property="og:title" content="${title} | Biztor Alkusz Kft." />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="https://biztor.hu/${slug}/" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Biztor Alkusz Kft." />
    <meta name="twitter:card" content="summary_large_image" />
    <meta property="og:image" content="https://biztor.hu/img/biztor/biztorfront.jpg" />
    <meta property="og:image:alt" content="${title}" />
    <meta property="og:locale" content="hu_HU" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
    <meta name="author" content="Biztor Alkusz Kft." />
    <link rel="alternate" hreflang="hu" href="https://biztor.hu/${slug}/" />
    <link rel="alternate" hreflang="x-default" href="https://biztor.hu/${slug}/" />
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Kezdőlap", "item": "https://biztor.hu/" },
            { "@type": "ListItem", "position": 2, "name": "Játékzóna", "item": "https://biztor.hu/jatekzona/" }${breadcrumbName ? `,
            { "@type": "ListItem", "position": 3, "name": "${breadcrumbName}", "item": "https://biztor.hu/${slug}/" }` : ""}
          ]
        },
        {
          "@type": "WebPage",
          "url": "https://biztor.hu/${slug}/",
          "name": "${title}",
          "description": "${description}",
          "inLanguage": "hu-HU",
          "isPartOf": { "@type": "WebSite", "url": "https://biztor.hu/" },
          "publisher": { "@type": "Organization", "name": "Biztor Alkusz Kft.", "url": "https://biztor.hu/" }
        }
      ]
    }
    </script>

    <!-- Favicon -->
    <link href="/img/icon/favicon.ico" rel="icon" />
    <link rel="apple-touch-icon" sizes="180x180" href="/img/icon/favicon.ico" />
    <meta name="theme-color" content="#FFA726" />

    <link rel="stylesheet" href="/css/fonts.css" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css" rel="stylesheet" />
    <link rel="preload" href="/lib/animate/animate.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
    <noscript><link rel="stylesheet" href="/lib/animate/animate.min.css" /></noscript>
    <link rel="preload" href="/css/bootstrap.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
    <noscript><link rel="stylesheet" href="/css/bootstrap.min.css" /></noscript>
    <link rel="preload" href="/css/style.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
    <noscript><link rel="stylesheet" href="/css/style.css" /></noscript>
  </head>`;
}

function navbar() {
  return `
  <body>
    <a href="#fo-tartalom" class="visually-hidden-focusable">Ugrás a tartalomra</a>

    <!-- Spinner Start -->
    <div id="spinner" class="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center">
      <div class="spinner-grow text-primary" role="status"></div>
    </div>
    <!-- Spinner End -->

    <!-- Topbar Start -->
    <div class="container-fluid bg-warning bg-opacity-75 text-dark py-1 px-3 d-none d-lg-block">
      <div class="row gx-0 align-items-center">
        <div class="col d-flex align-items-center gap-3">
          <small class="d-flex align-items-center small fw-light">
            <i class="fa fa-phone-alt me-1"></i>
            <a href="tel:+36706258201" class="phone-link">+36 70 625 8201</a>
          </small>
          <small class="d-flex align-items-center small fw-light">
            <i class="far fa-envelope-open me-1"></i>
            <a href="mailto:iroda@biztor.hu" class="phone-link">iroda@biztor.hu</a>
          </small>
          <small class="d-flex align-items-center small fw-light">
            <i class="far fa-clock me-1"></i>
            H: 09:00–16:00, K-P: 8:00–16:00, Szo-V: Zárva
          </small>
        </div>
        <div class="col-auto d-flex align-items-center">
          <a href="https://www.facebook.com/biztoralkusz?locale=hu_HU" class="text-dark ms-3 small fw-light"><i class="fab fa-facebook-f"></i></a>
          <a href="https://www.instagram.com/biztor_alkusz/" class="text-dark ms-3 small fw-light"><i class="fab fa-instagram"></i></a>
        </div>
      </div>
    </div>
    <!-- Topbar End -->

    <!-- Navbar Start -->
    <div class="insure-navbar sticky-top">
      <div class="insure-navbar-container d-flex align-items-center justify-content-between">
        <a href="/" class="insure-navbar-brand d-flex align-items-center">
          <img src="/img/icon/biztorlogo.png" alt="Biztor Alkusz Kft. logó" class="insure-logo" decoding="async">
        </a>
        <button class="insure-navbar-toggler navbar-toggler d-lg-none" type="button" data-bs-toggle="collapse" data-bs-target="#insureNavbarCollapse" aria-controls="insureNavbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <ul class="insure-icon-menu d-none d-lg-flex">
          <li class="insure-menu-item">
            <span class="icon"><ion-icon name="home-outline"></ion-icon></span><a class="title" href="/">Kezdőlap</a>
          </li>
          <li class="insure-menu-item">
            <span class="icon"><ion-icon name="information-circle-outline"></ion-icon></span><a class="title" href="/rolunk/">Rólunk</a>
          </li>
          <li class="insure-menu-item">
            <span class="icon"><ion-icon name="briefcase-outline"></ion-icon></span><a class="title" href="/szolgaltatasok/">Biztosítások</a>
          </li>
          <li class="insure-menu-item">
            <span class="icon"><ion-icon name="mail-outline"></ion-icon></span><a class="title" href="/kapcsolat/">Kapcsolat</a>
          </li>
          <li class="insure-menu-item">
            <span class="icon"><ion-icon name="book-outline"></ion-icon></span><a class="title" href="/infok/">Infók</a>
          </li>
        </ul>
      </div>
      <div class="collapse insure-navbar-collapse" id="insureNavbarCollapse">
        <ul class="insure-mobile-menu navbar-nav mx-auto rounded pe-4 py-3">
          <li class="nav-item"><a href="/" class="nav-link">Kezdőlap</a></li>
          <li class="nav-item"><a href="/rolunk/" class="nav-link">Rólunk</a></li>
          <li class="nav-item"><a href="/szolgaltatasok/" class="nav-link">Biztosítások</a></li>
          <li class="nav-item"><a href="/kapcsolat/" class="nav-link">Kapcsolat</a></li>
          <li class="nav-item"><a href="/infok/" class="nav-link">Infók</a></li>
        </ul>
      </div>
    </div>
    <!-- Navbar End -->`;
}

function footer() {
  return `
    <!-- Footer Start -->
    <div class="container-fluid bg-dark text-light footer py-5 mt-5 wow fadeIn" data-wow-delay="0.1s">
      <div class="container py-5">
        <div class="row g-5">
          <div class="col-lg-3 col-md-6">
            <h5 class="text-light mb-4">Biztor Alkusz Kft.</h5>
            <p class="mb-2 small">Független biztosítási alkuszként segítünk megtalálni a legjobb ajánlatot – díjmentesen.</p>
            <div class="d-flex pt-2 gap-2">
              <a class="btn btn-outline-light btn-social" href="https://www.facebook.com/biztoralkusz?locale=hu_HU" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
              <a class="btn btn-outline-light btn-social" href="https://www.instagram.com/biztor_alkusz/" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
              <a class="btn btn-outline-light btn-social" href="https://linkedin.com/company/biztor-alkusz-kft" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <h5 class="text-light mb-4">Elérhetőség</h5>
            <p><i class="fa fa-map-marker-alt me-3"></i>4400 Nyíregyháza Liliom utca 27/A.</p>
            <p><i class="fa fa-phone-alt me-3"></i><a href="tel:+36706258201" class="text-light phone-link">+36 70 625 8201</a></p>
            <p><i class="fa fa-envelope me-3"></i><a href="mailto:iroda@biztor.hu" class="text-light phone-link">iroda@biztor.hu</a></p>
          </div>
          <div class="col-lg-3 col-md-6">
            <h5 class="text-light mb-4">Gyors linkek</h5>
            <a class="btn btn-link" href="/rolunk/">Rólunk</a>
            <a class="btn btn-link" href="/kapcsolat/">Kapcsolat</a>
            <a class="btn btn-link" href="/szolgaltatasok/">Szolgáltatásaink</a>
            <a class="btn btn-link" href="/impresszum/">Impresszum</a>
            <a class="btn btn-link" href="/Adatkezelesi_szabalyzat_biztor_alkusz.pdf">Adatkezelési szabályzat</a>
            <a class="btn btn-link" href="/Adatkezelesi_tajekoztato_biztor_alkusz.pdf">Adatkezelési tájékoztató</a>
            <a class="btn btn-link" href="/panaszkezeles/">Panaszkezelés</a>
            <a class="btn btn-link" href="/oldalterkep/">Oldaltérkép</a>
          </div>
          <div class="col-lg-3 col-md-6">
            <h5 class="text-light mb-4">Dokumentumok</h5>
            <a class="btn btn-link" href="/fentarthatosagi_kovetelmenyek.pdf">A fenntarthatósági követelmények figyelembevételéről szóló, szerződéskötést megelőző tájékoztatás</a>
            <a class="btn btn-link" href="/torveny-2023/">2023. évi XXV. törvény</a>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="copyright">
          <div class="row">
            <div class="col-md-6 text-center text-md-start mb-3 mb-md-0">
              &copy; <a class="border-bottom" href="/">Biztor Alkusz Kft.</a>, Minden jog fenntartva.
            </div>
            <div class="col-md-6 text-center text-md-end">
              <small>Független biztosítási alkusz | MNB engedélyszám: <a class="border-bottom text-light" href="https://feor.mnb.hu/wps/portal/feor/fooldal/lekerdezesek/kozvetitokeresooldal" target="_blank" rel="noopener">I-ÜF/2008/00171/01</a></small>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Footer End -->

    <!-- Scripts -->
    <script src="/lib/wow/wow.min.js"></script>
    <script src="/lib/easing/easing.min.js"></script>
    <script src="/lib/waypoints/waypoints.min.js"></script>
    <script src="/lib/owlcarousel/owl.carousel.min.js"></script>
    <script src="/lib/counterup/counterup.min.js"></script>
    <script src="/js/bootstrap.bundle.min.js"></script>
    <script src="/js/main.js"></script>
    <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
    <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
  </body>
</html>`;
}

function ctaSection(backToHub = true) {
  return `
    <!-- CTA Section -->
    <div class="container-xxl py-5">
      <div class="container">
        <div class="row g-4 justify-content-center text-center">
          <div class="col-12">
            <h2 class="mb-3">Kérsz személyes segítséget?</h2>
            <p class="mb-4">Játék után, ha valódi kérdésed van – itt vagyunk.</p>
            <div class="d-flex gap-3 justify-content-center flex-wrap">
              <a href="/kapcsolat/" class="btn btn-warning btn-lg rounded-pill px-4">Kapcsolat</a>
              <a href="/kotelezo-biztositas-ajanlatkeres/" class="btn btn-outline-warning btn-lg rounded-pill px-4">Ajánlatot kérek</a>
              ${backToHub ? '<a href="/jatekzona/" class="btn btn-outline-secondary btn-lg rounded-pill px-4">Vissza a Játékzónába</a>' : ""}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

// ── Játékzóna hub ───────────────────────────────────────────────────────────
function buildJatekzona() {
  const gameCards = GAMES.map(
    (g) => `
          <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
            <div class="card h-100 border-0 shadow-sm rounded-4 text-center p-4">
              <div class="display-4 mb-3">${g.icon}</div>
              <h3 class="h5 mb-2">${g.h1}</h3>
              <p class="text-muted small mb-4">${g.intro}</p>
              <a href="/${g.slug}/" class="btn btn-warning rounded-pill px-4 mt-auto">Játék indítása</a>
            </div>
          </div>`
  ).join("\n");

  return `${head(JATEKZONA.slug, JATEKZONA.title, JATEKZONA.description, JATEKZONA.slug, null)}
${navbar()}

    <!-- Hero Start -->
    <div id="fo-tartalom" class="container-xxl py-5">
      <div class="container">
        <div class="text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style="max-width:680px">
          <h1 class="display-5 mb-3">${JATEKZONA.h1}</h1>
          <p class="lead text-muted">${JATEKZONA.intro}</p>
        </div>
        <div class="row g-4">
          ${gameCards}
        </div>
      </div>
    </div>
    <!-- Hero End -->
${ctaSection(false)}
${footer()}`;
}

// ── Game page ───────────────────────────────────────────────────────────────
function buildGame(game) {
  return `${head(game.slug, game.title, game.description, game.slug, game.h1)}
${navbar()}

    <!-- Game Hero Start -->
    <div id="fo-tartalom" class="container-xxl py-5">
      <div class="container">
        <div class="text-center mx-auto mb-4 wow fadeInUp" data-wow-delay="0.1s" style="max-width:680px">
          <div class="display-3 mb-3">${game.icon}</div>
          <h1 class="display-5 mb-3">${game.h1}</h1>
          <p class="lead text-muted">${game.intro}</p>
        </div>

        <!-- Game Placeholder -->
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="card border-0 shadow rounded-4 p-5 text-center bg-light">
              <div class="display-1 mb-3">${game.icon}</div>
              <h2 class="h4 mb-3">A játék hamarosan elérhető</h2>
              <p class="text-muted mb-4">Ez a játék fejlesztés alatt áll. Nézz vissza hamarosan – vagy fedezd fel a többi Biztor játékot!</p>
              <a href="/jatekzona/" class="btn btn-warning rounded-pill px-4">Vissza a Játékzónába</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Game Hero End -->
${ctaSection(true)}
${footer()}`;
}

// ── Write files ──────────────────────────────────────────────────────────────
function writeFile(slug, html) {
  const dir = path.join(ROOT, slug);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, "index.html");
  fs.writeFileSync(filePath, html, "utf8");
  console.log(`  Created: ${slug}/index.html`);
}

// ── Update routes.json ───────────────────────────────────────────────────────
function updateRoutes() {
  const routesPath = path.join(ROOT, "src", "routes.json");
  const config = JSON.parse(fs.readFileSync(routesPath, "utf8"));

  const newSlugs = [JATEKZONA.slug, ...GAMES.map((g) => g.slug)];
  const existingSlugs = new Set(config.routes.map((r) => r.path.replace(/^\//, "")));

  const toAdd = newSlugs.filter((s) => !existingSlugs.has(s));
  for (const slug of toAdd) {
    // Insert before the 404 route
    const idx404 = config.routes.findIndex((r) => r.path === "/404");
    const entry = { source: `${slug}/index.html`, path: `/${slug}` };
    if (idx404 >= 0) config.routes.splice(idx404, 0, entry);
    else config.routes.push(entry);
    console.log(`  routes.json: added /${slug}`);
  }

  fs.writeFileSync(routesPath, JSON.stringify(config, null, 2) + "\n", "utf8");
}

// ── Update _redirects ────────────────────────────────────────────────────────
function updateRedirects() {
  const redirectsPath = path.join(ROOT, "_redirects");
  let content = fs.existsSync(redirectsPath) ? fs.readFileSync(redirectsPath, "utf8") : "";

  const newRules = [
    "# Játékzóna legacy .html redirects",
    "/jatekzona.html  /jatekzona/  301",
    "/bullshit-fordito.html  /bullshit-fordito/  301",
    "/biztositas-tinder.html  /biztositas-tinder/  301",
    "/biztositasi-horoszkop.html  /biztositasi-horoszkop/  301",
    "/biztositasi-kartyahuzas.html  /biztositasi-kartyahuzas/  301",
    "/kotvenymuzeum.html  /kotvenymuzeum/  301",
    "/papirdaralo.html  /papirdaralo/  301",
    "",
  ].join("\n");

  if (!content.includes("/jatekzona.html")) {
    content = newRules + "\n" + content;
    fs.writeFileSync(redirectsPath, content, "utf8");
    console.log("  _redirects: added Játékzóna legacy rules");
  } else {
    console.log("  _redirects: rules already present, skipped");
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
console.log("Creating Játékzóna pages...");
writeFile(JATEKZONA.slug, buildJatekzona());
for (const game of GAMES) {
  writeFile(game.slug, buildGame(game));
}

console.log("\nUpdating routes.json...");
updateRoutes();

console.log("\nUpdating _redirects...");
updateRedirects();

console.log("\nDone! Created 7 pages:");
console.log("  /jatekzona/");
for (const g of GAMES) console.log(`  /${g.slug}/`);
