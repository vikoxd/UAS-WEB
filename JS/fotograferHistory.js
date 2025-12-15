// ================= CONFIG =================
const API_LIST = "../php/get_fotografer_bookings.php";
const API_UPDATE = "../php/update_booking_status.php";

// ================= HELPERS =================
function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[m]));
}

function escapeHtmlAttr(str) {
  return escapeHtml(str).replace(/"/g, "&quot;");
}

function formatBookingCode(code) {
  if (!code) return "-";
  return code.startsWith("#") ? code : `#${code}`;
}

function safeRp(val) {
  if (val === null || val === undefined || val === "") return "-";
  const num = Number(val);
  if (isNaN(num)) return val;
  return "Rp " + num.toLocaleString("id-ID");
}

function getRowByBookingId(bookingIdWithHash) {
  const id = bookingIdWithHash.replace("#", "");
  return document.getElementById(`booking-${id}`);
}

// ================= STATUS UI =================
function setStatusBadge(row, status) {
  const cell = row.querySelector("td:nth-child(4)");
  const badge = cell.querySelector(".status-badge");
  badge.className = "status-badge";

  switch (status) {
    case "new":
      badge.classList.add("pending");
      badge.textContent = "Pesanan Baru";
      break;
    case "accepted":
      badge.classList.add("confirmed");
      badge.textContent = "Menunggu Pembayaran";
      break;
    case "paid":
      badge.classList.add("completed");
      badge.textContent = "Dibayar (Siap Sesi)";
      break;
    case "completed":
      badge.classList.add("confirmed");
      badge.textContent = "Selesai (Menunggu Rating)";
      badge.style.backgroundColor = "#e6e6e6";
      badge.style.color = "#555";
      break;
    case "rejected":
      badge.classList.add("cancelled");
      badge.textContent = "Ditolak";
      break;
    default:
      badge.classList.add("pending");
      badge.textContent = status;
  }
}

function renderActions(row) {
  const status = row.dataset.status;
  const bookingText = row.querySelector(".booking-id").textContent.trim();
  const aksiCell = row.querySelector("td:nth-child(5)");

  const detailBtn = `
    <button class="detail-btn" onclick="openDetailModal('${bookingText}')">
      <i class="fas fa-info-circle"></i> Detail
    </button>
  `;

  let html = "";

  if (status === "new") {
    html = `
      <button class="complete-btn" style="background:#059669" 
        onclick="confirmBooking('${bookingText}','accepted')">
        <i class="fas fa-check"></i> Terima
      </button>
      <button class="complete-btn" style="background:#dc2626;margin-right:8px"
        onclick="confirmBooking('${bookingText}','rejected')">
        <i class="fas fa-times"></i> Tolak
      </button>
      ${detailBtn}
    `;
  } else if (status === "accepted") {
    html = `
      <button class="complete-btn" disabled
        style="background:#9ca3af;cursor:not-allowed;margin-right:8px">
        <i class="fas fa-hourglass-half"></i> Menunggu Bayar
      </button>
      ${detailBtn}
    `;
  } else if (status === "paid") {
    html = `
      <button class="complete-btn"
        onclick="completeSession('${bookingText}')">
        <i class="fas fa-check-circle"></i> Selesaikan Sesi
      </button>
      ${detailBtn}
    `;
  } else {
    html = `
      <button class="complete-btn" disabled
        style="background:#ccc;cursor:not-allowed;margin-right:8px">
        <i class="fas fa-check-double"></i> Selesai
      </button>
      ${detailBtn}
    `;
  }

  aksiCell.innerHTML = html;
}

// ================= RENDER TABLE =================
function buildRow(item) {
  const code = String(item.booking_code || "").replace("#", "");
  const bookingText = formatBookingCode(code || `B${item.booking_id}`);

  return `
    <tr id="booking-${code || `B${item.booking_id}`}"
        data-booking-id="${item.booking_id}"
        data-customer="${escapeHtmlAttr(item.customer_name)}"
        data-date="${escapeHtmlAttr(item.booking_date)}"
        data-time="${escapeHtmlAttr(item.booking_time)}"
        data-location="${escapeHtmlAttr(item.location)}"
        data-price="${escapeHtmlAttr(safeRp(item.amount))}"
        data-status="${escapeHtmlAttr(item.booking_status)}"
    >
      <td class="booking-id">${bookingText}</td>
      <td>${escapeHtml(item.customer_name)}</td>
      <td>${escapeHtml(item.booking_date)}</td>
      <td><span class="status-badge pending">-</span></td>
      <td></td>
    </tr>
  `;
}

async function loadBookings() {
  const tbody = document.getElementById("fotografer-history-body");
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center">Memuat data...</td></tr>`;

  try {
    const res = await fetch(API_LIST, { credentials: "include" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal memuat data.");

    if (!data.bookings || data.bookings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center">Belum ada booking</td></tr>`;
      return;
    }

    tbody.innerHTML = data.bookings.map(buildRow).join("");

    document.querySelectorAll("#fotografer-history-body tr").forEach((row) => {
      setStatusBadge(row, row.dataset.status);
      renderActions(row);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red">${err.message}</td></tr>`;
  }
}

// ================= DETAIL MODAL =================
window.openDetailModal = function (bookingIdWithHash) {
  const row = getRowByBookingId(bookingIdWithHash);
  if (!row) return;

  document.getElementById("detailBookingId").textContent = bookingIdWithHash;
  document.getElementById("detailCustomer").textContent = row.dataset.customer || "-";
  document.getElementById("detailDate").textContent = row.dataset.date || "-";
  document.getElementById("detailTime").textContent = row.dataset.time || "-";
  document.getElementById("detailLocation").textContent = row.dataset.location || "-";
  document.getElementById("detailPrice").textContent = row.dataset.price || "-";

  document.getElementById("detailModal").style.display = "block";
};

window.closeDetailModal = function () {
  document.getElementById("detailModal").style.display = "none";
};

// ================= UPDATE STATUS =================
async function updateStatusToServer(bookingIdDb, newStatus) {
  const fd = new FormData();
  fd.append("booking_id", bookingIdDb);
  fd.append("status", newStatus);

  const res = await fetch(API_UPDATE, {
    method: "POST",
    body: fd,
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Gagal update status.");
  return data;
}

window.confirmBooking = async function (bookingIdWithHash, newStatus) {
  const row = getRowByBookingId(bookingIdWithHash);
  if (!row) return alert("Booking tidak ditemukan.");

  const bookingIdDb = Number(row.dataset.bookingId);
  if (!bookingIdDb) return alert("booking_id tidak valid.");

  try {
    await updateStatusToServer(bookingIdDb, newStatus);
    row.dataset.status = newStatus;
    setStatusBadge(row, newStatus);
    renderActions(row);
    alert(newStatus === "accepted" ? "Booking diterima ✅" : "Booking ditolak ✅");
  } catch (err) {
    alert(err.message);
  }
};

window.completeSession = async function (bookingIdWithHash) {
  const row = getRowByBookingId(bookingIdWithHash);
  if (!row) return;

  const bookingIdDb = Number(row.dataset.bookingId);
  try {
    await updateStatusToServer(bookingIdDb, "completed");
    row.dataset.status = "completed";
    setStatusBadge(row, "completed");
    renderActions(row);
    alert("Sesi selesai ✅");
  } catch (err) {
    alert(err.message);
  }
};

// ================= INIT =================
document.addEventListener("DOMContentLoaded", loadBookings);
