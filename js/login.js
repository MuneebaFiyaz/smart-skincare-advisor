const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

// Returning users should go straight to the home page.
if (isLoggedIn()) {
  window.location.href = 'index.html';
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  loginError.className = 'signup-message';

  const formData = new FormData(loginForm);
  const payload = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      loginError.textContent = data.error || 'Login failed';
      loginError.classList.add('error');
      return;
    }

    setToken(data.token);
    setStoredUser(data.user);
    clearChatState();

    loginError.textContent = `Login successful, welcome back ${data.user?.name || 'friend'}!`;
    loginError.classList.add('success');

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  } catch (err) {
    loginError.textContent = 'Network error — please check the server is running.';
    loginError.classList.add('error');
    console.error(err);
  }
});

const googleBtn = document.querySelector('.google-btn');
const facebookBtn = document.querySelector('.facebook-btn');

function showSocialLoginMessage(provider) {
  loginError.textContent = `${provider} sign-in is not enabled in this demo. Please use your email and password.`;
  loginError.className = 'signup-message error';
}

googleBtn?.addEventListener('click', () => showSocialLoginMessage('Google'));
facebookBtn?.addEventListener('click', () => showSocialLoginMessage('Facebook'));
