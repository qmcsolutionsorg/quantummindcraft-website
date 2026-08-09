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
        { src: "assets/images/screens/health/poster.jpg", caption: "Every family member's health, in one place" },
        { src: "assets/images/screens/health/list.jpg", caption: "A separate medical record for everyone — pets included" },
        { src: "assets/images/screens/health/details.jpg", caption: "Full history, documents and reports per person" },
        { src: "assets/images/screens/health/vaccination-list.jpg", caption: "Vaccination schedules at a glance" },
        { src: "assets/images/screens/health/vaccination-details.jpg", caption: "Every dose, date and certificate stored" },
        { src: "assets/images/screens/health/treatments-list.jpg", caption: "Track ongoing and past treatments" },
        { src: "assets/images/screens/health/treatment-details.jpg", caption: "Prescriptions, tests and reports together" },
        { src: "assets/images/screens/health/tracker-list.jpg", caption: "BP, sugar and vitals tracking" },
        { src: "assets/images/screens/health/tracker-details.jpg", caption: "See the trend, not just today's number" },
        { src: "assets/images/screens/health/schedules.jpg", caption: "Appointments and reminders that never slip" }
      ]
    },
    finance: { slides: [] },
    business: { slides: [] },
    employees: { slides: [] },
    school: { slides: [] },
    parenting: { slides: [] },
    "moms-diary": {
      slides: [
        { src: "assets/images/screens/moms-diary/poster.png", caption: "A personal companion through every stage" },
        { src: "assets/images/screens/moms-diary/cycle-list.jpg", caption: "Cycle tracking, month by month" },
        { src: "assets/images/screens/moms-diary/cycle-details.jpg", caption: "Symptoms, notes and patterns" },
        { src: "assets/images/screens/moms-diary/cycle-overview.jpg", caption: "Predictions and history in one view" },
        { src: "assets/images/screens/moms-diary/pregnancy-list.jpg", caption: "A separate record for each pregnancy" },
        { src: "assets/images/screens/moms-diary/pregnancy-details.jpg", caption: "Milestones, appointments and reports" }
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
    var track = document.getElementById("galleryTrack");
    var dotsWrap = document.getElementById("galleryDots");
    var captionEl = document.getElementById("galleryCaption");
    var titleEl = document.getElementById("galleryTitle");
    var iconEl = document.getElementById("galleryIcon");
    var counterEl = document.getElementById("galleryCounter");
    var bar = document.getElementById("galleryBar");
    var sliderEl = document.getElementById("gallerySlider");
    var prevBtn = document.getElementById("galleryPrev");
    var nextBtn = document.getElementById("galleryNext");
    var closeBtn = document.getElementById("galleryClose");

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var OPEN_MS = reduced ? 0 : 450;

    var slides = [];
    var index = 0;
    var timer = null;
    var activeCard = null;

    /* ---------- slider ---------- */
    function goTo(i, instant) {
      if (!slides.length) return;
      index = (i + slides.length) % slides.length;
      track.classList.toggle("no-anim", !!instant || reduced);
      track.style.transform = "translateX(" + -index * 100 + "%)";
      captionEl.textContent = slides[index].caption || "";
      counterEl.textContent = index + 1 + " / " + slides.length;
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
      dotsWrap.innerHTML = "";
      slides.forEach(function (s, i) {
        var cell = document.createElement("div");
        cell.className = "slide";
        var img = document.createElement("img");
        img.src = s.src;
        img.alt = s.caption || titleEl.textContent + " screen " + (i + 1);
        if (i > 0) img.loading = "lazy";
        cell.appendChild(img);
        track.appendChild(cell);

        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "Go to screen " + (i + 1));
        dot.addEventListener("click", function () { goTo(i); });
        dotsWrap.appendChild(dot);
      });

      var solo = slides.length < 2;
      dotsWrap.hidden = solo;
      prevBtn.hidden = solo;
      nextBtn.hidden = solo;
      counterEl.hidden = solo;
    }

    function open(card) {
      var data = GALLERIES[card.getAttribute("data-gallery")];
      if (!data || !data.slides.length) return;

      if (activeCard === card) { close(); return; }
      if (activeCard) markClosed(activeCard);

      slides = data.slides;
      activeCard = card;
      card.classList.add("open");
      card.setAttribute("aria-expanded", "true");

      buildContent(card);
      placePanel(card);

      exp.hidden = false;
      exp.style.height = "0px";
      void exp.offsetHeight; // reflow before animating
      exp.style.height = inner.offsetHeight + "px";
      exp.classList.add("open");

      goTo(0, true);

      // let it settle to auto so late-loading images don't get clipped
      window.setTimeout(function () {
        if (activeCard === card) exp.style.height = "auto";
      }, OPEN_MS);

      // bring the card and panel into view under the fixed navbar
      window.setTimeout(function () {
        var y = card.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
      }, 60);
    }

    function markClosed(card) {
      card.classList.remove("open");
      card.setAttribute("aria-expanded", "false");
    }

    function close() {
      if (!activeCard) return;
      stopTimer();
      markClosed(activeCard);
      activeCard = null;

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
