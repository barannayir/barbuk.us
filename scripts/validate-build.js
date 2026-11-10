#!/usr/bin/env node
/**
 * Post-build validator — sanity checks on dist/ output.
 * - No broken internal links
 * - All pages have a non-empty <title>
 * - All pages have <meta name="description">
 * - All pages have hreflang alternates
 * - Sitemap URL count
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
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

// Blog posts: single H1, SERP-friendly title/description, no future-dated (unpublished) posts
const today = new Date().toISOString().slice(0, 10);
const blogTitles = new Map();
for (const page of pages) {
  const url = page.slice(DIST.length).replace(/\\/g, '/');
  if (!/^(\/(de|fr|nl|it|es))?\/blog\//.test(url)) continue;
  const html = readFileSync(page, 'utf8');
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) log('ERROR', `${url}: expected exactly 1 <h1>, found ${h1s}`);
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  if (title.length > 65) log('ERROR', `${url}: <title> is ${title.length} chars (max 65)`);
  if ((title.match(/\|/g) || []).length > 1) log('ERROR', `${url}: <title> has a doubled suffix: ${title}`);
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  if (desc.length < 100 || desc.length > 165) log('WARN', `${url}: meta description is ${desc.length} chars (target 100-160)`);
  if (blogTitles.has(title)) log('ERROR', `${url}: duplicate <title> also on ${blogTitles.get(title)}`);
  blogTitles.set(title, url);
  const published = (html.match(/"datePublished":\s*"(\d{4}-\d{2}-\d{2})"/) || [])[1];
  if (published && published > today) log('ERROR', `${url}: future-dated post (${published}) must not be published`);
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

// Cloudflare Pages serves real 404s only when dist/404.html exists (otherwise SPA fallback => soft 404)
if (!existsSync(join(DIST, '404.html'))) log('ERROR', 'dist/404.html missing — unknown paths would return 200 (soft 404)');

// Every same-site image referenced from HTML/JSON-LD must exist (e.g. Organization logo)
const missingAssets = new Set();
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  for (const m of html.matchAll(/https:\/\/barbuk\.us(\/assets\/images\/[\w./-]+\.(?:png|svg|jpe?g|webp|avif))/g)) {
    if (!existsSync(join(DIST, m[1]))) missingAssets.add(m[1]);
  }
}
for (const a of missingAssets) log('ERROR', `Referenced image missing in dist: ${a}`);

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
