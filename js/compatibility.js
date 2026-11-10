const productChecklist = document.getElementById('productChecklist');
const checkBtn = document.getElementById('checkBtn');
const resultArea = document.getElementById('resultArea');
const resultContent = document.getElementById('resultContent');

// Load products into the checklist
async function loadProductChecklist() {
  try {
    const res = await fetch('/api/products');
    const products = await res.json();

    if (!products || !products.length) {
      productChecklist.innerHTML = '<p>No products available.</p>';
      return;
    }

    productChecklist.innerHTML = products
      .map(
        (p) => `
      <div class="checkbox-row" style="margin-bottom: 8px; display: flex; align-items: center; gap: 10px;">
        <input type="checkbox" value="${p._id}" id="prod_${p._id}" class="product-checkbox" />
        <label for="prod_${p._id}" style="cursor:pointer;">
            ${p.name} <span style="color:var(--muted); font-weight:400; font-size: 0.85rem;">(${p.category})</span>
        </label>
      </div>
    `
      )
      .join('');
  } catch (err) {
    productChecklist.innerHTML = '<p>Could not load products.</p>';
    console.error(err);
  }
}

checkBtn.addEventListener('click', async () => {
  const selected = Array.from(document.querySelectorAll('.product-checkbox:checked')).map((el) => el.value);

  // Show the right column as soon as they click
  resultArea.style.display = 'block';

  if (selected.length < 2) {
    resultContent.innerHTML = '<p style="color: #d9534f;">Please select at least two products to compare.</p>';
    return;
  }

  resultContent.innerHTML = '<p>Checking ingredients...</p>';

  try {
    const res = await fetch('/api/compatibility/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds: selected }),
    });
    const data = await res.json();

    // Clear previous and render matches
    let html = renderCompatibilityMatches(
      data.conflicts,
      'No known conflicts among the selected products. ✅'
    );

    if (data.notes && data.notes.length) {
      html += '<hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">';
      html += renderCompatibilityMatches(data.notes);
    }

    resultContent.innerHTML = html;

  } catch (err) {
    resultContent.innerHTML = '<p>Could not check compatibility — is the server running?</p>';
    console.error(err);
  }
});

loadProductChecklist();
