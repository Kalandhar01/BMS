import { showLoading, hideLoading, formatCurrency, formatDate, formatTime, showToast } from './admin.js';
import { Modal } from '../utils/modal.js';

const customers = ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Neha Gupta', 'Vikram Singh', 'Ananya Reddy', 'Arjun Nair', 'Kavita Joshi', 'Rohan Desai', 'Sneha Kapoor', 'Manish Tiwari', 'Pooja Mehta', 'Siddharth Jain', 'Deepika Choudhary', 'Karan Malhotra', 'Ishita Roy', 'Aditya Verma', 'Riya Saxena', 'Rajat Bansal', 'Tanya Arora'];
const methods = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet', 'PayPal'];
const payStatuses = ['Success', 'Pending', 'Failed', 'Refunded'];

const demoPayments = [];
for (let i = 1; i <= 25; i++) {
  const amount = 150 + i * 23;
  const gst = Math.round(amount * 0.18);
  const fee = Math.round(amount * 0.02);
  const total = amount + gst + fee;
  const status = payStatuses[i % 4];
  const payDate = new Date(2025, 6, 1 + (i % 25));
  demoPayments.push({
    id: `PAY-${String(i).padStart(4, '0')}`,
    bookingId: `BK-${String(i).padStart(3, '0')}`,
    customer: customers[i % customers.length],
    method: methods[i % methods.length],
    amount,
    gst,
    fee,
    total,
    status,
    date: payDate.toISOString(),
    transactionId: `TXN${String(100000 + i)}`,
    notes: '',
  });
}

let payments = [...demoPayments];
let currentPage = 1;
const perPage = 10;

const getFilteredPayments = () => {
  const search = (document.getElementById('paymentSearch')?.value || '').toLowerCase();
  const method = document.getElementById('paymentMethodFilter')?.value || '';
  const status = document.getElementById('paymentStatusFilter')?.value || '';

  return payments.filter((p) => {
    if (search && !p.id.toLowerCase().includes(search) && !p.customer.toLowerCase().includes(search) && !p.transactionId.toLowerCase().includes(search)) return false;
    if (method) {
      const methodMap = { 'credit-card': 'Credit Card', 'debit-card': 'Debit Card', 'upi': 'UPI', 'net-banking': 'Net Banking', 'wallet': 'Wallet', 'paypal': 'PayPal' };
      const mapped = methodMap[method];
      if (mapped && p.method !== mapped) return false;
    }
    if (status) {
      const statusMap = { 'completed': 'Success', 'pending': 'Pending', 'failed': 'Failed', 'refunded': 'Refunded', 'cancelled': 'Cancelled' };
      const mapped = statusMap[status];
      if (mapped && p.status !== mapped) return false;
    }
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
  const map = { Success: 'success', Pending: 'warning', Failed: 'danger', Refunded: 'info' };
  return `<span class="badge badge-${map[status] || 'secondary'}">${status}</span>`;
};

const renderTable = () => {
  const tbody = document.getElementById('paymentsTableBody');
  if (!tbody) return;

  const filtered = getFilteredPayments();
  const { items, total, totalPages } = paginate(filtered);

  const count = document.getElementById('paymentCount');
  if (count) count.textContent = `Showing ${total} payments`;

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" class="text-center text-muted">No payments found</td></tr>`;
    renderPagination(0, 0);
    return;
  }

  tbody.innerHTML = items.map((p) => `
    <tr>
      <td><code style="font-size:11px;">${p.id}</code></td>
      <td><code style="font-size:11px;">${p.bookingId}</code></td>
      <td>${p.customer}</td>
      <td>${p.method}</td>
      <td>${formatCurrency(p.amount)}</td>
      <td>${formatCurrency(p.gst)}</td>
      <td>${formatCurrency(p.fee)}</td>
      <td><strong>${formatCurrency(p.total)}</strong></td>
      <td>${statusBadge(p.status)}</td>
      <td>${formatDate(p.date)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-view" data-id="${p.id}" title="View Details">👁</button>
          ${p.status === 'Success' ? `<button class="btn-icon btn-refund" data-id="${p.id}" title="Process Refund">💰</button>` : ''}
        </div>
      </td>
    </tr>
  `).join('');

  renderPagination(totalPages, total);

  tbody.querySelectorAll('.btn-view').forEach((btn) => btn.addEventListener('click', () => viewPayment(btn.dataset.id)));
  tbody.querySelectorAll('.btn-refund').forEach((btn) => btn.addEventListener('click', () => processRefund(btn.dataset.id)));
};

const renderPagination = (totalPages, total) => {
  const container = document.getElementById('paymentsPagination');
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

const viewPayment = (id) => {
  const p = payments.find((pay) => pay.id === id);
  if (!p) return;

  const contentHtml = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div><strong style="color:#fff;">Payment ID:</strong> <code>${p.id}</code></div>
      <div><strong style="color:#fff;">Transaction ID:</strong> <code>${p.transactionId}</code></div>
      <div><strong style="color:#fff;">Booking ID:</strong> <code>${p.bookingId}</code></div>
      <div><strong style="color:#fff;">Customer:</strong> ${p.customer}</div>
      <div><strong style="color:#fff;">Payment Method:</strong> ${p.method}</div>
      <div><strong style="color:#fff;">Status:</strong> ${statusBadge(p.status)}</div>
      <div><strong style="color:#fff;">Date:</strong> ${formatDate(p.date)} at ${formatTime(p.date.split('T')[1]?.slice(0, 5) || '00:00')}</div>
      <div><strong style="color:#fff;">Amount:</strong> ${formatCurrency(p.amount)}</div>
      <div><strong style="color:#fff;">GST (18%):</strong> ${formatCurrency(p.gst)}</div>
      <div><strong style="color:#fff;">Processing Fee:</strong> ${formatCurrency(p.fee)}</div>
      <div style="grid-column:1/-1;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06);display:flex;justify-content:space-between;">
        <span style="color:#fff;font-size:16px;font-weight:600;">Total Charged</span>
        <span style="color:#10B981;font-size:18px;font-weight:700;">${formatCurrency(p.total)}</span>
      </div>
    </div>
  `;

  Modal.show({ title: 'Payment Details', content: contentHtml, size: 'md' });
};

const processRefund = async (id) => {
  const p = payments.find((pay) => pay.id === id);
  if (!p) return;
  const confirmed = await Modal.confirm({ title: 'Process Refund', message: `Refund ${formatCurrency(p.total)} to ${p.customer}?`, confirmText: 'Process Refund', type: 'danger' });
  if (confirmed) {
    p.status = 'Refunded';
    renderTable();
    showToast(`Refund of ${formatCurrency(p.total)} processed successfully`, 'success');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('paymentSearch');
  if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; renderTable(); });

  ['paymentMethodFilter', 'paymentStatusFilter'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => { currentPage = 1; renderTable(); });
  });

  const exportBtn = document.getElementById('exportPaymentsBtn');
  if (exportBtn) exportBtn.addEventListener('click', () => showToast('Payments exported successfully', 'success'));

  renderTable();
});
