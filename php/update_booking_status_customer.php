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

$bookingId = (int)($_POST["booking_id"] ?? 0);
$status = trim($_POST["status"] ?? "");

if ($bookingId <= 0 || $status === "") {
  http_response_code(400);
  echo json_encode(["error" => "booking_id / status tidak valid."]);
  exit;
}

// status yang diizinkan untuk customer
$allowed = ["Terbayar", "Selesai"];
if (!in_array($status, $allowed, true)) {
  http_response_code(400);
  echo json_encode(["error" => "Status tidak diizinkan untuk customer."]);
  exit;
}

// pastikan booking milik customer ini
$chk = mysqli_prepare($koneksi, "SELECT booking_status FROM bookings WHERE id = ? AND client_id_user = ? LIMIT 1");
mysqli_stmt_bind_param($chk, "ii", $bookingId, $clientId);
mysqli_stmt_execute($chk);
$res = mysqli_stmt_get_result($chk);
$row = mysqli_fetch_assoc($res);

if (!$row) {
  http_response_code(404);
  echo json_encode(["error" => "Booking tidak ditemukan / bukan milik user ini."]);
  exit;
}

// OPTIONAL: rule transisi
// - Terbayar hanya boleh dari Menunggu Pembayaran
if ($status === "Terbayar" && $row["booking_status"] !== "Menunggu Pembayaran") {
  http_response_code(400);
  echo json_encode(["error" => "Booking tidak dalam status 'Menunggu Pembayaran'."]);
  exit;
}

$upd = mysqli_prepare($koneksi, "UPDATE bookings SET booking_status = ? WHERE id = ? AND client_id_user = ?");
mysqli_stmt_bind_param($upd, "sii", $status, $bookingId, $clientId);

if (!mysqli_stmt_execute($upd)) {
  http_response_code(500);
  echo json_encode(["error" => "Gagal update status booking."]);
  exit;
}

echo json_encode(["ok" => true, "message" => "Status booking berhasil diupdate", "booking_status" => $status]);
