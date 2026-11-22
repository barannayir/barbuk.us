module.exports = function(eleventyConfig) {
  // --- i18n: ortak dil yardımcıları ---
  // EN prefix'sizdir; diğer diller /<lang>/ prefix'i alır.
  // Kısmi locale'ler (i18n.json → partial): yalnız listelenen (prefix'siz) yollar o dilde
  // vardır; diğer sayfalarda o dile hreflang verilmez, dil değiştirici dilin ana sayfasına gider.
  const i18nConfig = require("./src/_data/i18n.json");
  const LANG_PREFIX_RE = /^\/(de|fr|nl|it|es|tr)(?=\/|$)/;
  const PARTIAL_LANGS = i18nConfig.partial || {};
  function stripLangPrefix(url) {
    return String(url || "/").replace(LANG_PREFIX_RE, "") || "/";
  }
  function hasLangVersion(lang, strippedPath) {
    const available = PARTIAL_LANGS[lang];
    if (!available) return true;
    let p = strippedPath || "/";
    if (!p.endsWith("/") && !/\.[a-z0-9]+$/i.test(p)) p += "/";
    return available.includes(p);
  }
  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/demos");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/sitemap.xml");
  eleventyConfig.addPassthroughCopy({"src/static/63bf3278a5504d60b2b39ec1579dd771.txt": "63bf3278a5504d60b2b39ec1579dd771.txt"});
  eleventyConfig.addPassthroughCopy({"src/assets/images": "assets/images"});

  // Watch CSS files
  eleventyConfig.addWatchTarget("src/assets/css/");

  // --- i18n: localizedUrl filter ---
  // Kullanım: {{ "/services" | localizedUrl("de") }} -> "/de/services/"
  eleventyConfig.addFilter("localizedUrl", function(url, lang) {
    if (!lang || lang === "en") return url;
    if (url === "/" || url === "") return `/${lang}/`;
    return `/${lang}${url}`;
  });


  // --- 11ty 3.x compat: dateToRfc3339 filter (was removed in 3.x) ---
  eleventyConfig.addFilter("dateToRfc3339", function(date) {
    if (!date) return new Date().toISOString();
    const d = date instanceof Date ? date : new Date(date);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  });

  // --- 11ty 3.x compat: getNewestCollectionItemDate filter (was removed in 3.x) ---
  eleventyConfig.addFilter("getNewestCollectionItemDate", function(collection) {
    if (!Array.isArray(collection) || collection.length === 0) return null;
    return collection
      .map(item => item.date || item.data && item.data.date)
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0] || null;
  });

  // --- i18n: lookupI18n filter ---
  // Kullanım: {{ "index" | lookupI18n: "de" }} -> { hero_title: "..." }
  // src/_data/i18n/<lang>/<page>.json dosyasını yükler
  eleventyConfig.addFilter("lookupI18n", function(pageKey, lang) {
    const path = require("path");
    const fs = require("fs");
    const langDir = path.join(__dirname, "src", "_data", "i18n", lang);
    const file = path.join(langDir, `${pageKey}.json`);
    try {
      const raw = fs.readFileSync(file, "utf8");
      return JSON.parse(raw);
    } catch (e) {
      // Fallback: İngilizce
      const fallback = path.join(__dirname, "src", "_data", "i18n", "en", `${pageKey}.json`);
      try {
        return JSON.parse(fs.readFileSync(fallback, "utf8"));
      } catch (e2) {
        console.warn(`[i18n] Missing: ${file}`);
        return {};
      }
    }
  });

  // --- SEO: per-page unique title + description lookup ---
  // src/_data/seo/<lang>.json → { "<pageKey>": { title, description } }
  // pageKey: URL'den türetilir (örn. /services/ → "services")
  eleventyConfig.addFilter("seoTitle", function(fallback, pageUrl, lang) {
    const path = require("path");
    const fs = require("fs");
    const slug = urlToSlug(pageUrl);
    const tryLoad = (l) => {
      const f = path.join(__dirname, "src", "_data", "seo", `${l}.json`);
      try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { return null; }
    };
    const data = tryLoad(lang) || tryLoad("en") || {};
    return (data[slug] && data[slug].title) ? data[slug].title : fallback;
  });

  eleventyConfig.addFilter("seoDescription", function(fallback, pageUrl, lang) {
    const path = require("path");
    const fs = require("fs");
    const slug = urlToSlug(pageUrl);
    const tryLoad = (l) => {
      const f = path.join(__dirname, "src", "_data", "seo", `${l}.json`);
      try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { return null; }
    };
    const data = tryLoad(lang) || tryLoad("en") || {};
    return (data[slug] && data[slug].description) ? data[slug].description : fallback;
  });

  // --- SEO: compact title/description for blog (SERP-friendly lengths) ---
  eleventyConfig.addFilter("shortTitle", function(text, max) {
    let t = String(text || "").trim();
    if (t.length <= max) return t;
    const cut = t.search(/\s[:—–]\s|:\s/);
    if (cut >= 15 && cut <= max) return t.slice(0, cut).trim();
    t = t.slice(0, max + 1);
    t = t.slice(0, Math.max(t.lastIndexOf(" "), 0)).replace(/[\s,;:—–-]+$/, "");
    return t;
  });

  eleventyConfig.addFilter("shortDescription", function(text, max) {
    const t = String(text || "").trim();
    if (t.length <= max) return t;
    const head = t.slice(0, max + 1);
    const sentenceEnd = Math.max(head.lastIndexOf(". "), head.lastIndexOf("! "), head.lastIndexOf("? "));
    if (sentenceEnd >= 90) return head.slice(0, sentenceEnd + 1);
    const word = head.slice(0, max - 1).lastIndexOf(" ");
    return head.slice(0, word).replace(/[\s,;:—–-]+$/, "") + "…";
  });

  // --- Blog: scheduled posts — skip posts dated in the future (set INCLUDE_FUTURE_POSTS=1 to preview) ---
  eleventyConfig.addPreprocessor("skipFuturePosts", "md", function(data) {
    if (process.env.INCLUDE_FUTURE_POSTS === "1") return;
    if (!data.page || !/\/src\/posts\//.test(data.page.inputPath.replace(/^\.\//, "/")) ) return;
    const published = new Date(data.date);
    if (!isNaN(published.getTime()) && published.getTime() > Date.now()) return false;
  });

  // --- URL → SEO slug helper (yardımcı) ---
  function urlToSlug(url) {
    if (!url) return "home";
    let p = String(url).replace(/^\/+/, "").replace(/\/+$/, "");
    if (!p) return "home";
    const parts = p.split("/");
    if (["de", "fr", "nl", "it", "es", "tr"].includes(parts[0])) {
      parts.shift();
    }
    if (parts.length === 0 || parts[0] === "") return "home";
    return parts[0];
  }

  // --- i18n: altlangs helper ---
  // Belirli bir sayfa URL'si için tüm dillerdeki eşdeğer URL'leri üretir
  eleventyConfig.addFilter("altLangs", function(currentUrl, languages) {
    const url = currentUrl || "/";
    return languages.map(function(lang) {
      let path;
      if (url === "/" || url === "") {
        path = lang === "en" ? "/" : `/${lang}/`;
      } else {
        // Mevcut dil prefix'i varsa kaldır
        const stripped = stripLangPrefix(url);
        path = lang === "en" ? stripped : `/${lang}${stripped}`;
      }
      return { lang: lang, url: path };
    });
  });

  // --- i18n collection: sadece i18n_key işaretli sayfalar ---
  eleventyConfig.addCollection("i18nPages", function(collectionApi) {
    return collectionApi.getAll().filter(function(item) {
      return item.data && item.data.i18n_key;
    });
  });

  // NOT: i18n globalData'sı src/_data/i18n.json üzerinden otomatik gelir.
  // addGlobalData("i18n", ...) çağrısı yapılmıyor — aksi halde array duplicate oluyor.

  // --- i18n: currentLang global data (her sayfada mevcut dili verir) ---
  eleventyConfig.addGlobalData("currentLang", function() {
    return "en"; // Layout'larda dynamic override edilecek (page URL'den)
  });

  // --- i18n: language switcher için tüm dillerdeki URL'ler ---
  // altPath (opsiyonel): yalnız tek dilde olan sayfalar (örn. /tr/cobol-modernizasyonu/) için
  // diğer dillerde gidilecek en yakın sayfa (frontmatter `alt_path`).
  eleventyConfig.addFilter("urlByLang", function(currentUrl, lang, altPath) {
    let url = currentUrl || "/";
    if (altPath) {
      const m = url.match(LANG_PREFIX_RE);
      if ((m ? m[1] : "en") === lang) return url;
      url = altPath;
    }
    if (url === "/" || url === "") {
      return lang === "en" ? "/" : `/${lang}/`;
    }
    const stripped = stripLangPrefix(url);
    if (!hasLangVersion(lang, stripped)) return `/${lang}/`;
    return lang === "en" ? stripped : `/${lang}${stripped}`;
  });

  // --- i18n: hreflang listesi (kısmi locale farkında) ---
  // Kullanım: {% assign hreflangs = page.url | hreflangLinks: hreflang_standalone %}
  // standalone=true: sayfanın başka dilde karşılığı yok → yalnız kendi dilini verir.
  eleventyConfig.addFilter("hreflangLinks", function(pageUrl, standalone) {
    const url = pageUrl || "/";
    const meta = i18nConfig.meta;
    if (standalone) {
      const m = url.match(LANG_PREFIX_RE);
      return [{ lang: m ? m[1] : "en", hreflang: meta[m ? m[1] : "en"].hreflang, url: url }];
    }
    const stripped = stripLangPrefix(url);
    const out = [];
    for (const lang of i18nConfig.languages) {
      if (!hasLangVersion(lang, stripped)) continue;
      out.push({ lang: lang, hreflang: meta[lang].hreflang, url: lang === "en" ? stripped : `/${lang}${stripped}` });
    }
    out.push({ lang: "x-default", hreflang: "x-default", url: stripped });
    return out;
  });

  // --- i18n: page URL'den mevcut dil tespiti ---
  eleventyConfig.addFilter("detectLang", function(url) {
    const u = url || "/";
    if (u === "/" || u === "" || u === "/index.html") return "en";
    const m = u.match(LANG_PREFIX_RE);
    return m ? m[1] : "en";
  });

  // --- Blog: posts collection (frontmatter tag: post) ---
  eleventyConfig.addCollection("blogPosts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md").sort(function(a, b) {
      return b.date - a.date;
    });
  });

  // --- Blog: per-language post i18n lookup ---
  // Kullanım: {{ "hidden-cost" | lookupPostI18n: "de" }} -> { title, description, excerpt, og_image }
  // src/_data/i18n-posts/<lang>/<slug>.json dosyasını yükler (EN fallback)
  eleventyConfig.addFilter("lookupPostI18n", function(slug, lang) {
    const path = require("path");
    const fs = require("fs");
    const tryLoad = function(l) {
      const f = path.join(__dirname, "src", "_data", "i18n-posts", l, `${slug}.json`);
      try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { return null; }
    };
    return tryLoad(lang) || tryLoad("en") || {};
  });

  // --- Blog: build blog permalinks for 6 languages from a slug ---
  // Returns array suitable for Eleventy permalink frontmatter
  eleventyConfig.addFilter("blogPermalinks", function(slug) {
    return [
      `/blog/${slug}/index.html`,
      `/de/blog/${slug}/index.html`,
      `/fr/blog/${slug}/index.html`,
      `/nl/blog/${slug}/index.html`,
      `/it/blog/${slug}/index.html`,
      `/es/blog/${slug}/index.html`
    ];
  });

  // --- Cache-buster timestamp for static assets ---
  // Her build'de farklı değer döner → CDN cache yenen (özellikle static asset cache HIT sorunu)
  eleventyConfig.addGlobalData("buildTimestamp", function() {
    return Date.now().toString(36);
  });

  // --- Author data global (E-E-A-T) ---
  // src/_data/authors/<id>.json tüm sayfalarda {{ authors.<id> }} ile erişilebilir
  eleventyConfig.addGlobalData("authors", function() {
    const path = require("path");
    const fs = require("fs");
    const dir = path.join(__dirname, "src", "_data", "authors");
    if (!fs.existsSync(dir)) return {};
    const out = {};
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      const id = f.replace(/\.json$/, "");
      try { out[id] = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); } catch (e) {}
    }
    return out;
  });

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      layouts: "_layouts"
    },
    templateFormats: ["liquid", "md", "html"],
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid"
  };
};
