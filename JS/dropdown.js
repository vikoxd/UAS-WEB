// Logic untuk Dropdown Profil (Berlaku di semua halaman)

document.addEventListener('DOMContentLoaded', () => {
    const profileToggle = document.querySelector('.profile-toggle');
    const dropdownContent = document.querySelector('.dropdown-content');

    if (profileToggle && dropdownContent) {
        // 1. Toggle tampilan dropdown saat ikon diklik
        profileToggle.addEventListener('click', function(event) {
            event.preventDefault();
            dropdownContent.classList.toggle('show');
        });

        // 2. Tutup dropdown jika user mengklik di mana saja di luar area dropdown
        window.addEventListener('click', function(event) {
            const dropdown = document.querySelector('.dropdown');
            
            // Cek apakah yang diklik BUKAN bagian dari elemen dropdown
            if (dropdown && !dropdown.contains(event.target)) {
                dropdownContent.classList.remove('show');
            }
        });
    }
});