console.log("adminReports.js loaded");

// ===============================
// USER PROFILE
// ===============================
fetch('../php/getUser.php')
  .then(res => res.json())
  .then(data => {
    if (!data.error) {
      document.querySelector('.user-avatar').textContent =
        data.fullName?.[0]?.toUpperCase() || 'A';
      document.querySelector('.user-info h4').textContent =
        data.fullName || 'Admin';
      document.querySelector('.user-info p').textContent =
        data.email || '-';
    }
  })
  .catch(err => console.error("getUser error:", err));

// ===============================
// LOGOUT
// ===============================
function logout() {
  window.location.href = '../php/logout.php';
}
window.logout = logout;

// ===============================
// HELPERS
// ===============================
function rupiah(n) {
  if (n === null || n === undefined) return '-';
  const num = Number(n);
  if (Number.isNaN(num)) return '-';
  return 'Rp ' + num.toLocaleString('id-ID');
}

// mapping dropdown label -> range param (backend)
function mapDropdownToRange(label) {
  const t = String(label || '').trim().toLowerCase();
  if (t === 'this month') return 'month';
  if (t === 'last 30 days') return '30d';
  if (t === 'last 60 days') return '60d'; 
  if (t === 'last 3 months') return '3m';
  if (t === 'last 6 months') return '6m';
  if (t === 'this year') return 'year';
  return 'month';
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setLoadingState() {
  setText('rep-total-revenue', '...');
  setText('rep-avg-booking', '...');
  setText('rep-pending-payments', '...');
  setText('rep-total-bookings', '...');
  setText('rep-completed', '...');
  setText('rep-cancelled', '...');
  setText('rep-avg-rating', '...');
  setText('rep-new-clients', '...');
  setText('rep-repeat-clients', '...');
}

// ===============================
// LOAD REPORT DATA
// ===============================
async function loadReports(range = 'month') {
  setLoadingState();

  try {
    const res = await fetch(`../php/getReports.php?range=${encodeURIComponent(range)}`, {
      cache: 'no-store'
    });

    const text = await res.text();
    let d;
    try {
      d = JSON.parse(text);
    } catch (e) {
      throw new Error(`Response bukan JSON:\n${text}`);
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}\n${text}`);
    }

    if (d.error) {
      throw new Error(d.message || d.error);
    }

    // === Financial ===
    setText('rep-total-revenue', rupiah(d.totalRevenue));
    setText('rep-avg-booking', rupiah(d.avgBookingValue));

    // pendingPayments di backend kamu itu COUNT (bukan nominal)
    setText('rep-pending-payments', String(d.pendingPayments ?? 0));

    // === Booking ===
    setText('rep-total-bookings', String(d.totalBookings ?? 0));
    setText('rep-completed', String(d.completed ?? 0));
    setText('rep-cancelled', String(d.cancelled ?? 0));

    // === Performance ===
    setText('rep-avg-rating', Number(d.averageRating ?? 0).toFixed(2));
    setText('rep-new-clients', String(d.newClients ?? 0));
    setText('rep-repeat-clients', String(d.repeatClients ?? 0));

    console.log("Reports range:", d.range, d.startDate, d.endDate);
  } catch (err) {
    console.error("Load reports error:", err);

    // tampilkan fallback biar tidak stuck di "..."
    setText('rep-total-revenue', '-');
    setText('rep-avg-booking', '-');
    setText('rep-pending-payments', '-');
    setText('rep-total-bookings', '-');
    setText('rep-completed', '-');
    setText('rep-cancelled', '-');
    setText('rep-avg-rating', '-');
    setText('rep-new-clients', '-');
    setText('rep-repeat-clients', '-');
  }
}

// ===============================
// INIT + EVENTS
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  const rangeSelect = document.querySelector('.date-range-select');
  if (!rangeSelect) {
    console.warn('Dropdown .date-range-select tidak ditemukan');
    loadReports('month');
    return;
  }

  // initial load sesuai value dropdown yang tampil
  loadReports(mapDropdownToRange(rangeSelect.value));

  // dropdown change -> reload
  rangeSelect.addEventListener('change', () => {
    loadReports(mapDropdownToRange(rangeSelect.value));
  });
});
