/* ============================================================
       PRODUCTOS DE RESPALDO (DISEÑOS CON LICENCIA)
    ============================================================ */
    const PRODUCTOS_RESPALDO = [
      { 
        id: "d1", 
        nombre_es: "Pack Vectores DBZ", 
        categoria_es: "Vectores", 
        tipo: "digital", 
        precio_cop: "25000", 
        imagen1: "https://placehold.co/400x400/111/2E6BFF?text=DBZ", 
        estrellas: "4.7", 
        reseñas: "203",
        formato: "PNG, SVG, AI, PSD, EPS",
        licencia: "Comercial",
        exclusivo: true,
        descripcion_es: "Pack completo de vectores de Dragon Ball Z. Incluye personajes principales en alta resolución."
      },
      { 
        id: "d2", 
        nombre_es: "Mockup PSD Premium", 
        categoria_es: "Mockups", 
        tipo: "digital", 
        precio_cop: "15000", 
        imagen1: "https://placehold.co/400x400/111/2E6BFF?text=Mockup", 
        estrellas: "4.6", 
        reseñas: "134",
        formato: "PSD, PNG, JPG",
        licencia: "Comercial",
        exclusivo: false,
        descripcion_es: "Mockup profesional en PSD para camisas y productos. Capas organizadas."
      },
      { 
        id: "d3", 
        nombre_es: "Vectores Neon Cyberpunk", 
        categoria_es: "Vectores", 
        tipo: "digital", 
        precio_cop: "32000", 
        imagen1: "https://placehold.co/400x400/111/2E6BFF?text=Neon", 
        estrellas: "4.9", 
        reseñas: "156",
        formato: "SVG, AI, EPS, PNG",
        licencia: "Extendida",
        exclusivo: true,
        descripcion_es: "Colección de vectores estilo cyberpunk y neon. Perfecto para diseño urbano."
      },
      { 
        id: "d4", 
        nombre_es: "Mockup Hoodie 3D", 
        categoria_es: "Mockups", 
        tipo: "digital", 
        precio_cop: "18000", 
        imagen1: "https://placehold.co/400x400/111/2E6BFF?text=Hoodie", 
        estrellas: "4.5", 
        reseñas: "78",
        formato: "PSD, PNG, JPG",
        licencia: "Comercial",
        exclusivo: false,
        descripcion_es: "Mockup 3D de hoodie con vistas frontal y trasera. Fácil de editar."
      },
      { 
        id: "d5", 
        nombre_es: "Vectores Anime Premium", 
        categoria_es: "Vectores", 
        tipo: "digital", 
        precio_cop: "28000", 
        imagen1: "https://placehold.co/400x400/111/2E6BFF?text=Anime", 
        estrellas: "4.8", 
        reseñas: "312",
        formato: "SVG, AI, PNG, EPS",
        licencia: "Comercial",
        exclusivo: true,
        descripcion_es: "Vectores premium de personajes de anime. Ideal para camisas y productos."
      }
    ];

    /* ============================================================
       ESTADO
    ============================================================ */
    let productos = PRODUCTOS_RESPALDO;
    let carrito = JSON.parse(localStorage.getItem('nemura-carrito') || '[]');
    let favoritos = JSON.parse(localStorage.getItem('nemura-favoritos') || '[]');
    let filter = 'all';
    let visibleCount = 8;

    /* ============================================================
       UTILIDADES
    ============================================================ */
    

    function getTexto(producto, campo) {
      return producto[campo + '_es'] || producto[campo] || '';
    }

    function getImagenes(producto) {
      const imgs = [];
      for (let i = 1; i <= 5; i++) {
        if (producto['imagen' + i]) imgs.push(producto['imagen' + i]);
      }
      return imgs.length ? imgs : ['https://placehold.co/400x400/222/FF6600?text=NEMURA'];
    }

    

    /* ============================================================
       AUDIO
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
       RENDERIZAR PRODUCTOS
    ============================================================ */
    function renderProductos(lista) {
      const grid = document.getElementById('productGrid');
      if (!lista || lista.length === 0) {
        grid.innerHTML =
          `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#888;"><h3>No hay diseños disponibles</h3><p style="opacity:0.3;">Pronto tendremos más diseños</p></div>`;
        return;
      }

      grid.innerHTML = lista.map((p, i) => {
        const nombre = getTexto(p, 'nombre') || 'Diseño';
        const categoria = getTexto(p, 'categoria') || 'General';
        const precio = parseFloat(p.precio_cop) || 0;
        const img = p.imagen1 || 'https://placehold.co/400x400/222/FF6600?text=NEMURA';
        const esFav = favoritos.includes(p.id);
        const stars = parseFloat(p.estrellas) || 0;
        const reviews = parseInt(p.reseñas) || 0;
        const formatos = (p.formato || 'PNG, SVG').split(',').slice(0, 3);
        const licencia = p.licencia || 'Personal';

        return `
        <div class="card" data-id="${p.id}" style="animation-delay:${i * 0.05}s;">
          <div class="card-media">
            <img src="${img}" alt="${nombre}" loading="lazy" onerror="this.src='https://placehold.co/400x400/222/FF6600?text=NEMURA'">
            <div class="watermark-overlay">
              <span class="watermark-text">© NEMURA</span>
            </div>
            <div class="card-badges">
              <span class="badge-tag digital">💻 Digital</span>
              ${p.exclusivo ? '<span class="badge-tag exclusivo">⭐ Exclusivo</span>' : ''}
              ${p.destacado === 'True' || p.destacado === true ? '<span class="badge-tag oferta">🔥 Destacado</span>' : ''}
              ${licencia === 'Extendida' ? '<span class="badge-tag licencia">📜 Licencia Extendida</span>' : ''}
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
            <div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap;">
              ${formatos.map(f => `<span style="font-family:var(--font-mono);font-size:8px;padding:2px 6px;border:1px solid var(--line);border-radius:3px;color:rgba(245,243,238,.4);text-transform:uppercase;">${f.trim()}</span>`).join('')}
            </div>
            <div style="margin-top:6px;font-family:var(--font-mono);font-size:9px;color:var(--purple);">📜 ${licencia}</div>
          </div>
        </div>
        `;
      }).join('');

      grid.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.card-fav')) return;
          const id = card.dataset.id;
          const producto = productos.find(p => p.id === id);
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
      const idx = favoritos.indexOf(id);
      if (idx > -1) { favoritos.splice(idx, 1);
        toast('💔 Eliminado de favoritos'); } else { favoritos.push(id);
        toast('❤️ Agregado a favoritos');
        sfx.fav(); }
      localStorage.setItem('nemura-favoritos', JSON.stringify(favoritos));
      document.getElementById('favBadge').textContent = favoritos.length;
      renderProductos(productos.slice(0, visibleCount));
    }

    /* ============================================================
       FILTROS
    ============================================================ */
    document.getElementById('filterBar').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      document.querySelectorAll('#filterBar .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filter = chip.dataset.filter;
      visibleCount = 8;
      aplicarFiltros();
    });

    function aplicarFiltros() {
      let lista = [...productos];
      if (filter === 'vectores') lista = lista.filter(p => (p.categoria_es || '').toLowerCase().includes('vector'));
      else if (filter === 'mockups') lista = lista.filter(p => (p.categoria_es || '').toLowerCase().includes('mockup'));
      else if (filter === 'exclusivo') lista = lista.filter(p => p.exclusivo === true);
      else if (filter === 'ofertas') lista = lista.filter(p => p.destacado === 'True' || p.destacado === true);
      renderProductos(lista.slice(0, visibleCount));
      document.getElementById('loadMoreBtn').style.display = lista.length > visibleCount ? 'inline-flex' : 'none';
    }

    /* ============================================================
       LOAD MORE
    ============================================================ */
    document.getElementById('loadMoreBtn').addEventListener('click', () => {
      visibleCount += 8;
      aplicarFiltros();
    });

    /* ============================================================
       MODAL PREMIUM CON LICENCIA
    ============================================================ */
    const modalOverlay = document.getElementById('productModal');
    const mBody = document.getElementById('mBody');
    const tabDigitalBtn = document.getElementById('tabDigitalBtn');
    const tabFisicoBtn = document.getElementById('tabFisicoBtn');
    const tabLicenciaBtn = document.getElementById('tabLicenciaBtn');
    let currentProduct = null;

    function abrirModal(producto) {
      if (!producto) return;
      currentProduct = producto;

      const nombre = getTexto(producto, 'nombre') || 'Diseño';
      const categoria = getTexto(producto, 'categoria') || 'Digital';

      document.getElementById('mTitleLabel').textContent = nombre;
      document.getElementById('mTypeLabel').textContent = categoria;

      // Resetear pestañas
      tabDigitalBtn.classList.remove('active-fisico', 'active-digital', 'active-licencia');
      tabFisicoBtn.classList.remove('active-fisico', 'active-digital', 'active-licencia');
      tabLicenciaBtn.classList.remove('active-fisico', 'active-digital', 'active-licencia');

      tabDigitalBtn.classList.add('active-digital');
      tabDigitalBtn.style.display = 'block';
      tabFisicoBtn.style.display = 'block';
      tabLicenciaBtn.style.display = 'block';

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
      tabDigitalBtn.classList.add('active-digital');
      tabFisicoBtn.classList.remove('active-fisico');
      tabLicenciaBtn.classList.remove('active-licencia');
      mBody.querySelectorAll('.mtab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === 'digital'));
      sfx.tab();
    });

    tabFisicoBtn.addEventListener('click', function() {
      tabFisicoBtn.classList.add('active-fisico');
      tabDigitalBtn.classList.remove('active-digital');
      tabLicenciaBtn.classList.remove('active-licencia');
      mBody.querySelectorAll('.mtab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === 'fisico'));
      sfx.tab();
    });

    tabLicenciaBtn.addEventListener('click', function() {
      tabLicenciaBtn.classList.add('active-licencia');
      tabDigitalBtn.classList.remove('active-digital');
      tabFisicoBtn.classList.remove('active-fisico');
      mBody.querySelectorAll('.mtab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === 'licencia'));
      sfx.tab();
    });

    /* ============================================================
       RENDER MODAL PANELS (DIGITAL + FÍSICO + LICENCIA)
    ============================================================ */
    function renderModalPanels(p) {
      const imagenes = getImagenes(p);
      const precio = parseFloat(p.precio_cop) || 0;
      const stars = parseFloat(p.estrellas) || 0;
      const reviews = parseInt(p.reseñas) || 0;
      const nombre = getTexto(p, 'nombre') || 'Diseño';
      const descripcion = getTexto(p, 'descripcion') || 'Diseño premium con licencia de uso.';
      const licencia = p.licencia || 'Personal';
      const formato = p.formato || 'PNG, SVG, AI, PSD';

      // Panel Digital (con watermark)
      const panelDigital = `
      <div class="mtab-panel active" data-panel="digital">
        <div class="mp-grid">
          <div class="carousel" style="position:relative;aspect-ratio:1/1;border-radius:8px;overflow:hidden;background:var(--ink-3);">
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:1;">
              <span style="font-family:var(--font-display);font-size:24px;color:rgba(255,102,0,0.15);text-transform:uppercase;transform:rotate(-25deg);letter-spacing:12px;border:2px solid rgba(255,102,0,0.1);padding:16px 32px;border-radius:4px;white-space:nowrap;">© NEMURA</span>
            </div>
            <img src="${imagenes[0]}" alt="${nombre}" style="width:100%;height:100%;object-fit:cover;filter:brightness(.85);">
          </div>
          <div>
            <div class="mp-cat">${p.categoria_es || 'Digital'}</div>
            <h3 class="mp-title">${nombre}</h3>
            <div class="mp-rating"><span class="stars">${'★'.repeat(Math.round(stars))}${'☆'.repeat(5-Math.round(stars))}</span> ${stars} · ${reviews} opiniones</div>
            <div class="mp-price-row"><span class="mp-price">${money(precio)}</span></div>
            <div class="mp-tax">Descarga digital — sin impuestos</div>
            <p style="margin-top:18px;font-size:14px;line-height:1.7;color:rgba(245,243,238,.75);">${descripcion}</p>
            <div class="opt-block">
              <div class="opt-label"><span>Formatos incluidos</span></div>
              <div class="format-grid" id="formatGrid">
                ${formato.split(',').map(f => `<button class="format-chip">${f.trim()}</button>`).join('')}
              </div>
            </div>
            <div style="margin-top:12px;font-family:var(--font-mono);font-size:11px;color:var(--purple);">
              📜 Licencia: <strong>${licencia}</strong>
            </div>
            <div class="stock-row" style="display:flex;align-items:center;gap:8px;margin-top:8px;font-size:13px;color:var(--green);">
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

      // Panel Físico (versión impresa)
      const panelFisico = `
      <div class="mtab-panel" data-panel="fisico">
        <div class="mp-grid">
          <div style="position:relative;aspect-ratio:1/1;border-radius:8px;overflow:hidden;background:var(--ink-3);">
            <img src="${imagenes[0]}" alt="${nombre} Impreso" style="width:100%;height:100%;object-fit:cover;">
          </div>
          <div>
            <div class="mp-cat">${p.categoria_es || 'Digital'} · Impresión</div>
            <h3 class="mp-title">${nombre} — Impreso</h3>
            <div class="mp-rating"><span class="stars">${'★'.repeat(Math.round(stars))}${'☆'.repeat(5-Math.round(stars))}</span> ${stars} · ${reviews} opiniones</div>
            <div class="mp-price-row"><span class="mp-price">${money(precio * 2.5)}</span></div>
            <div class="mp-tax">Incluye impresión en DTF o sublimación</div>
            <p style="margin-top:18px;font-size:14px;line-height:1.7;color:rgba(245,243,238,.75);">Versión impresa del diseño ${nombre}. Disponible en DTF, sublimación y serigrafía.</p>
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

      // Panel Licencia (información legal)
      const panelLicencia = `
      <div class="mtab-panel" data-panel="licencia">
        <div style="max-width:800px;margin:0 auto;">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="font-size:48px;color:var(--purple);margin-bottom:12px;"><i class="fas fa-file-contract"></i></div>
            <h2 style="font-family:var(--font-display);font-size:28px;text-transform:uppercase;">Licencia de <span style="color:var(--purple);">Uso</span></h2>
            <p style="color:rgba(245,243,238,.5);font-size:14px;">Términos y condiciones de uso para el diseño <strong>${nombre}</strong></p>
          </div>

          <div class="license-box">
            <h4>📜 Tipo de Licencia: <span style="color:var(--purple);">${licencia}</span></h4>
            <p>Esta licencia te permite utilizar el diseño ${nombre} bajo las siguientes condiciones:</p>
          </div>

          <div class="license-box" style="border-color:var(--green);">
            <h4 style="color:var(--green);">✅ Lo que puedes hacer</h4>
            <div class="license-icons">
              <span class="green">✓ Uso personal</span>
              <span class="green">${licencia !== 'Personal' ? '✓ Uso comercial' : '✗ Uso comercial'}</span>
              <span class="green">${licencia === 'Extendida' ? '✓ Redistribución' : '✗ Redistribución'}</span>
              <span class="green">${licencia === 'Extendida' ? '✓ Sub-licencia' : '✗ Sub-licencia'}</span>
              <span class="green">✓ Modificaciones</span>
            </div>
          </div>

          <div class="license-box" style="border-color:var(--red);">
            <h4 style="color:var(--red);">🚫 Lo que NO puedes hacer</h4>
            <ul style="list-style:none;padding:0;margin-top:8px;">
              <li style="padding:6px 0;font-size:13px;color:rgba(245,243,238,.6);border-bottom:1px solid var(--line);">
                <span style="color:var(--red);">✗</span> Vender el archivo original sin modificaciones
              </li>
              <li style="padding:6px 0;font-size:13px;color:rgba(245,243,238,.6);border-bottom:1px solid var(--line);">
                <span style="color:var(--red);">✗</span> Usar en NFTs o activos digitales
              </li>
              <li style="padding:6px 0;font-size:13px;color:rgba(245,243,238,.6);border-bottom:1px solid var(--line);">
                <span style="color:var(--red);">✗</span> Usar en productos ilegales o discriminatorios
              </li>
              <li style="padding:6px 0;font-size:13px;color:rgba(245,243,238,.6);">
                <span style="color:var(--red);">✗</span> Sub-licenciar sin autorización
              </li>
            </ul>
          </div>

          <div class="license-box">
            <h4>📌 Atribución</h4>
            <p>En caso de uso público, se debe dar crédito a <strong>NEMURA DESIGN EMPIRE</strong>.</p>
          </div>

          <div class="license-box">
            <h4>⚖️ Base Legal</h4>
            <p>Esta licencia se rige por la Ley 23 de 1982 (Derechos de Autor en Colombia) y los tratados internacionales de propiedad intelectual.</p>
          </div>

          <div style="background:var(--ink-3);border:1px solid var(--line);border-radius:var(--radius);padding:20px;text-align:center;margin-top:16px;">
            <p style="font-size:12px;color:rgba(245,243,238,.4);">Al descargar este diseño, aceptas los términos de esta licencia.</p>
            <button class="btn btn-purple" style="margin-top:12px;width:100%;justify-content:center;" onclick="descargarLicencia()">
              <i class="fas fa-download"></i> Descargar Licencia (PDF)
            </button>
          </div>
        </div>
      </div>`;

      mBody.innerHTML = panelDigital + panelFisico + panelLicencia;

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
          this.parentElement.querySelectorAll('.format-chip').forEach(f => f.classList.remove('selected'));
          this.classList.add('selected');
        });
      });

      // Eventos carrito
      mBody.querySelectorAll('[data-add-cart], [data-buy-now]').forEach(btn => {
        btn.addEventListener('click', function() {
          const tipo = this.dataset.addCart || this.dataset.buyNow;
          const qty = parseInt(document.getElementById('qtyInput-' + tipo).value) || 1;
          const nombre = getTexto(currentProduct, 'nombre') || 'Diseño';
          const precio = parseFloat(currentProduct.precio_cop) || 0;

          // Obtener formato seleccionado
          let formato = 'PNG';
          if (tipo === 'digital') {
            const selected = document.querySelector('#formatGrid .format-chip.selected');
            if (selected) formato = selected.textContent;
          }

          const item = {
            id: currentProduct.id + '-' + tipo + '-' + formato,
            nombre: nombre + (tipo === 'digital' ? ' (Digital)' : ' (Impreso)') + ' - ' + formato,
            precio: tipo === 'digital' ? precio : precio * 2.5,
            cantidad: qty,
            imagen: getImagenes(currentProduct)[0] || '',
            tipo: tipo,
            formato: formato,
            licencia: currentProduct.licencia || 'Personal'
          };
          const existente = carrito.find(i => i.id === item.id);
          if (existente) existente.cantidad += qty;
          else carrito.push(item);
          localStorage.setItem('nemura-carrito', JSON.stringify(carrito));
          renderCarrito();
          sfx.addCart();
          toast('✅ ' + item.nombre + ' agregado al carrito');
          if (this.dataset.buyNow) { cerrarModal();
            abrirCarrito(); }
        });
      });
    }

    /* ============================================================
       DESCARGA DE LICENCIA
    ============================================================ */
    function descargarLicencia() {
      if (!currentProduct) return;
      const nombre = getTexto(currentProduct, 'nombre') || 'Diseño';
      const licencia = currentProduct.licencia || 'Personal';
      const contenido = `
LICENCIA DE USO — NEMURA DESIGN EMPIRE

Diseño: ${nombre}
Tipo de Licencia: ${licencia}
Fecha: ${new Date().toLocaleDateString('es-CO')}

TÉRMINOS Y CONDICIONES:

1. El titular de esta licencia tiene derecho a utilizar el diseño ${nombre} para:
   ${licencia !== 'Personal' ? '✓ Uso comercial y personal' : '✓ Uso personal no comercial'}

2. PROHIBICIONES:
   ✗ No está permitida la reventa del archivo original
   ✗ No está permitido el uso en NFTs o activos digitales
   ✗ No está permitido el uso en productos ilegales

3. ATRIBUCIÓN:
   En caso de uso público, se debe dar crédito a NEMURA DESIGN EMPIRE.

4. BASE LEGAL:
   Esta licencia se rige por la Ley 23 de 1982 de Colombia.

5. ACEPTACIÓN:
   Al descargar y utilizar este diseño, aceptas los términos de esta licencia.

© ${new Date().getFullYear()} NEMURA DESIGN EMPIRE
Todos los derechos reservados.
      `;

      // Crear y descargar archivo
      const blob = new Blob([contenido], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LICENCIA_${nombre.replace(/\s/g, '_')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast('📜 Licencia descargada correctamente');
      sfx.success();
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
      cartBadge.textContent = carrito.reduce((a, i) => a + i.cantidad, 0);
      if (carrito.length === 0) {
        cartItemsEl.innerHTML =
          `<div class="cart-empty">Tu carrito está vacío.<br>Explora el catálogo para empezar.</div>`;
        cartSubtotalEl.textContent = money(0);
        return;
      }
      cartItemsEl.innerHTML = carrito.map((item, idx) => `
        <div class="cart-item">
          <img src="${item.imagen}" alt="${item.nombre}">
          <div class="cart-item-info">
            <b>${item.nombre}</b>
            <div class="meta">${item.tipo === 'digital' ? 'Digital' : 'Impreso'} · Formato ${item.formato || 'PNG'} · Licencia ${item.licencia || 'Personal'} · Cant. ${item.cantidad}</div>
            <div class="cart-item-price">${money(item.precio * item.cantidad)}</div>
            <a class="cart-item-remove" data-remove="${idx}">Eliminar</a>
          </div>
        </div>
      `).join('');
      const subtotal = carrito.reduce((a, i) => a + i.precio * i.cantidad, 0);
      cartSubtotalEl.textContent = money(subtotal);
    }

    cartItemsEl.addEventListener('click', (e) => {
      const rm = e.target.closest('[data-remove]');
      if (rm) { carrito.splice(+rm.dataset.remove, 1);
        localStorage.setItem('nemura-carrito', JSON.stringify(carrito));
        renderCarrito(); }
    });

    

    

    document.getElementById('cartBtn').addEventListener('click', abrirCarrito);
    document.getElementById('cartCloseBtn').addEventListener('click', cerrarCarrito);
    cartOverlay.addEventListener('click', cerrarCarrito);

    document.getElementById('cartCheckoutBtn').addEventListener('click', () => {
      if (carrito.length === 0) { toast('Tu carrito está vacío', 'error');
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
        const filtrados = productos.filter(p =>
          (getTexto(p, 'nombre') || '').toLowerCase().includes(term.toLowerCase()) ||
          (getTexto(p, 'categoria') || '').toLowerCase().includes(term.toLowerCase())
        );
        if (filtrados.length > 0) {
          renderProductos(filtrados.slice(0, visibleCount));
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
      if (favoritos.length === 0) { toast('❤️ No tienes favoritos aún'); return; }
      const favs = productos.filter(p => favoritos.includes(p.id));
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
    document.getElementById('favBadge').textContent = favoritos.length;
    renderCarrito();
    renderProductos(productos.slice(0, visibleCount));

    console.log('🎨 NEMURA — Diseños con Licencia');
    console.log('✅ Cada diseño incluye licencia de uso');
    console.log('✅ Watermark en vista previa');
    console.log('✅ Descarga de licencia en texto');
    console.log('✅ Modal con 3 pestañas (Digital + Físico + Licencia)');
    console.log('🚀 ¡Todo listo!');
