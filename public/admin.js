const token = localStorage.getItem('dtp_token');
const userRaw = localStorage.getItem('dtp_user');

if (!token || !userRaw) {
  window.location.href = 'login.html';
}

const user = JSON.parse(userRaw);

if (user.role !== 'admin') {
  alert('Access denied. Admins only.');
  window.location.href = 'index.html';
}

document.getElementById('navUserName').textContent = `${user.name} (Admin)`;

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('dtp_token');
  localStorage.removeItem('dtp_user');
  window.location.href = 'login.html';
});

const authHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

async function loadUsers() {
  const res = await fetch('/api/auth/users', { headers: authHeaders });
  if (res.status === 401 || res.status === 403) return handleAuthError();
  const users = await res.json();

  document.getElementById('statUsers').textContent = users.length;

  const tbody = document.querySelector('#usersTable tbody');
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td><span class="badge ${u.role === 'admin' ? 'priority-High' : 'priority-Low'}">${u.role}</span></td>
      <td>${new Date(u.createdAt).toLocaleDateString()}</td>
    </tr>
  `).join('');
}

async function loadAllDestinations() {
  const [destRes, statsRes] = await Promise.all([
    fetch('/api/destinations?all=true', { headers: authHeaders }),
    fetch('/api/destinations/stats?all=true', { headers: authHeaders })
  ]);
  if (destRes.status === 401 || destRes.status === 403) return handleAuthError();

  const destinations = await destRes.json();
  const stats = await statsRes.json();

  document.getElementById('statTotal').textContent = stats.total;
  document.getElementById('statVisited').textContent = stats.visited;
  document.getElementById('statBudget').textContent = `$${stats.totalBudget.toLocaleString()}`;

  const tbody = document.querySelector('#destTable tbody');
  tbody.innerHTML = destinations.map(d => `
    <tr>
      <td>${d.name}</td>
      <td>${d.owner ? `${d.owner.name} <br><small>${d.owner.email}</small>` : 'Unknown'}</td>
      <td>${d.country}</td>
      <td><span class="badge status-${d.status}">${d.status}</span></td>
      <td>$${(d.estimatedBudget || 0).toLocaleString()}</td>
      <td>${d.targetDate ? new Date(d.targetDate).toLocaleDateString() : '—'}</td>
    </tr>
  `).join('');
}

function handleAuthError() {
  localStorage.removeItem('dtp_token');
  localStorage.removeItem('dtp_user');
  window.location.href = 'login.html';
}

loadUsers();
loadAllDestinations();
