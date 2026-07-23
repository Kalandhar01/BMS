import { showLoading, hideLoading, formatDate, showToast } from './admin.js';
import { Modal } from '../utils/modal.js';

const discountTypes = ['percentage', 'fixed', 'bogo', 'free-shipping'];

const demoOffers = [
  { id: 'OFF-001', code: 'WELCOME25', discountType: 'percentage', value: 25, minPurchase: 500, validFrom: '2025-01-01', validTo: '2025-12-31', usageLimit: 1000, used: 345, status: 'active', description: '25% off for new users' },
  { id: 'OFF-002', code: 'FLAT200', discountType: 'fixed', value: 200, minPurchase: 1000, validFrom: '2025-06-01', validTo: '2025-08-31', usageLimit: 500, used: 128, status: 'active', description: 'Flat ₹200 off on tickets' },
  { id: 'OFF-003', code: 'BOGOFREE', discountType: 'bogo', value: 100, minPurchase: 0, validFrom: '2025-07-01', validTo: '2025-07-31', usageLimit: 200, used: 45, status: 'active', description: 'Buy One Get One Free' },
  { id: 'OFF-004', code: 'SUMMER50', discountType: 'percentage', value: 50, minPurchase: 300, validFrom: '2025-04-01', validTo: '2025-06-30', usageLimit: 300, used: 300, status: 'expired', description: '50% off summer special' },
  { id: 'OFF-005', code: 'FIRST100', discountType: 'fixed', value: 100, minPurchase: 250, validFrom: '2025-01-15', validTo: '2025-12-31', usageLimit: 10000, used: 2345, status: 'active', description: '₹100 off on first booking' },
  { id: 'OFF-006', code: 'WEEKEND50', discountType: 'percentage', value: 50, minPurchase: 0, validFrom: '2025-08-01', validTo: '2025-08-31', usageLimit: 100, used: 12, status: 'scheduled', description: 'Weekend special 50% off' },
  { id: 'OFF-007', code: 'LOYAL500', discountType: 'fixed', value: 500, minPurchase: 2000, validFrom: '2025-03-01', validTo: '2025-09-30', usageLimit: 150, used: 67, status: 'active', description: 'Loyalty reward ₹500 off' },
  { id: 'OFF-008', code: 'POPCORN', discountType: 'fixed', value: 50, minPurchase: 100, validFrom: '2025-01-01', validTo: '2025-12-31', usageLimit: 5000, used: 1876, status: 'active', description: '₹50 off on popcorn combo' },
  { id: 'OFF-009', code: 'STUDENT15', discountType: 'percentage', value: 15, minPurchase: 200, validFrom: '2025-07-01', validTo: '2025-10-31', usageLimit: 500, used: 89, status: 'inactive', description: '15% student discount' },
  { id: 'OFF-010', code: 'PREMIUM', discountType: 'percentage', value: 30, minPurchase: 1500, validFrom: '2025-06-15', validTo: '2025-09-15', usageLimit: 200, used: 34, status: 'active', description: 'Premium member 30% off' },
  { id: 'OFF-011', code: 'MIDNIGHT', discountType: 'fixed', value: 150, minPurchase: 400, validFrom: '2025-08-01', validTo: '2025-08-31', usageLimit: 100, used: 0, status: 'scheduled', description: 'Midnight show special' },
  { id: 'OFF-012', code: 'FREEPOP', discountType: 'free-shipping', value: 0, minPurchase: 300, validFrom: '2025-01-01', validTo: '2025-12-31', usageLimit: 2000, used: 543, status: 'active', description: 'Free popcorn with ticket' },
];

let offers = [...demoOffers];
let currentPage = 1;
const perPage = 10;

const generateCouponCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
};

const getFilteredOffers = () => {
  const search = (document.getElementById('offerSearch')?.value || '').toLowerCase();
  const type = document.getElementById('offerDiscountTypeFilter')?.value || '';
  const status = document.getElementById('offerStatusFilter')?.value || '';

  return offers.filter((o) => {
    if (search && !o.code.toLowerCase().includes(search) && !o.description?.toLowerCase().includes(search)) return false;
    if (type && o.discountType !== type) return false;
    if (status && o.status !== status) return false;
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
  const map = { active: 'success', inactive: 'secondary', expired: 'danger', scheduled: 'warning' };
  return `<span class="badge badge-${map[status] || 'secondary'}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
};

const typeLabel = (type) => {
  const map = { percentage: '% Off', fixed: '₹ Fixed', bogo: 'BOGO', 'free-shipping': 'Free Item' };
  return map[type] || type;
};

const renderTable = () => {
  const tbody = document.getElementById('offersTableBody');
  if (!tbody) return;

  const filtered = getFilteredOffers();
  const { items, total, totalPages } = paginate(filtered);

  const count = document.getElementById('offerCount');
  if (count) count.textContent = `Showing ${total} offers`;

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">No offers found</td></tr>`;
    renderPagination(0, 0);
    return;
  }

  tbody.innerHTML = items.map((o) => `
    <tr>
      <td><code style="font-weight:600;color:#F59E0B;">${o.code}</code></td>
      <td>${typeLabel(o.discountType)}</td>
      <td>${o.discountType === 'percentage' ? `${o.value}%` : `₹${o.value}`}</td>
      <td>${o.minPurchase ? `₹${o.minPurchase}` : '-'}</td>
      <td>${formatDate(o.validFrom)}</td>
      <td>${formatDate(o.validTo)}</td>
      <td>${o.usageLimit.toLocaleString()}</td>
      <td>${o.used.toLocaleString()}</td>
      <td>${statusBadge(o.status)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-edit" data-id="${o.id}" title="Edit">✏️</button>
          <button class="btn-icon btn-toggle" data-id="${o.id}" title="Toggle Status">🔄</button>
          <button class="btn-icon btn-delete" data-id="${o.id}" title="Delete">🗑</button>
        </div>
      </td>
    </tr>
  `).join('');

  renderPagination(totalPages, total);

  tbody.querySelectorAll('.btn-edit').forEach((btn) => btn.addEventListener('click', () => editOffer(btn.dataset.id)));
  tbody.querySelectorAll('.btn-toggle').forEach((btn) => btn.addEventListener('click', () => toggleOfferStatus(btn.dataset.id)));
  tbody.querySelectorAll('.btn-delete').forEach((btn) => btn.addEventListener('click', () => deleteOffer(btn.dataset.id)));
};

const renderPagination = (totalPages, total) => {
  const container = document.getElementById('offersPagination');
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

const showOfferModal = (offer = null) => {
  const editing = !!offer;
  const content = document.createElement('div');

  const typeOpts = discountTypes.map((t) => `<option value="${t}" ${offer?.discountType === t ? 'selected' : ''}>${t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ')}</option>`).join('');
  const statusOpts = ['active', 'inactive', 'expired', 'scheduled'].map((s) => `<option value="${s}" ${offer?.status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('');

  content.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div class="form-group">
        <label class="form-label">Coupon Code <span style="color:#EF4444">*</span></label>
        <div style="display:flex;gap:8px;">
          <input type="text" class="form-input" id="modalOfferCode" value="${offer?.code || generateCouponCode()}" style="flex:1;font-family:monospace;" />
          <button class="btn btn-sm btn-outline-secondary" id="generateCodeBtn" type="button">🔄</button>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Discount Type</label>
        <select class="form-input" id="modalOfferType">${typeOpts}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Value</label>
        <input type="number" class="form-input" id="modalOfferValue" value="${offer?.value || 10}" min="0" />
      </div>
      <div class="form-group">
        <label class="form-label">Min Purchase (₹)</label>
        <input type="number" class="form-input" id="modalOfferMinPurchase" value="${offer?.minPurchase || 0}" min="0" />
      </div>
      <div class="form-group">
        <label class="form-label">Valid From</label>
        <input type="date" class="form-input" id="modalOfferFrom" value="${offer?.validFrom || ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Valid To</label>
        <input type="date" class="form-input" id="modalOfferTo" value="${offer?.validTo || ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Usage Limit</label>
        <input type="number" class="form-input" id="modalOfferLimit" value="${offer?.usageLimit || 1000}" min="1" />
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-input" id="modalOfferStatus">${statusOpts}</select>
      </div>
      <div class="form-group" style="grid-column:1/-1;">
        <label class="form-label">Description</label>
        <input type="text" class="form-input" id="modalOfferDesc" value="${offer?.description || ''}" />
      </div>
    </div>
  `;

  const footer = document.createElement('div');
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.className = 'btn btn-outline-secondary';
  const saveBtn = document.createElement('button');
  saveBtn.textContent = editing ? 'Update Offer' : 'Create Offer';
  saveBtn.className = 'btn btn-primary';
  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);

  const modal = Modal.show({ title: editing ? 'Edit Offer' : 'Create Offer', content, size: 'lg', footer });

  const genBtn = content.querySelector('#generateCodeBtn');
  if (genBtn) {
    genBtn.addEventListener('click', () => {
      const input = document.getElementById('modalOfferCode');
      if (input) input.value = generateCouponCode();
    });
  }

  saveBtn.addEventListener('click', () => {
    const getVal = (id) => document.getElementById(id)?.value || '';
    const code = getVal('modalOfferCode').trim();
    if (!code) { showToast('Coupon code is required', 'error'); return; }

    const data = {
      code,
      discountType: getVal('modalOfferType'),
      value: parseFloat(getVal('modalOfferValue')) || 0,
      minPurchase: parseFloat(getVal('modalOfferMinPurchase')) || 0,
      validFrom: getVal('modalOfferFrom'),
      validTo: getVal('modalOfferTo'),
      usageLimit: parseInt(getVal('modalOfferLimit')) || 1000,
      used: offer?.used || 0,
      status: getVal('modalOfferStatus'),
      description: getVal('modalOfferDesc'),
    };

    if (editing) {
      const idx = offers.findIndex((o) => o.id === offer.id);
      if (idx !== -1) offers[idx] = { ...offers[idx], ...data };
      showToast('Offer updated successfully', 'success');
    } else {
      data.id = 'OFF-' + String(offers.length + 1).padStart(3, '0');
      offers.unshift(data);
      showToast('Offer created successfully', 'success');
    }

    modal.close();
    currentPage = 1;
    renderTable();
  });

  cancelBtn.addEventListener('click', () => modal.close());
};

const editOffer = (id) => {
  const offer = offers.find((o) => o.id === id);
  if (offer) showOfferModal(offer);
};

const toggleOfferStatus = async (id) => {
  const offer = offers.find((o) => o.id === id);
  if (!offer) return;
  const next = { active: 'inactive', inactive: 'active', expired: 'active', scheduled: 'active' };
  const newStatus = next[offer.status] || 'active';
  await Modal.confirm({ title: 'Toggle Status', message: `Change "${offer.code}" status from "${offer.status}" to "${newStatus}"?`, confirmText: 'Toggle', type: 'info' });
  offer.status = newStatus;
  renderTable();
  showToast(`Offer status changed to ${newStatus}`, 'success');
};

const deleteOffer = async (id) => {
  const offer = offers.find((o) => o.id === id);
  if (!offer) return;
  const confirmed = await Modal.confirm({ title: 'Delete Offer', message: `Delete offer "${offer.code}"?`, confirmText: 'Delete', type: 'danger' });
  if (confirmed) {
    offers = offers.filter((o) => o.id !== id);
    renderTable();
    showToast('Offer deleted successfully', 'success');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('offerSearch');
  if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; renderTable(); });

  ['offerDiscountTypeFilter', 'offerStatusFilter'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => { currentPage = 1; renderTable(); });
  });

  const createBtn = document.getElementById('createOfferBtn');
  if (createBtn) createBtn.addEventListener('click', () => showOfferModal());

  renderTable();
});
