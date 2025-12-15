<?php
session_start();
header("Content-Type: application/json");
include "connection.php"; // JANGAN diubah (sesuai permintaanmu)

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["error" => "Method not allowed"]);
  exit;
}

if (!isset($_SESSION["id_user"])) {
  http_response_code(401);
  echo json_encode(["error" => "Unauthorized. Silakan login."]);
  exit;
}

$clientId = (int) $_SESSION["id_user"];

// ambil dari POST (form)
$idFotografer = (int) ($_POST["id_fotografer"] ?? 0);
$name   = trim($_POST["name"] ?? "");
$email  = trim($_POST["email"] ?? "");
$phone  = trim($_POST["phone"] ?? "");
$service= trim($_POST["service"] ?? "");
$date   = trim($_POST["date"] ?? "");
$location = trim($_POST["location"] ?? "");
$notes  = trim($_POST["notes"] ?? "");

// validasi dasar
if ($idFotografer <= 0) {
  http_response_code(400);
  echo json_encode(["error" => "ID fotografer tidak valid."]);
  exit;
}

if ($name === "" || $email === "" || $phone === "" || $service === "" || $date === "" || $location === "") {
  http_response_code(400);
  echo json_encode(["error" => "Mohon lengkapi semua field wajib."]);
  exit;
}

// validasi tanggal tidak boleh masa lalu
$today = date("Y-m-d");
if ($date < $today) {
  http_response_code(400);
  echo json_encode(["error" => "Tanggal acara tidak boleh di masa lalu."]);
  exit;
}

// Ambil nama fotografer dari DB (fotografer -> user)
$q = "
  SELECT u.fullName AS photographer_name
  FROM fotografer f
  JOIN user u ON u.id_user = f.id_user
  WHERE f.id_fotografer = ?
  LIMIT 1
";
$stmt = mysqli_prepare($koneksi, $q);
mysqli_stmt_bind_param($stmt, "i", $idFotografer);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);
$row = mysqli_fetch_assoc($res);

if (!$row) {
  http_response_code(404);
  echo json_encode(["error" => "Fotografer tidak ditemukan."]);
  exit;
}

$photographerName = $row["photographer_name"];

// default amount (kalau belum ada perhitungan harga)
$amount = 0.00;
$status = "new"; // atau "pending" sesuai standar kamu

// INSERT booking (sesuaikan dengan kolom di tabelmu)
$insert = "
  INSERT INTO bookings
    (client_name, client_email, photographer_name, service, booking_date, location, amount, booking_status, client_id_user, id_fotografer, notes)
  VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
";

$stmt2 = mysqli_prepare($koneksi, $insert);
mysqli_stmt_bind_param(
  $stmt2,
  "ssssssdsiis",
  $name,
  $email,
  $photographerName,
  $service,
  $date,
  $location,
  $amount,
  $status,
  $clientId,
  $idFotografer,
  $notes
);

$ok = mysqli_stmt_execute($stmt2);

if (!$ok) {
  http_response_code(500);
  echo json_encode(["error" => "Gagal insert booking: " . mysqli_error($koneksi)]);
  exit;
}

// bikin booking_code otomatis: "B" + id baru
$newId = mysqli_insert_id($koneksi);
$bookingCode = "B" . $newId;

$upd = "UPDATE bookings SET booking_code = ? WHERE id = ?";
$stmt3 = mysqli_prepare($koneksi, $upd);
mysqli_stmt_bind_param($stmt3, "si", $bookingCode, $newId);
mysqli_stmt_execute($stmt3);

echo json_encode([
  "ok" => true,
  "message" => "Booking berhasil dibuat",
  "id" => $newId,
  "booking_code" => $bookingCode
]);
