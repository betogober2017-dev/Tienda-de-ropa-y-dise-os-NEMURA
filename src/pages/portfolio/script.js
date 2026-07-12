/* ============================================================
       CONFIGURACIÓN — CONEXIÓN A EXCEL VIA SHEETDB
       ============================================================ */
    const SHEETDB_URL = 'https://sheetdb.io/api/v1/nsfs9j9qrm77m';

    /* ============================================================
       ESTADO
       ============================================================ */
    const state = {
      proyectos: [],
      carrito: JSON.parse(localStorage.getItem('nemura-carrito') || '[]'),
      favoritos: JSON.parse(localStorage.getItem('nemura-favoritos') || '[]'),
      filter: 'all',
      visibleCount: 6
    };

    /* ============================================================
       UTILIDADES
       ============================================================ */
    

    function getTexto(producto, campo, idioma = 'es') {
      return producto[campo + '_' + idioma] || producto[campo] || '';
    }

    

    /* ============================================================
       AUDIO — SONIDOS FUTURISTAS
       ============================================================ */
    let audioCtx;

    
    const sfx = {
      openModal: () => playTone(520, 0.12, 'sine', 0.06),
      closeModal: () => playTone(300, 0.1, 'sine', 0.05),
      fav: () => playTone(880, 0.08, 'triangle', 0.05),
      addCart: () => { playTone(600, 0.08, 'square', 0.04);
        setTimeout(() => playTone(900, 0.09, 'square', 0.04), 80); },
      success: () => { playTone(660, 0.1, 'sine', 0.05);
        setTimeout(() => playTone(990, 0.14, 'sine', 0.05), 100); },
      error: () => playTone(160, 0.2, 'sawtooth', 0.05)
    };

    /* ============================================================
       CARRUSEL PRINCIPAL — ahora dinámico desde el Excel (SheetDB),
       vía el componente único NemuraCarousel (src/scripts/dynamic-carousel.js).
       Reemplaza la carga estática de imágenes desde carrusel/Listado.txt.
    ============================================================ */
    function cargarCarrusel() {
      NemuraCarousel.mount('#main-slides', {
        sheetdbUrl: SHEETDB_URL + '?sheet=PRODUCTOS_WEB',
        tipo: 'portafolio',
        limite: 12,
        enlaceBase: 'portfolio.html'
      });
    }

    /* ============================================================
       CARGAR PROYECTOS DESDE EXCEL (SOLO PORTAFOLIO)
       ============================================================ */
    async function cargarProyectosDesdeExcel() {
      const grid = document.getElementById('portfolioGrid');
      grid.innerHTML = Array(6).fill(0).map(() => `
        <div style="background:rgba(255,255,255,0.01);border:1px solid #1a1a1a;border-radius:20px;padding:18px;height:320px;position:relative;overflow:hidden;">
          <div style="width:100%;aspect-ratio:4/3;border-radius:14px;background:linear-gradient(90deg,#111,#1a1a1a,#111);background-size:200% 100%;animation:skeleton-move 1.5s infinite;margin-bottom:12px;"></div>
          <div style="width:60%;height:14px;background:#111;border-radius:4px;margin-bottom:6px;"></div>
          <div style="width:80%;height:10px;background:#111;border-radius:4px;margin-bottom:4px;"></div>
          <div style="width:40%;height:10px;background:#111;border-radius:4px;"></div>
        </div>
      `).join('');

      try {
        const resp = await fetch(SHEETDB_URL + '?sheet=PRODUCTOS_WEB&t=' + Date.now());
        let data = await resp.json();

        if (!data || data.length === 0) {
          data = getProyectosRespaldo();
        }

        // Filtrar proyectos de portafolio
        state.proyectos = data.filter(p =>
          ((p.categoria_es && (
            p.categoria_es.toLowerCase().includes('portafolio') ||
            p.categoria_es.toLowerCase().includes('diseño') ||
            p.categoria_es.toLowerCase().includes('ilustracion') ||
            p.categoria_es.toLowerCase().includes('branding') ||
            p.categoria_es.toLowerCase().includes('publicidad')
          )) ||
          (p.tipo && p.tipo.toLowerCase().includes('portafolio'))) &&
          p.activo !== 'False'
        );
        if (state.proyectos.length === 0) state.proyectos = getProyectosRespaldo();

        renderProyectos(state.proyectos.slice(0, state.visibleCount));
        document.getElementById('loadMoreBtn').style.display = state.proyectos.length > state.visibleCount ? 'inline-flex' :
          'none';
      } catch (error) {
        console.error('❌ Error cargando proyectos:', error);
        state.proyectos = getProyectosRespaldo();
        renderProyectos(state.proyectos.slice(0, state.visibleCount));
      }
    }

    /* ============================================================
       PROYECTOS DE RESPALDO (PORTAFOLIO)
    ============================================================ */
    function getProyectosRespaldo() {
      return [
        { id: "p1", nombre_es: "Branding Marca Urban", categoria_es: "Branding", tipo: "portafolio", precio_cop: "0",
          imagen1: "https://placehold.co/600x400/111/FF6600?text=Branding", estrellas: "4.9", reseñas: "45", destacado: "True" },
        { id: "p2", nombre_es: "Ilustración Personaje", categoria_es: "Ilustración", tipo: "portafolio", precio_cop: "0",
          imagen1: "https://placehold.co/600x400/111/FF6600?text=Ilustracion", estrellas: "4.8", reseñas: "32", destacado: "True" },
        { id: "p3", nombre_es: "Publicidad Red Bull", categoria_es: "Publicidad", tipo: "portafolio", precio_cop: "0",
          imagen1: "https://placehold.co/600x400/111/FF6600?text=Publicidad", estrellas: "4.7", reseñas: "28" },
        { id: "p4", nombre_es: "Diseño Editorial", categoria_es: "Diseño", tipo: "portafolio", precio_cop: "0",
          imagen1: "https://placehold.co/600x400/111/FF6600?text=Editorial", estrellas: "4.6", reseñas: "19" },
        { id: "p5", nombre_es: "Branding Startup Tech", categoria_es: "Branding", tipo: "portafolio", precio_cop: "0",
          imagen1: "https://placehold.co/600x400/111/FF6600?text=Startup", estrellas: "4.9", reseñas: "56", destacado: "True" },
        { id: "p6", nombre_es: "Ilustración Fantasía", categoria_es: "Ilustración", tipo: "portafolio", precio_cop: "0",
          imagen1: "https://placehold.co/600x400/111/FF6600?text=Fantasia", estrellas: "4.8", reseñas: "41" },
        { id: "p7", nombre_es: "Campaña Publicitaria Nike", categoria_es: "Publicidad", tipo: "portafolio", precio_cop: "0",
          imagen1: "https://placehold.co/600x400/111/FF6600?text=Nike", estrellas: "4.9", reseñas: "78", destacado: "True" },
        { id: "p8", nombre_es: "Diseño de Empaques", categoria_es: "Diseño", tipo: "portafolio", precio_cop: "0",
          imagen1: "https://placehold.co/600x400/111/FF6600?text=Empaques", estrellas: "4.5", reseñas: "23" }
      ];
    }

    /* ============================================================
       RENDERIZAR PROYECTOS
    ============================================================ */
    function renderProyectos(lista) {
      const grid = document.getElementById('portfolioGrid');
      if (!lista || lista.length === 0) {
        grid.innerHTML =
          `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#888;"><h3>No hay proyectos disponibles</h3><p style="opacity:0.3;">Pronto tendremos más trabajos</p></div>`;
        return;
      }

      grid.innerHTML = lista.map((p, i) => {
        const nombre = getTexto(p, 'nombre') || 'Proyecto';
        const categoria = getTexto(p, 'categoria') || 'General';
        const img = p.imagen1 || 'https://placehold.co/600x400/222/FF6600?text=NEMURA';
        const esFav = state.favoritos.includes(p.id);
        const stars = parseFloat(p.estrellas) || 0;
        const reviews = parseInt(p.reseñas) || 0;
        const catClass = categoria.toLowerCase();

        // Determinar badge color
        let badgeClass = 'diseño';
        if (catClass.includes('ilustracion')) badgeClass = 'ilustracion';
        else if (catClass.includes('publicidad')) badgeClass = 'publicidad';
        else if (catClass.includes('branding')) badgeClass = 'branding';

        return `
        <div class="portfolio-card" data-id="${p.id}" style="animation-delay:${i * 0.05}s;">
          <div class="card-media">
            <img src="${img}" alt="${nombre}" loading="lazy" onerror="this.src='https://placehold.co/600x400/222/FF6600?text=NEMURA'">
            <button class="card-fav ${esFav?'active':''}" data-fav="${p.id}">
              <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
            </button>
          </div>
          <div class="card-info">
            <div class="card-cat">${categoria}</div>
            <div class="card-name">${nombre}</div>
            <div class="card-desc">${p.descripcion_es || 'Proyecto de diseño publicitario'}</div>
            <span class="badge-tag ${badgeClass}">${categoria}</span>
            <div style="margin-top:8px;font-size:12px;color:var(--gold);">${'★'.repeat(Math.round(stars))}${'☆'.repeat(5-Math.round(stars))} <span style="color:rgba(245,243,238,.4);font-size:10px;">(${reviews})</span></div>
          </div>
        </div>
        `;
      }).join('');

      grid.querySelectorAll('.portfolio-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.card-fav')) return;
          const id = card.dataset.id;
          const proyecto = state.proyectos.find(p => p.id === id);
          if (proyecto) {
            toast(`📂 ${getTexto(proyecto, 'nombre')} — Proyecto destacado`);
            sfx.openModal();
          }
        });
        setTimeout(() => card.style.opacity = '1', 50);
        card.style.opacity = '0';
        card.style.transition = 'opacity .4s var(--ease)';
        setTimeout(() => card.style.opacity = '1', 100 + i * 60);
      });

      grid.querySelectorAll('.card-fav').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.dataset.fav;
          toggleFavorito(id);
        });
      });
    }

    /* ============================================================
       FAVORITOS
    ============================================================ */
    function toggleFavorito(id) {
      const idx = state.favoritos.indexOf(id);
      if (idx > -1) { state.favoritos.splice(idx, 1);
        toast('💔 Eliminado de favoritos'); } else { state.favoritos.push(id);
        toast('❤️ Agregado a favoritos');
        sfx.fav(); }
      localStorage.setItem('nemura-favoritos', JSON.stringify(state.favoritos));
      document.getElementById('favBadge').textContent = state.favoritos.length;
      renderProyectos(state.proyectos.slice(0, state.visibleCount));
    }

    /* ============================================================
       FILTROS (Adaptados a portafolio)
    ============================================================ */
    document.getElementById('filterBar').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      document.querySelectorAll('#filterBar .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.filter = chip.dataset.filter;
      state.visibleCount = 6;
      aplicarFiltros();
    });

    function aplicarFiltros() {
      let lista = [...state.proyectos];
      if (state.filter === 'diseño') lista = lista.filter(p => (p.categoria_es || '').toLowerCase().includes('diseño'));
      else if (state.filter === 'ilustracion') lista = lista.filter(p => (p.categoria_es || '').toLowerCase().includes(
        'ilustracion'));
      else if (state.filter === 'publicidad') lista = lista.filter(p => (p.categoria_es || '').toLowerCase().includes(
        'publicidad'));
      else if (state.filter === 'branding') lista = lista.filter(p => (p.categoria_es || '').toLowerCase().includes(
        'branding'));
      renderProyectos(lista.slice(0, state.visibleCount));
      document.getElementById('loadMoreBtn').style.display = lista.length > state.visibleCount ? 'inline-flex' : 'none';
    }

    /* ============================================================
       LOAD MORE
    ============================================================ */
    document.getElementById('loadMoreBtn').addEventListener('click', () => {
      state.visibleCount += 6;
      aplicarFiltros();
    });

    /* ============================================================
       CARRITO
    ============================================================ */
    const cartOverlay = document.getElementById('cartOverlay');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartItemsEl = document.getElementById('cartItems');
    const cartSubtotalEl = document.getElementById('cartSubtotal');
    const cartBadge = document.getElementById('cartBadge');

    function renderCarrito() {
      cartBadge.textContent = state.carrito.reduce((a, i) => a + i.cantidad, 0);
      if (state.carrito.length === 0) {
        cartItemsEl.innerHTML =
          `<div class="cart-empty">Tu carrito está vacío.<br>Explora el catálogo para empezar.</div>`;
        cartSubtotalEl.textContent = money(0);
        return;
      }
      cartItemsEl.innerHTML = state.carrito.map((item, idx) => `
        <div class="cart-item">
          <img src="${item.imagen}" alt="${item.nombre}">
          <div class="cart-item-info">
            <b>${item.nombre}</b>
            <div class="meta">${item.tipo || 'Producto'} · Cant. ${item.cantidad}</div>
            <div class="cart-item-price">${money(item.precio * item.cantidad)}</div>
            <a class="cart-item-remove" data-remove="${idx}">Eliminar</a>
          </div>
        </div>
      `).join('');
      const subtotal = state.carrito.reduce((a, i) => a + i.precio * i.cantidad, 0);
      cartSubtotalEl.textContent = money(subtotal);
    }

    cartItemsEl.addEventListener('click', (e) => {
      const rm = e.target.closest('[data-remove]');
      if (rm) { state.carrito.splice(+rm.dataset.remove, 1);
        localStorage.setItem('nemura-carrito', JSON.stringify(state.carrito));
        renderCarrito(); }
    });

    

    

    document.getElementById('cartBtn').addEventListener('click', abrirCarrito);
    document.getElementById('cartCloseBtn').addEventListener('click', cerrarCarrito);
    cartOverlay.addEventListener('click', cerrarCarrito);

    document.getElementById('cartCheckoutBtn').addEventListener('click', () => {
      if (state.carrito.length === 0) { toast('Tu carrito está vacío', 'error');
        sfx.error(); return; }
      toast('✅ Redirigiendo a pago...', 'success');
      sfx.success();
      setTimeout(cerrarCarrito, 1500);
    });

    /* ============================================================
       BÚSQUEDA
    ============================================================ */
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') buscarProyectos();
    });

    document.getElementById('searchBtnHeader').addEventListener('click', buscarProyectos);

    function buscarProyectos() {
      const input = document.getElementById('searchInput');
      const term = input.value.trim();
      if (!term) {
        toast('🔍 Escribe algo para buscar');
        return;
      }
      const filtrados = state.proyectos.filter(p =>
        (getTexto(p, 'nombre') || '').toLowerCase().includes(term.toLowerCase()) ||
        (getTexto(p, 'categoria') || '').toLowerCase().includes(term.toLowerCase())
      );
      if (filtrados.length > 0) {
        renderProyectos(filtrados.slice(0, state.visibleCount));
        toast(`🔍 ${filtrados.length} resultados encontrados`);
      } else {
        toast('🔍 No se encontraron proyectos', 'error');
        sfx.error();
      }
    }

    /* ============================================================
       FAVORITOS VER
    ============================================================ */
    document.getElementById('favBtn').addEventListener('click', () => {
      if (state.favoritos.length === 0) { toast('❤️ No tienes favoritos aún'); return; }
      const favs = state.proyectos.filter(p => state.favoritos.includes(p.id));
      renderProyectos(favs);
      toast(`❤️ ${favs.length} favoritos`);
    });

    /* ============================================================
       HEADER SCROLL
    ============================================================ */
    const header = document.getElementById('siteHeader');
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 12);
    }, { passive: true });

    /* ============================================================
       MOBILE MENU
    ============================================================ */
    // Menú hamburguesa: inicializado globalmente en cart-utils.js

    /* ============================================================
       INICIO
    ============================================================ */
    document.getElementById('year').textContent = new Date().getFullYear();
    document.getElementById('favBadge').textContent = state.favoritos.length;
    renderCarrito();
    cargarCarrusel();
    cargarProyectosDesdeExcel();

    console.log('🎨 NEMURA — Portafolio de Ernesto Gómez');
    console.log('✅ Conectado a Excel vía SheetDB');
    console.log('✅ Carrusel 3D con imágenes desde carpeta');
    console.log('✅ Carrito y favoritos persistentes');
    console.log('✅ Sonidos futuristas');
    console.log('🚀 ¡Todo listo!');
