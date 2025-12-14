alert("adminReports.js versi baru KELOAD ✅");

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
  });

// ===============================
// LOGOUT
// ===============================
function logout() {
  window.location.href = '../php/logout.php';
}
window.logout = logout;

// ===============================
// FORMAT HELPER
// ===============================
function rupiah(n) {
  if (n === null || n === undefined) return '-';
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

// ===============================
// LOAD REPORT DATA
// ===============================
function loadReports(range = 'month') {
  fetch(`../php/getReports.php?range=${range}`)
    .then(res => res.json())
    .then(d => {
      console.log("Reports data:", d);

      // === Financial ===
      document.querySelectorAll('.stat-label').forEach(label => {
        const text = label.textContent.toLowerCase();

        if (text.includes('total revenue')) {
          label.nextElementSibling.textContent = rupiah(d.totalRevenue);
        }

        if (text.includes('avg booking')) {
          label.nextElementSibling.textContent = rupiah(d.avgBookingValue);
        }

        if (text.includes('pending')) {
          label.nextElementSibling.textContent = rupiah(d.pendingPayments);
        }

        // === Booking ===
        if (text.includes('total bookings')) {
          label.nextElementSibling.textContent = d.totalBookings;
        }

        if (text.includes('completed')) {
          label.nextElementSibling.textContent = d.completed;
        }

        if (text.includes('cancelled')) {
          label.nextElementSibling.textContent = d.cancelled;
        }

        // === Performance ===
        if (text.includes('average rating')) {
          label.nextElementSibling.textContent =
            Number(d.averageRating).toFixed(2);
        }

        if (text.includes('new clients')) {
          label.nextElementSibling.textContent = d.newClients;
        }

        if (text.includes('repeat')) {
          label.nextElementSibling.textContent = d.repeatClients;
        }
      });
    })
    .catch(err => {
      console.error('Load reports error:', err);
    });
}

// ===============================
// INIT
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  loadReports();
});
