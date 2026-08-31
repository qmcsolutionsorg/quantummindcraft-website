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
    renderTopics(features);
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

      // optional backdrop from content/<feature>/_background.<ext>
      if (f.background) {
        sec.classList.add("has-bg");
        sec.style.setProperty("--bg", 'url("' + f.background + '")');
        if (f.bgOpacity) sec.style.setProperty("--bg-opacity", f.bgOpacity);
      }

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
        // Hovering any module shows its brief; once screens are added it
        // becomes a clickable walkthrough.
        if (mod.desc) chip.title = mod.desc;
        if (ready) {
          chip.addEventListener("click", function () { openStage(f, mod); });
        } else {
          chip.disabled = true;
          var soon = document.createElement("span");
          soon.className = "soon";
          soon.textContent = "soon";
          chip.appendChild(soon);
          if (!mod.desc) chip.title = "Screens coming soon";
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

  /* =================================================================== */
  /*  Topic bubbles — one bubble per module, packed into a 3D field       */
  /* =================================================================== */
  /* The whole field is laid out in a fixed 1200x560 virtual space and then
     written out as percentages, so it never needs re-measuring or re-packing
     when the window changes size — .topic-field just keeps that aspect ratio. */

  var VW = 1200, VH = 560;
  var topicItems = [];          // { f, mod, g, r, x, y, z, dn, el }
  var topic3d = null, topicDetail = null;

  // deterministic RNG, so the field is laid out the same way on every load
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* Bubble size follows the label length — long names need a bigger circle to
     stay readable. It is deliberately not an encoding of anything: every
     module counts the same until there are screens to count. */
  function topicRadius(name) {
    return (78 + Math.min(name.length, 26) * 1.9) / 2;
  }

  /* Cluster each feature's modules around its own centre, then push overlapping
     bubbles apart until they settle. Repeatable: same input, same field. */
  function packTopics(items) {
    var n = items.length, i, j, pass;
    var rnd = rng(0x51ee7);

    var groups = items.reduce(function (m, it) { return Math.max(m, it.g); }, 0) + 1;
    var cent = [];
    for (i = 0; i < groups; i++) {
      cent.push({
        x: VW * (groups > 1 ? 0.13 + (i / (groups - 1)) * 0.74 : 0.5),
        y: VH * (i % 2 ? 0.63 : 0.37)
      });
    }

    // shrink (or grow, within reason) so the bubbles fill a comfortable share
    var area = items.reduce(function (a, it) { return a + Math.PI * it.r * it.r; }, 0);
    var k = Math.min(1.3, Math.sqrt(0.46 * VW * VH / area));
    items.forEach(function (it) { it.r *= k; });

    items.forEach(function (it) {
      var c = cent[it.g], a = rnd() * Math.PI * 2, d = 12 + rnd() * 95;
      it.x = c.x + Math.cos(a) * d;
      it.y = c.y + Math.sin(a) * d * 0.7;
    });

    for (pass = 0; pass < 280; pass++) {
      for (i = 0; i < n; i++) {
        var c = cent[items[i].g];
        items[i].x += (c.x - items[i].x) * 0.011;
        items[i].y += (c.y - items[i].y) * 0.017;
      }
      for (i = 0; i < n; i++) {
        for (j = i + 1; j < n; j++) {
          var A = items[i], B = items[j];
          var dx = B.x - A.x, dy = B.y - A.y;
          var min = A.r + B.r + 9;
          var d2 = dx * dx + dy * dy;
          if (d2 >= min * min) continue;
          var d = Math.sqrt(d2);
          if (d < 0.01) { dx = 0.01; dy = 0; d = 0.01; }   // exactly stacked
          var push = (min - d) / d * 0.5;
          A.x -= dx * push; A.y -= dy * push;
          B.x += dx * push; B.y += dy * push;
        }
      }
      for (i = 0; i < n; i++) {
        items[i].x = Math.max(items[i].r + 30, Math.min(VW - items[i].r - 30, items[i].x));
        items[i].y = Math.max(items[i].r + 30, Math.min(VH - items[i].r - 30, items[i].y));
      }
    }

    // The cluster pull and the separation settle into a balance that can still
    // leave a couple of pixels of overlap. One last pass with the pull switched
    // off clears it without moving anything far.
    for (pass = 0; pass < 120; pass++) {
      var moved = false;
      for (i = 0; i < n; i++) {
        for (j = i + 1; j < n; j++) {
          var P = items[i], Q = items[j];
          var ux = Q.x - P.x, uy = Q.y - P.y;
          var need = P.r + Q.r + 9;
          var sq = ux * ux + uy * uy;
          if (sq >= need * need) continue;
          var len = Math.sqrt(sq);
          if (len < 0.01) { ux = 0.01; uy = 0; len = 0.01; }
          var shove = (need - len) / len * 0.5;
          P.x -= ux * shove; P.y -= uy * shove;
          Q.x += ux * shove; Q.y += uy * shove;
          moved = true;
        }
      }
      for (i = 0; i < n; i++) {
        items[i].x = Math.max(items[i].r + 30, Math.min(VW - items[i].r - 30, items[i].x));
        items[i].y = Math.max(items[i].r + 30, Math.min(VH - items[i].r - 30, items[i].y));
      }
      if (!moved) break;
    }

    // depth follows size, so bigger bubbles genuinely sit nearer the viewer
    var lo = Infinity, hi = -Infinity;
    items.forEach(function (it) { lo = Math.min(lo, it.r); hi = Math.max(hi, it.r); });
    items.forEach(function (it) {
      it.dn = hi > lo ? (it.r - lo) / (hi - lo) : 0.5;
      it.z = (it.dn - 0.5) * 130;
    });
  }

  function renderTopics(features) {
    topic3d = document.getElementById("topic3d");
    topicDetail = document.getElementById("topicDetail");
    var field = document.getElementById("topicField");
    var legend = document.getElementById("topicLegend");
    if (!topic3d || !field) return;

    features.forEach(function (f, gi) {
      f.modules.forEach(function (mod) {
        topicItems.push({ f: f, mod: mod, g: gi, r: topicRadius(mod.name) });
      });
    });
    if (!topicItems.length) return;

    packTopics(topicItems);

    var rnd = rng(0x9e37);
    topicItems.forEach(function (it, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "topic-bub";
      b.style.setProperty("--c", it.f.color);
      b.style.setProperty("--x", (it.x / VW * 100).toFixed(3));
      b.style.setProperty("--y", (it.y / VH * 100).toFixed(3));
      b.style.setProperty("--d", (it.r * 2 / VW * 100).toFixed(3));
      b.style.setProperty("--z", it.z.toFixed(1) + "px");
      b.style.setProperty("--dn", it.dn.toFixed(3));
      b.style.setProperty("--i", String(i));
      b.style.setProperty("--dur", (7 + rnd() * 6).toFixed(1) + "s");
      b.style.setProperty("--delay", (-rnd() * 9).toFixed(1) + "s");
      b.setAttribute("aria-label", it.mod.name + " — " + it.f.name);
      if (it.mod.desc) b.title = it.mod.desc;

      var ball = document.createElement("span");
      ball.className = "topic-ball";
      var label = document.createElement("span");
      label.textContent = it.mod.name;
      ball.appendChild(label);
      b.appendChild(ball);

      b.addEventListener("click", function () { popTopic(it); });
      topic3d.appendChild(b);
      it.el = b;
    });

    renderTopicLegend(features, legend);
    clearTopicDetail();

    // gentle parallax — the bubbles sit at different depths, so tilting the
    // whole field is what makes it read as 3D rather than as flat circles
    var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (fine && !still) {
      field.addEventListener("pointermove", function (e) {
        var box = field.getBoundingClientRect();
        var px = (e.clientX - box.left) / box.width - 0.5;
        var py = (e.clientY - box.top) / box.height - 0.5;
        topic3d.style.setProperty("--ry", (px * 9).toFixed(2) + "deg");
        topic3d.style.setProperty("--rx", (-py * 6).toFixed(2) + "deg");
      });
      field.addEventListener("pointerleave", function () {
        topic3d.style.setProperty("--ry", "0deg");
        topic3d.style.setProperty("--rx", "0deg");
      });
    }
  }

  /* The legend names all five colours and doubles as a filter, so which area a
     bubble belongs to never rests on colour alone. */
  function renderTopicLegend(features, legend) {
    if (!legend) return;
    features.forEach(function (f, gi) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "topic-leg";
      b.style.setProperty("--c", f.color);
      b.setAttribute("aria-pressed", "true");
      b.innerHTML = '<i aria-hidden="true"></i>';
      b.appendChild(document.createTextNode(f.name));
      var count = document.createElement("b");
      count.textContent = String(f.modules.length);
      b.appendChild(count);
      b.addEventListener("click", function () {
        var on = b.getAttribute("aria-pressed") !== "true";
        b.setAttribute("aria-pressed", on ? "true" : "false");
        topicItems.forEach(function (it) {
          if (it.g === gi) it.el.classList.toggle("dim", !on);
        });
      });
      legend.appendChild(b);
    });
  }

  function clearTopicDetail() {
    if (!topicDetail) return;
    topicDetail.innerHTML =
      '<p class="topic-empty">One bubble for every module in QuantrolPlus, grouped by the ' +
      'area it belongs to. Hover to bring one forward — pop it to see what it does.</p>';
  }

  function showTopicDetail(it) {
    if (!topicDetail) return;
    var ready = it.mod.slides && it.mod.slides.length;
    topicDetail.style.setProperty("--c", it.f.color);
    topicDetail.innerHTML =
      '<span class="topic-from"><i aria-hidden="true"></i>' + esc(it.f.name) + "</span>" +
      "<h3>" + esc(it.mod.name) + "</h3>" +
      (it.mod.desc ? "<p>" + esc(it.mod.desc) + "</p>" : "") +
      (ready
        ? '<button type="button" class="btn btn-primary btn-sm" data-topic-open>Walk through the screens</button>'
        : '<span class="topic-soon">Screens coming soon</span>');
    var open = topicDetail.querySelector("[data-topic-open]");
    if (open) open.addEventListener("click", function () { openStage(it.f, it.mod); });
  }

  /* Burst: shards fly out, the bubble collapses, and the screens for that
     module (if there are any yet) take over the screen. */
  function popTopic(it) {
    var el = it.el;
    if (el.classList.contains("pop") || el.classList.contains("gone")) return;

    showTopicDetail(it);

    var shards = 14;
    for (var s = 0; s < shards; s++) {
      var shard = document.createElement("i");
      shard.className = "topic-shard";
      shard.style.setProperty("--a", (s * (360 / shards) + (s % 3) * 6) + "deg");
      shard.style.setProperty("--dist", (420 + (s % 5) * 95) + "%");
      el.appendChild(shard);
    }
    el.classList.add("pop");

    window.setTimeout(function () {
      el.classList.remove("pop");
      el.classList.add("gone");
      var live = el.querySelectorAll(".topic-shard");
      for (var i = 0; i < live.length; i++) live[i].parentNode.removeChild(live[i]);
      if (it.mod.slides && it.mod.slides.length) openStage(it.f, it.mod);
    }, 430);

    window.setTimeout(function () {
      el.classList.remove("gone");
      el.classList.add("reform");
      window.setTimeout(function () { el.classList.remove("reform"); }, 620);
    }, 2100);
  }

  /* ---------- the fullscreen stage ---------- */
  var stage, bg, phone, textWrap, featureEl, iconEl, indexEl, totalEl, bar,
      prevBtn, nextBtn, closeBtn, backBtn, reduced;
  var slides = [], slideMs = [], index = 0, timer = null, isOpen = false, lastFocused = null;

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
    backBtn = document.getElementById("stageBack");
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    nextBtn.addEventListener("click", next);
    prevBtn.addEventListener("click", prev);
    closeBtn.addEventListener("click", function () { closeStage(false); });
    backBtn.addEventListener("click", function () { closeStage(false); });

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
      // Only a sideways swipe changes screen. Up and down has to stay free to
      // scroll: on a phone the copy is often taller than the screen.
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 45) { dx < 0 ? next() : prev(); }
      else { restartTimer(); }
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
    playOnlyActiveClip();
    restartTimer();
  }
  function next() { goTo(index + 1); }
  // What the timer uses: the walkthrough plays through once and stays on the
  // last screen. Wrapping round made the clips look like they were looping.
  function autoNext() { if (index < slides.length - 1) goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function playOnlyActiveClip() {
    if (!phone) return;
    for (var n = 0; n < phone.children.length; n++) {
      var v = phone.children[n].querySelector("video");
      if (!v) continue;
      if (n !== index || reduced) { v.pause(); continue; }
      try { v.currentTime = 0; } catch (err) { /* not seekable yet */ }
      var playing = v.play();
      if (playing && playing.catch) playing.catch(function () { /* autoplay blocked */ });
    }
  }

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
    if (index >= slides.length - 1) { bar.style.width = "100%"; return; }
    void bar.offsetWidth;
    bar.classList.add("run");
    var ms = slideMs[index] || SLIDE_MS;
    bar.style.transitionDuration = ms + "ms";
    bar.style.width = "100%";
    timer = setTimeout(autoNext, ms);
  }

  /* A caption keeps the lines it was written with: a blank line starts a new
     paragraph, every other line is its own line, and **bold** is bold. Built as
     DOM nodes rather than innerHTML, so nothing in the content folder can inject
     markup into the page. */
  function captionInto(host, text) {
    if (!text) { host.appendChild(document.createElement("p")); return; }
    var para = null;
    text.split("\n").forEach(function (line) {
      if (!line.trim()) { para = null; return; }        // blank line ends the paragraph
      if (!para) { para = document.createElement("p"); host.appendChild(para); }
      else para.appendChild(document.createElement("br"));
      bold(para, line);
    });
    if (!host.querySelector("p")) host.appendChild(document.createElement("p"));
  }
  function bold(host, line) {
    line.split(/\*\*/).forEach(function (part, i) {
      if (!part) return;
      if (i % 2) {                                      // odd chunks sat between **
        var b = document.createElement("strong");
        b.textContent = part;
        host.appendChild(b);
      } else {
        host.appendChild(document.createTextNode(part));
      }
    });
  }

  /* Muted + playsinline is what lets a clip autoplay on a phone at all. The
     clip plays once and holds its last frame, and once its length is known the
     slide runs for exactly that long. */
  function makeClip(s, mod, i) {
    var v = document.createElement("video");
    v.src = s.src;
    if (s.poster) v.poster = s.poster;
    v.muted = true;
    v.defaultMuted = true;
    v.loop = false;                        // one showing, not a loop
    v.playsInline = true;
    v.setAttribute("playsinline", "");        // older iOS reads the attribute
    v.setAttribute("muted", "");
    v.preload = i === 0 ? "auto" : "metadata";
    v.setAttribute("aria-label", s.title || mod.name + " clip " + (i + 1));
    // no autoplay when motion is unwelcome — offer the controls instead
    if (reduced) v.controls = true;
    v.addEventListener("loadedmetadata", function () {
      if (!isFinite(v.duration) || v.duration <= 0) return;
      // The slide lasts as long as the clip, so nothing gets cut off. The floor
      // stops a very short clip from flashing past; the ceiling is only a guard
      // against a file that is long by mistake (the build warns past 15s).
      slideMs[i] = Math.min(60000, Math.max(2500, Math.round(v.duration * 1000)));
      if (index === i && isOpen) restartTimer();
    });
    return v;
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

    // a screen is either a still or a short clip; the clip carries its own
    // length, so the auto-advance waits for it rather than cutting it off
    slideMs = slides.map(function () { return SLIDE_MS; });

    slides.forEach(function (s, i) {
      var layer = document.createElement("div");
      layer.className = "stage-bg-layer";
      var behind = s.type === "video" ? s.poster : s.src;
      if (behind) layer.style.backgroundImage = 'url("' + behind + '")';
      bg.appendChild(layer);

      var cell = document.createElement("div");
      cell.className = "stage-slide";
      if (s.type === "video") {
        cell.appendChild(makeClip(s, mod, i));
      } else {
        var img = document.createElement("img");
        img.src = s.src;
        img.alt = s.title || mod.name + " screen " + (i + 1);
        cell.appendChild(img);
      }
      phone.appendChild(cell);

      var el = document.createElement("div");
      el.className = "stage-el";
      var h = document.createElement("h2");
      h.textContent = s.title || "";
      el.appendChild(h);
      captionInto(el, s.caption || "");
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
    // ...but not so much that a long caption leaves a crater under a short one,
    // and not at all once the copy is stacked under the phone — there the whole
    // column scrolls, and a min-height would just override the max-height.
    textWrap.style.minHeight = window.innerWidth > 860
      ? Math.min(tallest, Math.round(window.innerHeight * 0.45)) + "px"
      : "";

    goTo(0);
    backBtn.focus();
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
