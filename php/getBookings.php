<?php
session_start();
header('Content-Type: application/json');
include 'connection.php';

// ==============================
// OPTIONAL: batasi admin
// ==============================
// if (!isset($_SESSION['id_user']) || $_SESSION['role'] !== 'Admin') {
//   http_response_code(403);
//   echo json_encode(["error" => "Forbidden"]);
//   exit;
// }

// ==============================
// Config status pending (sesuaikan dengan DB kamu)
// ==============================
$pendingStatus = "Menunggu Persetujuan";

// helper untuk ambil count
function countQuery($koneksi, $sql) {
  $res = mysqli_query($koneksi, $sql);
  if (!$res) return 0;
  $row = mysqli_fetch_assoc($res);
  return (int)($row['total'] ?? 0);
}

// ==============================
// MODE: stats only
// ==============================
if (isset($_GET['stats']) && $_GET['stats'] == '1') {
  $today = countQuery($koneksi, "SELECT COUNT(*) AS total FROM bookings WHERE booking_date = CURDATE()");
  $pending = countQuery($koneksi, "SELECT COUNT(*) AS total FROM bookings WHERE booking_status = '" . mysqli_real_escape_string($koneksi, $pendingStatus) . "'");
  $thisWeek = countQuery($koneksi, "SELECT COUNT(*) AS total FROM bookings WHERE YEARWEEK(booking_date, 1) = YEARWEEK(CURDATE(), 1)");
  $upcoming = countQuery($koneksi, "SELECT COUNT(*) AS total FROM bookings WHERE booking_date >= CURDATE()");

  echo json_encode([
    "today" => $today,
    "pending" => $pending,
    "thisWeek" => $thisWeek,
    "upcoming" => $upcoming
  ]);
  exit;
}

// ==============================
// MODE: bookings list (API lama) / or with stats
// ==============================
$sql = "SELECT id, booking_code, client_name, client_email, photographer_name, service, booking_date, location, amount, booking_status
        FROM bookings
        ORDER BY booking_date DESC, id DESC";

$result = mysqli_query($koneksi, $sql);
$bookings = [];

if ($result) {
  while ($row = mysqli_fetch_assoc($result)) {
    $bookings[] = $row;
  }
}

// kalau mau gabung stats + bookings dalam 1 response
if (isset($_GET['with_stats']) && $_GET['with_stats'] == '1') {
  $today = countQuery($koneksi, "SELECT COUNT(*) AS total FROM bookings WHERE booking_date = CURDATE()");
  $pending = countQuery($koneksi, "SELECT COUNT(*) AS total FROM bookings WHERE booking_status = '" . mysqli_real_escape_string($koneksi, $pendingStatus) . "'");
  $thisWeek = countQuery($koneksi, "SELECT COUNT(*) AS total FROM bookings WHERE YEARWEEK(booking_date, 1) = YEARWEEK(CURDATE(), 1)");
  $upcoming = countQuery($koneksi, "SELECT COUNT(*) AS total FROM bookings WHERE booking_date >= CURDATE()");

  echo json_encode([
    "stats" => [
      "today" => $today,
      "pending" => $pending,
      "thisWeek" => $thisWeek,
      "upcoming" => $upcoming
    ],
    "bookings" => $bookings
  ]);
  exit;
}

// default: API lama (array bookings)
echo json_encode($bookings);
exit;
?>
