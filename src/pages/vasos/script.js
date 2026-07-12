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
      selectedMaterial: {},
      selectedCapacity: {},
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
      return imgs.length ? imgs : ['https://placehold.co/400x400/222/FF6600?text=VASO'];
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
       OBTENER PRODUCTOS DESDE EXCEL (SOLO VASOS)
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

        // Filtrar SOLO productos de vasos (categoría que contenga "vaso" o "vasos")
        state.productos = data.filter(p =>
          ((p.categoria_es && p.categoria_es.toLowerCase().includes('vaso')) ||
          (p.tipo && p.tipo.toLowerCase().includes('vaso')) ||
          (p.nombre_es && p.nombre_es.toLowerCase().includes('vaso'))) &&
          p.activo !== 'False'
        );
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
       PRODUCTOS DE RESPALDO (VASOS)
       ============================================================ */
    function getProductosRespaldo() {
      return [
        { id: "v1", nombre_es: "Vaso Térmico Neon", categoria_es: "Térmicos", tipo: "vaso", precio_cop: "35000",
          imagen1: "https://placehold.co/400x400/111/FF6600?text=Termico", estrellas: "4.8", reseñas: "156",
          material: "Acero", capacidad: "500ml" },
        { id: "v2", nombre_es: "Vaso Vidrio Anime", categoria_es: "Vidrio", tipo: "vaso", precio_cop: "28000",
          imagen1: "https://placehold.co/400x400/111/FF6600?text=Vidrio", estrellas: "4.6", reseñas: "89",
          material: "Vidrio", capacidad: "400ml" },
        { id: "v3", nombre_es: "Vaso Cerámica Premium", categoria_es: "Cerámica", tipo: "vaso", precio_cop: "32000",
          imagen1: "https://placehold.co/400x400/111/FF6600?text=Ceramica", estrellas: "4.7", reseñas: "112",
          material: "Cerámica", capacidad: "350ml" },
        { id: "v4", nombre_es: "Vaso Térmico Cyberpunk", categoria_es: "Térmicos", tipo: "vaso", precio_cop: "38000",
          imagen1: "https://placehold.co/400x400/111/FF6600?text=Cyber", estrellas: "4.9", reseñas: "203",
          material: "Acero", capacidad: "600ml" },
        { id: "v5", nombre_es: "Vaso Vidrio Vintage", categoria_es: "Vidrio", tipo: "vaso", precio_cop: "25000",
          imagen1: "https://placehold.co/400x400/111/FF6600?text=Vintage", estrellas: "4.4", reseñas: "67",
          material: "Vidrio", capacidad: "300ml" },
        { id: "v6", nombre_es: "Vaso Cerámica Minimal", categoria_es: "Cerámica", tipo: "vaso", precio_cop: "29000",
          imagen1: "https://placehold.co/400x400/111/FF6600?text=Minimal", estrellas: "4.5", reseñas: "78",
          material: "Cerámica", capacidad: "400ml" },
        { id: "v7", nombre_es: "Vaso Térmico Camuflaje", categoria_es: "Térmicos", tipo: "vaso", precio_cop: "42000",
          imagen1: "https://placehold.co/400x400/111/FF6600?text=Camuflaje", estrellas: "4.7", reseñas: "134",
          material: "Acero", capacidad: "750ml" },
        { id: "v8", nombre_es: "Vaso Vidrio Cristal", categoria_es: "Vidrio", tipo: "vaso", precio_cop: "22000",
          imagen1: "https://placehold.co/400x400/111/FF6600?text=Cristal", estrellas: "4.3", reseñas: "45",
          material: "Vidrio", capacidad: "250ml" }
      ];
    }

    /* ============================================================
       RENDERIZAR PRODUCTOS
       ============================================================ */
    function renderProductos(lista) {
      const grid = document.getElementById('productGrid');
      if (!lista || lista.length === 0) {
        grid.innerHTML =
          `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#888;"><h3>No hay vasos disponibles</h3><p style="opacity:0.3;">Pronto tendremos más modelos</p></div>`;
        return;
      }

      grid.innerHTML = lista.map((p, i) => {
        const nombre = getTexto(p, 'nombre') || 'Vaso';
        const categoria = getTexto(p, 'categoria') || 'General';
        const precio = parseFloat(p.precio_cop) || 0;
        const img = p.imagen1 || 'https://placehold.co/400x400/222/FF6600?text=VASO';
        const esFav = state.favoritos.includes(p.id);
        const stars = parseFloat(p.estrellas) || 0;
        const reviews = parseInt(p.reseñas) || 0;
        const material = p.material || 'Acero';
        const capacidad = p.capacidad || '400ml';

        return `
        <div class="card" data-id="${p.id}" style="animation-delay:${i * 0.05}s;">
          <div class="card-media">
            <img src="${img}" alt="${nombre}" loading="lazy" onerror="this.src='https://placehold.co/400x400/222/FF6600?text=VASO'">
            <div class="card-badges">
              <span class="badge-tag vaso">🧋 Vaso</span>
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
            <div class="card-material">
              <span>${material}</span>
              <span>${capacidad}</span>
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
       FILTROS (Adaptados a vasos)
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
      if (state.filter === 'termico') lista = lista.filter(p => (p.categoria_es || '').toLowerCase().includes('termico'));
      else if (state.filter === 'vidrio') lista = lista.filter(p => (p.categoria_es || '').toLowerCase().includes('vidrio'));
      else if (state.filter === 'ceramica') lista = lista.filter(p => (p.categoria_es || '').toLowerCase().includes(
        'ceramica'));
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
    const tabFisicoBtn = document.getElementById('tabFisicoBtn');
    const tabDigitalBtn = document.getElementById('tabDigitalBtn');
    let currentProduct = null;

    function abrirModal(producto) {
      if (!producto) return;
      currentProduct = producto;

      const nombre = getTexto(producto, 'nombre') || 'Vaso';
      const categoria = getTexto(producto, 'categoria') || 'Vaso';

      document.getElementById('mTitleLabel').textContent = nombre;
      document.getElementById('mTypeLabel').textContent = categoria;

      // Resetear pestañas
      tabFisicoBtn.classList.remove('active-fisico', 'active-digital');
      tabDigitalBtn.classList.remove('active-fisico', 'active-digital');

      // Activar pestaña física por defecto
      tabFisicoBtn.classList.add('active-fisico');
      tabFisicoBtn.style.display = 'block';
      tabDigitalBtn.style.display = 'block';

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
    tabFisicoBtn.addEventListener('click', function() {
      if (!currentProduct) return;
      tabFisicoBtn.classList.add('active-fisico');
      tabDigitalBtn.classList.remove('active-digital');
      mBody.querySelectorAll('.mtab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === 'fisico'));
      sfx.tab();
    });

    tabDigitalBtn.addEventListener('click', function() {
      if (!currentProduct) return;
      tabDigitalBtn.classList.add('active-digital');
      tabFisicoBtn.classList.remove('active-fisico');
      mBody.querySelectorAll('.mtab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === 'digital'));
      sfx.tab();
    });

    /* ============================================================
       RENDER MODAL PANELS (FÍSICO + DIGITAL)
       ============================================================ */
    function renderModalPanels(p) {
      const imagenes = getImagenes(p);
      const precio = parseFloat(p.precio_cop) || 0;
      const stars = parseFloat(p.estrellas) || 0;
      const reviews = parseInt(p.reseñas) || 0;
      const nombre = getTexto(p, 'nombre') || 'Vaso';
      const descripcion = getTexto(p, 'descripcion') || 'Vaso personalizado de alta calidad.';

      // Panel Físico
      const panelFisico = `
      <div class="mtab-panel active" data-panel="fisico">
        <div class="mp-grid">
          <div class="carousel" id="carousel-fisico">
            <div class="carousel-track" id="carouselTrack-fisico">
              ${imagenes.map(src => `<img src="${src}" alt="${nombre}">`).join('')}
            </div>
            ${imagenes.length > 1 ? `
            <button class="carousel-arrow prev" data-car="fisico"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button>
            <button class="carousel-arrow next" data-car="fisico"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></button>
            <div class="carousel-dots" id="carouselDots-fisico">${imagenes.map((_,i) => `<span class="${i===0?'active':''}"></span>`).join('')}</div>` : ''}
          </div>
          <div>
            <div class="mp-cat">${getTexto(p, 'categoria') || 'Vaso'}</div>
            <h3 class="mp-title">${nombre}</h3>
            <div class="mp-rating"><span class="stars">${'★'.repeat(Math.round(stars))}${'☆'.repeat(5-Math.round(stars))}</span> ${stars} · ${reviews} opiniones</div>
            <div class="mp-price-row"><span class="mp-price">${money(precio)}</span></div>
            <div class="mp-tax">IVA incluido</div>
            <p style="margin-top:18px;font-size:14px;line-height:1.7;color:rgba(245,243,238,.75);">${descripcion}</p>
            <div class="opt-block">
              <div class="opt-label"><span>Material</span></div>
              <div class="material-grid" id="materialGrid">
                ${(p.material || 'Acero, Vidrio, Cerámica').split(',').map(m => `<button class="material-chip">${m.trim()}</button>`).join('')}
              </div>
            </div>
            <div class="opt-block">
              <div class="opt-label"><span>Capacidad</span></div>
              <div class="capacity-grid" id="capacityGrid">
                ${(p.capacidad || '250ml, 400ml, 500ml, 750ml').split(',').map(c => `<button class="capacity-chip">${c.trim()}</button>`).join('')}
              </div>
            </div>
            <div class="stock-row">
              ✅ <span>Fabricación 48h</span> — stock disponible
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

      // Panel Digital (diseño del vaso)
      const panelDigital = `
      <div class="mtab-panel" data-panel="digital">
        <div class="mp-grid">
          <div>
            <div class="carousel" style="aspect-ratio:1/1;position:relative;">
              <div class="watermark-badge" style="position:absolute;top:12px;left:12px;background:rgba(10,10,10,.7);backdrop-filter:blur(6px);padding:5px 10px;font-family:var(--font-mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;border:1px solid var(--line-strong);border-radius:3px;z-index:2;color:var(--orange);">Diseño digital</div>
              <img src="${imagenes[0] || 'https://placehold.co/400x400/222/FF6600?text=DISEÑO'}" alt="${nombre} Digital" style="width:100%;height:100%;object-fit:cover;filter:brightness(.9);">
            </div>
          </div>
          <div>
            <div class="mp-cat">${getTexto(p, 'categoria') || 'Vaso'} · Diseño</div>
            <h3 class="mp-title">${nombre} — Digital</h3>
            <div class="mp-rating"><span class="stars">${'★'.repeat(Math.round(stars))}${'☆'.repeat(5-Math.round(stars))}</span> ${stars} · ${reviews} opiniones</div>
            <div class="mp-price-row"><span class="mp-price">${money(precio * 0.4)}</span></div>
            <div class="mp-tax">Archivo digital — listo para sublimación</div>
            <p style="margin-top:18px;font-size:14px;line-height:1.7;color:rgba(245,243,238,.75);">Diseño digital para estampar en vasos. Incluye archivos en alta resolución para sublimación.</p>
            <div class="opt-block">
              <div class="opt-label"><span>Formatos incluidos</span></div>
              <div class="material-grid" style="grid-template-columns:repeat(4,1fr);">
                <button class="material-chip selected">PNG</button>
                <button class="material-chip">SVG</button>
                <button class="material-chip">PSD</button>
                <button class="material-chip">AI</button>
              </div>
            </div>
            <div class="stock-row" style="color:var(--green);">
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

      mBody.innerHTML = panelFisico + panelDigital;

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

      // Eventos material
      mBody.querySelectorAll('.material-chip').forEach(btn => {
        btn.addEventListener('click', function() {
          const parent = this.parentElement;
          parent.querySelectorAll('.material-chip').forEach(f => f.classList.remove('selected'));
          this.classList.add('selected');
        });
      });

      // Eventos capacidad
      mBody.querySelectorAll('.capacity-chip').forEach(btn => {
        btn.addEventListener('click', function() {
          const parent = this.parentElement;
          parent.querySelectorAll('.capacity-chip').forEach(f => f.classList.remove('selected'));
          this.classList.add('selected');
        });
      });

      // Eventos carrito
      mBody.querySelectorAll('[data-add-cart], [data-buy-now]').forEach(btn => {
        btn.addEventListener('click', function() {
          const tipo = this.dataset.addCart || this.dataset.buyNow;
          const qty = parseInt(document.getElementById('qtyInput-' + tipo).value) || 1;
          const nombre = getTexto(currentProduct, 'nombre') || 'Vaso';
          const precio = parseFloat(currentProduct.precio_cop) || 0;

          // Obtener material y capacidad seleccionados
          let material = 'Acero';
          let capacidad = '400ml';
          if (tipo === 'fisico') {
            const matSelected = document.querySelector('#materialGrid .material-chip.selected');
            if (matSelected) material = matSelected.textContent;
            const capSelected = document.querySelector('#capacityGrid .capacity-chip.selected');
            if (capSelected) capacidad = capSelected.textContent;
          }

          const item = {
            id: currentProduct.id + '-' + tipo + '-' + material + '-' + capacidad,
            nombre: nombre + (tipo === 'digital' ? ' (Diseño)' : '') + ' - ' + material + ' ' + capacidad,
            precio: tipo === 'digital' ? precio * 0.4 : precio,
            cantidad: qty,
            imagen: getImagenes(currentProduct)[0] || '',
            tipo: tipo,
            material: material,
            capacidad: capacidad
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
            <div class="meta">${item.tipo === 'digital' ? 'Diseño' : 'Vaso'} · ${item.material || 'Acero'} · ${item.capacidad || '400ml'} · Cant. ${item.cantidad}</div>
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
          toast('🔍 No se encontraron vasos', 'error');
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
      tipo: 'vaso',
      limite: 12,
      onOpen: abrirModal,
      enlaceBase: 'vasos.html'
    });

    console.log('🧋 NEMURA — Tienda de Vasos Personalizados');
    console.log('✅ Conectado a Excel vía SheetDB');
    console.log('✅ Modal premium con pestañas (Físico + Digital)');
    console.log('✅ Carrito y favoritos persistentes');
    console.log('✅ Sonidos futuristas');
    console.log('🚀 ¡Todo listo!');
