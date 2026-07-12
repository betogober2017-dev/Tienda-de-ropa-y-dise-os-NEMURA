/* ============================================================
   NEMURA — Configuración global del sitio
   Cambiar un dato acá lo actualiza en TODA la plataforma (build.js
   lo inyecta donde se necesite en la próxima corrida).
   ============================================================ */
const SITE_CONFIG = {
  empresa: 'NEMURA Studio',
  whatsapp: '', // ej: '573001234567' (sin +, sin espacios) — falta, avisame el número
  correo: 'nemmurasolisitudeswed1@gmail.com',
  telefono: '',
  redes: {
    instagram: 'https://www.instagram.com/nemuramanga/',
    tiktok: 'https://www.tiktok.com/@namuramanga',
    facebook: 'https://www.facebook.com/profile.php?id=61591386573676',
  },
  sheetdb: {
    url: 'https://sheetdb.io/api/v1/nsfs9j9qrm77m',
    sheet: 'PRODUCTOS_WEB', // sin esto, SheetDB lee la primera hoja (PANEL) por defecto
  },
  seo: {
    sitioUrl: 'https://nemura.studio', // ajustar al dominio real
    imagenPorDefecto: '/imagenes/logos%20principal/logo-principal.png',
  },
  moneda: 'COP',
};

if (typeof module !== 'undefined') module.exports = SITE_CONFIG;
