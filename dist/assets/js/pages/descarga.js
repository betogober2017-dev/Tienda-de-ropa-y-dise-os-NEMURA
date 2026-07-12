/* ============================================================
   NEMURA — descarga.html
   Página de retorno post-pago. Lee ?id=<producto_id> de la URL
   (ese id debe coincidir con la columna "id" de PRODUCTOS_WEB),
   busca el producto en SheetDB y muestra su archivo_descarga.

   Nota de seguridad: esta página NO verifica el pago del lado
   servidor (el sitio es estático). Ver aviso en la propia página
   y en MANUAL-DE-USO.md, sección "Pagos y descargas".
   ============================================================ */
const SHEETDB_URL = 'https://sheetdb.io/api/v1/nsfs9j9qrm77m';
// money() ya está disponible globalmente vía cart-utils.js (se carga antes que este script)

async function init() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const dTitulo = document.getElementById('dTitulo');
  const dSub = document.getElementById('dSub');
  const dCard = document.getElementById('dCard');
  const dError = document.getElementById('dError');

  if (!id) {
    mostrarError();
    return;
  }

  try {
    const res = await fetch(`${SHEETDB_URL}/search?sheet=PRODUCTOS_WEB&id=${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('SheetDB no respondió');
    const data = await res.json();
    const producto = Array.isArray(data) ? data[0] : null;

    if (!producto || !producto.archivo_descarga) {
      mostrarError();
      return;
    }

    dTitulo.textContent = '¡Gracias por tu compra!';
    dSub.textContent = 'Tu producto está listo para descargar.';

    document.getElementById('dImg').src = producto.imagen1 || 'https://placehold.co/600x400/222/FF6600?text=NEMURA';
    document.getElementById('dImg').alt = producto.nombre_es || '';
    document.getElementById('dNombre').textContent = producto.nombre_es || 'Tu producto';
    document.getElementById('dDesc').textContent =
      producto.descripcion_es || `Formato: ${producto.formato || 'digital'} · ${money(producto.precio_cop)}`;
    document.getElementById('dBtn').href = producto.archivo_descarga;

    dCard.style.display = 'flex';
  } catch (e) {
    mostrarError();
  }

  function mostrarError() {
    dTitulo.textContent = 'No encontramos tu producto';
    dSub.textContent = '';
    dError.style.display = 'block';
  }
}

init();
