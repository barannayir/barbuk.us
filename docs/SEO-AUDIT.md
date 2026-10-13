# Barbuk.us SEO Audit — v0.8.0 (2026-10-13)

## Technical SEO

| Check | Status | Notes |
|---|---|---|
| HTTPS + custom domain | ✅ | barbuk.us, Cloudflare Pages, free cert |
| HSTS preload | ⏳ P2 | Cloudflare "Always Use HTTPS" enabled, HSTS not yet submitted to preload list |
| www → apex 301 | ✅ | Cloudflare Page Rule |
| Trailing slash canonical | ✅ | `/services/` not `/services` |
| XML sitemap | ✅ | 108 URLs, all languages |
| News sitemap | ✅ | 60 URLs (last 9 posts × 6 lang) |
| robots.txt | ✅ | AI opt-out (GPTBot, ClaudeBot, CCBot, Bytespider Disallow) |
| `noindex` discipline | ✅ | Only 404 page; all other pages indexable |
| 404.html EN | ✅ | i18n_key: notfound renders per-lang |
| 5xx free | ✅ | 200 across all 108 URLs (last check 2026-10-13) |
| TTFB | ✅ 173ms | Cloudflare CDN edge |
| Core Web Vitals | ⏳ P2 | Not yet measured on PageSpeed Insights (post-deploy) |

## On-Page SEO

| Check | Status | Notes |
|---|---|---|
| Title tags (50-60 chars) | ✅ 143/143 | All under 60 chars |
| Meta descriptions (150-160 chars) | ✅ 139/143 | 4 admin/demo pages skipped (intentional) |
| H1 per page | ✅ | Single H1, never used in nav/footer |
| Heading hierarchy | ✅ | h1 → h2 → h3, no skips |
| Image alt text | ✅ | All decorative; meaningful images have alt |
| Open Graph image | ✅ | 6 languages, 1200×630 |
| Twitter Card | ✅ | summary_large_image |
| hreflang | ✅ 139/143 | EN root + DE/FR/NL/IT/ES path-prefix; return tags correct |
| canonical | ✅ | Per-page absolute URL |
| Language meta | ✅ | `<html lang="en">` etc per page |

## Schema.org / JSON-LD

| Type | Count | Pages |
|---|---|---|
| Organization | 1 | Home (all 6 lang) |
| WebSite | 1 | Home |
| BreadcrumbList | 139/143 | Pillar pages, blog posts, legal |
| BlogPosting + Person (author) | 60 | All blog posts × 6 lang |
| ItemList (Service) | 30 | 5 Pillar × 6 lang |
| FAQPage | 30 | 5 Pillar × 6 lang (inline `<script>` in template body, not extracted to helper due to Eleventy 3.1.5 OOM when iterating items param from include — see notes) |

**Total: 7 distinct schema types, 139 inline scripts validated by `scripts/validate-jsonld.js`.**

### Why FAQPage lives inline instead of in `faq-body.liquid`

Eleventy 3.1.5 OOM (JavaScript heap, 2GB limit) when 30 Pillar pages (`src/{,de,fr,nl,it,it/es/}/{slug}.liquid`) simultaneously include a helper that iterates `t.faq.items`. Same pattern that killed the related-posts helper. The inline `<script type="application/ld+json">` block in each Pillar template stays instead — validated, no runtime cost, schema-equivalent.

## Topical Authority

| Topic Cluster | Pillar | Blog Posts | Internal Links |
|---|---|---|---|
| Legacy Modernization | `/legacy-modernization/` | 3 posts | ✅ |
| AI Integration | `/ai-integration-services/` | 2 posts | ✅ |
| Cloud Migration | `/cloud-migration-services/` | 2 posts | ✅ |
| Enterprise Software | `/enterprise-software-modernization/` | 1 post | ✅ |
| B2B Software | `/b2b-software-services/` | 1 post | ✅ |

**5 topical hubs, 9 blog posts, all 6 languages, ~50,000 words of original content.**

## E-E-A-T

| Signal | Status | Notes |
|---|---|---|
| Author bio (Person schema) | ✅ | barannayir.json, 1 author (single-author blog) |
| Contact info | ✅ | Telegram, email, contact form → Google Sheets |
| Privacy Policy (6 lang) | ✅ | GDPR-compliant, 12 sections, last updated 2026-10-13 |
| Terms of Service (6 lang) | ✅ | 9 sections, governing law TR, last updated 2026-10-13 |
| About page (6 lang) | ✅ | Single-author narrative, 1,200 words EN |
| External authority links | ⏳ P2 | Clutch/G2/GoodFirms profiles (Phase D P2) |
| Backlinks | ⏳ P2 | 0 external backlinks currently |

## Indexing

| Engine | Status | Notes |
|---|---|---|
| Google Search Console | ✅ Verified | Property `https://barbuk.us`, sitemap submitted |
| Bing Webmaster | ⏳ P2 | Not yet submitted |
| IndexNow | ⏳ P2 | WordPress plugin equivalent: ping URL on deploy |

## Localized / International

| Check | Status | Notes |
|---|---|---|
| 6 languages | ✅ EN, DE, FR, NL, IT, ES | Path-prefix URLs |
| Default at root | ✅ | `/services/` is EN |
| Worker is locale-agnostic | ✅ | `/contact` POST, no lang param |
| Triple fallback (lang → EN → missing) | ✅ | `lookupI18n` filter |
| Regional hreflang (DE → de-DE) | ✅ | ISO 639-1, country code from `.env`-style lang config |
| Translation quality | ✅ | Glossary-driven, EN-master, AI-assisted review |

## Content Quality

| Check | Status |
|---|---|
| Word count per Pillar | ✅ 1,500-2,500 words (TDD: `wc -w >= 1500`) |
| Word count per post | ✅ 1,200-2,000 words |
| Internal links per post | ✅ 3-5 contextual |
| Original (not syndicated) | ✅ |
| Last updated dates | ✅ Visible on every post |

## Performance & CWV

| Check | Status |
|---|---|
| TTFB | 173ms (Cloudflare edge) |
| HTML size (avg) | ~28KB (Pillar pages, full JSON-LD) |
| CSS | 1 stylesheet, ~18KB minified inline |
| JS | 0 KB on most pages; contact form is progressive enhance |
| Images | 6 OG images, no in-content images yet |
| Lazy load | ⏳ N/A (no in-content images) |

## Build & Validate

```bash
./node_modules/.bin/eleventy    # 155 files, 1.85s
node scripts/validate-build.js  # 0 error, 4 warning (admin/demo pages)
node scripts/validate-jsonld.js # all 139 scripts pass Google Rich Results Test format
node workers/contact-form.test.js # 17/17 pass
```

## Phase D (Off-Page P2)

- [ ] Submit to Clutch.co, G2, GoodFirms (3 profiles)
- [ ] Bing Webmaster Tools verify + submit sitemap
- [ ] IndexNow API key + on-deploy ping
- [ ] HSTS preload list submission
- [ ] PageSpeed Insights baseline + Lighthouse CI

## Phase E (Quarterly Review)

- [ ] GSC Search Analytics review (top queries, CTR, position)
- [ ] Top 3 competitor domain comparison (ahrefs/Semrush)
- [ ] Content audit: prune posts with 0 traffic after 90 days
- [ ] Add 2 new Pillar pages for emerging topics (LLM ops? Edge compute?)

---

**Generated: 2026-10-13, build ed5c6ab, sitemap 108 URLs, 6 languages, 5 topical clusters.**
