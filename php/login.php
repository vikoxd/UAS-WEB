<?php
session_start();
include "connection.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    $email = mysqli_real_escape_string($koneksi, $_POST['email']);
    $password = mysqli_real_escape_string($koneksi, $_POST['password']);

    $query = "SELECT * FROM user WHERE email='$email' AND password='$password'";
    $result = mysqli_query($koneksi, $query);

    if (mysqli_num_rows($result) > 0) {
        
        $row = mysqli_fetch_assoc($result);

        $_SESSION['id_user'] = $row['id_user'];
        $_SESSION['fullName'] = $row['fullName'];
        $_SESSION['role'] = $row['role'];
        $_SESSION['email'] = $row['email'];

        $role = $row['role'];

        if ($role == "Admin") {
            echo "<script>alert('Welcome Admin!'); window.location='../html/admin.html';</script>";
            exit;
        } elseif ($role == "Fotografer") {
            echo "<script>alert('Welcome!'); window.location='../html/Homepage.html';</script>";
            exit;
        } else {
            // pengguna / default
            echo "<script>alert('COK!'); window.location='../html/Homepage.html';</script>";
            exit;
        }
        exit;

    } else {
        echo "<script>alert('Email atau password salah!'); window.location='../html/Login.html';</script>";
        exit;
    }
}
?>
