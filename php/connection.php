<?php
// Konfigurasi database
$host     = "localhost";
$user     = "root";
$password = "";
$database = "findHappiness";

// Membuat koneksi
$koneksi = mysqli_connect($host, $user, $password, $database);

// Mengecek koneksi
if (!$koneksi) {
    die("Koneksi database gagal: " . mysqli_connect_error());
}

// Set UTF-8
mysqli_set_charset($koneksi, "utf8");
?>
