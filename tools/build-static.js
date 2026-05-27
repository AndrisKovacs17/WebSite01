const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const ROUTES_FILE = path.join(ROOT, "src", "routes.json");
const MARKER = ".generated-by-biztor-build";

const config = JSON.parse(fs.readFileSync(ROUTES_FILE, "utf8"));

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function stripLeadingSlash(value) {
  return value.replace(/^\/+/, "");
}

function normalizeRoute(routePath) {
  if (!routePath || routePath === "/") return "/";
  return `/${stripLeadingSlash(routePath).replace(/\/+$/, "")}`;
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

function routeOutput(route) {
  if (route.output) return path.join(DIST, route.output);
  if (route.path === "/") return path.join(DIST, "index.html");
  return path.join(DIST, stripLeadingSlash(route.path), "index.html");
}

function prepareDist() {
  if (!fs.existsSync(DIST)) {
    fs.mkdirSync(DIST, { recursive: true });
    return;
  }
  const markerPath = path.join(DIST, MARKER);
  if (!fs.existsSync(markerPath)) {
    throw new Error("Refusing to clean dist/: build marker is missing.");
  }
}

function copyPath(sourceRel, destinationRel = sourceRel) {
  const source = path.join(ROOT, sourceRel);
  if (!fs.existsSync(source)) return;
  copyMissing(source, path.join(DIST, destinationRel));
}

function copyMissing(source, destination) {
  const stats = fs.statSync(source);
  if (stats.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyMissing(path.join(source, entry), path.join(destination, entry));
    }
    return;
  }

  if (fs.existsSync(destination)) {
    const destinationStats = fs.statSync(destination);
    if (
      destinationStats.size === stats.size &&
      destinationStats.mtimeMs >= stats.mtimeMs
    ) {
      return;
    }
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function collectRoutes() {
  const routes = config.routes.map((route) => ({
    ...route,
    source: toPosix(route.source),
    path: normalizeRoute(route.path)
  }));
  const seenSources = new Set(routes.map((route) => route.source));

  for (const group of config.generatedGroups || []) {
    const sourceDir = path.join(ROOT, group.sourceDir);

    if (group.dirMode) {
      // New structure: each subdirectory with index.html is a route.
      // ROUTE/SLUG/index.html → pathPrefix/SLUG
      if (!fs.existsSync(sourceDir)) continue;
      for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const indexFile = path.join(sourceDir, entry.name, "index.html");
        if (!fs.existsSync(indexFile)) continue;
        const rel = toPosix(path.relative(ROOT, indexFile));
        if (seenSources.has(rel)) continue;
        const slug = entry.name;
        routes.push({
          source: rel,
          path: normalizeRoute(`${group.pathPrefix}/${slug}`),
        });
        seenSources.add(rel);
      }
    } else {
      // Legacy structure: flat .html files in sourceDir.
      for (const file of walk(sourceDir)) {
        if (!file.endsWith(".html")) continue;
        const rel = toPosix(path.relative(ROOT, file));
        if (seenSources.has(rel)) continue;
        const slug = path.basename(rel, ".html");
        routes.push({
          source: rel,
          path: normalizeRoute(`${group.pathPrefix}/${slug}`),
        });
        seenSources.add(rel);
      }
    }
  }

  const seenPaths = new Map();
  for (const route of routes) {
    if (seenPaths.has(route.path)) {
      throw new Error(`Duplicate route path ${route.path}: ${seenPaths.get(route.path)} and ${route.source}`);
    }
    seenPaths.set(route.path, route.source);
  }

  return routes;
}

function resolveSourceUrl(urlValue, sourceRel) {
  const sourceDir = path.posix.dirname(sourceRel);
  const withoutQuery = urlValue.split(/[?#]/)[0];
  const suffix = urlValue.slice(withoutQuery.length);
  const resolved = withoutQuery.startsWith("/")
    ? stripLeadingSlash(withoutQuery)
    : clampRelativePath(sourceDir, withoutQuery);
  return { resolved, suffix };
}

function isExternalOrSpecial(urlValue) {
  return /^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(urlValue);
}

function clampRelativePath(sourceDir, urlPath) {
  const parts = `${sourceDir}/${urlPath}`.split("/");
  const stack = [];
  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") {
      if (stack.length > 0) stack.pop();
      continue;
    }
    stack.push(part);
  }
  return stack.join("/");
}

function createRewriter(routes) {
  const sourceToRoute = new Map(routes.map((route) => [route.source, route.path]));
  const localAssetPrefixes = ["css/", "img/", "js/", "lib/", "scss/"];
  const rootAssetNames = new Set(config.rootAssets || []);

  return function rewriteUrl(urlValue, sourceRel) {
    if (!urlValue || urlValue.startsWith("{{")) return urlValue;
    const normalizedUrl = urlValue.replace(/\\\//g, "/").replace(/\\/g, "/");
    const embeddedExternal = normalizedUrl.match(/^(?:\.{1,2}\/)+(https?:\/\/.+)$/i);
    if (embeddedExternal) return embeddedExternal[1];
    if (isExternalOrSpecial(normalizedUrl)) return normalizedUrl;

    const { resolved, suffix } = resolveSourceUrl(normalizedUrl, sourceRel);
    if (sourceToRoute.has(resolved)) return `${sourceToRoute.get(resolved)}${suffix}`;

    if (resolved === "index.html") return `/${suffix}`;
    if (resolved.endsWith("agents.html")) return "/kapcsolat";

    if (resolved.endsWith(".html")) {
      return `/${resolved}${suffix}`;
    }

    if (localAssetPrefixes.some((prefix) => resolved.startsWith(prefix)) || rootAssetNames.has(resolved)) {
      return `/${resolved}${suffix}`;
    }

    return normalizedUrl;
  };
}

function setOrInsertHeadTag(html, tagRegex, tagHtml) {
  if (tagRegex.test(html)) return html.replace(tagRegex, tagHtml);
  return html.replace(/<head([^>]*)>/i, `<head$1>\n    ${tagHtml}`);
}

function rewriteHtml(html, route, rewriteUrl) {
  const canonicalUrl = `${config.siteOrigin}${route.path === "/" ? "/" : route.path + "/"}`;

  html = html.replace(
    /\s*<base\b[^>]*>\s*/gi,
    "\n"
  );

  html = html.replace(
    /\b(href|src|action)=("|')([^"']+)\2/gi,
    (match, attr, quote, urlValue) => `${attr}=${quote}${rewriteUrl(urlValue, route.source)}${quote}`
  );

  html = html.replace(/\bsrcset=("|')([^"']+)\1/gi, (match, quote, srcsetValue) => {
    const rewritten = srcsetValue
      .split(",")
      .map((candidate) => {
        const trimmed = candidate.trim();
        if (!trimmed) return trimmed;
        const parts = trimmed.split(/\s+/);
        const url = parts.shift();
        return [rewriteUrl(url, route.source), ...parts].join(" ");
      })
      .join(", ");
    return `srcset=${quote}${rewritten}${quote}`;
  });

  html = html.replace(/url\((["']?)([^"')]+)\1\)/gi, (match, quote, urlValue) => {
    return `url(${quote}${rewriteUrl(urlValue, route.source)}${quote})`;
  });

  html = html.replace(/(["'])\/\.\.\//g, "$1/");

  html = setOrInsertHeadTag(
    html,
    /<link\s+rel=(["'])canonical\1\s+href=(["'])[^"']+\2\s*\/?>/i,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );

  html = setOrInsertHeadTag(
    html,
    /<meta\s+property=(["'])og:url\1\s+content=(["'])[^"']+\2\s*\/?>/i,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );

  html = html.replace(
    /<link\s+rel=(["'])alternate\1\s+hreflang=(["'])(hu|x-default)\2\s+href=(["'])[^"']+\4\s*\/?>/gi,
    (match, q1, q2, lang) => `<link rel="alternate" hreflang="${lang}" href="${canonicalUrl}" />`
  );

  return html;
}

function writeGeneratedHtaccess(routes) {
  const rules = [];
  rules.push("# Generated by tools/build-static.js");
  rules.push("<IfModule mod_rewrite.c>");
  rules.push("  RewriteEngine On");
  rules.push("  RewriteBase /");
  rules.push("");
  rules.push("  # Legacy source-path redirects");

  for (const route of routes) {
    if (!route.source.startsWith("sites/") || route.path === "/404") continue;
    const pattern = route.source
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\\\.html$/, "\\.html");
    rules.push(`  RewriteCond %{THE_REQUEST} \\s/+${pattern}[\\s?] [NC]`);
    rules.push(`  RewriteRule ^${pattern}$ ${route.path}/ [R=301,L]`);
  }

  rules.push("");
  rules.push("  # Clean public routes");
  for (const route of routes) {
    if (route.path === "/" || route.path === "/404") continue;
    const target = toPosix(path.relative(DIST, routeOutput(route)));
    const pattern = stripLeadingSlash(route.path).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    rules.push(`  RewriteRule ^${pattern}/?$ ${target} [L]`);
  }
  rules.push("");
  rules.push("  ErrorDocument 404 /404.html");
  rules.push("</IfModule>");
  rules.push("");

  fs.writeFileSync(path.join(DIST, ".htaccess"), rules.join("\n"), "utf8");
}

function xmlEscape(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function writeSitemap(routes) {
  const today = new Date().toISOString().slice(0, 10);
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>'];
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  for (const route of routes) {
    if (route.path === "/404") continue;
    if (route.noindex) continue;
    lines.push("  <url>");
    lines.push(`    <loc>${xmlEscape(`${config.siteOrigin}${route.path === "/" ? "/" : route.path + "/"}`)}</loc>`);
    lines.push(`    <lastmod>${today}</lastmod>`);
    lines.push("    <changefreq>monthly</changefreq>");
    lines.push(`    <priority>${route.path === "/" ? "1.0" : "0.8"}</priority>`);
    lines.push("  </url>");
  }
  lines.push("</urlset>");
  lines.push("");
  fs.writeFileSync(path.join(DIST, "sitemap.xml"), lines.join("\n"), "utf8");
}

function writeNetlifyRedirects() {
  // Copy source-level _redirects generated by tools/migrate-source.js
  const sourceRedirects = path.join(ROOT, "_redirects");
  if (fs.existsSync(sourceRedirects)) {
    fs.copyFileSync(sourceRedirects, path.join(DIST, "_redirects"));
    return;
  }
  // Fallback: minimal SEO keyword aliases
  const lines = ["# Generated by tools/build-static.js", ""];
  const aliases = [
    ["/flotta-biztositas", "/kgfb-flotta/"],
    ["/flotta-biztositas-ar", "/kgfb-flotta/"],
    ["/flotta-biztositas-arak", "/kgfb-flotta/"],
    ["/ceges-casco-onresz", "/casco-flotta/"],
    ["/casco-onresz-mennyi", "/casco-flotta/"],
    ["/jegkar-biztositas-vallalkozas", "/vallalkozasbiztositas/"],
    ["/jegkar-biztositas-mezogazdasag", "/mezogazdasagi-biztositas/"],
    ["/kgfb-kalkulalas", "/kotelezo-biztositas/"],
    ["/lakasbiztositas-arak", "/lakasbiztositas/"],
  ];
  for (const [from, to] of aliases) {
    lines.push(`${from}  ${to}  301`);
  }
  lines.push("");
  fs.writeFileSync(path.join(DIST, "_redirects"), lines.join("\n"), "utf8");
}

function build() {
  const routes = collectRoutes();
  const rewriteUrl = createRewriter(routes);

  prepareDist();
  fs.writeFileSync(path.join(DIST, MARKER), "Do not edit generated files.\n", "utf8");

  for (const dir of config.assetDirs || []) copyPath(dir);
  for (const asset of config.rootAssets || []) copyPath(asset);

  for (const route of routes) {
    const source = path.join(ROOT, route.source);
    if (!fs.existsSync(source)) {
      throw new Error(`Missing route source: ${route.source}`);
    }
    const output = routeOutput(route);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    const html = fs.readFileSync(source, "utf8");
    fs.writeFileSync(output, rewriteHtml(html, route, rewriteUrl), "utf8");
  }

  writeGeneratedHtaccess(routes);
  writeNetlifyRedirects();
  writeSitemap(routes);
  console.log(`Built ${routes.length} routes into ${path.relative(ROOT, DIST)}/`);
}

build();
