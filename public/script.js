const API = '/api/destinations';

// ---------- Auth Guard ----------
const token = localStorage.getItem('dtp_token');
const userRaw = localStorage.getItem('dtp_user');

if (!token || !userRaw) {
  window.location.href = 'login.html';
}

const currentUser = JSON.parse(userRaw);
const authHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

document.getElementById('navUserName').textContent = `👋 ${currentUser.name}`;
if (currentUser.role === 'admin') {
  document.getElementById('adminLink').style.display = 'inline-block';
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('dtp_token');
  localStorage.removeItem('dtp_user');
  window.location.href = 'login.html';
});

function handleAuthError(res) {
  if (res.status === 401) {
    localStorage.removeItem('dtp_token');
    localStorage.removeItem('dtp_user');
    window.location.href = 'login.html';
    return true;
  }
  return false;
}

// ---------- Elements ----------
const cardsGrid = document.getElementById('cardsGrid');
const emptyMsg = document.getElementById('emptyMsg');
const modalOverlay = document.getElementById('modalOverlay');
const destForm = document.getElementById('destForm');
const modalTitle = document.getElementById('modalTitle');
const openAddBtn = document.getElementById('openAddBtn');
const cancelBtn = document.getElementById('cancelBtn');
const filterStatus = document.getElementById('filterStatus');
const filterCountry = document.getElementById('filterCountry');
const toastContainer = document.getElementById('toastContainer');

let editingId = null;

// ---------- Fetch & Render ----------
async function loadDestinations() {
  const params = new URLSearchParams();
  if (filterStatus.value) params.append('status', filterStatus.value);
  if (filterCountry.value) params.append('country', filterCountry.value);

  const res = await fetch(`${API}?${params.toString()}`, { headers: authHeaders });
  if (handleAuthError(res)) return;
  const data = await res.json();
  renderCards(data);
  loadStats();
}

async function loadStats() {
  const res = await fetch(`${API}/stats`, { headers: authHeaders });
  if (handleAuthError(res)) return;
  const s = await res.json();
  document.getElementById('statTotal').textContent = s.total;
  document.getElementById('statPlanned').textContent = s.planned;
  document.getElementById('statBooked').textContent = s.booked;
  document.getElementById('statVisited').textContent = s.visited;
  document.getElementById('statBudget').textContent = `$${s.totalBudget.toLocaleString()}`;
}

function renderCards(destinations) {
  cardsGrid.innerHTML = '';
  emptyMsg.style.display = destinations.length === 0 ? 'block' : 'none';

  destinations.forEach(d => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${d.image}" alt="${d.name}" onerror="this.src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800'">
      <div class="card-body">
        <h3>${d.name}</h3>
        <div class="card-country">📍 ${d.country}</div>
        <p class="card-desc">${d.description || 'No description added.'}</p>
        <div class="badges">
          <span class="badge status-${d.status}">${d.status}</span>
          <span class="badge priority-${d.priority}">${d.priority} priority</span>
        </div>
        <div class="card-footer">
          <span class="budget">$${(d.estimatedBudget || 0).toLocaleString()}</span>
          <div class="card-actions">
            <button onclick="editDestination('${d._id}')">✏️ Edit</button>
            <button onclick="deleteDestination('${d._id}')">🗑️ Delete</button>
          </div>
        </div>
      </div>
    `;
    cardsGrid.appendChild(card);
  });
}

// ---------- Modal Controls ----------
function openModal(title = 'Add Dream Destination') {
  modalTitle.textContent = title;
  modalOverlay.classList.add('active');
}

function closeModal() {
  modalOverlay.classList.remove('active');
  destForm.reset();
  editingId = null;
  document.getElementById('destId').value = '';
}

openAddBtn.addEventListener('click', () => openModal());
cancelBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// ---------- Create / Update ----------
destForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById('name').value,
    country: document.getElementById('country').value,
    description: document.getElementById('description').value,
    image: document.getElementById('image').value,
    estimatedBudget: Number(document.getElementById('estimatedBudget').value) || 0,
    priority: document.getElementById('priority').value,
    status: document.getElementById('status').value,
    targetDate: document.getElementById('targetDate').value || null,
    notes: document.getElementById('notes').value
  };

  try {
    let res;
    if (editingId) {
      res = await fetch(`${API}/${editingId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch(API, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });
    }
    if (handleAuthError(res)) return;
    closeModal();
    loadDestinations();
    loadUpcomingNotifications();
  } catch (err) {
    alert('Error saving destination: ' + err.message);
  }
});

// ---------- Edit ----------
async function editDestination(id) {
  const res = await fetch(`${API}/${id}`, { headers: authHeaders });
  if (handleAuthError(res)) return;
  const d = await res.json();

  editingId = id;
  document.getElementById('destId').value = d._id;
  document.getElementById('name').value = d.name;
  document.getElementById('country').value = d.country;
  document.getElementById('description').value = d.description || '';
  document.getElementById('image').value = d.image || '';
  document.getElementById('estimatedBudget').value = d.estimatedBudget || 0;
  document.getElementById('priority').value = d.priority;
  document.getElementById('status').value = d.status;
  document.getElementById('targetDate').value = d.targetDate ? d.targetDate.substring(0, 10) : '';
  document.getElementById('notes').value = d.notes || '';

  openModal('Edit Dream Destination');
}

// ---------- Delete ----------
async function deleteDestination(id) {
  if (!confirm('Delete this dream destination?')) return;
  const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers: authHeaders });
  if (handleAuthError(res)) return;
  loadDestinations();
}

// ---------- Filters ----------
filterStatus.addEventListener('change', loadDestinations);
filterCountry.addEventListener('input', () => {
  clearTimeout(window._filterTimer);
  window._filterTimer = setTimeout(loadDestinations, 300);
});

// ---------- Notification Popups ----------
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span><button class="toast-close">&times;</button>`;
  toastContainer.appendChild(toast);

  toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
  setTimeout(() => toast.remove(), 8000);
}

function daysUntil(dateStr) {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

async function loadUpcomingNotifications() {
  try {
    const res = await fetch(`${API}/upcoming`, { headers: authHeaders });
    if (handleAuthError(res)) return;
    const upcoming = await res.json();

    upcoming.forEach((d, i) => {
      const days = daysUntil(d.targetDate);
      const dayLabel = days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`;
      setTimeout(() => {
        showToast(`🔔 Upcoming trip: <strong>${d.name}, ${d.country}</strong> is planned ${dayLabel}!`, 'notify');
      }, i * 600); // stagger popups so they don't all appear at once
    });
  } catch (err) {
    console.error('Could not load notifications:', err.message);
  }
}

// ---------- Init ----------
loadDestinations();
loadUpcomingNotifications();
