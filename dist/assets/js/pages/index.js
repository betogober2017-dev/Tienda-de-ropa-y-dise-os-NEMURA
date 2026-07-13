/* ============================================================
   CONFIGURACIÓN — CONEXIÓN A EXCEL VIA SHEETDB
   ============================================================ */
const SHEETDB_URL = 'https://sheetdb.io/api/v1/nsfs9j9qrm77m';

/* ============================================================
   PRODUCTOS DE RESPALDO (SI FALLA EXCEL)
   ============================================================ */
const PRODUCTOS_RESPALDO = [
  // Ropa Física
  { id: "f1", nombre_es: "Camisa Over-Sized Eren V1", categoria_es: "Anime Premium", tipo: "fisico", precio_cop: "85000", imagen1: "https://placehold.co/400x400/111/FF6600?text=Eren", estrellas: "4.8", reseñas: "127", tallas: "S,M,L,XL", destacado: "True" },
  { id: "f2", nombre_es: "Hoodie Attack on Titan", categoria_es: "Anime Premium", tipo: "fisico", precio_cop: "120000", imagen1: "https://placehold.co/400x400/111/FF6600?text=AOT", estrellas: "4.9", reseñas: "89", tallas: "S,M,L,XL,XXL", destacado: "True" },
  { id: "f3", nombre_es: "Gorra Demon Slayer", categoria_es: "Accesorios", tipo: "fisico", precio_cop: "45000", imagen1: "https://placehold.co/400x400/111/FF6600?text=Gorra", estrellas: "4.5", reseñas: "56" },
  { id: "f4", nombre_es: "Camisa Over-Sized Levi", categoria_es: "Anime Premium", tipo: "fisico", precio_cop: "89000", imagen1: "https://placehold.co/400x400/111/FF6600?text=Levi", estrellas: "4.9", reseñas: "78", tallas: "S,M,L,XL" },
  { id: "f5", nombre_es: "Hoodie Naruto Uzumaki", categoria_es: "Anime Premium", tipo: "fisico", precio_cop: "115000", imagen1: "https://placehold.co/400x400/111/FF6600?text=Naruto", estrellas: "4.7", reseñas: "102", tallas: "S,M,L,XL,XXL" },
  
  // Diseños Digitales
  { id: "d1", nombre_es: "Pack Vectores DBZ", categoria_es: "Vectores", tipo: "digital", precio_cop: "25000", imagen1: "https://placehold.co/400x400/111/2E6BFF?text=DBZ", estrellas: "4.7", reseñas: "203", formato: "PNG, SVG, AI, PSD, EPS" },
  { id: "d2", nombre_es: "Mockup PSD Premium", categoria_es: "Mockups", tipo: "digital", precio_cop: "15000", imagen1: "https://placehold.co/400x400/111/2E6BFF?text=Mockup", estrellas: "4.6", reseñas: "134", formato: "PSD, PNG, JPG" },
  { id: "d3", nombre_es: "Vectores Neon Cyberpunk", categoria_es: "Vectores", tipo: "digital", precio_cop: "32000", imagen1: "https://placehold.co/400x400/111/2E6BFF?text=Neon", estrellas: "4.9", reseñas: "156", formato: "SVG, AI, EPS, PNG", destacado: "True" },
  
  // Vasos
  { id: "v1", nombre_es: "Vaso Térmico Neon", categoria_es: "Térmicos", tipo: "vaso", precio_cop: "35000", imagen1: "https://placehold.co/400x400/111/00C8B8?text=Termico", estrellas: "4.8", reseñas: "156", material: "Acero", capacidad: "500ml" },
  { id: "v2", nombre_es: "Vaso Vidrio Anime", categoria_es: "Vidrio", tipo: "vaso", precio_cop: "28000", imagen1: "https://placehold.co/400x400/111/00C8B8?text=Vidrio", estrellas: "4.6", reseñas: "89", material: "Vidrio", capacidad: "400ml" },
  { id: "v3", nombre_es: "Vaso Cerámica Premium", categoria_es: "Cerámica", tipo: "vaso", precio_cop: "32000", imagen1: "https://placehold.co/400x400/111/00C8B8?text=Ceramica", estrellas: "4.7", reseñas: "112", material: "Cerámica", capacidad: "350ml" }
];

/* ============================================================
   ESTADO
   ============================================================ */
const state = {
  productos: [],
  carrito: JSON.parse(localStorage.getItem('nemura-carrito') || '[]'),
  favoritos: JSON.parse(localStorage.getItem('nemura-favoritos') || '[]'),
  filter: 'all',
  visibleCount: 8,
  selectedSize: {},
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

function money(valor) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor || 0);
}

/* ============================================================
   TOAST (NOTIFICACIONES)
   ============================================================ */
function toast(mensaje, tipo = 'info') {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = mensaje;
  el.style.cssText = `
    background: #1a1a1a;
    color: #f5f3ee;
    padding: 12px 20px;
    border-radius: 10px;
    border: 1px solid ${tipo === 'error' ? 'rgba(255,0,0,0.2)' : 'rgba(255,102,0,0.2)'};
    animation: toast-in 0.3s ease;
    margin-bottom: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
  `;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'toast-out 0.3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

/* ============================================================
   AUDIO — SONIDOS FUTURISTAS
   ============================================================ */
let audioCtx;

function playTone(freq, dur, type = 'sine', vol = 0.06) {
  try {
    if (!audioCtx) audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch (e) { /* silencio */ }
}

const sfx = {
  openModal: () => playTone(520, 0.12, 'sine', 0.06),
  closeModal: () => playTone(300, 0.1, 'sine', 0.05),
  tab: () => playTone(700, 0.05, 'triangle', 0.04),
  fav: () => playTone(880, 0.08, 'triangle', 0.05),
  addCart: () => { playTone(600, 0.08, 'square', 0.04); setTimeout(() => playTone(900, 0.09, 'square', 0.04), 80); },
  success: () => { playTone(660, 0.1, 'sine', 0.05); setTimeout(() => playTone(990, 0.14, 'sine', 0.05), 100); },
  error: () => playTone(160, 0.2, 'sawtooth', 0.05)
};

/* ============================================================
   OBTENER PRODUCTOS DESDE EXCEL (CON RESPALDO)
   ============================================================ */
async function cargarProductosDesdeExcel() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = Array(8).fill(0).map(() => `
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
      console.warn('⚠️ No hay datos en Excel, usando productos de respaldo');
      data = PRODUCTOS_RESPALDO;
    }

    state.productos = data.filter(p => p.activo !== 'False' && p.id);
    document.getElementById('statProducts').textContent = String(state.productos.length).padStart(2, '0');
    renderProductos(state.productos.slice(0, state.visibleCount));
    document.getElementById('loadMoreBtn').style.display = state.productos.length > state.visibleCount ? 'inline-flex' : 'none';
  } catch (error) {
    console.warn('⚠️ Error conectando a Excel, usando productos de respaldo:', error);
    state.productos = PRODUCTOS_RESPALDO;
    document.getElementById('statProducts').textContent = String(PRODUCTOS_RESPALDO.length).padStart(2, '0');
    renderProductos(PRODUCTOS_RESPALDO.slice(0, state.visibleCount));
  }
}

/* ============================================================
   RENDERIZAR PRODUCTOS
   ============================================================ */
function renderProductos(lista) {
  const grid = document.getElementById('productGrid');
  if (!lista || lista.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#888;"><h3>No hay productos disponibles</h3><p style="opacity:0.3;">Pronto tendremos más productos</p></div>`;
    return;
  }

  grid.innerHTML = lista.map((p, i) => {
    const nombre = getTexto(p, 'nombre') || 'Producto';
    const categoria = getTexto(p, 'categoria') || 'General';
    const precio = parseFloat(p.precio_cop) || 0;
    const img = getImagenes(p)[0] || 'https://placehold.co/400x400/222/FF6600?text=NEMURA';
    const esFav = state.favoritos.includes(p.id);
    const tipo = p.tipo === 'digital' ? 'digital' : p.tipo === 'vaso' ? 'vaso' : 'fisico';
    let badgeClass = 'fisico';
    let badgeText = '👕 Físico';
    if (tipo === 'digital') { badgeClass = 'digital'; badgeText = '💻 Digital'; } 
    else if (tipo === 'vaso') { badgeClass = 'vaso'; badgeText = '🧋 Vaso'; }
    const stars = parseFloat(p.estrellas) || 0;
    const reviews = parseInt(p.reseñas) || 0;

    return `
    <div class="card" data-id="${p.id}" style="animation-delay:${i * 0.05}s;">
      <div class="card-media">
        <img src="${img}" alt="${nombre}" loading="lazy" onerror="this.src='https://placehold.co/400x400/222/FF6600?text=NEMURA'">
        <div class="card-badges">
          <span class="badge-tag ${badgeClass}">${badgeText}</span>
          ${p.destacado === 'True' || p.destacado === true ? '<span class="badge-tag oferta">🔥 Destacado</span>' : ''}
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
  if (idx > -1) { state.favoritos.splice(idx, 1); toast('💔 Eliminado de favoritos'); } 
  else { state.favoritos.push(id); toast('❤️ Agregado a favoritos'); sfx.fav(); }
  localStorage.setItem('nemura-favoritos', JSON.stringify(state.favoritos));
  document.getElementById('favBadge').textContent = state.favoritos.length;
  renderProductos(state.productos.slice(0, state.visibleCount));
}

/* ============================================================
   FILTROS
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
  if (state.filter === 'fisico') lista = lista.filter(p => p.tipo === 'fisico');
  else if (state.filter === 'digital') lista = lista.filter(p => p.tipo === 'digital');
  else if (state.filter === 'vaso') lista = lista.filter(p => p.tipo === 'vaso');
  else if (state.filter === 'oferta') lista = lista.filter(p => p.destacado === 'True' || p.destacado === true);
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
   MODAL PREMIUM - CORREGIDO
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
   RENDER MODAL PANELS - CORREGIDO
   ============================================================ */
function renderModalPanels(p, esDigital) {
  const imagenes = getImagenes(p);
  const precio = parseFloat(p.precio_cop) || 0;
  const stars = parseFloat(p.estrellas) || 0;
  const reviews = parseInt(p.reseñas) || 0;
  const nombre = getTexto(p, 'nombre') || 'Producto';
  const descripcion = getTexto(p, 'descripcion') || 'Diseño exclusivo de NEMURA.';
  const tallas = p.tallas || 'S,M,L,XL';
  const formato = p.formato || 'PNG, SVG, AI, PSD';

  // Panel Físico
  const panelFisico = `
  <div class="mtab-panel ${!esDigital ? 'active' : ''}" data-panel="fisico">
    <div class="mp-grid">
      <div class="carousel" id="carousel-fisico">
        <div class="carousel-track" id="carouselTrack-fisico">
          ${imagenes.map(src => `<img src="${src}" alt="${nombre}" onerror="this.src='https://placehold.co/400x400/222/FF6600?text=NEMURA'">`).join('')}
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
        ${p.material ? `<p style="color:rgba(245,243,238,.5);font-size:13px;"><strong>Material:</strong> ${p.material}</p>` : ''}
        ${p.capacidad ? `<p style="color:rgba(245,243,238,.5);font-size:13px;"><strong>Capacidad:</strong> ${p.capacidad}</p>` : ''}
        <div class="opt-block">
          <div class="opt-label"><span>Tallas</span></div>
          <div class="size-row" id="sizeRow">
            ${tallas.split(',').map(t => `<button class="size-btn">${t.trim()}</button>`).join('')}
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

  // Panel Digital
  const panelDigital = `
  <div class="mtab-panel ${esDigital ? 'active' : ''}" data-panel="digital">
    <div class="mp-grid">
      <div>
        <div class="carousel" style="aspect-ratio:1/1;position:relative;">
          <div style="position:absolute;top:12px;left:12px;background:rgba(10,10,10,.7);backdrop-filter:blur(6px);padding:5px 10px;font-family:var(--font-mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;border:1px solid var(--line-strong);border-radius:3px;z-index:2;color:var(--blue);">Vista previa</div>
          <img src="${imagenes[0] || 'https://placehold.co/400x400/222/2E6BFF?text=VECTOR'}" alt="${nombre} Digital" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='https://placehold.co/400x400/222/2E6BFF?text=VECTOR'">
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
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:8px;">
            ${formato.split(',').map(f => `<div style="border:1px solid var(--line-strong);border-radius:6px;padding:10px 4px;text-align:center;font-family:var(--font-mono);font-size:11px;font-weight:700;transition:all .2s;">${f.trim()}</div>`).join('')}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:16px;font-size:13px;color:var(--green);">
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

  // ============================================================
  // EVENTOS CARRUSEL
  // ============================================================
  mBody.querySelectorAll('[data-car]').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.dataset.car;
      const track = document.getElementById('carouselTrack-' + id);
      const dots = document.getElementById('carouselDots-' + id);
      if (!track || !dots) return;
      const total = dots.children.length;
      if (total === 0) return;
      state.carouselIndex[id] = state.carouselIndex[id] || 0;
      state.carouselIndex[id] = this.classList.contains('prev') ?
        (state.carouselIndex[id] - 1 + total) % total :
        (state.carouselIndex[id] + 1) % total;
      track.style.transform = `translateX(-${state.carouselIndex[id] * 100}%)`;
      Array.from(dots.children).forEach((d, i) => d.classList.toggle('active', i === state.carouselIndex[id]));
    });
  });

  // ============================================================
  // EVENTOS CANTIDAD
  // ============================================================
  mBody.querySelectorAll('[data-qty-minus], [data-qty-plus]').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.dataset.qtyMinus || this.dataset.qtyPlus;
      const input = document.getElementById('qtyInput-' + id);
      if (!input) return;
      let val = parseInt(input.value) || 1;
      val = this.dataset.qtyMinus ? Math.max(1, val - 1) : val + 1;
      input.value = val;
    });
  });

  // ============================================================
  // EVENTOS TALLAS
  // ============================================================
  mBody.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const parent = this.parentElement;
      if (parent) {
        parent.querySelectorAll('.size-btn').forEach(s => s.classList.remove('selected'));
      }
      this.classList.add('selected');
    });
  });

  // ============================================================
  // EVENTOS CARRITO
  // ============================================================
  mBody.querySelectorAll('[data-add-cart], [data-buy-now]').forEach(btn => {
    btn.addEventListener('click', function() {
      const tipo = this.dataset.addCart || this.dataset.buyNow;
      const qtyInput = document.getElementById('qtyInput-' + tipo);
      const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
      const nombre = getTexto(currentProduct, 'nombre') || 'Producto';
      const precio = parseFloat(currentProduct.precio_cop) || 0;
      const tallaSeleccionada = document.querySelector('#sizeRow .size-btn.selected');
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
      if (this.dataset.buyNow) { cerrarModal(); abrirCarrito(); }
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
    cartItemsEl.innerHTML = `<div class="cart-empty">Tu carrito está vacío.<br>Explora el catálogo para empezar.</div>`;
    cartSubtotalEl.textContent = money(0);
    return;
  }
  cartItemsEl.innerHTML = state.carrito.map((item, idx) => `
    <div class="cart-item">
      <img src="${item.imagen}" alt="${item.nombre}" onerror="this.src='https://placehold.co/400x400/222/FF6600?text=NEMURA'">
      <div class="cart-item-info">
        <b>${item.nombre}</b>
        <div class="meta">${item.tipo === 'digital' ? 'Digital' : 'Físico'} · Talla ${item.talla || 'M'} · Cant. ${item.cantidad}</div>
        <div class="cart-item-price">${money(item.precio * item.cantidad)}</div>
        <a class="cart-item-remove" data-remove="${idx}">Eliminar</a>
      </div>
    </div>
  `).join('');
  const subtotal = state.carrito.reduce((a, i) => a + i.precio * i.cantidad, 0);
  cartSubtotalEl.textContent = money(subtotal);
}

function abrirCarrito() {
  cartOverlay.classList.add('open');
  cartDrawer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function cerrarCarrito() {
  cartOverlay.classList.remove('open');
  cartDrawer.classList.remove('open');
  document.body.style.overflow = '';
}

cartItemsEl.addEventListener('click', (e) => {
  const rm = e.target.closest('[data-remove]');
  if (rm) { state.carrito.splice(+rm.dataset.remove, 1); localStorage.setItem('nemura-carrito', JSON.stringify(state.carrito)); renderCarrito(); }
});

document.getElementById('cartBtn').addEventListener('click', abrirCarrito);
document.getElementById('cartCloseBtn').addEventListener('click', cerrarCarrito);
cartOverlay.addEventListener('click', cerrarCarrito);

document.getElementById('cartCheckoutBtn').addEventListener('click', () => {
  if (state.carrito.length === 0) { toast('Tu carrito está vacío', 'error'); sfx.error(); return; }
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
      toast('🔍 No se encontraron productos', 'error');
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
   INICIO
   ============================================================ */
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('favBadge').textContent = state.favoritos.length;
renderCarrito();
cargarProductosDesdeExcel();

// Inicializar carrusel de novedades
if (typeof NemuraCarousel !== 'undefined') {
  NemuraCarousel.mount('#carruselNuevos', {
    sheetdbUrl: SHEETDB_URL + '?sheet=PRODUCTOS_WEB',
    tipo: null,
    limite: 12,
    onOpen: abrirModal,
    enlaceBase: 'tienda-ropa.html'
  });
}

console.log('🦂 NEMURA v5.0 — Conectado a Excel vía SheetDB');
console.log('✅ Modal premium con pestañas (Físico + Digital)');
console.log('✅ Productos de respaldo incluidos');
console.log('✅ Carrito y favoritos persistentes');
console.log('🚀 ¡Todo listo!');