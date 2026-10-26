const productGrid = document.getElementById('productGrid');
const productSearch = document.getElementById('productSearch');
const categoryFilter = document.getElementById('categoryFilter');
const skinTypeFilter = document.getElementById('skinTypeFilter');
const priceFilter = document.getElementById('priceFilter');
const brandFilter = document.getElementById('brandFilter');
const sortFilter = document.getElementById('sortFilter');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const categoryButtons = document.querySelectorAll('.category-filter-btn');

const urlParams = new URLSearchParams(window.location.search);
const initialCategory = urlParams.get('category');
const initialSearch = urlParams.get('q');
if (initialCategory) categoryFilter.value = initialCategory;
if (initialSearch) productSearch.value = initialSearch;

function syncCategoryButtons() {
  categoryButtons.forEach((button) => {
    const isActive = button.dataset.category === categoryFilter.value;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

syncCategoryButtons();

function applyPriceRange(products) {
  const value = priceFilter.value;
  if (!value) return products;

  const [min, max] = value.split('-').map(Number);
  return products.filter((product) => {
    if (product.price < min) return false;
    if (max && product.price > max) return false;
    return true;
  });
}

function applySorting(products) {
  const sortedProducts = [...products];
  switch (sortFilter.value) {
    case 'price-low':
      sortedProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      sortedProducts.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      break;
  }
  return sortedProducts;
}

function populateBrandOptions(products) {
  const brands = [...new Set(products.map((product) => product.brand).filter(Boolean))].sort();
  const currentBrand = brandFilter.value;

  brandFilter.innerHTML = '<option value="">All brands</option>' +
    brands.map((brand) => `<option value="${brand}">${brand}</option>`).join('');

  if (currentBrand && brands.includes(currentBrand)) {
    brandFilter.value = currentBrand;
  } else {
    brandFilter.value = '';
  }
}

async function loadProducts() {
  const params = new URLSearchParams();

  const searchTerm = (productSearch.value || '').trim();
  if (searchTerm) params.set('search', searchTerm);
  if (categoryFilter.value) params.set('category', categoryFilter.value);
  if (skinTypeFilter.value) params.set('skinType', skinTypeFilter.value);
  if (brandFilter.value) params.set('brand', brandFilter.value);

  const [minPrice, maxPrice] = String(priceFilter.value || '').split('-').map((val) => Number(val));
  if (!Number.isNaN(minPrice) && minPrice > 0) params.set('minPrice', String(minPrice));
  if (!Number.isNaN(maxPrice) && maxPrice > 0) params.set('maxPrice', String(maxPrice));

  const url = params.toString() ? `/api/products?${params.toString()}` : '/api/products';

  try {
    const res = await fetch(url);
    const products = await res.json();
    populateBrandOptions(products);
    renderProducts(applySorting(applyPriceRange(products)));
  } catch (err) {
    productGrid.innerHTML = '<p>Could not load products — is the server running?</p>';
    console.error(err);
  }
}

function renderProducts(products) {
  if (!products.length) {
    productGrid.innerHTML = '<p>No products found.</p>';
    return;
  }

  productGrid.innerHTML = products
    .map(
      (p) => `
    <div class="card product-card">
      <a href="product-detail.html?id=${p._id}" style="text-decoration:none; color:inherit;">
        ${p.imageUrl
          ? `<img src="${p.imageUrl}" alt="${p.name}" style="width:100%; height:150px; object-fit:cover; border-radius:10px; margin-bottom:0.6rem;" onerror="this.outerHTML='<div class=\\'product-image-slot\\'><i class=\\'fa-solid fa-image\\'></i>Add image</div>';" />`
          : `<div class="product-image-slot"><i class="fa-solid fa-image"></i>Add image</div>`
        }
        <span class="category-label">${p.brand}</span>
        <h3>${p.name}</h3>
        <div class="price">LKR ${p.price}</div>
      </a>
      ${isAdminUser()
        ? `<a href="product-detail.html?id=${p._id}" class="product-view-btn"><i class="fa-solid fa-eye" aria-hidden="true"></i> View</a>`
        : `<button data-id="${p._id}" data-name="${p.name}" class="add-cart-btn">Add to Cart</button>`}
    </div>
  `
    )
    .join('');

  document.querySelectorAll('.add-cart-btn').forEach((btn) => {
    btn.addEventListener('click', () => addToCart(btn.dataset.id, btn.dataset.name));
  });
}

async function addToCart(productId, productName) {
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
    showToast(`${productName ? productName + ' added to cart' : 'Added to cart'}`, { action: { label: 'View Cart', href: 'cart.html' } });
    updateCartBadge();
  } catch (err) {
    console.error(err);
  }
}

function clearFilters() {
  productSearch.value = '';
  categoryFilter.value = '';
  syncCategoryButtons();
  skinTypeFilter.value = '';
  priceFilter.value = '';
  brandFilter.value = '';
  sortFilter.value = 'featured';
  loadProducts();
}

productSearch.addEventListener('input', loadProducts);
categoryFilter.addEventListener('change', () => {
  syncCategoryButtons();
  loadProducts();
});
categoryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    categoryFilter.value = button.dataset.category;
    categoryFilter.dispatchEvent(new Event('change'));
  });
});
skinTypeFilter.addEventListener('change', loadProducts);
priceFilter.addEventListener('change', loadProducts);
brandFilter.addEventListener('change', loadProducts);
sortFilter.addEventListener('change', loadProducts);
clearFiltersBtn.addEventListener('click', clearFilters);

loadProducts();
