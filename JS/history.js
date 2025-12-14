const modal = document.getElementById("ratingModal");
            const photographerName = document.getElementById("photographerName");
            const starContainer = document.getElementById("starContainer");
            const ratingValueText = document.getElementById("ratingValueText");
            const reviewTextarea = document.getElementById("reviewText"); // Ambil elemen textarea
            let selectedRating = 0;

            // Fungsi untuk mereset input saat modal ditutup atau dibuka
            function resetModalInputs() {
                selectedRating = 0;
                reviewTextarea.value = ""; 
                updateStars();
                ratingValueText.textContent = "Pilih 1 hingga 5 Bintang";
            }

            // Fungsi untuk membuka modal
            function openRatingModal(name) {
                photographerName.textContent = name;
                resetModalInputs();
                modal.style.display = "block";
            }

            // Fungsi untuk menutup modal
            function closeRatingModal() {
                resetModalInputs();
                modal.style.display = "none";
            }

            // Fungsi untuk memperbarui tampilan bintang
            function updateStars() {
                const stars = starContainer.querySelectorAll('.star');
                stars.forEach(star => {
                    const rating = parseInt(star.getAttribute('data-rating'));
                    if (rating <= selectedRating) {
                        star.classList.remove('far'); // Ikon outline
                        star.classList.add('fas', 'active'); // Ikon penuh (active/gold)
                    } else {
                        star.classList.remove('fas', 'active');
                        star.classList.add('far');
                    }
                });
                if (selectedRating > 0) {
                    ratingValueText.textContent = `Anda memilih ${selectedRating} Bintang.`;
                }
            }

            // Event listener untuk klik bintang
            starContainer.addEventListener('click', function(e) {
                if (e.target.classList.contains('star')) {
                    selectedRating = parseInt(e.target.getAttribute('data-rating'));
                    updateStars();
                }
            });

            // Event listener untuk hover bintang (Opsional: feedback visual)
            starContainer.addEventListener('mouseover', function(e) {
                if (e.target.classList.contains('star')) {
                    const hoverRating = parseInt(e.target.getAttribute('data-rating'));
                    const stars = starContainer.querySelectorAll('.star');
                    stars.forEach(star => {
                        const rating = parseInt(star.getAttribute('data-rating'));
                        if (rating <= hoverRating) {
                            star.style.color = '#FFD700';
                        } else if (rating > selectedRating) {
                            star.style.color = '#ccc';
                        }
                    });
                }
            });

            starContainer.addEventListener('mouseout', function(e) {
                const stars = starContainer.querySelectorAll('.star');
                stars.forEach(star => {
                    const rating = parseInt(star.getAttribute('data-rating'));
                    if (rating > selectedRating) {
                        star.style.color = '#ccc';
                    }
                });
                updateStars(); // Kembali ke state rating yang dipilih
            });


            // Fungsi untuk mengirim rating (simulasi)
            function submitRating() {
                if (selectedRating === 0) {
                    alert("Harap pilih bintang 1 sampai 5 sebelum mengirim.");
                    return;
                }
                const photographer = photographerName.textContent;
                const reviewText = reviewTextarea.value.trim(); // Ambil nilai ulasan dan hapus spasi
                
                // --- Logika Pengiriman ke Backend (PHP/Database) di sini ---
                
                alert(`Terima kasih! Anda memberi ${photographer} rating ${selectedRating} Bintang.\nUlasan Anda: ${reviewText || "(Tidak ada ulasan tertulis)"}`);
                
                closeRatingModal();
            }

            // Tutup modal jika user klik di luar kotak
            window.onclick = function(event) {
                if (event.target == modal) {
                    closeRatingModal();
                }
            }