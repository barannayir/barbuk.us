#!/usr/bin/env node
/**
 * scripts/validate-jsonld.js
 * Tüm dist/ HTML dosyalarındaki JSON-LD syntax doğrula
 * Prebuild hook: build öncesi tüm kaynak JSON-LD'leri validate eder
 */
const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "..", "dist");
const SITE = "https://barbuk.us";
const srcDir = path.join(__dirname, "..", "src");

let errors = 0;
let scripts = 0;
const fileErrors = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith(".html")) validateFile(p);
  }
}

function validateFile(file) {
  const html = fs.readFileSync(file, "utf8");
  const matches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
  const crumbLists = matches.filter((m) => /"@type":\s*"BreadcrumbList"/.test(m)).length;
  if (crumbLists > 1) logErr(file, `BreadcrumbList: ${crumbLists} found, expected at most 1`);
  for (const m of matches) {
    scripts++;
    const json = m.replace(/<\/?script[^>]*>/g, "").trim();
    try {
      const parsed = JSON.parse(json);
      if (!parsed["@context"]) {
        logErr(file, "missing @context");
        continue;
      }
      if (!parsed["@type"]) {
        logErr(file, "missing @type");
        continue;
      }
      if (parsed["@type"] === "BreadcrumbList") validateBreadcrumb(file, parsed);
      // Schema.org URL sanity check
      if (typeof parsed["@context"] === "string" && !parsed["@context"].startsWith("https://schema.org")) {
        logErr(file, `non-standard @context: ${parsed["@context"]}`);
        continue;
      }
    } catch (e) {
      logErr(file, `JSON parse error: ${e.message}`);
    }
  }
}

function pageUrlFor(file) {
  const rel = "/" + path.relative(distDir, file).split(path.sep).join("/");
  return rel.replace(/index\.html$/, "");
}

function validateBreadcrumb(file, parsed) {
  const pageUrl = pageUrlFor(file);
  const locale = (pageUrl.match(/^\/(de|fr|nl|it|es)(?=\/|$)/) || [])[1];
  const localeRoot = locale ? `/${locale}/` : "/";
  const blogIndex = locale ? `/${locale}/blog/` : "/blog/";
  const items = parsed.itemListElement;
  if (!Array.isArray(items) || items.length === 0) {
    logErr(file, "BreadcrumbList: itemListElement empty");
    return;
  }
  const urls = items.map((i) => (typeof i.item === "string" ? i.item.replace(SITE, "") : i.item));
  items.forEach((i, idx) => {
    if (i.position !== idx + 1) logErr(file, `BreadcrumbList: position ${i.position} at index ${idx + 1}`);
    if (!i.name) logErr(file, `BreadcrumbList: position ${idx + 1} has no name`);
  });
  if (urls[0] !== localeRoot) {
    logErr(file, `BreadcrumbList: position 1 must be locale home ${localeRoot}, got ${urls[0]}`);
  }
  if (pageUrl.endsWith("/") && urls[urls.length - 1] !== pageUrl) {
    logErr(file, `BreadcrumbList: last item must be the page itself ${pageUrl}, got ${urls[urls.length - 1]}`);
  }
  if (pageUrl === localeRoot && items.length !== 1) {
    logErr(file, "BreadcrumbList: locale home must have exactly 1 item");
  }
  const isPost = pageUrl.startsWith(blogIndex) && pageUrl !== blogIndex;
  if (isPost && (items.length !== 3 || urls[1] !== blogIndex)) {
    logErr(file, `BreadcrumbList: blog post needs Home > Blog index (${blogIndex}) > post`);
  }
  if (!isPost && pageUrl !== localeRoot && items.length !== 2) {
    logErr(file, "BreadcrumbList: non-post page needs Home > page (2 items)");
  }
}

function logErr(file, msg) {
  errors++;
  const rel = path.relative(path.join(__dirname, ".."), file);
  if (!fileErrors.find((e) => e.file === rel)) {
    fileErrors.push({ file: rel, msg });
  }
}

if (!fs.existsSync(distDir)) {
  console.error(`[validate-jsonld] dist/ bulunamadı: ${distDir}`);
  console.error(`[validate-jsonld] Önce 'npx @11ty/eleventy' çalıştır.`);
  process.exit(1);
}

walk(distDir);

console.log(`\n[validate-jsonld] ${scripts} JSON-LD script doğrulandı, ${errors} hata.`);
if (errors > 0) {
  console.error("\nHatalar (ilk 10):");
  for (const e of fileErrors.slice(0, 10)) {
    console.error(`  ✗ ${e.file}: ${e.msg}`);
  }
  process.exit(1);
}
process.exit(0);
