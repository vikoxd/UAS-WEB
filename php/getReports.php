<?php
session_start();
header('Content-Type: application/json');
include 'connection.php';
mysqli_set_charset($koneksi, "utf8mb4");

// helper ambil range tanggal
function getRange($range) {
  $today = new DateTime('today');
  $start = clone $today;
  $end = (clone $today)->modify('+1 day'); // end exclusive

  switch ($range) {
    case '30d':
      $start = (clone $today)->modify('-29 days');
      break;
    case '3m':
      $start = (clone $today)->modify('first day of -2 month');
      break;
    case '6m':
      $start = (clone $today)->modify('first day of -5 month');
      break;
    case 'year':
      $start = (clone $today)->modify('first day of January ' . $today->format('Y'));
      break;
    case 'month':
    default:
      $start = (clone $today)->modify('first day of this month');
      break;
  }
  return [$start->format('Y-m-d'), $end->format('Y-m-d')];
}

$range = $_GET['range'] ?? 'month';
[$startDate, $endDate] = getRange($range);

// ====== Sesuaikan status berikut dengan data kamu ======
$STATUS_PAID = ['Terbayar', 'Paid', 'Completed'];       // revenue dihitung dari status ini
$STATUS_CANCEL = ['Dibatalkan', 'Cancelled', 'Canceled', 'Ditolak']; // cancelled/cancel
// Pending = selain paid & cancel (umum). Kalau kamu punya status khusus, bisa diubah.

function inList($arr) {
  return "('" . implode("','", array_map('addslashes', $arr)) . "')";
}
$paidList = inList($STATUS_PAID);
$cancelList = inList($STATUS_CANCEL);

// 1) Total Bookings (range)
$sqlTotalBookings = "
  SELECT COUNT(*) AS total
  FROM bookings
  WHERE booking_date >= '$startDate' AND booking_date < '$endDate'
";

// 2) Completed/Paid (range)
$sqlCompleted = "
  SELECT COUNT(*) AS total
  FROM bookings
  WHERE booking_date >= '$startDate' AND booking_date < '$endDate'
    AND booking_status IN $paidList
";

// 3) Cancelled (range)
$sqlCancelled = "
  SELECT COUNT(*) AS total
  FROM bookings
  WHERE booking_date >= '$startDate' AND booking_date < '$endDate'
    AND booking_status IN $cancelList
";

// 4) Total Revenue (range, dari paid)
$sqlRevenue = "
  SELECT COALESCE(SUM(amount),0) AS total
  FROM bookings
  WHERE booking_date >= '$startDate' AND booking_date < '$endDate'
    AND booking_status IN $paidList
";

// 5) Avg Booking Value (range, dari paid)
$sqlAvgBooking = "
  SELECT COALESCE(AVG(amount),0) AS total
  FROM bookings
  WHERE booking_date >= '$startDate' AND booking_date < '$endDate'
    AND booking_status IN $paidList
";

// 6) Pending Payments (range) -> bookings yang bukan paid & bukan cancel
$sqlPendingPayments = "
  SELECT COUNT(*) AS total
  FROM bookings
  WHERE booking_date >= '$startDate' AND booking_date < '$endDate'
    AND booking_status NOT IN $paidList
    AND booking_status NOT IN $cancelList
";

// 7) Average Rating -> rata-rata rating fotografer (real: RatingValue/CountUser)
$sqlAvgRating = "
  SELECT COALESCE(AVG(
    CASE WHEN CountUser = 0 THEN 0 ELSE (RatingValue / CountUser) END
  ),0) AS total
  FROM fotografer
";

// 8) New Clients (range) -> client yang FIRST booking-nya jatuh di range
$sqlNewClients = "
  SELECT COUNT(*) AS total
  FROM (
    SELECT client_email, MIN(booking_date) AS first_date
    FROM bookings
    GROUP BY client_email
  ) x
  WHERE x.first_date >= '$startDate' AND x.first_date < '$endDate'
";

// 9) Repeat Clients (range) -> client yang booking >=2 kali dalam range
$sqlRepeatClients = "
  SELECT COUNT(*) AS total
  FROM (
    SELECT client_email, COUNT(*) AS c
    FROM bookings
    WHERE booking_date >= '$startDate' AND booking_date < '$endDate'
    GROUP BY client_email
    HAVING c >= 2
  ) x
";

function scalar($koneksi, $sql) {
  $res = mysqli_query($koneksi, $sql);
  if (!$res) {
    http_response_code(500);
    echo json_encode(["error"=>"SQL error","message"=>mysqli_error($koneksi),"sql"=>$sql]);
    exit;
  }
  $row = mysqli_fetch_assoc($res);
  return $row ? $row['total'] : 0;
}

$out = [
  "range" => $range,
  "startDate" => $startDate,
  "endDate" => $endDate,

  "totalRevenue" => (float)scalar($koneksi, $sqlRevenue),
  "avgBookingValue" => (float)scalar($koneksi, $sqlAvgBooking),
  "pendingPayments" => (int)scalar($koneksi, $sqlPendingPayments),

  "totalBookings" => (int)scalar($koneksi, $sqlTotalBookings),
  "completed" => (int)scalar($koneksi, $sqlCompleted),
  "cancelled" => (int)scalar($koneksi, $sqlCancelled),

  "averageRating" => (float)scalar($koneksi, $sqlAvgRating),
  "newClients" => (int)scalar($koneksi, $sqlNewClients),
  "repeatClients" => (int)scalar($koneksi, $sqlRepeatClients),
];

echo json_encode($out);
exit;
