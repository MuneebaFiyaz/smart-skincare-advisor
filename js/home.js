// shimmering placeholder cards on the homepage.
async function loadFeaturedProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  try {
    const res = await fetch('/api/products');
    const products = await res.json();
    const featured = products.slice(0, 4);

    if (!featured.length) {
      grid.innerHTML = '<p class="home-product-loading">No products are available yet. Please check back soon.</p>';
      return;
    }

    grid.innerHTML = featured
      .map(
        (p) => `
      <div class="product-card">
        ${p.imageUrl
          ? `<img src="${escapeHomeHtml(p.imageUrl)}" alt="${escapeHomeHtml(p.name)}" onerror="this.outerHTML='<div class=\\'product-image-slot\\'>Product image unavailable</div>';" />`
          : '<div class="product-image-slot">Product image coming soon</div>'
        }
        <div class="product-info">
          <span class="category-label">${escapeHomeHtml(p.brand || p.category || 'Skincare')}</span>
          <h3>${escapeHomeHtml(p.name)}</h3>
          <div class="line price" style="background:none; height:auto; animation:none;"><span class="price">LKR ${Number(p.price).toLocaleString()}</span></div>
          <div class="btn-row">
            <button class="home-view-product" data-id="${escapeHomeHtml(p._id)}">View details</button>
            ${isAdminUser()
              ? '<button class="home-view-product" data-id="' + escapeHomeHtml(p._id) + '">View</button>'
              : `<button data-id="${escapeHomeHtml(p._id)}" class="add-cart-btn">Add to bag</button>`}
          </div>
        </div>
      </div>
    `
      )
      .join('');

    grid.querySelectorAll('.home-view-product').forEach((btn) => {
      btn.addEventListener('click', () => {
        window.location.href = `product-detail.html?id=${encodeURIComponent(btn.dataset.id)}`;
      });
    });
    grid.querySelectorAll('.add-cart-btn').forEach((btn) => {
      btn.addEventListener('click', () => addToCartFromHome(btn.dataset.id));
    });
  } catch (err) {
    grid.innerHTML = '<p>Could not load products — is the server running?</p>';
    console.error(err);
  }
}

async function addToCartFromHome(productId) {
  if (!isLoggedIn()) {
    showToast('Please log in to add items to your cart.', { type: 'error' });
    window.location.href = 'login.html';
    return;
  }
  try {
    await authFetch('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    showToast('Added to cart!', { action: { label: 'View Cart', href: 'cart.html' } });
  } catch (err) {
    console.error(err);
    showToast('Could not add to cart.', { type: 'error' });
  }
}

function escapeHomeHtml(value) {
  const element = document.createElement('span');
  element.textContent = String(value ?? '');
  return element.innerHTML;
}

loadFeaturedProducts();
