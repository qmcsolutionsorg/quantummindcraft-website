/* QuantrolPlus — landing page interactions */
(function () {
  "use strict";

  // Current year in footer
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Navbar background on scroll
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 20) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu toggle
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Close menu when a link is tapped
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ===================================================================
     FEATURES AND THEIR MODULES
     ---------------------------------------------------------------
     Each feature is a section on the page; each module is a button in
     that section. A module with an empty slides array renders as a
     disabled "soon" chip, so the site never shows a broken image.

     To add screens: drop images in public/assets/images/screens/<any>/
     and list them under the right module below.
     =================================================================== */
  var ICONS = {
    growth: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    family: "M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-8 0a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-2.7 0-8 1.34-8 4v3h8v-3c0-1 .38-1.9 1-2.6A9 9 0 0 0 8 13zm8 0a10 10 0 0 0-1.6.13c1.1.9 1.6 2 1.6 2.87v3h8v-3c0-2.66-5.3-4-8-4z",
    business: "M10 4h4a2 2 0 0 1 2 2v1h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3V6a2 2 0 0 1 2-2zm0 3h4V6h-4v1z",
    health: "M12 21s-6.7-4.35-9.33-8.5C.9 9.5 2 6 5 6c1.9 0 3 1 3.7 2 .8-1 1.8-2 3.3-2 3 0 4.1 3.5 2.33 6.5C18.7 16.65 12 21 12 21z",
    finance: "M21 7H3V5h18v2zm0 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9h18zm-4 5h-3v2h3v-2z"
  };

  var HEALTH = "assets/images/screens/health/";
  var DIARY = "assets/images/screens/moms-diary/";

  var FEATURES = {
    growth: {
      name: "Personal Growth",
      modules: [
        { name: "Projects", slides: [] },
        { name: "Goals", slides: [] },
        { name: "Vacations", slides: [] },
        { name: "Notes", slides: [] },
        { name: "Contacts", slides: [] },
        { name: "Self learning", slides: [] }
      ]
    },
    family: {
      name: "Family",
      modules: [
        { name: "School activity", slides: [] },
        { name: "Kids' finances", slides: [] },
        { name: "Payables", slides: [] },
        { name: "Tasks & projects", slides: [] },
        { name: "Parenting & approvals", slides: [] },
        { name: "Pick and drop", slides: [] },
        { name: "Plans", slides: [] },
        { name: "Chats", slides: [] },
        { name: "Shared documents", slides: [] }
      ]
    },
    business: {
      name: "Business",
      modules: [
        { name: "Multiple businesses", slides: [] },
        { name: "Business partners", slides: [] },
        { name: "Leads & CRM", slides: [] },
        { name: "Employee management", slides: [] },
        { name: "Sales flow", slides: [] },
        { name: "Inventory", slides: [] },
        { name: "Assets", slides: [] },
        { name: "Payables", slides: [] },
        { name: "Chart of Account", slides: [] }
      ]
    },
    health: {
      name: "Health",
      modules: [
        { name: "Family records", slides: [
          { src: HEALTH + "overview.jpeg", title: "Family overview", caption: "Your whole family's health at a glance" },
          { src: HEALTH + "list.jpeg", title: "Member records", caption: "A separate medical record for everyone — pets included" },
          { src: HEALTH + "transactions.jpeg", title: "What it costs", caption: "Every healthcare expense, per member" }
        ] },
        { name: "Tracker", slides: [
          { src: HEALTH + "tracker.jpeg", title: "Vitals tracker", caption: "Blood pressure, sugar and the numbers that matter" },
          { src: HEALTH + "tracker-details.jpeg", title: "Trends over time", caption: "See the trend, not just today's reading" }
        ] },
        { name: "Schedules", slides: [
          { src: HEALTH + "schedules.jpeg", title: "Appointments", caption: "Appointments and reminders that never slip" }
        ] },
        { name: "Treatments", slides: [
          { src: HEALTH + "treatments.jpeg", title: "Treatments", caption: "Ongoing and past treatments in one list" },
          { src: HEALTH + "treatment-details.jpeg", title: "Treatment detail", caption: "Diagnosis, linked trackers, reports and next steps" }
        ] },
        { name: "Vaccinations", slides: [
          { src: HEALTH + "vaccinations.jpeg", title: "Vaccinations", caption: "Every dose and date, tracked per person" },
          { src: HEALTH + "vaccination-countries.jpeg", title: "Travel requirements", caption: "Country schedules, ready before you travel" }
        ] },
        { name: "Medicines", slides: [
          { src: HEALTH + "medicines.jpeg", title: "Medicines", caption: "Every medicine, dose and schedule" },
          { src: HEALTH + "medicines-print.jpeg", title: "Printable list", caption: "Print a clean list to hand the doctor" }
        ] },
        { name: "Menstruation", slides: [
          { src: DIARY + "menstruation.jpeg", title: "Cycle tracking", caption: "Month by month, without guesswork" },
          { src: DIARY + "menstruation-details.jpeg", title: "Daily log", caption: "Symptoms and notes, logged day by day" },
          { src: DIARY + "cycles.jpeg", title: "Cycle history", caption: "Every cycle recorded and comparable" },
          { src: DIARY + "cycle-details.jpeg", title: "Patterns & predictions", caption: "What's normal for you, and what's next" }
        ] },
        { name: "Pregnancy & Mom's Diary", slides: [
          { src: DIARY + "overview.jpeg", title: "Mom's Diary", caption: "A personal companion through every stage" },
          { src: DIARY + "pregnancy-tracker.jpeg", title: "Pregnancy tracker", caption: "A separate record for each pregnancy" }
        ] },
        { name: "Insurance", slides: [
          { src: HEALTH + "insurance.jpeg", title: "Insurance", caption: "Policies and cover, findable in an emergency" }
        ] }
      ]
    },
    finance: {
      name: "Finance & Wealth",
      modules: [
        { name: "My wallet", slides: [] },
        { name: "Assets", slides: [] },
        { name: "Payables", slides: [] },
        { name: "Receivables", slides: [] },
        { name: "Loans", slides: [] },
        { name: "Budgets", slides: [] },
        { name: "Tax", slides: [] },
        { name: "Investments", slides: [] },
        { name: "Plans", slides: [] }
      ]
    }
  };

  var SLIDE_MS = 5000; // how long each screen stays on before auto-advancing

  (function initStage() {
    var stage = document.getElementById("featureStage");
    if (!stage) return;

    var bg = document.getElementById("stageBg");
    var phone = document.getElementById("stagePhone");
    var textWrap = document.getElementById("stageText");
    var featureEl = document.getElementById("stageFeature");
    var iconEl = document.getElementById("stageIcon");
    var indexEl = document.getElementById("stageIndex");
    var totalEl = document.getElementById("stageTotal");
    var bar = document.getElementById("stageBar");
    var prevBtn = document.getElementById("stagePrev");
    var nextBtn = document.getElementById("stageNext");
    var closeBtn = document.getElementById("stageClose");

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var slides = [];
    var index = 0;
    var timer = null;
    var isOpen = false;
    var lastFocused = null;
    function pad(n) { return (n < 10 ? "0" : "") + n; }

    function svg(path) {
      return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="' + path + '"/></svg>';
    }

    /* ---------- build a chip row per feature section ---------- */
    Object.keys(FEATURES).forEach(function (key) {
      var wrap = document.querySelector('.feature-chips[data-feature="' + key + '"]');
      var feature = FEATURES[key];
      if (!wrap) return;
      var section = document.getElementById(key);
      var colour = section ? section.style.getPropertyValue("--c").trim() : "#3B82F6";

      feature.modules.forEach(function (mod) {
        var ready = !!(mod.slides && mod.slides.length);
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "feature-chip";
        chip.innerHTML = '<i aria-hidden="true"></i>';
        chip.appendChild(document.createTextNode(mod.name));
        if (ready) {
          chip.addEventListener("click", function () { openStage(feature, mod, colour, key); });
        } else {
          chip.disabled = true;
          var soon = document.createElement("span");
          soon.className = "soon";
          soon.textContent = "soon";
          chip.appendChild(soon);
          chip.title = "Screens coming soon";
        }
        wrap.appendChild(chip);
      });
    });

    /* ---------- slide switching ---------- */
    function goTo(i) {
      if (!slides.length) return;
      index = (i + slides.length) % slides.length;
      indexEl.textContent = pad(index + 1);
      [bg, phone, textWrap].forEach(function (wrap) {
        var kids = wrap.children;
        for (var n = 0; n < kids.length; n++) kids[n].classList.toggle("active", n === index);
      });
      restartTimer();
    }
    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function stopTimer() {
      if (timer) { clearTimeout(timer); timer = null; }
      var w = getComputedStyle(bar).width;
      bar.classList.remove("run");
      bar.style.transitionDuration = "0ms";
      bar.style.width = w;
    }
    function restartTimer() {
      if (timer) { clearTimeout(timer); timer = null; }
      bar.classList.remove("run");
      bar.style.transitionDuration = "0ms";
      bar.style.width = "0%";
      if (reduced || slides.length < 2 || !isOpen) return;
      void bar.offsetWidth;
      bar.classList.add("run");
      bar.style.transitionDuration = SLIDE_MS + "ms";
      bar.style.width = "100%";
      timer = setTimeout(next, SLIDE_MS);
    }

    /* ---------- open / close ---------- */
    function openStage(feature, mod, colour, iconKey) {
      slides = mod.slides;
      lastFocused = document.activeElement;

      stage.style.setProperty("--c", colour || "#3B82F6");
      featureEl.textContent = feature.name + " — " + mod.name;
      iconEl.innerHTML = svg(ICONS[iconKey] || ICONS.growth);
      totalEl.textContent = pad(slides.length);

      bg.innerHTML = "";
      phone.innerHTML = "";
      textWrap.innerHTML = "";

      slides.forEach(function (s, i) {
        var layer = document.createElement("div");
        layer.className = "stage-bg-layer";
        layer.style.backgroundImage = 'url("' + s.src + '")';
        bg.appendChild(layer);

        var cell = document.createElement("div");
        cell.className = "stage-slide";
        var img = document.createElement("img");
        img.src = s.src;
        img.alt = s.title || mod.name + " screen " + (i + 1);
        cell.appendChild(img);
        phone.appendChild(cell);

        var el = document.createElement("div");
        el.className = "stage-el";
        var h = document.createElement("h2");
        h.textContent = s.title || "";
        var p = document.createElement("p");
        p.textContent = s.caption || "";
        el.appendChild(h);
        el.appendChild(p);
        textWrap.appendChild(el);
      });

      stage.hidden = false;
      document.body.classList.add("stage-open");
      nav.classList.add("scrolled"); // keep the menu legible over the stage
      void stage.offsetWidth;
      stage.classList.add("open");
      isOpen = true;

      // reserve room for the longest text block so nothing jumps
      var tallest = 0;
      textWrap.querySelectorAll(".stage-el").forEach(function (el) {
        tallest = Math.max(tallest, el.offsetHeight);
      });
      textWrap.style.minHeight = tallest + "px";

      goTo(0);
      closeBtn.focus();
    }

    function close(toTop) {
      if (!isOpen) return;
      stopTimer();
      isOpen = false;
      stage.classList.remove("open");
      document.body.classList.remove("stage-open");
      onScroll(); // restore the navbar's normal state
      window.setTimeout(function () {
        if (isOpen) return;
        stage.hidden = true;
        bg.innerHTML = "";
        phone.innerHTML = "";
        textWrap.innerHTML = "";
      }, reduced ? 0 : 500);
      if (toTop) window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      else if (lastFocused) lastFocused.focus();
    }

    /* ---------- controls ---------- */
    nextBtn.addEventListener("click", next);
    prevBtn.addEventListener("click", prev);
    closeBtn.addEventListener("click", function () { close(false); });

    // Any menu link closes the stage; Home returns to the top of the page
    document.querySelectorAll(".nav a, .mobile-menu a, .brand").forEach(function (a) {
      a.addEventListener("click", function () {
        if (!isOpen) return;
        var href = a.getAttribute("href") || "";
        close(href === "#top");
      });
    });

    document.addEventListener("keydown", function (e) {
      if (!isOpen) return;
      if (e.key === "Escape") close(false);
      else if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); prev(); }
    });

    // Scrolling moves through the screens instead of the page
    var wheelLock = 0;
    stage.addEventListener("wheel", function (e) {
      if (!isOpen) return;
      e.preventDefault();
      var now = Date.now();
      if (now - wheelLock < 620) return; // one screen per gesture, not per tick
      if (Math.abs(e.deltaY) < 12) return;
      wheelLock = now;
      e.deltaY > 0 ? next() : prev();
    }, { passive: false });

    // Swipe on touch
    var sy = null, sx = null;
    stage.addEventListener("touchstart", function (e) {
      sy = e.touches[0].clientY; sx = e.touches[0].clientX; stopTimer();
    }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (sy === null) return;
      var dy = e.changedTouches[0].clientY - sy;
      var dx = e.changedTouches[0].clientX - sx;
      var d = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      if (Math.abs(d) > 45) { d < 0 ? next() : prev(); } else { restartTimer(); }
      sy = sx = null;
    });

    document.addEventListener("visibilitychange", function () {
      if (!isOpen) return;
      if (document.hidden) stopTimer(); else restartTimer();
    });
  })();

  // Scroll reveal animations
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el, i) {
      // small stagger for grouped elements
      el.style.transitionDelay = Math.min((i % 6) * 60, 300) + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("visible"); });
  }
})();
