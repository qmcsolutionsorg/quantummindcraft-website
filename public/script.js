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

  var SLIDE_MS = 4500; // time each screen stays on

  (function initGalleries() {
    var grid = document.querySelector(".feature-grid");
    var exp = document.getElementById("featureExpander");
    if (!grid || !exp) return;

    var inner = exp.querySelector(".expander-inner");
    var track = document.getElementById("galleryTrack");   // stacked phone screens
    var textWrap = document.getElementById("galleryText"); // stacked title + copy
    var dotsWrap = document.getElementById("galleryDots");
    var titleEl = document.getElementById("galleryTitle");
    var iconEl = document.getElementById("galleryIcon");
    var counterEl = document.getElementById("galleryCounter");
    var totalEl = document.getElementById("galleryTotal");
    var bar = document.getElementById("galleryBar");
    var sliderEl = document.getElementById("gallerySlider");
    var prevBtn = document.getElementById("galleryPrev");
    var nextBtn = document.getElementById("galleryNext");
    var closeBtn = document.getElementById("galleryClose");
    function pad(n) { return (n < 10 ? "0" : "") + n; }

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var OPEN_MS = reduced ? 0 : 450;

    var slides = [];
    var index = 0;
    var timer = null;
    var activeCard = null;
    var scrollBefore = 0; // where the reader was before we scrolled them to the panel
    var NAV_H = 100;      // fixed navbar + a little breathing room

    /* ---------- slider ---------- */
    // Crossfade: every screen and text block is stacked in place and we just
    // toggle which one is active. Nothing translates, so nothing can drift.
    function goTo(i) {
      if (!slides.length) return;
      index = (i + slides.length) % slides.length;
      counterEl.textContent = pad(index + 1);
      track.querySelectorAll(".gal-slide").forEach(function (s, n) {
        s.classList.toggle("active", n === index);
        s.setAttribute("aria-hidden", n === index ? "false" : "true");
      });
      textWrap.querySelectorAll(".gal-el").forEach(function (t, n) {
        t.classList.toggle("active", n === index);
      });
      dotsWrap.querySelectorAll("button").forEach(function (d, n) {
        d.classList.toggle("active", n === index);
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
      if (reduced || slides.length < 2 || !activeCard) return;
      void bar.offsetWidth; // reflow so the reset actually applies
      bar.classList.add("run");
      bar.style.transitionDuration = SLIDE_MS + "ms";
      bar.style.width = "100%";
      timer = setTimeout(next, SLIDE_MS);
    }

    /* ---------- placing the panel in the grid ---------- */
    function columnCount() {
      var cols = getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean);
      return Math.max(cols.length, 1);
    }
    // Insert the panel after the last card on the clicked card's row, so it
    // spans full width and pushes the rows below it down.
    function placePanel(card) {
      if (exp.parentNode) exp.parentNode.removeChild(exp); // detach first, or row maths is off
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".feature-card"));
      var i = cards.indexOf(card);
      var cols = columnCount();
      var afterIdx = Math.floor(i / cols) * cols + cols;
      grid.insertBefore(exp, cards[afterIdx] || null);
    }

    /* ---------- open / close ---------- */
    function buildContent(card) {
      titleEl.textContent = card.querySelector("h3").textContent;
      iconEl.innerHTML = card.querySelector(".feature-ic").innerHTML;
      exp.style.setProperty("--c", card.style.getPropertyValue("--c").trim() || "#3B82F6");

      track.innerHTML = "";
      textWrap.innerHTML = "";
      dotsWrap.innerHTML = "";
      totalEl.textContent = pad(slides.length);

      slides.forEach(function (s, i) {
        var cell = document.createElement("div");
        cell.className = "gal-slide";
        var img = document.createElement("img");
        img.src = s.src;
        img.alt = s.title || titleEl.textContent + " screen " + (i + 1);
        if (i > 1) img.loading = "lazy"; // the first couple are needed straight away
        cell.appendChild(img);
        track.appendChild(cell);

        var el = document.createElement("div");
        el.className = "gal-el";
        var h = document.createElement("h4");
        h.textContent = s.title || "";
        var p = document.createElement("p");
        p.textContent = s.caption || "";
        el.appendChild(h);
        el.appendChild(p);
        textWrap.appendChild(el);

        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", (s.title || "Screen " + (i + 1)));
        dot.addEventListener("click", function () { goTo(i); });
        dotsWrap.appendChild(dot);
      });

      // reserve height for the tallest text block so the panel doesn't jump
      textWrap.style.minHeight = "";
      var solo = slides.length < 2;
      dotsWrap.hidden = solo;
      prevBtn.hidden = solo;
      nextBtn.hidden = solo;
    }

    function open(card) {
      var data = GALLERIES[card.getAttribute("data-gallery")];
      if (!data || !data.slides.length) return;

      if (activeCard === card) { close(); return; }
      // remember the reading position only on a fresh open, not when
      // switching between cards — otherwise closing lands somewhere random
      if (!activeCard) scrollBefore = window.scrollY;
      if (activeCard) markClosed(activeCard);

      slides = data.slides;
      activeCard = card;
      card.classList.add("open");
      card.setAttribute("aria-expanded", "true");

      buildContent(card);
      placePanel(card);

      exp.hidden = false;

      // Reserve the tallest text block's height so the panel doesn't jump as
      // captions of different lengths come and go. Measurable only once shown.
      var tallest = 0;
      textWrap.querySelectorAll(".gal-el").forEach(function (el) {
        tallest = Math.max(tallest, el.offsetHeight);
      });
      textWrap.style.minHeight = tallest + "px";

      exp.style.height = "0px";
      void exp.offsetHeight; // reflow before animating
      exp.style.height = inner.offsetHeight + "px";
      exp.classList.add("open");

      goTo(0);

      // let it settle to auto so late-loading images don't get clipped
      window.setTimeout(function () {
        if (activeCard === card) exp.style.height = "auto";
      }, OPEN_MS);

      // Scroll so the whole panel is visible, not just its top edge.
      window.setTimeout(function () {
        if (activeCard !== card) return;
        var panelTop = exp.getBoundingClientRect().top + window.scrollY;
        var panelH = inner.offsetHeight;
        var avail = window.innerHeight - NAV_H;
        var y;
        if (panelH <= avail) {
          // it fits — pull it fully into view, keeping the card visible above if we can
          y = panelTop - NAV_H - Math.min(70, avail - panelH);
        } else {
          // taller than the screen — align its top just under the navbar
          y = panelTop - NAV_H;
        }
        window.scrollTo({ top: Math.max(0, y), behavior: reduced ? "auto" : "smooth" });
      }, 90);
    }

    function markClosed(card) {
      card.classList.remove("open");
      card.setAttribute("aria-expanded", "false");
    }

    function close() {
      if (!activeCard) return;
      stopTimer();
      markClosed(activeCard);
      var closedCard = activeCard;
      activeCard = null;

      // Return the reader to where they were before the panel pushed the page around.
      // If they've scrolled off since, just bring the card itself back into view.
      var cardTop = closedCard.getBoundingClientRect().top + window.scrollY;
      var target = scrollBefore;
      if (Math.abs(cardTop - scrollBefore) > window.innerHeight * 1.5) {
        target = cardTop - NAV_H - 20;
      }
      window.scrollTo({ top: Math.max(0, target), behavior: reduced ? "auto" : "smooth" });

      exp.style.height = inner.offsetHeight + "px"; // from auto to a real number
      void exp.offsetHeight;
      exp.classList.remove("open");
      exp.style.height = "0px";

      window.setTimeout(function () {
        if (activeCard) return; // reopened in the meantime
        exp.hidden = true;
        track.innerHTML = "";
        if (exp.parentNode) exp.parentNode.removeChild(exp);
      }, OPEN_MS);
    }

    /* ---------- wire the cards ---------- */
    document.querySelectorAll(".feature-card[data-gallery]").forEach(function (card) {
      var data = GALLERIES[card.getAttribute("data-gallery")];
      if (!data || !data.slides.length) return; // no screens yet → leave it inert

      card.classList.add("has-gallery");
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-expanded", "false");

      var more = document.createElement("span");
      more.className = "feature-more";
      more.innerHTML =
        '<span class="feature-more-label">See it in the app</span>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
      card.appendChild(more);

      card.addEventListener("click", function () { open(card); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(card); }
      });
    });

    /* ---------- controls ---------- */
    nextBtn.addEventListener("click", next);
    prevBtn.addEventListener("click", prev);
    closeBtn.addEventListener("click", close);

    document.addEventListener("keydown", function (e) {
      if (!activeCard) return;
      if (e.key === "Escape") { var c = activeCard; close(); c.focus(); }
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    });

    // pause while hovered, or while the tab is in the background
    sliderEl.addEventListener("mouseenter", stopTimer);
    sliderEl.addEventListener("mouseleave", function () { if (activeCard) restartTimer(); });
    document.addEventListener("visibilitychange", function () {
      if (!activeCard) return;
      if (document.hidden) stopTimer(); else restartTimer();
    });

    // swipe on touch devices
    var startX = null;
    sliderEl.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; stopTimer(); }, { passive: true });
    sliderEl.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) { dx < 0 ? next() : prev(); } else { restartTimer(); }
      startX = null;
    });

    // the grid changes column count at breakpoints — re-seat the panel
    var rzTimer = null;
    window.addEventListener("resize", function () {
      if (!activeCard) return;
      clearTimeout(rzTimer);
      rzTimer = setTimeout(function () {
        if (!activeCard) return;
        placePanel(activeCard);
        exp.style.height = "auto";
      }, 150);
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
