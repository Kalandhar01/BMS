import { showLoading, hideLoading, formatCurrency, formatDate, formatTime, showToast } from './admin.js';
import { Modal } from '../utils/modal.js';

const demoMovies = ['Jawan', 'Gadar 2', 'Oppenheimer', 'Barbie', 'Mission Impossible', 'Fighter', 'Dunki', 'Animal', 'Pushpa 2', 'The Marvels', 'Salaar', 'Leo', 'Deadpool 3'];
const demoTheatres = ['PVR: City Centre', 'INOX: Mall Road', 'Cinepolis: Central Plaza', 'MovieMax: East Side', 'Big Cinemas: Westend', 'Miraj: Downtown', 'Carnival: North Campus', 'Wave Cinemas: South Hub'];
const demoScreens = ['Screen 1', 'Screen 2', 'Screen 3', 'IMAX', '4DX'];
const showTypes = ['2D', '3D', 'IMAX', '4DX', 'Dolby'];
const statuses = ['active', 'inactive', 'cancelled'];

const demoShows = [];
for (let i = 1; i <= 15; i++) {
  const movie = demoMovies[i % demoMovies.length];
  const theatre = demoTheatres[i % demoTheatres.length];
  const screen = demoScreens[i % demoScreens.length];
  const type = showTypes[i % showTypes.length];
  const date = new Date();
  date.setDate(date.getDate() + (i % 14));
  const hrs = 9 + (i % 10);
  const timeStr = `${String(hrs).padStart(2, '0')}:${i % 2 === 0 ? '30' : '00'}`;
  const price = 150 + (i * 15);
  const totalSeats = 60 + (i % 5) * 20;
  const bookedSeats = Math.floor(totalSeats * (0.2 + Math.random() * 0.6));
  demoShows.push({
    id: `SH-${String(i).padStart(3, '0')}`,
    movie, theatre, screen, type,
    date: date.toISOString().split('T')[0],
    time: timeStr,
    price,
    totalSeats,
    bookedSeats,
    availableSeats: totalSeats - bookedSeats,
    status: statuses[i % statuses.length],
  });
}

let shows = [...demoShows];
let currentPage = 1;
const perPage = 10;

const getFilteredShows = () => {
  const search = (document.getElementById('showSearch')?.value || '').toLowerCase();
  const movieF = document.getElementById('showMovieFilter')?.value || '';
  const theatreF = document.getElementById('showTheatreFilter')?.value || '';
  const dateF = document.getElementById('showDateFilter')?.value || '';
  const typeF = document.getElementById('showTypeFilter')?.value || '';

  return shows.filter((s) => {
    if (search && !s.movie.toLowerCase().includes(search) && !s.theatre.toLowerCase().includes(search)) return false;
    if (movieF && s.movie !== movieF) return false;
    if (theatreF && s.theatre !== theatreF) return false;
    if (dateF && s.date !== dateF) return false;
    if (typeF && s.type.toLowerCase() !== typeF.toLowerCase()) return false;
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
  const tbody = document.getElementById('showsTableBody');
  if (!tbody) return;

  const filtered = getFilteredShows();
  const { items, total, totalPages } = paginate(filtered);

  const count = document.getElementById('showCount');
  if (count) count.textContent = `Showing ${total} shows`;

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">No shows found</td></tr>`;
    renderPagination(0, 0);
    return;
  }

  const typeBadgeColors = { '2D': 'secondary', '3D': 'info', 'IMAX': 'primary', '4DX': 'warning', 'Dolby': 'accent' };

  tbody.innerHTML = items.map((s) => `
    <tr>
      <td><span class="fw-semibold">${s.movie}</span></td>
      <td>${s.theatre}</td>
      <td>${s.screen}</td>
      <td>${formatDate(s.date)}</td>
      <td>${formatTime(s.time)}</td>
      <td><span class="badge badge-${typeBadgeColors[s.type] || 'secondary'}">${s.type}</span></td>
      <td>${formatCurrency(s.price)}</td>
      <td>${s.availableSeats}/${s.totalSeats}</td>
      <td><span class="badge badge-${s.status === 'active' ? 'success' : s.status === 'inactive' ? 'secondary' : 'danger'}">${s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-edit" data-id="${s.id}" title="Edit">✏️</button>
          <button class="btn-icon btn-delete" data-id="${s.id}" title="Delete">🗑</button>
        </div>
      </td>
    </tr>
  `).join('');

  renderPagination(totalPages, total);

  tbody.querySelectorAll('.btn-edit').forEach((btn) => btn.addEventListener('click', () => editShow(btn.dataset.id)));
  tbody.querySelectorAll('.btn-delete').forEach((btn) => btn.addEventListener('click', () => deleteShow(btn.dataset.id)));
};

const renderPagination = (totalPages, total) => {
  const container = document.getElementById('showsPagination');
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

const showShowModal = (show = null) => {
  const editing = !!show;
  const content = document.createElement('div');

  const movieOpts = demoMovies.map((m) => `<option value="${m}" ${show?.movie === m ? 'selected' : ''}>${m}</option>`).join('');
  const theatreOpts = demoTheatres.map((t) => `<option value="${t}" ${show?.theatre === t ? 'selected' : ''}>${t}</option>`).join('');
  const screenOpts = demoScreens.map((s) => `<option value="${s}" ${show?.screen === s ? 'selected' : ''}>${s}</option>`).join('');
  const typeOpts = showTypes.map((t) => `<option value="${t}" ${show?.type === t ? 'selected' : ''}>${t}</option>`).join('');

  content.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div class="form-group">
        <label class="form-label">Movie <span style="color:#EF4444">*</span></label>
        <select class="form-input" id="modalShowMovie">${movieOpts}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Theatre <span style="color:#EF4444">*</span></label>
        <select class="form-input" id="modalShowTheatre">${theatreOpts}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Screen <span style="color:#EF4444">*</span></label>
        <select class="form-input" id="modalShowScreen">${screenOpts}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Show Type <span style="color:#EF4444">*</span></label>
        <select class="form-input" id="modalShowType">${typeOpts}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Date <span style="color:#EF4444">*</span></label>
        <input type="date" class="form-input" id="modalShowDate" value="${show?.date || ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Time <span style="color:#EF4444">*</span></label>
        <input type="time" class="form-input" id="modalShowTime" value="${show?.time || ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Ticket Price (₹) <span style="color:#EF4444">*</span></label>
        <input type="number" class="form-input" id="modalShowPrice" value="${show?.price || 200}" min="50" />
      </div>
      <div class="form-group">
        <label class="form-label">Total Seats <span style="color:#EF4444">*</span></label>
        <input type="number" class="form-input" id="modalShowTotalSeats" value="${show?.totalSeats || 120}" min="20" />
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-input" id="modalShowStatus">
          <option value="active" ${show?.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="inactive" ${show?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
          <option value="cancelled" ${show?.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </div>
    </div>
  `;

  const footer = document.createElement('div');
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.className = 'btn btn-outline-secondary';
  const saveBtn = document.createElement('button');
  saveBtn.textContent = editing ? 'Update Show' : 'Create Show';
  saveBtn.className = 'btn btn-primary';
  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);

  const modal = Modal.show({ title: editing ? 'Edit Show' : 'Create Show', content, size: 'lg', footer });

  saveBtn.addEventListener('click', () => {
    const getVal = (id) => document.getElementById(id)?.value || '';
    const movie = getVal('modalShowMovie');
    const date = getVal('modalShowDate');
    const time = getVal('modalShowTime');

    if (!movie || !date || !time) { showToast('Please fill all required fields', 'error'); return; }

    const data = {
      movie,
      theatre: getVal('modalShowTheatre'),
      screen: getVal('modalShowScreen'),
      type: getVal('modalShowType'),
      date,
      time,
      price: parseInt(getVal('modalShowPrice')) || 200,
      totalSeats: parseInt(getVal('modalShowTotalSeats')) || 120,
      bookedSeats: show?.bookedSeats || 0,
      availableSeats: (parseInt(getVal('modalShowTotalSeats')) || 120) - (show?.bookedSeats || 0),
      status: getVal('modalShowStatus'),
    };

    if (editing) {
      const idx = shows.findIndex((s) => s.id === show.id);
      if (idx !== -1) shows[idx] = { ...shows[idx], ...data };
      showToast('Show updated successfully', 'success');
    } else {
      data.id = 'SH-' + String(shows.length + 1).padStart(3, '0');
      shows.unshift(data);
      showToast('Show created successfully', 'success');
    }

    modal.close();
    currentPage = 1;
    renderTable();
  });

  cancelBtn.addEventListener('click', () => modal.close());
};

const editShow = (id) => {
  const show = shows.find((s) => s.id === id);
  if (show) showShowModal(show);
};

const deleteShow = async (id) => {
  const show = shows.find((s) => s.id === id);
  if (!show) return;
  const confirmed = await Modal.confirm({ title: 'Delete Show', message: `Delete show for "${show.movie}" on ${formatDate(show.date)} at ${formatTime(show.time)}?`, confirmText: 'Delete', type: 'danger' });
  if (confirmed) {
    shows = shows.filter((s) => s.id !== id);
    renderTable();
    showToast('Show deleted successfully', 'success');
  }
};

const populateFilters = () => {
  const movieFilter = document.getElementById('showMovieFilter');
  if (movieFilter) {
    const unique = [...new Set(demoMovies)];
    unique.forEach((m) => { const o = document.createElement('option'); o.value = m; o.textContent = m; movieFilter.appendChild(o); });
  }
  const theatreFilter = document.getElementById('showTheatreFilter');
  if (theatreFilter) {
    const unique = [...new Set(demoTheatres)];
    unique.forEach((t) => { const o = document.createElement('option'); o.value = t; o.textContent = t; theatreFilter.appendChild(o); });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  populateFilters();

  const searchInput = document.getElementById('showSearch');
  if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; renderTable(); });

  ['showMovieFilter', 'showTheatreFilter', 'showDateFilter', 'showTypeFilter'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => { currentPage = 1; renderTable(); });
  });

  const createBtn = document.getElementById('createShowBtn');
  if (createBtn) createBtn.addEventListener('click', () => showShowModal());

  renderTable();
});
