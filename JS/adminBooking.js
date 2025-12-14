// ===============================
// USER PROFILE
// ===============================
fetch('../php/getUser.php')
  .then(res => res.json())
  .then(data => {
    if (!data.error) {
      const avatar = document.querySelector('.user-avatar');
      const nameElem = document.querySelector('.user-info h4');
      const emailElem = document.querySelector('.user-info p');

      nameElem.textContent = data.fullName;
      emailElem.textContent = data.email;
      avatar.textContent = (data.fullName?.[0] || 'A').toUpperCase();
    } else {
      console.error(data.error);
    }
  })
  .catch(err => console.error('Fetch error:', err));

/* Toggle Sidebar */
function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('collapsed');
}

/* Logout */
function logout() {
  window.location.href = '../php/logout.php';
}

// ===============================
// HELPERS
// ===============================
function normalizeStatus(s) {
  // contoh: "Menunggu Persetujuan" -> "menunggu-persetujuan"
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

function formatCurrency(val) {
  if (val === null || val === undefined) return '-';
  const n = Number(val);
  if (isNaN(n)) return val;
  return 'Rp ' + n.toLocaleString('id-ID', { minimumFractionDigits: 0 });
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ===============================
// FILTER STATUS
// ===============================
function filterStatus(status) {
  const norm = normalizeStatus(status);
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(tab => tab.classList.remove('active'));

  // aktifkan tab yang diklik (berdasarkan data-status)
  const active = Array.from(tabs).find(t => normalizeStatus(t.dataset.status) === norm);
  if (active) active.classList.add('active');

  const rows = document.querySelectorAll('#bookingsTable tr');
  rows.forEach(row => {
    const rowStatus = row.dataset.status || '';
    if (norm === 'all' || rowStatus === norm) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

// ===============================
// MINI STATS (dari DB)
// ===============================
function loadMiniStats() {
  fetch('../api/dashboard_stats.php')
    .then(res => res.json())
    .then(data => {
      const elToday = document.getElementById('stat-today');
      const elPending = document.getElementById('stat-pending');
      const elWeek = document.getElementById('stat-week');
      const elUpcoming = document.getElementById('stat-upcoming');

      if (elToday) elToday.textContent = data.today ?? 0;
      if (elPending) elPending.textContent = data.pending ?? 0;
      if (elWeek) elWeek.textContent = data.thisWeek ?? 0;
      if (elUpcoming) elUpcoming.textContent = data.upcoming ?? 0;
    })
    .catch(err => console.error('Gagal load mini stats:', err));
}

// ===============================
// BOOKINGS TABLE (dari DB)
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  loadMiniStats();
  loadBookings();
});

function loadBookings() {
  const tbody = document.getElementById('bookingsTable');
  // tabel kamu 9 kolom, jadi colspan 9
  tbody.innerHTML = '<tr><td colspan="9" style="text-align:center">Loading...</td></tr>';

  fetch('../php/getBookings.php')
    .then(res => {
      if (!res.ok) throw new Error('Network response was not OK');
      return res.json();
    })
    .then(data => {
      tbody.innerHTML = '';
      if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center">No bookings found.</td></tr>';
        return;
      }

      data.forEach((b, idx) => {
        const tr = document.createElement('tr');

        // dataset.status dibuat normalize biar filter mudah
        tr.dataset.status = normalizeStatus(b.booking_status);

        tr.innerHTML = `
          <td>${idx + 1}</td>
          <td>${escapeHtml(b.booking_code || b.id)}</td>
          <td>
            <div class="client-info">
              <span class="client-name">${escapeHtml(b.client_name)}</span><br>
              <span class="client-contact" style="font-size:0.9em;color:#666">${escapeHtml(b.client_email)}</span>
            </div>
          </td>
          <td>${escapeHtml(b.photographer_name)}</td>
          <td>${escapeHtml(b.service)}</td>
          <td>${escapeHtml(b.booking_date)}</td>
          <td>${escapeHtml(b.location)}</td>
          <td>${formatCurrency(b.amount)}</td>
          <td>${escapeHtml(b.booking_status)}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error(err);
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:red">Error loading bookings</td></tr>';
    });
}

// ===============================
// PAGINATION (sementara dummy)
// ===============================
const paginationButtons = document.querySelectorAll('.pagination-btn');
paginationButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // nanti kalau pagination sudah real dari backend, baru implement
    alert(`Clicked page: ${btn.textContent.trim()}`);
  });
});
