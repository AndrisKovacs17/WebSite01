$ErrorActionPreference = 'Stop'

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Write-Utf8NoBom {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content
    )

    $directory = Split-Path -Parent $Path
    if ($directory) {
        New-Item -ItemType Directory -Force -Path $directory | Out-Null
    }

    [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Html {
    param([AllowNull()][string]$Text)
    if ($null -eq $Text) {
        return ''
    }

    return [System.Net.WebUtility]::HtmlEncode($Text)
}

function Render-List {
    param(
        [string[]]$Items,
        [string]$Indent = '              ',
        [string]$ClassName = 'info-highlight-list list-unstyled mb-0'
    )

    $lines = @()
    $lines += "$Indent<ul class=""$ClassName"">"
    foreach ($item in $Items) {
        $lines += "$Indent  <li>$(Html $item)</li>"
    }
    $lines += "$Indent</ul>"
    return ($lines -join "`n")
}

function Render-BulletList {
    param(
        [string[]]$Items,
        [string]$Indent = '                '
    )

    $lines = @()
    $lines += "$Indent<ul class=""list-unstyled mb-0"">"
    foreach ($item in $Items) {
        $lines += "$Indent  <li class=""mb-3""><i class=""fa fa-check text-primary me-2""></i>$(Html $item)</li>"
    }
    $lines += "$Indent</ul>"
    return ($lines -join "`n")
}

function Get-TopbarHtml {
    return @"
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
            H: 09:00-16:00, K-P: 8:00-16:00, Szo-V: Zárva
          </small>
        </div>
        <div class="col-auto d-flex align-items-center">
          <a href="https://www.facebook.com/biztoralkusz?locale=hu_HU" class="text-dark ms-3 small fw-light"><i class="fab fa-facebook-f"></i></a>
          <a href="https://www.instagram.com/biztor_alkusz/" class="text-dark ms-3 small fw-light"><i class="fab fa-instagram"></i></a>
        </div>
      </div>
    </div>
"@
}

function Get-NavbarHtml {
    param(
        [string]$AssetPrefix,
        [string]$SitePrefix
    )

    return @"
    <div class="insure-navbar sticky-top">
      <div class="insure-navbar-container d-flex align-items-center justify-content-between">
        <a href="$AssetPrefix/index.html" class="insure-navbar-brand d-flex align-items-center">
          <img src="$AssetPrefix/img/icon/biztorlogo.png" alt="Biztor Alkusz logó" class="insure-logo" decoding="async">
        </a>

        <button
          class="insure-navbar-toggler navbar-toggler d-lg-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#insureNavbarCollapse"
          aria-controls="insureNavbarCollapse"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <ul class="insure-icon-menu d-none d-lg-flex">
          <li class="insure-menu-item">
            <span class="icon"><ion-icon name="home-outline"></ion-icon></span><a class="title" href="$AssetPrefix/index.html">Kezdőlap</a>
          </li>
          <li class="insure-menu-item">
            <span class="icon"><ion-icon name="information-circle-outline"></ion-icon></span><a class="title" href="$SitePrefix/rolunk.html">Rólunk</a>
          </li>
          <li class="insure-menu-item">
            <span class="icon"><ion-icon name="briefcase-outline"></ion-icon></span><a class="title" href="$SitePrefix/szolgaltatasok.html">Biztosítások</a>
          </li>
          <li class="insure-menu-item">
            <span class="icon"><ion-icon name="mail-outline"></ion-icon></span><a class="title" href="$SitePrefix/kapcsolat.html">Kapcsolat</a>
          </li>
          <li class="insure-menu-item">
            <span class="icon"><ion-icon name="book-outline"></ion-icon></span><a class="title" href="$SitePrefix/infok.html">Infók</a>
          </li>
        </ul>
      </div>

      <div class="collapse insure-navbar-collapse" id="insureNavbarCollapse">
        <ul class="insure-mobile-menu navbar-nav mx-auto rounded pe-4 py-3">
          <li class="nav-item"><a href="$AssetPrefix/index.html" class="nav-link">Kezdőlap</a></li>
          <li class="nav-item"><a href="$SitePrefix/rolunk.html" class="nav-link">Rólunk</a></li>
          <li class="nav-item"><a href="$SitePrefix/szolgaltatasok.html" class="nav-link">Biztosítások</a></li>
          <li class="nav-item"><a href="$SitePrefix/kapcsolat.html" class="nav-link">Kapcsolat</a></li>
          <li class="nav-item"><a href="$SitePrefix/infok.html" class="nav-link">Infók</a></li>
        </ul>
      </div>
    </div>

    <script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
    <script nomodule src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"></script>
"@
}

function Get-FooterHtml {
    param(
        [string]$AssetPrefix,
        [string]$SitePrefix
    )

    return @"
    <div class="container-fluid bg-dark footer mt-5 pt-5 wow fadeIn" data-wow-delay="0.1s">
      <div class="container py-5">
        <div class="row g-5">
          <div class="col-lg-3 col-md-6">
            <h2 class="text-white mb-4">
              <img class="img-fluid me-3" src="$AssetPrefix/img/icon/biztorlogo.png" alt="Biztor Alkusz Kft. logó" decoding="async">
            </h2>
            <p>
              BIZTOR Alkusz Kft.<br />
              4400 Nyíregyháza Liliom utca 27/A.<br />
              MNB engedélyszám: 208080710804
            </p>
            <div class="d-flex pt-2">
              <a class="btn btn-square me-1 phone-link" href="mailto:iroda@biztor.hu">
                <i class="fas fa-envelope"></i>
              </a>
              <a class="btn btn-square me-1" href="https://www.facebook.com/biztoralkusz?locale=hu_HU">
                <i class="fab fa-facebook-f"></i>
              </a>
              <a class="btn btn-square me-1 phone-link" href="tel:+36425952480">
                <i class="fas fa-phone-alt"></i>
              </a>
              <a class="btn btn-square me-0" href="https://linkedin.com/company/biztor-alkusz-kft">
                <i class="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <h5 class="text-light mb-4">Elérhetőség</h5>
            <p>
              <i class="fa fa-map-marker-alt me-3"></i>4400 Nyíregyháza Liliom utca 27/A.
            </p>
            <p>
              <i class="fa fa-phone-alt me-3"></i>
              <a href="tel:+36425952480" class="text-light phone-link">+36 42 / 595 - 248</a>
            </p>
            <p>
              <i class="fa fa-envelope me-3"></i>
              <a href="mailto:iroda@biztor.hu" class="text-light phone-link">iroda@biztor.hu</a>
            </p>
          </div>
          <div class="col-lg-3 col-md-6">
            <h5 class="text-light mb-4">Gyors linkek</h5>
            <a class="btn btn-link" href="$SitePrefix/rolunk.html">Rólunk</a>
            <a class="btn btn-link" href="$SitePrefix/kapcsolat.html">Kapcsolat</a>
            <a class="btn btn-link" href="$SitePrefix/szolgaltatasok.html">Szolgáltatásaink</a>
            <a class="btn btn-link" href="$SitePrefix/impresszum.html">Impresszum</a>
            <a class="btn btn-link" href="${AssetPrefix}/Adatkezelesi_szabalyzat_biztor_alkusz.pdf">Adatkezelési szabályzat</a>
            <a class="btn btn-link" href="${AssetPrefix}/Adatkezelesi_tajekoztato_biztor_alkusz.pdf">Adatkezelési tájékoztató</a>
            <a class="btn btn-link" href="$SitePrefix/panasz.html">Panaszkezelés</a>
          </div>
          <div class="col-lg-3 col-md-6">
            <h5 class="text-light mb-4">Dokumentumok</h5>
            <a class="btn btn-link" href="${AssetPrefix}/fentarthatosagi_kovetelmenyek.pdf">A fenntarthatósági követelmények figyelembevételéről szóló, szerződéskötést megelőző tájékoztatás</a>
            <a class="btn btn-link" href="$SitePrefix/torveny2023.html">2023. évi XXV. törvény</a>
          </div>
        </div>
      </div>
      <div class="container-fluid copyright">
        <div class="container">
          <div class="row">
            <div class="col-md-12 text-center mb-3 mb-md-0">&copy; <a href="/">BIZTOR Alkusz Kft.</a>, Minden jog fenntartva.</div>
          </div>
        </div>
      </div>
    </div>
"@
}

function Get-ScriptsHtml {
    param([string]$AssetPrefix)

    return @"
    <button type="button" class="btn btn-lg btn-primary btn-lg-square back-to-top"><i class="bi bi-arrow-up"></i></button>

    <script defer src="https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.js"></script>
    <script defer src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"></script>
    <script defer src="$AssetPrefix/lib/wow/wow.min.js"></script>
    <script defer src="$AssetPrefix/lib/easing/easing.min.js"></script>
    <script defer src="$AssetPrefix/js/main.js"></script>
"@
}

function Get-HeadHtml {
    param(
        [string]$Title,
        [string]$Description,
        [string]$CanonicalUrl,
        [string]$AssetPrefix
    )

    $encodedTitle = Html $Title
    $encodedDescription = Html $Description

    return @"
  <head>
    <meta charset="utf-8" />
    <title>$encodedTitle</title>
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <meta name="description" content="$encodedDescription" />
    <meta name="keywords" content="biztosítási kisokos, biztosítási tanácsok, kárbejelentés, Biztor" />
    <link rel="canonical" href="$CanonicalUrl" />
    <meta property="og:title" content="$encodedTitle" />
    <meta property="og:description" content="$encodedDescription" />
    <meta property="og:url" content="$CanonicalUrl" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Biztor Alkusz Kft." />
    <meta name="twitter:card" content="summary_large_image" />

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.css" />
    <link href="$AssetPrefix/img/icon/favicon.ico" rel="icon" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&family=Poppins:wght@600;700&display=swap" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css" rel="stylesheet" />

    <link rel="preload" href="$AssetPrefix/lib/animate/animate.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
    <noscript><link href="$AssetPrefix/lib/animate/animate.min.css" rel="stylesheet" /></noscript>
    <link rel="preload" href="$AssetPrefix/css/bootstrap.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
    <noscript><link href="$AssetPrefix/css/bootstrap.min.css" rel="stylesheet" /></noscript>
    <link rel="preload" href="$AssetPrefix/css/style.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
    <noscript><link href="$AssetPrefix/css/style.css" rel="stylesheet" /></noscript>
  </head>
"@
}

function Render-CtaSection {
    param(
        [string]$Heading,
        [string]$Lead,
        [string]$PrimaryHref,
        [string]$PrimaryLabel,
        [string]$SecondaryHref,
        [string]$SecondaryLabel
    )

    return @"
        <div class="text-center cta-section py-4 py-md-5 wow fadeInUp" data-wow-delay="0.7s">
          <div class="container">
            <h3 class="mb-3 mb-md-4 px-3">
              $(Html $Heading)
            </h3>
            <div class="row justify-content-center">
              <div class="col-12 col-md-10 col-lg-8">
                <p class="lead mb-4 px-3">
                  $(Html $Lead)
                </p>
                <div class="d-flex flex-column flex-md-row justify-content-center gap-3 px-3">
                  <a href="$PrimaryHref" class="btn btn-primary btn-lg rounded-pill py-2 py-md-3 px-4 px-md-5 w-100 w-md-auto">
                    <i class="fa fa-file-text me-2"></i>$(Html $PrimaryLabel)
                  </a>
                  <a href="$SecondaryHref" class="btn btn-lg rounded-pill hover-lift py-2 py-md-3 px-4 px-md-5 w-100 w-md-auto">
                    <i class="fa fa-envelope me-2"></i>$(Html $SecondaryLabel)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
"@
}

function Render-CategoryCards {
    param(
        [object[]]$Topics,
        [string]$CardHrefPrefix
    )

    $delay = 0.1
    $blocks = foreach ($topic in $Topics) {
        $currentDelay = [string]::Format([System.Globalization.CultureInfo]::InvariantCulture, '{0:0.0}', $delay)
        $delay += 0.1
@"
          <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="${currentDelay}s">
            <div class="service-item rounded h-100 p-5">
              <div class="d-flex align-items-center ms-n5 mb-4">
                <div class="service-icon flex-shrink-0 bg-primary rounded-end me-4">
                  <i class="$($topic.Icon) text-white"></i>
                </div>
                <h3 class="h4 mb-0">$(Html $topic.Title)</h3>
              </div>
              <p class="mb-4">$(Html $topic.Summary)</p>
              <a class="btn btn-light px-3" href="$CardHrefPrefix/$($topic.Slug).html">Tovább</a>
            </div>
          </div>
"@
    }

    return ($blocks -join "`n")
}

function Render-CategoryPage {
    param(
        [hashtable]$Category,
        [string]$OutputPath
    )

    $assetPrefix = '..'
    $sitePrefix = '.'
    $canonical = "https://biztor.hu/sites/$($Category.FileName)"
    $head = Get-HeadHtml -Title "$($Category.Title) | Biztor Infók" -Description $Category.MetaDescription -CanonicalUrl $canonical -AssetPrefix $assetPrefix
    $topbar = Get-TopbarHtml
    $navbar = Get-NavbarHtml -AssetPrefix $assetPrefix -SitePrefix $sitePrefix
    $footer = Get-FooterHtml -AssetPrefix $assetPrefix -SitePrefix $sitePrefix
    $scripts = Get-ScriptsHtml -AssetPrefix $assetPrefix
    $heroList = Render-List -Items $Category.HeroPoints
    $focusList = Render-List -Items $Category.FocusPoints
    $cards = Render-CategoryCards -Topics $Category.Topics -CardHrefPrefix './infok'
    $cta = Render-CtaSection -Heading 'Kérjen személyre szabott segítséget még ma!' -Lead 'Ha nem sablonválaszt keres, segítünk átnézni az Ön helyzetét és a valóban releváns biztosítási lehetőségeket.' -PrimaryHref './szolgaltatasok.html' -PrimaryLabel 'Biztosítások áttekintése' -SecondaryHref './kapcsolat.html' -SecondaryLabel 'Kapcsolat'

    $html = @"
<!DOCTYPE html>
<html lang="hu">
$head
  <body>
    <div id="spinner" class="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center">
      <div class="spinner-grow text-primary" role="status"></div>
    </div>

$topbar
$navbar

    <div class="container-xxl py-5">
      <div class="container">
        <div class="row g-5 align-items-center mb-5">
          <div class="col-lg-6 wow fadeInUp" data-wow-delay="0.1s">
            <h1 class="display-5 mb-4">$(Html $Category.Title)</h1>
            <p class="mb-4">$(Html $Category.IntroLead)</p>
$heroList
          </div>
          <div class="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
            <div class="position-relative rounded overflow-hidden h-100" style="min-height: 420px;">
              <img class="position-absolute w-100 h-100" src="$($Category.HeroImage)" alt="$(Html $Category.Title)" style="object-fit: cover;" loading="lazy" decoding="async">
            </div>
          </div>
        </div>

        <div class="row g-5 align-items-center flex-lg-row-reverse mb-5">
          <div class="col-lg-6 wow fadeInUp" data-wow-delay="0.1s">
            <h2 class="mb-3">$(Html $Category.FocusHeading)</h2>
            <p class="mb-4">$(Html $Category.FocusText)</p>
$focusList
          </div>
          <div class="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
            <div class="position-relative rounded overflow-hidden h-100" style="min-height: 360px;">
              <img class="position-absolute w-100 h-100" src="$($Category.FocusImage)" alt="$(Html $Category.FocusHeading)" style="object-fit: cover;" loading="lazy" decoding="async">
            </div>
          </div>
        </div>

        <div class="text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style="max-width: 760px;">
          <h2 class="mb-3">Részletes útmutatók</h2>
          <p>Válassza ki azt a témát, ahol jól jönne egy részletesebb, lépésről lépésre végigvezető magyarázat és ellenőrzőlista.</p>
        </div>

        <div class="row g-4">
$cards
        </div>

$cta
      </div>
    </div>

$footer
$scripts
  </body>
</html>
"@

    Write-Utf8NoBom -Path $OutputPath -Content $html
}

function Render-TopicPage {
    param(
        [hashtable]$Category,
        [hashtable]$Topic,
        [string]$OutputPath
    )

    $assetPrefix = '../..'
    $sitePrefix = '..'
    $canonical = "https://biztor.hu/sites/infok/$($Topic.Slug).html"
    $metaDescription = if ($Topic.MetaDescription) { $Topic.MetaDescription } else { $Topic.Summary }
    $head = Get-HeadHtml -Title "$($Topic.Title) | Biztor Infók" -Description $metaDescription -CanonicalUrl $canonical -AssetPrefix $assetPrefix
    $topbar = Get-TopbarHtml
    $navbar = Get-NavbarHtml -AssetPrefix $assetPrefix -SitePrefix $sitePrefix
    $footer = Get-FooterHtml -AssetPrefix $assetPrefix -SitePrefix $sitePrefix
    $scripts = Get-ScriptsHtml -AssetPrefix $assetPrefix
    $heroList = Render-List -Items $Topic.HeroPoints
    $focusList = Render-List -Items $Topic.FocusPoints
    $stepsList = Render-BulletList -Items $Topic.FirstSteps
    $mistakesList = Render-BulletList -Items $Topic.CommonMistakes
    $helpList = Render-BulletList -Items $Topic.WhenToAskHelp
    $cta = Render-CtaSection -Heading 'Jöhet a következő lépés is?' -Lead 'Ha szeretné, nemcsak az általános tudnivalókat, hanem az Ön konkrét helyzetét is végignézzük és segítünk a döntésben.' -PrimaryHref "$sitePrefix/szolgaltatasok.html" -PrimaryLabel 'Biztosítások áttekintése' -SecondaryHref "$sitePrefix/kapcsolat.html" -SecondaryLabel 'Kapcsolat'

    $html = @"
<!DOCTYPE html>
<html lang="hu">
$head
  <body>
    <div id="spinner" class="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center">
      <div class="spinner-grow text-primary" role="status"></div>
    </div>

$topbar
$navbar

    <div class="container-xxl py-5">
      <div class="container">
        <nav aria-label="breadcrumb" class="mb-4 wow fadeInUp" data-wow-delay="0.1s">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item"><a href="$sitePrefix/infok.html">Infók</a></li>
            <li class="breadcrumb-item"><a href="$sitePrefix/$($Category.FileName)">$(Html $Category.ShortTitle)</a></li>
            <li class="breadcrumb-item active" aria-current="page">$(Html $Topic.Title)</li>
          </ol>
        </nav>

        <div class="row g-5 align-items-center mb-5">
          <div class="col-lg-6 wow fadeInUp" data-wow-delay="0.1s">
            <h1 class="display-5 mb-4">$(Html $Topic.Title)</h1>
            <p class="mb-4">$(Html $Topic.Lead)</p>
$heroList
          </div>
          <div class="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
            <div class="position-relative rounded overflow-hidden h-100" style="min-height: 420px;">
              <img class="position-absolute w-100 h-100" src="$($Category.HeroImageDetail)" alt="$(Html $Topic.Title)" style="object-fit: cover;" loading="lazy" decoding="async">
            </div>
          </div>
        </div>

        <div class="row g-5 align-items-center flex-lg-row-reverse mb-5">
          <div class="col-lg-6 wow fadeInUp" data-wow-delay="0.1s">
            <h2 class="mb-3">$(Html $Topic.FocusHeading)</h2>
            <p class="mb-4">$(Html $Topic.FocusText)</p>
$focusList
          </div>
          <div class="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
            <div class="position-relative rounded overflow-hidden h-100" style="min-height: 360px;">
              <img class="position-absolute w-100 h-100" src="$($Category.FocusImageDetail)" alt="$(Html $Topic.FocusHeading)" style="object-fit: cover;" loading="lazy" decoding="async">
            </div>
          </div>
        </div>

        <div class="text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style="max-width: 720px;">
          <h2 class="mb-3">Gyakorlati lépések</h2>
          <p>Ezek a pontok abban segítenek, hogy a dokumentálás, a bejelentés és a biztosítóval való egyeztetés rendezettebb legyen.</p>
        </div>

        <div class="row g-4">
          <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
            <div class="service-item rounded h-100 p-5">
              <div class="d-flex align-items-center ms-n5 mb-4">
                <div class="service-icon flex-shrink-0 bg-primary rounded-end me-4">
                  <i class="fa fa-play-circle text-white"></i>
                </div>
                <h2 class="h4 mb-0">Első teendők</h2>
              </div>
$stepsList
            </div>
          </div>
          <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.2s">
            <div class="service-item rounded h-100 p-5">
              <div class="d-flex align-items-center ms-n5 mb-4">
                <div class="service-icon flex-shrink-0 bg-primary rounded-end me-4">
                  <i class="fa fa-exclamation-triangle text-white"></i>
                </div>
                <h2 class="h4 mb-0">Gyakori hibák</h2>
              </div>
$mistakesList
            </div>
          </div>
          <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.3s">
            <div class="service-item rounded h-100 p-5">
              <div class="d-flex align-items-center ms-n5 mb-4">
                <div class="service-icon flex-shrink-0 bg-primary rounded-end me-4">
                  <i class="fa fa-user-shield text-white"></i>
                </div>
                <h2 class="h4 mb-0">Mikor kérjen segítséget?</h2>
              </div>
$helpList
            </div>
          </div>
        </div>

$cta
      </div>
    </div>

$footer
$scripts
  </body>
</html>
"@

    Write-Utf8NoBom -Path $OutputPath -Content $html
}

function Get-Priority {
    param([string]$RelativePath)

    switch -Wildcard ($RelativePath) {
        'index.html' { return '1.0' }
        'adatkezeles.html' { return '0.7' }
        'sites/infok.html' { return '0.9' }
        'sites/kapcsolat.html' { return '0.9' }
        'sites/rolunk.html' { return '0.9' }
        'sites/szolgaltatasok.html' { return '0.9' }
        'sites/info-*.html' { return '0.8' }
        'sites/infok/*.html' { return '0.7' }
        'sites/ajanlatok/*.html' { return '0.6' }
        'sites/szakemberek/*.html' { return '0.6' }
        'sites/*.html' { return '0.8' }
        default { return '0.7' }
    }
}

function Build-Sitemap {
    param([string]$RootPath)

    $date = Get-Date -Format 'yyyy-MM-dd'
    $htmlFiles = Get-ChildItem -Path $RootPath -Recurse -Filter *.html |
        Where-Object {
            $_.FullName -notmatch '\\sites\\404\.html$'
        } |
        Sort-Object FullName

    $items = foreach ($file in $htmlFiles) {
        $relative = $file.FullName.Substring($RootPath.Length + 1).Replace('\', '/')
        $loc = if ($relative -eq 'index.html') {
            'https://biztor.hu/'
        } else {
            "https://biztor.hu/$relative"
        }
        $priority = Get-Priority -RelativePath $relative
@"
  <url>
    <loc>$loc</loc>
    <lastmod>$date</lastmod>
    <changefreq>monthly</changefreq>
    <priority>$priority</priority>
  </url>
"@
    }

    return @"
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
$($items -join "`n")
</urlset>
"@
}

$categories = @(
    @{
        FileName = "info-gepjarmu.html"
        Title = "Gépjármű speciális esetek"
        ShortTitle = "Gépjármű esetek"
        MetaDescription = "Részletes autós biztosítási kisokos: kátyúkár, vadelütés, bonus-malus, totálkár, üvegkár és külföldi káresemények gyakorlati útmutatóval."
        IntroLead = "Autós kárhelyzetekben sokszor percek alatt dől el, mennyire lesz később bizonyítható az esemény. Ezek az útmutatók abban segítenek, hogy a helyszínen és utána is jól dokumentáljon."
        HeroPoints = @(
            "Gyorsan felmérheti, milyen bizonyítékokra lesz szükség.",
            "Megmutatjuk, mikor útkezelő, biztosító vagy rendőr az első lépés.",
            "Segítünk elkerülni azokat a hibákat, amelyek vitás helyzethez vezetnek."
        )
        FocusHeading = "Miért fontos az autós károknál a sorrend?"
        FocusText = "Egy elrontott bejelentés, hiányzó fotó vagy rosszul kitöltött nyilatkozat később hetekkel lassíthatja az ügyet. A részletes témák ezért nem csak általános tanácsokat adnak, hanem gyakorlati kapaszkodókat is."
        FocusPoints = @(
            "A helyszíni fotó és az időpont sokszor többet ér, mint egy későbbi magyarázat.",
            "Nem minden kár ugyanabból a biztosításból térül.",
            "A javítás előtti dokumentálás alapvető, különösen vitás ügyeknél.",
            "Casco és KGFB ügyeknél eltérő lehet a bejelentési logika."
        )
        HeroImage = "./../img/ajanlatok/casco1.jpg"
        FocusImage = "./../img/ajanlatok/kgfb2.jpg"
        HeroImageDetail = "./../../img/ajanlatok/casco1.jpg"
        FocusImageDetail = "./../../img/ajanlatok/kgfb2.jpg"
        Topics = @(
            @{
                Slug = "katyukar-lepesrol-lepesre"
                Title = "Kátyúkár lépésről lépésre"
                Icon = "fa fa-road"
                Summary = "Fotózza le a sérülést, a helyszínt és az úthibát több szögből, rögzítsen tanút, majd jelezze az útkezelő felé. A gyors dokumentálás sokszor döntő a felelősség megállapításánál."
                Lead = "Kátyúkárnál a legnagyobb kérdés mindig az, hogy utólag mennyire lehet jól bizonyítani: valóban az adott úthiba okozta a sérülést, és az útkezelő időben tudott-e róla. Minél rendezettebb a dokumentáció, annál erősebb a kárigény."
                HeroPoints = @(
                    "Készítsen külön fotót az úthibáról, az autóról és a teljes helyszínről.",
                    "Jegyezze fel a pontos utcát, haladási irányt és időpontot.",
                    "Ha lehet, keressen tanút vagy kamerát, amely alátámasztja az eseményt."
                )
                FocusHeading = "Mire figyeljen a kárigényhez?"
                FocusText = "Az útkezelő általában azt vizsgálja, hogy egyértelmű-e az úthiba, a kár és a helyszín kapcsolata. Ezt a láncot kell már az első percekben megerősíteni."
                FocusPoints = @(
                    "Az útkezelő vagy önkormányzat felé minél előbb történjen meg a bejelentés.",
                    "Őrizze meg a javítási ajánlatot és a szerviz szakvéleményét.",
                    "Ne javíttasson mindent előzetes dokumentálás nélkül.",
                    "Casco esetén egyeztessen a biztosítóval a további lépésekről."
                )
                FirstSteps = @(
                    "Álljon meg biztonságosan, és mérje fel, vezethető-e még az autó.",
                    "Fotózza végig a sérüléseket és az úthibát több nézőpontból.",
                    "Jelentse a kárt az útkezelőnek és kérjen visszaigazolható csatornát."
                )
                CommonMistakes = @(
                    "Csak az autót fotózza le, de az úthibát nem.",
                    "Nem tudja később pontosan beazonosítani a helyszínt.",
                    "Előbb megjavíttatja az autót, és csak utána indul a bejelentés."
                )
                WhenToAskHelp = @(
                    "Ha az útkezelő vitatja a felelősséget.",
                    "Ha nagy összegű futómű- vagy keréksérülés keletkezett.",
                    "Ha nem egyértelmű, casco vagy útkezelői kárigény legyen az első irány."
                )
            }
            @{
                Slug = "vadelutes-kezelese"
                Title = "Vadelütés kezelése"
                Icon = "fa fa-paw"
                Summary = "Mindig hívjon rendőrt, ne mozdítsa a vadat, és kérjen jegyzőkönyvet. Casco esetén a biztosító kárfelvételéhez különösen fontos a pontos hely- és időadat."
                Lead = "Vadelütés után gyakran mindenki sietne tovább, pedig a helyszíni intézkedések hiánya később komoly gondot okozhat. Az elsődleges feladat a biztonság, utána pedig a hivatalos rögzítés."
                HeroPoints = @(
                    "Kapcsolja be a vészvillogót és biztosítsa a helyszínt.",
                    "Értesítse a rendőrséget, különösen személyi sérülés vagy jelentős kár esetén.",
                    "Ne mozdítsa el a vadat, amíg nincs hivatalos intézkedés."
                )
                FocusHeading = "Miért fontos a rendőri jegyzőkönyv?"
                FocusText = "A biztosító számára a rendőri dokumentáció sokszor kulcsfontosságú, mert ezzel válik hitelt érdemlően rögzíthetővé a káresemény körülménye."
                FocusPoints = @(
                    "A pontos helyszín és időpont minden további ügyintézés alapja.",
                    "Casco esetén az esemény valós megtörténtét segít alátámasztani.",
                    "Külföldön is törekedjen hivatalos jegyzőkönyvre vagy igazolásra.",
                    "A helyszíni fotók és féknyomok különösen hasznosak lehetnek."
                )
                FirstSteps = @(
                    "Gondoskodjon a forgalombiztonságról és az utasok épségéről.",
                    "Hívjon rendőrt, majd dokumentálja a jármű sérüléseit.",
                    "Jegyezze fel, volt-e tanú vagy más jármű a közelben."
                )
                CommonMistakes = @(
                    "A járművet vagy az állatot dokumentálás nélkül elmozdítják.",
                    "Elmarad a rendőrségi intézkedés vagy az írásos nyoma.",
                    "A bejelentésből kimaradnak a látási és útviszonyok."
                )
                WhenToAskHelp = @(
                    "Ha a biztosító hiánypótlást kér a körülményekről.",
                    "Ha a kár értéke jelentős, és nem világos a casco térítés köre.",
                    "Ha külföldön történt az eset és nyelvi segítség is kellhet."
                )
            }
            @{
                Slug = "bonus-malus-es-dijhatas"
                Title = "Bonus-malus és díjhatás"
                Icon = "fa fa-chart-line"
                Summary = "Önhibás káresemény után romolhat a fokozat, ami tartós díjemelkedést hozhat. Kisebb kárnál érdemes lehet saját forrásból rendezni, ha ez összességében kedvezőbb."
                Lead = "Sok autós csak a következő évfordulónál szembesül vele, hogy egy korábbi kár mennyire megdrágította a kötelező biztosítást. A bonus-malus rendszer lényege, hogy a kárelőzmény hosszabb távon is hat a díjra."
                HeroPoints = @(
                    "Nem csak az aktuális kárösszeg számít, hanem a későbbi díjhatás is.",
                    "Érdemes előre megnézni, mennyit ronthat egy önhibás ügy a fokozaton.",
                    "Kisebb károknál olykor gazdaságosabb lehet saját zsebből rendezni."
                )
                FocusHeading = "Mit érdemes mérlegelni?"
                FocusText = "A jó döntéshez nem elég azt nézni, hogy most mennyit fizetne a biztosító. A jövő évi díj, a fokozatromlás és a többletkiadás együtt ad valós képet."
                FocusPoints = @(
                    "Kérjen előzetes becslést a kár nagyságáról.",
                    "Nézze meg, mennyit jelentene a bonus visszaesése.",
                    "Ne feltételezze, hogy minden kisebb kár automatikusan megéri biztosítóra vinni.",
                    "Évforduló előtt különösen fontos az összehasonlítás."
                )
                FirstSteps = @(
                    "Kérje le vagy becsülje meg a javítás várható költségét.",
                    "Ellenőrizze az aktuális bonus-malus fokozatát.",
                    "Számolja össze, milyen díjhatás várható a következő időszakban."
                )
                CommonMistakes = @(
                    "Csak az aktuális kifizetésre figyel, a jövőbeni díjra nem.",
                    "Nem kér alternatív számítást saját rendezés esetére.",
                    "Összekeveri a casco és a KGFB díjhatását."
                )
                WhenToAskHelp = @(
                    "Ha bizonytalan, megéri-e bejelenteni a kárt.",
                    "Ha több autó vagy flotta díjhatását kell egyszerre átlátni.",
                    "Ha váltás előtt szeretné optimalizálni a következő szerződést."
                )
            }
            @{
                Slug = "rendszam-nelkuli-karokozas"
                Title = "Rendszám nélküli károkozás"
                Icon = "fa fa-car-crash"
                Summary = "Ha nincs meg a károkozó rendszáma, minden bizonyíték számít: kamera, tanú, helyszíni fotó. Bizonyos esetekben MABISZ eljárás vagy casco térítés jöhet szóba."
                Lead = "Parkolási vagy cserbenhagyásos eseteknél gyakori, hogy a károkozó kiléte ismeretlen marad. Ilyenkor a lehetőségek beszűkülnek, ezért különösen fontos a még elérhető bizonyítékok összegyűjtése."
                HeroPoints = @(
                    "Környékbeli kamera vagy üzletfelvétel sokat számíthat.",
                    "Tanúnyilatkozat nélkül nehezebb bizonyítani az eseményt.",
                    "Casco hiányában szűkebb lehet a reális kártérítési út."
                )
                FocusHeading = "Milyen út marad, ha nincs meg a károkozó?"
                FocusText = "A megoldás attól függ, hogy van-e casco, van-e sérült személy, és rendelkezésre áll-e bármilyen azonosításra alkalmas adat a károkozóról."
                FocusPoints = @(
                    "Kérdezze meg a környéken, van-e használható kameraanyag.",
                    "Jegyezzen fel minden részletet, még ha rendszám nincs is meg.",
                    "Bizonyos ügyekben MABISZ vagy rendőrségi szál is felmerülhet.",
                    "Casco esetén a gyors bejelentés itt is alapvető."
                )
                FirstSteps = @(
                    "Fotózza le a sérüléseket és a környezetet azonnal.",
                    "Keressen tanút, kamerát, üzletet vagy portaszolgálatot a közelben.",
                    "Jelentse az esetet a rendőrségnek, ha a helyzet ezt indokolja."
                )
                CommonMistakes = @(
                    "Túl későn kezdi keresni a kameraanyagot.",
                    "Nem rögzíti, pontosan mikor és hol észlelte a sérülést.",
                    "Bizonyíték nélkül biztosra veszi, hogy a biztosító vagy más szerv térít."
                )
                WhenToAskHelp = @(
                    "Ha nem látja át, melyik eljárási út jöhet szóba.",
                    "Ha jelentős értékű sérülés keletkezett.",
                    "Ha vitás, rendőrségi, casco vagy egyéb igényérvényesítés lehet-e eredményes."
                )
            }
            @{
                Slug = "totalkar-szamitasi-alapok"
                Title = "Totálkár számítási alapok"
                Icon = "fa fa-calculator"
                Summary = "A biztosító a káridőponti értéket, a roncsértéket és a javítás gazdaságosságát vizsgálja. Akkor átlátható a folyamat, ha minden ajánlat és számla dokumentált."
                Lead = "A totálkár nem csak azt jelenti, hogy az autó teljesen megsemmisült. Gazdasági totálkár akkor is lehet, ha a javítás költsége már nem áll arányban a jármű értékével."
                HeroPoints = @(
                    "A káridőponti érték és a roncsérték együtt határozza meg a számítást.",
                    "A javítási ajánlatok és piaci összehasonlítások sokat segítenek.",
                    "Nem mindegy, milyen állapotban és felszereltséggel szerepel az autó a kalkulációban."
                )
                FocusHeading = "Mit néz a biztosító totálkárnál?"
                FocusText = "A számítás lényege, hogy mennyit ért az autó a káresemény előtt, mennyit ér roncsként utána, és mennyire lenne gazdaságos a javítás."
                FocusPoints = @(
                    "Az extrák és az állapot is befolyásolhatják a káridőponti értéket.",
                    "A roncsérték kalkulációját is érdemes átnézni.",
                    "Nem minden javítási ajánlat ugyanazt a képet mutatja.",
                    "Vitás esetben hasznos lehet külön szakértői szemmel is megnézni az ügyet."
                )
                FirstSteps = @(
                    "Kérje ki a biztosító kalkulációjának fő elemeit.",
                    "Gyűjtse össze az autó állapotát igazoló dokumentumokat és számlákat.",
                    "Tartsa meg a javítóműhely(ek) ajánlatait és nyilatkozatait."
                )
                CommonMistakes = @(
                    "Automatikusan elfogadja az első számítást ellenőrzés nélkül.",
                    "Nem dokumentálja az autó korábbi javításait vagy extra felszereltségét.",
                    "Nem figyel a roncsérték-meghatározás részleteire."
                )
                WhenToAskHelp = @(
                    "Ha jelentős eltérést lát a piaci és a biztosítói érték között.",
                    "Ha nem világos, valóban indokolt-e a totálkár minősítés.",
                    "Ha a roncsérték vagy a számítás elemei vitathatónak tűnnek."
                )
            }
            @{
                Slug = "uvegkar-es-onresz"
                Title = "Üvegkár és önrész"
                Icon = "fa fa-glass-martini"
                Summary = "Sok casco csomag eltérően kezeli a szélvédő javítást és cserét. Nem mindegy, melyik partner szervizben történik az ügyintézés, mert ez befolyásolhatja az önrészt."
                Lead = "Szélvédős károknál gyakran az a kérdés, hogy javítás vagy csere szükséges-e, illetve mekkora önrésszel számolhat az ügyfél. A szerződés részletei és a javítópartner választása itt is sokat számít."
                HeroPoints = @(
                    "A javítás és a csere eltérő feltételekkel szerepelhet a szerződésben.",
                    "Partner szerviznél kedvezőbb lehet az ügyintézés menete.",
                    "Fontos tudni, hogy mikor halasztható és mikor nem a javítás."
                )
                FocusHeading = "Hol csúszhat el az üvegkár ügye?"
                FocusText = "Sok félreértés abból adódik, hogy az ügyfél nem tudja előre, milyen javítási csatornát vár a biztosító, illetve mikor és mennyi önrész terheli."
                FocusPoints = @(
                    "Ellenőrizze, üvegkárra van-e külön szabály a casco feltételben.",
                    "Kérdezzen rá, mely szervizek elfogadott partnerek.",
                    "Ne induljon el csere felé biztosítói egyeztetés nélkül.",
                    "A fotózás itt is fontos, még kisebb repedésnél is."
                )
                FirstSteps = @(
                    "Fotózza le a repedést vagy törést kívülről és belülről is.",
                    "Jelentse a kárt a biztosítónak vagy a kijelölt partnernek.",
                    "Kérje meg a szervizt, hogy egyértelműen rögzítse: javítás vagy csere szükséges."
                )
                CommonMistakes = @(
                    "A szerződés ellenőrzése nélkül választ szervizt.",
                    "A sérülés dokumentálása elmarad, mert kicsinek tűnik.",
                    "Csere történik, miközben a biztosító javítást tartott volna indokoltnak."
                )
                WhenToAskHelp = @(
                    "Ha nem világos, mekkora önrész vonatkozik az esetre.",
                    "Ha a szerviz és a biztosító eltérően látja a megoldást.",
                    "Ha gyorsan dönteni kell, de nem egyértelmű a szerződés értelmezése."
                )
            }
            @{
                Slug = "kulfoldi-baleset-teendoi"
                Title = "Külföldi baleset teendői"
                Icon = "fa fa-globe-europe"
                Summary = "Kék-sárga bejelentő, helyszíni fotók, rendőri jegyzőkönyv és asszisztencia hívás. Ezek hiánya jelentősen lassíthatja vagy nehezítheti a későbbi kárrendezést."
                Lead = "Külföldi balesetnél a stressz mellett a nyelvi bizonytalanság és a helyi szabályok is nehezíthetik az ügyet. Ilyenkor a cél az, hogy minden alapdokumentumot még a helyszínen sikerüljön összegyűjteni."
                HeroPoints = @(
                    "Kérjen adatot a másik félről, biztosítóról és a járműről.",
                    "Fotózza a járműveket, a sérüléseket és a környezetet.",
                    "Ha szükséges, hívja az assistance szolgáltatást a helyszínről."
                )
                FocusHeading = "Miért kulcsfontosságú a helyszíni papírmunka?"
                FocusText = "A külföldön készült jegyzőkönyv, bejelentő és számlák hiányát később sokkal nehezebb pótolni. Ami ott nem kerül rögzítésre, azt itthon már nehéz újra felépíteni."
                FocusPoints = @(
                    "Töltse ki olvashatóan a bejelentőt vagy kérjen hivatalos jegyzőkönyvet.",
                    "Őrizze meg a vontatásról, szállásról vagy sürgős javításról szóló bizonylatokat.",
                    "Jegyezze fel a biztosító vagy assistance ügyazonosítóját.",
                    "Ne csak a károkat, hanem a közlekedési helyzetet is fotózza."
                )
                FirstSteps = @(
                    "Biztosítsa a helyszínt és szükség esetén hívja a helyi segélyhívót.",
                    "Vegye fel a kapcsolatot az assistance szolgáltatással.",
                    "Gyűjtsön össze minden helyszíni dokumentumot és elérhetőséget."
                )
                CommonMistakes = @(
                    "A nyelvi nehézségek miatt hiányosan töltik ki a papírokat.",
                    "Elmaradnak a fotók vagy a másik fél adatainak rögzítése.",
                    "Nincs megőrizve a sürgősségi költségek bizonylata."
                )
                WhenToAskHelp = @(
                    "Ha több ország, több biztosító vagy bérautó is érintett.",
                    "Ha személyi sérülés vagy jelentős anyagi kár történt.",
                    "Ha nem egyértelmű, melyik biztosítóhoz kell továbbítani az ügyet."
                )
            }
            @{
                Slug = "karbejelento-ellenorzolista"
                Title = "Kárbejelentő ellenőrzőlista"
                Icon = "fa fa-file-signature"
                Summary = "A hibásan vagy hiányosan kitöltött bejelentő vitás helyzeteket eredményezhet. Célszerű a rajzot, a felek adatait és a sérülések jelölését többször ellenőrizni."
                Lead = "A kárbejelentő sokszor apróságnak tűnik, mégis ezen múlhat, mennyire tiszta a felelősségi helyzet. Egy rossz nyíl, hiányzó adat vagy pontatlan megjegyzés komoly félreértéseket okozhat."
                HeroPoints = @(
                    "A rajz és a szöveges leírás legyen összhangban.",
                    "A felek adatai és rendszámai pontosan szerepeljenek.",
                    "A sérüléseket jelölje egyértelműen mindkét járműn."
                )
                FocusHeading = "Miért fontos az ellenőrzés aláírás előtt?"
                FocusText = "A bejelentő véglegesítése után sokkal nehezebb korrigálni a félreérthető részeket. Néhány perc plusz ellenőrzés gyakran hosszú vitát előz meg."
                FocusPoints = @(
                    "Olvassa vissza a teljes nyomtatványt, ne csak a saját oldalát.",
                    "Ellenőrizze, hogy a rajz tényleg a történteket mutatja-e.",
                    "Ha nem ért egyet valamivel, ne hagyja tisztázatlanul.",
                    "Készítsen fotót a kitöltött, aláírt dokumentumról is."
                )
                FirstSteps = @(
                    "Töltse ki nyugodtan, jól olvashatóan a bejelentőt.",
                    "Rögzítse a pontos helyet, időt és a járművek adatait.",
                    "Készítsen külön fotókat a sérülésekről és az aláírt lapról."
                )
                CommonMistakes = @(
                    "Kapkodva, pontatlan rajzzal töltik ki az űrlapot.",
                    "Hiányzik a tanú vagy a sérülés pontos jelölése.",
                    "Az egyik fél másképp értelmezi a leírást, mint ami a papírra került."
                )
                WhenToAskHelp = @(
                    "Ha utólag derül ki ellentmondás a dokumentumban.",
                    "Ha a másik fél nem együttműködő vagy vitatja a tartalmat.",
                    "Ha nem egyértelmű, mi kerüljön a megjegyzés rovatba."
                )
            }
        )
    }
    @{
        FileName = "info-ingatlan.html"
        Title = "Ingatlan, lakás és felelősség"
        ShortTitle = "Ingatlan és felelősség"
        MetaDescription = "Lakás- és ingatlanbiztosítási kisokos alulbiztosítottságra, beázásra, csőtörésre, betörési károkra, társasházi felelősségre és villámkárokra."
        IntroLead = "Lakás- és felelősségi ügyekben az okozza a legtöbb gondot, hogy nem egyértelmű: kié a felelősség, mi tartozik a biztosításba, és mit kell azonnal dokumentálni. Ezekhez adunk gyakorlati kapaszkodót."
        HeroPoints = @(
            "Kiderül, milyen károknál kell azonnal szakember, közös képviselő vagy biztosító.",
            "Megmutatjuk, mikor számít különösen a biztosítási összeg és a nyilvántartott érték.",
            "Segítünk eligazodni a felelősségi kérdésekben lakás, társasház és magánszemély között."
        )
        FocusHeading = "Hol szokott elakadni egy lakáskár?"
        FocusText = "Jellemzően ott, hogy a kárról későn készül kép, nincs világos kárleírás, vagy nem derül ki, melyik biztosítási szerződésből lehetne elindítani az ügyet."
        FocusPoints = @(
            "Vizes károknál különösen fontos a gyors állapotfelvétel.",
            "Társasházi ügyeknél a közös képviselő szerepe sokszor megkerülhetetlen.",
            "Betöréses károknál rendőrségi vonal is felmerülhet.",
            "Alulbiztosítottságnál a szerződés felülvizsgálata hosszabb távon kiemelten fontos."
        )
        HeroImage = "./../img/ajanlatok/lakas1.jpg"
        FocusImage = "./../img/ajanlatok/lakas2.jpg"
        HeroImageDetail = "./../../img/ajanlatok/lakas1.jpg"
        FocusImageDetail = "./../../img/ajanlatok/lakas2.jpg"
        Topics = @(
            @{
                Slug = "alulbiztositottsag-elkerulese"
                Title = "Alulbiztosítottság elkerülése"
                Icon = "fa fa-balance-scale"
                Summary = "A régi biztosítási összeg könnyen elmaradhat a mai újjáépítési költségektől. Ha a biztosítási érték túl alacsony, nagyobb kárnál arányosan kevesebb térítés érkezhet."
                Lead = "Sokan azt gondolják, elég, ha a szerződés valahogy megvan, pedig a lakásbiztosítás egyik kulcskérdése a megfelelő biztosítási összeg. Ha ez elcsúszik, kár esetén kellemetlen meglepetés érheti az ügyfelet."
                HeroPoints = @("Nem a régi vételár, hanem az aktuális helyreállítási költség a fontos.","Felújítás, bővítés vagy értéknövelő beruházás után érdemes felülvizsgálni a szerződést.","A melléképületek és különleges értékek is torzíthatják a képet.")
                FocusHeading = "Mit jelent ez a gyakorlatban?"
                FocusText = "Alulbiztosítottság esetén hiába nagy a kár, a biztosító arányos térítést alkalmazhat. Ezért jobb előre rendbe tenni az összegeket, mint utólag vitatkozni rajtuk."
                FocusPoints = @("Nézze át időről időre a biztosítási összegeket.","Vegye számba a felújításokat és beépített értékeket.","Külön kezelendők lehetnek az értékesebb ingóságok.","Ne csak a díjat, a fedezeti összeget is hasonlítsa össze.")
                FirstSteps = @("Ellenőrizze a szerződésben szereplő épület- és ingóságértékeket.","Írja össze, mi változott az ingatlanban az elmúlt években.","Hasonlítsa össze a jelenlegi adatokat a valós állapottal.")
                CommonMistakes = @("Évekig változatlanul hagyja a régi biztosítási összeget.","A felújítások és új beépített elemek kimaradnak a felülvizsgálatból.","Csak az éves díj alapján dönt, a fedezet tartalma nélkül.")
                WhenToAskHelp = @("Ha nagy értékű felújítás vagy bővítés történt.","Ha nem világos, mennyit érdene fedezni reálisan az ingatlan.","Ha több biztosító ajánlatát szeretné tartalmilag is összevetni.")
            }
            @{
                Slug = "beazas-es-csotores-teendok"
                Title = "Beázás és csőtörés teendők"
                Icon = "fa fa-tint"
                Summary = "Vizes károknál a gyors fotózás, az elzárás és a kárenyhítés elsőbbséget élvez. A későbbi térítéshez fontos látni, hol indult a hiba és milyen károk keletkeztek."
                Lead = "Beázásnál vagy csőtörésnél egyszerre kell gyorsan cselekedni és jól dokumentálni. A cél az, hogy a további károkat megelőzze, közben pedig megmaradjon minden fontos bizonyíték a káreseményről."
                HeroPoints = @("Az első lépés a víz elzárása és a további ázás megfékezése.","Fotózza le a forrás helyét és a következményeket még takarítás előtt.","Társasházban a közös képviselő vagy szomszéd bevonása is szükséges lehet.")
                FocusHeading = "Mit kér a biztosító vizes károknál?"
                FocusText = "A biztosító jellemzően arra kíváncsi, mi volt a hiba forrása, mekkora lett a kár, és megtette-e a tulajdonos a szükséges kárenyhítést."
                FocusPoints = @("A hiba eredetét dokumentálja külön is, ne csak a következményeket.","Őrizze meg a szakember véleményét és számláját.","A megelőző kárenyhítés nem jelentheti a bizonyítékok eltüntetését.","Társasházi eredetnél különösen fontos a felelősség tisztázása.")
                FirstSteps = @("Zárja el a vizet vagy intézkedjen a további ázás megállításáról.","Fotózza le a hibaforrást, a falakat, burkolatot és ingóságokat.","Szükség esetén értesítse a közös képviselőt vagy a felelős felet.")
                CommonMistakes = @("A takarítás és bontás megelőzi a dokumentálást.","Csak a látható kárt fotózza, a kiváltó okot nem.","Nincs meg a szakember vagy a közös képviselő írásos nyoma.")
                WhenToAskHelp = @("Ha nem egyértelmű, saját vagy társasházi biztosításból induljon az ügy.","Ha jelentős fal-, padló- vagy bútor kár keletkezett.","Ha a szomszéddal vagy a társasházzal vita alakul ki a felelősségről.")
            }
            @{
                Slug = "betoresi-kar-dokumentalasa"
                Title = "Betörési kár dokumentálása"
                Icon = "fa fa-user-lock"
                Summary = "Betörésnél a rendőrségi bejelentés, a behatolás nyomainak megőrzése és a tételes kárlista kulcskérdés. Az eltűnt tárgyak igazolásához jól jön minden számla, fotó és leírás."
                Lead = "Betöréses károknál a biztosító nem csak az eltűnt tárgyakat nézi, hanem azt is, hogyan történt a behatolás, voltak-e nyomok, és mennyire igazolható a kárösszeg."
                HeroPoints = @("A rendőrségi bejelentés sok esetben alapfeltétel.","A behatolási nyomokat dokumentálni kell javítás előtt.","A hiányzó tárgyakról érdemes minél pontosabb listát készíteni.")
                FocusHeading = "Miért fontos a tételes kárlista?"
                FocusText = "Egy általános megfogalmazás ritkán elég. Minél pontosabban azonosítható egy eltűnt vagy sérült vagyontárgy, annál tisztább a kárösszeg megalapozása."
                FocusPoints = @("Írja össze darabra, típusra, értékre a hiányzó tárgyakat.","Keressen régi számlákat, fotókat, garancialeveleket.","A zár, ajtó vagy ablak sérüléseit is fotózza le.","A helyszínt lehetőleg ne rendezze át a rögzítés előtt.")
                FirstSteps = @("Értesítse a rendőrséget és készítsen részletes fotókat.","Készítsen listát a hiányzó és sérült vagyontárgyakról.","Jelentse a kárt a biztosítónak a rendőrségi ügyszám megadásával.")
                CommonMistakes = @("A behatolási nyomokat javítják, mielőtt dokumentálnák.","Nincs kellően részletes tételes lista az eltűnt tárgyakról.","A kárbejelentéshez nem csatolják a rendőrségi adatokat.")
                WhenToAskHelp = @("Ha nagy értékű vagy sokféle ingóság tűnt el.","Ha nem egyértelmű, a szerződés mely értékcsoportokat fedezi.","Ha a biztosító hiánypótlást kér az eltűnt tárgyak igazolására.")
            }
            @{
                Slug = "tarsashazi-karok-felelossege"
                Title = "Társasházi károk felelőssége"
                Icon = "fa fa-building"
                Summary = "Csőtörés, beázás vagy közös tulajdonból eredő hiba esetén nem mindig egyértelmű, hogy a lakó, a közös képviselet vagy a társasház biztosítása az első lépcső."
                Lead = "Társasházi károknál az egyik leggyakoribb nehézség, hogy több szereplő érintett egyszerre. Emiatt fontos gyorsan különválasztani: mi a magántulajdon, mi a közös tulajdon, és ki okozta a kárt."
                HeroPoints = @("A felelősség megállapítása gyakran a hiba eredetén múlik.","A közös képviselő sokszor kulcsszereplő az ügyben.","Nem minden esetet ugyanabból a biztosításból célszerű indítani.")
                FocusHeading = "Hogyan lehet gyorsabban tisztázni a szerepeket?"
                FocusText = "Ha korán kiderül, hogy a hiba a közös hálózatból, egy másik lakásból vagy saját vezetékrendszerből ered, az egész ügyintézés sokkal átláthatóbbá válik."
                FocusPoints = @("Rögzítse írásban, honnan eredhetett a hiba.","Vonja be a közös képviselőt, ha a közös tulajdon érintett.","A saját lakásbiztosítást és a társasházi szerződést is nézze meg.","Őrizze meg a szakember megállapításait.")
                FirstSteps = @("Kérjen állapotfelmérést a hiba eredetéről.","Értesítse a közös képviseletet és az érintett szomszédot, ha szükséges.","Dokumentálja a kár mértékét minden érintett helyiségben.")
                CommonMistakes = @("A felek szóban egyeztetnek, írásos nyom nélkül.","Nem derül ki egyértelműen, közös vagy magántulajdonból ered a kár.","Csak az egyik biztosítási oldalt vizsgálják meg.")
                WhenToAskHelp = @("Ha több lakás vagy közös tulajdoni rész is érintett.","Ha a társasház és a lakó eltérően látja a felelősséget.","Ha jelentős helyreállítási költség vagy hosszabb ügy várható.")
            }
            @{
                Slug = "maganfelelossegi-kar-bejelentese"
                Title = "Magánfelelősségi kár bejelentése"
                Icon = "fa fa-user-friends"
                Summary = "Ha Ön vagy a családtagja másnak okoz kárt, gyorsan kell rögzíteni a körülményeket és a kár mértékét. A felelősségi biztosítási ügyekben a pontos tényállás különösen fontos."
                Lead = "Magánfelelősségi károknál nem csak az a lényeg, mi sérült meg, hanem az is, hogyan és milyen körülmények között történt a károkozás. A biztosító a felelősség alapját is vizsgálhatja."
                HeroPoints = @("A kárt okozó eseményt röviden, érthetően és pontosan kell leírni.","Jó, ha a károsulttal közösen is készül fotó vagy jegyzőkönyv.","Fontos elkülöníteni, mi tényleges kár és mi utólagos vita.")
                FocusHeading = "Mit vizsgál a biztosító felelősségi ügyben?"
                FocusText = "A felelősségi biztosításnál a biztosító sokszor azt is elemzi, fennáll-e jogalap a károkozó helytállására. Ezért fontos a körülmények pontos rögzítése."
                FocusPoints = @("Rögzítse, hogyan történt a károkozás és ki volt jelen.","Kérjen pontos kárleírást és, ha lehet, költségbecslést.","Ne vállaljon írásban többet annál, mint amit biztosan tud.","A saját szerződés kizárásait is érdemes megnézni.")
                FirstSteps = @("Fotózza le a sérült tárgyat vagy felületet több nézőpontból.","Jegyezze fel a károsult adatait és az esemény rövid leírását.","Jelentse be a kárt a biztosítónak a körülmények részletes ismertetésével.")
                CommonMistakes = @("Nincs egyértelmű írásos összefoglaló a történtekről.","A károsulttal való egyeztetésből csak szóban marad nyoma.","A bejelentés túl általános, és emiatt hiánypótlás lesz belőle.")
                WhenToAskHelp = @("Ha magas összegű vagy vitás felelősségi igény érkezik.","Ha nem világos, a szerződés fedezi-e az adott helyzetet.","Ha a károsult és az okozó fél máshogy írná le az eseményt.")
            }
            @{
                Slug = "villamkar-es-tulfeszultseg"
                Title = "Villámkár és túlfeszültség"
                Icon = "fa fa-bolt"
                Summary = "Villámcsapás vagy túlfeszültség után nem csak a látványos hiba számít. Az elektromos eszközök, vezérlések és rejtett hibák dokumentálása is fontos lehet."
                Lead = "Villámkárnál a probléma sokszor nem azonnal jelentkezik minden eszköznél. A biztosító felé ezért érdemes minél pontosabban összegyűjteni, mely készülékek, rendszerek és elektromos elemek sérültek."
                HeroPoints = @("Készítsen listát minden érintett eszközről és tünetről.","Ha lehet, kérjen szakembertől hibamegállapítást.","A biztosító számára a károk összefüggése is fontos lehet.")
                FocusHeading = "Miért kell a rejtett hibákra is figyelni?"
                FocusText = "Egy túlfeszültség után lehet, hogy egy készülék nem azonnal mondja fel a szolgálatot, hanem csak később hibásodik meg. Emiatt a korai állapotfelmérés különösen értékes."
                FocusPoints = @("Írja össze a biztosítékok, eszközök, kapuk, kazánok, routerek állapotát.","Fotózza a sérült vagy nem működő készülékeket.","A szakvélemény sokat segíthet a kár okának alátámasztásában.","Őrizze meg a javítási és cserére vonatkozó ajánlatokat.")
                FirstSteps = @("Ellenőrizze biztonságosan a főbb elektromos rendszereket.","Fotózza és listázza az érintett berendezéseket.","Kérjen szakembertől elsődleges állapotfelmérést, ha szükséges.")
                CommonMistakes = @("Csak a legnagyobb kárt veszi számba, a kisebb hibákat nem.","Nem készül szakvélemény a meghibásodás okáról.","A sérült eszközöket bizonyítás nélkül selejtezik ki.")
                WhenToAskHelp = @("Ha több eszköz és beépített rendszer egyszerre sérült meg.","Ha a biztosító vitatja az összefüggést a vihar és a kár között.","Ha nem világos, javítás vagy csere irányába érdemes továbbmenni.")
            }
            @{
                Slug = "mellekepuletek-es-kerti-ertekek"
                Title = "Melléképületek és kerti értékek"
                Icon = "fa fa-warehouse"
                Summary = "Nem minden szerződés kezeli egyformán a garázst, tárolót, kerítést, kerti gépeket vagy különálló melléképületeket. Kár előtt érdemes tudni, mi hogyan szerepel a fedezetben."
                Lead = "Sok ügyfél csak káreseménynél szembesül vele, hogy a főépülethez kapcsolódó melléképületek és kültéri értékek eltérő szabályokkal szerepelnek a biztosításban. Ezért hasznos előre tisztázni a kategóriákat."
                HeroPoints = @("A garázs, tároló, kerítés vagy kerti berendezés külön biztosítási logikát követhet.","Nem mindegy, hogy az adott érték épület, melléképület vagy ingóság.","Kár esetén a pontos beazonosítás gyorsítja a kárrendezést.")
                FocusHeading = "Hol lehet félreértés a fedezetben?"
                FocusText = "Gyakori, hogy ami az ügyfél számára egyértelműen a ház része, az a szerződésben külön kategóriaként szerepel. Emiatt célszerű átnézni a feltételeket és az értékeket."
                FocusPoints = @("Nézze meg, mely elemek szerepelnek épületként és melyek ingóságként.","A kerti gépek és bútorok fedezete külön korlátozott lehet.","Kerítésnél és kapunál a viharkár, törés vagy felelősség is eltérhet.","A különálló melléképületek biztosítási összegét is érdemes ellenőrizni.")
                FirstSteps = @("Azonosítsa, pontosan mely melléképület vagy kültéri érték sérült.","Fotózza a károkat és a teljes környezetet.","Nézze meg a szerződésben az adott értékcsoport besorolását.")
                CommonMistakes = @("A sérült értéket automatikusan a főépület részének tekinti.","Nincs külön dokumentáció a kültéri vagy melléképület jellegű károkról.","A fedezeti korlátokat csak a káresemény után kezdi keresni.")
                WhenToAskHelp = @("Ha nagyobb melléképület vagy drágább kültéri eszköz sérült meg.","Ha bizonytalan a besorolás és emiatt a fedezet köre is kérdéses.","Ha szerződésmódosítás előtt szeretné rendbe tenni ezeket az értékeket.")
            }
            @{
                Slug = "ideiglenes-lakhatasi-koltsegek"
                Title = "Ideiglenes lakhatási költségek"
                Icon = "fa fa-hotel"
                Summary = "Nagyobb lakáskár után előfordulhat, hogy ideiglenesen máshol kell lakni. Nem minden szerződés fedezi egyformán a szállás vagy elhelyezés költségeit, ezért ezt előre is érdemes ismerni."
                Lead = "Tűz, jelentős beázás vagy más súlyos lakáskár után az egyik legsürgetőbb kérdés az, hol lehet átmenetileg lakni. Ilyenkor a gyakorlati megoldás mellett a biztosítási kereteket is gyorsan át kell látni."
                HeroPoints = @("Fontos tisztázni, lakhatatlanná vált-e az ingatlan a kár miatt.","A szállásköltségeket jellemzően bizonylattal kell igazolni.","A fedezeti limitek és időtartamok szerződésenként eltérhetnek.")
                FocusHeading = "Milyen dokumentumok számítanak?"
                FocusText = "Az ideiglenes lakhatási költségek elszámolásához többnyire kell a káresemény dokumentációja, a szükségesség indoka és a felmerült költségek bizonylata is."
                FocusPoints = @("Őrizze meg a szállásról, albérletről vagy elhelyezésről szóló bizonylatokat.","A lakhatatlanságot alátámaszthatja szakvélemény vagy helyszíni dokumentáció.","A biztosítói egyeztetés itt különösen fontos a költés előtt.","Ne csak a szállásdíjat, a kapcsolódó feltételeket is nézze meg.")
                FirstSteps = @("Dokumentálja, miért nem lakható az ingatlan.","Vegye fel a kapcsolatot a biztosítóval a várható lehetőségekről.","Őrizzen meg minden szállásköltséggel kapcsolatos bizonylatot.")
                CommonMistakes = @("A költségek igazolására nincs meg a megfelelő bizonylat.","Nem tisztázza előre a biztosítóval a fedezet körét.","A lakhatatlanság okát nem támasztja alá dokumentáció.")
                WhenToAskHelp = @("Ha hosszabb ideig tartó elhelyezésre lehet szükség.","Ha többféle költség merül fel és nem világos, melyik térülhet.","Ha a biztosítóval előzetesen szeretné egyeztetni a lehetőségeket.")
            }
        )
    }
    @{
        FileName = "info-utazas-elet.html"
        Title = "Utazás, élet és pénzügyi döntések"
        ShortTitle = "Utazás és élet"
        MetaDescription = "Utazási, élet- és egészségbiztosítási kisokos adójóváírással, külföldi káreseménnyel, extrém sporttal, kórházi térítéssel és hitelvédelemmel."
        IntroLead = "Utazási, élet- és pénzügyi döntéseknél sokszor nem a termék neve a lényeg, hanem hogy az adott élethelyzethez illik-e a fedezet. Ezek az oldalak ebben segítenek gyorsan eligazodni."
        HeroPoints = @("Utazás előtt, váratlan káreseménynél és hosszabb távú pénzügyi döntéseknél is használható kapaszkodókat adunk.","Összevetjük, milyen pontokat érdemes ellenőrizni választás előtt.","Segítünk, hogy a szerződés ne csak papíron, hanem élethelyzetre szabva is működjön.")
        FocusHeading = "Miért fontos itt a részletek átnézése?"
        FocusText = "Az utazási és életbiztosítási termékeknél a kizárások, limitek, várakozási idők és területi szabályok sokkal többet számítanak, mint az elsőre látható marketingcímkék."
        FocusPoints = @("Külföldi ügyeknél az assistance és a dokumentáció kulcskérdés.","Élet- és egészségtermékeknél a szolgáltatási feltételek és várakozási idők fontosak.","Pénzügyi termékeknél a rugalmasság és az adójóváírás együtt értelmezendő.","A legjobb döntés általában élethelyzetre szabva születik.")
        HeroImage = "./../img/ajanlatok/elet1.jpg"
        FocusImage = "./../img/ajanlatok/megtakaritas1.jpg"
        HeroImageDetail = "./../../img/ajanlatok/elet1.jpg"
        FocusImageDetail = "./../../img/ajanlatok/megtakaritas1.jpg"
        Topics = @(
            @{
                Slug = "adojovairas-tervezese"
                Title = "Adójóváírás tervezése"
                Icon = "fa fa-file-invoice-dollar"
                Summary = "A nyugdíj- és egészségcélú termékeknél elérhető adó-visszatérítés akkor használható ki jól, ha az éves befizetés ritmusa és mértéke tudatosan van felépítve."
                Lead = "Az adójóváírás sokaknak vonzó, de önmagában nem elég indok egy termék kiválasztására. Akkor működik jól, ha a befizetések, a likviditás és a cél együtt vannak átgondolva."
                HeroPoints = @("Az éves befizetési terv és a jövedelmi helyzet együtt számít.","Nem mindegy, milyen terméktípusból és milyen korláttal vehető igénybe az adójóváírás.","A rövid távú pénzügyi rugalmasságot is érdemes szem előtt tartani.")
                FocusHeading = "Mi a jó adójóváírási stratégia?"
                FocusText = "A jó stratégia nem csak a maximális visszatérítésre törekszik, hanem arra is, hogy a befizetés hosszabb távon fenntartható legyen."
                FocusPoints = @("Érdemes éves és havi szinten is megtervezni a befizetéseket.","Az adójóváírás mellett a költségek és hozzáférési szabályok is fontosak.","Ne terhelje túl a családi költségvetést csak a visszatérítés miatt.","A cél időtávja meghatározza, melyik megoldás illik jobban.")
                FirstSteps = @("Nézze át, mely termékeknél és milyen mértékű adójóváírás érhető el.","Számolja ki, mekkora befizetés fér bele kényelmesen éves szinten.","Vizsgálja meg a hozzáférés, költség és rugalmasság kérdését is.")
                CommonMistakes = @("Csak a visszatérítés miatt választ terméket.","Nincs összhang a befizetés és a valós pénzügyi mozgástér között.","Nem nézi meg az adott konstrukció hosszabb távú szabályait.")
                WhenToAskHelp = @("Ha többféle adójóváírási termék között vacillál.","Ha fontos a rövid távú rugalmasság is a hosszú távú cél mellett.","Ha szeretné a befizetést és a várható előnyt reálisan megtervezni.")
            }
            @{
                Slug = "kulfoldi-karesemeny-menete"
                Title = "Külföldi káresemény menete"
                Icon = "fa fa-passport"
                Summary = "Első lépés az asszisztencia hívása, majd orvosi dokumentum, számla és jegyzőkönyv gyűjtése. A helyszíni bizonyítékok hiánya utólag nehezen pótolható."
                Lead = "Külföldön bekövetkező orvosi vagy utazási káreseménynél a legfontosabb, hogy már a helyszínen elinduljon a dokumentálás és az assistance vonal. Ez sokszor későbbi szervezést és költséget spórol meg."
                HeroPoints = @("Az assistance központ hamarabb tud segíteni, ha azonnal értesül az esetről.","Az orvosi dokumentumokat és számlákat teljes körűen meg kell őrizni.","A helyszíni jegyzőkönyv vagy igazolás sok ügyben nélkülözhetetlen.")
                FocusHeading = "Melyik papírt ne hagyja ott külföldön?"
                FocusText = "A vizsgálati lap, orvosi záró, gyógyszerszámla, szállítási bizonylat vagy poggyászjegyzőkönyv hiányát utólag sokkal nehezebb pótolni, mint ott rögtön elkérni."
                FocusPoints = @("Kérjen részletes orvosi dokumentumot, ne csak rövid igazolást.","Őrizze meg a gyógyszer- és kezelési számlákat is.","Közlekedési vagy poggyászügyben kérjen helyszíni jegyzőkönyvet.","Jegyezze fel az assistance ügyszámát és az elhangzott instrukciókat.")
                FirstSteps = @("Hívja az assistance szolgáltatást és kövesse az instrukciókat.","Kérjen minden ellátásról dokumentumot és számlát.","Fotózza vagy másolja le a kapott iratokat még a helyszínen.")
                CommonMistakes = @("Későn szól az assistance központnak.","Hiányos orvosi dokumentációval tér haza.","A számlák egy részét nem őrzi meg vagy nem olvashatóak.")
                WhenToAskHelp = @("Ha összetett, több szolgáltatót érintő külföldi ügy alakult ki.","Ha bizonytalan, melyik költség számolható el.","Ha sürgős ügyintézés kell hazaszállítással vagy további ellátással.")
            }
            @{
                Slug = "extrem-sport-fedezet"
                Title = "Extrém sport fedezet"
                Icon = "fa fa-skiing"
                Summary = "Síelés, snowboard, búvárkodás vagy motorozás esetén nem minden csomag térít. A sporttevékenység pontos megnevezése sok félreértést és elutasítást megelőz."
                Lead = "Az utasbiztosításoknál gyakori, hogy a sporttevékenység kategóriája dönti el, van-e fedezet vagy nincs. Ezért fontos nem csak általánosságban nézni a csomagot, hanem a tervezett programra szabni."
                HeroPoints = @("A sport pontos besorolása kulcskérdés lehet.","Nem minden síelés, túra vagy vízi sport számít ugyanabba a kategóriába.","A felszerelésre, mentésre vagy felelősségre is más szabályok lehetnek.")
                FocusHeading = "Mit ellenőrizzen indulás előtt?"
                FocusText = "Nem elég annyit tudni, hogy van utasbiztosítása. A kérdés az, hogy a konkrét tevékenység, helyszín és kockázat belefér-e a választott csomagba."
                FocusPoints = @("Ellenőrizze a sporttevékenységek listáját és kizárásait.","Nézze meg, van-e külön mentési, felelősségi vagy felszerelés fedezet.","Magashegyi vagy versenyjellegű programoknál különösen óvatosan válasszon.","Kérdés esetén indulás előtt tisztázza a biztosítóval vagy alkusszal.")
                FirstSteps = @("Nevezze meg pontosan a tervezett sportot és körülményeit.","Olvassa át a vonatkozó kizárásokat és limitet.","Szükség esetén válasszon kiegészítő vagy speciális fedezetet.")
                CommonMistakes = @("Általános csomagot választ speciális sportprogramhoz.","Nem ellenőrzi a kizárásokat vagy a mentési fedezetet.","Utólag derül ki, hogy a tevékenység más kategóriába esik.")
                WhenToAskHelp = @("Ha többféle sportot tervez egy úton belül.","Ha nem egyértelmű a sport besorolása a feltételek alapján.","Ha drágább felszerelés vagy komolyabb kockázat is érintett.")
            }
            @{
                Slug = "korhazi-napi-terites"
                Title = "Kórházi napi térítés"
                Icon = "fa fa-procedures"
                Summary = "Jellemzően jövedelempótlásra használható kiegészítő védelem, amely segíthet a kieső bevétel enyhítésében. A várakozási idő és kizárások áttekintése fontos."
                Lead = "A kórházi napi térítés jó kiegészítő lehet, de csak akkor, ha tisztán látszik, mikor indul, milyen eseményekre fizet, és milyen korlátozásokkal működik."
                HeroPoints = @("A várakozási idő és az előzménybetegségek vizsgálata gyakori.","Nem minden bentfekvés vagy ellátás számít biztosítási eseménynek.","Érdemes jövedelempótlási logikában gondolkodni, nem teljes költségfedezetben.")
                FocusHeading = "Mire jó valójában ez a szolgáltatás?"
                FocusText = "Ez a fedezet leginkább arra szolgál, hogy csökkentse a kieső bevétel vagy a többletkiadás terhét, nem pedig arra, hogy minden egészségügyi költséget kiváltson."
                FocusPoints = @("Nézze meg, hányadik naptól jár a térítés.","Vizsgálja meg, milyen események és kizárások szerepelnek a feltételben.","A napi összeg mellett a maximális szolgáltatási időszak is számít.","Hasznos lehet más személybiztosítási elemekkel együtt értelmezni.")
                FirstSteps = @("Ellenőrizze a várakozási időt és a szolgáltatási feltételeket.","Nézze meg, milyen esetekre és milyen időtartamra járhat a térítés.","Gondolja végig, mekkora összeg lenne valóban hasznos egy kiesésnél.")
                CommonMistakes = @("Teljes egészségügyi költségfedezetként tekint rá.","Nem nézi meg a kizárásokat és a szolgáltatás indulásának feltételeit.","A napi térítési összeget nem veti össze a valós pénzügyi igénnyel.")
                WhenToAskHelp = @("Ha több személybiztosítási elem között szeretne jól választani.","Ha meglévő szerződést hasonlítana össze új lehetőséggel.","Ha családi, hitel- vagy jövedelmi helyzet miatt egyedi szempontjai vannak.")
            }
            @{
                Slug = "hitelvedelem-osszehasonlitas"
                Title = "Hitelvédelem összehasonlítás"
                Icon = "fa fa-university"
                Summary = "A banki csoportos konstrukció és az egyéni biztosítás között jelentős különbség lehet árban, kizárásban és rugalmasságban. Érdemes fedezet szerint összevetni."
                Lead = "Hitel mellé kínált védelemnél sokan automatikusan elfogadják a banki ajánlatot, pedig a valódi összehasonlítás csak akkor derül ki, ha a fedezet, kizárás és rugalmasság is terítékre kerül."
                HeroPoints = @("Nem csak az ár, hanem a szolgáltatás és a feltételek is fontosak.","A csoportos és az egyéni konstrukciók teljesen más logikával működhetnek.","Élethelyzet-változásnál a rugalmasság sokat számít.")
                FocusHeading = "Mit érdemes egymás mellé tenni?"
                FocusText = "A jó összehasonlítás nem általános benyomásokból, hanem konkrét kockázatokból épül fel: mire fizet, meddig fizet, milyen kizárások mellett és mennyire alakítható."
                FocusPoints = @("Vizsgálja meg külön a halál, keresőképtelenség és munkanélküliség fedezetet.","Nézze meg a kizárásokat és a szolgáltatás időtartamát.","Értékelje, mennyire vihető tovább vagy módosítható a szerződés.","A díjon túl a tényleges hasznosság a döntő.")
                FirstSteps = @("Írja össze, pontosan milyen kockázatok ellen keres védelmet.","Tegye egymás mellé a banki és az egyéni konstrukció fő pontjait.","Ellenőrizze a kizárásokat, várakozási időket és rugalmasságot.")
                CommonMistakes = @("Csak a havi díjat hasonlítja össze.","Nem nézi meg, mire és meddig fizet a konstrukció.","A banki megoldást automatikusan legjobb opciónak tekinti.")
                WhenToAskHelp = @("Ha több hitel vagy családi jövedelem is érintett.","Ha hosszú távra keres valóban illeszkedő védelmet.","Ha a meglévő szerződésről szeretné tudni, érdemes-e lecserélni.")
            }
            @{
                Slug = "eletbiztositas-elethelyzetre"
                Title = "Életbiztosítás élethelyzetre"
                Icon = "fa fa-heartbeat"
                Summary = "Más védelem célszerű egy fiatal családnak, egy hitellel terhelt háztartásnak vagy egy önálló vállalkozónak. A cél, hogy a fedezet valós pénzügyi terhet vegyen le."
                Lead = "Az életbiztosítás akkor működik jól, ha nem általános csomagként, hanem konkrét élethelyzetre szabott védelemként tekintünk rá. A kérdés mindig az: kinek, miből és meddig kellene biztonságot nyújtania."
                HeroPoints = @("A családi állapot, hitel és jövedelmi függés erősen befolyásolja az igényt.","Nem ugyanaz számít egy gyermeket nevelő családnál és egy egyedülállónál.","Az összeg mellett a biztosítás szerkezete is fontos.")
                FocusHeading = "Mihez igazítsa a fedezetet?"
                FocusText = "A megfelelő szerződés nem túl sok és nem túl kevés: a valós anyagi terheket, célokat és biztonsági igényt követi le."
                FocusPoints = @("Gondolja végig, mekkora anyagi kiesést kellene pótolni.","Nézze meg, van-e hitel, családi eltartás vagy vállalkozói kockázat.","A fő fedezet mellé csak olyan kiegészítőt válasszon, ami tényleg releváns.","A szerződés időtávja igazodjon a célokhoz.")
                FirstSteps = @("Írja össze a családi és pénzügyi kötelezettségeket.","Határozza meg, mekkora védelem lenne reálisan szükséges.","Nézze meg, mely fedezeti elemek illenek a jelenlegi élethelyzethez.")
                CommonMistakes = @("Mások mintájára választ, saját helyzet elemzése nélkül.","A biztosítási összeget nem köti valós pénzügyi célhoz.","Túl sok, kevésbé releváns kiegészítő kerül a szerződésbe.")
                WhenToAskHelp = @("Ha családi, hitel- vagy vállalkozói szempontok egyszerre vannak jelen.","Ha meglévő szerződést szeretne új élethelyzethez igazítani.","Ha nem világos, mely kiegészítők hoznak valódi értéket.")
            }
            @{
                Slug = "poggyaszkar-kezelese"
                Title = "Poggyászkár kezelése"
                Icon = "fa fa-plane-departure"
                Summary = "Repülésnél jegyzőkönyvet kell felvenni a helyszínen, és megőrizni a beszállókártyát, csomagcímkét, vásárlási számlákat. Ezek nélkül nehezebb igazolni a kárértéket."
                Lead = "Poggyászkárnál az egyik legnagyobb hiba, hogy az utas csak később jelzi a problémát. A helyszíni jegyzőkönyv és az utazási dokumentumok megőrzése itt kiemelten fontos."
                HeroPoints = @("A repülőtéren vagy a szolgáltatónál helyben kell elindítani a jegyzőkönyvet.","A csomagcímke és beszállókártya nélkül nehezebb a bizonyítás.","A sérült vagy hiányzó tartalomról is célszerű külön listát készíteni.")
                FocusHeading = "Milyen igazolásokra lesz szükség?"
                FocusText = "A poggyászügyeknél a fuvarozó, a reptér és a biztosító dokumentumai együtt adják ki a teljes képet, ezért mindegyikből érdemes megőrizni, amit lehet."
                FocusPoints = @("Kérjen jegyzőkönyvet vagy hivatalos igazolást a szolgáltatótól.","Őrizze meg a csomagazonosító címkét és beszállókártyát.","Rögzítse fotóval a sérülést vagy a hiányzó tartalmat.","A vásárlási vagy pótlási bizonylatok is később számíthatnak.")
                FirstSteps = @("A helyszínen jelezze a kárt és kérjen jegyzőkönyvet.","Fotózza le a sérült bőröndöt és a tartalmát.","Őrizze meg minden utazási és csomaghoz kapcsolódó dokumentumát.")
                CommonMistakes = @("A reptérről távozás után próbálja csak jelezni a problémát.","Nem marad meg a csomagcímke vagy a beszállókártya.","A sérülésről vagy hiányról nem készül azonnali fotó.")
                WhenToAskHelp = @("Ha a szolgáltató és a biztosító között elakad az ügy.","Ha nagyobb értékű poggyász vagy több tétel érintett.","Ha nem világos, mely költségek és károk érvényesíthetők.")
            }
            @{
                Slug = "szerzodes-elotti-ellenorzes"
                Title = "Szerződés előtti ellenőrzés"
                Icon = "fa fa-clipboard-check"
                Summary = "Utasbiztosításnál a területi hatály, egészségügyi limit, sportfedezet és asszisztencia szolgáltatások átnézése ad biztos alapot, mielőtt útra kelne."
                Lead = "A legtöbb biztosítási csalódás nem kárnál, hanem már a választáskor eldől. Egy gyors, tudatos ellenőrzés sok félreértést megelőzhet, különösen utazás vagy személybiztosítás előtt."
                HeroPoints = @("A területi hatály és az ellátási limitek alapvető pontok.","A sport, poggyász és assistance szabályok eltérhetnek csomagonként.","Az indulás előtti ellenőrzés gyorsabb, mint utólag vitázni a fedezetről.")
                FocusHeading = "Mit nézzen át indulás vagy szerződéskötés előtt?"
                FocusText = "A jó ellenőrzőlista néhány kulcskérdésből áll, de ezek döntik el, hogy a választott termék valóban illeszkedik-e az utazás vagy élethelyzet valós kockázataihoz."
                FocusPoints = @("Nézze meg a területi hatályt és a célországhoz illeszkedést.","Ellenőrizze az egészségügyi és assistance limiteket.","Sport, poggyász és felelősség fedezetnél figyelje a részleteket.","Kérdés esetén még indulás előtt tisztázza a bizonytalan pontokat.")
                FirstSteps = @("Írja össze az utazás vagy élethelyzet fő kockázatait.","Ellenőrizze a csomag fő limiteit és kizárásait.","Hasonlítsa össze a kiválasztott terméket a valós igényekkel.")
                CommonMistakes = @("A legalacsonyabb díj alapján dönt teljes tartalmi ellenőrzés nélkül.","Nem nézi meg a sport, poggyász vagy területi szabályokat.","Feltételezi, hogy minden csomag nagyjából ugyanazt tudja.")
                WhenToAskHelp = @("Ha egyedi útvonal, több ország vagy speciális program szerepel az utazásban.","Ha több termék között nehéz tartalmilag dönteni.","Ha a meglévő biztosításáról szeretné tudni, elég-e a terveihez.")
            }
        )
    }
    @{
        FileName = "info-adminisztracio.html"
        Title = "Technikai és adminisztrációs alapok"
        ShortTitle = "Technikai alapok"
        MetaDescription = "Biztosítási adminisztrációs kisokos évfordulós váltáshoz, díjnemfizetéshez, fedezetlenségi díjhoz, dokumentumokhoz és meghatalmazáshoz."
        IntroLead = "A biztosítási ügyek jelentős része nem a termékeken, hanem a határidőkön, dokumentumokon és pontos ügyintézésen múlik. Ezekhez adunk rövid, gyakorlatias támpontokat."
        HeroPoints = @("Átláthatóbbá tesszük a leggyakoribb határidős és adminisztratív helyzeteket.","Segítünk elkerülni a díjnemfizetésből vagy hiányos dokumentumból eredő kellemetlenségeket.","Megmutatjuk, mikor számít egy apró papírmunka valójában kulcslépésnek.")
        FocusHeading = "Miért csúszik félre ennyi adminisztratív ügy?"
        FocusText = "Leggyakrabban azért, mert a szükséges lépés nem a megfelelő időben történik meg, vagy hiányzik mellőle egy fontos irat, aláírás vagy visszaigazolható nyom."
        FocusPoints = @("A határidő és a dokumentum együtt számít.","Érdemes minden fontos biztosítói kommunikációt rendszerezetten megőrizni.","A meghatalmazás és a szerződő adatai sok ügyben sorsdöntők.","Egy rövid ellenőrzőlista hosszú késedelmet előzhet meg.")
        HeroImage = "./../img/biztor/asztal.jpg"
        FocusImage = "./../img/biztor/iroda_kint.jpg"
        HeroImageDetail = "./../../img/biztor/asztal.jpg"
        FocusImageDetail = "./../../img/biztor/iroda_kint.jpg"
        Topics = @(
            @{
                Slug = "evfordulos-valtas"
                Title = "Évfordulós váltás"
                Icon = "fa fa-calendar-alt"
                Summary = "A felmondási határidő elmulasztása gyakori hiba. Célszerű előre ellenőrizni a pontos évfordulót, felmondási módot és azt, hogy az új szerződés mikortól lép hatályba."
                Lead = "Évfordulós váltásnál a legtöbb gond abból származik, hogy a felmondás, az új kötés és a fedezet kezdete nincs megfelelően összehangolva. Ez egyszerre pénzügyi és adminisztratív kérdés."
                HeroPoints = @("Az évforduló pontos dátuma kulcskérdés.","Nem mindegy, milyen csatornán és mikor történik a felmondás.","Az új szerződés indulását a régi megszűnéséhez kell igazítani.")
                FocusHeading = "Miért kell előre készülni?"
                FocusText = "Az évfordulós ügyeknél sokszor nincs mozgástér utólag. Ha a határidő vagy a forma hibás, a váltás könnyen meghiúsulhat."
                FocusPoints = @("Ellenőrizze a jelenlegi kötvényen szereplő évfordulót.","Használjon visszaigazolható felmondási csatornát.","Az új ajánlat kiválasztását ne hagyja az utolsó napokra.","Különösen figyeljen, hogy ne legyen fedezeti rés.")
                FirstSteps = @("Keresse elő a kötvényt és nézze meg az évfordulót.","Tervezze meg a felmondást és az új kötést időben.","Őrizze meg a felmondás elküldésének bizonyítékát.")
                CommonMistakes = @("Későn derül ki a pontos évforduló.","Nincs írásos nyom a felmondás elküldéséről.","Az új szerződés kezdete nincs összhangban a megszűnéssel.")
                WhenToAskHelp = @("Ha nem egyértelmű a határidő vagy a felmondás módja.","Ha több szerződést kell egyszerre összehangolni.","Ha biztosan szeretné elkerülni a fedezeti szünetet.")
            }
            @{
                Slug = "dijnemfizetes-kovetkezmenyei"
                Title = "Díjnemfizetés következményei"
                Icon = "fa fa-exclamation-triangle"
                Summary = "Késedelmes díjfizetés esetén megszűnhet a szerződés, ami fedezetlenségi díjat és újrakötési kényszert eredményezhet. A fizetési ütemezés és értesítések figyelése létfontosságú."
                Lead = "A díjnemfizetés nem csak egy elmaradt csekk kérdése. Bizonyos biztosításoknál a szerződés megszűnhet, és a következmény utólag sokkal költségesebb lehet, mint maga a díj lett volna."
                HeroPoints = @("A biztosító figyelmeztetéseit érdemes azonnal kezelni.","A megszűnés után nem mindig egyszerű ugyanott folytatni a fedezetet.","Különösen autós szerződéseknél nőhet meg gyorsan a teher.")
                FocusHeading = "Miért veszélyes a halogatás?"
                FocusText = "Mert az elmaradt díj mellett újabb költségek és adminisztratív nehézségek is megjelenhetnek. Minél később indul a rendezés, annál nehezebb lehet visszafordítani a helyzetet."
                FocusPoints = @("A biztosító értesítéseit ne hagyja válasz nélkül.","Tisztázza, van-e még rendezési lehetőség a megszűnés előtt.","Autós biztosításoknál a fedezetlenségi következmények különösen súlyosak lehetnek.","Érdemes a fizetési módot is felülvizsgálni.")
                FirstSteps = @("Ellenőrizze, pontosan milyen tartozás és státusz szerepel a szerződésen.","Vegye fel a kapcsolatot a biztosítóval vagy közvetítővel.","Rendezze a díjat vagy kérjen pontos útmutatást a továbblépéshez.")
                CommonMistakes = @("Az értesítések figyelmen kívül maradnak.","Nincs tisztázva, megszűnt-e már a szerződés vagy még menthető.","A rendezést addig halogatja, amíg újabb költség keletkezik.")
                WhenToAskHelp = @("Ha nem egyértelmű a szerződés aktuális státusza.","Ha autós biztosításról van szó és gyorsan kell megoldás.","Ha több szerződés vagy korábbi elmaradás is érintett.")
            }
            @{
                Slug = "fedezetlensegi-dij"
                Title = "Fedezetlenségi díj"
                Icon = "fa fa-receipt"
                Summary = "A fedezet nélküli időszakra napi díj keletkezik, amely gyorsan magas összegre nőhet. Minél előbb történik a rendezés, annál kisebb lesz az utólagos pénzügyi teher."
                Lead = "A fedezetlenségi díj tipikusan olyan tétel, amivel az érintettek csak akkor szembesülnek, amikor már jelentőssé nőtt. Pedig a gyors rendezés itt tényleg komoly pénzt spórolhat."
                HeroPoints = @("A díj a fedezet nélküli napokra számolódik.","Nem elég új szerződést kötni, az előzményeket is rendezni kellhet.","Az idő ténylegesen pénzbe kerül, ezért nem érdemes várni.")
                FocusHeading = "Miért fontos az azonnali rendezés?"
                FocusText = "Mert a fedezetlenségi díj napról napra növekszik, és a helyzet utólag jellemzően már nem tehető semmissé. A legfontosabb a gyors szerződéses rendezés."
                FocusPoints = @("Tisztázza, mely időszakra áll fenn fedezetlenség.","Ne halogassa az újrakötést vagy az ügyintézést.","Őrizze meg az új szerződés és a státuszrendezés dokumentumait.","Érdemes ellenőrizni, nincs-e további kapcsolódó teendő.")
                FirstSteps = @("Kérdezze le, mettől meddig állt fenn a fedezetlenség.","Kösse meg vagy rendezze a szükséges szerződést azonnal.","Kérjen egyértelmű tájékoztatást a várható díjról és teendőkről.")
                CommonMistakes = @("Azt hiszi, az újrakötés önmagában minden korábbi problémát megold.","Nem tisztázza a fedezetlen napok pontos számát.","Túl későn kér segítséget, amikor a díj már jelentős.")
                WhenToAskHelp = @("Ha nem világos, hogyan rendezhető a helyzet a leggyorsabban.","Ha magas összegű fedezetlenségi díj várható.","Ha korábbi szerződések és megszűnések miatt bonyolultabb az ügy.")
            }
            @{
                Slug = "alkusz-es-ugynok-szerepe"
                Title = "Alkusz és ügynök szerepe"
                Icon = "fa fa-user-tie"
                Summary = "A független alkusz több biztosító ajánlatát is össze tudja vetni, míg ügynök jellemzően egy adott biztosító termékeit közvetíti. Ez közvetlenül hat a választékra és az ár/érték arányra."
                Lead = "Sokan keverik a két szerepet, pedig fontos különbséget jelenthet, hogy ki milyen piacról dolgozik és milyen választékot tud megmutatni. Ez nem értékítélet, inkább más működési logika."
                HeroPoints = @("A közvetítő típusa hat a rendelkezésre álló ajánlatokra.","Más lehet a választék, az összehasonlítás mélysége és az ügyintézés jellege.","A döntésnél érdemes tudni, ki milyen szerepben segít.")
                FocusHeading = "Miért fontos ez a gyakorlatban?"
                FocusText = "Mert ha érti, hogy a közvetítő milyen körből válogat és milyen megbízással dolgozik, könnyebben tudja értelmezni az ajánlatot és az összehasonlítást."
                FocusPoints = @("Kérdezzen rá, milyen piacról érkezik az ajánlat.","Nézze meg, történik-e valódi összehasonlítás több lehetőség között.","A közvetítői szerep az utókövetésben is számíthat.","A legjobb forma az adott ügy típusától is függhet.")
                FirstSteps = @("Tisztázza, milyen közvetítői szerepben kap ajánlatot.","Kérjen rövid magyarázatot az összehasonlítás módjáról.","Vizsgálja meg, ez mennyire felel meg az Ön döntési igényeinek.")
                CommonMistakes = @("A két szerepet teljesen azonosnak tekinti.","Nem kérdez rá, milyen körből érkeznek az ajánlatok.","Csak az első kapott ajánlatból indul ki.")
                WhenToAskHelp = @("Ha több biztosító lehetőségét szeretné átnézni egyszerre.","Ha összetettebb biztosítási igényről van szó.","Ha fontos a hosszabb távú ügyintézési támogatás is.")
            }
            @{
                Slug = "karrendezesi-dokumentumok"
                Title = "Kárrendezési dokumentumok"
                Icon = "fa fa-file-alt"
                Summary = "Jegyzőkönyv, fotók, számlák, javítási ajánlat és nyilatkozatok nélkül a kárrendezés lassulhat. A teljes dokumentumcsomag gyorsítja az elbírálást és csökkenti a hiánypótlást."
                Lead = "Sok kárigény nem azért húzódik el, mert vitás, hanem mert hiányzik belőle egy-két alapdokumentum. Egy jó dokumentumlista előre rengeteg időt tud megspórolni."
                HeroPoints = @("A fotó és a jegyzőkönyv gyakran ugyanannyira fontos, mint a számla.","A javítási ajánlat vagy szakvélemény sok helyzetben erősíti a bejelentést.","A hiánypótlás legtöbbször rendezett anyaggal megelőzhető.")
                FocusHeading = "Mit érdemes alapból összekészíteni?"
                FocusText = "A pontos lista kártípustól függ, de van néhány visszatérő elem, ami szinte minden kárrendezésnél jól jön és gyorsítja az ügyintézést."
                FocusPoints = @("Tegye egy helyre a fotókat, jegyzőkönyveket és számlákat.","A dokumentumok legyenek olvashatóak és azonosíthatóak.","Érdemes rövid összefoglalót is készíteni a káreseményről.","A dátumok és a kárhoz kapcsolódó iratok legyenek összhangban.")
                FirstSteps = @("Készítsen mappát vagy listát a szükséges iratokról.","Gyűjtse össze a fotókat, számlákat és minden helyszíni dokumentumot.","Ellenőrizze, hogy minden fájl és irat jól olvasható-e.")
                CommonMistakes = @("A dokumentumok több helyen szóródnak szét és hiányosan kerülnek beadásra.","Nincs egyértelmű kapcsolat az iratok és a káresemény között.","A hiánypótlás csak hetekkel később történik meg.")
                WhenToAskHelp = @("Ha nem világos, az adott kárhoz pontosan milyen iratok kellenek.","Ha a biztosító több körben kér további dokumentumot.","Ha szeretné az első beadást minél erősebbre összerakni.")
            }
            @{
                Slug = "meghatalmazas-es-ugyintezes"
                Title = "Meghatalmazás és ügyintézés"
                Icon = "fa fa-signature"
                Summary = "Ha nem a szerződő jár el, a megfelelő meghatalmazás elengedhetetlen. A pontosan kitöltött adatlapok és aláírások megakadályozzák az elutasított ügyintézési kéréseket."
                Lead = "Biztosítási ügyben gyakran előfordul, hogy családtag, könyvelő vagy más képviselő jár el. Ehhez viszont a legtöbb esetben pontos meghatalmazás és megfelelő aláírási háttér kell."
                HeroPoints = @("Nem minden ügy intézhető meghatalmazás nélkül.","A hiányos adat vagy aláírás könnyen visszadobott kérelemhez vezet.","Érdemes előre tisztázni, mire terjedjen ki a meghatalmazás.")
                FocusHeading = "Miért számít ennyit a forma?"
                FocusText = "Mert a biztosító csak akkor tud érdemben információt adni vagy ügyet intézni, ha a képviselet jogszerűsége egyértelmű. Ezt a formai pontosság teremti meg."
                FocusPoints = @("Legyen világos, ki ad meghatalmazást és kinek.","Tisztázza, milyen ügyekre szól a képviselet.","Ellenőrizze az aláírási és adategyezőségi követelményeket.","A személyes adatok pontossága itt is alapfeltétel.")
                FirstSteps = @("Kérje ki vagy töltse le a megfelelő meghatalmazási mintát.","Töltse ki pontosan a szerződő és a meghatalmazott adatait.","Ellenőrizze, hogy a dokumentum minden szükséges aláírást tartalmaz.")
                CommonMistakes = @("Általános, pontatlan meghatalmazás készül konkrét ügy helyett.","Hiányzik aláírás vagy személyes adat.","A biztosító által elfogadott forma nincs figyelembe véve.")
                WhenToAskHelp = @("Ha több ügyet vagy több szerződést kell képviseletben kezelni.","Ha cég, örökös vagy bonyolultabb jogosulti helyzet érintett.","Ha szeretné elkerülni a formai hiánypótlást.")
            }
            @{
                Slug = "hivatalos-ertesitesek-kezelese"
                Title = "Hivatalos értesítések kezelése"
                Icon = "fa fa-envelope-open-text"
                Summary = "A díjbekérők, felszólítások és kárügyi levelek figyelmen kívül hagyása sok későbbi vitát okoz. Célszerű külön mappában kezelni minden biztosítási kommunikációt."
                Lead = "A biztosítási ügyintézés egyik legegyszerűbb, mégis legtöbbet érő szokása az, ha minden hivatalos értesítésnek van kijelölt helye. Így a fontos határidők és üzenetek nem vesznek el a mindennapi zajban."
                HeroPoints = @("A díjbekérők és felszólítások sokszor határidőhöz kötöttek.","A kárügyi kommunikáció sorrendje később is fontos lehet.","Az e-mail és a postai levél egyaránt számíthat hivatalos értesítésnek.")
                FocusHeading = "Hogyan érdemes rendszerezni ezeket?"
                FocusText = "Egy egyszerű mappa- vagy címkerendszer sokat segít: külön a díjfizetés, külön a kárügyek, külön a szerződéses levelek. Így később gyorsan visszakereshető, mi mikor érkezett."
                FocusPoints = @("Tartsa egy helyen a biztosítóktól érkező üzeneteket.","Jelölje a határidős vagy azonnali teendőt igénylő leveleket.","Mentse el a fontos csatolmányokat külön is.","Vitás helyzetben nagy értéke van az időrendnek.")
                FirstSteps = @("Alakítson ki külön mappát a biztosítási kommunikációnak.","Rendszerezze a leveleket szerződés vagy ügytípus szerint.","A határidős értesítéseket emelje ki külön.")
                CommonMistakes = @("Az értesítések szétszóródnak több postafiók és mappa között.","A csatolmányok vagy mellékletek nem maradnak meg.","A fontos levelek csak utólag kerülnek elő, amikor már késő.")
                WhenToAskHelp = @("Ha több biztosítóval vagy több futó üggyel dolgozik egyszerre.","Ha nem egyértelmű, melyik értesítés igényel azonnali lépést.","Ha vitás helyzetben szeretne gyorsan rendet tenni a dokumentumok között.")
            }
            @{
                Slug = "szerzodeskotes-elotti-ellenorzes"
                Title = "Szerződéskötés előtti ellenőrzés"
                Icon = "fa fa-check-double"
                Summary = "A biztosítási összeg, önrész, kizárások és területi hatály gyors átnézése segít elkerülni, hogy kár esetén derüljenek ki a nem várt korlátozások."
                Lead = "A szerződéskötés előtti néhány perces ellenőrzés rengeteg későbbi félreértést előzhet meg. A fő kérdés az, hogy a választott termék valóban azt tudja-e, amire számít."
                HeroPoints = @("A fő limitek, kizárások és önrész nem maradhatnak homályban.","Fontos, hogy a biztosítási összeg reális legyen.","A különleges helyzeteknél a területi vagy használati szabályok is számítanak.")
                FocusHeading = "Mi férjen fel egy rövid ellenőrzőlistára?"
                FocusText = "Nem kell mindent végigolvasni, de néhány kulcskérdést igen: mire térít, mennyit térít, milyen önrésszel, milyen kizárások mellett, és melyik élethelyzetre illik."
                FocusPoints = @("Ellenőrizze a biztosítási összeget és a fő fedezeti elemeket.","Nézze meg az önrészt és a legfontosabb kizárásokat.","Vizsgálja meg, van-e speciális területi vagy használati korlát.","Hasonlítsa össze a szerződést a saját valós igényével.")
                FirstSteps = @("Készítsen rövid listát arról, mire keres valójában védelmet.","Az ajánlatban ellenőrizze a fő összegeket és feltételeket.","Kérdezze meg a bizonytalan pontokat még aláírás előtt.")
                CommonMistakes = @("A szerződés csak a díj alapján kerül kiválasztásra.","Az önrész és a kizárások ellenőrzése elmarad.","Utólag derül ki, hogy a választott csomag nem a valós igényre épült.")
                WhenToAskHelp = @("Ha több ajánlat közül nehéz tartalmilag választani.","Ha speciális használat, utazás vagy vagyontárgy is érintett.","Ha szeretné a szerződéskötést tudatosabb, biztosabb döntéssé tenni.")
            }
        )
    }
)

foreach ($category in $categories) {
    Render-CategoryPage -Category $category -OutputPath (Join-Path $PSScriptRoot "..\sites\$($category.FileName)")

    foreach ($topic in $category.Topics) {
        Render-TopicPage -Category $category -Topic $topic -OutputPath (Join-Path $PSScriptRoot "..\sites\infok\$($topic.Slug).html")
    }
}

$sitemap = Build-Sitemap -RootPath (Resolve-Path (Join-Path $PSScriptRoot '..'))
Write-Utf8NoBom -Path (Join-Path $PSScriptRoot '..\sitemap.xml') -Content $sitemap
