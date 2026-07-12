/* ============================================================
       CONFIGURACIÓN — CONEXIÓN A EXCEL VIA SHEETDB
       ============================================================ */
    const SHEETDB_URL = 'https://sheetdb.io/api/v1/nsfs9j9qrm77m';

    /* ============================================================
       ESTADO
       ============================================================ */
    const state = {
      productos: [],
      carrito: JSON.parse(localStorage.getItem('nemura-carrito') || '[]'),
      favoritos: JSON.parse(localStorage.getItem('nemura-favoritos') || '[]'),
      filter: 'all',
      visibleCount: 8,
      selectedFormat: {},
      selectedQty: {},
      carouselIndex: {}
    };

    /* ============================================================
       UTILIDADES
       ============================================================ */
    

    function getTexto(producto, campo, idioma = 'es') {
      return producto[campo + '_' + idioma] || producto[campo] || '';
    }

    function getImagenes(producto) {
      const imgs = [];
      for (let i = 1; i <= 5; i++) {
        if (producto['imagen' + i]) imgs.push(producto['imagen' + i]);
      }
      return imgs.length ? imgs : ['https://placehold.co/400x400/222/FF6600?text=NEMURA'];
    }

    

    /* ============================================================
       AUDIO — SONIDOS FUTURISTAS
       ============================================================ */
    let audioCtx;

    
    const sfx = {
      openModal: () => playTone(520, 0.12, 'sine', 0.06),
      closeModal: () => playTone(300, 0.1, 'sine', 0.05),
      tab: () => playTone(700, 0.05, 'triangle', 0.04),
      fav: () => playTone(880, 0.08, 'triangle', 0.05),
      addCart: () => { playTone(600, 0.08, 'square', 0.04);
        setTimeout(() => playTone(900, 0.09, 'square', 0.04), 80); },
      success: () => { playTone(660, 0.1, 'sine', 0.05);
        setTimeout(() => playTone(990, 0.14, 'sine', 0.05), 100); },
      error: () => playTone(160, 0.2, 'sawtooth', 0.05)
    };

    /* ============================================================
       OBTENER PRODUCTOS DESDE EXCEL (SOLO DIGITALES)
       ============================================================ */
    async function cargarProductosDesdeExcel() {
      const grid = document.getElementById('productGrid');
      grid.innerHTML = Array(6).fill(0).map(() => `
        <div style="background:rgba(255,255,255,0.01);border:1px solid #1a1a1a;border-radius:20px;padding:18px;height:350px;position:relative;overflow:hidden;">
          <div style="width:100%;aspect-ratio:1/1;border-radius:14px;background:linear-gradient(90deg,#111,#1a1a1a,#111);background-size:200% 100%;animation:skeleton-move 1.5s infinite;margin-bottom:12px;"></div>
          <div style="width:60%;height:14px;background:#111;border-radius:4px;margin-bottom:6px;"></div>
          <div style="width:80%;height:10px;background:#111;border-radius:4px;margin-bottom:4px;"></div>
          <div style="width:40%;height:12px;background:#111;border-radius:4px;"></div>
        </div>
      `).join('');

      try {
        const resp = await fetch(SHEETDB_URL + '?sheet=PRODUCTOS_WEB&t=' + Date.now());
        let data = await resp.json();

        if (!data || data.length === 0) {
          data = getProductosRespaldo();
        }

        // Filtrar SOLO productos digitales
        // "pack" usa exactamente el mismo modal y flujo de pago que "digital"
        // (no necesita módulo aparte — es solo una fila más en el Excel).
        state.productos = data.filter(p => (p.tipo === 'digital' || p.tipo === 'pack') && p.activo !== 'False');
        if (state.productos.length === 0) state.productos = getProductosRespaldo();

        renderProductos(state.productos.slice(0, state.visibleCount));
        document.getElementById('loadMoreBtn').style.display = state.productos.length > state.visibleCount ? 'inline-flex' :
          'none';
      } catch (error) {
        console.error('❌ Error cargando productos:', error);
        state.productos = getProductosRespaldo();
        renderProductos(state.productos.slice(0, state.visibleCount));
      }
    }

    /* ============================================================
       PRODUCTOS DE RESPALDO (DIGITALES)
       ============================================================ */
    function getProductosRespaldo() {
      return [
        { id: "d1", nombre_es: "Pack Vectores DBZ", categoria_es: "Vectores", tipo: "digital", precio_cop: "25000",
          imagen1: "https://placehold.co/400x400/111/FF6600?text=DBZ", estrellas: "4.7", reseñas: "203",
          formato: "PNG, SVG, AI, PSD, EPS" },
        { id: "d2", nombre_es: "Mockup PSD Premium", categoria_es: "Mockups", tipo: "digital", precio_cop: "15000",
          imagen1: "https://placehold.co/400x400/111/FF6600?text=Mockup", estrellas: "4.6", reseñas: "134",
          formato: "PSD, PNG, JPG" },
        { id: "d3", nombre_es: "Plantilla Instagram Stories", categoria_es: "Plantillas", tipo: "digital", precio_cop: "12000",
          imagen1: "https://placehold.co/400x400/111/FF6600?text=Stories", estrellas: "4.3", reseñas: "89",
          formato: "PSD, AI, PNG" },
        { id: "d4", nombre_es: "Vectores Neon Cyberpunk", categoria_es: "Vectores", tipo: "digital", precio_cop: "32000",
          imagen1: "https://placehold.co/400x400/111/FF6600?text=Neon", estrellas: "4.9", reseñas: "156",
          formato: "SVG, AI, EPS, PNG" },
        { id: "d5", nombre_es: "Mockup Hoodie 3D", categoria_es: "Mockups", tipo: "digital", precio_cop: "18000",
          imagen1: "https://placehold.co/400x400/111/FF6600?text=Hoodie", estrellas: "4.5", reseñas: "78",
          formato: "PSD, PNG, JPG" },
        { id: "d6", nombre_es: "Pack Fuentes Urbanas", categoria_es: "Plantillas", tipo: "digital", precio_cop: "8000",
          imagen1: "https://placehold.co/400x400/111/FF6600?text=Fonts", estrellas: "4.2", reseñas: "45",
          formato: "OTF, TTF, WOFF" },
        { id: "d7", nombre_es: "Vectores Anime Premium", categoria_es: "Vectores", tipo: "digital", precio_cop: "28000",
          imagen1: "https://placehold.co/400x400/111/FF6600?text=Anime", estrellas: "4.8", reseñas: "312",
          formato: "SVG, AI, PNG, EPS" },
        { id: "d8", nombre_es: "Mockup Camisa Over-Sized", categoria_es: "Mockups", tipo: "digital", precio_cop: "20000",
          imagen1: "https://placehold.co/400x400/111/FF6600?text=Camisa", estrellas: "4.7", reseñas: "94",
          formato: "PSD, PNG, JPG" }
      ];
    }

    /* ============================================================
       RENDERIZAR PRODUCTOS
       ============================================================ */
    function renderProductos(lista) {
      const grid = document.getElementById('productGrid');
      if (!lista || lista.length === 0) {
        grid.innerHTML =
          `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#888;"><h3>No hay diseños digitales disponibles</h3><p style="opacity:0.3;">Pronto tendremos más diseños</p></div>`;
        return;
      }

      grid.innerHTML = lista.map((p, i) => {
        const nombre = getTexto(p, 'nombre') || 'Diseño';
        const categoria = getTexto(p, 'categoria') || 'General';
        const precio = parseFloat(p.precio_cop) || 0;
        const img = p.imagen1 || 'https://placehold.co/400x400/222/FF6600?text=NEMURA';
        const esFav = state.favoritos.includes(p.id);
        const stars = parseFloat(p.estrellas) || 0;
        const reviews = parseInt(p.reseñas) || 0;
        const formatos = (p.formato || 'PNG, SVG').split(',').slice(0, 3);

        return `
        <div class="card" data-id="${p.id}" style="animation-delay:${i * 0.05}s;">
          <div class="card-media">
            <img src="${img}" alt="${nombre}" loading="lazy" onerror="this.src='https://placehold.co/400x400/222/FF6600?text=NEMURA'">
            <div class="card-badges">
              <span class="badge-tag digital">${p.tipo === 'pack' ? '📦 Pack' : '💻 Digital'}</span>
              ${p.destacado === 'True' ? '<span class="badge-tag oferta">🔥 Destacado</span>' : ''}
              ${p.nuevo === 'True' ? '<span class="badge-tag nuevo">✨ Nuevo</span>' : ''}
            </div>
            <button class="card-fav ${esFav?'active':''}" data-fav="${p.id}">
              <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
            </button>
          </div>
          <div class="card-info">
            <div class="card-cat">${categoria}</div>
            <div class="card-name">${nombre}</div>
            <div class="card-price-row">
              <span class="card-price">${money(precio)}</span>
            </div>
            <div style="margin-top:8px;font-size:12px;color:var(--gold);">${'★'.repeat(Math.round(stars))}${'☆'.repeat(5-Math.round(stars))} <span style="color:rgba(245,243,238,.4);font-size:10px;">(${reviews})</span></div>
            <div class="card-formats">
              ${formatos.map(f => `<span>${f.trim()}</span>`).join('')}
            </div>
          </div>
        </div>
        `;
      }).join('');

      grid.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.card-fav')) return;
          const id = card.dataset.id;
          const producto = state.productos.find(p => p.id === id);
          if (producto) abrirModal(producto);
        });
        setTimeout(() => card.classList.add('in-view'), 50);
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
      renderProductos(state.productos.slice(0, state.visibleCount));
    }

    /* ============================================================
       FILTROS (Adaptados a diseños digitales)
       ============================================================ */
    document.getElementById('filterBar').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      document.querySelectorAll('#filterBar .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.filter = chip.dataset.filter;
      state.visibleCount = 8;
      aplicarFiltros();
    });

    function aplicarFiltros() {
      let lista = [...state.productos];
      if (state.filter === 'vectores') lista = lista.filter(p => (p.categoria_es || '').toLowerCase().includes('vector'));
      else if (state.filter === 'mockups') lista = lista.filter(p => (p.categoria_es || '').toLowerCase().includes('mockup'));
      else if (state.filter === 'plantillas') lista = lista.filter(p => (p.categoria_es || '').toLowerCase().includes(
        'plantilla'));
      else if (state.filter === 'ofertas') lista = lista.filter(p => p.destacado === 'True');
      renderProductos(lista.slice(0, state.visibleCount));
      document.getElementById('loadMoreBtn').style.display = lista.length > state.visibleCount ? 'inline-flex' : 'none';
    }

    /* ============================================================
       LOAD MORE
       ============================================================ */
    document.getElementById('loadMoreBtn').addEventListener('click', () => {
      state.visibleCount += 8;
      aplicarFiltros();
    });

    /* ============================================================
       MODAL PREMIUM — CON PESTAÑAS (LIRAS) COMPLETO — MISMO ESTILO
       ============================================================ */
    const modalOverlay = document.getElementById('productModal');
    const mBody = document.getElementById('mBody');
    const tabDigitalBtn = document.getElementById('tabDigitalBtn');
    const tabFisicoBtn = document.getElementById('tabFisicoBtn');
    let currentProduct = null;

    function abrirModal(producto) {
      if (!producto) return;
      currentProduct = producto;

      const nombre = getTexto(producto, 'nombre') || 'Diseño';
      const categoria = getTexto(producto, 'categoria') || 'Digital';

      document.getElementById('mTitleLabel').textContent = nombre;
      document.getElementById('mTypeLabel').textContent = categoria;

      // Resetear pestañas
      tabDigitalBtn.classList.remove('active-fisico', 'active-digital');
      tabFisicoBtn.classList.remove('active-fisico', 'active-digital');

      // Activar pestaña digital por defecto
      tabDigitalBtn.classList.add('active-digital');
      tabDigitalBtn.style.display = 'block';
      tabFisicoBtn.style.display = 'block';

      renderModalPanels(producto);
      modalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      sfx.openModal();
    }

    function cerrarModal() {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
      sfx.closeModal();
    }

    document.getElementById('mCloseBtn').addEventListener('click', cerrarModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) cerrarModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarModal(); });

    // Cambio de pestañas
    tabDigitalBtn.addEventListener('click', function() {
      if (!currentProduct) return;
      tabDigitalBtn.classList.add('active-digital');
      tabFisicoBtn.classList.remove('active-fisico');
      mBody.querySelectorAll('.mtab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === 'digital'));
      sfx.tab();
    });

    tabFisicoBtn.addEventListener('click', function() {
      if (!currentProduct) return;
      tabFisicoBtn.classList.add('active-fisico');
      tabDigitalBtn.classList.remove('active-digital');
      mBody.querySelectorAll('.mtab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === 'fisico'));
      sfx.tab();
    });

    /* ============================================================
       RENDER MODAL PANELS (DIGITAL + FÍSICO)
       ============================================================ */
    function renderModalPanels(p) {
      const imagenes = getImagenes(p);
      const precio = parseFloat(p.precio_cop) || 0;
      const stars = parseFloat(p.estrellas) || 0;
      const reviews = parseInt(p.reseñas) || 0;
      const nombre = getTexto(p, 'nombre') || 'Diseño';
      const descripcion = getTexto(p, 'descripcion') || 'Diseño premium listo para producción.';

      // Panel Digital
      const panelDigital = `
      <div class="mtab-panel active" data-panel="digital">
        <div class="mp-grid">
          <div class="carousel" id="carousel-digital">
            <div class="carousel-track" id="carouselTrack-digital">
              ${imagenes.map(src => `<img src="${src}" alt="${nombre}">`).join('')}
            </div>
            ${imagenes.length > 1 ? `
            <button class="carousel-arrow prev" data-car="digital"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button>
            <button class="carousel-arrow next" data-car="digital"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></button>
            <div class="carousel-dots" id="carouselDots-digital">${imagenes.map((_,i) => `<span class="${i===0?'active':''}"></span>`).join('')}</div>` : ''}
            <div class="watermark-badge">Vista previa — marca de agua</div>
          </div>
          <div>
            <div class="mp-cat">${getTexto(p, 'categoria') || 'Digital'}</div>
            <h3 class="mp-title">${nombre}</h3>
            <div class="mp-rating"><span class="stars">${'★'.repeat(Math.round(stars))}${'☆'.repeat(5-Math.round(stars))}</span> ${stars} · ${reviews} opiniones</div>
            <div class="mp-price-row"><span class="mp-price">${money(precio)}</span></div>
            <div class="mp-tax">Descarga digital — sin impuestos</div>
            <p style="margin-top:18px;font-size:14px;line-height:1.7;color:rgba(245,243,238,.75);">${descripcion}</p>
            <div class="opt-block">
              <div class="opt-label"><span>Formatos incluidos</span></div>
              <div class="format-grid" id="formatGrid">
                ${(p.formato || 'PNG, SVG, AI, PSD, EPS').split(',').map(f => `<button class="format-chip">${f.trim()}</button>`).join('')}
              </div>
            </div>
            <div class="opt-block">
              <div class="opt-label"><span>Licencia</span></div>
              <p style="font-size:13px;color:rgba(245,243,238,.7);margin:0;">${p.licencia || 'Uso personal — para uso comercial, contáctanos.'}</p>
            </div>
            <div class="stock-row">
              ✅ <span>Descarga inmediata</span> — ∞ disponible
            </div>
            <div class="qty-row">
              <div class="qty-ctrl">
                <button data-qty-minus="digital">–</button>
                <input type="text" readonly value="1" id="qtyInput-digital">
                <button data-qty-plus="digital">+</button>
              </div>
            </div>
            <div class="mp-actions">
              <button class="btn btn-outline" data-add-cart="digital">Agregar al carrito</button>
              <button class="btn btn-primary" data-buy-now="digital">Comprar ahora</button>
            </div>
          </div>
        </div>
      </div>`;

      // Panel Físico (versión impresa del diseño)
      const panelFisico = `
      <div class="mtab-panel" data-panel="fisico">
        <div class="mp-grid">
          <div class="carousel" style="aspect-ratio:1/1;position:relative;">
            <img src="${imagenes[0] || 'https://placehold.co/400x400/222/FF6600?text=IMPRESION'}" alt="${nombre} Impreso" style="width:100%;height:100%;object-fit:cover;">
          </div>
          <div>
            <div class="mp-cat">${getTexto(p, 'categoria') || 'Digital'} · Impresión</div>
            <h3 class="mp-title">${nombre} — Impreso</h3>
            <div class="mp-rating"><span class="stars">${'★'.repeat(Math.round(stars))}${'☆'.repeat(5-Math.round(stars))}</span> ${stars} · ${reviews} opiniones</div>
            <div class="mp-price-row"><span class="mp-price">${money(precio * 2.5)}</span></div>
            <div class="mp-tax">Incluye impresión en DTF o sublimación</div>
            <p style="margin-top:18px;font-size:14px;line-height:1.7;color:rgba(245,243,238,.75);">Versión impresa del diseño ${nombre}. Disponible en DTF, sublimación y serigrafía.</p>
            <div class="opt-block">
              <div class="opt-label"><span>Técnica de impresión</span></div>
              <div class="format-grid" style="grid-template-columns:repeat(3,1fr);">
                <button class="format-chip selected">DTF</button>
                <button class="format-chip">Sublimación</button>
                <button class="format-chip">Serigrafía</button>
              </div>
            </div>
            <div class="stock-row" style="color:var(--green);">
              ✅ <span>Fabricación 72h</span> — stock disponible
            </div>
            <div class="qty-row">
              <div class="qty-ctrl">
                <button data-qty-minus="fisico">–</button>
                <input type="text" readonly value="1" id="qtyInput-fisico">
                <button data-qty-plus="fisico">+</button>
              </div>
            </div>
            <div class="mp-actions">
              <button class="btn btn-outline" data-add-cart="fisico">Agregar al carrito</button>
              <button class="btn btn-primary" data-buy-now="fisico">Comprar ahora</button>
            </div>
          </div>
        </div>
      </div>`;

      mBody.innerHTML = panelDigital + panelFisico;

      // Eventos carrusel
      mBody.querySelectorAll('[data-car]').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.dataset.car;
          const track = document.getElementById('carouselTrack-' + id);
          const dots = document.getElementById('carouselDots-' + id).children;
          const total = dots.length;
          state.carouselIndex[id] = state.carouselIndex[id] || 0;
          state.carouselIndex[id] = this.classList.contains('prev') ?
            (state.carouselIndex[id] - 1 + total) % total :
            (state.carouselIndex[id] + 1) % total;
          track.style.transform = `translateX(-${state.carouselIndex[id] * 100}%)`;
          Array.from(dots).forEach((d, i) => d.classList.toggle('active', i === state.carouselIndex[id]));
        });
      });

      // Eventos cantidad
      mBody.querySelectorAll('[data-qty-minus], [data-qty-plus]').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.dataset.qtyMinus || this.dataset.qtyPlus;
          const input = document.getElementById('qtyInput-' + id);
          let val = parseInt(input.value) || 1;
          val = this.dataset.qtyMinus ? Math.max(1, val - 1) : val + 1;
          input.value = val;
        });
      });

      // Eventos formatos
      mBody.querySelectorAll('.format-chip').forEach(btn => {
        btn.addEventListener('click', function() {
          const parent = this.parentElement;
          if (parent.id === 'formatGrid') {
            parent.querySelectorAll('.format-chip').forEach(f => f.classList.remove('selected'));
            this.classList.add('selected');
          } else {
            parent.querySelectorAll('.format-chip').forEach(f => f.classList.remove('selected'));
            this.classList.add('selected');
          }
        });
      });

      // Eventos carrito / compra directa
      mBody.querySelectorAll('[data-add-cart], [data-buy-now]').forEach(btn => {
        btn.addEventListener('click', function() {
          const tipo = this.dataset.addCart || this.dataset.buyNow;

          // Compra directa digital con link de PayPal específico del producto
          // (definido en la hoja PRODUCTOS_WEB del Excel, columna link_pago_paypal).
          // IMPORTANTE: la URL de retorno ("volver a descarga.html?id=...") se configura
          // DENTRO del dashboard de PayPal al crear el Payment Link de ese producto —
          // PayPal no acepta un ?return= agregado por JavaScript. Ver MANUAL-DE-USO.md.
          // Si no hay link cargado, cae al comportamiento normal de carrito (compatibilidad).
          if (this.dataset.buyNow === 'digital' && currentProduct.link_pago_paypal) {
            toast('Redirigiendo a PayPal...');
            window.location.href = currentProduct.link_pago_paypal;
            return;
          }

          const qty = parseInt(document.getElementById('qtyInput-' + tipo).value) || 1;
          const nombre = getTexto(currentProduct, 'nombre') || 'Diseño';
          const precio = parseFloat(currentProduct.precio_cop) || 0;

          // Obtener formato seleccionado
          let formato = 'PNG';
          if (tipo === 'digital') {
            const selected = document.querySelector('#formatGrid .format-chip.selected');
            if (selected) formato = selected.textContent;
          } else {
            const selected = document.querySelector('[data-panel="fisico"] .format-chip.selected');
            if (selected) formato = selected.textContent;
          }

          const item = {
            id: currentProduct.id + '-' + tipo + '-' + formato,
            nombre: nombre + (tipo === 'digital' ? ' (Digital)' : ' (Impreso)') + ' - ' + formato,
            precio: tipo === 'digital' ? precio : precio * 2.5,
            cantidad: qty,
            imagen: getImagenes(currentProduct)[0] || '',
            tipo: tipo,
            formato: formato
          };
          const existente = state.carrito.find(i => i.id === item.id);
          if (existente) existente.cantidad += qty;
          else state.carrito.push(item);
          localStorage.setItem('nemura-carrito', JSON.stringify(state.carrito));
          renderCarrito();
          sfx.addCart();
          toast('✅ ' + item.nombre + ' agregado al carrito');
          if (this.dataset.buyNow) { cerrarModal();
            abrirCarrito(); }
        });
      });
    }

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
            <div class="meta">${item.tipo === 'digital' ? 'Digital' : 'Impreso'} · Formato ${item.formato || 'PNG'} · Cant. ${item.cantidad}</div>
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
    document.getElementById('searchBtn').addEventListener('click', () => {
      const term = prompt('🔍 ¿Qué buscas?');
      if (term && term.trim()) {
        const filtrados = state.productos.filter(p =>
          (getTexto(p, 'nombre') || '').toLowerCase().includes(term.toLowerCase()) ||
          (getTexto(p, 'categoria') || '').toLowerCase().includes(term.toLowerCase())
        );
        if (filtrados.length > 0) {
          renderProductos(filtrados.slice(0, state.visibleCount));
          toast(`🔍 ${filtrados.length} resultados encontrados`);
        } else {
          toast('🔍 No se encontraron diseños', 'error');
          sfx.error();
        }
      }
    });

    /* ============================================================
       FAVORITOS VER
       ============================================================ */
    document.getElementById('favBtn').addEventListener('click', () => {
      if (state.favoritos.length === 0) { toast('❤️ No tienes favoritos aún'); return; }
      const favs = state.productos.filter(p => state.favoritos.includes(p.id));
      renderProductos(favs);
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
    cargarProductosDesdeExcel();
    NemuraCarousel.mount('#carruselNuevos', {
      sheetdbUrl: SHEETDB_URL + '?sheet=PRODUCTOS_WEB',
      tipo: 'digital',
      limite: 12,
      onOpen: abrirModal,
      enlaceBase: 'tienda-disenos.html'
    });

    console.log('💻 NEMURA — Tienda de Diseños Digitales');
    console.log('✅ Conectado a Excel vía SheetDB');
    console.log('✅ Modal premium con pestañas (Digital + Físico)');
    console.log('✅ Carrito y favoritos persistentes');
    console.log('✅ Sonidos futuristas');
    console.log('🚀 ¡Todo listo!');
