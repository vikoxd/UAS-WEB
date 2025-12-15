<?php
require __DIR__ . "/connection.php"; 
// block GET
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  header("Location: ../html/joinusform.html");
  exit;
}

$nama         = trim($_POST["nama"] ?? "");
$email        = trim($_POST["email"] ?? "");
$alamat       = trim($_POST["alamat"] ?? "");
$nik          = trim($_POST["nik"] ?? "");
$jenis_kamera = trim($_POST["jenis_kamera"] ?? "");
$motivasi     = trim($_POST["motivasi"] ?? "");
$kategori     = $_POST["kategori"] ?? [];

$errors = [];
if ($nama === "") $errors[] = "Nama wajib.";
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Email tidak valid.";
if ($alamat === "") $errors[] = "Alamat wajib.";
if ($nik === "" || !preg_match('/^\d{8,20}$/', $nik)) $errors[] = "NIK harus angka 8–20 digit.";
if ($jenis_kamera === "") $errors[] = "Jenis kamera wajib.";
if ($motivasi === "") $errors[] = "Motivasi wajib.";
if (!is_array($kategori) || count($kategori) < 1) $errors[] = "Pilih minimal 1 kategori.";

if ($errors) {
  http_response_code(422);
  echo "<h3>Validasi gagal:</h3><ul><li>" . implode("</li><li>", $errors) . "</li></ul>";
  exit;
}

// mapping value checkbox -> namaGenre di DB
$kategoriMap = [
  "Sport"     => "Sport Photography",
  "Fashion"   => "Fashion Photography",
  "Wedding"   => "Wedding Photography",
  "Couple"    => "Couple Photography",
  "Street"    => "Street Photography",
  "Lifestyle" => "Lifestyle Photography",
  "Portrait"  => "Potrait Photography", // sesuai DB kamu (typo Potrait)
  "Nature"    => "Nature Photography",
];

$kategori = array_values(array_unique(array_map('strval', $kategori)));
$kategoriNamaGenre = [];
foreach ($kategori as $k) {
  if (isset($kategoriMap[$k])) $kategoriNamaGenre[] = $kategoriMap[$k];
}
if (count($kategoriNamaGenre) < 1) {
  http_response_code(422);
  exit("Kategori tidak valid.");
}

mysqli_begin_transaction($koneksi);

try {
  // 1) cari user by email
  $stmt = mysqli_prepare($koneksi, "SELECT id_user FROM user WHERE email = ? LIMIT 1");
  mysqli_stmt_bind_param($stmt, "s", $email);
  mysqli_stmt_execute($stmt);
  $res = mysqli_stmt_get_result($stmt);
  $row = mysqli_fetch_assoc($res);

  if ($row) {
    $id_user = (int)$row["id_user"];
    $stmt = mysqli_prepare($koneksi, "UPDATE user SET fullName=?, role='Fotografer' WHERE id_user=?");
    mysqli_stmt_bind_param($stmt, "si", $nama, $id_user);
    mysqli_stmt_execute($stmt);
  } else {
    $defaultPassword = "12345678";
    $passwordHash = password_hash($defaultPassword, PASSWORD_DEFAULT);

    $stmt = mysqli_prepare($koneksi, "INSERT INTO user (fullName,email,password,role) VALUES (?,?,?,'Fotografer')");
    mysqli_stmt_bind_param($stmt, "sss", $nama, $email, $passwordHash);
    mysqli_stmt_execute($stmt);
    $id_user = (int)mysqli_insert_id($koneksi);
  }

  // 2) insert fotografer
  $stmt = mysqli_prepare($koneksi, "
    INSERT INTO fotografer (id_user, domisili, NIK, motivasi, RatingValue, CountUser, RatingAverage, jenisKamera)
    VALUES (?, ?, ?, ?, 0, 0, 0.00, ?)
  ");
  mysqli_stmt_bind_param($stmt, "issss", $id_user, $alamat, $nik, $motivasi, $jenis_kamera);
  mysqli_stmt_execute($stmt);
  $id_fotografer = (int)mysqli_insert_id($koneksi);

  // 3) ambil id_genre dari genre
  // bikin IN (?,?,...)
  $placeholders = implode(",", array_fill(0, count($kategoriNamaGenre), "?"));
  $types = str_repeat("s", count($kategoriNamaGenre));
  $sql = "SELECT id_genre FROM genre WHERE namaGenre IN ($placeholders)";
  $stmt = mysqli_prepare($koneksi, $sql);
  mysqli_stmt_bind_param($stmt, $types, ...$kategoriNamaGenre);
  mysqli_stmt_execute($stmt);
  $res = mysqli_stmt_get_result($stmt);

  $idGenres = [];
  while ($g = mysqli_fetch_assoc($res)) {
    $idGenres[] = (int)$g["id_genre"];
  }
  if (count($idGenres) < 1) {
    throw new Exception("Genre tidak ditemukan di DB.");
  }

  // 4) insert genre_fotografer
  $stmt = mysqli_prepare($koneksi, "INSERT INTO genre_fotografer (id_fotografer, id_genre) VALUES (?, ?)");
  foreach ($idGenres as $id_genre) {
    mysqli_stmt_bind_param($stmt, "ii", $id_fotografer, $id_genre);
    mysqli_stmt_execute($stmt);
  }

  mysqli_commit($koneksi);

  header("Location: ../html/joinusform.html?success=1");
  exit;

} catch (Throwable $e) {
  mysqli_rollback($koneksi);
  http_response_code(500);
  echo "Gagal menyimpan data: " . htmlspecialchars($e->getMessage());
  exit;
}
