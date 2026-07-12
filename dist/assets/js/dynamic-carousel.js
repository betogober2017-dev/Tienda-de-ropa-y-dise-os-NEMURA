/* ============================================================
   NEMURA — dynamic-carousel.js
   Componente ÚNICO de carrusel 3D para todo el sitio. Reemplaza
   cualquier carrusel anterior (incluida la galería estática de
   portfolio.html basada en /carrusel/ + Listado.txt).

   Uso (una línea por página):
     NemuraCarousel.mount('#miContenedor', {
       sheetdbUrl: SITE_CONFIG.sheetdb.url,   // o el string directo
       tipo: 'fisico',                          // fisico | digital | vaso | portafolio | null = todos
       limite: 12,
       enlaceBase: 'tienda-ropa.html'           // a dónde linkea cada slide
     });

   Cada fila del Excel puede traer una columna opcional
   "fecha_creacion" (AAAA-MM-DD). Si no existe, se usa el orden de
   fila del Excel (las últimas filas = más recientes), que es el
   comportamiento natural al agregar productos nuevos abajo.
   ============================================================ */
const NemuraCarousel = (function () {

  function ordenarPorRecientes(items) {
    const conFecha = items.every(p => p.fecha_creacion);
    if (conFecha) {
      return [...items].sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
    }
    // Sin columna de fecha: SheetDB devuelve las filas en el orden del
    // Excel, así que invertimos (última fila agregada = más reciente).
    return [...items].reverse();
  }

  async function fetchProductos(sheetdbUrl, tipo) {
    const res = await fetch(sheetdbUrl);
    if (!res.ok) throw new Error('SheetDB no respondió: ' + res.status);
    let data = await res.json();
    data = data.filter(p => p.activo !== 'False');
    if (tipo) data = data.filter(p => (p.tipo || '').toLowerCase() === tipo.toLowerCase());
    return ordenarPorRecientes(data);
  }

  function render(container, items, opts) {
    container.innerHTML = `
      <div class="ncar-stage">
        <button class="ncar-arrow ncar-prev" aria-label="Anterior">‹</button>
        <div class="ncar-track"></div>
        <button class="ncar-arrow ncar-next" aria-label="Siguiente">›</button>
      </div>
      <div class="ncar-dots"></div>`;

    const track = container.querySelector('.ncar-track');
    const dotsWrap = container.querySelector('.ncar-dots');
    let current = 0;

    items.forEach((p, i) => {
      const img = p.imagen1 || 'https://placehold.co/600x800/1a1a1a/FF6600?text=NEMURA';
      const nombre = p.nombre_es || 'Producto NEMURA';
      const precio = p.precio_cop ? '$' + Number(p.precio_cop).toLocaleString('es-CO') : '';
      const usaModal = typeof opts.onOpen === 'function';
      const href = opts.enlaceBase ? `${opts.enlaceBase}?id=${encodeURIComponent(p.id)}` : '#';

      const el = document.createElement(usaModal ? 'div' : 'a');
      el.className = 'ncar-slide';
      if (!usaModal) el.href = href;
      el.innerHTML = `
        <img src="${img}" alt="${nombre}" loading="lazy">
        <div class="ncar-info">
          <div class="ncar-tag">${p.categoria_es || ''}</div>
          <h3>${nombre}</h3>
          ${precio ? `<div class="ncar-price">${precio}</div>` : ''}
        </div>`;
      el.addEventListener('click', e => {
        // clic en una tarjeta lateral: solo centra, no abre/navega todavía
        if (i !== current) { e.preventDefault(); current = i; update(); return; }
        // clic en la tarjeta central: abre el modal premium de ESE producto
        // (mismo comportamiento que las tarjetas del grid normal), o
        // navega a la página del catálogo si esta página no tiene modal.
        if (usaModal) { e.preventDefault(); opts.onOpen(p); }
      });
      track.appendChild(el);

      const dot = document.createElement('button');
      dot.className = 'ncar-dot';
      dot.addEventListener('click', () => { current = i; update(); resetAutoplay(); });
      dotsWrap.appendChild(dot);
    });

    const slideEls = [...track.children];
    const dotEls = [...dotsWrap.children];
    const n = items.length;

    function update() {
      slideEls.forEach((el, i) => {
        let offset = i - current;
        if (offset > n / 2) offset -= n;
        if (offset < -n / 2) offset += n;
        const abs = Math.abs(offset);
        if (abs > 2) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; return; }
        el.style.pointerEvents = 'auto';
        el.style.opacity = abs === 0 ? '1' : abs === 1 ? '.55' : '.25';
        el.style.zIndex = String(10 - abs);
        const tx = offset * 170, tz = abs === 0 ? 0 : -160 - abs * 40;
        const rot = offset === 0 ? 0 : offset > 0 ? -32 : 32;
        const scale = abs === 0 ? 1 : 0.78;
        el.style.transform = `translate3d(${tx}px,0,${tz}px) rotateY(${rot}deg) scale(${scale})`;
        el.style.filter = abs === 0 ? 'none' : 'brightness(.55)';
      });
      dotEls.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function next() { current = (current + 1) % n; update(); }
    function prev() { current = (current - 1 + n) % n; update(); }

    container.querySelector('.ncar-next').onclick = () => { next(); resetAutoplay(); };
    container.querySelector('.ncar-prev').onclick = () => { prev(); resetAutoplay(); };

    let autoplay = setInterval(next, 3200);
    function resetAutoplay() { clearInterval(autoplay); autoplay = setInterval(next, 3200); }

    // touch / swipe
    let touchX = null;
    const stage = container.querySelector('.ncar-stage');
    stage.addEventListener('touchstart', e => touchX = e.touches[0].clientX, { passive: true });
    stage.addEventListener('touchend', e => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (dx > 40) { prev(); resetAutoplay(); }
      else if (dx < -40) { next(); resetAutoplay(); }
      touchX = null;
    });

    // pausa autoplay al pasar el mouse (desktop)
    container.addEventListener('mouseenter', () => clearInterval(autoplay));
    container.addEventListener('mouseleave', resetAutoplay);

    update();
  }

  async function mount(selector, opts) {
    const container = document.querySelector(selector);
    if (!container) return;
    container.classList.add('ncar-root');
    container.innerHTML = '<div class="ncar-loading">Cargando…</div>';
    try {
      const items = await fetchProductos(opts.sheetdbUrl, opts.tipo || null);
      const limitados = opts.limite ? items.slice(0, opts.limite) : items;
      if (!limitados.length) { container.innerHTML = ''; return; }
      render(container, limitados, opts);
    } catch (e) {
      console.error('NemuraCarousel:', e);
      container.innerHTML = '';
    }
  }

  return { mount };
})();
