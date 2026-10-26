const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

const productDetail = document.getElementById('productDetail');
const compareSelect = document.getElementById('compareSelect');
const compareBtn = document.getElementById('compareBtn');
const compareResult = document.getElementById('compareResult');

let currentProduct = null;

async function loadProduct() {
  if (!productId) {
    productDetail.innerHTML = '<p>No product specified.</p>';
    return;
  }

  try {
    const res = await fetch(`/api/products/${productId}`);
    if (!res.ok) {
      productDetail.innerHTML = '<p>Product not found.</p>';
      return;
    }
    currentProduct = await res.json();
    renderProduct(currentProduct);
    loadCompareOptions();
  } catch (err) {
    productDetail.innerHTML = '<p>Could not load product — is the server running?</p>';
    console.error(err);
  }
}

function renderProduct(p) {
  productDetail.innerHTML = `
    ${p.imageUrl
      ? `<img src="${p.imageUrl}" alt="${p.name}" style="width:100%; max-width:400px; display:block; margin:0 auto 1.2rem; border-radius:14px;" onerror="this.outerHTML='<div class=\\'product-image-slot large\\'><i class=\\'fa-solid fa-image\\'></i>Add image</div>';" />`
      : `<div class="product-image-slot large"><i class="fa-solid fa-image"></i>Add image</div>`
    }
    <h2>${p.name}</h2>
    <div class="tags">${p.brand}</div>
    <div class="price" style="font-size:1.2rem; margin:0.5rem 0;">LKR ${p.price}</div>
    <p>${p.description || ''}</p>
    <p><strong>Category:</strong> ${p.category}</p>
    <p><strong>Suitable for:</strong> ${p.suitableSkinTypes.join(', ') || 'Any skin type'}</p>
    <p><strong>Targets:</strong> ${p.targetsConcerns.join(', ') || '—'}</p>
    <p><strong>Ingredients:</strong> ${p.ingredients.join(', ')}</p>
    <p><strong>Fragrance-free:</strong> ${p.fragranceFree ? 'Yes' : 'No'} &nbsp;
       <strong>Vegan:</strong> ${p.vegan ? 'Yes' : 'No'}</p>
    ${isAdminUser() ? '<span class="category-label">View only</span>' : '<button id="addCartBtn">Add to Cart</button>'}
  `;
  const addCartBtn = document.getElementById('addCartBtn');
  if (addCartBtn) addCartBtn.addEventListener('click', addToCart);
}

async function addToCart() {
  if (!isLoggedIn()) {
    alert('Please log in to add items to your cart.');
    window.location.href = 'login.html';
    return;
  }
  try {
    await authFetch('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    showToast(`${currentProduct && currentProduct.name ? currentProduct.name + ' added to cart' : 'Added to cart'}`, { action: { label: 'View Cart', href: 'cart.html' } });
    updateCartBadge();
  } catch (err) {
    console.error(err);
  }
}

async function loadCompareOptions() {
  try {
    const res = await fetch('/api/products');
    const products = await res.json();
    const others = products.filter((p) => p._id !== productId);

    compareSelect.innerHTML =
      '<option value="">Select a product...</option>' +
      others.map((p) => `<option value="${p._id}">${p.name}</option>`).join('');
  } catch (err) {
    console.error(err);
  }
}

compareBtn.addEventListener('click', async () => {
  const otherId = compareSelect.value;
  if (!otherId) {
    compareResult.innerHTML = '<p>Please select a product to compare.</p>';
    return;
  }

  try {
    const res = await fetch('/api/compatibility/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds: [productId, otherId] }),
    });
    const data = await res.json();

    compareResult.innerHTML = renderCompatibilityMatches(
      data.conflicts,
      'No known conflicts between these products. ✅'
    );
    if (data.notes && data.notes.length) {
      compareResult.innerHTML += renderCompatibilityMatches(data.notes);
    }
  } catch (err) {
    compareResult.innerHTML = '<p>Could not check compatibility.</p>';
    console.error(err);
  }
});

loadProduct();
