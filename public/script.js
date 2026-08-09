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
     FEATURE GALLERIES
     ---------------------------------------------------------------
     To add screens for a card: drop the images into
        public/assets/images/screens/<gallery>/
     then list them below. A card with an empty slides array is simply
     not clickable, so the site never shows a broken image.
     =================================================================== */
  var GALLERIES = {
    health: {
      slides: [
        { src: "assets/images/screens/health/overview.jpeg", title: "Family overview", caption: "Your whole family's health at a glance" },
        { src: "assets/images/screens/health/list.jpeg", title: "Member records", caption: "A separate medical record for everyone — pets included" },
        { src: "assets/images/screens/health/vaccinations.jpeg", title: "Vaccinations", caption: "Vaccination schedules, tracked per person" },
        { src: "assets/images/screens/health/vaccination-countries.jpeg", title: "Travel requirements", caption: "Requirements by country, ready before you travel" },
        { src: "assets/images/screens/health/treatments.jpeg", title: "Treatments", caption: "Ongoing and past treatments in one list" },
        { src: "assets/images/screens/health/treatment-details.jpeg", title: "Treatment detail", caption: "Prescriptions, tests and reports together" },
        { src: "assets/images/screens/health/medicines.jpeg", title: "Medicines", caption: "Every medicine, dose and schedule" },
        { src: "assets/images/screens/health/medicines-print.jpeg", title: "Printable list", caption: "Print a clean list for the doctor" },
        { src: "assets/images/screens/health/tracker.jpeg", title: "Vitals tracker", caption: "BP, sugar and vitals tracking" },
        { src: "assets/images/screens/health/tracker-details.jpeg", title: "Trends over time", caption: "See the trend, not just today's number" },
        { src: "assets/images/screens/health/schedules.jpeg", title: "Appointments", caption: "Appointments and reminders that never slip" },
        { src: "assets/images/screens/health/insurance.jpeg", title: "Insurance", caption: "Policies and cover, findable in an emergency" },
        { src: "assets/images/screens/health/transactions.jpeg", title: "Healthcare costs", caption: "What your family's healthcare actually costs" }
      ]
    },
    finance: { slides: [] },
    business: { slides: [] },
    employees: { slides: [] },
    school: { slides: [] },
    parenting: { slides: [] },
    "moms-diary": {
      slides: [
        { src: "assets/images/screens/moms-diary/overview.jpeg", title: "Diary overview", caption: "A personal companion through every stage" },
        { src: "assets/images/screens/moms-diary/menstruation.jpeg", title: "Cycle tracking", caption: "Cycle tracking, month by month" },
        { src: "assets/images/screens/moms-diary/menstruation-details.jpeg", title: "Daily log", caption: "Symptoms and notes, logged day by day" },
        { src: "assets/images/screens/moms-diary/cycles.jpeg", title: "Cycle history", caption: "Every cycle recorded and comparable" },
        { src: "assets/images/screens/moms-diary/cycle-details.jpeg", title: "Patterns & predictions", caption: "Patterns and predictions in one view" },
        { src: "assets/images/screens/moms-diary/pregnancy-tracker.jpeg", title: "Pregnancy tracker", caption: "A separate record for each pregnancy" }
      ]
    },
    assets: { slides: [] },
    payables: { slides: [] },
    travel: { slides: [] },
    documents: { slides: [] },
    collaborations: { slides: [] },
    growth: { slides: [] }
  };

  var SLIDE_MS = 5000; // time each screen stays on before auto-advancing

  // PROTOTYPE: only this many screens are used per feature. Set to 0 for all of them.
  var PROTO_SLIDES = 3;

  (function initStage() {
    var grid = document.getElementById("featureGrid");
    var chipWrap = document.getElementById("featureChips");
    var stage = document.getElementById("featureStage");
    if (!grid || !chipWrap || !stage) return;

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

    /* ---------- build the chip bar from the cards ---------- */
    Array.prototype.slice.call(grid.querySelectorAll(".feature-card[data-gallery]")).forEach(function (card) {
      var key = card.getAttribute("data-gallery");
      var data = GALLERIES[key];
      var ready = !!(data && data.slides.length);

      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "feature-chip";
      chip.style.setProperty("--c", card.style.getPropertyValue("--c").trim() || "#3B82F6");
      chip.innerHTML = '<i aria-hidden="true">' + card.querySelector(".feature-ic").innerHTML + "</i>";
      chip.appendChild(document.createTextNode(card.querySelector("h3").textContent));
      if (!ready) {
        chip.disabled = true;
        var soon = document.createElement("span");
        soon.className = "soon";
        soon.textContent = "soon";
        chip.appendChild(soon);
        chip.title = "Screens coming soon";
      } else {
        chip.addEventListener("click", function () { open(card, data.slides); });
      }
      chipWrap.appendChild(chip);
    });

    // Chips replace the tiles for anyone with JS. The tiles stay in the HTML so
    // the copy is still in the page source for search engines and no-JS readers.
    grid.hidden = true;

    /* ---------- slide switching ---------- */
    function goTo(i) {
      if (!slides.length) return;
      index = (i + slides.length) % slides.length;
      indexEl.textContent = pad(index + 1);
      [bg, phone, textWrap].forEach(function (wrap) {
        var kids = wrap.children;
        for (var n = 0; n < kids.length; n++) {
          kids[n].classList.toggle("active", n === index);
        }
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
    function open(card, all) {
      slides = PROTO_SLIDES > 0 ? all.slice(0, PROTO_SLIDES) : all;
      lastFocused = document.activeElement;

      stage.style.setProperty("--c", card.style.getPropertyValue("--c").trim() || "#3B82F6");
      featureEl.textContent = card.querySelector("h3").textContent;
      iconEl.innerHTML = card.querySelector(".feature-ic").innerHTML;
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
        img.alt = s.title || featureEl.textContent + " screen " + (i + 1);
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

      // reserve room for the longest block so the layout doesn't jump
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

    // Any menu link closes the stage and returns to the top of the page
    document.querySelectorAll(".nav a, .mobile-menu a, .brand").forEach(function (a) {
      a.addEventListener("click", function () { if (isOpen) close(true); });
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
      if (now - wheelLock < 620) return;      // one screen per gesture, not per tick
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
