/* ============================================================
   NEMURA — cart-utils.js
   Funciones compartidas por las 14 páginas (idénticas byte a
   byte en el sitio original, verificado antes de extraerlas).
   Depende de variables globales definidas en cada página:
     - cartDrawer, cartOverlay (elementos del drawer del carrito)
     - audioCtx (se auto-inicializa la primera vez que se usa)
   ============================================================ */

function money(n) { return '$' + n.toLocaleString('es-CO'); }

function toast(msg, type = 'ok') {
  const wrap = document.getElementById('toastWrap');
  const el = document.createElement('div');
  el.className = 'toast' + (type === 'error' ? ' error' : '');
  el.innerHTML =
    `<svg viewBox="0 0 24 24" fill="none" stroke-width="2">${type === 'error' ? '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>' : '<path d="M20 6 9 17l-5-5"/>'}</svg><span>${msg}</span>`;
  wrap.appendChild(el);
  setTimeout(() => { el.classList.add('toast-out');
    setTimeout(() => el.remove(), 300); }, 2600);
}

function playTone(freq, dur = 0.09, type = 'sine', gain = 0.05) {
  try {
    audioCtx = audioCtx || new(window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g);
    g.connect(audioCtx.destination);
    osc.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    osc.stop(audioCtx.currentTime + dur + 0.02);
  } catch (e) {}
}

function abrirCarrito() { cartDrawer.classList.add('open');
  cartOverlay.classList.add('open'); }

function cerrarCarrito() { cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open'); }

/* ============================================================
   Menú hamburguesa — único para todo el sitio (antes duplicado en
   las 14 páginas). Los scripts se cargan al final del <body>, así
   que el DOM ya está listo acá — no hace falta esperar DOMContentLoaded.
   ============================================================ */
(function initBurgerMenu() {
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!burgerBtn || !mobileMenu) return;
  burgerBtn.addEventListener('click', () => {
    burgerBtn.classList.toggle('active');
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burgerBtn.classList.remove('active');
    mobileMenu.classList.remove('open');
  }));
})();
