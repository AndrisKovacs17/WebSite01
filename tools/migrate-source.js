/**
 * tools/migrate-source.js
 *
 * One-time script: migrates source HTML files from sites/ structure
 * to clean URL directory structure (ROUTE/index.html).
 *
 * Usage:
 *   node tools/migrate-source.js          # dry run (no changes)
 *   node tools/migrate-source.js --write  # apply migration
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ROUTES_FILE = path.join(ROOT, "src", "routes.json");
const DRY_RUN = !process.argv.includes("--write");

if (DRY_RUN) {
  console.log("DRY RUN — pass --write to apply changes\n");
} else {
  console.log("WRITING migration to source tree\n");
}

const config = JSON.parse(fs.readFileSync(ROUTES_FILE, "utf8"));

// ---- Helpers ---------------------------------------------------------------

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

function resolveSourceUrl(urlValue, sourceRel) {
  const sourceDir = path.posix.dirname(sourceRel);
  const withoutQuery = urlValue.split(/[?#]/)[0];
  const suffix = urlValue.slice(withoutQuery.length);
  const resolved = withoutQuery.startsWith("/")
    ? stripLeadingSlash(withoutQuery)
    : clampRelativePath(sourceDir, withoutQuery);
  return { resolved, suffix };
}

// ---- Route collection ------------------------------------------------------

function collectAllRoutes() {
  const routes = config.routes.map((route) => ({
    ...route,
    source: toPosix(route.source),
    path: normalizeRoute(route.path),
  }));
  const seenSources = new Set(routes.map((r) => r.source));

  for (const group of config.generatedGroups || []) {
    const sourceDir = path.join(ROOT, group.sourceDir);
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

  return routes;
}

// ---- URL rewriter (same logic as build-static.js) --------------------------

function createRewriter(routes) {
  const sourceToRoute = new Map(routes.map((r) => [r.source, r.path]));
  const localAssetPrefixes = ["css/", "img/", "js/", "lib/", "scss/"];
  const rootAssetNames = new Set(config.rootAssets || []);

  return function rewriteUrl(urlValue, sourceRel) {
    if (!urlValue || urlValue.startsWith("{{")) return urlValue;
    const normalizedUrl = urlValue.replace(/\\\//g, "/").replace(/\\/g, "/");
    const embeddedExternal = normalizedUrl.match(/^(?:\.{1,2}\/)+(https?:\/\/.+)$/i);
    if (embeddedExternal) return embeddedExternal[1];
    if (isExternalOrSpecial(normalizedUrl)) return normalizedUrl;

    const { resolved, suffix } = resolveSourceUrl(normalizedUrl, sourceRel);
    if (sourceToRoute.has(resolved)) {
      const route = sourceToRoute.get(resolved);
      return `${route === "/" ? "/" : route + "/"}${suffix}`;
    }

    if (resolved === "index.html") return "/";
    if (resolved.endsWith("agents.html")) return "/kapcsolat/";
    if (resolved.endsWith(".html")) return `/${resolved}${suffix}`;

    if (
      localAssetPrefixes.some((prefix) => resolved.startsWith(prefix)) ||
      rootAssetNames.has(resolved)
    ) {
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
  const canonicalUrl =
    config.siteOrigin + (route.path === "/" ? "/" : route.path + "/");

  // Remove base tags
  html = html.replace(/\s*<base\b[^>]*>\s*/gi, "\n");

  // Rewrite href, src, action attributes
  html = html.replace(
    /\b(href|src|action)=("|')([^"']+)\2/gi,
    (match, attr, quote, urlValue) =>
      `${attr}=${quote}${rewriteUrl(urlValue, route.source)}${quote}`
  );

  // Rewrite srcset attributes
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

  // Rewrite CSS url() references
  html = html.replace(/url\((["']?)([^"')]+)\1\)/gi, (match, quote, urlValue) => {
    return `url(${quote}${rewriteUrl(urlValue, route.source)}${quote})`;
  });

  // Fix any remaining /../ patterns
  html = html.replace(/(["'])\/\.\.\//g, "$1/");

  // Update canonical
  html = setOrInsertHeadTag(
    html,
    /<link\s+rel=(["'])canonical\1\s+href=(["'])[^"']+\2\s*\/?>/i,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );

  // Update og:url
  html = setOrInsertHeadTag(
    html,
    /<meta\s+property=(["'])og:url\1\s+content=(["'])[^"']+\2\s*\/?>/i,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );

  // Update hreflang
  html = html.replace(
    /<link\s+rel=(["'])alternate\1\s+hreflang=(["'])(hu|x-default)\2\s+href=(["'])[^"']+\4\s*\/?>/gi,
    (match, q1, q2, lang) =>
      `<link rel="alternate" hreflang="${lang}" href="${canonicalUrl}" />`
  );

  return html;
}

// ---- Compute destination for a route in the SOURCE tree -------------------

function sourceDestination(route) {
  // Root index stays in place
  if (route.path === "/") return path.join(ROOT, "index.html");
  // 404 stays as root-level 404.html
  if (route.output) return path.join(ROOT, route.output);
  // All other routes: ROUTE/index.html
  return path.join(ROOT, stripLeadingSlash(route.path), "index.html");
}

// ---- Build new routes.json -------------------------------------------------

function buildNewRoutesJson(routes) {
  const newRoutes = routes.map((r) => {
    const dest = sourceDestination(r);
    const newSource = toPosix(path.relative(ROOT, dest));
    const entry = { source: newSource, path: r.path };
    if (r.output) entry.output = r.output;
    if (r.noindex) entry.noindex = r.noindex;
    return entry;
  });

  // Separate generated routes from explicit ones
  // After migration, generated groups use dirMode: true
  const generatedGroupRoutes = new Set();
  for (const group of config.generatedGroups || []) {
    const sourceDir = path.join(ROOT, group.sourceDir);
    for (const file of walk(sourceDir)) {
      if (!file.endsWith(".html")) continue;
      const rel = toPosix(path.relative(ROOT, file));
      generatedGroupRoutes.add(rel);
    }
  }

  // Keep only explicitly listed routes (not from generatedGroups) as explicit
  const explicitRoutes = newRoutes.filter((r) => {
    // Find if this was originally an explicit route
    const originalRoute = config.routes.find(
      (orig) => normalizeRoute(orig.path) === r.path
    );
    return !!originalRoute;
  });

  const newConfig = {
    siteOrigin: config.siteOrigin,
    routes: explicitRoutes,
    generatedGroups: (config.generatedGroups || []).map((group) => {
      // Map old sourceDir (sites/infok) to new (infok)
      const oldSourceDir = group.sourceDir; // e.g. "sites/infok"
      const pathParts = oldSourceDir.split("/");
      // New source dir is the last part (infok or szakemberek)
      // but actually the new files are at infok/SLUG/index.html
      // so the sourceDir becomes the pathPrefix without leading /
      const newSourceDir = stripLeadingSlash(group.pathPrefix); // e.g. "infok" or "szakember"
      return {
        sourceDir: newSourceDir,
        pathPrefix: group.pathPrefix,
        dirMode: true,
      };
    }),
    assetDirs: config.assetDirs,
    rootAssets: config.rootAssets,
  };

  return newConfig;
}

// ---- Generate _redirects ---------------------------------------------------

function generateRedirects(routes) {
  const lines = [
    "# Generated by tools/migrate-source.js",
    "# Legacy old paths -> clean URLs (301)",
    "",
  ];

  for (const route of routes) {
    if (route.path === "/" || route.path === "/404") continue;

    const src = route.source; // original source path (before migration)
    if (!src) continue;

    // /sites/xxx.html -> /route/ 301
    if (src.startsWith("sites/")) {
      lines.push(`/${src}  ${route.path}/  301`);
    }

    // /adatkezeles.html -> /adatkezeles/ 301
    if (!src.startsWith("sites/") && !src.startsWith("index") && src.endsWith(".html")) {
      lines.push(`/${src}  ${route.path}/  301`);
    }
  }

  lines.push("");
  lines.push("# SEO keyword aliases");
  lines.push("/flotta-biztositas  /kgfb-flotta/  301");
  lines.push("/flotta-biztositas-ar  /kgfb-flotta/  301");
  lines.push("/flotta-biztositas-arak  /kgfb-flotta/  301");
  lines.push("/ceges-casco-onresz  /casco-flotta/  301");
  lines.push("/casco-onresz-mennyi  /casco-flotta/  301");
  lines.push("/jegkar-biztositas-vallalkozas  /vallalkozasbiztositas/  301");
  lines.push("/jegkar-biztositas-mezogazdasag  /mezogazdasagi-biztositas/  301");
  lines.push("/kgfb-kalkulalas  /kotelezo-biztositas/  301");
  lines.push("/lakasbiztositas-arak  /lakasbiztositas/  301");
  lines.push("");
  lines.push("# Trailing slash normalisation (without slash -> with slash)");
  for (const route of routes) {
    if (route.path === "/" || route.path === "/404") continue;
    lines.push(`${route.path}  ${route.path}/  301`);
  }
  lines.push("");

  return lines.join("\n");
}

// ---- Main ------------------------------------------------------------------

function migrate() {
  const routes = collectAllRoutes();
  const rewriteUrl = createRewriter(routes);

  console.log(`Found ${routes.length} routes to process\n`);

  let created = 0;
  let skipped = 0;
  const errors = [];

  // Remember original source paths (before overwriting routes array)
  const originalSources = routes.map((r) => r.source);

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const originalSource = originalSources[i];
    const sourceFile = path.join(ROOT, originalSource);

    // Skip root index (stays in place, no URL rewrite needed for assets)
    if (route.path === "/" && originalSource === "index.html") {
      console.log(`SKIP  /  (root index.html stays in place)`);
      skipped++;
      continue;
    }

    // Destination in source tree
    const destFile = sourceDestination(route);

    if (!fs.existsSync(sourceFile)) {
      console.warn(`WARN  ${originalSource} — source file not found, skipping`);
      errors.push(`Missing source: ${originalSource}`);
      skipped++;
      continue;
    }

    // Read with BOM stripping (ajanlatok files have UTF-8 BOM)
    let html = fs.readFileSync(sourceFile, "utf8");
    if (html.charCodeAt(0) === 0xfeff) html = html.slice(1);

    const rewritten = rewriteHtml(html, route, rewriteUrl);

    const destRel = toPosix(path.relative(ROOT, destFile));

    if (DRY_RUN) {
      console.log(`WOULD  ${originalSource}  →  ${destRel}`);
    } else {
      // Don't overwrite if destination already IS the source (root 404)
      if (
        path.resolve(sourceFile) === path.resolve(destFile) &&
        originalSource === destRel
      ) {
        console.log(`SAME   ${destRel} (no move needed)`);
        skipped++;
        continue;
      }

      fs.mkdirSync(path.dirname(destFile), { recursive: true });
      fs.writeFileSync(destFile, rewritten, "utf8");
      created++;
      console.log(`OK     ${originalSource}  →  ${destRel}`);
    }
  }

  // Write updated routes.json
  const newConfig = buildNewRoutesJson(routes);
  const newRoutesJson = JSON.stringify(newConfig, null, 2) + "\n";
  if (DRY_RUN) {
    console.log("\nWOULD write src/routes.json with updated source paths");
  } else {
    fs.writeFileSync(ROUTES_FILE, newRoutesJson, "utf8");
    console.log("\nWrote src/routes.json with updated source paths");
  }

  // Write _redirects to root
  // Use original route sources for redirect generation
  const routesForRedirects = routes.map((r, i) => ({
    ...r,
    source: originalSources[i],
  }));
  const redirectsContent = generateRedirects(routesForRedirects);
  const redirectsDest = path.join(ROOT, "_redirects");
  if (DRY_RUN) {
    console.log("\nWOULD write _redirects at repo root");
  } else {
    fs.writeFileSync(redirectsDest, redirectsContent, "utf8");
    console.log("Wrote _redirects at repo root");
  }

  console.log(`\n--- Summary ---`);
  console.log(`Total routes: ${routes.length}`);
  if (!DRY_RUN) {
    console.log(`Created/updated: ${created}`);
    console.log(`Skipped: ${skipped}`);
  }
  if (errors.length > 0) {
    console.log(`\nErrors (${errors.length}):`);
    errors.forEach((e) => console.log(`  ${e}`));
  }

  if (DRY_RUN) {
    console.log("\nRun with --write to apply changes.");
  } else {
    console.log(
      "\nNext steps:"
    );
    console.log(
      "  1. Review new files in their clean URL directories"
    );
    console.log(
      "  2. Old files in sites/ are still present — verify, then you can remove them"
    );
    console.log(
      "  3. Update server.js to serve clean URL directories"
    );
    console.log(
      "  4. Run: npm start  →  test /rolunk/, /kotelezo-biztositas/, etc."
    );
  }
}

migrate();
