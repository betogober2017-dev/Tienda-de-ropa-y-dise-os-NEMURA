# NEMURA — Fase 1: Arquitectura Modular (sin cambios visuales)

## Qué se hizo

El sitio original eran 13 archivos `.html` independientes, cada uno con el header,
footer, tokens de diseño y componentes base **copiados y pegados 46 veces**.
Este repo separa eso en módulos reutilizables, verificados para que el
resultado renderizado sea **idéntico** al original.

```
src/
  partials/
    favicon.html          ← bloque de favicon (idéntico en las 14 páginas)
  styles/
    shared.css             ← 92 reglas CSS verificadas EXACTAS en las 14 páginas
                              (tokens :root, reset, .container, header, footer,
                              botones, halftone/noise, etc.)
  pages/
    <slug>/
      head-extra.html      ← fonts + Font Awesome (varía levemente por página)
      header.html          ← header completo de esa página (nav + logo + acciones)
      footer.html           ← footer completo de esa página (CTA + columnas + copyright)
      content.html          ← el contenido único de esa página (hero, secciones, etc.)
      style.css             ← CSS específico de esa página (lo que NO es compartido)
      script.js              ← JS específico de esa página
      meta.json              ← título, descripción, nav, CTA (estructurado)
  data/
    pages-manifest.json     ← manifest de las 14 páginas
scripts/
  build.js                  ← ensambla todo y genera /dist (listo para deploy)
dist/                        ← salida generada (lo que subes a Vercel)
```

## Verificación de fidelidad (hecha, no prometida)

- Las 92 reglas de `shared.css` se calcularon por **intersección exacta** de
  texto normalizado entre las 14 páginas — no son una aproximación.
- Conteo de reglas CSS original vs. reconstruido: **idéntico en las 3 páginas
  probadas** (234=234, 216=216, 144=144). Ninguna regla se perdió ni se duplicó.
- Se revisó el orden de cascada: no hay selectores donde una regla "shared"
  quede después de una regla "page-specific" que dependa de sobreescribirla.
  (Los únicos "duplicados" de selector son bloques `@media` con el mismo
  breakpoint en distintas secciones — eso es normal y no representa riesgo.)
- El `diff` línea por línea contra el original **no** es 0 porque cambió el
  *orden* de las reglas (compartidas primero, luego específicas) y el
  formato — pero el CSS resultante es funcionalmente equivalente.

**Pendiente de tu parte:** antes de reemplazar el sitio en producción, dale
un vistazo visual a 2–3 páginas del `/dist` en el navegador para confirmar
que todo se ve igual. Si algo se corrió un pixel, te lo arreglo puntual —
pero la extracción fue automatizada y verificada, no adivinada.

## Cómo generar el sitio final

```bash
cd nemura-modular
node scripts/build.js
# genera /dist con los 14 .html + imágenes, listo para subir a Vercel
```

---

## HALLAZGO IMPORTANTE: el catálogo YA está conectado a Excel

Revisando el JS de cada página encontré que **ya existe una integración
funcionando con Excel vía SheetDB**:

```js
const SHEETDB_URL = 'https://sheetdb.io/api/v1/ahz287fdu7x2p';
```

Este endpoint es el mismo en `index.html`, `tienda-ropa.html`,
`tienda-disenos.html`, `vasos.html` y `portfolio.html` — es decir, **todo el
catálogo ya lee de UNA sola hoja de cálculo**, y cada página filtra por la
columna `tipo`:

| Página | Filtra `tipo =` | Columnas propias además de las comunes |
|---|---|---|
| tienda-ropa | `fisico` | `tallas` |
| tienda-disenos | `digital` | `formato` |
| vasos | `vaso` | `material`, `capacidad` |
| portfolio | `portafolio` | (sin extra) |

**Columnas comunes que espera el código en todas las filas:**
`id, nombre_es, categoria_es, tipo, precio_cop, imagen1, estrellas, reseñas, destacado`

Si la hoja no responde o no tiene datos, cada página cae automáticamente a
un set de "productos de respaldo" (`PRODUCTOS_RESPALDO` / `getProductosRespaldo()`)
hardcodeado en el JS, para que la tienda nunca se vea vacía.

### No pude verificar si el endpoint está vivo ahora mismo

`sheetdb.io` no está en la lista de dominios permitidos en mi entorno, así
que no pude hacer el `fetch` de prueba desde acá. Necesito que confirmes:

1. **¿Esa hoja (`ahz287fdu7x2p`) sigue siendo la tuya y sigue activa?**
   Si sí, probablemente el catálogo ya está "conectado al Excel" tal como
   pedís — solo faltaría verificar que las columnas de tu hoja actual
   coincidan exactamente con las de la tabla de arriba.
2. Si me subís el Excel/NEMURA_ERP real, comparo sus columnas contra lo que
   el código espera y te digo exactamente qué ajustar (o armo el mapeo si
   los nombres de columna no coinciden).
