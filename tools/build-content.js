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

const ROOT = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "public", "content");
const OUT = path.join(ROOT, "public", "content.json");
const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif)$/i;

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
// sidecar text: first line is the title, the rest is the description
function readCaption(file) {
  if (!fs.existsSync(file)) return null;
  var lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(function (l) { return l.trim(); });
  if (!lines.length) return null;
  return { title: lines[0].trim(), caption: lines.slice(1).join(" ").trim() };
}

var warnings = [];
var features = dirs(CONTENT).map(function (fdir) {
  var fpath = path.join(CONTENT, fdir);
  var meta = readMeta(path.join(fpath, "_feature.txt"));
  var extraPath = path.join(fpath, "_extra.html");

  var modules = dirs(fpath).map(function (mdir) {
    var mpath = path.join(fpath, mdir);
    var mmeta = readMeta(path.join(mpath, "_module.txt"));
    var all = files(mpath);

    var slides = all.filter(function (n) { return IMAGE_RE.test(n); }).map(function (img) {
      var base = img.replace(IMAGE_RE, "");
      var text = readCaption(path.join(mpath, base + ".txt"));
      return {
        src: "content/" + fdir + "/" + mdir + "/" + img,
        title: (text && text.title) || pretty(base),
        caption: (text && text.caption) || ""
      };
    });

    // flag stray .txt files that don't pair with an image — usually a typo
    all.filter(function (n) { return /\.txt$/i.test(n) && !n.startsWith("_"); }).forEach(function (t) {
      var base = t.replace(/\.txt$/i, "");
      var paired = all.some(function (n) { return IMAGE_RE.test(n) && n.replace(IMAGE_RE, "") === base; });
      if (!paired) warnings.push(fdir + "/" + mdir + "/" + t + " has no matching image");
    });

    return { key: mdir, name: mmeta.name || pretty(mdir), slides: slides };
  });

  return {
    key: fdir,
    id: (meta.id || pretty(fdir).toLowerCase().replace(/[^a-z0-9]+/g, "-")),
    name: meta.name || pretty(fdir),
    color: meta.color || "#3B82F6",
    icon: meta.icon || "growth",
    desc: meta.desc || "",
    extra: fs.existsSync(extraPath) ? fs.readFileSync(extraPath, "utf8") : "",
    modules: modules
  };
});

fs.writeFileSync(OUT, JSON.stringify({ features: features }, null, 2));

var mods = features.reduce(function (n, f) { return n + f.modules.length; }, 0);
var pics = features.reduce(function (n, f) {
  return n + f.modules.reduce(function (m, mod) { return m + mod.slides.length; }, 0);
}, 0);
console.log("content.json: " + features.length + " features, " + mods + " modules, " + pics + " screens");
warnings.forEach(function (w) { console.log("  warning: " + w); });
