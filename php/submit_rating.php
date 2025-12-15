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
$rating = (int)($_POST["rating"] ?? 0);
$review = trim($_POST["review"] ?? "");
$pekerjaan = "Customer"; // bisa kamu ganti kalau ada field pekerjaan user

if ($bookingId <= 0 || $rating < 1 || $rating > 5) {
  http_response_code(400);
  echo json_encode(["error" => "booking_id / rating tidak valid."]);
  exit;
}

// 1) pastikan booking milik user dan ambil id_fotografer + status
$chk = mysqli_prepare($koneksi, "SELECT id_fotografer, booking_status FROM bookings WHERE id = ? AND client_id_user = ? LIMIT 1");
mysqli_stmt_bind_param($chk, "ii", $bookingId, $clientId);
mysqli_stmt_execute($chk);
$res = mysqli_stmt_get_result($chk);
$b = mysqli_fetch_assoc($res);

if (!$b) {
  http_response_code(404);
  echo json_encode(["error" => "Booking tidak ditemukan / bukan milik user ini."]);
  exit;
}

$idFotografer = (int)$b["id_fotografer"];

// Optional: hanya boleh rating jika status Selesai
if (strtolower(trim($b["booking_status"])) !== strtolower("Selesai")) {
  http_response_code(400);
  echo json_encode(["error" => "Rating hanya bisa diberikan saat status booking sudah 'Selesai'."]);
  exit;
}

mysqli_begin_transaction($koneksi);

try {
  // 2) INSERT ke testimoni dulu (ini akan gagal kalau booking_id sudah pernah dipakai karena UNIQUE)
  $ins = mysqli_prepare($koneksi, "
    INSERT INTO testimoni (id_user, id_fotografer, booking_id, rating, pekerjaan, komentar)
    VALUES (?, ?, ?, ?, ?, ?)
  ");
  mysqli_stmt_bind_param($ins, "iiiiss", $clientId, $idFotografer, $bookingId, $rating, $pekerjaan, $review);

  if (!mysqli_stmt_execute($ins)) {
    throw new Exception("Rating/ulasan sudah pernah dikirim atau gagal disimpan.");
  }

  // 3) UPDATE tabel fotografer
  $upd = mysqli_prepare($koneksi, "
    UPDATE fotografer
    SET
      RatingValue = RatingValue + ?,
      CountUser   = CountUser + 1,
      RatingAverage = (RatingValue + ?) / (CountUser + 1)
    WHERE id_fotografer = ?
  ");
  mysqli_stmt_bind_param($upd, "iii", $rating, $rating, $idFotografer);

  if (!mysqli_stmt_execute($upd)) {
    throw new Exception("Gagal update agregat rating fotografer.");
  }

  mysqli_commit($koneksi);

  echo json_encode([
    "ok" => true,
    "message" => "Rating berhasil disimpan",
    "data" => [
      "booking_id" => $bookingId,
      "id_fotografer" => $idFotografer
    ]
  ]);
} catch (Exception $e) {
  mysqli_rollback($koneksi);
  http_response_code(400);
  echo json_encode(["error" => $e->getMessage()]);
}
