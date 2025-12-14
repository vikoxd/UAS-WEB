// Ambil data user dari PHP
fetch('../php/getUser.php')
  .then(res => res.json())
  .then(data => {
    if (!data.error) {
      const avatar = document.querySelector('.user-avatar');
      const nameElem = document.querySelector('.user-info h4');
      const emailElem = document.querySelector('.user-info p');

      nameElem.textContent = data.fullName;
      emailElem.textContent = data.email;
      avatar.textContent = data.fullName[0].toUpperCase();
    } else {
      console.error(data.error);
    }
  })
  .catch(err => console.error('Fetch error:', err));

//admin
/* Toggle Sidebar */
function toggleSidebar() {
document.getElementById('sidebar').classList.toggle('collapsed');
}

// Set Active Menu
function setActive(element, menuId) {
    // Remove active class from all nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    // Add active class to clicked item
    element.classList.add('active');
    
    // Here you can add logic to load different content based on menuId
    console.log('Active menu:', menuId);
    
    // Example: You can add routing logic here
    // loadContent(menuId);
}

// Logout Function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Add logout logic here
        alert('Logging out...');
        window.location.href = "login.html";
    }
}

// Search Functionality
const searchInput = document.querySelector('.search-input');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        console.log('Searching for:', searchTerm);
        
        // Add your search logic here
        // Example: Filter table rows
        filterTableRows(searchTerm);
    });
}

// Filter Table Rows (Example Implementation)
function filterTableRows(searchTerm) {
    const tableRows = document.querySelectorAll('tbody tr');
    
    tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Notification Click
const notificationBtn = document.querySelector('.notification-btn');
if (notificationBtn) {
    notificationBtn.addEventListener('click', function() {
        alert('You have 3 new notifications!');
        // Add notification panel logic here
        // showNotificationPanel();
    });
}

// View All Button
const viewAllBtn = document.querySelector('.view-all-btn');
if (viewAllBtn) {
    viewAllBtn.addEventListener('click', function() {
        console.log('View all bookings clicked');
        // Add navigation to full bookings page
        // window.location.href = '/bookings';
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard loaded successfully');
    
    // You can add initialization logic here
    // Example: Load dashboard data
    // loadDashboardData();
});

// Filter by Status
function filterStatus(status) {
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Add active class to clicked tab
    Event.target.classList.add('active');
    
    console.log('Filtering by status:', status);
    
    // Get all table rows
    const tableRows = document.querySelectorAll('#bookingsTable tr');
    
    tableRows.forEach(row => {
        if (status === 'all') {
            row.style.display = '';
        } else {
            const statusBadge = row.querySelector('.status-badge');
            if (statusBadge) {
                const rowStatus = statusBadge.className.toLowerCase();
                if (rowStatus.includes(status)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
  loadBookings();
});

function loadBookings() {
  const tbody = document.getElementById('bookingsTable');
  tbody.innerHTML = '<tr><td colspan="10" style="text-align:center">Loading...</td></tr>';

  fetch('../php/getBookings.php')
    .then(res => {
      if (!res.ok) throw new Error('Network response was not OK');
      return res.json();
    })
    .then(data => {
      tbody.innerHTML = '';
      if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center">No bookings found.</td></tr>';
        return;
      }

      data.forEach((b, idx) => {
        const tr = document.createElement('tr');
        tr.dataset.status = b.booking_status || '';

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
      document.getElementById('bookingsTable').innerHTML = `<tr><td colspan="10" style="text-align:center;color:red">Error loading bookings</td></tr>`;
    });
}

function formatCurrency(val) {
  if (val === null || val === undefined) return '-';
  const n = Number(val);
  if (isNaN(n)) return val;
  return 'Rp ' + n.toLocaleString('id-ID', {minimumFractionDigits: 0});
}

// simple escape to avoid XSS in this example
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

