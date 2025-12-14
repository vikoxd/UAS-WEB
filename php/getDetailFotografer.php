<?php
header('Content-Type: application/json');
include 'connection.php';
mysqli_set_charset($koneksi, "utf8mb4");

$id = intval($_GET['id'] ?? 0);
if ($id <= 0) {
  http_response_code(400);
  echo json_encode(["error" => "Invalid ID"]);
  exit;
}

/*
  NOTE:
  - tabel `user` wajib pakai backtick
  - kolom instagram kalau belum ada, kita bikin kosong lewat '' AS instagram
  - jenisKamera/motivasi ambil dari fotografer (kalau kolomnya ada)
*/

$sql = "
  SELECT
    f.id_fotografer,
    f.domisili,
    f.photo,
    f.price_per_hour,
    f.RatingValue,
    f.CountUser,
    f.motivasi,
    f.jenisKamera,
    u.fullName,
    '' AS instagram,
    CASE
      WHEN f.CountUser IS NULL OR f.CountUser = 0 THEN 0
      ELSE ROUND(f.RatingValue / f.CountUser, 2)
    END AS rating_average
  FROM fotografer f
  JOIN `user` u ON u.id_user = f.id_user
  WHERE f.id_fotografer = $id
  LIMIT 1
";

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

if (mysqli_num_rows($res) === 0) {
  http_response_code(404);
  echo json_encode(["error" => "Not found"]);
  exit;
}

$row = mysqli_fetch_assoc($res);

echo json_encode([
  "id_fotografer" => (int)$row["id_fotografer"],
  "fullName" => $row["fullName"],
  "domisili" => $row["domisili"],
  "photo" => $row["photo"],
  "price_per_hour" => (int)($row["price_per_hour"] ?? 0),
  "rating_average" => (float)($row["rating_average"] ?? 0),
  "rating_count" => (int)($row["CountUser"] ?? 0),
  "jenisKamera" => $row["jenisKamera"] ?? "",
  "instagram" => $row["instagram"] ?? "",
  "motivasi" => $row["motivasi"] ?? ""
]);
exit;
