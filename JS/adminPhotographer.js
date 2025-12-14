console.log("adminPhotographer.js loaded");

// ===============================
// USER PROFILE
// ===============================
fetch('../php/getUser.php')
  .then(async (res) => {
    const text = await res.text();
    if (!res.ok) throw new Error(text);
    try { return JSON.parse(text); }
    catch (e) { throw new Error(text); }
  })
  .then(data => {
    if (!data.error) {
      const avatar = document.querySelector('.user-avatar');
      const nameElem = document.querySelector('.user-info h4');
      const emailElem = document.querySelector('.user-info p');

      if (nameElem) nameElem.textContent = data.fullName ?? 'Unknown';
      if (emailElem) emailElem.textContent = data.email ?? '-';
      if (avatar) avatar.textContent = (data.fullName?.[0] || 'A').toUpperCase();
    } else {
      console.error('getUser error:', data.error);
    }
  })
  .catch(err => console.error('getUser fetch error:', err));

// ===============================
// BASIC ACTIONS
// ===============================
function logout() {
  window.location.href = '../php/logout.php';
}

// expose functions to inline onclick
window.logout = logout;
window.filterPhotographers = filterPhotographers;

// ===============================
// HELPERS
// ===============================
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function norm(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, '-');
}

// ===============================
// LOAD STATS
// ===============================
function loadPhotographerStats() {
  fetch('../php/getFotografer.php?stats=1')
    .then(async (res) => {
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      try { return JSON.parse(text); }
      catch (e) { throw new Error(text); }
    })
    .then(d => {
      const totalEl = document.getElementById('stat-total');
      const activeEl = document.getElementById('stat-active-month');
      const availEl = document.getElementById('stat-available-today');

      if (totalEl) totalEl.textContent = d.total ?? 0;
      if (activeEl) activeEl.textContent = d.activeThisMonth ?? 0;
      if (availEl) availEl.textContent = d.availableToday ?? 0;
    })
    .catch(err => {
      console.error('Stats error:', err);
      // kalau stats gagal, tetap tampilkan 0 (atau bisa tampilkan error kecil)
      const totalEl = document.getElementById('stat-total');
      const activeEl = document.getElementById('stat-active-month');
      const availEl = document.getElementById('stat-available-today');
      if (totalEl) totalEl.textContent = '0';
      if (activeEl) activeEl.textContent = '0';
      if (availEl) availEl.textContent = '0';
    });
}

// ===============================
// LOAD TABLE
// ===============================
function loadPhotographers() {
  const tbody = document.getElementById('photographersTable');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">Loading...</td></tr>';

  fetch('../php/getFotografer.php')
    .then(async (res) => {
      const text = await res.text();            // baca mentah dulu
      if (!res.ok) throw new Error(text);       // 404/500 -> tampilkan isi response
      try { return JSON.parse(text); }
      catch (e) { throw new Error(text); }      // bukan JSON -> tampilkan isi response
    })
    .then(data => {
      tbody.innerHTML = '';

      if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">No photographers found.</td></tr>';
        return;
      }

      data.forEach(p => {
        const tr = document.createElement('tr');

        // untuk filter frontend
        tr.dataset.activeMonth = String(p.active_this_month ?? 0);
        tr.dataset.availableToday = String(p.available_today ?? 0);

        tr.innerHTML = `
          <td>${escapeHtml(p.id_fotografer)}</td>
          <td>${escapeHtml(p.fullName)}</td>
          <td>${escapeHtml(p.domisili)}</td>
          <td>${escapeHtml(p.ratingAverage ?? '0.00')}</td>
        `;
        tbody.appendChild(tr);
      });

      // setelah load, apply filter tab yang sedang active
      const activeTab = document.querySelector('.filter-tab.active');
      const current = activeTab ? (activeTab.dataset.status || 'all') : 'all';
      filterPhotographers(current);
    })
    .catch(err => {
      console.error('Load photographers error:', err);
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center;color:red">
            Error loading photographers:<br>
            <small style="display:inline-block;max-width:900px;white-space:pre-wrap;text-align:left;">
              ${escapeHtml(err.message)}
            </small>
          </td>
        </tr>
      `;
    });
}

// ===============================
// FILTER (frontend)
// ===============================
function filterPhotographers(status) {
  const s = norm(status);

  // set active tab UI
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(t => t.classList.remove('active'));
  const active = Array.from(tabs).find(t => norm(t.dataset.status) === s);
  if (active) active.classList.add('active');

  const rows = document.querySelectorAll('#photographersTable tr');
  rows.forEach(row => {
    // abaikan row error/loading yang tidak punya dataset
    if (!row.dataset) return;

    if (s === 'all') {
      row.style.display = '';
      return;
    }

    if (s === 'active-month') {
      row.style.display = row.dataset.activeMonth === '1' ? '' : 'none';
      return;
    }

    if (s === 'available-today') {
      row.style.display = row.dataset.availableToday === '1' ? '' : 'none';
      return;
    }

    row.style.display = '';
  });
}

// ===============================
// INIT
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  loadPhotographerStats();
  loadPhotographers();
});
