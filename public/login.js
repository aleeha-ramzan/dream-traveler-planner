const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authError = document.getElementById('authError');

// If already logged in, go straight to the planner
if (localStorage.getItem('dtp_token')) {
  window.location.href = 'index.html';
}

loginTab.addEventListener('click', () => {
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
  loginForm.style.display = 'flex';
  registerForm.style.display = 'none';
  authError.textContent = '';
});

registerTab.addEventListener('click', () => {
  registerTab.classList.add('active');
  loginTab.classList.remove('active');
  registerForm.style.display = 'flex';
  loginForm.style.display = 'none';
  authError.textContent = '';
});

function showError(msg) {
  authError.textContent = msg;
}

function saveSessionAndRedirect(data) {
  localStorage.setItem('dtp_token', data.token);
  localStorage.setItem('dtp_user', JSON.stringify(data.user));
  window.location.href = 'index.html';
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.textContent = '';
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) return showError(data.error || 'Login failed.');
    saveSessionAndRedirect(data);
  } catch (err) {
    showError('Network error. Is the server running?');
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.textContent = '';
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) return showError(data.error || 'Registration failed.');
    saveSessionAndRedirect(data);
  } catch (err) {
    showError('Network error. Is the server running?');
  }
});
