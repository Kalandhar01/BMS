import { showLoading, hideLoading, showToast } from './admin.js';
import { Modal } from '../utils/modal.js';

const demoTheatres = ['PVR: City Centre', 'INOX: Mall Road', 'Cinepolis: Central Plaza', 'MovieMax: East Side', 'Big Cinemas: Westend', 'Miraj: Downtown', 'Carnival: North Campus', 'Wave Cinemas: South Hub', 'AGS Cinemas: OMR', 'Raj Mandir'];
const projectors = ['Sony 4K', 'Barco DP4K', 'Christie CP4420', 'NEC NC1200', 'Samsung LED Cinema'];
const soundSystems = ['Dolby Atmos', 'DTS:X', 'Auro 11.1', 'THX', '7.1 Channel', '5.1 Channel'];

const demoScreens = [];
for (let i = 1; i <= 15; i++) {
  const theatre = demoTheatres[i % demoTheatres.length];
  const capacity = 60 + (i % 6) * 30;
  demoScreens.push({
    id: `SCR-${String(i).padStart(3, '0')}`,
    name: `Screen ${i}`,
    theatre,
    capacity,
    projector: projectors[i % projectors.length],
    sound: soundSystems[i % soundSystems.length],
    size: `${30 + (i % 4) * 10}ft x ${20 + (i % 3) * 5}ft`,
    status: i % 5 === 0 ? 'inactive' : 'active',
  });
}

let screens = [...demoScreens];
let currentPage = 1;
const perPage = 10;

const getFilteredScreens = () => {
  const search = (document.getElementById('screenSearch')?.value || '').toLowerCase();
  const theatre = document.getElementById('screenTheatreFilter')?.value || '';

  return screens.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search) && !s.theatre.toLowerCase().includes(search)) return false;
    if (theatre && s.theatre !== theatre) return false;
    return true;
  });
};

const paginate = (data) => {
  const total = data.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (currentPage - 1) * perPage;
  return { items: data.slice(start, start + perPage), total, totalPages, page: currentPage };
};

const renderTable = () => {
  const tbody = document.getElementById('screensTableBody');
  if (!tbody) return;

  const filtered = getFilteredScreens();
  const { items, total, totalPages } = paginate(filtered);

  const count = document.getElementById('screenCount');
  if (count) count.textContent = `Showing ${total} screens`;

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No screens found</td></tr>`;
    renderPagination(0, 0);
    return;
  }

  tbody.innerHTML = items.map((s) => `
    <tr>
      <td><span class="fw-semibold">${s.name}</span></td>
      <td>${s.theatre}</td>
      <td>${s.capacity}</td>
      <td>${s.projector}</td>
      <td>${s.sound}</td>
      <td>${s.size}</td>
      <td><span class="badge badge-${s.status === 'active' ? 'success' : 'secondary'}">${s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-edit" data-id="${s.id}" title="Edit">✏️</button>
          <button class="btn-icon btn-delete" data-id="${s.id}" title="Delete">🗑</button>
        </div>
      </td>
    </tr>
  `).join('');

  renderPagination(totalPages, total);

  tbody.querySelectorAll('.btn-edit').forEach((btn) => btn.addEventListener('click', () => editScreen(btn.dataset.id)));
  tbody.querySelectorAll('.btn-delete').forEach((btn) => btn.addEventListener('click', () => deleteScreen(btn.dataset.id)));
};

const renderPagination = (totalPages, total) => {
  const container = document.getElementById('screensPagination');
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

const populateTheatreFilter = () => {
  const filter = document.getElementById('screenTheatreFilter');
  if (!filter) return;
  const unique = [...new Set(demoTheatres)];
  unique.forEach((t) => {
    const o = document.createElement('option');
    o.value = t;
    o.textContent = t;
    filter.appendChild(o);
  });
};

const showScreenModal = (screen = null) => {
  const editing = !!screen;
  const content = document.createElement('div');

  const theatreOpts = demoTheatres.map((t) => `<option value="${t}" ${screen?.theatre === t ? 'selected' : ''}>${t}</option>`).join('');
  const projectorOpts = projectors.map((p) => `<option value="${p}" ${screen?.projector === p ? 'selected' : ''}>${p}</option>`).join('');
  const soundOpts = soundSystems.map((s) => `<option value="${s}" ${screen?.sound === s ? 'selected' : ''}>${s}</option>`).join('');

  content.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div class="form-group">
        <label class="form-label">Screen Name <span style="color:#EF4444">*</span></label>
        <input type="text" class="form-input" id="modalScreenName" value="${screen?.name || ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Theatre <span style="color:#EF4444">*</span></label>
        <select class="form-input" id="modalScreenTheatre">${theatreOpts}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Capacity <span style="color:#EF4444">*</span></label>
        <input type="number" class="form-input" id="modalScreenCapacity" value="${screen?.capacity || 120}" min="20" />
      </div>
      <div class="form-group">
        <label class="form-label">Projector Type</label>
        <select class="form-input" id="modalScreenProjector">${projectorOpts}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Sound System</label>
        <select class="form-input" id="modalScreenSound">${soundOpts}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Screen Size</label>
        <input type="text" class="form-input" id="modalScreenSize" value="${screen?.size || ''}" placeholder="e.g. 40ft x 25ft" />
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-input" id="modalScreenStatus">
          <option value="active" ${screen?.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="inactive" ${screen?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>
    </div>
  `;

  const footer = document.createElement('div');
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.className = 'btn btn-outline-secondary';
  const saveBtn = document.createElement('button');
  saveBtn.textContent = editing ? 'Update Screen' : 'Add Screen';
  saveBtn.className = 'btn btn-primary';
  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);

  const modal = Modal.show({ title: editing ? 'Edit Screen' : 'Add Screen', content, size: 'lg', footer });

  saveBtn.addEventListener('click', () => {
    const getVal = (id) => document.getElementById(id)?.value || '';
    const name = getVal('modalScreenName');
    if (!name.trim()) { showToast('Screen name is required', 'error'); return; }

    const data = {
      name: name.trim(),
      theatre: getVal('modalScreenTheatre'),
      capacity: parseInt(getVal('modalScreenCapacity')) || 120,
      projector: getVal('modalScreenProjector'),
      sound: getVal('modalScreenSound'),
      size: getVal('modalScreenSize'),
      status: getVal('modalScreenStatus'),
    };

    if (editing) {
      const idx = screens.findIndex((s) => s.id === screen.id);
      if (idx !== -1) screens[idx] = { ...screens[idx], ...data };
      showToast('Screen updated successfully', 'success');
    } else {
      data.id = 'SCR-' + String(screens.length + 1).padStart(3, '0');
      screens.unshift(data);
      showToast('Screen added successfully', 'success');
    }

    modal.close();
    currentPage = 1;
    renderTable();
  });

  cancelBtn.addEventListener('click', () => modal.close());
};

const editScreen = (id) => {
  const screen = screens.find((s) => s.id === id);
  if (screen) showScreenModal(screen);
};

const deleteScreen = async (id) => {
  const screen = screens.find((s) => s.id === id);
  if (!screen) return;
  const confirmed = await Modal.confirm({ title: 'Delete Screen', message: `Delete "${screen.name}" in ${screen.theatre}?`, confirmText: 'Delete', type: 'danger' });
  if (confirmed) {
    screens = screens.filter((s) => s.id !== id);
    renderTable();
    showToast('Screen deleted successfully', 'success');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  populateTheatreFilter();

  const searchInput = document.getElementById('screenSearch');
  if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; renderTable(); });

  const theatreFilter = document.getElementById('screenTheatreFilter');
  if (theatreFilter) theatreFilter.addEventListener('change', () => { currentPage = 1; renderTable(); });

  const addBtn = document.getElementById('addScreenBtn');
  if (addBtn) addBtn.addEventListener('click', () => showScreenModal());

  renderTable();
});
