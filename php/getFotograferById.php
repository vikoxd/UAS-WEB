<?php
header('Content-Type: application/json');
include 'connection.php';
mysqli_set_charset($koneksi, "utf8mb4");

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
  echo json_encode(["error" => "ID tidak valid"]);
  exit;
}

$sql = "
  SELECT
    f.id_fotografer,
    f.domisili,
    f.photo,
    f.price_per_hour,
    f.RatingValue,
    f.CountUser,
    f.jenisKamera,
    u.fullName,
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
  echo json_encode(["error" => "SQL error", "message" => mysqli_error($koneksi)]);
  exit;
}

$row = mysqli_fetch_assoc($res);
if (!$row) {
  echo json_encode(["error" => "Fotografer tidak ditemukan"]);
  exit;
}

echo json_encode([
  "id_fotografer" => (int)$row["id_fotografer"],
  "fullName" => $row["fullName"],
  "domisili" => $row["domisili"],
  "photo" => $row["photo"],                 // contoh: img/fotograferProfile/elmore.jpg
  "price_per_hour" => (int)$row["price_per_hour"],
  "RatingValue" => (int)$row["RatingValue"],
  "CountUser" => (int)$row["CountUser"],
  "jenisKamera" => $row["jenisKamera"],
  "rating_average" => (float)$row["rating_average"]
]);
exit;
