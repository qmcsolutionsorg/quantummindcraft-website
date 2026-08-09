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
        // PLACEHOLDERS — swap these three for real Health screenshots
        { src: "assets/images/website header page pic.jpg", caption: "Placeholder — replace with the Health dashboard" },
        { src: "assets/images/header-family.jpg", caption: "Placeholder — replace with a family member's record" },
        { src: "assets/images/logo-dark.jpeg", caption: "Placeholder — replace with vaccinations & prescriptions" }
      ]
    },
    finance: { slides: [] },
    business: { slides: [] },
    employees: { slides: [] },
    school: { slides: [] },
    parenting: { slides: [] },
    "moms-diary": { slides: [] },
    assets: { slides: [] },
    payables: { slides: [] },
    travel: { slides: [] },
    documents: { slides: [] },
    collaborations: { slides: [] },
    growth: { slides: [] }
  };

  var SLIDE_MS = 4500; // time each screen stays on

  (function initGalleries() {
    var modal = document.getElementById("galleryModal");
    if (!modal) return;

    var panel = modal.querySelector(".modal-panel");
    var track = document.getElementById("galleryTrack");
    var dotsWrap = document.getElementById("galleryDots");
    var captionEl = document.getElementById("galleryCaption");
    var titleEl = document.getElementById("galleryTitle");
    var blurbEl = document.getElementById("galleryBlurb");
    var iconEl = document.getElementById("galleryIcon");
    var bar = document.getElementById("galleryBar");
    var sliderEl = document.getElementById("gallerySlider");
    var closeBtn = document.getElementById("galleryClose");

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var slides = [];
    var index = 0;
    var timer = null;
    var lastFocused = null;

    /* ---- slide movement ---- */
    function goTo(i, instant) {
      if (!slides.length) return;
      index = (i + slides.length) % slides.length;
      track.classList.toggle("no-anim", !!instant || reduced);
      track.style.transform = "translateX(" + -index * 100 + "%)";
      captionEl.textContent = slides[index].caption || "";
      dotsWrap.querySelectorAll("button").forEach(function (d, n) {
        d.classList.toggle("active", n === index);
        d.setAttribute("aria-current", n === index ? "true" : "false");
      });
      restartTimer();
    }
    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    /* ---- autoplay + progress bar ---- */
    function stopTimer() {
      if (timer) { clearTimeout(timer); timer = null; }
      // freeze the bar where it is
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
      if (reduced || slides.length < 2) return;
      void bar.offsetWidth; // reflow so the reset actually takes
      bar.classList.add("run");
      bar.style.transitionDuration = SLIDE_MS + "ms";
      bar.style.width = "100%";
      timer = setTimeout(next, SLIDE_MS);
    }

    /* ---- open / close ---- */
    function open(card) {
      var key = card.getAttribute("data-gallery");
      var data = GALLERIES[key];
      if (!data || !data.slides.length) return;

      slides = data.slides;
      lastFocused = document.activeElement;

      panel.style.setProperty("--c", card.style.getPropertyValue("--c").trim() || "#3B82F6");
      titleEl.textContent = card.querySelector("h3").textContent;
      blurbEl.textContent = card.querySelector("p").textContent;
      iconEl.innerHTML = card.querySelector(".feature-ic").innerHTML;

      track.innerHTML = "";
      dotsWrap.innerHTML = "";
      slides.forEach(function (s, i) {
        var fig = document.createElement("div");
        fig.className = "slide";
        var img = document.createElement("img");
        img.src = s.src;
        img.alt = s.caption || titleEl.textContent + " screen " + (i + 1);
        if (i > 0) img.loading = "lazy";
        fig.appendChild(img);
        track.appendChild(fig);

        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "Go to screen " + (i + 1));
        dot.addEventListener("click", function () { goTo(i); });
        dotsWrap.appendChild(dot);
      });

      var solo = slides.length < 2;
      dotsWrap.hidden = solo;
      document.getElementById("galleryPrev").hidden = solo;
      document.getElementById("galleryNext").hidden = solo;

      modal.hidden = false;
      document.body.classList.add("modal-open");
      void modal.offsetWidth;
      modal.classList.add("open");
      goTo(0, true);
      closeBtn.focus();
    }

    function close() {
      stopTimer();
      modal.classList.remove("open");
      document.body.classList.remove("modal-open");
      setTimeout(function () {
        modal.hidden = true;
        track.innerHTML = "";
      }, reduced ? 0 : 320);
      if (lastFocused) lastFocused.focus();
    }

    /* ---- wire the cards ---- */
    document.querySelectorAll(".feature-card[data-gallery]").forEach(function (card) {
      var key = card.getAttribute("data-gallery");
      var data = GALLERIES[key];
      if (!data || !data.slides.length) return; // no screens yet → leave it inert

      card.classList.add("has-gallery");
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-haspopup", "dialog");

      var more = document.createElement("span");
      more.className = "feature-more";
      more.innerHTML = 'See it in the app <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
      card.appendChild(more);

      card.addEventListener("click", function () { open(card); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(card); }
      });
    });

    /* ---- controls ---- */
    document.getElementById("galleryNext").addEventListener("click", next);
    document.getElementById("galleryPrev").addEventListener("click", prev);
    closeBtn.addEventListener("click", close);
    modal.querySelector("[data-close]").addEventListener("click", close);

    document.addEventListener("keydown", function (e) {
      if (modal.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Tab") {
        // keep focus inside the dialog
        var f = panel.querySelectorAll("button, [href], input, [tabindex]:not([tabindex='-1'])");
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    // pause while the pointer is over the slider, or the tab is hidden
    sliderEl.addEventListener("mouseenter", stopTimer);
    sliderEl.addEventListener("mouseleave", function () { if (!modal.hidden) restartTimer(); });
    document.addEventListener("visibilitychange", function () {
      if (modal.hidden) return;
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
