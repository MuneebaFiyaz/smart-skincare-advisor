// Logic for Account and Password Forms
const accountForm = document.getElementById('accountForm');
const accountMessage = document.getElementById('accountMessage');
const passwordForm = document.getElementById('passwordForm');
const passwordMessage = document.getElementById('passwordMessage');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');

async function loadAccount() {
  try {
    const res = await authFetch('/api/profile');
    const user = await res.json();
    if (user) {
        accountForm.name.value = user.name || '';
        accountForm.email.value = user.email || '';
    }
  } catch (err) { console.error(err); }
}

accountForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(accountForm);
  try {
    const res = await authFetch('/api/profile/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formData.get('name'), email: formData.get('email') }),
    });
    if (res.ok) {
        accountMessage.innerHTML = "<p style='color:green; font-weight:600; font-size:0.85rem;'>Profile updated!</p>";
        setTimeout(() => accountMessage.innerHTML = "", 3000);
    }
  } catch (err) { accountMessage.textContent = "Error saving changes."; }
});

passwordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(passwordForm);
  try {
    const res = await authFetch('/api/profile/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: formData.get('currentPassword'),
        newPassword: formData.get('newPassword'),
      }),
    });
    if (res.ok) {
        logout();
    } else {
        passwordMessage.innerHTML = "<p style='color:red; font-size:0.85rem;'>Incorrect current password.</p>";
    }
  } catch (err) { passwordMessage.textContent = "Error updating password."; }
});

deleteAccountBtn.addEventListener('click', async () => {
  if (confirm('Are you sure? This cannot be undone.')) {
    await authFetch('/api/profile', { method: 'DELETE' });
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  }
});

loadAccount();
