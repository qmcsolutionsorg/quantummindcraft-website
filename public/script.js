/* QuantrolPlus — landing page interactions
 *
 * Features, modules and screens are NOT defined in this file. They are read
 * from content.json, which `tools/build-content.js` generates by scanning
 * public/content/. To add a module: make a folder, drop images in, deploy.
 */
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
  }
  function closeMobileMenu() {
    if (!menu) return;
    menu.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }

  /* ---------- scroll reveal, re-runnable for generated content ---------- */
  var io = "IntersectionObserver" in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" })
    : null;

  function initReveals(root) {
    var els = (root || document).querySelectorAll(".reveal:not(.visible)");
    els.forEach(function (el, i) {
      if (!io) { el.classList.add("visible"); return; }
      el.style.transitionDelay = Math.min((i % 6) * 60, 300) + "ms";
      io.observe(el);
    });
  }
  initReveals(document);

  /* =================================================================== */
  /*  Everything below is driven by content.json                          */
  /* =================================================================== */
  var ICONS = {
    growth: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    family: "M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-8 0a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-2.7 0-8 1.34-8 4v3h8v-3c0-1 .38-1.9 1-2.6A9 9 0 0 0 8 13zm8 0a10 10 0 0 0-1.6.13c1.1.9 1.6 2 1.6 2.87v3h8v-3c0-2.66-5.3-4-8-4z",
    business: "M10 4h4a2 2 0 0 1 2 2v1h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3V6a2 2 0 0 1 2-2zm0 3h4V6h-4v1z",
    health: "M12 21s-6.7-4.35-9.33-8.5C.9 9.5 2 6 5 6c1.9 0 3 1 3.7 2 .8-1 1.8-2 3.3-2 3 0 4.1 3.5 2.33 6.5C18.7 16.65 12 21 12 21z",
    finance: "M21 7H3V5h18v2zm0 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9h18zm-4 5h-3v2h3v-2z",
    school: "M12 3 1 9l11 6 9-4.9V17h2V9L12 3zM5 13.2v3.3l7 3.8 7-3.8v-3.3l-7 3.8-7-3.8z",
    doc: "M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm8 1.5V8h4.5L14 3.5zM8 12h8v2H8v-2zm0 4h8v2H8v-2z"
  };

  var SLIDE_MS = 5000; // how long each screen stays on before auto-advancing

  function svg(path) {
    return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="' + path + '"/></svg>';
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  fetch("content.json", { cache: "no-cache" })
    .then(function (r) {
      if (!r.ok) throw new Error("content.json returned " + r.status);
      return r.json();
    })
    .then(function (data) { build(data.features || []); })
    .catch(function (err) {
      // The page still works without it — the feature sections just stay empty.
      console.error("Could not load content.json:", err);
    });

  function build(features) {
    renderNav(features);
    renderSections(features);
    initStage();
  }

  /* ---------- navigation ---------- */
  function renderNav(features) {
    [document.getElementById("navLinks"), document.getElementById("mobileMenu")].forEach(function (host) {
      if (!host) return;
      var tail = host.querySelector("[data-nav-tail]");
      features.forEach(function (f) {
        var a = document.createElement("a");
        a.href = "#" + f.id;
        a.textContent = f.name;
        host.insertBefore(a, tail);
      });
    });

    // menu clicks close the mobile menu, and close the stage if it is open
    document.querySelectorAll(".nav a, .mobile-menu a, .brand").forEach(function (a) {
      a.addEventListener("click", function () {
        closeMobileMenu();
        if (stageIsOpen()) closeStage(a.getAttribute("href") === "#top");
      });
    });
  }

  /* ---------- feature sections ---------- */
  function renderSections(features) {
    var host = document.getElementById("featureSections");
    if (!host) return;

    features.forEach(function (f) {
      var sec = document.createElement("section");
      sec.className = "section feature-sec";
      sec.id = f.id;
      sec.style.setProperty("--c", f.color);

      var head = document.createElement("div");
      head.className = "section-head reveal";
      head.innerHTML =
        '<span class="eyebrow">' + esc(f.name) + "</span>" +
        "<h2>" + esc(f.name) + "</h2>" +
        (f.desc ? "<p>" + esc(f.desc) + "</p>" : "");

      var chips = document.createElement("div");
      chips.className = "feature-chips";

      var withScreens = 0;
      f.modules.forEach(function (mod) {
        var ready = mod.slides && mod.slides.length;
        if (ready) withScreens++;
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "feature-chip";
        chip.innerHTML = '<i aria-hidden="true"></i>';
        chip.appendChild(document.createTextNode(mod.name));
        if (ready) {
          chip.addEventListener("click", function () { openStage(f, mod); });
        } else {
          chip.disabled = true;
          var soon = document.createElement("span");
          soon.className = "soon";
          soon.textContent = "soon";
          chip.appendChild(soon);
          chip.title = "Screens coming soon";
        }
        chips.appendChild(chip);
      });

      var hint = document.createElement("p");
      hint.className = "feature-hint reveal";
      hint.textContent = withScreens
        ? "Pick a module to walk through it inside the app"
        : "Screens for these modules are on the way";

      var wrap = document.createElement("div");
      wrap.className = "container";
      wrap.appendChild(head);
      wrap.appendChild(chips);
      wrap.appendChild(hint);
      sec.appendChild(wrap);
      host.appendChild(sec);

      // optional hand-written markup for this feature (_extra.html)
      if (f.extra) {
        var extra = document.createElement("section");
        extra.className = "section " + f.id + "-extra";
        extra.innerHTML = f.extra;
        host.appendChild(extra);
      }
    });

    initReveals(host);
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ---------- the fullscreen stage ---------- */
  var stage, bg, phone, textWrap, featureEl, iconEl, indexEl, totalEl, bar,
      prevBtn, nextBtn, closeBtn, reduced;
  var slides = [], index = 0, timer = null, isOpen = false, lastFocused = null;

  function stageIsOpen() { return isOpen; }

  function initStage() {
    stage = document.getElementById("featureStage");
    if (!stage) return;
    bg = document.getElementById("stageBg");
    phone = document.getElementById("stagePhone");
    textWrap = document.getElementById("stageText");
    featureEl = document.getElementById("stageFeature");
    iconEl = document.getElementById("stageIcon");
    indexEl = document.getElementById("stageIndex");
    totalEl = document.getElementById("stageTotal");
    bar = document.getElementById("stageBar");
    prevBtn = document.getElementById("stagePrev");
    nextBtn = document.getElementById("stageNext");
    closeBtn = document.getElementById("stageClose");
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    nextBtn.addEventListener("click", next);
    prevBtn.addEventListener("click", prev);
    closeBtn.addEventListener("click", function () { closeStage(false); });

    document.addEventListener("keydown", function (e) {
      if (!isOpen) return;
      if (e.key === "Escape") closeStage(false);
      else if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); prev(); }
    });

    // scrolling moves through the screens rather than the page
    var wheelLock = 0;
    stage.addEventListener("wheel", function (e) {
      if (!isOpen) return;
      e.preventDefault();
      var now = Date.now();
      if (now - wheelLock < 620) return;   // one screen per gesture, not per tick
      if (Math.abs(e.deltaY) < 12) return;
      wheelLock = now;
      e.deltaY > 0 ? next() : prev();
    }, { passive: false });

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
  }

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

  function openStage(feature, mod) {
    if (!stage) return;
    slides = mod.slides;
    lastFocused = document.activeElement;

    stage.style.setProperty("--c", feature.color);
    featureEl.textContent = feature.name + " — " + mod.name;
    iconEl.innerHTML = svg(ICONS[feature.icon] || ICONS.growth);
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

  function closeStage(toTop) {
    if (!isOpen) return;
    stopTimer();
    isOpen = false;
    stage.classList.remove("open");
    document.body.classList.remove("stage-open");
    onScroll();
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
})();
