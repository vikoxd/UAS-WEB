<?php
session_start();

// Cek apakah user sudah login
if (!isset($_SESSION['id_user'])) {
    header("Location: Login.html");
    exit;
}

// Ambil data user dari session
$fullName = $_SESSION['fullName'];
$email = $_SESSION['email'];
$avatarLetter = strtoupper($fullName[0]);
?>

<!DOCTYPE html>

<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin | Find Happiness</title>
  <link rel="stylesheet" href="../css/admin.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
</head>
<body>
<div class="dashboard-container">
    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <div class="logo-container">
                <div class="logo-icon">
                    <img src="../img/logo.png" alt="Logo" class="logo-icon">
                </div>
                <span class="logo-text">Find Happiness</span>
            </div>
            <button class="toggle-btn" onclick="toggleSidebar()">
                <i class="fas fa-bars"></i>
            </button>
        </div>

```
    <nav class="sidebar-nav">
        <a href="admin.php" class="nav-item active"><i class="fas fa-home"></i><span>Dashboard</span></a>
        <a href="admin_booking.php" class="nav-item"><i class="fas fa-calendar"></i><span>Booking</span></a>
        <a href="admin_photography.php" class="nav-item"><i class="fas fa-camera"></i><span>Photography</span></a>
        <a href="admin_reports.php" class="nav-item"><i class="fas fa-file-alt"></i><span>Reports</span></a>
    </nav>

    <div class="sidebar-footer">
        <button class="logout-btn" onclick="logout()">
            <i class="fas fa-sign-out-alt"></i><span>Logout</span>
        </button>
    </div>
</aside>

<!-- Main Content -->
<div class="main-content">
    <header class="header">
        <div class="search-container">
            <i class="fas fa-search search-icon"></i>
            <input type="text" class="search-input" placeholder="Search bookings, clients, photographers...">
        </div>

        <div class="header-actions">
            <button class="notification-btn">
                <i class="fas fa-bell"></i>
                <span class="notification-badge"></span>
            </button>

            <div class="user-profile">
                <div class="user-avatar"><?php echo $avatarLetter; ?></div>
                <div class="user-info">
                    <h4><?php echo $fullName; ?></h4>
                    <p><?php echo $email; ?></p>
                </div>
            </div>
        </div>
    </header>

    <main class="content-area">
        <div class="page-title">
            <h2>Dashboard Overview</h2>
            <p>Welcome back! Here's what's happening with your photography business.</p>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-header"><div class="stat-icon purple"><i class="fas fa-calendar"></i></div></div>
                <div class="stat-info"><h3>Total Bookings</h3></div>
            </div>
            <div class="stat-card">
                <div class="stat-header"><div class="stat-icon blue"><i class="fas fa-camera"></i></div></div>
                <div class="stat-info"><h3>Active Photographers</h3></div>
            </div>
            <div class="stat-card">
                <div class="stat-header"><div class="stat-icon pink"><i class="fas fa-users"></i></div></div>
                <div class="stat-info"><h3>Total Clients</h3></div>
            </div>
        </div>

        <!-- Recent Bookings Table -->
        <div class="table-section">
            <div class="table-header">
                <div class="table-title">
                    <h3>Recent Bookings</h3>
                    <p>Latest photography session bookings</p>
                </div>
                <button class="view-all-btn"><i class="fas fa-clock"></i> View All</button>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Client</th>
                            <th>Email</th>
                            <th>Booking ID</th>
                            <th>Photographer</th>
                            <th>Service</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>John Doe</td>
                            <td>john@gmail.com</td>
                            <td>B001</td>
                            <td>Alice</td>
                            <td>Wedding</td>
                            <td>2025-12-01</td>
                            <td>$500</td>
                            <td>Confirmed</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>Jane Smith</td>
                            <td>jane@gmail.com</td>
                            <td>B002</td>
                            <td>Bob</td>
                            <td>Portrait</td>
                            <td>2025-12-02</td>
                            <td>$200</td>
                            <td>Pending</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </main>
</div>
```

</div>

<script>
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

function logout() {
    window.location.href = '../php/logout.php';
}
</script>

</body>
</html>
