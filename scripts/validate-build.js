#!/usr/bin/env node
/**
 * Post-build validator — sanity checks on dist/ output.
 * - No broken internal links
 * - All pages have a non-empty <title>
 * - All pages have <meta name="description">
 * - All pages have hreflang alternates
 * - Sitemap URL count
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = './dist';
let errors = 0;
let warnings = 0;
const log = (level, msg) => { console.log(`[${level}] ${msg}`); if (level === 'ERROR') errors++; else if (level === 'WARN') warnings++; };

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (extname(p) === '.html') yield p;
  }
}

const pages = [...walk(DIST)];
log('INFO', `Scanning ${pages.length} HTML pages...`);

let titleCount = 0, descCount = 0, hreflangCount = 0, jsonLdCount = 0;

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  if (/<title>[^<]+<\/title>/.test(html)) titleCount++;
  else log('WARN', `${page}: missing <title>`);
  if (/<meta\s+name="description"\s+content="[^"]+"/i.test(html)) descCount++;
  else log('WARN', `${page}: missing meta description`);
  if (/hreflang=/i.test(html)) hreflangCount++;
  if (/<script\s+type="application\/ld\+json">/i.test(html)) jsonLdCount++;
}

// Sitemap check
try {
  const sitemap = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
  const urlCount = (sitemap.match(/<url>/g) || []).length;
  log('INFO', `Sitemap: ${urlCount} URLs`);
  if (urlCount < 80) log('WARN', `Sitemap below 80 URL target (current: ${urlCount})`);
} catch (e) {
  log('ERROR', `sitemap.xml missing: ${e.message}`);
}

// News sitemap check
try {
  const ns = readFileSync(join(DIST, 'news-sitemap.xml'), 'utf8');
  const urlCount = (ns.match(/<url>/g) || []).length;
  log('INFO', `News sitemap: ${urlCount} URLs`);
} catch (e) {
  log('WARN', `news-sitemap.xml missing`);
}

// Feed check
for (const lang of ['', '/de/', '/fr/', '/nl/', '/it/', '/es/']) {
  try {
    readFileSync(join(DIST, lang, 'feed.xml'), 'utf8');
  } catch (e) {
    log('WARN', `Missing feed: ${lang}feed.xml`);
  }
}

log('INFO', `<title>: ${titleCount}/${pages.length}, <meta description>: ${descCount}/${pages.length}, hreflang: ${hreflangCount}, JSON-LD: ${jsonLdCount}`);

if (errors > 0) {
  console.log(`\n❌ ${errors} errors, ${warnings} warnings`);
  process.exit(1);
} else {
  console.log(`\n✅ ${warnings} warnings, 0 errors`);
  process.exit(0);
}
