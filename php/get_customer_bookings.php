<?php
session_start();
header("Content-Type: application/json");

require_once __DIR__ . "/connection.php";

if (!isset($_SESSION['id_user'])) {
  http_response_code(401);
  echo json_encode(["error" => "Unauthorized. Silakan login."]);
  exit;
}

$clientId = (int)$_SESSION['id_user'];

$sql = "SELECT 
          b.id AS booking_id,
          b.booking_code,
          b.photographer_name,
          b.service,
          b.booking_date,
          b.booking_time,
          b.location,
          b.amount,
          b.booking_status,
          b.notes,
          b.id_fotografer,
          CASE WHEN t.booking_id IS NULL THEN 0 ELSE 1 END AS has_rating
        FROM bookings b
        LEFT JOIN testimoni t ON t.booking_id = b.id
        WHERE b.client_id_user = ?
        ORDER BY b.id DESC";

$stmt = mysqli_prepare($koneksi, $sql);
mysqli_stmt_bind_param($stmt, "i", $clientId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$rows = [];
while ($row = mysqli_fetch_assoc($result)) {
  $rows[] = $row;
}

echo json_encode(["ok" => true, "bookings" => $rows]);
