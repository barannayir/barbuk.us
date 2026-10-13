module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/demos");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/sitemap.xml");
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

  // --- URL → SEO slug helper (yardımcı) ---
  function urlToSlug(url) {
    if (!url) return "home";
    let p = String(url).replace(/^\/+/, "").replace(/\/+$/, "");
    if (!p) return "home";
    const parts = p.split("/");
    if (["de", "fr", "nl", "it", "es"].includes(parts[0])) {
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
        const stripped = url.replace(/^\/(de|fr|nl|it|es)(?=\/|$)/, "") || "/";
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
  eleventyConfig.addFilter("urlByLang", function(currentUrl, lang) {
    const url = currentUrl || "/";
    if (url === "/" || url === "") {
      return lang === "en" ? "/" : `/${lang}/`;
    }
    const stripped = url.replace(/^\/(de|fr|nl|it|es)(?=\/|$)/, "") || "/";
    return lang === "en" ? stripped : `/${lang}${stripped}`;
  });

  // --- i18n: page URL'den mevcut dil tespiti ---
  eleventyConfig.addFilter("detectLang", function(url) {
    const u = url || "/";
    if (u === "/" || u === "" || u === "/index.html") return "en";
    const m = u.match(/^\/(de|fr|nl|it|es)(?=\/|$)/);
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
