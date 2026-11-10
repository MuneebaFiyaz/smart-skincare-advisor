//   Token storage  
function getToken() {
  return localStorage.getItem('ssa_token');
}
function setToken(token) {
  localStorage.setItem('ssa_token', token);
}
function clearToken() {
  localStorage.removeItem('ssa_token');
  localStorage.removeItem('ssa_user');
  localStorage.removeItem('ssa_chat_history');
  localStorage.removeItem('ssa_last_result');
}

function clearChatState() {
  localStorage.removeItem('ssa_chat_history');
  localStorage.removeItem('ssa_last_result');
}

function getStoredUser() {
  const raw = localStorage.getItem('ssa_user');
  return raw ? JSON.parse(raw) : null;
}
function setStoredUser(user) {
  localStorage.setItem('ssa_user', JSON.stringify(user));
}

function isLoggedIn() {
  return !!getToken();
}

function isAdminUser() {
  const user = getStoredUser();
  return !!(user && user.isAdmin);
}

function logout() {
  clearToken();
  window.location.href = 'login.html';
}

async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.href = 'login.html';
    throw new Error('Not authenticated');
  }

  return res;
}

//Redirects to login if not authenticated  call at the top of pages that require login
function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

function requireUserCartAccess() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }

  const user = getStoredUser();
  if (user && user.isAdmin) {
    window.location.href = 'admin-dashboard.html';
    return false;
  }

  return true;
}

//Redirects away if the logged-in user isn't an admin call at the top of admin pages
function requireAdminAccess() {
  requireLogin();
  const user = getStoredUser();
  if (!user || !user.isAdmin) {
    window.location.href = 'index.html';
  }
}

//Renders the right-side nav links depending on login state.
function renderAuthNav() {
  const slot = document.getElementById('navAuthLinks');
  if (!slot) return;

  const currentUser = getStoredUser();
  document.querySelectorAll('a[href="cart.html"]').forEach((cartLink) => {
    cartLink.style.display = currentUser && currentUser.isAdmin ? 'none' : '';
  });
  document.querySelectorAll('a[href="orders.html"]').forEach((ordersLink) => {
    ordersLink.style.display = currentUser && currentUser.isAdmin ? 'none' : '';
  });

  if (isLoggedIn()) {
    const user = currentUser;
    const profileTarget = user && user.isAdmin ? 'admin-dashboard.html' : 'profile.html';
    const profileLabel = user && user.isAdmin ? 'Admin' : (user ? user.name : 'Profile');
    slot.innerHTML = `
      <span class="nav-auth-links">
        ${user && !user.isAdmin ? '<a href="orders.html">Your Orders</a>' : ''}
        <a href="settings.html">Settings</a>
        <a href="#" id="logoutLink">Logout</a>
        <a href="${profileTarget}" class="nav-btn">${profileLabel}</a>
      </span>
    `;
    document.getElementById('logoutLink').addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  } else {
    slot.innerHTML = `
      <span class="nav-auth-links">
        <a href="login.html">Login</a>
        <a href="signup.html" class="nav-btn">Sign Up</a>
      </span>
    `;
  }
}

document.addEventListener('DOMContentLoaded', renderAuthNav);

function addBackButton() {
  if (document.body.classList.contains('home-page')) return;

  const main = document.querySelector('main');
  if (!main || main.querySelector('.site-back-btn')) return;

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'site-back-btn secondary-btn';
  backButton.innerHTML = '<i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Back';
  backButton.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'index.html';
    }
  });
  main.insertBefore(backButton, main.firstChild);
}

document.addEventListener('DOMContentLoaded', addBackButton);

function showToast(message, opts = {}) {
  const { type = 'success', duration = 3000, action } = opts;
  const toast = document.createElement('div');
  toast.className = `site-toast ${type}`;
  const text = document.createElement('span');
  text.className = 'site-toast-text';
  text.textContent = message;
  toast.appendChild(text);

  if (action && (action.href || action.onClick)) {
    const act = document.createElement('button');
    act.className = 'site-toast-action';
    act.type = 'button';
    act.textContent = action.label || 'Action';
    act.addEventListener('click', (e) => {
      e.preventDefault();
      if (action.onClick) return action.onClick();
      if (action.href) window.location.href = action.href;
    });
    toast.appendChild(act);
  }

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Update the cart item count 
async function updateCartBadge() {
  const cartLink = document.querySelector('.nav-icons a[href="cart.html"]');
  if (!cartLink) return;
  // Ensure badge element exists
  let badge = cartLink.querySelector('.cart-count-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'cart-count-badge';
    cartLink.appendChild(badge);
  }

  if (!isLoggedIn()) {
    badge.style.display = 'none';
    return;
  }

  try {
    const res = await authFetch('/api/cart');
    const cart = await res.json();
    const count = (cart.items || []).reduce((sum, it) => sum + (it.quantity || 0), 0);
    badge.textContent = count > 0 ? String(count) : '';
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  } catch (err) {
    console.error('Could not update cart badge', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderAuthNav();
  updateCartBadge();
});
