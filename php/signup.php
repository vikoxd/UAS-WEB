<?php
session_start();
include "connection.php"; // pastikan path benar

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Ambil data dari form
    $fullName = mysqli_real_escape_string($koneksi, $_POST['fullName']);
    $email    = mysqli_real_escape_string($koneksi, $_POST['email']);
    $password = mysqli_real_escape_string($koneksi, $_POST['password']);
    $role     = mysqli_real_escape_string($koneksi, $_POST['role']); // default: Pengguna

    // Cek apakah email sudah digunakan
    $checkEmail = mysqli_query($koneksi, "SELECT * FROM user WHERE email='$email'");
    if (mysqli_num_rows($checkEmail) > 0) {
        echo "<script>
                alert('Email sudah terdaftar! Gunakan email lain.');
                window.location='../html/Signup.html';
              </script>";
        exit;
    }

    // Insert ke database
    $query = "INSERT INTO user (fullName, email, password, role) 
              VALUES ('$fullName', '$email', '$password', '$role')";
    
    if (mysqli_query($koneksi, $query)) {
        
        // Setelah signup berhasil, bisa langsung login otomatis
        $_SESSION['id_user'] = mysqli_insert_id($koneksi);
        $_SESSION['fullName'] = $fullName;
        $_SESSION['role'] = $role;

        echo "<script>
                alert('Akun berhasil dibuat! Selamat datang, $fullName!');
                window.location='../html/Homepage.html';
              </script>";
        exit;

    } else {
        echo "<script>
                alert('Gagal membuat akun. Coba lagi!');
                window.location='../html/Signup.html';
              </script>";
        exit;
    }
}
?>
