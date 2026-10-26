requireLogin();

const user = getStoredUser();
if (user && user.isAdmin) {
  window.location.href = 'admin-dashboard.html';
}

const profileForm = document.getElementById('profileForm');
const profileMessage = document.getElementById('profileMessage');

function updateProfileSummary(user) {
  const skinType = document.getElementById('profileSkinType');
  const budget = document.getElementById('profileBudget');
  const focusAreas = document.getElementById('profileFocusAreas');
  const concerns = user.concerns || [];

  skinType.textContent = user.skinType
    ? user.skinType.charAt(0).toUpperCase() + user.skinType.slice(1)
    : 'Not set';
  budget.textContent = user.budget ? `LKR ${Number(user.budget).toLocaleString()}` : 'Not set';
  focusAreas.textContent = concerns.length ? concerns.join(', ') : 'Not set';
}

async function loadProfile() {
  try {
    const res = await authFetch('/api/profile');
    const user = await res.json();
    setStoredUser(user);

    profileForm.skinType.value = user.skinType || '';
    profileForm.concerns.value = (user.concerns || []).join(', ');
    profileForm.allergies.value = (user.allergies || []).join(', ');
    profileForm.budget.value = user.budget || '';
    profileForm.fragranceFree.checked = !!user.fragranceFree;
    profileForm.veganOnly.checked = !!user.veganOnly;
    updateProfileSummary(user);
  } catch (err) {
    console.error(err);
  }
}

profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  profileMessage.textContent = '';
  profileMessage.style.color = '';

  const formData = new FormData(profileForm);
  const payload = {
    skinType: formData.get('skinType'),
    concerns: (formData.get('concerns') || '').split(',').map((s) => s.trim()).filter(Boolean),
    allergies: (formData.get('allergies') || '').split(',').map((s) => s.trim()).filter(Boolean),
    budget: formData.get('budget') ? Number(formData.get('budget')) : null,
    fragranceFree: formData.get('fragranceFree') === 'on',
    veganOnly: formData.get('veganOnly') === 'on',
  };

  try {
    const res = await authFetch('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const user = await res.json();

    if (!res.ok) {
      profileMessage.style.color = '#d9534f';
      profileMessage.textContent = user.error || 'Could not save profile';
      return;
    }

    setStoredUser(user);
    updateProfileSummary(user);
    window.location.href = 'index.html';
  } catch (err) {
    profileMessage.style.color = '#d9534f';
    profileMessage.textContent = 'Network error — please check the server is running.';
    console.error(err);
  }
});

loadProfile();
