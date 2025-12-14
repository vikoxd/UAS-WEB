console.log("fotografer.js loaded");

function rupiah(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return "-";
  return "Rp " + num.toLocaleString("id-ID") + " / Jam";
}

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// buat id container yang aman dan konsisten
function slugifyId(s) {
  return String(s || "lainnya")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}

function ratingText(avg, count) {
  const a = Number(avg);
  const c = Number(count);

  const safeAvg = Number.isFinite(a) ? a : 0;
  const safeCount = Number.isFinite(c) ? c : 0;

  return `${safeAvg.toFixed(2)}/5 (${safeCount} User)`;
}

function resolvePhotoSrc(photoValue) {
  // DB kamu isinya: "img/fotograferProfile/elnore.jpg"
  // karena file html ada di /html/, maka perlu "../" di depannya
  const p = String(photoValue || "").trim();

  if (!p) return "../img/default-avatar.png";

  // kalau sudah full URL
  if (p.startsWith("http://") || p.startsWith("https://")) return p;

  // kalau sudah absolute path
  if (p.startsWith("/")) return p;

  // default: path relatif dari /html/ -> naik 1 folder
  return "../" + p;
}

function cardHtml(p) {
  // DB kamu sudah simpan: img/fotograferProfile/xxxx.jpg
  // jadi untuk HTML di /html, path harus diawali ../
  const imgSrc = p.photo ? `../${String(p.photo).replace(/^\/+/, "")}` : `../img/default-avatar.png`;

  // INI YANG PENTING: arahkan ke detail.html?id=ID
  const detailHref = `detail.html?id=${encodeURIComponent(p.id_fotografer)}`;

  return `
    <div class="card">
      <div class="card-img">
        <img src="${imgSrc}" alt="${escapeHtml(p.fullName)}"
             onerror="this.src='../img/default-avatar.png'">
      </div>
      <div class="card-body">
        <h3>${escapeHtml(p.fullName)}</h3>
        <p class="price">${rupiah(p.price_per_hour)}</p>

        <!-- rating format yang kamu mau -->
        <div class="rating">
          ${Number(p.rating_average ?? 0).toFixed(2)}/5 (${Number(p.rating_count ?? 0)} User)
        </div>

        <a href="${detailHref}"><button>Book Now</button></a>
      </div>
    </div>
  `;
}


function groupByCity(list) {
  const m = new Map();
  list.forEach((p) => {
    const city = p.domisili || "Lainnya";
    if (!m.has(city)) m.set(city, []);
    m.get(city).push(p);
  });
  return m;
}

async function loadFotografer() {
  const section = document.querySelector(".portfolio-section");
  if (!section) return;

  try {
    const res = await fetch("../php/getPublicFotografer.php", { cache: "no-store" });
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("API error:", data);
      return;
    }

    section.innerHTML = "";

    // biar urutan kota konsisten
    const grouped = groupByCity(data);
    const cities = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b, "id"));

    for (const city of cities) {
      const list = grouped.get(city) || [];
      const cityId = "city-" + slugifyId(city);

      section.insertAdjacentHTML("beforeend", `<h2>${escapeHtml(city)}</h2>`);
      section.insertAdjacentHTML("beforeend", `<div class="card-container" id="${cityId}"></div>`);

      const container = document.getElementById(cityId);
      if (container) container.innerHTML = list.map(cardHtml).join("");
    }
  } catch (err) {
    console.error("loadFotografer error:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadFotografer);
