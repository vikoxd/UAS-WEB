<?php
session_start();
header("Content-Type: application/json");
include "connection.php";

if (!isset($_SESSION['id_user'])) {
  http_response_code(401);
  echo json_encode(["error" => "Unauthorized. Silakan login."]);
  exit;
}
if (!isset($_SESSION['role']) || $_SESSION['role'] !== "Fotografer") {
  http_response_code(403);
  echo json_encode(["error" => "Akses ditolak. Khusus fotografer."]);
  exit;
}
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["error" => "Method not allowed"]);
  exit;
}

$bookingId = (int)($_POST['booking_id'] ?? 0);
$status = trim($_POST['status'] ?? "");

if ($bookingId <= 0 || $status === "") {
  http_response_code(400);
  echo json_encode(["error" => "booking_id dan status wajib diisi."]);
  exit;
}

// mapping kode internal -> label DB
function codeToDbStatus($code) {
  switch ($code) {
    case "new": return "Menunggu Konfirmasi";
    case "accepted": return "Menunggu Pembayaran";
    case "paid": return "Terbayar";
    case "completed": return "Selesai";
    case "rejected": return "Ditolak";
    default: return null;
  }
}

$dbStatus = codeToDbStatus($status);
if ($dbStatus === null) {
  http_response_code(400);
  echo json_encode(["error" => "Status tidak valid."]);
  exit;
}

$idUser = (int)$_SESSION['id_user'];

// cari id_fotografer login
$qF = mysqli_prepare($koneksi, "SELECT id_fotografer FROM fotografer WHERE id_user = ? LIMIT 1");
mysqli_stmt_bind_param($qF, "i", $idUser);
mysqli_stmt_execute($qF);
$resF = mysqli_stmt_get_result($qF);
$rowF = mysqli_fetch_assoc($resF);

if (!$rowF) {
  http_response_code(404);
  echo json_encode(["error" => "Akun fotografer tidak terdaftar di tabel fotografer."]);
  exit;
}
$idFotografer = (int)$rowF['id_fotografer'];

// pastikan booking ini milik fotografer tsb
$qC = mysqli_prepare($koneksi, "SELECT id FROM bookings WHERE id = ? AND id_fotografer = ? LIMIT 1");
mysqli_stmt_bind_param($qC, "ii", $bookingId, $idFotografer);
mysqli_stmt_execute($qC);
$resC = mysqli_stmt_get_result($qC);
$rowC = mysqli_fetch_assoc($resC);

if (!$rowC) {
  http_response_code(404);
  echo json_encode(["error" => "Booking tidak ditemukan / bukan milik fotografer ini."]);
  exit;
}

// update
$upd = mysqli_prepare($koneksi, "UPDATE bookings SET booking_status = ? WHERE id = ? AND id_fotografer = ?");
mysqli_stmt_bind_param($upd, "sii", $dbStatus, $bookingId, $idFotografer);

if (!mysqli_stmt_execute($upd)) {
  http_response_code(500);
  echo json_encode(["error" => "Gagal update status: " . mysqli_error($koneksi)]);
  exit;
}

echo json_encode([
  "ok" => true,
  "booking_id" => $bookingId,
  "new_status_code" => $status,
  "new_status_db" => $dbStatus
]);
