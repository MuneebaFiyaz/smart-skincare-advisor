requireAdminAccess();

const tabButtons = document.querySelectorAll('.admin-tab-btn');
const tabPanels = document.querySelectorAll('.admin-tab-panel');

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    tabPanels.forEach((p) => (p.style.display = 'none'));
    document.getElementById(`tab-${btn.dataset.tab}`).style.display = 'block';

    if (btn.dataset.tab === 'users') loadUsers();
    if (btn.dataset.tab === 'products') loadProducts();
  });
});

// ---------------- Overview ----------------
let overviewChart;

function renderDashboardCharts(data) {
  const overviewCanvas = document.getElementById('overviewChart');
  if (!overviewCanvas) return;

  if (typeof Chart === 'undefined') {
    overviewCanvas.parentElement.innerHTML = '<p>Charts could not load. Check your internet connection and reload.</p>';
    return;
  }

  overviewChart?.destroy();
  overviewChart = new Chart(overviewCanvas, {
    type: 'bar',
    data: {
      labels: ['Registered users', 'Admins', 'Products', 'Active carts'],
      datasets: [{
        label: 'Total',
        data: [data.userCount, data.adminCount, data.productCount, data.activeCartCount],
        backgroundColor: ['#8a9a7e', '#b98d7d', '#d9b35f', '#7195a8'],
        borderRadius: 6,
        maxBarThickness: 42,
      }],
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0, color: '#6f6a63' }, grid: { color: '#eee6dc' } },
        y: { ticks: { color: '#2f3a3d' }, grid: { display: false } },
      },
    },
  });
}

async function loadStats() {
  const statGrid = document.getElementById('statGrid');
  const categoryBreakdown = document.getElementById('categoryBreakdown');

  try {
    const res = await authFetch('/api/admin/stats');
    const data = await res.json();

    if (!res.ok) {
      statGrid.innerHTML = `<p>${data.error || 'Could not load stats'}</p>`;
      return;
    }

    statGrid.innerHTML = `
      <div class="admin-stat-card"><div class="stat-label">Registered Users</div><div class="stat-value">${data.userCount}</div></div>
      <div class="admin-stat-card"><div class="stat-label">Admins</div><div class="stat-value">${data.adminCount}</div></div>
      <div class="admin-stat-card"><div class="stat-label">Products</div><div class="stat-value">${data.productCount}</div></div>
      <div class="admin-stat-card"><div class="stat-label">Active Carts</div><div class="stat-value">${data.activeCartCount}</div></div>
      <div class="admin-stat-card"><div class="stat-label">Total Cart Value</div><div class="stat-value">LKR ${data.totalCartValue.toLocaleString()}</div></div>
    `;

    renderDashboardCharts(data);

    if (data.categoryBreakdown && data.categoryBreakdown.length) {
      const categories = [...data.categoryBreakdown].sort((a, b) => b.count - a.count);
      const total = categories.reduce((sum, category) => sum + Number(category.count || 0), 0);
      const palette = ['#b98d7d', '#8a9a7e', '#d9b35f', '#7195a8', '#c77b66', '#8b8178'];
      categoryBreakdown.innerHTML = categories
        .map((category, index) => {
          const share = total ? Math.round((category.count / total) * 100) : 0;
          const name = category._id || 'Uncategorized';
          return `
            <div class="category-breakdown-row" style="--category-color:${palette[index % palette.length]}; --category-share:${share}%">
              <span class="category-breakdown-name">${name}</span>
              <div class="category-breakdown-track" role="img" aria-label="${share}% of products">
                <span class="category-breakdown-fill"></span>
              </div>
              <span class="category-breakdown-count">${category.count} <small>${share}%</small></span>
              <a class="category-products-btn" href="products.html?category=${encodeURIComponent(category._id)}">View</a>
            </div>
          `;
        })
        .join('');
    } else {
      categoryBreakdown.innerHTML = '<p>No products yet.</p>';
    }
  } catch (err) {
    statGrid.innerHTML = '<p>Could not load stats — is the server running?</p>';
    console.error(err);
  }
}

// ---------------- Users ----------------
async function loadUsers() {
  const tbody = document.querySelector('#usersTable tbody');
  tbody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';

  try {
    const res = await authFetch('/api/admin/users');
    const users = await res.json();

    if (!res.ok) {
      tbody.innerHTML = `<tr><td colspan="6">${users.error || 'Could not load users'}</td></tr>`;
      return;
    }

    if (!users.length) {
      tbody.innerHTML = '<tr><td colspan="6">No users yet.</td></tr>';
      return;
    }

    const me = getStoredUser();

    tbody.innerHTML = users
      .map((u) => `
        <tr>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.skinType || '\u2014'}</td>
          <td><span class="admin-badge ${u.isAdmin ? 'admin' : 'user'}">${u.isAdmin ? 'Admin' : 'User'}</span></td>
          <td>${new Date(u.createdAt).toLocaleDateString()}</td>
          <td style="white-space:nowrap;">
            ${
              me && me.id === u._id
                ? '<span style="font-size:0.78rem; color:var(--muted);">(you)</span>'
                : `
              <button class="admin-action-btn toggle-admin-btn" data-id="${u._id}" data-current="${u.isAdmin}">
                ${u.isAdmin ? 'Revoke Admin' : 'Make Admin'}
              </button>
              <button class="admin-action-btn delete-user-btn" data-id="${u._id}" style="background:#d9534f;">Delete</button>
            `
            }
          </td>
        </tr>
      `)
      .join('');

    document.querySelectorAll('.toggle-admin-btn').forEach((btn) => {
      btn.addEventListener('click', () => toggleAdmin(btn.dataset.id, btn.dataset.current !== 'true'));
    });
    document.querySelectorAll('.delete-user-btn').forEach((btn) => {
      btn.addEventListener('click', () => deleteUser(btn.dataset.id));
    });
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6">Could not load users.</td></tr>';
    console.error(err);
  }
}

async function toggleAdmin(userId, makeAdmin) {
  try {
    const res = await authFetch(`/api/admin/users/${userId}/admin`, {
      method: 'PUT',
      body: JSON.stringify({ isAdmin: makeAdmin }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Could not update admin status');
      return;
    }
    loadUsers();
  } catch (err) {
    alert('Network error.');
    console.error(err);
  }
}

async function deleteUser(userId) {
  if (!confirm('Permanently delete this user and their cart? This cannot be undone.')) return;
  try {
    const res = await authFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Could not delete user');
      return;
    }
    loadUsers();
    loadStats();
  } catch (err) {
    alert('Network error.');
    console.error(err);
  }
}

// ---------------- Products ----------------
let allAdminProducts = [];
const productForm = document.getElementById('productForm');
const productIdInput = document.getElementById('productId');
const productSubmitBtn = document.getElementById('productSubmitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

function parseArrayValue(value) {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function resetProductForm() {
  productForm.reset();
  productIdInput.value = '';
  productSubmitBtn.textContent = 'Save Product';
  cancelEditBtn.style.display = 'none';
}

function fillProductForm(product) {
  const formData = new FormData(productForm);
  formData.set('name', product.name || '');
  formData.set('brand', product.brand || '');
  formData.set('price', product.price ?? '');
  formData.set('category', product.category || 'cleanser');
  formData.set('ingredients', (product.ingredients || []).join(', '));
  formData.set('skinTypes', (product.suitableSkinTypes || []).join(', '));
  formData.set('concerns', (product.targetsConcerns || []).join(', '));
  formData.set('description', product.description || '');
  formData.set('imageUrl', product.imageUrl || '');
  productForm.elements.fragranceFree.checked = !!product.fragranceFree;
  productForm.elements.vegan.checked = !!product.vegan;

  productIdInput.value = product._id;
  productSubmitBtn.textContent = 'Update Product';
  cancelEditBtn.style.display = 'inline-block';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadProducts() {
  const tbody = document.querySelector('#productsTable tbody');
  tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

  try {
    const res = await fetch('/api/products');
    allAdminProducts = await res.json();
    renderProductsTable(allAdminProducts);
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5">Could not load products.</td></tr>';
    console.error(err);
  }
}

function renderProductsTable(products) {
  const tbody = document.querySelector('#productsTable tbody');

  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="5">No products found.</td></tr>';
    return;
  }

  tbody.innerHTML = products
    .map((p) => `
      <tr>
        <td>${p.name}</td>
        <td>${p.brand}</td>
        <td style="text-transform:capitalize;">${p.category}</td>
        <td>${p.price}</td>
        <td style="white-space:nowrap;">
          <button class="admin-action-btn edit-product-btn" data-id="${p._id}" style="margin-right:0.4rem;">Edit</button>
          <button class="admin-action-btn delete-product-btn" data-id="${p._id}" style="background:#d9534f;">Delete</button>
        </td>
      </tr>
    `)
    .join('');

  document.querySelectorAll('.edit-product-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const product = allAdminProducts.find((item) => item._id === btn.dataset.id);
      if (product) fillProductForm(product);
    });
  });

  document.querySelectorAll('.delete-product-btn').forEach((btn) => {
    btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
  });
}

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(productForm);
  const payload = {
    name: formData.get('name')?.trim(),
    brand: formData.get('brand')?.trim(),
    price: Number(formData.get('price')),
    category: formData.get('category'),
    ingredients: parseArrayValue(formData.get('ingredients')),
    suitableSkinTypes: parseArrayValue(formData.get('skinTypes')),
    targetsConcerns: parseArrayValue(formData.get('concerns')),
    description: formData.get('description')?.trim() || '',
    imageUrl: formData.get('imageUrl')?.trim() || '',
    fragranceFree: !!formData.get('fragranceFree'),
    vegan: !!formData.get('vegan'),
  };

  if (!payload.name || !payload.brand || !payload.category || Number.isNaN(payload.price)) {
    alert('Please fill in all required product fields.');
    return;
  }

  try {
    const isEdit = !!productIdInput.value;
    const res = await authFetch(isEdit ? `/api/products/${productIdInput.value}` : '/api/products', {
      method: isEdit ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Could not save product');
      return;
    }

    showToast(isEdit ? 'Product updated.' : 'Product created.');
    resetProductForm();
    loadProducts();
    loadStats();
  } catch (err) {
    alert('Network error while saving the product.');
    console.error(err);
  }
});

cancelEditBtn.addEventListener('click', resetProductForm);

async function deleteProduct(productId) {
  if (!confirm('Permanently delete this product? This cannot be undone.')) return;
  try {
    const res = await authFetch(`/api/products/${productId}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Could not delete product');
      return;
    }
    if (productIdInput.value === productId) resetProductForm();
    loadProducts();
    loadStats();
  } catch (err) {
    alert('Network error.');
    console.error(err);
  }
}

document.getElementById('productSearchBox').addEventListener('input', (e) => {
  const term = e.target.value.trim().toLowerCase();
  renderProductsTable(allAdminProducts.filter((p) => p.name.toLowerCase().includes(term)));
});

// ---------------- Carts ----------------
async function loadCarts() {
  const container = document.getElementById('cartsList');
  container.innerHTML = '<p>Loading...</p>';

  try {
    const res = await authFetch('/api/admin/carts');
    const carts = await res.json();

    if (!res.ok) {
      container.innerHTML = `<p>${carts.error || 'Could not load carts'}</p>`;
      return;
    }

    const nonEmpty = carts.filter((c) => c.items.length > 0);

    if (!nonEmpty.length) {
      container.innerHTML = '<p>No active carts right now.</p>';
      return;
    }

    container.innerHTML = nonEmpty
      .map((cart) => {
        const total = cart.items.reduce((sum, i) => sum + (i.product ? i.product.price * i.quantity : 0), 0);
        const owner = cart.user ? `${cart.user.name} (${cart.user.email})` : 'Unknown user';
        const itemLines = cart.items
          .map((i) => `<div class="routine-step"><span>${i.product ? i.product.name : 'Deleted product'} &times; ${i.quantity}</span><span>LKR ${i.product ? i.product.price * i.quantity : 0}</span></div>`)
          .join('');

        return `
          <div class="card" style="margin-bottom:1rem;">
            <strong>${owner}</strong>
            ${itemLines}
            <p style="text-align:right; margin-top:0.5rem;"><strong>Total: LKR ${total}</strong></p>
          </div>
        `;
      })
      .join('');
  } catch (err) {
    container.innerHTML = '<p>Could not load carts.</p>';
    console.error(err);
  }
}

loadStats();
