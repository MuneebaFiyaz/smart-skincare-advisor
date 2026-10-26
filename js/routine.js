const routineContainer = document.getElementById('routineContainer');
const warningsContainer = document.getElementById('warningsContainer');
const recommendationsContainer = document.getElementById('recommendationsContainer');
const clearRoutineBtn = document.getElementById('clearRoutineBtn'); // New button

function renderStoredResult() {
  const raw = localStorage.getItem('ssa_last_result');
  
  // If no data exists, show the "No routine" message and hide the reset button
  if (!raw) {
    routineContainer.innerHTML = '<p>No routine generated yet. Go to <a href="chatbot.html">Consultation</a> first.</p>';
    if (clearRoutineBtn) clearRoutineBtn.style.display = 'none';
    return;
  }

  const data = JSON.parse(raw);
  const { routine, recommendations } = data;

  // 1. Render Routine steps
  if (routine && routine.steps && routine.steps.length) {
      // Use times provided by the routine generator (server). Fallback to
      // conservative defaults if the server doesn't include times.
      const DEFAULT_MAP = {
        cleanser: ['morning', 'night'],
        treatment: ['night'],
        moisturizer: ['morning', 'night'],
        sunscreen: ['morning', 'day'],
      };

      const sections = { morning: [], day: [], night: [] };
      routine.steps.forEach((s) => {
        const times = Array.isArray(s.times) && s.times.length ? s.times : (DEFAULT_MAP[s.step] || []);
        times.forEach((t) => sections[t].push(s));
      });

    const renderSection = (title, items) => {
      if (!items || !items.length) return '';
      return `
        <div class="routine-section">
          <h3 style="margin:0 0 8px 0;">${title}</h3>
          ${items
            .map(
              (it) => `
            <div class="routine-step" style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #f0f0f0;">
              <div>
                <div class="step-label" style="font-size:0.7rem; color:#aaa; text-transform:uppercase; font-weight:700;">${it.displayName || it.step}</div>
                <strong style="font-size:1rem; color:#333;">${it.product.name}</strong>
                ${it.usage ? `<div style="font-size:0.82rem; color:var(--muted); margin-top:6px;">${it.usage}</div>` : ''}
              </div>
              <div style="display:flex; flex-direction:column; gap:8px; align-items:flex-end;">
                <div style="font-weight:600;">LKR ${it.product.price}</div>
                <div class="routine-actions">
                  <button class="view-btn" data-id="${it.product._id}">View</button>
                  ${isAdminUser() ? '' : `<button class="add-btn" data-id="${it.product._id}" data-name="${it.product.name}">Add to Cart</button>`}
                </div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    };

    routineContainer.innerHTML = '';
    routineContainer.innerHTML += renderSection('Morning', sections.morning);
    routineContainer.innerHTML += renderSection('Day', sections.day);
    routineContainer.innerHTML += renderSection('Night', sections.night);

    // Attach handlers for view and add buttons inside the routine sections
    routineContainer.querySelectorAll('.view-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (id) window.location.href = `product-detail.html?id=${id}`;
      });
    });

    routineContainer.querySelectorAll('.add-btn').forEach((btn) => {
      btn.addEventListener('click', () => addToCart(btn.dataset.id, btn.dataset.name));
    });
  }

  // 2. Render Warnings & Synergies
  const warnings = (routine && routine.warnings) || [];
  const notes = (routine && routine.synergiesAndReminders) || [];

  warningsContainer.innerHTML = renderCompatibilityMatches(
    warnings,
    'No conflicts detected in your routine. ✅'
  );

  if (notes.length) {
    warningsContainer.innerHTML += renderCompatibilityMatches(notes);
  }

  // 3. Render Recommended Products
  if (recommendations && recommendations.length) {
    recommendationsContainer.innerHTML = recommendations
      .map(
        (r) => `
      <div class="card product-card">
        <a href="product-detail.html?id=${r.product._id}" style="text-decoration:none; color:inherit;">
          ${r.product.imageUrl
            ? `<img src="${r.product.imageUrl}" alt="${r.product.name}" style="width:100%; height:130px; object-fit:cover; border-radius:10px; margin-bottom:0.5rem;" />`
            : `<div class="product-image-slot"><i class="fa-solid fa-image"></i></div>`
          }
          <h3 style="margin: 10px 0 5px 0; font-size: 1rem;">${r.product.name}</h3>
          <div class="price" style="color: #eb9981; font-weight: 700;">LKR ${r.product.price}</div>
        </a>
        <p style="color: #777; margin: 10px 0;">${r.reasons.join('; ')}</p>
        ${isAdminUser()
          ? `<a href="product-detail.html?id=${r.product._id}" class="product-view-btn" style="width:100%;"><i class="fa-solid fa-eye" aria-hidden="true"></i> View</a>`
          : `<button data-id="${r.product._id}" data-name="${r.product.name}" class="add-cart-btn" style="width: 100%; background: #eb9981; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: 600;">Add to Cart</button>`}
      </div>
    `
      )
      .join('');

    document.querySelectorAll('.add-cart-btn').forEach((btn) => {
      btn.addEventListener('click', () => addToCart(btn.dataset.id, btn.dataset.name));
    });
  }
}

// Logic to clear the routine
if (clearRoutineBtn) {
    clearRoutineBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear this routine and start a new consultation?")) {
            localStorage.removeItem('ssa_last_result'); // This deletes the data
            location.reload(); // Refresh the page to show empty state
        }
    });
}

async function addToCart(productId, productName) {
  if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
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
    if (typeof updateCartBadge === 'function') updateCartBadge();
  } catch (err) {
    console.error(err);
  }
}

renderStoredResult();