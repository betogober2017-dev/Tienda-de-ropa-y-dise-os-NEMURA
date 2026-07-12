/* ============================================================
       CONFIGURACIÓN — CONEXIÓN A EXCEL VIA SHEETDB
       ============================================================ */
    const SHEETDB_URL = 'https://sheetdb.io/api/v1/nsfs9j9qrm77m';

    /* ============================================================
       ESTADO
       ============================================================ */
    let carrito = JSON.parse(localStorage.getItem('nemura-carrito') || '[]');
    let favoritos = JSON.parse(localStorage.getItem('nemura-favoritos') || '[]');

    /* ============================================================
       UTILIDADES
       ============================================================ */
    

    

    /* ============================================================
       AUDIO — SONIDOS FUTURISTAS
    ============================================================ */
    let audioCtx;

    
    const sfx = {
      addCart: () => { playTone(600, 0.08, 'square', 0.04);
        setTimeout(() => playTone(900, 0.09, 'square', 0.04), 80); },
      success: () => { playTone(660, 0.1, 'sine', 0.05);
        setTimeout(() => playTone(990, 0.14, 'sine', 0.05), 100); },
      error: () => playTone(160, 0.2, 'sawtooth', 0.05)
    };

    /* ============================================================
       RENDERIZAR CARRITO
    ============================================================ */
    function renderCarrito() {
      const container = document.getElementById('cartContent');

      if (carrito.length === 0) {
        container.innerHTML = `
          <div class="cart-empty-state">
            <div class="icon">🛒</div>
            <h2>Tu carrito está vacío</h2>
            <p>Parece que aún no has agregado productos. Explora nuestro catálogo y encuentra lo que necesitas.</p>
            <a href="tienda-ropa.html" class="btn btn-primary" style="width:auto;display:inline-flex;">Explorar productos</a>
          </div>
        `;
        document.getElementById('cartBadge').textContent = '0';
        return;
      }

      let html = `
        <div class="cart-grid">
          <div>
            <div style="margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
              <span style="font-family:var(--font-mono);font-size:13px;color:rgba(245,243,238,.5);">
                ${carrito.length} productos en tu carrito
              </span>
              <button class="btn btn-outline" style="width:auto;padding:8px 20px;font-size:11px;" id="clearCartBtn">
                <i class="fas fa-trash"></i> Vaciar carrito
              </button>
            </div>
            <div class="cart-items-list">
      `;

      carrito.forEach((item, index) => {
        html += `
          <div class="cart-item-card" data-index="${index}">
            <div class="item-img">
              <img src="${item.imagen || 'https://placehold.co/400x400/222/FF6600?text=NEMURA'}" alt="${item.nombre}">
            </div>
            <div class="item-info">
              <div class="item-name">${item.nombre}</div>
              <div class="item-meta">${item.tipo || 'Producto'} ${item.talla ? '· Talla ' + item.talla : ''} ${item.material ? '· ' + item.material : ''} ${item.capacidad ? '· ' + item.capacidad : ''} ${item.formato ? '· ' + item.formato : ''}</div>
              <div class="item-price">${money(item.precio)}</div>
            </div>
            <div class="item-actions">
              <div class="qty-ctrl">
                <button data-qty-minus="${index}">–</button>
                <input type="text" readonly value="${item.cantidad}" id="qtyInput-${index}">
                <button data-qty-plus="${index}">+</button>
              </div>
              <button class="remove-btn" data-remove="${index}" aria-label="Eliminar">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        `;
      });

      html += `
            </div>
          </div>
          <div>
            <div class="cart-summary">
              <h3>Resumen del pedido</h3>
      `;

      // Calcular subtotal
      const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
      const envio = subtotal > 150000 ? 0 : 12000;
      const total = subtotal + envio;

      html += `
              <div class="summary-row">
                <span class="label">Subtotal</span>
                <span class="value">${money(subtotal)}</span>
              </div>
              <div class="summary-row">
                <span class="label">Envío</span>
                <span class="value">${envio === 0 ? 'Gratis 🎉' : money(envio)}</span>
              </div>
              ${envio > 0 ? `<div style="font-size:11px;color:rgba(245,243,238,.4);margin-top:-6px;margin-bottom:8px;">¡Agrega ${money(150000 - subtotal)} más para envío gratis!</div>` : ''}
              <div class="summary-row total">
                <span>Total</span>
                <span>${money(total)}</span>
              </div>
              <button class="btn btn-primary" id="checkoutBtn">
                <i class="fas fa-lock"></i> Proceder al pago
              </button>
              <a href="tienda-ropa.html" class="btn btn-secondary" style="margin-top:8px;">
                <i class="fas fa-arrow-left"></i> Seguir comprando
              </a>
            </div>
          </div>
        </div>
      `;

      container.innerHTML = html;

      // Actualizar badge
      const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0);
      document.getElementById('cartBadge').textContent = totalItems;

      // Eventos de cantidad
      container.querySelectorAll('[data-qty-minus]').forEach(btn => {
        btn.addEventListener('click', function() {
          const idx = parseInt(this.dataset.qtyMinus);
          if (carrito[idx].cantidad > 1) {
            carrito[idx].cantidad--;
            guardarCarrito();
            renderCarrito();
            sfx.addCart();
          }
        });
      });

      container.querySelectorAll('[data-qty-plus]').forEach(btn => {
        btn.addEventListener('click', function() {
          const idx = parseInt(this.dataset.qtyPlus);
          carrito[idx].cantidad++;
          guardarCarrito();
          renderCarrito();
          sfx.addCart();
        });
      });

      // Eventos eliminar
      container.querySelectorAll('[data-remove]').forEach(btn => {
        btn.addEventListener('click', function() {
          const idx = parseInt(this.dataset.remove);
          const item = carrito[idx];
          carrito.splice(idx, 1);
          guardarCarrito();
          renderCarrito();
          toast(`🗑️ ${item.nombre} eliminado del carrito`);
          sfx.error();
        });
      });

      // Vaciar carrito
      document.getElementById('clearCartBtn')?.addEventListener('click', () => {
        if (carrito.length === 0) return;
        if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
          carrito = [];
          guardarCarrito();
          renderCarrito();
          toast('🗑️ Carrito vaciado');
          sfx.error();
        }
      });

      // Checkout
      document.getElementById('checkoutBtn')?.addEventListener('click', () => {
        if (carrito.length === 0) {
          toast('❌ Tu carrito está vacío', 'error');
          sfx.error();
          return;
        }
        toast('✅ Redirigiendo a la pasarela de pago...', 'success');
        sfx.success();
        // Aquí iría la integración con pasarela de pago
        setTimeout(() => {
          toast('🔗 Esta demo simula el pago. ¡Pronto tendremos integración real!');
        }, 1500);
      });
    }

    /* ============================================================
       GUARDAR CARRITO
    ============================================================ */
    function guardarCarrito() {
      localStorage.setItem('nemura-carrito', JSON.stringify(carrito));
      document.getElementById('cartBadge').textContent = carrito.reduce((acc, i) => acc + i.cantidad, 0);
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
       FAVORITOS BADGE
    ============================================================ */
    document.getElementById('favBadge').textContent = favoritos.length;

    document.getElementById('favBtn').addEventListener('click', () => {
      if (favoritos.length === 0) {
        toast('❤️ No tienes favoritos aún');
        return;
      }
      toast(`❤️ ${favoritos.length} favoritos guardados`);
    });

    /* ============================================================
       CART BTN (abrir carrito en drawer si existe)
    ============================================================ */
    document.getElementById('cartBtn').addEventListener('click', () => {
      // Ya estamos en la página del carrito, solo recargamos
      renderCarrito();
      toast('🛒 Actualizando carrito...');
    });

    /* ============================================================
       INICIO
    ============================================================ */
    document.getElementById('year').textContent = new Date().getFullYear();
    renderCarrito();

    console.log('🛒 NEMURA — Página de Carrito');
    console.log('✅ Carrito persistente en localStorage');
    console.log('✅ Favoritos persistentes');
    console.log('✅ Sonidos futuristas');
    console.log('🚀 ¡Todo listo!');
