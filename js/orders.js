const canAccessOrders = requireUserCartAccess();
const ordersContainer = document.getElementById('ordersContainer');

function escapeOrderText(value) {
  const element = document.createElement('span');
  element.textContent = value == null ? '' : String(value);
  return element.innerHTML;
}

function formatOrderDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
}

function formatOrderAmount(amount, currency) {
  return `${escapeOrderText(currency.toUpperCase())} ${(Number(amount) / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function renderOrder(order) {
  const orderId = escapeOrderText(String(order._id).slice(-8).toUpperCase());
  const items = (order.items || []).map((item) => `
    <li class="order-item">
      <span>${escapeOrderText(item.name)} <span class="order-item-quantity">× ${escapeOrderText(item.quantity)}</span></span>
      <strong>${formatOrderAmount(item.unitAmount * item.quantity, item.currency)}</strong>
    </li>
  `).join('');

  return `
    <article class="order-card card">
      <div class="order-card-header">
        <div>
          <span class="order-label">Order</span>
          <h2>#${orderId}</h2>
        </div>
        <span class="order-status"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Paid</span>
      </div>
      <p class="order-date">Placed ${escapeOrderText(formatOrderDate(order.paidAt))}</p>
      <ul class="order-items">${items}</ul>
      <div class="order-total">
        <span>Total paid</span>
        <strong>${formatOrderAmount(order.totalAmount, order.currency)}</strong>
      </div>
    </article>
  `;
}

async function loadOrders() {
  try {
    const response = await authFetch('/api/orders');
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Could not load your order history.');
    }

    if (!data.length) {
      ordersContainer.innerHTML = `
        <section class="orders-empty card">
          <i class="fa-solid fa-bag-shopping" aria-hidden="true"></i>
          <h2>No orders yet</h2>
          <p>When you complete a purchase, it will appear here.</p>
          <a class="primary-btn orders-shop-link" href="products.html">Browse products</a>
        </section>
      `;
      return;
    }

    ordersContainer.innerHTML = `<div class="orders-list">${data.map(renderOrder).join('')}</div>`;
  } catch (error) {
    ordersContainer.innerHTML = `<p class="orders-error" role="alert">${escapeOrderText(error.message || 'Could not load your order history.')}</p>`;
    console.error('Could not load order history:', error);
  }
}

if (canAccessOrders) loadOrders();
