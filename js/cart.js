const canAccessCart = requireUserCartAccess();

const cartContainer = document.getElementById('cartContainer');

async function loadCart() {
  try {
    const checkoutNotice = await getStripeCheckoutNotice();
    const res = await authFetch('/api/cart');
    const cart = await res.json();

    if (!cart.items || !cart.items.length) {
      cartContainer.innerHTML = checkoutNotice + '<p>Your cart is empty. <a href="products.html">Browse products</a>.</p>';
      if (typeof updateCartBadge === 'function') updateCartBadge();
      return;
    }

    let total = 0;
    const rows = cart.items
      .map((item) => {
        total += item.product.price * item.quantity;
        return `
        <div class="routine-step">
          <div>
            <strong>${item.product.name}</strong><br/>
            <span style="font-size:0.85rem; color:var(--muted);">LKR ${item.product.price} each</span>
          </div>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <input type="number" min="1" value="${item.quantity}" data-id="${item.product._id}" class="qty-input" style="width:60px; margin:0;" />
            <span>LKR ${item.product.price * item.quantity}</span>
            <button data-id="${item.product._id}" data-name="${item.product.name}" class="remove-btn" style="background:#d9534f; color:#fff; border:none; padding:8px 10px; border-radius:10px; cursor:pointer;">Remove</button>
          </div>
        </div>
      `;
      })
      .join('');

    cartContainer.innerHTML = checkoutNotice + rows + `
      <p style="text-align:right; margin-top:1rem;"><strong>Total: LKR ${total}</strong></p>
      <p style="text-align:right; display:flex; justify-content:flex-end; gap:0.75rem; flex-wrap:wrap;">
        <button id="checkCompatibilityBtn">Check Routine Compatibility</button>
        <button id="checkoutBtn" class="primary-btn">Checkout</button>
      </p>
      <div id="cartCompatibilityResult"></div>
    `;

    document.querySelectorAll('.qty-input').forEach((input) => {
      input.addEventListener('change', () => updateQuantity(input.dataset.id, Number(input.value)));
    });
    document.querySelectorAll('.remove-btn').forEach((btn) => {
      btn.addEventListener('click', () => removeFromCart(btn.dataset.id, btn.dataset.name));
    });
    document.getElementById('checkCompatibilityBtn').addEventListener('click', () => checkCompatibility(cart.items));
    document.getElementById('checkoutBtn').addEventListener('click', startStripeCheckout);
    if (typeof updateCartBadge === 'function') updateCartBadge();
  } catch (err) {
    cartContainer.innerHTML = '<p>Could not load cart.</p>';
    console.error(err);
  }
}

async function getStripeCheckoutNotice() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('checkout') !== 'success') return '';

  const sessionId = params.get('session_id');
  if (!sessionId) {
    return '<p role="alert">Payment could not be verified. Please contact support if you completed checkout.</p>';
  }

  try {
    const res = await authFetch(`/api/checkout/session-status?session_id=${encodeURIComponent(sessionId)}`);
    const data = await res.json();
    if (!res.ok || data.paymentStatus !== 'paid') {
      return `<p role="alert">${escapeHtml(data.error || 'Payment could not be verified.')}</p>`;
    }

    const paidAmount = Number(data.amountTotal) / 100;
    return `<section role="status" aria-live="polite">
      <h3>Payment successful!</h3>
      <p>Your payment has been confirmed by Stripe. Total paid: ${escapeHtml(data.currency.toUpperCase())} ${paidAmount.toLocaleString()}.</p>
    </section>`;
  } catch (err) {
    console.error('Could not verify Stripe checkout:', err);
    return '<p role="alert">Payment could not be verified. Please contact support if you completed checkout.</p>';
  } finally {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

function escapeHtml(value) {
  const element = document.createElement('span');
  element.textContent = value;
  return element.innerHTML;
}

async function updateQuantity(productId, quantity) {
  if (quantity < 1) quantity = 1;
  try {
    const res = await authFetch(`/api/cart/item/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    const cart = await res.json();
    const item = cart.items.find((i) => i.product._id === productId);
    if (item) showToast(`${item.product.name} quantity updated to ${item.quantity}`);
    loadCart();
  } catch (err) {
    console.error(err);
  }
}

async function removeFromCart(productId, productName) {
  try {
    await authFetch(`/api/cart/item/${productId}`, { method: 'DELETE' });
    showToast(`${productName || 'Item'} removed from cart`, { type: 'success' });
    loadCart();
  } catch (err) {
    console.error(err);
  }
}

async function checkCompatibility(items) {
  const resultBox = document.getElementById('cartCompatibilityResult');
  const productIds = items.map((i) => i.product._id);

  try {
    const res = await fetch('/api/compatibility/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds }),
    });
    const data = await res.json();

    resultBox.innerHTML = renderCompatibilityMatches(
      data.conflicts,
      'No conflicts found among your cart items. ✅'
    );
    if (data.notes && data.notes.length) {
      resultBox.innerHTML += renderCompatibilityMatches(data.notes);
    }
  } catch (err) {
    resultBox.innerHTML = '<p>Could not check compatibility.</p>';
    console.error(err);
  }
}

async function startStripeCheckout() {
  try {
    const btn = document.getElementById('checkoutBtn');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Creating checkout...';

    const res = await authFetch('/api/checkout/create-session', { method: 'POST' });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Could not start checkout.');
      btn.disabled = false;
      btn.textContent = originalText;
      return;
    }

    if (data.url) {
      window.location.href = data.url;
      return;
    }

    alert('Checkout session was created but no redirect URL was returned.');
    btn.disabled = false;
    btn.textContent = originalText;
  } catch (err) {
    console.error(err);
    alert('Checkout failed. Please try again.');
    const btn = document.getElementById('checkoutBtn');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Checkout';
    }
  }
}

if (canAccessCart) loadCart();
