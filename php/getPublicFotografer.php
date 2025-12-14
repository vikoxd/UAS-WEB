<?php
header('Content-Type: application/json');
include 'connection.php';
mysqli_set_charset($koneksi, "utf8mb4");

$sql = "
  SELECT
    f.id_fotografer,
    f.domisili,
    f.slug,
    f.photo,
    f.price_per_hour,
    f.RatingValue,
    f.CountUser,
    CASE
      WHEN f.CountUser IS NULL OR f.CountUser = 0 THEN 0
      ELSE ROUND(f.RatingValue / f.CountUser, 2)
    END AS rating_average,
    u.fullName
  FROM fotografer f
  JOIN `user` u ON u.id_user = f.id_user
  ORDER BY f.domisili ASC, u.fullName ASC
";

$res = mysqli_query($koneksi, $sql);
if (!$res) {
  http_response_code(500);
  echo json_encode(["error" => "SQL error", "message" => mysqli_error($koneksi)]);
  exit;
}

$data = [];
while ($row = mysqli_fetch_assoc($res)) {
  $data[] = [
    "id_fotografer" => (int)$row["id_fotografer"],
    "fullName" => $row["fullName"],
    "domisili" => $row["domisili"],
    "slug" => $row["slug"],
    "photo" => $row["photo"], // contoh: duffy-kordova.jpg
    "price_per_hour" => (int)$row["price_per_hour"],
    "rating_average" => (float)$row["rating_average"],
    "rating_count" => (int)$row["CountUser"],
  ];
}

echo json_encode($data);
exit;
