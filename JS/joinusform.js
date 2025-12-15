// File: ../JS/joinus-final.js

document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    const successModal = document.getElementById('successModal');
    const goToHomeBtn = document.getElementById('goToHomeBtn');
    
    // Elemen Dropdown
    const profileToggle = document.querySelector('.profile-toggle');
    const dropdownContent = document.querySelector('.dropdown-content');

    // 1. Dropdown Logic
    if (profileToggle && dropdownContent) {
        profileToggle.addEventListener('click', (e) => {
            e.preventDefault();
            dropdownContent.classList.toggle('show');
        });
    }

    // Menutup dropdown saat klik di luar area
    window.addEventListener('click', (e) => {
        if (profileToggle && dropdownContent && !e.target.closest('.dropdown')) {
            if (dropdownContent.classList.contains('show')) {
                dropdownContent.classList.remove('show');
            }
        }
    });

    // 2. Form Submission & Validation Logic
    if (registrationForm) {
        registrationForm.addEventListener('submit', submitRegistration);
    }
    
    if (goToHomeBtn) {
        goToHomeBtn.addEventListener('click', () => {
            window.location.href = 'Homepage.html'; 
        });
    }

    // Handler untuk menutup modal saat user klik di luar kotak
    window.onclick = function(event) {
        if (event.target === successModal) {
            successModal.style.display = "none";
            window.location.href = 'Homepage.html'; 
        }
    }

    function submitRegistration(event) {
        event.preventDefault(); 
        
        if (!validateForm()) {
            return;
        }

        // --- Simulasi Pengiriman Data ---
        console.log("Data registrasi dikirim: ", collectFormData());

        // Tampilkan Modal Sukses
        if (successModal) {
            registrationForm.reset();
            successModal.style.display = 'block';
        }
    }
    
    function collectFormData() {
        const formData = new FormData(registrationForm);
        const data = {};
        const kategori = [];
        
        for (const [key, value] of formData.entries()) {
            if (key === 'kategori[]') {
                kategori.push(value);
            } else {
                data[key] = value;
            }
        }
        
        data['kategori'] = kategori;
        return data;
    }

    /**
     * Fungsi Validasi Form Sederhana (Memastikan minimal 1 kategori dipilih)
     */
    function validateForm() {
        let isValid = true;
        
        // 1. Validasi semua input required (memberi border merah pada yang kosong)
        registrationForm.querySelectorAll('[required]').forEach(input => {
            if (!input.value) {
                input.style.border = '1px solid red';
                isValid = false;
            } else {
                input.style.border = '';
            }
        });
        
        // 2. Validasi minimal 1 checkbox dipilih
        const selectedKategori = registrationForm.querySelectorAll('input[name="kategori[]"]:checked').length;
        const checkboxGroup = document.querySelector('.form-group .checkbox-group');
        
        if (selectedKategori === 0) {
            checkboxGroup.style.border = '1px solid red';
            isValid = false;
        } else {
            // Kembalikan border normal (ungu muda)
            checkboxGroup.style.border = '1px solid #e9d5f5'; 
        }
        
        if (!isValid) {
            alert("Mohon lengkapi semua field yang diperlukan dan pilih minimal satu Kategori Fotografi.");
        }
        
        return isValid;
    }

});