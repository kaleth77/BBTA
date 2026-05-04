/* ========================================
   CART.JS - Carrito flotante BBTA
   Agregar en: tequila, whisky, vino, aguardiente
   ======================================== */

(function () {
  /* ---------- Estado ---------- */
  let cart = JSON.parse(localStorage.getItem('bbta_cart') || '[]');

  /* ---------- Inyectar HTML del carrito ---------- */
  const cartHTML = `
    <div class="cart-overlay" id="cartOverlay"></div>

    <button class="cart-fab" id="cartFab" aria-label="Abrir carrito">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5.82 6l-.94-2H1V2h5l4 9h7l3-7H6.5L5.82 6zM7 16l1-2h9.6l1.4-3.27L17 9H8L5 3H1v2h2.18L7 14H5v2h2z"/>
      </svg>
      <span class="cart-badge" id="cartBadge">0</span>
    </button>

    <div class="cart-panel" id="cartPanel">
      <div class="cart-header">
        <h3>🛒 MI PEDIDO</h3>
        <button class="cart-close" id="cartClose">&times;</button>
      </div>
      <div class="cart-items" id="cartItems"></div>
      <div class="cart-footer">
        <div class="cart-total">
          <span>TOTAL</span>
          <span id="cartTotal">$0</span>
        </div>
        <button class="cart-whatsapp-btn" id="cartSendBtn">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          ENVIAR PEDIDO
        </button>
        <button class="cart-clear" id="cartClear">Vaciar carrito</button>
      </div>
    </div>

    <div class="cart-toast" id="cartToast">¡Agregado al carrito! 🛒</div>
  `;

  document.body.insertAdjacentHTML('beforeend', cartHTML);

  /* ---------- Referencias ---------- */
  const fab       = document.getElementById('cartFab');
  const badge     = document.getElementById('cartBadge');
  const panel     = document.getElementById('cartPanel');
  const overlay   = document.getElementById('cartOverlay');
  const closeBtn  = document.getElementById('cartClose');
  const itemsEl   = document.getElementById('cartItems');
  const totalEl   = document.getElementById('cartTotal');
  const sendBtn   = document.getElementById('cartSendBtn');
  const clearBtn  = document.getElementById('cartClear');
  const toast     = document.getElementById('cartToast');

  /* ---------- Utilidades ---------- */
  function saveCart() {
    localStorage.setItem('bbta_cart', JSON.stringify(cart));
  }

  function formatPrice(n) {
    return '$' + n.toLocaleString('es-CO');
  }

  function parsePrice(str) {
    // "$1.200.000" → 1200000
    return parseInt(str.replace(/\./g, '').replace('$', '').replace(/\s/g, ''), 10) || 0;
  }

  function getTotalItems() {
    return cart.reduce((s, i) => s + i.qty, 0);
  }

  function getTotalPrice() {
    return cart.reduce((s, i) => s + i.price * i.qty, 0);
  }

  /* ---------- Badge ---------- */
  function updateBadge() {
    const total = getTotalItems();
    badge.textContent = total;
    if (total > 0) {
      badge.classList.add('visible');
    } else {
      badge.classList.remove('visible');
    }
  }

  function popBadge() {
    badge.classList.remove('pop');
    void badge.offsetWidth; // reflow
    badge.classList.add('pop');
  }

  /* ---------- Toast ---------- */
  let toastTimeout;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2000);
  }

  /* ---------- Render carrito ---------- */
  function renderCart() {
    totalEl.textContent = formatPrice(getTotalPrice());

    if (cart.length === 0) {
      itemsEl.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5.82 6l-.94-2H1V2h5l4 9h7l3-7H6.5L5.82 6z"/></svg>
          <span>Tu carrito está vacío</span>
        </div>`;
      return;
    }

    itemsEl.innerHTML = cart.map((item, idx) => `
      <div class="cart-item" data-idx="${idx}">
        <img class="cart-item-img" src="${item.img}" alt="${item.name}" onerror="this.style.display='none'">
        <div class="cart-item-info">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">${formatPrice(item.price)} × ${item.qty} = ${formatPrice(item.price * item.qty)}</p>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" data-action="dec" data-idx="${idx}">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" data-action="inc" data-idx="${idx}">+</button>
        </div>
      </div>
    `).join('');
  }

  /* ---------- Agregar producto ---------- */
  window.addToCart = function (name, priceStr, imgSrc) {
    const price = parsePrice(priceStr);
    const existing = cart.find(i => i.name === name);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ name, price, img: imgSrc, qty: 1 });
    }
    saveCart();
    updateBadge();
    popBadge();
    showToast(`¡${name} agregado! 🛒`);
    renderCart();
  };

  /* ---------- Eventos qty ---------- */
  itemsEl.addEventListener('click', function (e) {
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;
    const idx    = parseInt(btn.dataset.idx, 10);
    const action = btn.dataset.action;
    if (action === 'inc') {
      cart[idx].qty++;
    } else {
      cart[idx].qty--;
      if (cart[idx].qty <= 0) cart.splice(idx, 1);
    }
    saveCart();
    updateBadge();
    renderCart();
  });

  /* ---------- Abrir/cerrar panel ---------- */
  fab.addEventListener('click', () => {
    panel.classList.add('open');
    overlay.classList.add('show');
    renderCart();
  });

  function closePanel() {
    panel.classList.remove('open');
    overlay.classList.remove('show');
  }

  closeBtn.addEventListener('click', closePanel);
  overlay.addEventListener('click', closePanel);

  /* ---------- Vaciar ---------- */
  clearBtn.addEventListener('click', () => {
    cart = [];
    saveCart();
    updateBadge();
    renderCart();
  });

  /* ---------- Enviar por WhatsApp ---------- */
  sendBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Agrega productos primero 😊');
      return;
    }
    const lineas = cart.map(i =>
      `• ${i.name} x${i.qty} — ${formatPrice(i.price * i.qty)}`
    ).join('%0A');
    const total = formatPrice(getTotalPrice());
    const msg = `Hola 👋, quiero hacer un pedido en BBTA:%0A%0A${lineas}%0A%0A💰 *TOTAL DEL PEDIDO: ${total}*%0A%0APor favor indícame dirección de entrega. ¡Gracias! 🍾`;
    window.open(`https://wa.me/573008734383?text=${msg}`, '_blank');
    cart = [];
    saveCart();
    updateBadge();
    renderCart();
    closePanel();
  });

  /* ---------- Init ---------- */
  updateBadge();
  renderCart();

})();
