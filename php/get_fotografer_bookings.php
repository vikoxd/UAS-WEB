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

$idUser = (int)$_SESSION['id_user'];

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

// mapping label DB -> kode internal JS
function dbStatusToCode($s) {
  $s = trim((string)$s);
  switch ($s) {
    case "Menunggu Konfirmasi": return "new";
    case "Menunggu Pembayaran": return "accepted";
    case "Terbayar": return "paid";
    case "Selesai": return "completed";
    case "Ditolak": return "rejected";
    default:
      // kalau kosong/null, anggap pesanan baru
      if ($s === "" || strtolower($s) === "null") return "new";
      return $s; // fallback (biar kelihatan kalau ada value aneh)
  }
}

$sql = "
SELECT
  b.id,
  b.booking_code,
  b.booking_date,
  b.booking_time,
  b.location,
  b.amount,
  b.booking_status,
  b.client_name,
  u.fullName AS user_fullname
FROM bookings b
LEFT JOIN user u ON u.id_user = b.client_id_user
WHERE b.id_fotografer = ?
ORDER BY b.id DESC
";

$stmt = mysqli_prepare($koneksi, $sql);
if (!$stmt) {
  http_response_code(500);
  echo json_encode(["error" => "Query prepare gagal: " . mysqli_error($koneksi)]);
  exit;
}

mysqli_stmt_bind_param($stmt, "i", $idFotografer);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$bookings = [];
while ($r = mysqli_fetch_assoc($result)) {
  $id = (int)$r['id'];

  // kode tampilan: pakai booking_code kalau ada, kalau kosong pakai "B{id}"
  $code = trim((string)$r['booking_code']);
  if ($code === "") $code = "B" . $id;

  $custName = trim((string)$r['client_name']);
  if ($custName === "") $custName = $r['user_fullname'] ?: "-";

  $bookings[] = [
    "booking_id" => $id,
    "booking_code" => $code,
    "customer_name" => $custName,
    "booking_date" => $r['booking_date'] ?: "-",
    "booking_time" => $r['booking_time'] ?: "-",
    "location" => $r['location'] ?: "-",
    "amount" => $r['amount'] ?? "",
    "booking_status" => dbStatusToCode($r['booking_status']),
  ];
}

echo json_encode([
  "ok" => true,
  "id_fotografer" => $idFotografer,
  "bookings" => $bookings
]);
