/* ============================================================
       ESTADO
    ============================================================ */
    let carrito = JSON.parse(localStorage.getItem('nemura-carrito') || '[]');
    let favoritos = JSON.parse(localStorage.getItem('nemura-favoritos') || '[]');

    /* ============================================================
       UTILIDADES
    ============================================================ */
    

    

    /* ============================================================
       CARRITO
    ============================================================ */
    function renderCarrito() {
      const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0);
      document.getElementById('cartBadge').textContent = totalItems;

      const itemsContainer = document.getElementById('cartItems');
      const subtotalEl = document.getElementById('cartSubtotal');

      if (carrito.length === 0) {
        itemsContainer.innerHTML =
          `<div class="cart-empty">Tu carrito está vacío.<br>Explora el catálogo para empezar.</div>`;
        subtotalEl.textContent = money(0);
        return;
      }

      itemsContainer.innerHTML = carrito.map((item, idx) => `
        <div class="cart-item">
          <img src="${item.imagen || 'https://placehold.co/400x400/222/FF6600?text=NEMURA'}" alt="${item.nombre}">
          <div class="cart-item-info">
            <b>${item.nombre}</b>
            <div class="meta">${item.tipo || 'Producto'} · Cant. ${item.cantidad}</div>
            <div class="cart-item-price">${money(item.precio * item.cantidad)}</div>
            <a class="cart-item-remove" data-remove="${idx}">Eliminar</a>
          </div>
        </div>
      `).join('');

      const subtotal = carrito.reduce((a, i) => a + i.precio * i.cantidad, 0);
      subtotalEl.textContent = money(subtotal);

      itemsContainer.querySelectorAll('[data-remove]').forEach(btn => {
        btn.addEventListener('click', function() {
          const idx = parseInt(this.dataset.remove);
          carrito.splice(idx, 1);
          localStorage.setItem('nemura-carrito', JSON.stringify(carrito));
          renderCarrito();
          toast('🗑️ Producto eliminado');
        });
      });
    }

    /* ============================================================
       CART DRAWER
    ============================================================ */
    const cartOverlay = document.getElementById('cartOverlay');
    const cartDrawer = document.getElementById('cartDrawer');

    

    

    document.getElementById('cartBtn').addEventListener('click', abrirCarrito);
    document.getElementById('cartCloseBtn').addEventListener('click', cerrarCarrito);
    cartOverlay.addEventListener('click', cerrarCarrito);

    document.getElementById('cartCheckoutBtn').addEventListener('click', () => {
      if (carrito.length === 0) { toast('Tu carrito está vacío', 'error'); return; }
      toast('✅ Redirigiendo a pago...', 'success');
      setTimeout(cerrarCarrito, 1500);
    });

    /* ============================================================
       FAVORITOS
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
       BÚSQUEDA
    ============================================================ */
    document.getElementById('searchBtn').addEventListener('click', () => {
      const term = prompt('🔍 ¿Qué buscas?');
      if (term && term.trim()) {
        toast(`🔍 Buscando: "${term}"`);
      }
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
    renderCarrito();

    console.log('📏 NEMURA — Guía de Tallas');
    console.log('✅ Página informativa completa');
    console.log('✅ Carrito y favoritos persistentes');
    console.log('🚀 ¡Todo listo!');
