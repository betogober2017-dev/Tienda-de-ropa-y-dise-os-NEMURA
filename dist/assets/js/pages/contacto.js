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
    };

    /* ============================================================
       UTILIDADES
       ============================================================ */
    

    

    /* ============================================================
       AUDIO — SONIDOS FUTURISTAS
       ============================================================ */
    let audioCtx;

    
    const sfx = {
      success: () => { playTone(660, 0.1, 'sine', 0.05);
        setTimeout(() => playTone(990, 0.14, 'sine', 0.05), 100); },
      error: () => playTone(160, 0.2, 'sawtooth', 0.05)
    };

    /* ============================================================
       ENVÍO DE FORMULARIO A EXCEL (SHEETDB)
       ============================================================ */
    document.getElementById('contactForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      // Obtener datos del formulario
      const nombre = document.getElementById('nombre').value.trim();
      const email = document.getElementById('email').value.trim();
      const telefono = document.getElementById('telefono').value.trim();
      const tema = document.getElementById('tema').value;
      const mensaje = document.getElementById('mensaje').value.trim();

      // Validaciones básicas
      if (!nombre || !email || !mensaje) {
        toast('⚠️ Por favor completa todos los campos obligatorios', 'error');
        sfx.error();
        return;
      }

      if (!email.includes('@') || !email.includes('.')) {
        toast('⚠️ Ingresa un correo electrónico válido', 'error');
        sfx.error();
        return;
      }

      // Preparar datos para SheetDB
      const data = {
        data: [{
          nombre: nombre,
          email: email,
          telefono: telefono || 'No especificado',
          tema: tema,
          mensaje: mensaje,
          fecha: new Date().toLocaleString('es-CO'),
          estado: 'Pendiente'
        }]
      };

      try {
        // Mostrar estado de carga
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        btn.disabled = true;

        // Enviar a SheetDB
        const response = await fetch(SHEETDB_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
          toast('✅ ¡Mensaje enviado con éxito! Te contactaremos pronto.');
          sfx.success();
          document.getElementById('contactForm').reset();
        } else {
          toast('❌ Error al enviar el mensaje. Intenta de nuevo.', 'error');
          sfx.error();
          console.error('Error SheetDB:', result);
        }

        btn.innerHTML = originalText;
        btn.disabled = false;

      } catch (error) {
        console.error('❌ Error al enviar:', error);
        toast('❌ Error de conexión. Intenta de nuevo más tarde.', 'error');
        sfx.error();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar mensaje';
        btn.disabled = false;
      }
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
      if (state.carrito.length === 0) { toast('Tu carrito está vacío', 'error'); return; }
      toast('✅ Redirigiendo a pago...', 'success');
      sfx.success();
      setTimeout(cerrarCarrito, 1500);
    });

    /* ============================================================
       FAVORITOS
    ============================================================ */
    document.getElementById('favBtn').addEventListener('click', () => {
      if (state.favoritos.length === 0) { toast('❤️ No tienes favoritos aún'); return; }
      toast(`❤️ ${state.favoritos.length} favoritos guardados`);
    });

    document.getElementById('favBadge').textContent = state.favoritos.length;

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

    console.log('📬 NEMURA — Página de Contacto');
    console.log('✅ Conectado a Excel vía SheetDB para recibir mensajes');
    console.log('✅ Carrito y favoritos persistentes');
    console.log('✅ Sonidos futuristas');
    console.log('🚀 ¡Todo listo!');
