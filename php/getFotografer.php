<?php
session_start();
header('Content-Type: application/json');
include 'connection.php';

mysqli_set_charset($koneksi, "utf8mb4");

// helper count yang kalau error akan ngasih error detail
function countQueryOrFail($koneksi, $sql) {
  $res = mysqli_query($koneksi, $sql);
  if (!$res) {
    http_response_code(500);
    echo json_encode([
      "error" => "SQL error",
      "message" => mysqli_error($koneksi),
      "sql" => $sql
    ]);
    exit;
  }
  $row = mysqli_fetch_assoc($res);
  return (int)($row['total'] ?? 0);
}

// ==============================
// MODE: STATS
// ==============================
if (isset($_GET['stats']) && $_GET['stats'] == '1') {

  $total = countQueryOrFail($koneksi, "SELECT COUNT(*) AS total FROM fotografer");

  $activeThisMonth = countQueryOrFail($koneksi, "
    SELECT COUNT(DISTINCT b.photographer_name) AS total
    FROM bookings b
    WHERE b.booking_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
      AND b.booking_date <  DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
  ");

  $availableToday = countQueryOrFail($koneksi, "
    SELECT COUNT(*) AS total
    FROM fotografer f
    JOIN `user` u ON u.id_user = f.id_user
    WHERE NOT EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.photographer_name = u.fullName
        AND b.booking_date = CURDATE()
    )
  ");

  echo json_encode([
    "total" => $total,
    "activeThisMonth" => $activeThisMonth,
    "availableToday" => $availableToday
  ]);
  exit;
}

// ==============================
// MODE: LIST
// ==============================
$sql = "
  SELECT
    f.id_fotografer,
    f.id_user,
    f.domisili,
    f.RatingAverage AS ratingAverage,
    u.fullName,

    EXISTS(
      SELECT 1
      FROM bookings b1
      WHERE b1.photographer_name = u.fullName
        AND b1.booking_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
        AND b1.booking_date <  DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
    ) AS active_this_month,

    NOT EXISTS(
      SELECT 1
      FROM bookings b2
      WHERE b2.photographer_name = u.fullName
        AND b2.booking_date = CURDATE()
    ) AS available_today

  FROM fotografer f
  JOIN `user` u ON u.id_user = f.id_user
  ORDER BY f.id_fotografer DESC
";

$result = mysqli_query($koneksi, $sql);
if (!$result) {
  http_response_code(500);
  echo json_encode([
    "error" => "SQL error",
    "message" => mysqli_error($koneksi),
    "sql" => $sql
  ]);
  exit;
}

$data = [];
while ($row = mysqli_fetch_assoc($result)) {
  $row['active_this_month'] = (int)$row['active_this_month'];
  $row['available_today'] = (int)$row['available_today'];
  $data[] = $row;
}

echo json_encode($data);
exit;
