/* ============================================================
       CONFIGURACIÓN — CONEXIÓN A EXCEL VIA SHEETDB
    ============================================================ */
    const SHEETDB_URL = 'https://sheetdb.io/api/v1/nsfs9j9qrm77m';

    /* ============================================================
       ESTADO
    ============================================================ */
    const state = {
      carrito: JSON.parse(localStorage.getItem('nemura-carrito') || '[]'),
      favoritos: JSON.parse(localStorage.getItem('nemura-favoritos') || '[]'),
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
       FAVORITOS
    ============================================================ */
    document.getElementById('favBadge').textContent = state.favoritos.length;

    document.getElementById('favBtn').addEventListener('click', () => {
      if (state.favoritos.length === 0) {
        toast('❤️ No tienes favoritos aún');
        return;
      }
      toast(`❤️ ${state.favoritos.length} favoritos guardados`);
    });

    /* ============================================================
       MODAL PREMIUM — CON PESTAÑAS (LIRAS)
    ============================================================ */
    const modalOverlay = document.getElementById('productModal');
    const mBody = document.getElementById('mBody');
    const tabFisicoBtn = document.getElementById('tabFisicoBtn');
    const tabDigitalBtn = document.getElementById('tabDigitalBtn');
    let currentProduct = null;

    function abrirModal(producto) {
      if (!producto) return;
      currentProduct = producto;

      const nombre = getTexto(producto, 'nombre') || 'Producto';
      const categoria = getTexto(producto, 'categoria') || 'General';

      document.getElementById('mTitleLabel').textContent = nombre;
      document.getElementById('mTypeLabel').textContent = categoria;

      tabFisicoBtn.classList.remove('active-fisico', 'active-digital');
      tabDigitalBtn.classList.remove('active-fisico', 'active-digital');

      const esDigital = producto.tipo === 'digital';
      if (esDigital) {
        tabDigitalBtn.classList.add('active-digital');
        tabFisicoBtn.style.display = 'none';
        tabDigitalBtn.style.display = 'block';
      } else {
        tabFisicoBtn.classList.add('active-fisico');
        tabFisicoBtn.style.display = 'block';
        tabDigitalBtn.style.display = 'block';
      }

      renderModalPanels(producto, esDigital);
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
       RENDER MODAL PANELS
    ============================================================ */
    function renderModalPanels(p, esDigital) {
      const imagenes = getImagenes(p);
      const precio = parseFloat(p.precio_cop) || 0;
      const stars = parseFloat(p.estrellas) || 0;
      const reviews = parseInt(p.reseñas) || 0;
      const nombre = getTexto(p, 'nombre') || 'Producto';
      const descripcion = getTexto(p, 'descripcion') || 'Diseño exclusivo de NEMURA.';

      const panelFisico = `
      <div class="mtab-panel ${!esDigital ? 'active' : ''}" data-panel="fisico">
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
            <div class="mp-cat">${getTexto(p, 'categoria') || 'General'}</div>
            <h3 class="mp-title">${nombre}</h3>
            <div class="mp-rating"><span class="stars">${'★'.repeat(Math.round(stars))}${'☆'.repeat(5-Math.round(stars))}</span> ${stars} · ${reviews} opiniones</div>
            <div class="mp-price-row"><span class="mp-price">${money(precio)}</span></div>
            <div class="mp-tax">IVA incluido</div>
            <p style="margin-top:18px;font-size:14px;line-height:1.7;color:rgba(245,243,238,.75);">${descripcion}</p>
            <div class="opt-block">
              <div class="opt-label"><span>Tallas</span></div>
              <div class="size-row" style="display:flex;gap:8px;flex-wrap:wrap;">
                ${(p.tallas || 'S,M,L,XL').split(',').map(t => `<button class="size-btn" style="min-width:44px;height:40px;padding:0 10px;border:1px solid var(--line-strong);border-radius:6px;font-size:12px;font-weight:700;transition:all .2s var(--ease);">${t.trim()}</button>`).join('')}
              </div>
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

      const panelDigital = `
      <div class="mtab-panel ${esDigital ? 'active' : ''}" data-panel="digital">
        <div class="mp-grid">
          <div>
            <div class="carousel" style="aspect-ratio:1/1;position:relative;">
              <div class="watermark-badge" style="position:absolute;top:12px;left:12px;background:rgba(10,10,10,.7);backdrop-filter:blur(6px);padding:5px 10px;font-family:var(--font-mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;border:1px solid var(--line-strong);border-radius:3px;z-index:2;color:var(--blue);">Vista previa — marca de agua</div>
              <img src="${imagenes[0] || 'https://placehold.co/400x400/222/7B2FFC?text=VECTOR'}" alt="${nombre} Digital" style="width:100%;height:100%;object-fit:cover;filter:brightness(.9);">
            </div>
          </div>
          <div>
            <div class="mp-cat">${getTexto(p, 'categoria') || 'General'} · Digital</div>
            <h3 class="mp-title">${nombre} — Vector</h3>
            <div class="mp-rating"><span class="stars">${'★'.repeat(Math.round(stars))}${'☆'.repeat(5-Math.round(stars))}</span> ${stars} · ${reviews} opiniones</div>
            <div class="mp-price-row"><span class="mp-price">${money(precio * 0.5)}</span></div>
            <div class="mp-tax">Descarga digital — sin impuestos</div>
            <p style="margin-top:18px;font-size:14px;line-height:1.7;color:rgba(245,243,238,.75);">Versión digital del diseño ${nombre}. Archivo listo para producción.</p>
            <div class="opt-block">
              <div class="opt-label"><span>Formatos incluidos</span></div>
              <div class="format-grid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:8px;">
                ${(p.formato || 'PNG, SVG, AI, PSD').split(',').map(f => `<div class="format-chip" style="border:1px solid var(--line-strong);border-radius:6px;padding:10px 4px;text-align:center;font-family:var(--font-mono);font-size:11px;font-weight:700;transition:all .2s;">${f.trim()}</div>`).join('')}
              </div>
            </div>
            <div class="stock-row" style="display:flex;align-items:center;gap:8px;margin-top:16px;font-size:13px;color:var(--green);">
              ✅ <span>Descarga inmediata</span> — ∞ disponible
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

      // Eventos tallas
      mBody.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          this.parentElement.querySelectorAll('.size-btn').forEach(s => s.classList.remove('selected'));
          this.classList.add('selected');
        });
      });

      // Eventos carrito
      mBody.querySelectorAll('[data-add-cart], [data-buy-now]').forEach(btn => {
        btn.addEventListener('click', function() {
          const tipo = this.dataset.addCart || this.dataset.buyNow;
          const qty = parseInt(document.getElementById('qtyInput-' + tipo).value) || 1;
          const nombre = getTexto(currentProduct, 'nombre') || 'Producto';
          const precio = parseFloat(currentProduct.precio_cop) || 0;
          const tallaSeleccionada = document.querySelector('[data-panel="fisico"] .size-btn.selected');
          const talla = tallaSeleccionada ? tallaSeleccionada.textContent : 'M';

          const item = {
            id: currentProduct.id + '-' + tipo + '-' + talla,
            nombre: nombre + (tipo === 'digital' ? ' (Digital)' : '') + ' - ' + talla,
            precio: tipo === 'digital' ? precio * 0.5 : precio,
            cantidad: qty,
            imagen: getImagenes(currentProduct)[0] || '',
            tipo: tipo,
            talla: talla
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
       SCROLL A OFERTA
    ============================================================ */
    document.querySelector('.footer-cta-strip .btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector('.caja-oferta').scrollIntoView({ behavior: 'smooth' });
    });

    /* ============================================================
       INICIO
    ============================================================ */
    document.getElementById('year').textContent = new Date().getFullYear();
    document.getElementById('favBadge').textContent = state.favoritos.length;
    renderCarrito();

    console.log('⚡ NEMURA — Sistema de Automatización FX');
    console.log('✅ Modal premium con pestañas (Físico + Digital)');
    console.log('✅ Carrito y favoritos persistentes');
    console.log('✅ Sonidos futuristas');
    console.log('✅ Conectado a Excel vía SheetDB');
    console.log('🚀 ¡Todo listo para automatizar!');
