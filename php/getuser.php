<?php
session_start();
header('Content-Type: application/json');

// Cek apakah user sudah login
if (!isset($_SESSION['id_user'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit;
}

// Kirim data user
echo json_encode([
    "fullName" => $_SESSION['fullName'],
    "email" => $_SESSION['email']
]);
