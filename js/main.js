(function ($) {
  "use strict";

  // Spinner
  var spinner = function () {
    setTimeout(function () {
      if ($("#spinner").length > 0) {
        $("#spinner").removeClass("show");
      }
    }, 1);
  };
  spinner();

  // WOW.js – csak ha be van töltve a könyvtár
  if (typeof WOW !== "undefined") {
    new WOW().init();
  }

  // Sticky Navbar – shadow when scrolled, no top manipulation (CSS handles sticky)
  $(window).scroll(function () {
    if ($(this).scrollTop() > 50) {
      $(".insure-navbar").addClass("shadow-sm");
    } else {
      $(".insure-navbar").removeClass("shadow-sm");
    }
  });

  // Back to top button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $(".back-to-top").fadeIn("slow");
    } else {
      $(".back-to-top").fadeOut("slow");
    }
  });

  $(".back-to-top").click(function () {
    $("html, body").animate({ scrollTop: 0 }, 1500, "easeInOutExpo");
    return false;
  });

  // Facts counter
  if ($('[data-toggle="counter-up"]').length) {
    $('[data-toggle="counter-up"]').counterUp({
      delay: 10,
      time: 2000,
    });
  }

  // Testimonials carousel
  if ($(".testimonial-carousel").length) {
    $(".testimonial-carousel").owlCarousel({
      autoplay: true,
      smartSpeed: 1000,
      items: 1,
      dots: false,
      loop: true,
      nav: true,
      navText: [
        '<i class="bi bi-chevron-left"></i>',
        '<i class="bi bi-chevron-right"></i>',
      ],
    });
  }
})(jQuery);

// Navbar összehúzás nagy képernyőre váltáskor
(function () {
  const collapseEl = document.getElementById("insureNavbarCollapse");
  if (!collapseEl) return;

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 992 && collapseEl.classList.contains("show")) {
      const collapseInstance = bootstrap.Collapse.getOrCreateInstance(
        collapseEl
      );
      if (collapseInstance) {
        collapseInstance.hide();
      }
    }
  });
})();

// További szolgáltatások gomb működése
const toggleBtn = document.getElementById("toggle-services");
if (toggleBtn) {
  toggleBtn.addEventListener("click", function () {
    const hiddenServices = document.getElementById("hidden-services");
    const toggleText = document.getElementById("toggle-text");
    const toggleIcon = toggleBtn.querySelector("ion-icon");

    if (hiddenServices && toggleText) {
      if (hiddenServices.classList.contains("d-none")) {
        hiddenServices.classList.remove("d-none");
        toggleText.textContent = "Kevesebb szolgáltatás";
        if (toggleIcon) {
          toggleIcon.classList.add("rotate-180");
        }
      } else {
        hiddenServices.classList.add("d-none");
        toggleText.textContent = "További szolgáltatások";
        if (toggleIcon) {
          toggleIcon.classList.remove("rotate-180");
        }
      }
    }
  });
}

// EmailJS inicializálás
(function () {
  if (typeof emailjs !== "undefined") {
    emailjs.init("_3PCXoqte_nDLYPSF"); // Saját publikus kulcs
  }
})();

// Visszajelzés megjelenítése
function showResponse(message, type = "success") {
  const responseBox = document.getElementById("form-response");
  if (!responseBox) return;

  responseBox.textContent = message;
  responseBox.classList.remove(
    "d-none",
    "alert-success",
    "alert-danger",
    "fade-visible"
  );
  responseBox.classList.add(`alert-${type}`);

  setTimeout(() => {
    responseBox.classList.add("fade-visible");
  }, 10);

  setTimeout(() => {
    responseBox.classList.remove("fade-visible");
  }, 5000);
}

// Email küldés gombra
const submitBtn = document.getElementById("submit-link");
if (submitBtn) {
  submitBtn.addEventListener("click", function (e) {
    e.preventDefault();

    const form = document.getElementById("contact-form");
    if (!form) return;

    if (!form.checkValidity()) {
      showResponse("Kérem, töltsön ki minden kötelező mezőt!", "danger");
      form.reportValidity();
      return;
    }

    emailjs
      .sendForm("service_3qhvahx", "template_ucqlkw8", form)
      .then(() => {
        showResponse("Üzenetét megkaptuk – hamarosan visszakeressük.", "success");
        form.reset();
      })
      .catch((error) => {
        console.error("Hiba:", error);
        showResponse(
          "Az üzenet küldése nem sikerült. Kérjük, próbálja meg újra.",
          "danger"
        );
      });
  });
}
document.addEventListener("DOMContentLoaded", function () {
  const tabBtns = document.querySelectorAll("[data-tab]");
  const tabContents = document.querySelectorAll(".tab-content");

  // Hide inactive forms initially
  tabContents.forEach((content) => {
    if (!content.classList.contains("active")) {
      content.style.display = "none";
    }
  });

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Handle button states
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Handle form display
      const targetId = btn.getAttribute("data-tab") + "Form";

      tabContents.forEach((content) => {
        if (content.id === targetId) {
          // Fade in selected form
          content.style.display = "block";
          content.style.opacity = "0";
          setTimeout(() => {
            content.style.opacity = "1";
          }, 50);
        } else {
          // Hide other form
          content.style.display = "none";
        }
      });
    });
  });
});

// Form validation
(function () {
  "use strict";
  var forms = document.querySelectorAll(".needs-validation");
  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });
})();

// File upload validation
const fileInputs = document.querySelectorAll('input[type="file"]');
if (fileInputs.length) {
  fileInputs.forEach((fileInput) => {
    fileInput.addEventListener("change", function () {
      if (this.files.length > 8) {
        alert("Maximum 8 fájlt tölthet fel!");
        this.value = "";
      }

      Array.from(this.files).forEach((file) => {
        if (file.size > 4 * 1024 * 1024) {
          alert("A fájl mérete nem lehet nagyobb 4 MB-nál: " + file.name);
          this.value = "";
        }
      });
    });
  });
}

// Add this at the end of the file

// Timeline animation
document.addEventListener("DOMContentLoaded", function () {
  const timelineItems = document.querySelectorAll(".timeline-item");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  timelineItems.forEach((item) => {
    observer.observe(item);
  });
});

// Service type filter initialization
document.addEventListener("DOMContentLoaded", function () {
  const filterButtons = document.querySelectorAll("[data-filter]");
  const serviceItems = document.querySelectorAll(".service-card");
  const container = document.querySelector(".row.g-4");

  // Set initial container properties
  if (container) {
    container.style.display = "flex";
    container.style.flexWrap = "wrap";
    container.classList.remove("justify-content-center");
    container.classList.add("justify-content-start");
  }

  // Function to apply filter
  function applyFilter(filterValue) {
    filterButtons.forEach((btn) => {
      if (btn.getAttribute("data-filter") === filterValue) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Remove all animations first
    serviceItems.forEach((item) => {
      item.classList.remove("fadeInUp", "wow", "animated");
    });

    // Show/hide items and reset animations
    let visibleCount = 0;
    serviceItems.forEach((item) => {
      const itemTypes = item.getAttribute("data-type").split(" ");
      if (itemTypes.includes(filterValue)) {
        item.style.display = "block";
        const delay = (visibleCount * 0.2).toFixed(1);
        item.style.animationDelay = `${delay}s`;
        item.classList.add("fadeInUp", "animated");
        visibleCount++;
      } else {
        item.style.display = "none";
      }
    });

    // Save state
    sessionStorage.setItem("activeFilter", filterValue);
    window.location.hash = filterValue;
  }

  // Check URL hash or session storage for initial state
  let initialFilter =
    window.location.hash.replace("#", "") ||
    sessionStorage.getItem("activeFilter") ||
    "personal";

  // Apply initial filter
  applyFilter(initialFilter);

  // Filter button click handlers
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const filterValue = this.getAttribute("data-filter");
      applyFilter(filterValue);
    });
  });

  // Listen for hash changes
  window.addEventListener("hashchange", function () {
    const newFilter = window.location.hash.replace("#", "") || "personal";
    applyFilter(newFilter);
  });
});

// Initialize contact form to show Personal form by default
function initializeContactForm() {
  const personalForm = document.getElementById("personal-form");
  const corporateForm = document.getElementById("corporate-form");
  const personalBtn = document.querySelector('[data-filter="personal"]');
  const corporateBtn = document.querySelector('[data-filter="corporate"]');

  if (personalForm && corporateForm && personalBtn && corporateBtn) {
    // Ensure Personal form is visible and Corporate form is hidden
    personalForm.style.opacity = "1";
    personalForm.style.zIndex = "2";
    personalForm.style.transform = "translateY(0)";

    corporateForm.style.opacity = "0";
    corporateForm.style.zIndex = "1";
    corporateForm.style.transform = "translateY(20px)";

    // Ensure correct button states
    personalBtn.classList.add("active");
    corporateBtn.classList.remove("active");
  }
}

// Call initialization when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeContactForm();
});

// Lead magnet form handler (.needs-validation forms that POST to /api/forms/)
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('form.needs-validation[action^="/api/forms/"]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!form.checkValidity()) {
          form.classList.add('was-validated');
          return;
        }
        form.classList.add('was-validated');
        var submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.dataset.orig = submitBtn.textContent;
          submitBtn.textContent = 'Küldés…';
        }
        var data = {};
        new FormData(form).forEach(function (v, k) { data[k] = v; });
        fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        .then(function (r) { return r.json(); })
        .then(function (json) {
          if (!json.ok) throw new Error(json.message || 'Hiba történt.');
          form.style.display = 'none';
          var thanks = document.getElementById('leadMagnetThanks');
          if (thanks) {
            thanks.classList.remove('d-none');
          } else {
            var msg = document.createElement('p');
            msg.className = 'alert alert-success mt-3';
            msg.textContent = json.message || 'Köszönjük! Hamarosan elküldjük az útmutatót.';
            form.parentNode.insertBefore(msg, form.nextSibling);
          }
        })
        .catch(function (err) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.orig || 'Elküldöm';
          }
          var errEl = form.querySelector('.lead-magnet-error');
          if (!errEl) {
            errEl = document.createElement('p');
            errEl.className = 'lead-magnet-error alert alert-danger mt-2';
            form.appendChild(errEl);
          }
          errEl.textContent = (err && err.message) || 'Hiba történt. Kérjük, próbálja újra.';
        });
      }, true);
    });
  });
}());

function switchForm(type) {
  const personalForm = document.getElementById("personal-form");
  const corporateForm = document.getElementById("corporate-form");
  const personalBtn = document.querySelector('[data-filter="personal"]');
  const corporateBtn = document.querySelector('[data-filter="corporate"]');

  // Bal oldali elemek
  const contactTitle = document.getElementById("contact-title");
  const contactDescription = document.getElementById("contact-description");
  const contactPhoneContainer = document.getElementById(
    "contact-phone-container"
  );
  const contactPhoneLink = document.getElementById("contact-phone-link");

  if (!personalForm || !corporateForm || !personalBtn || !corporateBtn) {
    console.error("Form elements not found");
    return;
  }

  if (type === "personal") {
    // Personal form aktív
    personalForm.style.opacity = "1";
    personalForm.style.zIndex = "2";
    personalForm.style.transform = "translateY(0)";

    corporateForm.style.opacity = "0";
    corporateForm.style.zIndex = "1";
    corporateForm.style.transform = "translateY(20px)";

    // Button állapotok
    personalBtn.classList.add("active");
    corporateBtn.classList.remove("active");

    // Egyszerű szöveg váltás - NINCS WOW animáció
    if (contactTitle && contactDescription && contactPhoneContainer) {
      // Fade out
      contactTitle.style.opacity = "0";
      contactDescription.style.opacity = "0";
      contactPhoneContainer.style.opacity = "0";

      setTimeout(() => {
        // Szövegek cseréje
        contactTitle.textContent = "Biztosítás, ahogy Önnek kényelmes";
        contactDescription.textContent =
          "Személyre szabott biztosítási megoldásokat kínálunk – gyorsan, érthetően, rejtett költségek nélkül. Legyen szó gépjárműről, lakásról, vállalkozásról vagy nyugdíjról, nálunk mindig az Ön érdeke az első. Kérjen időpontot, és segítünk megtalálni a legjobb megoldást!";
        contactPhoneLink.textContent = "Hívjon minket: +36 70 625 8201";
        contactPhoneLink.href = "tel:+36706258201";

        // Fade in
        contactTitle.style.opacity = "1";
        contactDescription.style.opacity = "1";
        contactPhoneContainer.style.opacity = "1";
      }, 200);
    }
  } else {
    // Corporate form aktív
    personalForm.style.opacity = "0";
    personalForm.style.zIndex = "1";
    personalForm.style.transform = "translateY(20px)";

    corporateForm.style.opacity = "1";
    corporateForm.style.zIndex = "2";
    corporateForm.style.transform = "translateY(0)";

    // Button állapotok
    corporateBtn.classList.add("active");
    personalBtn.classList.remove("active");

    // Egyszerű szöveg váltás - NINCS WOW animáció
    if (contactTitle && contactDescription && contactPhoneContainer) {
      // Fade out
      contactTitle.style.opacity = "0";
      contactDescription.style.opacity = "0";
      contactPhoneContainer.style.opacity = "0";

      setTimeout(() => {
        // Szövegek cseréje
        contactTitle.textContent = "Vállalati konzultáció időpontfoglalás";
        contactDescription.textContent =
          "Szeretettel várjuk irodánkban személyes konzultációra! Foglaljon időpontot, és kollégánk készséggel áll rendelkezésére a cégre szabott biztosítási megoldásokkal kapcsolatban.";
        contactPhoneLink.textContent = "Időpont egyeztetés: +36 70 319 6501";
        contactPhoneLink.href = "tel:+36703196501";

        // Fade in
        contactTitle.style.opacity = "1";
        contactDescription.style.opacity = "1";
        contactPhoneContainer.style.opacity = "1";
      }, 200);
    }
  }
}

// Enhanced input sanitization and validation helpers
document.addEventListener("DOMContentLoaded", function () {
  const isValidISODate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(value);
    if (
      Number.isNaN(year) ||
      Number.isNaN(month) ||
      Number.isNaN(day) ||
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() + 1 !== month ||
      date.getUTCDate() !== day
    ) {
      return false;
    }
    return year >= 1900 && year <= 2100;
  };

  const sanitizeValue = (value, allowedRegexp) => {
    if (!value) return "";
    const matches = value.match(allowedRegexp);
    return matches ? matches.join("") : "";
  };

  const applyFormatter = (
    selector,
    allowedRegexp,
    validator,
    message,
    inputMode = "numeric"
  ) => {
    const inputs = document.querySelectorAll(selector);
    if (!inputs.length) return;

    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        const sanitized = sanitizeValue(input.value, allowedRegexp);
        if (input.value !== sanitized) {
          input.value = sanitized;
        }
        input.setCustomValidity("");
      });

      input.addEventListener("blur", () => {
        const value = input.value.trim();
        if (!value) {
          input.setCustomValidity("");
          return;
        }
        if (!validator(value)) {
          input.setCustomValidity(message);
        } else {
          input.setCustomValidity("");
        }
      });

      if (!input.hasAttribute("inputmode")) {
        input.setAttribute("inputmode", inputMode);
      }
    });
  };

  const dateInputs = document.querySelectorAll('input[type="date"]');
  dateInputs.forEach((input) => {
    if (!input.hasAttribute("min")) {
      input.setAttribute("min", "1900-01-01");
    }
    if (!input.hasAttribute("max")) {
      input.setAttribute("max", "2100-12-31");
    }
    input.setAttribute("pattern", "\\d{4}-\\d{2}-\\d{2}");
    input.setAttribute("title", "Érvényes dátum formátum: ÉÉÉÉ-HH-NN");

    input.addEventListener("input", () => {
      const sanitized = sanitizeValue(input.value, /[0-9-]/g).slice(0, 10);
      if (input.value !== sanitized) {
        input.value = sanitized;
      }
      input.setCustomValidity("");
    });

    input.addEventListener("blur", () => {
      const value = input.value.trim();
      if (!value) {
        input.setCustomValidity("");
        return;
      }
      if (!isValidISODate(value)) {
        input.setCustomValidity("Érvényes dátumot adjon meg (ÉÉÉÉ-HH-NN).");
      } else {
        input.setCustomValidity("");
      }
    });
  });

  applyFormatter(
    'input[type="tel"], input[id$="Phone"], input[name$="[phone]"]',
    /[0-9+\s-]/g,
    (value) => value.replace(/\s|-/g, "").length >= 7 && /^\+?[0-9\s-]+$/.test(value),
    "Csak számok, szóköz és + jel használható, legalább 7 karakter.",
    "tel"
  );

  applyFormatter(
    'input[id$="Zip"], input[name$="[zip]"]',
    /[0-9]/g,
    (value) => value.length === 4,
    "Az irányítószám 4 számjegyből áll."
  );

  applyFormatter(
    'input[type="number"], input[data-numeric="true"]',
    /[0-9]/g,
    (value) => /^\d+$/.test(value),
    "Csak egész szám adható meg."
  );

  applyFormatter(
    'input[id$="Tax"], input[name$="[taxNo]"]',
    /[0-9-]/g,
    (value) => /^\d{8}-\d-\d{2}$/.test(value),
    "Adószám formátum: 12345678-1-23."
  );
});
 // Sütik kezelése – saját localStorage implementáció (CDN flash-mentes)
(function () {
  var CONSENT_KEY = "biztor_cookie_consent";

  function hasConsent() {
    return localStorage.getItem(CONSENT_KEY) === "accepted";
  }

  function hasDenied() {
    return localStorage.getItem(CONSENT_KEY) === "denied";
  }

  function setConsent(value) {
    localStorage.setItem(CONSENT_KEY, value);
  }

  function removeBanner() {
    var banner = document.getElementById("biztor-cookie-banner");
    if (banner) {
      banner.classList.remove("is-visible");
      banner.classList.add("is-hiding");
      setTimeout(function () { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 350);
    }
  }
  function createBanner() {
    var banner = document.createElement("div");
    var inner = document.createElement("div");
    var message = document.createElement("p");
    var link = document.createElement("a");
    var actions = document.createElement("div");
    var acceptButton = document.createElement("button");
    var denyButton = document.createElement("button");

    banner.id = "biztor-cookie-banner";
    banner.className = "biztor-cookie-banner";

    inner.className = "biztor-cookie-banner__inner";
    message.className = "biztor-cookie-banner__message";
    actions.className = "biztor-cookie-banner__actions";

    message.appendChild(document.createTextNode("Az oldal sütiket használ az élmény javítása érdekében. "));
    link.href = "/adatkezeles";
    link.textContent = "További információk";
    message.appendChild(link);

    acceptButton.id = "biztor-cookie-accept";
    acceptButton.className = "biztor-cookie-banner__button biztor-cookie-banner__button--accept";
    acceptButton.type = "button";
    acceptButton.textContent = "Elfogadom";

    denyButton.id = "biztor-cookie-deny";
    denyButton.className = "biztor-cookie-banner__button biztor-cookie-banner__button--deny";
    denyButton.type = "button";
    denyButton.textContent = "Elutasítom";

    actions.appendChild(acceptButton);
    actions.appendChild(denyButton);
    inner.appendChild(message);
    inner.appendChild(actions);
    banner.appendChild(inner);
    document.body.appendChild(banner);
    // Megjelenítés animációval (1 frame késleltetés a transition-hoz)
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        banner.classList.add("is-visible");
      });
    });

    document.getElementById("biztor-cookie-accept").addEventListener("click", function () {
      setConsent("accepted");
      removeBanner();
      loadAnalyticsIfConsented();
    });

    document.getElementById("biztor-cookie-deny").addEventListener("click", function () {
      setConsent("denied");
      removeBanner();
    });
  }

  // Csak akkor mutatunk bannert, ha még nincs döntés – NINCS flash
  if (!hasConsent() && !hasDenied()) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", createBanner);
    } else {
      createBanner();
    }
  } else if (hasConsent()) {
    // Már elfogadva: Analytics azonnal betöltődik, semmi vizuális
    document.addEventListener("DOMContentLoaded", function () { loadAnalyticsIfConsented(); });
  }
})();
  // Analytics betöltése csak ha hozzájárult
  function loadAnalyticsIfConsented() {
    if (localStorage.getItem("biztor_cookie_consent") === "accepted") {
      var script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=G-4VN26GCTXE";
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      window.gtag = gtag;
      gtag("js", new Date());
      gtag("config", "G-4VN26GCTXE");
    }
  }

  // Biztonság kedvéért késleltetve újrapróbáljuk
  window.addEventListener("load", function () {
    setTimeout(loadAnalyticsIfConsented, 500);
  });

document.addEventListener("DOMContentLoaded", function () {
  const apiForms = document.querySelectorAll('form[action^="/api/forms/"]:not(.msf-form)');
  if (!apiForms.length) {
    return;
  }

  const apiBase = getApiBase();

  initOptionalFormDetails();

  apiForms.forEach((form) => {
    const statusBox = ensureStatusBox(form);

    form.addEventListener("submit", async (event) => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add("was-validated");
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        if (!submitBtn.dataset.originalText) {
          submitBtn.dataset.originalText = submitBtn.textContent;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = "Küldés...";
      }

      setStatus(statusBox, "Küldés folyamatban...", "info");

      try {
        const payload = buildJsonPayload(form);
        const endpoint = new URL(form.getAttribute("action"), apiBase);

        const response = await fetch(endpoint.toString(), {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify(payload),
        });

        let result = {};
        try {
          result = await response.json();
        } catch (parseError) {
          result = {};
        }

        if (!response.ok || result.ok === false) {
          const message =
            result.message || "Nem sikerült elküldeni az űrlapot.";
          throw new Error(message);
        }

        setStatus(
          statusBox,
          result.message ||
            "Köszönjük! Hamarosan felvesszük Önnel a kapcsolatot.",
          "success"
        );
        form.reset();
        form.classList.remove("was-validated");
      } catch (error) {
        console.error("Űrlap beküldési hiba:", error);
        setStatus(
          statusBox,
          getSubmitErrorMessage(error) ||
            "Nem sikerült elküldeni az űrlapot. Kérjük, próbálja meg később.",
          "danger"
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          if (submitBtn.dataset.originalText !== undefined) {
            submitBtn.textContent = submitBtn.dataset.originalText;
          }
        }
      }
    });
  });

  function initOptionalFormDetails() {
    document.querySelectorAll(".optional-form-details").forEach((details) => {
      const controls = Array.from(
        details.querySelectorAll("input, select, textarea")
      );

      function syncDisabledState() {
        controls.forEach((control) => {
          control.disabled = !details.open;
        });
      }

      details.addEventListener("toggle", syncDisabledState);
      syncDisabledState();
    });
  }

  function buildJsonPayload(form) {
    const formData = new FormData(form);
    const payload = {};

    formData.forEach((value, fieldName) => {
      const normalizedValue = normalizeValue(value);
      if (normalizedValue === null || normalizedValue === undefined) {
        return;
      }

      const pathSegments = parseFieldPath(fieldName);
      applyPath(payload, pathSegments, normalizedValue);
    });

    return payload;
  }

  function getApiBase() {
    const meta = document.querySelector('meta[name="biztor-api-base"]');
    const explicitBase =
      window.__BIZTOR_API_BASE__ || (meta ? meta.getAttribute("content") : "");

    if (explicitBase) {
      return explicitBase;
    }

    const { hostname, protocol } = window.location;
    const isLocal =
      protocol === "file:" ||
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1";

    return isLocal
      ? "http://127.0.0.1:3000"
      : "https://biztor.hu";
  }

  function getSubmitErrorMessage(error) {
    if (error && error.name === "TypeError" && /fetch/i.test(error.message || "")) {
      return "Nem \u00e9rhet\u0151 el az \u0171rlap-kiszolg\u00e1l\u00f3. Lok\u00e1lis tesztn\u00e9l ind\u00edtsa el a backend szervert az npm start paranccsal, majd a http://127.0.0.1:3000 oldalt nyissa meg.";
    }

    return error && error.message;
  }

  function normalizeValue(value) {
    if (value instanceof File) {
      if (!value.name) {
        return null;
      }

      const size = formatFileSize(value.size);
      const typeLabel = value.type ? `, ${value.type}` : "";
      return `${value.name} (${size}${typeLabel})`;
    }

    if (value === "on") {
      return true;
    }

    return value;
  }

  function formatFileSize(bytes) {
    if (!bytes) {
      return "0 B";
    }

    const units = ["B", "KB", "MB", "GB"];
    const unitIndex = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    );
    const size = bytes / Math.pow(1024, unitIndex);
    return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }

  function parseFieldPath(name) {
    const segments = [];
    const pattern = /([^\[\]]+)|\[(.*?)\]/g;
    let match;
    let lastToken = null;

    while ((match = pattern.exec(name)) !== null) {
      if (match[1]) {
        const token = { key: match[1], isArray: false };
        segments.push(token);
        lastToken = token;
      } else if (match[2] === "") {
        if (lastToken) {
          lastToken.isArray = true;
        }
      } else {
        const token = { key: match[2], isArray: false };
        segments.push(token);
        lastToken = token;
      }
    }

    return segments;
  }

  function applyPath(target, segments, value) {
    if (!segments.length) {
      return;
    }

    let current = target;

    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      const isLast = index === segments.length - 1;
      const key = segment.key;

      if (isLast) {
        if (segment.isArray) {
          if (!Array.isArray(current[key])) {
            current[key] = [];
          }
          current[key].push(value);
        } else if (current[key] !== undefined) {
          if (!Array.isArray(current[key])) {
            current[key] = [current[key]];
          }
          current[key].push(value);
        } else {
          current[key] = value;
        }
      } else if (segment.isArray) {
        if (!Array.isArray(current[key])) {
          current[key] = [];
        }

        let container = current[key][current[key].length - 1];
        if (!container || typeof container !== "object" || Array.isArray(container)) {
          container = {};
          current[key].push(container);
        }

        current = container;
      } else {
        if (
          current[key] === undefined ||
          typeof current[key] !== "object" ||
          Array.isArray(current[key])
        ) {
          current[key] = {};
        }

        current = current[key];
      }
    }
  }

  function ensureStatusBox(form) {
    let box = form.querySelector(".form-status-message");
    if (!box) {
      box = document.createElement("div");
      box.className = "alert form-status-message d-none mt-3";
      form.appendChild(box);
    }
    return box;
  }

  function setStatus(box, message, level) {
    box.textContent = message;
    box.className = `alert form-status-message mt-3 alert-${level}`;
  }
});

// const script = document.createElement('script');
//   script.src = 'https://chat.biztorszerver.synology.me/assets/modules/channel-web/inject.js';
//   script.onload = () => {
//     window.botpressWebChat.init({
//       host: 'https://chat.biztorszerver.synology.me',
//       botId: 'biztor-chatbot',
//       locale: 'hu',
//     });
//   };
//   document.head.appendChild(script);

(function () {
  function getSiteRootUrl() {
    const mainScript = Array.from(document.scripts).find((script) =>
      /\/js\/main\.js(?:[?#].*)?$/i.test((script.src || "").replace(/\\/g, "/"))
    );

    if (mainScript && mainScript.src) {
      return new URL("../", mainScript.src);
    }

    return new URL("./", window.location.href);
  }

  function getCurrentPageLabel() {
    const title = document.title.split("|")[0].trim();
    if (title) {
      return title;
    }

    const heading = document.querySelector("h1");
    return heading ? heading.textContent.trim() : "";
  }

  function buildBreadcrumbItems(siteRootUrl) {
    const pathName = window.location.pathname.replace(/\\/g, "/").toLowerCase();
    const segments = pathName.split("/").filter(Boolean);
    const fileName = segments[segments.length - 1] || "";
    const parentFolder = segments[segments.length - 2] || "";
    const currentLabel = getCurrentPageLabel();

    if (!fileName || fileName === "index.html" || fileName === "404.html") {
      return [];
    }

    const items = [
      {
        label: "Kezdőlap",
        href: new URL("index.html", siteRootUrl).href,
      },
    ];

    const topLevelPages = new Set([
      "rolunk.html",
      "kapcsolat.html",
      "impresszum.html",
      "panasz.html",
      "torveny2023.html",
      "szolgaltatasok.html",
      "infok.html",
    ]);

    const infoCategoryPages = new Set([
      "info-gepjarmu.html",
      "info-ingatlan.html",
      "info-utazas-elet.html",
      "info-adminisztracio.html",
    ]);

    if (parentFolder === "infok") {
      items.push({
        label: "Infók",
        href: new URL("sites/infok.html", siteRootUrl).href,
      });
      return items;
    }

    if (parentFolder === "ajanlatok") {
      items.push({
        label: "Biztosítások",
        href: new URL("sites/szolgaltatasok.html", siteRootUrl).href,
      });
      items.push({
        label: "Ajánlatkérés",
      });
      items.push({
        label: currentLabel,
      });
      return items;
    }

    if (fileName === "infok.html") {
      items.push({ label: currentLabel });
      return items;
    }

    if (infoCategoryPages.has(fileName)) {
      items.push({
        label: "Infók",
        href: new URL("sites/infok.html", siteRootUrl).href,
      });
      items.push({ label: currentLabel });
      return items;
    }

    if (topLevelPages.has(fileName)) {
      items.push({ label: currentLabel });
      return items;
    }

    if (segments.includes("sites")) {
      items.push({
        label: "Biztosítások",
        href: new URL("sites/szolgaltatasok.html", siteRootUrl).href,
      });
      items.push({ label: currentLabel });
      return items;
    }

    return [];
  }

  function styleBreadcrumbNav(navElement) {
    navElement.classList.add("mb-4");
    navElement.setAttribute("aria-label", "breadcrumb");
    navElement.style.setProperty("--bs-breadcrumb-divider", '"›"');

    let list = navElement.querySelector("ol");
    if (!list) {
      list = document.createElement("ol");
      navElement.appendChild(list);
    }

    list.className = "breadcrumb mb-0 small";

    list.querySelectorAll(".breadcrumb-item a").forEach((link) => {
      link.classList.add("text-decoration-none");
    });

    const activeItem = list.querySelector(".breadcrumb-item.active");
    if (activeItem) {
      activeItem.classList.add("fw-semibold");
    }
  }

  function renderBreadcrumbList(items) {
    const nav = document.createElement("nav");
    const list = document.createElement("ol");

    items.forEach((item, index) => {
      const listItem = document.createElement("li");
      const isLast = index === items.length - 1;

      listItem.className = isLast
        ? "breadcrumb-item active fw-semibold"
        : "breadcrumb-item";

      if (isLast || !item.href) {
        listItem.setAttribute("aria-current", "page");
        listItem.textContent = item.label;
      } else {
        const link = document.createElement("a");
        link.href = item.href;
        link.className = "text-decoration-none";
        link.textContent = item.label;
        listItem.appendChild(link);
      }

      list.appendChild(listItem);
    });

    nav.appendChild(list);
    styleBreadcrumbNav(nav);
    return nav;
  }

  function insertBreadcrumb(navElement) {
    const heading = document.querySelector("h1");
    if (!heading) {
      return;
    }

    const container = heading.closest(".container");
    if (!container) {
      return;
    }

    let insertBefore = heading;
    while (insertBefore.parentElement && insertBefore.parentElement !== container) {
      insertBefore = insertBefore.parentElement;
    }

    container.insertBefore(navElement, insertBefore);
  }

  function ensureHomeLink(navElement, siteRootUrl) {
    const list = navElement.querySelector("ol");
    if (!list) {
      return;
    }

    const firstItem = list.querySelector(".breadcrumb-item");
    const firstLabel = firstItem ? firstItem.textContent.trim() : "";

    if (firstLabel === "Kezdőlap") {
      return;
    }

    const homeItem = document.createElement("li");
    const homeLink = document.createElement("a");

    homeItem.className = "breadcrumb-item";
    homeLink.href = new URL("index.html", siteRootUrl).href;
    homeLink.className = "text-decoration-none";
    homeLink.textContent = "Kezdőlap";
    homeItem.appendChild(homeLink);

    list.insertBefore(homeItem, list.firstChild);
  }

  document.addEventListener("DOMContentLoaded", function () {
    const siteRootUrl = getSiteRootUrl();
    const existingNav = document.querySelector('nav[aria-label="breadcrumb"]');

    if (existingNav) {
      ensureHomeLink(existingNav, siteRootUrl);
      styleBreadcrumbNav(existingNav);
      return;
    }

    const items = buildBreadcrumbItems(siteRootUrl);
    if (items.length < 2) {
      return;
    }

    insertBreadcrumb(renderBreadcrumbList(items));
  });
})();

// Navbar scroll effect
(function () {
  var navbar = document.querySelector('.insure-navbar');
  if (!navbar) return;
  function onScroll() {
    navbar.classList.toggle('nav-scrolled', window.scrollY > 50);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Tudásellenőrző teszt – interaktív kvíz logika
document.addEventListener('DOMContentLoaded', function () {

  function getQuizSection(card) {
    // Walk up to find the closest row that contains all quiz cards in the section
    var el = card.parentElement;
    while (el) {
      if (el.classList.contains('row') && el.querySelector('.quiz-option')) return el;
      el = el.parentElement;
    }
    return null;
  }

  function checkSectionComplete(section) {
    if (!section) return;
    var cards = section.querySelectorAll('.service-item');
    var answered = 0, correct = 0, total = cards.length;
    cards.forEach(function (c) {
      if (c.querySelector('.quiz-option[disabled]')) {
        answered++;
        if (c.querySelector('.quiz-option-correct')) correct++;
      }
    });
    if (answered < total) return; // not all answered yet

    // Remove existing result box if re-rendered
    var existingResult = section.parentElement ? section.parentElement.querySelector('.quiz-result-box[data-for-section]') : null;
    // Insert result box after section
    var pct = Math.round((correct / total) * 100);
    var grade, gradeClass;
    if (pct >= 80) { grade = 'Kiváló! 🎉'; gradeClass = 'quiz-result-excellent'; }
    else if (pct >= 50) { grade = 'Jó eredmény! 👍'; gradeClass = 'quiz-result-good'; }
    else { grade = 'Érdemes ismételni. 📖'; gradeClass = 'quiz-result-poor'; }

    var box = document.createElement('div');
    box.className = 'quiz-result-box ' + gradeClass;
    box.setAttribute('data-for-section', '1');
    box.innerHTML =
      '<div class="quiz-result-inner">' +
        '<div class="quiz-result-score">' + correct + ' / ' + total + '</div>' +
        '<div class="quiz-result-grade">' + grade + '</div>' +
        '<div class="quiz-result-pct">' + pct + '% helyes válasz</div>' +
      '</div>';
    section.insertAdjacentElement('afterend', box);
  }

  document.querySelectorAll('.quiz-option').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var optionsDiv = this.parentElement;
      var card = optionsDiv.closest('.service-item');
      if (!card) return;
      // Already answered?
      if (optionsDiv.querySelector('.quiz-option[disabled]')) return;

      var isCorrect = this.dataset.correct === 'true';

      // Disable all options
      optionsDiv.querySelectorAll('.quiz-option').forEach(function (b) {
        b.disabled = true;
        b.style.cursor = 'default';
        b.classList.remove('btn-outline-secondary');
      });

      // Colour buttons with premium classes
      if (isCorrect) {
        this.classList.add('quiz-option-correct');
      } else {
        this.classList.add('quiz-option-wrong');
        optionsDiv.querySelectorAll('.quiz-option[data-correct="true"]').forEach(function (b) {
          b.classList.add('quiz-option-correct');
        });
      }

      // Reveal the explanation with smooth fade
      var expl = card.querySelector('.quiz-explanation');
      if (expl) {
        expl.classList.remove('d-none');
        expl.classList.add('quiz-explanation-visible');
      }

      // Check if the whole section is now answered
      var section = getQuizSection(card);
      checkSectionComplete(section);
    });
  });
});