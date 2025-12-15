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
          id AS booking_id,
          booking_code,
          photographer_name,
          service,
          booking_date,
          booking_time,
          location,
          amount,
          booking_status,
          notes,
          id_fotografer
        FROM bookings
        WHERE client_id_user = ?
        ORDER BY id DESC";

$stmt = mysqli_prepare($koneksi, $sql);
mysqli_stmt_bind_param($stmt, "i", $clientId);
mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);

$rows = [];
while ($row = mysqli_fetch_assoc($result)) {
  $rows[] = $row;
}

echo json_encode(["ok" => true, "bookings" => $rows]);
