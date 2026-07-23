import { showLoading, hideLoading, showToast } from './admin.js';
import { Modal } from '../utils/modal.js';

const demoTheatres = [
  { id: 'TH-001', name: 'PVR: City Centre', location: 'City Centre Mall, MG Road', city: 'Mumbai', state: 'Maharashtra', address: 'Level 3, City Centre Mall, MG Road, Mumbai - 400001', mapCoords: '', contact: '+91 98765 43210', email: 'citycentre@pvr.com', screens: 4, facilities: ['Parking', 'Food Court', 'Wheelchair Access'] },
  { id: 'TH-002', name: 'INOX: Mall Road', location: 'Mall Road, Andheri', city: 'Mumbai', state: 'Maharashtra', address: 'INOX Multiplex, Mall Road, Andheri West, Mumbai - 400053', mapCoords: '', contact: '+91 98765 43211', email: 'mallroad@inox.com', screens: 3, facilities: ['Parking', 'Food Court'] },
  { id: 'TH-003', name: 'Cinepolis: Central Plaza', location: 'Central Plaza, Connaught Place', city: 'Delhi', state: 'Delhi', address: 'Central Plaza, Connaught Place, New Delhi - 110001', mapCoords: '', contact: '+91 98765 43212', email: 'central@cinepolis.com', screens: 5, facilities: ['Parking', 'Food Court', 'Wheelchair Access'] },
  { id: 'TH-004', name: 'MovieMax: East Side', location: 'East Side Mall, Salt Lake', city: 'Kolkata', state: 'West Bengal', address: 'East Side Mall, Sector 1, Salt Lake, Kolkata - 700064', mapCoords: '', contact: '+91 98765 43213', email: 'eastside@moviemax.com', screens: 2, facilities: ['Parking'] },
  { id: 'TH-005', name: 'Big Cinemas: Westend', location: 'Westend Mall, Aundh', city: 'Pune', state: 'Maharashtra', address: 'Westend Mall, Aundh, Pune - 411007', mapCoords: '', contact: '+91 98765 43214', email: 'westend@bigcinemas.com', screens: 4, facilities: ['Parking', 'Food Court', 'Wheelchair Access'] },
  { id: 'TH-006', name: 'Miraj: Downtown', location: 'Downtown Complex, MG Road', city: 'Bangalore', state: 'Karnataka', address: 'Downtown Complex, MG Road, Bangalore - 560001', mapCoords: '', contact: '+91 98765 43215', email: 'downtown@miraj.com', screens: 3, facilities: ['Food Court', 'Wheelchair Access'] },
  { id: 'TH-007', name: 'Carnival: North Campus', location: 'North Campus Mall, DU', city: 'Delhi', state: 'Delhi', address: 'North Campus Mall, Delhi University, New Delhi - 110007', mapCoords: '', contact: '+91 98765 43216', email: 'north@carnival.com', screens: 2, facilities: ['Parking', 'Food Court'] },
  { id: 'TH-008', name: 'Wave Cinemas: South Hub', location: 'South Hub Mall, HSR Layout', city: 'Bangalore', state: 'Karnataka', address: 'South Hub Mall, HSR Layout, Bangalore - 560102', mapCoords: '', contact: '+91 98765 43217', email: 'south@wavecinemas.com', screens: 3, facilities: ['Parking', 'Food Court', 'Wheelchair Access'] },
  { id: 'TH-009', name: 'AGS Cinemas: OMR', location: 'OMR Road, Thoraipakkam', city: 'Chennai', state: 'Tamil Nadu', address: 'AGS Cinemas, OMR Road, Thoraipakkam, Chennai - 600097', mapCoords: '', contact: '+91 98765 43218', email: 'omr@agscinemas.com', screens: 4, facilities: ['Parking', 'Food Court', 'Wheelchair Access'] },
  { id: 'TH-010', name: 'Raj Mandir', location: 'C Scheme, JLN Marg', city: 'Jaipur', state: 'Rajasthan', address: 'Raj Mandir Cinema, C Scheme, JLN Marg, Jaipur - 302001', mapCoords: '', contact: '+91 98765 43219', email: 'info@rajmandir.com', screens: 1, facilities: ['Parking', 'Wheelchair Access'] },
];

let theatres = [...demoTheatres];
let currentPage = 1;
const perPage = 10;

const getFilteredTheatres = () => {
  const search = (document.getElementById('theatreSearch')?.value || '').toLowerCase();
  const city = document.getElementById('cityFilter')?.value || '';

  return theatres.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search) && !t.location.toLowerCase().includes(search) && !t.city.toLowerCase().includes(search)) return false;
    if (city && t.city.toLowerCase() !== city.replace(/-/g, ' ')) return false;
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
  const tbody = document.getElementById('theatresTableBody');
  if (!tbody) return;

  const filtered = getFilteredTheatres();
  const { items, total, totalPages } = paginate(filtered);

  const count = document.getElementById('theatreCount');
  if (count) count.textContent = `Showing ${total} theatres`;

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No theatres found</td></tr>`;
    renderPagination(0, 0);
    return;
  }

  tbody.innerHTML = items.map((t) => `
    <tr>
      <td><span class="fw-semibold">${t.name}</span></td>
      <td>${t.location}</td>
      <td>${t.city}</td>
      <td>${t.screens}</td>
      <td>${t.contact}</td>
      <td><span class="badge badge-success">Active</span></td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-edit" data-id="${t.id}" title="Edit">✏️</button>
          <button class="btn-icon btn-delete" data-id="${t.id}" title="Delete">🗑</button>
        </div>
      </td>
    </tr>
  `).join('');

  renderPagination(totalPages, total);

  tbody.querySelectorAll('.btn-edit').forEach((btn) => btn.addEventListener('click', () => editTheatre(btn.dataset.id)));
  tbody.querySelectorAll('.btn-delete').forEach((btn) => btn.addEventListener('click', () => deleteTheatre(btn.dataset.id)));
};

const renderPagination = (totalPages, total) => {
  const container = document.getElementById('theatresPagination');
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

const allFacilities = ['Parking', 'Food Court', 'Wheelchair Access'];

const showTheatreModal = (theatre = null) => {
  const editing = !!theatre;
  const content = document.createElement('div');

  const facilityCheckboxes = allFacilities.map((f) => `
    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
      <input type="checkbox" value="${f}" ${theatre?.facilities?.includes(f) ? 'checked' : ''} />
      <span>${f}</span>
    </label>
  `).join('');

  content.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div class="form-group" style="grid-column:1/-1;">
        <label class="form-label">Theatre Name <span style="color:#EF4444">*</span></label>
        <input type="text" class="form-input" id="modalTheatreName" value="${theatre?.name || ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Location</label>
        <input type="text" class="form-input" id="modalTheatreLocation" value="${theatre?.location || ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">City <span style="color:#EF4444">*</span></label>
        <input type="text" class="form-input" id="modalTheatreCity" value="${theatre?.city || ''}" />
      </div>
      <div class="form-group" style="grid-column:1/-1;">
        <label class="form-label">Address</label>
        <textarea class="form-input" id="modalTheatreAddress" rows="2">${theatre?.address || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Contact Number <span style="color:#EF4444">*</span></label>
        <input type="text" class="form-input" id="modalTheatreContact" value="${theatre?.contact || ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input type="email" class="form-input" id="modalTheatreEmail" value="${theatre?.email || ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Number of Screens</label>
        <input type="number" class="form-input" id="modalTheatreScreens" value="${theatre?.screens || 1}" min="1" max="20" />
      </div>
      <div class="form-group">
        <label class="form-label">State</label>
        <input type="text" class="form-input" id="modalTheatreState" value="${theatre?.state || ''}" />
      </div>
      <div class="form-group" style="grid-column:1/-1;">
        <label class="form-label">Facilities</label>
        <div style="display:flex;gap:20px;">${facilityCheckboxes}</div>
      </div>
    </div>
  `;

  const footer = document.createElement('div');
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.className = 'btn btn-outline-secondary';
  const saveBtn = document.createElement('button');
  saveBtn.textContent = editing ? 'Update Theatre' : 'Add Theatre';
  saveBtn.className = 'btn btn-primary';
  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);

  const modal = Modal.show({ title: editing ? 'Edit Theatre' : 'Add Theatre', content, size: 'lg', footer });

  saveBtn.addEventListener('click', () => {
    const getVal = (id) => document.getElementById(id)?.value || '';
    const name = getVal('modalTheatreName');
    const city = getVal('modalTheatreCity');
    const contact = getVal('modalTheatreContact');

    if (!name.trim() || !city.trim() || !contact.trim()) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    const facilityEls = content.querySelectorAll('input[type="checkbox"]');
    const facilities = [];
    facilityEls.forEach((cb) => { if (cb.checked) facilities.push(cb.value); });

    const data = {
      name,
      location: getVal('modalTheatreLocation'),
      city,
      state: getVal('modalTheatreState'),
      address: getVal('modalTheatreAddress'),
      mapCoords: '',
      contact,
      email: getVal('modalTheatreEmail'),
      screens: parseInt(getVal('modalTheatreScreens')) || 1,
      facilities,
    };

    if (editing) {
      const idx = theatres.findIndex((t) => t.id === theatre.id);
      if (idx !== -1) theatres[idx] = { ...theatres[idx], ...data };
      showToast('Theatre updated successfully', 'success');
    } else {
      data.id = 'TH-' + String(theatres.length + 1).padStart(3, '0');
      theatres.unshift(data);
      showToast('Theatre added successfully', 'success');
    }

    modal.close();
    currentPage = 1;
    renderTable();
  });

  cancelBtn.addEventListener('click', () => modal.close());
};

const editTheatre = (id) => {
  const theatre = theatres.find((t) => t.id === id);
  if (theatre) showTheatreModal(theatre);
};

const deleteTheatre = async (id) => {
  const theatre = theatres.find((t) => t.id === id);
  if (!theatre) return;
  const confirmed = await Modal.confirm({ title: 'Delete Theatre', message: `Delete "${theatre.name}"? This action cannot be undone.`, confirmText: 'Delete', type: 'danger' });
  if (confirmed) {
    theatres = theatres.filter((t) => t.id !== id);
    renderTable();
    showToast('Theatre deleted successfully', 'success');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('theatreSearch');
  if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; renderTable(); });

  const cityFilter = document.getElementById('cityFilter');
  if (cityFilter) cityFilter.addEventListener('change', () => { currentPage = 1; renderTable(); });

  const addBtn = document.getElementById('addTheatreBtn');
  if (addBtn) addBtn.addEventListener('click', () => showTheatreModal());

  renderTable();
});
