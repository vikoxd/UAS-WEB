console.log("detail.js loaded");

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const root = document.getElementById("detail-root");

if (!id) {
  root.innerHTML = "<p style='text-align:center;'>ID fotografer tidak ditemukan.</p>";
  throw new Error("ID tidak ada di URL");
}

fetch(`../php/getDetailFotografer.php?id=${encodeURIComponent(id)}`)
  .then(async (res) => {
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("API HTTP Error:", res.status, data);
      throw new Error(data?.message || data?.error || "HTTP Error");
    }

    return data;
  })
  .then((p) => {
    // photo di DB contoh: img/fotograferProfile/elmore.jpg
    // detail.html ada di /html, jadi "../" + photo = benar
    const imgSrc = p.photo ? `../${p.photo}` : "../img/default-avatar.png";

    const ratingText = `${Number(p.rating_average || 0).toFixed(2)}/5 (${Number(p.rating_count || 0)} User)`;

    root.innerHTML = `
      <img src="${imgSrc}" alt="Photographer" class="photographer-photo"
           onerror="this.src='../img/default-avatar.png'">

      <h2>${p.fullName || "-"}</h2>

      <p class="rating">⭐ ${ratingText}</p>

      <p class="camera">${p.jenisKamera || "-"}</p>

      <a href="formBooking.html?id=${p.id_fotografer}" class="book-btn">📸 Book Photographer</a>

      <div class="tags"></div>

      <div class="info">
        <p><strong>📍 ${p.domisili || "-"}</strong></p>
        <p>📷 Instagram: <a href="#" onclick="return false;">@${p.instagram || "-"}</a></p>
      </div>

      <blockquote>
        “${p.motivasi || ""}”
      </blockquote>
    `;
  })
  .catch((err) => {
    console.error("detail load error:", err);
    root.innerHTML = `<p style="text-align:center;">Gagal memuat data. (${err.message})</p>`;
  });
