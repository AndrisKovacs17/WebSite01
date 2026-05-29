#!/usr/bin/env node
/**
 * tools/check-routes.js
 *
 * Validates the built dist/ output for clean-URL Netlify compatibility.
 * Run AFTER `npm run build:static`.
 *
 * Checks:
 *  1. Every route in routes.json has a corresponding dist/ROUTE/index.html
 *  2. No internal href in built HTML files points to a .html file (except #fragments)
 *  3. No internal href points to /sites/ paths
 *  4. No internal href points to /pages/ paths (old build format)
 *  5. Every sitemap <loc> URL resolves to a dist/ROUTE/index.html
 *  6. Every _redirects rule target exists in dist/
 *
 * Usage:
 *   node tools/check-routes.js
 *   node tools/check-routes.js --verbose
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const ROUTES_FILE = path.join(ROOT, "src", "routes.json");
const VERBOSE = process.argv.includes("--verbose");

let errors = 0;
let warnings = 0;

function pass(msg) { if (VERBOSE) console.log(`  ✅ ${msg}`); }
function warn(msg) { console.warn(`  ⚠️  ${msg}`); warnings++; }
function fail(msg) { console.error(`  ❌ ${msg}`); errors++; }
function section(title) { console.log(`\n── ${title}`); }

// ── helpers ──────────────────────────────────────────────────────────────────

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });
}

function stripLeadingSlash(v) { return v.replace(/^\/+/, ""); }

function routePath(route) {
  if (route.output) return path.join(DIST, route.output);
  if (route.path === "/") return path.join(DIST, "index.html");
  return path.join(DIST, stripLeadingSlash(route.path), "index.html");
}

function collectRoutes() {
  const config = JSON.parse(fs.readFileSync(ROUTES_FILE, "utf8"));
  const routes = config.routes.map((r) => ({ ...r }));
  const seenSources = new Set(routes.map((r) => r.source));

  for (const group of config.generatedGroups || []) {
    const sourceDir = path.join(ROOT, group.sourceDir);
    if (!fs.existsSync(sourceDir)) continue;

    if (group.dirMode) {
      // New structure: each subdirectory with index.html is a route.
      // ROUTE/SLUG/index.html → pathPrefix/SLUG (mirrors build-static.js)
      for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const indexFile = path.join(sourceDir, entry.name, "index.html");
        if (!fs.existsSync(indexFile)) continue;
        const rel = path.relative(ROOT, indexFile).split(path.sep).join("/");
        if (seenSources.has(rel)) continue;
        routes.push({ source: rel, path: `${group.pathPrefix}/${entry.name}` });
        seenSources.add(rel);
      }
      continue;
    }

    // Legacy structure: flat .html files in sourceDir.
    for (const file of walk(sourceDir)) {
      if (!file.endsWith(".html")) continue;
      const rel = path.relative(ROOT, file).split(path.sep).join("/");
      if (seenSources.has(rel)) continue;
      const slug = path.basename(rel, ".html");
      routes.push({ source: rel, path: `${group.pathPrefix}/${slug}` });
      seenSources.add(rel);
    }
  }
  return routes;
}

// ── check 1: every route has dist output ─────────────────────────────────────

section("Check 1: every route has dist/ROUTE/index.html");
if (!fs.existsSync(DIST)) {
  fail(`dist/ does not exist — run 'npm run build:static' first`);
  process.exit(1);
}

const routes = collectRoutes();
for (const route of routes) {
  const expected = routePath(route);
  if (fs.existsSync(expected)) {
    pass(`${route.path} → ${path.relative(DIST, expected)}`);
  } else {
    fail(`Missing: ${path.relative(DIST, expected)}  (route: ${route.path})`);
  }
}

// ── check 2-4: built HTML internal links ─────────────────────────────────────

section("Check 2–4: no .html / /sites/ / /pages/ internal links in built HTML");

const HREF_RE = /\bhref=("|')([^"']+)\1/gi;
const SRC_RE  = /\bsrc=("|')([^"']+)\1/gi;

const htmlFiles = walk(DIST).filter((f) => f.endsWith(".html"));

for (const file of htmlFiles) {
  const rel = path.relative(DIST, file);
  const content = fs.readFileSync(file, "utf8");

  let m;
  while ((m = HREF_RE.exec(content)) !== null) {
    const url = m[2];
    if (/^(?:https?:|mailto:|tel:|#|javascript:)/i.test(url)) continue;
    if (url.startsWith("/sites/")) fail(`${rel}: internal /sites/ href: ${url}`);
    if (url.startsWith("/pages/")) fail(`${rel}: internal /pages/ href: ${url}`);
    if (/\.html(\?|#|$)/.test(url) && !url.startsWith("http")) {
      warn(`${rel}: .html href: ${url}`);
    }
  }
  while ((m = SRC_RE.exec(content)) !== null) {
    const url = m[2];
    if (/^(?:https?:|data:)/i.test(url)) continue;
    if (url.startsWith("/sites/")) fail(`${rel}: /sites/ src: ${url}`);
  }
}

// ── check 5: sitemap URLs ─────────────────────────────────────────────────────

section("Check 5: sitemap.xml URLs resolve to dist files");
const sitemapPath = path.join(DIST, "sitemap.xml");
if (!fs.existsSync(sitemapPath)) {
  warn("dist/sitemap.xml not found");
} else {
  const sitemapContent = fs.readFileSync(sitemapPath, "utf8");
  const origin = "https://biztor.hu";
  const locRe = /<loc>([^<]+)<\/loc>/g;
  let lm;
  while ((lm = locRe.exec(sitemapContent)) !== null) {
    const loc = lm[1];
    if (!loc.startsWith(origin)) continue;
    const routePart = loc.slice(origin.length);
    const clean = routePart === "/" ? "/" : routePart.replace(/\/$/, "");
    let expected;
    if (clean === "/") {
      expected = path.join(DIST, "index.html");
    } else {
      expected = path.join(DIST, stripLeadingSlash(clean), "index.html");
    }
    if (fs.existsSync(expected)) {
      pass(`sitemap: ${loc}`);
    } else {
      fail(`sitemap URL has no dist file: ${loc}  (expected ${path.relative(DIST, expected)})`);
    }
  }
}

// ── check 6: _redirects targets ──────────────────────────────────────────────

section("Check 6: _redirects targets exist in dist/");
const redirectsPath = path.join(DIST, "_redirects");
if (!fs.existsSync(redirectsPath)) {
  warn("dist/_redirects not found");
} else {
  const lines = fs.readFileSync(redirectsPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) continue;
    const target = parts[1];
    if (!target.startsWith("/")) continue;
    const clean = target === "/" ? "/" : target.replace(/\/$/, "");
    let expected;
    if (clean === "/" || clean === "") {
      expected = path.join(DIST, "index.html");
    } else {
      expected = path.join(DIST, stripLeadingSlash(clean), "index.html");
    }
    if (fs.existsSync(expected)) {
      pass(`_redirects target OK: ${target}`);
    } else {
      // could be a static file
      const staticTarget = path.join(DIST, stripLeadingSlash(clean));
      if (fs.existsSync(staticTarget)) {
        pass(`_redirects target OK (static): ${target}`);
      } else {
        warn(`_redirects target may be missing: ${target}`);
      }
    }
  }
}

// ── summary ──────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(55)}`);
if (errors === 0 && warnings === 0) {
  console.log("✅ All checks passed.");
} else {
  if (errors > 0) console.error(`❌ ${errors} error(s) found.`);
  if (warnings > 0) console.warn(`⚠️  ${warnings} warning(s) found.`);
}
console.log("─".repeat(55));
process.exit(errors > 0 ? 1 : 0);
