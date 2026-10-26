const productList = document.getElementById('productList');
const searchBox = document.getElementById('searchBox');

let allProducts = [];

async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    allProducts = await res.json();
    renderList(allProducts);
  } catch (err) {
    productList.innerHTML = '<p>Could not load products — is the server running?</p>';
    console.error(err);
  }
}

function renderList(products) {
  if (!products.length) {
    productList.innerHTML = '<p>No products found.</p>';
    return;
  }

  productList.innerHTML = products
    .map(
      (p) => `
    <div class="card" style="display:flex; align-items:center; gap:1rem;" data-id="${p._id}">
      <div style="width:70px; height:70px; flex-shrink:0; border-radius:10px; overflow:hidden; background:var(--bg-main); border:1px solid var(--border); display:flex; align-items:center; justify-content:center;">
        ${
          p.imageUrl
            ? `<img src="${p.imageUrl}" alt="${p.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
               <div style="display:none; align-items:center; justify-content:center; width:100%; height:100%; color:var(--warn-high); font-size:0.7rem; text-align:center;">Broken link</div>`
            : `<i class="fa-solid fa-image" style="color:var(--muted);"></i>`
        }
      </div>
      <div style="flex:1; min-width:0;">
        <strong>${p.name}</strong>
        <div style="font-size:0.8rem; color:var(--muted); margin-bottom:0.4rem;">${p.brand} &middot; ${p.category}</div>
        <div style="display:flex; gap:0.5rem;">
          <input type="text" class="image-url-input" placeholder="Paste image URL here..." value="${p.imageUrl || ''}" style="margin:0; flex:1;" />
          <button class="save-btn" data-id="${p._id}">Save</button>
        </div>
        <div class="save-status" style="font-size:0.8rem; margin-top:0.3rem;"></div>
      </div>
    </div>
  `
    )
    .join('');

  document.querySelectorAll('.save-btn').forEach((btn) => {
    btn.addEventListener('click', () => saveImage(btn));
  });
}

async function saveImage(btn) {
  const id = btn.dataset.id;
  const row = btn.closest('.card');
  const input = row.querySelector('.image-url-input');
  const status = row.querySelector('.save-status');
  const imageUrl = input.value.trim();

  status.textContent = 'Saving...';
  status.style.color = 'var(--muted)';

  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });
    const data = await res.json();

    if (!res.ok) {
      status.textContent = data.error || 'Failed to save';
      status.style.color = 'var(--warn-high)';
      return;
    }

    status.textContent = 'Saved ✓';
    status.style.color = 'green';

    // Update the thumbnail preview immediately
    const thumbBox = row.querySelector('div[style*="width:70px"]');
    thumbBox.innerHTML = imageUrl
      ? `<img src="${imageUrl}" alt="${data.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
         <div style="display:none; align-items:center; justify-content:center; width:100%; height:100%; color:var(--warn-high); font-size:0.7rem; text-align:center;">Broken link</div>`
      : `<i class="fa-solid fa-image" style="color:var(--muted);"></i>`;
  } catch (err) {
    status.textContent = 'Network error.';
    status.style.color = 'var(--warn-high)';
    console.error(err);
  }
}

searchBox.addEventListener('input', () => {
  const term = searchBox.value.trim().toLowerCase();
  const filtered = allProducts.filter((p) => p.name.toLowerCase().includes(term));
  renderList(filtered);
});

loadProducts();
