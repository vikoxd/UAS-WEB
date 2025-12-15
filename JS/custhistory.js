// ../JS/custhistory.js

// ===== API CONFIG (baru) =====
const API_CUST_LIST = "../php/get_customer_bookings.php";
const API_CUST_UPDATE = "../php/update_booking_status_customer.php";
const API_SUBMIT_RATING = "../php/submit_rating.php";

// ===== Helpers =====
function getRowByBookingId(bookingIdWithHash) {
  // bookingIdWithHash contoh: "#B4" atau "#C10001"
  const id = bookingIdWithHash.replace("#", "");
  return document.getElementById(`booking-${id}`);
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[m]));
}

function normalizeDbStatusToCode(dbStatus) {
  // DB: Menunggu Konfirmasi, Menunggu Pembayaran, Terbayar, Selesai, Ditolak
  const s = String(dbStatus || "").toLowerCase().trim();

  if (s.includes("konfirmasi")) return "new";
  if (s.includes("pembayaran")) return "accepted";
  if (s.includes("terbayar") || s.includes("dibayar")) return "paid";
  if (s.includes("selesai")) return "completed";
  if (s.includes("tolak")) return "rejected";

  // fallback
  return dbStatus || "new";
}

function codeStatusToDb(statusCode) {
  switch (statusCode) {
    case "new":
      return "Menunggu Konfirmasi";
    case "accepted":
      return "Menunggu Pembayaran";
    case "paid":
      return "Terbayar";
    case "completed":
      return "Selesai";
    case "rejected":
      return "Ditolak";
    default:
      return statusCode;
  }
}

// ===== STATUS UI =====
function setStatusBadge(row, status) {
  const statusCell = row.querySelector("td:nth-child(4)");
  const badge = statusCell.querySelector(".status-badge");

  badge.className = "status-badge";
  badge.style.backgroundColor = "";
  badge.style.color = "";

  switch (status) {
    case "new":
      badge.classList.add("pending");
      badge.textContent = "Menunggu Konfirmasi";
      break;

    case "accepted":
      badge.classList.add("confirmed");
      badge.textContent = "Menunggu Pembayaran";
      break;

    case "paid":
      badge.classList.add("completed");
      badge.textContent = "Siap Sesi (Dibayar)";
      break;

    case "completed":
      badge.classList.add("confirmed");
      badge.textContent = "Sesi Selesai";
      badge.style.backgroundColor = "#e6e6e6";
      badge.style.color = "#555";
      break;

    case "rejected":
      badge.classList.add("cancelled");
      badge.textContent = "Ditolak Fotografer";
      break;

    default:
      badge.classList.add("pending");
      badge.textContent = status;
  }
}

function renderActions(row) {
  const status = row.dataset.status; // new/accepted/paid/completed/rejected
  const bookingId = row.querySelector(".booking-id").textContent.trim();
  const aksiCell = row.querySelector("td:nth-child(5)");

  const detailBtn = `
    <button class="detail-btn" onclick="openDetailModal('${bookingId}')">
      <i class="fas fa-info-circle"></i> Detail
    </button>
  `;

  let extra = "";

  // Bayar hanya saat accepted
  if (status === "accepted") {
    extra = `
      <button class="complete-btn" style="background-color: #f7a01c;" onclick="payBooking('${bookingId}')">
        <i class="fas fa-wallet"></i> Bayar Sekarang
      </button>
    `;
  } else if (status === "paid") {
    extra = `
      <button class="complete-btn" onclick="completeSession('${bookingId}')">
        <i class="fas fa-calendar-check"></i> Selesaikan Pesanan
      </button>
    `;
  } else if (status === "completed") {
    // jika sudah rating, tombol disabled
    if (row.dataset.rated === "true") {
      extra = `
        <button class="rating-btn" disabled style="opacity:.6; cursor:not-allowed;">
          <i class="fas fa-star"></i> Sudah Dirating
        </button>
      `;
    } else {
      extra = `
        <button class="rating-btn" onclick="openRatingModal('${bookingId}')">
          <i class="fas fa-star"></i> Beri Rating
        </button>
      `;
    }
  }

  aksiCell.innerHTML = `${extra}${detailBtn}`;
}

// ===== Detail Modal =====
window.openDetailModal = function (bookingIdWithHash) {
  const row = getRowByBookingId(bookingIdWithHash);
  if (!row) return;

  document.getElementById("detailBookingId").textContent = bookingIdWithHash;
  document.getElementById("detailFotografer").textContent = row.dataset.fotografer || "-";
  document.getElementById("detailDate").textContent = row.dataset.date || "-";
  document.getElementById("detailPrice").textContent = row.dataset.price || "-";
  document.getElementById("detailTime").textContent = row.dataset.time || "TBD";
  document.getElementById("detailLocation").textContent = row.dataset.location || "TBD";

  document.getElementById("detailModal").style.display = "block";
};

window.closeDetailModal = function () {
  document.getElementById("detailModal").style.display = "none";
};

// ===== Rating Modal + Stars (tetap) =====
let currentRating = 0;
let currentRatingBookingId = "";
let currentRatingRow = null;

function resetStars() {
  const stars = document.querySelectorAll("#starsContainer .star");
  stars.forEach((s) => s.classList.remove("active"));
}

function paintStars(value) {
  const stars = document.querySelectorAll("#starsContainer .star");
  stars.forEach((s) => {
    const v = Number(s.dataset.value);
    if (v <= value) s.classList.add("active");
    else s.classList.remove("active");
  });
}

function initStars() {
  const stars = document.querySelectorAll("#starsContainer .star");

  stars.forEach((star) => {
    star.addEventListener("mouseenter", () => {
      paintStars(Number(star.dataset.value));
    });

    star.addEventListener("mouseleave", () => {
      paintStars(currentRating);
    });

    star.addEventListener("click", () => {
      currentRating = Number(star.dataset.value);
      paintStars(currentRating);
    });
  });
}

window.openRatingModal = function (bookingIdWithHash) {
  const row = getRowByBookingId(bookingIdWithHash);
  if (!row) return;

  // jika sudah rating, jangan buka modal
  if (row.dataset.rated === "true") {
    alert("Kamu sudah memberikan rating untuk booking ini.");
    return;
  }

  currentRating = 0;
  currentRatingBookingId = bookingIdWithHash;
  currentRatingRow = row;

  document.getElementById("ratingBookingId").textContent = bookingIdWithHash;
  document.getElementById("ratingFotografer").textContent = row.dataset.fotografer || "-";
  document.getElementById("ratingReview").value = "";

  resetStars();
  document.getElementById("ratingModal").style.display = "block";
};

window.closeRatingModal = function () {
  document.getElementById("ratingModal").style.display = "none";
};

// ====== SUBMIT RATING (DB via testimoni -> update fotografer) ======
window.submitRating = async function () {
  if (!currentRatingRow) return;

  const review = document.getElementById("ratingReview").value.trim();

  if (currentRating === 0) {
    alert("Pilih bintang rating dulu ya 😊");
    return;
  }

  const bookingIdDb = currentRatingRow.dataset.bookingId; // angka id bookings

  try {
    const fd = new FormData();
    fd.append("booking_id", bookingIdDb);
    fd.append("rating", currentRating);
    fd.append("review", review);

    const res = await fetch(API_SUBMIT_RATING, {
      method: "POST",
      body: fd,
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal mengirim rating.");

    // === flow lama: tetap simpan localStorage (tidak dihilangkan) ===
    const id = currentRatingBookingId.replace("#", "");
    const payload = {
      bookingId: currentRatingBookingId,
      bookingIdDb,
      fotografer: currentRatingRow.dataset.fotografer || "",
      rating: currentRating,
      review,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(`rating_${id}`, JSON.stringify(payload));

    alert("Terima kasih! Rating & ulasan kamu berhasil dikirim ✅");

    currentRatingRow.dataset.rated = "true";
    renderActions(currentRatingRow);

    closeRatingModal();
  } catch (err) {
    alert(err.message);
  }
};

// ====== UPDATE STATUS KE DB ======
async function updateCustomerBookingStatus(row, newStatusCode) {
  const bookingIdDb = row.dataset.bookingId;
  if (!bookingIdDb) throw new Error("booking_id DB tidak ditemukan.");

  const fd = new FormData();
  fd.append("booking_id", bookingIdDb);
  fd.append("status", codeStatusToDb(newStatusCode));

  const res = await fetch(API_CUST_UPDATE, {
    method: "POST",
    body: fd,
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Gagal update status.");
  return data;
}

// ===== Aksi: Bayar & Selesaikan =====
window.payBooking = async function (bookingIdWithHash) {
  const row = getRowByBookingId(bookingIdWithHash);
  if (!row) return;

  try {
    await updateCustomerBookingStatus(row, "paid");

    row.dataset.status = "paid";
    setStatusBadge(row, "paid");
    renderActions(row);

    alert(`Pembayaran untuk ${bookingIdWithHash} berhasil ✅`);
  } catch (err) {
    alert(err.message);
  }
};

window.completeSession = async function (bookingIdWithHash) {
  const row = getRowByBookingId(bookingIdWithHash);
  if (!row) return;

  try {
    await updateCustomerBookingStatus(row, "completed");

    row.dataset.status = "completed";
    setStatusBadge(row, "completed");
    renderActions(row);

    alert(`Pesanan ${bookingIdWithHash} selesai ✅ Silakan beri rating.`);
  } catch (err) {
    alert(err.message);
  }
};

// ===== Close modal kalau klik area luar =====
window.addEventListener("click", (e) => {
  const detailModal = document.getElementById("detailModal");
  const ratingModal = document.getElementById("ratingModal");

  if (e.target === detailModal) closeDetailModal();
  if (e.target === ratingModal) closeRatingModal();
});

// ===== LOAD DATA DINAMIS =====
function buildCustomerRow(item) {
  const codeRaw = String(item.booking_code || "").replace("#", "");
  const code = codeRaw || `B${item.booking_id}`;
  const bookingText = code.startsWith("#") ? code : `#${code}`;

  const statusCode = normalizeDbStatusToCode(item.booking_status);
  const rated = (String(item.has_rating || "0") === "1") ? "true" : "false";

  return `
    <tr 
      id="booking-${escapeHtml(code)}"
      data-booking-id="${escapeHtml(item.booking_id)}"
      data-id-fotografer="${escapeHtml(item.id_fotografer)}"
      data-fotografer="${escapeHtml(item.photographer_name || "-")}"
      data-date="${escapeHtml(item.booking_date || "-")}"
      data-time="${escapeHtml(item.booking_time || "")}"
      data-location="${escapeHtml(item.location || "")}"
      data-status="${escapeHtml(statusCode)}"
      data-price="${escapeHtml(item.amount ? ("Rp " + Number(item.amount).toLocaleString("id-ID")) : "-")}"
      data-rated="${escapeHtml(rated)}"
    >
      <td class="booking-id">${escapeHtml(bookingText)}</td>
      <td>${escapeHtml(item.photographer_name || "-")}</td>
      <td>${escapeHtml(item.booking_date || "-")}</td>
      <td><span class="status-badge pending">-</span></td>
      <td></td>
    </tr>
  `;
}

async function loadCustomerBookings() {
  const tbody = document.getElementById("customer-history-body");
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center">Memuat data...</td></tr>`;

  try {
    const res = await fetch(API_CUST_LIST, { credentials: "include" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal memuat riwayat.");

    const list = data.bookings || [];
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center">Belum ada pesanan</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(buildCustomerRow).join("");

    document.querySelectorAll("#customer-history-body tr").forEach((row) => {
      setStatusBadge(row, row.dataset.status);

      // fallback localStorage (flow lama) jika DB belum punya flag
      const id = row.id.replace("booking-", "");
      const saved = localStorage.getItem(`rating_${id}`);
      if (saved && row.dataset.status === "completed") {
        row.dataset.rated = "true";
      }

      renderActions(row);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red">${escapeHtml(err.message)}</td></tr>`;
  }
}

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  initStars();
  loadCustomerBookings();
});
