# MANUAL DE USO — NEMURA Modular

Guía práctica: qué archivo tocar según lo que quieras cambiar o reparar.

---

## 1. Mapa general — ¿qué es cada carpeta?

```
nemura-modular/
│
├── src/                        ← AQUÍ SE EDITA TODO (código fuente)
│   ├── partials/
│   │   ├── favicon.html        ← bloque de favicon (compartido)
│   │   ├── header.html         ← EL header único de todo el sitio
│   │   └── footer.html         ← EL footer único de todo el sitio
│   ├── styles/
│   │   ├── variables.css       ← colores, tipografías, espaciados (:root)
│   │   ├── layout.css          ← reset base (*, html, body, a, button...)
│   │   ├── utilities.css       ← .container, .eyebrow, halftone/noise
│   │   ├── components.css      ← header, footer, botones, cards, badges
│   │   ├── animations.css      ← @keyframes
│   │   └── responsive.css      ← media queries
│   ├── scripts/
│   │   └── cart-utils.js       ← funciones compartidas: money, toast,
│   │                              playTone, abrirCarrito, cerrarCarrito
│   ├── pages/
│   │   └── <nombre-pagina>/    ← una carpeta por cada página del sitio
│   │       ├── head-extra.html
│   │       ├── content.html
│   │       ├── style.css       ← SOLO lo que es único de esa página
│   │       ├── script.js       ← SOLO lo que es único de esa página
│   │       └── meta.json       ← título, descripción, nav, CTA, tagline...
│   └── data/
│       └── pages-manifest.json ← lista maestra de las 14 páginas
│
├── scripts/
│   └── build.js                ← el "compilador": junta todo y genera /dist
│
├── vercel.json                 ← headers de cache para Vercel
├── dist/                       ← SALIDA GENERADA. No se edita a mano nunca.
├── imagenes/ , carrusel/       ← assets (fotos, logos)
└── README.md
```

**Cambio importante:** el header y el footer **ya no tienen copia por
página**. Existe un único `header.html` y un único `footer.html`. El build
inserta automáticamente el menú correcto, el botón de búsqueda (si aplica),
el texto del CTA y el copyright de cada página, usando los datos de
`pages-manifest.json`. Si agregás un link al menú, lo hacés **una sola vez**
y aparece en las 14 páginas.

**Regla de oro:** todo cambio se hace en `src/`, nunca en `dist/`. `dist/` se
borra y se vuelve a generar cada vez que corres el build.

---

## 2. Las 14 carpetas de página — nombre real ↔ archivo original

| Carpeta en `src/pages/` | Archivo final (`dist/`) |
|---|---|
| `index` | `index.html` |
| `tienda-ropa` | `tienda-ropa.html` |
| `tienda-disenos` | `tienda-disenos.html` |
| `vasos` | `vasos.html` |
| `carrito` | `carrito.html` |
| `contacto` | `contacto.html` |
| `envios` | `envios.html` |
| `garantia` | `garantia.html` |
| `guia-tallas` | `guia-tallas.html` |
| `licencias-uso` | `licencias-uso.html` |
| `politica-privacidad` | `politica-privacidad.html` |
| `portfolio` | `portfolio.html` |
| `terminos-servicio` | `terminos-servicio.html` |
| `automatiza-mockups` | `AUTOMATISAMOCKUS.HTML` |

Dentro de cada una de esas 14 carpetas hay siempre los mismos 5 archivos
(`head-extra.html`, `content.html`, `style.css`, `script.js`, `meta.json`).
Así que la pregunta "¿dónde toco X?" siempre se responde igual: **primero
identificás la página, después el tipo de cambio.**

---

## 3. "Quiero cambiar..." → guía rápida

### 🎨 Un color, tipografía, o algo del diseño **en TODO el sitio**
→ `src/styles/variables.css` (colores/tipografías/espaciados) o
`src/styles/components.css` (estilos de header, footer, botones, cards...)
Cambiás una vez, se aplica a las 14 páginas al hacer build.

### 🎨 Un color o estilo que solo aparece **en una página**
→ `src/pages/<pagina>/style.css`
Ahí vive el CSS que es único de esa página (secciones, cards especiales, etc).

### 📝 El texto/HTML del contenido de una página (hero, secciones, productos)
→ `src/pages/<pagina>/content.html`
Es todo lo que va entre el header y el footer.

### 🧭 El menú de navegación (Inicio / Ropa / Diseños / Vasos / Contacto...)
→ **`src/partials/header.html`** — es UN SOLO archivo para las 14 páginas.
Los links del menú (cuáles existen y en qué orden) se definen en
`nav_items` dentro de `src/data/pages-manifest.json`, dentro del bloque de
cada página. Si agregás una página nueva al menú, agregás el link al
`nav_items` de cada página que deba mostrarlo — pero el HTML/CSS del menú
en sí se edita una sola vez en `header.html`.

### 🦶 El footer (CTA final, columnas de links, redes, copyright)
→ **`src/partials/footer.html`** — también único.
El texto que cambia por página (título del CTA, botón, tagline de marca,
copyright) vive en `src/data/pages-manifest.json`, campos `cta`,
`brand_tagline` y `copyright` de cada página.

### 🔍 Título de pestaña / meta descripción (SEO)
→ `src/pages/<pagina>/meta.json` → campos `"title"` y `"description"`

### 🔤 Fuentes de Google Fonts / Font Awesome
→ `src/pages/<pagina>/head-extra.html`

### ⚙️ Comportamiento / lógica específica de una página (carrito, filtros, modales, conexión a Excel)
→ `src/pages/<pagina>/script.js`

### ⚙️ Funciones compartidas por todas las páginas (money, toast, sonido de clic, abrir/cerrar carrito)
→ `src/scripts/cart-utils.js` — se carga una sola vez y el navegador la
cachea entre páginas (ver sección 9).

### 🖼️ Favicon (el ícono de la pestaña del navegador)
→ `src/partials/favicon.html` (compartido, un solo lugar para las 14 páginas)

### 🖼️ Fotos, logos, imágenes del carrusel
→ Carpetas `imagenes/` y `carrusel/` en la raíz — igual que en el proyecto
original, no cambió nada ahí.

### ➕ Agregar una página nueva
1. Creá `src/pages/nombre-nueva/` con los 7 archivos (podés copiar la
   estructura de una parecida, ej. `contacto/`, y editar el contenido).
2. Agregala a `src/data/pages-manifest.json` con su `file`, `title`,
   `description`, `nav_items`, `has_search`, `cta`.
3. Corré el build.

---

## 4. Cómo generar el sitio final (build)

Necesitás [Node.js](https://nodejs.org) instalado (cualquier versión reciente).

```bash
cd nemura-modular
node scripts/build.js
```

Esto:
1. Lee `src/data/pages-manifest.json` para saber qué páginas existen y sus datos (nav, CTA, tagline, copyright).
2. Copia el CSS compartido (`variables/layout/utilities/components/animations/responsive.css`) y `cart-utils.js` a `dist/assets/`, con un hash en el nombre calculado desde su propio contenido.
3. Copia el CSS/JS específico de cada página a `dist/assets/css/pages/` y `dist/assets/js/pages/`.
4. Renderiza `header.html` y `footer.html` (los partials únicos) insertando el nav, CTA, tagline y copyright de esa página.
5. Ensambla el `.html` final — `<link>`/`<script src>` apuntando a los assets, en vez de CSS/JS incrustado — y lo escribe en `dist/`.

Salida esperada en la terminal:
```
✔ 14 páginas generadas en /dist
```

Si ves un error, casi siempre es porque:
- Falta algún archivo dentro de una carpeta de página (borraste algo sin querer).
- El `pages-manifest.json` tiene una página que no tiene carpeta en `src/pages/`, o al revés.

## 5. Cómo ver el resultado antes de subirlo

```bash
cd dist
npx serve .
```
(o cualquier servidor estático — Live Server de VS Code también sirve).
Abrí `http://localhost:3000` (o el puerto que te indique) y navegá las páginas.

## 6. Cómo subirlo a Vercel

Subís la carpeta `dist/` completa (con `imagenes/` y `carrusel/` adentro)
como si fuera el sitio estático de siempre — no cambia nada del deploy que
ya conocés, solo que ahora `dist/` se genera automáticamente en vez de
editarse a mano.

Si querés que el build corra automático en cada deploy de Vercel (en vez de
correrlo vos a mano antes de subir), decime y armo el `vercel.json` +
`package.json` con el build command.

---

## 7. Cache del navegador (carga más rápida)

Antes, cada una de las 14 páginas traía su propio CSS y JS incrustados
adentro del `.html` — el navegador tenía que descargar ese mismo diseño y
esas mismas funciones **de nuevo en cada página** que visitabas.

Ahora `build.js` saca el CSS y el JS compartidos a archivos aparte:

```
dist/assets/css/variables.css?v=<hash>
dist/assets/css/layout.css?v=<hash>
dist/assets/css/utilities.css?v=<hash>
dist/assets/css/components.css?v=<hash>
dist/assets/css/animations.css?v=<hash>
dist/assets/css/responsive.css?v=<hash>
dist/assets/js/cart-utils.js?v=<hash>
```

(el CSS/JS específico de cada página también sale como archivo aparte, en
`dist/assets/css/pages/<slug>.css` y `dist/assets/js/pages/<slug>.js`, con
su propio hash — así, si volvés a visitar la misma página, tampoco se
vuelve a descargar).

y cada página los referencia con `<link>` / `<script src="">` en vez de
tenerlos pegados adentro. Con el `vercel.json` incluido, el navegador
descarga los archivos compartidos **una sola vez** en la primera página que
visita el usuario, y los reutiliza (sin volver a pedirlos al servidor) en el
resto del sitio durante un año (`max-age=31536000, immutable`).

**El `?v=<hash>` en la URL cambia solo** cada vez que corrés el build y el
contenido de `variables.css`/`components.css`/etc. cambió. Así el navegador
nunca sirve una versión vieja por error: si el CSS es igual, el hash es
igual y usa la copia cacheada; si cambiaste algo, el hash cambia y descarga
la versión nueva.

No tenés que hacer nada manualmente para esto — pasa solo al correr
`node scripts/build.js` y desplegar `dist/` a Vercel.

---

## 8. Carrusel 3D dinámico (único, conectado al Excel)

`src/scripts/dynamic-carousel.js` es el ÚNICO componente de carrusel del
sitio. Reemplazó el carrusel estático de imágenes de `portfolio.html`
(antes leía `carrusel/Listado.txt`, carpeta ya eliminada — el proyecto bajó
de 41MB a 5.7MB solo por eso).

Para agregarlo a una página nueva:
```js
NemuraCarousel.mount('#miContenedor', {
  sheetdbUrl: SHEETDB_URL,
  tipo: 'fisico',        // fisico | digital | vaso | portafolio | null = todos
  limite: 12,
  enlaceBase: 'tienda-ropa.html'
});
```
Ordena automáticamente por más reciente (usa la columna `fecha_creacion` del
Excel si existe; si no, asume que las últimas filas agregadas son las más
nuevas). Autoplay, loop infinito, swipe táctil, 3D coverflow con tus colores
— todo en `src/styles/components-carousel.css`.

Ya está montado en: `index.html`, `tienda-ropa.html`, `tienda-disenos.html`,
`vasos.html` y `portfolio.html`.

## 9. Menú — único para todo el sitio (desktop, tablet, móvil)

El menú hamburguesa reemplazó el menú horizontal de escritorio en todas las
resoluciones. Se define en UN solo lugar: `nav_items` dentro de
`pages-manifest.json` (por página) — el build genera desde ahí tanto el link
"activo" como la lista numerada del panel deslizable. La lógica de abrir/
cerrar también es única, vive en `src/scripts/cart-utils.js` (se carga en
las 15 páginas), no repetida en cada `script.js`.

## 10. Logos — cuál va dónde

- **Favicon** (pestaña del navegador, el "exterior"): `logo-escorpion.png` —
  `src/partials/favicon.html`.
- **Header y footer** (adentro de la página, el "interior"):
  `logo-principal.png` — `src/partials/header.html` / `footer.html`.

## 11. Reparación rápida — síntomas comunes

| Síntoma | Dónde mirar |
|---|---|
| Un link del menú apunta a la página equivocada / falta un link | `src/partials/header.html` (HTML/estructura) o `nav_items` en `pages-manifest.json` (qué links y en qué orden, por página) |
| El texto del footer (CTA, tagline, copyright) no cambia | Revisá `cta` / `brand_tagline` / `copyright` de esa página en `pages-manifest.json`, no `footer.html` (eso es solo la estructura, igual para todas) |
| Un estilo se ve distinto en una sola página | Puede estar en `components.css`/`variables.css` (afecta a todas) cuando debería estar en el `style.css` de esa página, o viceversa |
| El build no toma mis cambios | Te olvidaste de correr `node scripts/build.js` de nuevo después de editar `src/` |
| Subí `dist/` y desapareció mi cambio | Editaste directo en `dist/` en vez de en `src/` — el build lo pisa |
| Cambié un color y no se ve en el sitio ya desplegado | El navegador puede tener cacheado el CSS viejo por 1 año — normalmente el `?v=hash` nuevo lo resuelve solo; si no, forzá recarga (Ctrl+Shift+R) |
| Productos no cargan / se ven los de respaldo | Revisá `SHEETDB_URL` en el `script.js` de esa página y la hoja de Excel conectada (ver sección Excel del README) |

---

## 9. Resumen en una frase

**Diseño global** → `src/styles/variables.css` (colores/tipos) o `components.css`
(header/footer/botones/cards) · **Contenido de una página** →
`src/pages/<pagina>/content.html` · **Menú** → `src/partials/header.html` +
`nav_items` en el manifest · **Footer** → `src/partials/footer.html` + `cta`/
`brand_tagline`/`copyright` en el manifest · **Lógica compartida (carrito,
sonidos)** → `src/scripts/cart-utils.js` · **Lógica/Excel de una página** →
`script.js` de esa carpeta · **Después de cualquier cambio** →
`node scripts/build.js`.
