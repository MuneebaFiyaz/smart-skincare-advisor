const signupForm = document.getElementById('signupForm');
const signupError = document.getElementById('signupError'); // This is our message box

if (isLoggedIn()) {
  window.location.href = 'profile.html';
}

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Reset message state
  signupError.textContent = '';
  signupError.className = 'signup-message'; 

  const formData = new FormData(signupForm);
  const payload = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  };

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    const data = await res.json();

    if (!res.ok) {
      // SHOW FAIL MESSAGE
      signupError.textContent = data.error || 'Sign up failed';
      signupError.classList.add('error');
      return;
    }

    // SHOW SUCCESS MESSAGE
    signupError.textContent = "Account created successfully! Redirecting...";
    signupError.classList.add('success');

    // Save tokens
    setToken(data.token);
    setStoredUser(data.user);
    clearChatState();

    // DELAY REDIRECT: Wait 2 seconds so they can see the success message
    setTimeout(() => {
        window.location.href = 'chatbot.html';
    }, 2000);

  } catch (err) {
    // SHOW NETWORK ERROR
    signupError.textContent = 'Network error — please check your connection.';
    signupError.classList.add('error');
    console.error(err);
  }
});