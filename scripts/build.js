#!/usr/bin/env node
/**
 * NEMURA — Build script v3
 *
 * Novedades sobre v2:
 *  - El CSS compartido y cart-utils.js dejan de ir inline (<style>/<script>
 *    repetidos en cada HTML) y pasan a ser archivos reales en /dist/assets.
 *    Así el navegador los descarga UNA vez y los reutiliza en las 14
 *    páginas (antes se re-descargaban y re-parseaban en cada página).
 *  - Cada archivo compartido lleva un "?v=hash" calculado a partir de su
 *    contenido. Si el contenido no cambia, el navegador lo sirve desde
 *    caché para siempre. Si lo editás y volvés a correr el build, el
 *    hash cambia solo y el navegador lo vuelve a descargar automático.
 *
 * Uso: node scripts/build.js
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SRC = path.join(__dirname, '..', 'src');
const DIST = path.join(__dirname, '..', 'dist');

const manifest = JSON.parse(fs.readFileSync(path.join(SRC, 'data', 'pages-manifest.json'), 'utf-8'));
const favicon = fs.readFileSync(path.join(SRC, 'partials', 'favicon.html'), 'utf-8');
const headerTpl = fs.readFileSync(path.join(SRC, 'partials', 'header.html'), 'utf-8');
const footerTpl = fs.readFileSync(path.join(SRC, 'partials', 'footer.html'), 'utf-8');

const CSS_CATEGORIES = ['variables', 'layout', 'utilities', 'components', 'animations', 'responsive', 'components-carousel'];
const SITE_CONFIG = require(path.join(SRC, 'config', 'site-config.js'));

const errors = [];
const warnings = [];

function hash(content) {
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
}

function readPart(slug, name, required = false) {
  const p = path.join(SRC, 'pages', slug, name);
  if (!fs.existsSync(p)) {
    if (required) errors.push(`[${slug}] falta ${name}`);
    return '';
  }
  return fs.readFileSync(p, 'utf-8');
}

function renderNav(navItems, currentHref) {
  return '<nav class="nav-desktop">\n' + navItems.map(item => {
    const active = item.href === currentHref ? ' class="active"' : '';
    const style = item.style ? ` style="${item.style}"` : '';
    return `        <a href="${item.href}"${active}${style}>${item.label}</a>`;
  }).join('\n') + '\n      </nav>';
}

function renderMobileMenu(navItems) {
  return navItems.map((item, i) => {
    const num = String(i + 1).padStart(2, '0');
    return `      <a href="${item.href}"><span>${num}</span>${item.label}</a>`;
  }).join('\n');
}

function renderHeader(meta) {
  const navHtml = renderNav(meta.nav_items, meta.file);
  const searchBtn = meta.has_search
    ? `<button class="icon-btn" id="searchBtn" aria-label="Buscar">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        </button>
        `
    : '';
  return headerTpl.replace('{{NAV_ITEMS}}', navHtml).replace('{{SEARCH_BTN}}', searchBtn)
    .replace('{{MOBILE_MENU_ITEMS}}', renderMobileMenu(meta.nav_items));
}

function renderFooter(meta) {
  return footerTpl
    .replace('{{CTA_TITLE}}', meta.cta.title)
    .replace('{{CTA_HREF}}', meta.cta.href)
    .replace('{{CTA_BTN_TEXT}}', meta.cta.btn_text)
    .replace('{{BRAND_TAGLINE}}', meta.brand_tagline)
    .replace('{{COPYRIGHT}}', meta.copyright);
}

// ---------- limpiar dist (menos imagenes/carrusel que se copian aparte) ----------
if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });
const assetsCssDir = path.join(DIST, 'assets', 'css');
const assetsCssPagesDir = path.join(assetsCssDir, 'pages');
const assetsJsDir = path.join(DIST, 'assets', 'js');
const assetsJsPagesDir = path.join(assetsJsDir, 'pages');
[assetsCssDir, assetsCssPagesDir, assetsJsDir, assetsJsPagesDir].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ---------- CSS compartido: copiar categorías + calcular hash conjunto ----------
let sharedCssLinks = '';
let sharedCssConcat = '';
for (const cat of CSS_CATEGORIES) {
  const srcPath = path.join(SRC, 'styles', `${cat}.css`);
  if (!fs.existsSync(srcPath)) { warnings.push(`falta src/styles/${cat}.css`); continue; }
  const content = fs.readFileSync(srcPath, 'utf-8');
  sharedCssConcat += content;
}
const sharedHash = hash(sharedCssConcat);
for (const cat of CSS_CATEGORIES) {
  const srcPath = path.join(SRC, 'styles', `${cat}.css`);
  if (!fs.existsSync(srcPath)) continue;
  fs.copyFileSync(srcPath, path.join(assetsCssDir, `${cat}.css`));
  sharedCssLinks += `  <link rel="stylesheet" href="/assets/css/${cat}.css?v=${sharedHash}">\n`;
}

// ---------- JS compartido: cart-utils.js + dynamic-carousel.js ----------
const cartUtilsPath = path.join(SRC, 'scripts', 'cart-utils.js');
const cartUtilsContent = fs.readFileSync(cartUtilsPath, 'utf-8');
const cartUtilsHash = hash(cartUtilsContent);
fs.copyFileSync(cartUtilsPath, path.join(assetsJsDir, 'cart-utils.js'));

const carouselPath = path.join(SRC, 'scripts', 'dynamic-carousel.js');
const carouselContent = fs.readFileSync(carouselPath, 'utf-8');
const carouselHash = hash(carouselContent);
fs.copyFileSync(carouselPath, path.join(assetsJsDir, 'dynamic-carousel.js'));

let built = 0;
for (const slug of Object.keys(manifest)) {
  if (slug.startsWith('_')) continue;
  const meta = manifest[slug];

  const headExtra = readPart(slug, 'head-extra.html');
  const content = readPart(slug, 'content.html', true);
  const pageCss = readPart(slug, 'style.css');
  const pageJs = readPart(slug, 'script.js');

  if (!meta.nav_items || !meta.nav_items.length) warnings.push(`[${slug}] sin nav_items`);
  if (!meta.cta || !meta.cta.title) warnings.push(`[${slug}] sin CTA definido`);

  // CSS/JS específico de página: también externo, también cacheable (por si
  // el visitante vuelve a la misma página), con su propio hash.
  const pageCssHash = hash(pageCss);
  const pageJsHash = hash(pageJs);
  fs.writeFileSync(path.join(assetsCssPagesDir, `${slug}.css`), pageCss, 'utf-8');
  fs.writeFileSync(path.join(assetsJsPagesDir, `${slug}.js`), pageJs, 'utf-8');

  const header = renderHeader(meta);
  const footer = renderFooter(meta);

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}">

  <!-- Open Graph / Twitter — generados desde site-config.js + meta.json -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE_CONFIG.empresa}">
  <meta property="og:title" content="${meta.title}">
  <meta property="og:description" content="${meta.description}">
  <meta property="og:url" content="${SITE_CONFIG.seo.sitioUrl}/${meta.file}">
  <meta property="og:image" content="${SITE_CONFIG.seo.sitioUrl}${SITE_CONFIG.seo.imagenPorDefecto}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${meta.title}">
  <meta name="twitter:description" content="${meta.description}">
  <link rel="canonical" href="${SITE_CONFIG.seo.sitioUrl}/${meta.file}">

  <!-- ============================================================
       FAVICON / LOGOS DESDE CARPETA
  ============================================================ -->
  ${favicon}

  ${headExtra}

  <!-- ============================================================
       CSS COMPARTIDO (cacheado por el navegador entre las 14 páginas)
  ============================================================ -->
${sharedCssLinks}  <link rel="stylesheet" href="/assets/css/pages/${slug}.css?v=${pageCssHash}">
</head>
<body>
  ${header}

${content}

  ${footer}

  <script src="/assets/js/cart-utils.js?v=${cartUtilsHash}"></script>
  <script src="/assets/js/dynamic-carousel.js?v=${carouselHash}"></script>
  <script src="/assets/js/pages/${slug}.js?v=${pageJsHash}"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(DIST, meta.file), html, 'utf-8');
  built++;
}

console.log(`✔ ${built} páginas generadas en /dist`);
console.log(`✔ CSS compartido: ${CSS_CATEGORIES.length} archivos en /dist/assets/css (hash ${sharedHash})`);
console.log(`✔ JS compartido: cart-utils.js (hash ${cartUtilsHash})`);

// ---------- SEO: sitemap.xml + robots.txt (generados, no manuales) ----------
const today = new Date().toISOString().slice(0, 10);
const urls = Object.keys(manifest)
  .filter(s => !s.startsWith('_'))
  .map(slug => manifest[slug].file);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(f => `  <url>
    <loc>${SITE_CONFIG.seo.sitioUrl}/${f}</loc>
    <lastmod>${today}</lastmod>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap, 'utf-8');

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_CONFIG.seo.sitioUrl}/sitemap.xml
`;
fs.writeFileSync(path.join(DIST, 'robots.txt'), robots, 'utf-8');
console.log(`✔ sitemap.xml y robots.txt generados (${urls.length} URLs)`);

if (warnings.length) {
  console.log(`\n⚠ Advertencias (${warnings.length}):`);
  warnings.forEach(w => console.log('   ' + w));
}
if (errors.length) {
  console.log(`\n✘ Errores (${errors.length}):`);
  errors.forEach(e => console.log('   ' + e));
  process.exitCode = 1;
}
