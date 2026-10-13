#!/usr/bin/env node
/**
 * scripts/validate-jsonld.js
 * Tüm dist/ HTML dosyalarındaki JSON-LD syntax doğrula
 * Prebuild hook: build öncesi tüm kaynak JSON-LD'leri validate eder
 */
const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "..", "dist");
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
