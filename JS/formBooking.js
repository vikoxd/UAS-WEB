document.addEventListener("DOMContentLoaded", () => {
  // 1. Ambil id fotografer dari URL (OPS I A: ?id=3)
  const params = new URLSearchParams(window.location.search);
  const idFotografer = params.get("id");

  if (!idFotografer) {
    alert("ID fotografer tidak ditemukan. Silakan pilih fotografer lagi.");
    // optional redirect
    // window.location.href = "Pricing.html";
    return;
  }

  // 2. Isi hidden input id_fotografer
  const idInput = document.getElementById("id_fotografer");
  if (!idInput) {
    alert("Hidden input id_fotografer tidak ditemukan di form.");
    return;
  }
  idInput.value = idFotografer;

  // 3. Event tombol kembali ke home di modal
  const goToHomeBtn = document.getElementById("goToHomeBtn");
  if (goToHomeBtn) {
    goToHomeBtn.addEventListener("click", () => {
      window.location.href = "Homepage.html";
    });
  }

  // 4. Submit form
  const form = document.getElementById("bookingForm");
  if (!form) {
    alert("Form booking tidak ditemukan.");
    return;
  }

  form.addEventListener("submit", submitBooking);
});

async function submitBooking(e) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) submitBtn.disabled = true;

  try {
    const formData = new FormData(form);

    // DEBUG (hapus kalau sudah yakin)
    // console.log("id_fotografer:", formData.get("id_fotografer"));

    const res = await fetch("../php/create_booking.php", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const text = await res.text();
    console.log("RAW RESPONSE:", text);

    let result;
    try {
    result = JSON.parse(text);
    } catch (e) {
    alert("Response bukan JSON:\n" + text.slice(0, 400));
    return;
    }


    if (!res.ok) {
      alert(result.error || "Gagal mengirim booking.");
      return;
    }

    // 5. Tampilkan modal sukses
    const modal = document.getElementById("successModal");
    if (modal) modal.style.display = "flex";

  } catch (err) {
    alert("Terjadi kesalahan: " + err.message);
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}
