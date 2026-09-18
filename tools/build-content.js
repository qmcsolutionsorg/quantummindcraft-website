#!/usr/bin/env node
/*
 * Scans public/content/ and writes public/content.json.
 *
 * Static hosting can't list a directory, so the site reads this manifest
 * instead. It regenerates automatically on `firebase deploy` (see the
 * "predeploy" hook in firebase.json) — you never edit it by hand.
 *
 * Folder layout:
 *
 *   public/content/
 *     4-health/                     <- a feature (number prefix = order)
 *       _feature.txt                <- name / color / icon / desc
 *       _extra.html                 <- optional extra markup for the section
 *       2-tracker/                  <- a module (number prefix = order)
 *         _module.txt               <- optional: name
 *         01-vitals.jpeg            <- a screen
 *         01-vitals.txt             <- line 1 = title, rest = description
 *
 * Anything without a .txt beside it still shows; the filename is used as
 * the title. Drop in a folder, drop in images, deploy. No code changes.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "public", "content");
const OUT = path.join(ROOT, "public", "content.json");
const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif)$/i;
const VIDEO_RE = /\.(mp4|webm|m4v|mov)$/i;
const BIG_VIDEO = 6 * 1024 * 1024;   // warn past this; clips load over mobile data too

function dirs(p) {
  if (!fs.existsSync(p)) return [];
  return fs.readdirSync(p, { withFileTypes: true })
    .filter(function (d) { return d.isDirectory() && !d.name.startsWith("_") && !d.name.startsWith("."); })
    .map(function (d) { return d.name; })
    .sort(natural);
}
function files(p) {
  return fs.readdirSync(p, { withFileTypes: true })
    .filter(function (d) { return d.isFile(); })
    .map(function (d) { return d.name; })
    .sort(natural);
}
// "2-tracker" sorts before "10-x"; plain alphabetical would not
function natural(a, b) {
  return a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });
}
// strip the ordering prefix and tidy up: "8-pregnancy-and-moms-diary" -> "Pregnancy and moms diary"
function pretty(name) {
  var s = name.replace(/^\d+[-_. ]*/, "").replace(/[-_]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}
// "key: value" lines -> object
function readMeta(file) {
  var out = {};
  if (!fs.existsSync(file)) return out;
  fs.readFileSync(file, "utf8").split(/\r?\n/).forEach(function (line) {
    var i = line.indexOf(":");
    if (i < 0 || !line.trim() || line.trim().startsWith("#")) return;
    out[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
  });
  return out;
}
// A folder or file name may contain spaces or other characters that are not
// legal in a URL, so build the path one encoded segment at a time. Doing this
// with a plain string join is how "02 - Babys Diary.mp4" ends up 404ing.
function urlFor() {
  return ["content"].concat(Array.prototype.slice.call(arguments))
    .map(encodeURIComponent).join("/");
}

// Images are cached for a year, so a replaced picture would keep serving the
// old copy. Stamping the URL with a hash of the file makes a changed image a
// changed URL, which no cache can reuse.
function stamp(urlPath, filePath) {
  var h = crypto.createHash("md5").update(fs.readFileSync(filePath)).digest("hex").slice(0, 8);
  return urlPath + "?v=" + h;
}

// How long a clip runs, in seconds, read out of the mp4/m4v/mov header
// (moov > mvhd). Returns 0 for anything else, .webm included — this only
// drives a warning, so not knowing is fine.
function atom(buf, from, to, name) {
  var i = from;
  while (i + 8 <= to) {
    var size = buf.readUInt32BE(i);
    var type = buf.toString("latin1", i + 4, i + 8);
    var head = 8;
    if (size === 1) {                       // 64-bit size follows the header
      if (i + 16 > to) return null;
      size = Number(buf.readBigUInt64BE(i + 8));
      head = 16;
    } else if (size === 0) {                // runs to the end of its parent
      size = to - i;
    }
    if (size < head || i + size > to) return null;
    if (type === name) return { start: i + head, end: i + size };
    i += size;
  }
  return null;
}
function videoSeconds(file) {
  var buf;
  try { buf = fs.readFileSync(file); } catch (e) { return 0; }
  var moov = atom(buf, 0, buf.length, "moov");
  if (!moov) return 0;
  var mvhd = atom(buf, moov.start, moov.end, "mvhd");
  if (!mvhd) return 0;
  var b = mvhd.start, scale, dur;
  if (buf[b] === 1) {
    if (b + 32 > mvhd.end) return 0;
    scale = buf.readUInt32BE(b + 20);
    dur = Number(buf.readBigUInt64BE(b + 24));
  } else {
    if (b + 20 > mvhd.end) return 0;
    scale = buf.readUInt32BE(b + 12);
    dur = buf.readUInt32BE(b + 16);
  }
  return scale > 0 ? dur / scale : 0;
}

// Sidecar text: the first non-empty line is the title, the rest is the body.
// The body keeps the line structure it was written with — a blank line is a
// paragraph break and each line stands on its own, so a bulleted list stays a
// list instead of collapsing into one run-on sentence.
function readCaption(file) {
  if (!fs.existsSync(file)) return null;
  var lines = fs.readFileSync(file, "utf8").split(/\r?\n/).map(function (l) { return l.trim(); });
  while (lines.length && !lines[0]) lines.shift();
  if (!lines.length) return null;
  var title = lines.shift().replace(/^#+\s*/, "");     // a stray markdown heading mark
  while (lines.length && !lines[0]) lines.shift();
  while (lines.length && !lines[lines.length - 1]) lines.pop();
  var body = [];
  lines.forEach(function (l) {
    if (!l && !body.length) return;
    if (!l && !body[body.length - 1]) return;          // never two blanks in a row
    body.push(l);
  });
  return { title: title, caption: body.join("\n") };
}

var warnings = [];
var features = dirs(CONTENT).map(function (fdir) {
  var fpath = path.join(CONTENT, fdir);
  var meta = readMeta(path.join(fpath, "_feature.txt"));
  var extraPath = path.join(fpath, "_extra.html");

  // optional section backdrop: any file named _background.<image ext>
  var bgFile = files(fpath).filter(function (n) {
    return /^_background\./i.test(n) && IMAGE_RE.test(n);
  })[0];

  var modules = dirs(fpath).map(function (mdir) {
    var mpath = path.join(fpath, mdir);
    var mmeta = readMeta(path.join(mpath, "_module.txt"));
    var all = files(mpath);

    // A screen is an image or a short video. A video and an image sharing a
    // base name are one screen: the image becomes the video's poster rather
    // than a screen of its own.
    var media = {}, order = [];
    all.forEach(function (n) {
      var vid = VIDEO_RE.test(n), img = IMAGE_RE.test(n);
      if (!vid && !img) return;
      var base = n.replace(vid ? VIDEO_RE : IMAGE_RE, "");
      if (!media[base]) { media[base] = {}; order.push(base); }
      media[base][vid ? "video" : "image"] = n;
    });

    var slides = order.map(function (base) {
      var m = media[base];
      var file = m.video || m.image;
      var text = readCaption(path.join(mpath, base + ".txt"));
      var slide = {
        type: m.video ? "video" : "image",
        src: stamp(urlFor(fdir, mdir, file), path.join(mpath, file)),
        title: (text && text.title) || pretty(base),
        caption: (text && text.caption) || ""
      };
      if (m.video) {
        // shown while the clip loads, and used for the blurred backdrop
        if (m.image) slide.poster = stamp(urlFor(fdir, mdir, m.image),
                                          path.join(mpath, m.image));
        var bytes = fs.statSync(path.join(mpath, m.video)).size;
        if (bytes > BIG_VIDEO) {
          warnings.push(fdir + "/" + mdir + "/" + m.video + " is " +
            Math.round(bytes / 1048576) + " MB - keep clips a few seconds and under 6 MB");
        }
        var secs = videoSeconds(path.join(mpath, m.video));
        if (secs > 15) {
          warnings.push(fdir + "/" + mdir + "/" + m.video + " runs " + secs.toFixed(0) +
            "s - the walkthrough holds on it that long before moving on");
        }
      }
      return slide;
    });

    // flag stray .txt files that don't pair with an image — usually a typo
    all.filter(function (n) { return /\.txt$/i.test(n) && !n.startsWith("_"); }).forEach(function (t) {
      var base = t.replace(/\.txt$/i, "");
      var paired = order.indexOf(base) >= 0;
      if (!paired) warnings.push(fdir + "/" + mdir + "/" + t + " has no matching image or video");
    });

    return { key: mdir, name: mmeta.name || pretty(mdir), desc: mmeta.desc || "", slides: slides };
  });

  return {
    key: fdir,
    id: (meta.id || pretty(fdir).toLowerCase().replace(/[^a-z0-9]+/g, "-")),
    name: meta.name || pretty(fdir),
    color: meta.color || "#3B82F6",
    icon: meta.icon || "growth",
    desc: meta.desc || "",
    extra: fs.existsSync(extraPath) ? fs.readFileSync(extraPath, "utf8") : "",
    background: bgFile ? stamp(urlFor(fdir, bgFile), path.join(fpath, bgFile)) : "",
    // how strongly the backdrop shows through, 0–1
    bgOpacity: meta.bgopacity || "",
    modules: modules
  };
});

fs.writeFileSync(OUT, JSON.stringify({ features: features }, null, 2));

/* ── Crawlable copy, a sitemap and robots.txt ────────────────────────────────
 *
 * Google reported the homepage as "Crawled — currently not indexed", so the
 * site appeared nowhere in search. The cause is that the page a crawler
 * receives is a shell: every feature and module name lives in content.json and
 * is injected by script.js. Google can render JavaScript, but it is a deferred
 * second pass and thin first-pass HTML is exactly what gets skipped.
 *
 * So the same data that becomes content.json is also written into index.html
 * as real markup, between two markers. It is not hidden — hiding text from
 * users while showing it to crawlers is cloaking, and is punished. It sits in
 * the footer as a plain index of everything the app covers, which is honestly
 * useful to a visitor too.
 */
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

var indexHtml = path.join(ROOT, "public", "index.html");
var START = "<!-- BUILD:INDEX -->";
var END = "<!-- /BUILD:INDEX -->";

var block = [START,
  '<section class="site-index" aria-label="Everything QuantrolPlus covers">',
  '<div class="container">',
  '<h2>Everything QuantrolPlus covers</h2>'];

features.forEach(function (f) {
  block.push('<div class="site-index-group">');
  block.push("<h3>" + esc(f.name) + "</h3>");
  if (f.desc) block.push("<p>" + esc(f.desc) + "</p>");
  block.push("<ul>");
  f.modules.forEach(function (m) {
    block.push("<li><strong>" + esc(m.name) + "</strong>"
      + (m.desc ? " — " + esc(m.desc) : "") + "</li>");
  });
  block.push("</ul></div>");
});
block.push("</div></section>", END);

var html = fs.readFileSync(indexHtml, "utf8");
var a = html.indexOf(START), b = html.indexOf(END);
if (a >= 0 && b > a) {
  html = html.slice(0, a) + block.join("\n") + html.slice(b + END.length);
  fs.writeFileSync(indexHtml, html);
  console.log("index.html: crawlable index rewritten");
} else {
  console.log("index.html: WARNING - BUILD:INDEX markers not found, skipped");
}

// One page, so the sitemap is short — but "No referring sitemaps detected" is
// what Search Console says today, and an explicit sitemap is how Google is
// told the page is meant to be indexed.
fs.writeFileSync(path.join(ROOT, "public", "sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  "  <url>\n" +
  "    <loc>https://quantummindcraft.com/</loc>\n" +
  "    <lastmod>" + new Date().toISOString().slice(0, 10) + "</lastmod>\n" +
  "    <changefreq>weekly</changefreq>\n" +
  "  </url>\n" +
  "</urlset>\n");

fs.writeFileSync(path.join(ROOT, "public", "robots.txt"),
  "User-agent: *\n" +
  "Allow: /\n\n" +
  "Sitemap: https://quantummindcraft.com/sitemap.xml\n");

console.log("sitemap.xml and robots.txt written");

var mods = features.reduce(function (n, f) { return n + f.modules.length; }, 0);
var pics = features.reduce(function (n, f) {
  return n + f.modules.reduce(function (m, mod) { return m + mod.slides.length; }, 0);
}, 0);
console.log("content.json: " + features.length + " features, " + mods + " modules, " + pics + " screens");
warnings.forEach(function (w) { console.log("  warning: " + w); });
