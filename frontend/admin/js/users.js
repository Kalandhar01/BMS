import { showLoading, hideLoading, formatDate, showToast } from './admin.js';
import { Modal } from '../utils/modal.js';
import { Validation } from '../utils/validation.js';

const firstNames = ['Rahul', 'Priya', 'Amit', 'Neha', 'Vikram', 'Ananya', 'Arjun', 'Kavita', 'Rohan', 'Sneha', 'Manish', 'Pooja', 'Siddharth', 'Deepika', 'Karan', 'Ishita', 'Aditya', 'Riya', 'Rajat', 'Tanya'];
const lastNames = ['Sharma', 'Patel', 'Kumar', 'Gupta', 'Singh', 'Reddy', 'Nair', 'Joshi', 'Desai', 'Kapoor', 'Tiwari', 'Mehta', 'Jain', 'Choudhary', 'Malhotra', 'Roy', 'Verma', 'Saxena', 'Bansal', 'Arora'];
const memberships = ['Basic', 'Silver', 'Gold', 'Platinum'];
const statuses = ['Active', 'Inactive', 'Suspended'];

const demoUsers = [];
for (let i = 1; i <= 20; i++) {
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[i % lastNames.length];
  const name = `${fn} ${ln}`;
  const joinDate = new Date(2025, 0, 1 + i * 10);
  demoUsers.push({
    id: `USR-${String(i).padStart(3, '0')}`,
    name,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@email.com`,
    phone: `+91 98765 ${String(40000 + i).slice(1)}`,
    bookings: 2 + (i % 15),
    loyaltyPoints: 100 + i * 25,
    membership: memberships[i % 4],
    status: statuses[i % 3],
    joinDate: joinDate.toISOString(),
    avatar: name.charAt(0),
  });
}

let users = [...demoUsers];
let currentPage = 1;
const perPage = 10;

const getFilteredUsers = () => {
  const search = (document.getElementById('userSearch')?.value || '').toLowerCase();
  const status = document.getElementById('userStatusFilter')?.value || '';
  const membership = document.getElementById('userMembershipFilter')?.value || '';

  return users.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search) && !u.email.toLowerCase().includes(search) && !u.phone.includes(search)) return false;
    if (status && u.status.toLowerCase() !== status) return false;
    if (membership && u.membership.toLowerCase() !== membership) return false;
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
  const map = { Active: 'success', Inactive: 'secondary', Suspended: 'danger' };
  return `<span class="badge badge-${map[status] || 'secondary'}">${status}</span>`;
};

const membershipBadge = (m) => {
  const map = { Basic: 'secondary', Silver: 'info', Gold: 'warning', Platinum: 'accent' };
  return `<span class="badge badge-${map[m] || 'secondary'}">${m}</span>`;
};

const renderTable = () => {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  const filtered = getFilteredUsers();
  const { items, total, totalPages } = paginate(filtered);

  const count = document.getElementById('userCount');
  if (count) count.textContent = `Showing ${total} users`;

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">No users found</td></tr>`;
    renderPagination(0, 0);
    return;
  }

  tbody.innerHTML = items.map((u) => `
    <tr>
      <td><div class="avatar-sm" style="width:32px;height:32px;border-radius:50%;background:#6366F1;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:600;">${u.avatar}</div></td>
      <td><span class="fw-semibold">${u.name}</span></td>
      <td>${u.email}</td>
      <td>${u.phone}</td>
      <td>${u.bookings}</td>
      <td>${u.loyaltyPoints.toLocaleString()}</td>
      <td>${membershipBadge(u.membership)}</td>
      <td>${statusBadge(u.status)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-view" data-id="${u.id}" title="View Profile">👁</button>
          <button class="btn-icon btn-edit" data-id="${u.id}" title="Edit">✏️</button>
          <button class="btn-icon btn-toggle" data-id="${u.id}" title="Toggle Status">🔄</button>
          <button class="btn-icon btn-delete" data-id="${u.id}" title="Delete">🗑</button>
        </div>
      </td>
    </tr>
  `).join('');

  renderPagination(totalPages, total);

  tbody.querySelectorAll('.btn-view').forEach((btn) => btn.addEventListener('click', () => viewUser(btn.dataset.id)));
  tbody.querySelectorAll('.btn-edit').forEach((btn) => btn.addEventListener('click', () => editUser(btn.dataset.id)));
  tbody.querySelectorAll('.btn-toggle').forEach((btn) => btn.addEventListener('click', () => toggleUserStatus(btn.dataset.id)));
  tbody.querySelectorAll('.btn-delete').forEach((btn) => btn.addEventListener('click', () => deleteUser(btn.dataset.id)));
};

const renderPagination = (totalPages, total) => {
  const container = document.getElementById('usersPagination');
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

const viewUser = (id) => {
  const u = users.find((usr) => usr.id === id);
  if (!u) return;

  const bookingHistory = [
    { id: 'BK-001', movie: 'Jawan', date: '15 Jul 2025', seats: 2, amount: 560, status: 'Confirmed' },
    { id: 'BK-015', movie: 'Fighter', date: '20 Jul 2025', seats: 1, amount: 320, status: 'Confirmed' },
  ];

  const historyHtml = bookingHistory.map((b) => `
    <tr>
      <td>${b.id}</td>
      <td>${b.movie}</td>
      <td>${b.date}</td>
      <td>${b.seats}</td>
      <td>₹${b.amount}</td>
      <td><span class="badge badge-success">${b.status}</span></td>
    </tr>
  `).join('');

  const contentHtml = `
    <div style="display:flex;gap:20px;margin-bottom:20px;">
      <div style="width:64px;height:64px;border-radius:50%;background:#6366F1;display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:600;flex-shrink:0;">${u.avatar}</div>
      <div>
        <h3 style="margin:0 0 4px;color:#fff;font-size:18px;">${u.name}</h3>
        <div style="color:rgba(255,255,255,0.5);font-size:13px;">${u.email} | ${u.phone}</div>
        <div style="margin-top:8px;display:flex;gap:8px;">${statusBadge(u.status)} ${membershipBadge(u.membership)}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:20px;padding:16px;background:rgba(255,255,255,0.03);border-radius:12px;">
      <div style="text-align:center;"><div style="font-size:24px;font-weight:600;color:#fff;">${u.bookings}</div><div style="font-size:12px;color:rgba(255,255,255,0.5);">Total Bookings</div></div>
      <div style="text-align:center;"><div style="font-size:24px;font-weight:600;color:#fff;">${u.loyaltyPoints.toLocaleString()}</div><div style="font-size:12px;color:rgba(255,255,255,0.5);">Loyalty Points</div></div>
      <div style="text-align:center;"><div style="font-size:24px;font-weight:600;color:#fff;">${formatDate(u.joinDate)}</div><div style="font-size:12px;color:rgba(255,255,255,0.5);">Member Since</div></div>
    </div>
    <h4 style="color:#fff;margin:0 0 12px;font-size:14px;">Booking History</h4>
    <table style="width:100%;font-size:13px;"><thead><tr><th>ID</th><th>Movie</th><th>Date</th><th>Seats</th><th>Amount</th><th>Status</th></tr></thead><tbody>${historyHtml}</tbody></table>
  `;

  Modal.show({ title: 'User Profile', content: contentHtml, size: 'lg' });
};

const editUser = (id) => {
  const u = users.find((usr) => usr.id === id);
  if (!u) return;

  const content = document.createElement('div');
  content.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr;gap:16px;">
      <div class="form-group"><label class="form-label">Full Name</label><input type="text" class="form-input" id="editUserName" value="${u.name}" /></div>
      <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" id="editUserEmail" value="${u.email}" /></div>
      <div class="form-group"><label class="form-label">Phone</label><input type="text" class="form-input" id="editUserPhone" value="${u.phone}" /></div>
    </div>
  `;

  const footer = document.createElement('div');
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.className = 'btn btn-outline-secondary';
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Update User';
  saveBtn.className = 'btn btn-primary';
  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);

  const modal = Modal.show({ title: 'Edit User', content, size: 'sm', footer });

  saveBtn.addEventListener('click', () => {
    const name = document.getElementById('editUserName')?.value?.trim();
    const email = document.getElementById('editUserEmail')?.value?.trim();
    const phone = document.getElementById('editUserPhone')?.value?.trim();

    if (!name) { showToast('Name is required', 'error'); return; }
    const emailCheck = Validation.email(email);
    if (!emailCheck.valid) { showToast(emailCheck.message, 'error'); return; }

    u.name = name;
    u.email = email;
    u.phone = phone;
    u.avatar = name.charAt(0);
    modal.close();
    renderTable();
    showToast('User updated successfully', 'success');
  });

  cancelBtn.addEventListener('click', () => modal.close());
};

const toggleUserStatus = async (id) => {
  const u = users.find((usr) => usr.id === id);
  if (!u) return;
  const next = { Active: 'Inactive', Inactive: 'Suspended', Suspended: 'Active' };
  const newStatus = next[u.status];
  const confirmed = await Modal.confirm({ title: 'Change Status', message: `Change ${u.name}'s status from "${u.status}" to "${newStatus}"?`, confirmText: 'Change', type: 'info' });
  if (confirmed) {
    u.status = newStatus;
    renderTable();
    showToast(`User status changed to ${newStatus}`, 'success');
  }
};

const deleteUser = async (id) => {
  const u = users.find((usr) => usr.id === id);
  if (!u) return;
  const confirmed = await Modal.confirm({ title: 'Delete User', message: `Delete user "${u.name}"? This cannot be undone.`, confirmText: 'Delete', type: 'danger' });
  if (confirmed) {
    users = users.filter((usr) => usr.id !== id);
    renderTable();
    showToast('User deleted successfully', 'success');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('userSearch');
  if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; renderTable(); });

  ['userStatusFilter', 'userMembershipFilter'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => { currentPage = 1; renderTable(); });
  });

  const inviteBtn = document.getElementById('inviteUserBtn');
  if (inviteBtn) inviteBtn.addEventListener('click', () => showToast('Invitation sent to user', 'success'));

  renderTable();
});
