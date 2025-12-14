let slides = document.querySelectorAll('.slide'); 
    let index = 0; 
  
    function showSlide(i) { 
      slides.forEach((slide, n) => { slide.classList.remove('active'); 
      if (n === i) slide.classList.add('active'); }); 
    }  
    function nextSlide() { 
      index = (index + 1) % slides.length; 
      showSlide(index); 
    }

    function prevSlide() { 
      index = (index - 1 + slides.length) % slides.length; 
      showSlide(index); 
    }
    
    document.querySelector('.next').addEventListener('click', nextSlide); 
    document.querySelector('.prev').addEventListener('click', prevSlide); 



// Event listener untuk form submit
document.getElementById('bookingForm').addEventListener('submit', function(e) {
    // Mencegah halaman reload saat form di-submit
    e.preventDefault();
    
    // Mengumpulkan semua data dari form ke dalam object
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        service: document.getElementById('service').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        location: document.getElementById('location').value,
        notes: document.getElementById('notes').value
    };

    // Menampilkan data di console (untuk debugging)
    console.log('Data Booking:', formData);

    // Menampilkan pesan sukses
    document.getElementById('successMessage').style.display = 'block';
    
    // Reset form dan sembunyikan pesan sukses setelah 3 detik
    setTimeout(() => {
        this.reset();
        document.getElementById('successMessage').style.display = 'none';
    }, 3000);
});

// Set tanggal minimum ke hari ini (agar user tidak bisa pilih tanggal yang sudah lewat)
document.getElementById('date').min = new Date().toISOString().split('T')[0];

  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  
  // Jika ada kategori, tampilkan di judul
  if (category) {
    const portfolioSection = document.querySelector('.portfolio-section');
    const categoryTitle = document.createElement('div');
    categoryTitle.style.cssText = 'text-align: center; margin: 20px 0; padding: 15px; background: #f0f0f0; border-radius: 8px;';
    categoryTitle.innerHTML = `<h2 style="color: #6b46c1; margin: 0;">Kategori: ${category.charAt(0).toUpperCase() + category.slice(1)} Photography</h2>`;
    portfolioSection.insertBefore(categoryTitle, portfolioSection.firstChild);
  }

//admin
  // Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
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

// Add New Booking
function addNewBooking() {
    alert('Form tambah booking baru akan dibuka');
    // Redirect to add booking form or open modal
    // window.location.href = 'admin_booking_add.html';
}

// View Booking Details
function viewDetails(bookingId) {
    console.log('View details for:', bookingId);
    alert(`Melihat detail booking ${bookingId}`);
    // window.location.href = `admin_booking_detail.html?id=${bookingId}`;
}

// Edit Booking
function editBooking(bookingId) {
    console.log('Edit booking:', bookingId);
    alert(`Edit booking ${bookingId}`);
    // window.location.href = `admin_booking_edit.html?id=${bookingId}`;
}

// Delete Booking
function deleteBooking(bookingId) {
    if (confirm(`Apakah Anda yakin ingin menghapus booking ${bookingId}?`)) {
        console.log('Delete booking:', bookingId);
        alert(`Booking ${bookingId} berhasil dihapus`);
        
        // Remove row from table
        const allCells = document.querySelectorAll('td.booking-id');
        allCells.forEach(cell => {
            if (cell.textContent === bookingId) {
                cell.closest('tr').remove();
            }
        });
    }
}

// Pagination
document.addEventListener('DOMContentLoaded', function() {
    const paginationBtns = document.querySelectorAll('.pagination-btn');
    
    paginationBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.disabled) return;
            
            // Remove active class from all number buttons
            paginationBtns.forEach(b => {
                if (!b.querySelector('i')) {
                    b.classList.remove('active');
                }
            });
            
            // Add active class to clicked button (if it's a number)
            if (!this.querySelector('i')) {
                this.classList.add('active');
                const pageNumber = this.textContent.trim();
                console.log('Going to page:', pageNumber);
                // loadPage(pageNumber);
            } else {
                // Handle prev/next buttons
                const direction = this.querySelector('.fa-chevron-left') ? 'prev' : 'next';
                console.log('Navigate:', direction);
            }
        });
    });
});

