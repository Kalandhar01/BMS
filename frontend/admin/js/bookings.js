import { showLoading, hideLoading, formatCurrency, formatDate, formatTime, showToast } from './admin.js';
import { Modal } from '../utils/modal.js';

const customers = ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Neha Gupta', 'Vikram Singh', 'Ananya Reddy', 'Arjun Nair', 'Kavita Joshi', 'Rohan Desai', 'Sneha Kapoor', 'Manish Tiwari', 'Pooja Mehta', 'Siddharth Jain', 'Deepika Choudhary', 'Karan Malhotra', 'Ishita Roy', 'Aditya Verma', 'Riya Saxena', 'Rajat Bansal', 'Tanya Arora'];
const movies = ['Jawan', 'Gadar 2', 'Oppenheimer', 'Barbie', 'Mission Impossible', 'Fighter', 'Dunki', 'Animal', 'Pushpa 2', 'Salaar'];
const statuses = ['Confirmed', 'Pending', 'Cancelled', 'Refunded'];
const paymentMethods = ['UPI', 'Card', 'NetBanking', 'Wallet'];

const demoBookings = [];
for (let i = 1; i <= 20; i++) {
  const showDate = new Date();
  showDate.setDate(showDate.getDate() + (i % 10));
  const hrs = 9 + (i % 10);
  const seatCount = 1 + (i % 4);
  const amount = 150 + i * 25;
  const status = statuses[i % 4];
  demoBookings.push({
    id: `BK-${String(i).padStart(3, '0')}`,
    customer: customers[i % customers.length],
    movie: movies[i % movies.length],
    showDate: showDate.toISOString().split('T')[0],
    showTime: `${String(hrs).padStart(2, '0')}:${i % 2 === 0 ? '30' : '00'}`,
    theatre: demoBookings.length ? '' : '',
    screen: '',
    seats: Array.from({ length: seatCount }, (_, j) => `${String.fromCharCode(65 + (i % 6))}${j + 1 + (i % 10)}`).join(', '),
    amount,
    payment: paymentMethods[i % paymentMethods.length],
    status,
    createdAt: new Date(2025, 6, 1 + (i % 20)).toISOString(),
    customerEmail: customers[i % customers.length].toLowerCase().replace(' ', '.') + '@email.com',
    customerPhone: `+91 98765 ${String(40000 + i).slice(1)}`,
  });
}

let bookings = [...demoBookings];
let currentPage = 1;
const perPage = 10;

const getFilteredBookings = () => {
  const search = (document.getElementById('bookingSearch')?.value || '').toLowerCase();
  const status = document.getElementById('bookingStatusFilter')?.value || '';
  const dateFrom = document.getElementById('bookingDateFrom')?.value || '';
  const dateTo = document.getElementById('bookingDateTo')?.value || '';

  return bookings.filter((b) => {
    if (search && !b.id.toLowerCase().includes(search) && !b.customer.toLowerCase().includes(search)) return false;
    if (status && b.status.toLowerCase() !== status) return false;
    if (dateFrom && b.showDate < dateFrom) return false;
    if (dateTo && b.showDate > dateTo) return false;
    return true;
  });
};

const paginate = (data) => {
  const total = data.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (currentPage - 1) * perPage;
  return { items: data.slice(start, start + perPage), total, totalPages, page: currentPage };
};

const statusBadge = (status) => {
  const map = { Confirmed: 'success', Pending: 'warning', Cancelled: 'danger', Refunded: 'info' };
  return `<span class="badge badge-${map[status] || 'secondary'}">${status}</span>`;
};

const renderTable = () => {
  const tbody = document.getElementById('bookingsTableBody');
  if (!tbody) return;

  const filtered = getFilteredBookings();
  const { items, total, totalPages } = paginate(filtered);

  const count = document.getElementById('bookingCount');
  if (count) count.textContent = `Showing ${total} bookings`;

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">No bookings found</td></tr>`;
    renderPagination(0, 0);
    return;
  }

  tbody.innerHTML = items.map((b) => `
    <tr>
      <td><code style="font-size:12px;">${b.id}</code></td>
      <td>${b.customer}</td>
      <td>${b.movie}</td>
      <td>${formatDate(b.showDate)} ${formatTime(b.showTime)}</td>
      <td>${b.seats}</td>
      <td>${formatCurrency(b.amount)}</td>
      <td>${b.payment}</td>
      <td>${statusBadge(b.status)}</td>
      <td>${formatDate(b.createdAt)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-view" data-id="${b.id}" title="View Details">👁</button>
          ${b.status === 'Confirmed' ? `<button class="btn-icon btn-cancel" data-id="${b.id}" title="Cancel">❌</button>` : ''}
          ${b.status === 'Cancelled' ? `<button class="btn-icon btn-refund" data-id="${b.id}" title="Refund">💰</button>` : ''}
        </div>
      </td>
    </tr>
  `).join('');

  renderPagination(totalPages, total);

  tbody.querySelectorAll('.btn-view').forEach((btn) => btn.addEventListener('click', () => viewBooking(btn.dataset.id)));
  tbody.querySelectorAll('.btn-cancel').forEach((btn) => btn.addEventListener('click', () => cancelBooking(btn.dataset.id)));
  tbody.querySelectorAll('.btn-refund').forEach((btn) => btn.addEventListener('click', () => refundBooking(btn.dataset.id)));
};

const renderPagination = (totalPages, total) => {
  const container = document.getElementById('bookingsPagination');
  if (!container) return;
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  let html = '<div class="pagination">';
  html += `<button class="page-btn" data-page="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''}>← Prev</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  html += `<button class="page-btn" data-page="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''}>Next →</button>`;
  html += '</div>';
  container.innerHTML = html;

  container.querySelectorAll('.page-btn:not([disabled])').forEach((btn) => btn.addEventListener('click', () => {
    const p = parseInt(btn.dataset.page);
    if (p && p !== currentPage) { currentPage = p; renderTable(); }
  }));
};

const viewBooking = (id) => {
  const b = bookings.find((bk) => bk.id === id);
  if (!b) return;

  const timeline = [
    { event: 'Booking Created', time: formatDate(b.createdAt) + ' ' + formatTime(b.createdAt.split('T')[1]?.slice(0, 5) || '00:00') },
    { event: b.status === 'Confirmed' ? 'Payment Confirmed' : 'Payment Pending', time: formatDate(b.createdAt) },
    { event: b.status === 'Cancelled' ? 'Booking Cancelled' : b.status === 'Refunded' ? 'Refund Processed' : 'Ticket Generated', time: formatDate(b.showDate) },
  ];

  const timelineHtml = timeline.map((t) => `
    <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;">
      <div style="width:8px;height:8px;border-radius:50%;background:#6366F1;margin-top:6px;flex-shrink:0;"></div>
      <div>
        <div style="color:#fff;font-size:13px;">${t.event}</div>
        <div style="color:rgba(255,255,255,0.4);font-size:11px;">${t.time}</div>
      </div>
    </div>
  `).join('');

  const contentHtml = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div><strong style="color:#fff;">Booking ID:</strong> <code>${b.id}</code></div>
      <div><strong style="color:#fff;">Customer:</strong> ${b.customer}</div>
      <div><strong style="color:#fff;">Email:</strong> ${b.customerEmail}</div>
      <div><strong style="color:#fff;">Phone:</strong> ${b.customerPhone}</div>
      <div><strong style="color:#fff;">Movie:</strong> ${b.movie}</div>
      <div><strong style="color:#fff;">Show:</strong> ${formatDate(b.showDate)} at ${formatTime(b.showTime)}</div>
      <div><strong style="color:#fff;">Seats:</strong> ${b.seats}</div>
      <div><strong style="color:#fff;">Amount:</strong> ${formatCurrency(b.amount)}</div>
      <div><strong style="color:#fff;">Payment:</strong> ${b.payment}</div>
      <div><strong style="color:#fff;">Status:</strong> ${statusBadge(b.status)}</div>
    </div>
    <div style="margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06);">
      <h4 style="color:#fff;margin:0 0 16px;font-size:14px;">Booking Timeline</h4>
      ${timelineHtml}
    </div>
  `;

  Modal.show({ title: `Booking Details - ${b.id}`, content: contentHtml, size: 'lg' });
};

const cancelBooking = async (id) => {
  const b = bookings.find((bk) => bk.id === id);
  if (!b) return;
  const confirmed = await Modal.confirm({ title: 'Cancel Booking', message: `Cancel booking ${b.id} for ${b.customer}? The customer will be notified.`, confirmText: 'Cancel Booking', type: 'warning' });
  if (confirmed) {
    b.status = 'Cancelled';
    renderTable();
    showToast('Booking cancelled successfully', 'success');
  }
};

const refundBooking = async (id) => {
  const b = bookings.find((bk) => bk.id === id);
  if (!b) return;
  const confirmed = await Modal.confirm({ title: 'Process Refund', message: `Process refund of ${formatCurrency(b.amount)} for booking ${b.id}?`, confirmText: 'Process Refund', type: 'danger' });
  if (confirmed) {
    b.status = 'Refunded';
    renderTable();
    showToast(`Refund of ${formatCurrency(b.amount)} processed successfully`, 'success');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('bookingSearch');
  if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; renderTable(); });

  ['bookingStatusFilter', 'bookingDateFrom', 'bookingDateTo'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => { currentPage = 1; renderTable(); });
  });

  const exportBtn = document.getElementById('exportBookingsBtn');
  if (exportBtn) exportBtn.addEventListener('click', () => showToast('Bookings exported successfully', 'success'));

  renderTable();
});
