import { showLoading, hideLoading, formatCurrency, formatDate, showToast } from './admin.js';
import { Modal } from '../utils/modal.js';
import { MovieService } from '../services/movieService.js';

let movies = [];
let currentPage = 1;
const perPage = 10;
let sortField = 'title';
let sortDir = 'asc';
let selectedIds = new Set();

const getFilteredMovies = () => {
  const search = (document.getElementById('movieSearch')?.value || '').toLowerCase();
  const genre = document.getElementById('genreFilter')?.value || '';
  const lang = document.getElementById('languageFilter')?.value || '';
  const status = document.getElementById('statusFilter')?.value || '';

  return movies.filter((m) => {
    if (search && !m.title.toLowerCase().includes(search)) return false;
    if (genre && !m.genre.toLowerCase().includes(genre.toLowerCase())) return false;
    if (lang && !m.language.toLowerCase().includes(lang.toLowerCase())) return false;
    if (status && m.status !== status) return false;
    return true;
  });
};

const sortMovies = (data) => {
  return [...data].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
};

const paginate = (data) => {
  const total = data.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (currentPage - 1) * perPage;
  const items = data.slice(start, start + perPage);
  return { items, total, totalPages, page: currentPage };
};

const renderTable = () => {
  const tbody = document.getElementById('moviesTableBody');
  if (!tbody) return;

  const filtered = getFilteredMovies();
  const sorted = sortMovies(filtered);
  const { items, total, totalPages } = paginate(sorted);

  const count = document.getElementById('movieCount');
  if (count) count.textContent = `Showing ${total} movies`;

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No movies found</td></tr>`;
    renderPagination(0, 0);
    return;
  }

  const statusMap = { active: 'Active', inactive: 'Inactive', 'coming-soon': 'Coming Soon' };

  tbody.innerHTML = items.map((m) => `
    <tr>
      <td><input type="checkbox" class="row-checkbox" data-id="${m.id}" ${selectedIds.has(m.id) ? 'checked' : ''} /></td>
      <td><span class="movie-poster-thumb">${m.poster && m.poster.startsWith('http') ? `<img src="${m.poster}" alt="${m.title}" style="width:40px;height:56px;object-fit:cover;border-radius:4px;">` : '🎬'}</span></td>
      <td><span class="fw-semibold">${m.title}</span></td>
      <td>${m.genre}</td>
      <td>${m.language}</td>
      <td>${m.duration} min</td>
      <td><span class="rating-star">★ ${m.rating}</span></td>
      <td><span class="badge badge-${m.status === 'active' ? 'success' : m.status === 'inactive' ? 'secondary' : 'warning'}">${statusMap[m.status] || m.status}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-view" data-id="${m.id}" title="View">👁</button>
          <button class="btn-icon btn-edit" data-id="${m.id}" title="Edit">✏️</button>
          <button class="btn-icon btn-delete" data-id="${m.id}" title="Delete">🗑</button>
        </div>
      </td>
    </tr>
  `).join('');

  renderPagination(totalPages, total);

  tbody.querySelectorAll('.btn-view').forEach((btn) => btn.addEventListener('click', () => viewMovie(btn.dataset.id)));
  tbody.querySelectorAll('.btn-edit').forEach((btn) => btn.addEventListener('click', () => editMovie(btn.dataset.id)));
  tbody.querySelectorAll('.btn-delete').forEach((btn) => btn.addEventListener('click', () => deleteMovie(btn.dataset.id)));
  tbody.querySelectorAll('.row-checkbox').forEach((cb) => cb.addEventListener('change', (e) => {
    if (e.target.checked) selectedIds.add(e.target.dataset.id);
    else selectedIds.delete(e.target.dataset.id);
  }));
};

const renderPagination = (totalPages, total) => {
  const container = document.getElementById('moviesPagination');
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

const apiMovieToLocal = (m) => ({
  id: String(m.id),
  title: m.title,
  poster: m.poster || '🎬',
  banner: m.backdrop || m.poster || '',
  genre: (m.genre || '').split(',')[0] || 'Action',
  language: m.language || 'English',
  duration: m.duration || 0,
  rating: m.rating || 0,
  status: m.releaseDate && new Date(m.releaseDate) > new Date() ? 'coming-soon' : 'active',
  releaseDate: m.releaseDate || '',
  director: m.director || '',
  cast: m.cast || '',
  description: m.description || '',
  certificate: m.certificate || 'UA',
  trailerUrl: m.trailerUrl || '',
  featured: m.featured || false,
  trending: m.trending || false,
});

const localMovieToApi = (m) => ({
  title: m.title,
  genre: m.genre,
  language: m.language,
  duration: m.duration,
  rating: m.rating,
  releaseDate: m.releaseDate,
  poster: m.poster && m.poster.startsWith('http') ? m.poster : '',
  backdrop: m.banner && m.banner.startsWith('http') ? m.banner : '',
});

const loadMovies = async () => {
  showLoading();
  try {
    const data = await MovieService.getAll();
    movies = (data || []).map(apiMovieToLocal);
    renderTable();
  } catch (err) {
    showToast('Failed to load movies from server: ' + err.message, 'error');
    movies = [...movies];
    renderTable();
  } finally {
    hideLoading();
  }
};

const showMovieModal = (movie = null) => {
  const editing = !!movie;
  const content = document.createElement('div');

  const fields = [
    { id: 'modalMovieTitle', label: 'Title', type: 'text', value: movie?.title || '', required: true },
    { id: 'modalMovieGenre', label: 'Genre', type: 'select', value: movie?.genre || 'Action', options: ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Animation', 'Documentary'] },
    { id: 'modalMovieLanguage', label: 'Language', type: 'select', value: movie?.language || 'English', options: ['English', 'Hindi', 'Spanish', 'French', 'Japanese', 'Korean', 'Tamil', 'Telugu'] },
    { id: 'modalMovieDuration', label: 'Duration (min)', type: 'number', value: movie?.duration || 120, required: true },
    { id: 'modalMovieRating', label: 'Rating', type: 'number', value: movie?.rating || 0, step: 0.1, min: 0, max: 10 },
    { id: 'modalMovieReleaseDate', label: 'Release Date', type: 'date', value: movie?.releaseDate || '', required: true },
    { id: 'modalMovieDirector', label: 'Director', type: 'text', value: movie?.director || '' },
    { id: 'modalMovieCast', label: 'Cast', type: 'text', value: movie?.cast || '' },
    { id: 'modalMovieCertificate', label: 'Certificate', type: 'select', value: movie?.certificate || 'UA', options: ['U', 'UA', 'A', 'PG', 'PG-13', 'R'] },
    { id: 'modalMovieStatus', label: 'Status', type: 'select', value: movie?.status || 'active', options: ['active', 'inactive', 'coming-soon'] },
    { id: 'modalMovieDescription', label: 'Description', type: 'textarea', value: movie?.description || '' },
    { id: 'modalMoviePoster', label: 'Poster URL', type: 'url', value: movie?.poster && movie.poster.startsWith('http') ? movie.poster : '' },
    { id: 'modalMovieBanner', label: 'Banner URL', type: 'url', value: movie?.banner && movie.banner.startsWith('http') ? movie.banner : '' },
    { id: 'modalMovieTrailer', label: 'Trailer URL', type: 'url', value: movie?.trailerUrl || '' },
  ];

  const renderField = (f) => {
    if (f.type === 'select') {
      const opts = f.options.map((o) => `<option value="${o}" ${o === f.value ? 'selected' : ''}>${o.charAt(0).toUpperCase() + o.slice(1)}</option>`).join('');
      return `
        <div class="form-group">
          <label class="form-label">${f.label}${f.required ? ' <span style="color:#EF4444">*</span>' : ''}</label>
          <select class="form-input" id="${f.id}">${opts}</select>
        </div>
      `;
    }
    if (f.type === 'textarea') {
      return `
        <div class="form-group" style="grid-column: 1 / -1;">
          <label class="form-label">${f.label}</label>
          <textarea class="form-input" id="${f.id}" rows="3" style="resize:vertical">${f.value || ''}</textarea>
        </div>
      `;
    }
    const attrs = `type="${f.type}" value="${f.value || ''}" ${f.required ? 'required' : ''} ${f.step ? `step="${f.step}"` : ''} ${f.min !== undefined ? `min="${f.min}"` : ''} ${f.max !== undefined ? `max="${f.max}"` : ''}`;
    return `
      <div class="form-group">
        <label class="form-label">${f.label}${f.required ? ' <span style="color:#EF4444">*</span>' : ''}</label>
        <input class="form-input" id="${f.id}" ${attrs} />
      </div>
    `;
  };

  content.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      ${fields.map(renderField).join('')}
    </div>
  `;

  const footer = document.createElement('div');
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.className = 'btn btn-outline-secondary';
  const saveBtn = document.createElement('button');
  saveBtn.textContent = editing ? 'Update Movie' : 'Create Movie';
  saveBtn.className = 'btn btn-primary';
  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);

  const modal = Modal.show({ title: editing ? 'Edit Movie' : 'Create Movie', content, size: 'lg', footer });

  saveBtn.addEventListener('click', async () => {
    const getVal = (id) => document.getElementById(id)?.value || '';
    const title = getVal('modalMovieTitle');
    if (!title.trim()) { showToast('Title is required', 'error'); return; }

    const data = {
      title,
      genre: getVal('modalMovieGenre'),
      language: getVal('modalMovieLanguage'),
      duration: parseInt(getVal('modalMovieDuration')) || 120,
      rating: parseFloat(getVal('modalMovieRating')) || 0,
      releaseDate: getVal('modalMovieReleaseDate'),
      director: getVal('modalMovieDirector'),
      cast: getVal('modalMovieCast'),
      certificate: getVal('modalMovieCertificate'),
      status: getVal('modalMovieStatus'),
      description: getVal('modalMovieDescription'),
      poster: getVal('modalMoviePoster') || '🎬',
      banner: getVal('modalMovieBanner') || '',
      trailerUrl: getVal('modalMovieTrailer'),
    };

    if (editing) {
      const idx = movies.findIndex((m) => m.id === movie.id);
      if (idx !== -1) {
        movies[idx] = { ...movies[idx], ...data };
        showToast('Movie updated locally (backend does not support PUT)', 'warning');
      }
      modal.close();
      renderTable();
      return;
    }

    showLoading();
    try {
      const created = await MovieService.create(localMovieToApi(data));
      const localMovie = apiMovieToLocal({ ...created, ...data });
      movies.unshift(localMovie);
      showToast('Movie created successfully', 'success');
      modal.close();
      currentPage = 1;
      renderTable();
    } catch (err) {
      showToast('Failed to create movie: ' + err.message, 'error');
    } finally {
      hideLoading();
    }
  });

  cancelBtn.addEventListener('click', () => modal.close());
};

const viewMovie = (id) => {
  const movie = movies.find((m) => m.id === id);
  if (!movie) return;

  const statusMap = { active: 'Active', inactive: 'Inactive', 'coming-soon': 'Coming Soon' };
  const contentHtml = `
    <div style="display:grid;grid-template-columns:120px 1fr;gap:24px;">
      <div style="font-size:80px;text-align:center;background:rgba(255,255,255,0.05);border-radius:16px;display:flex;align-items:center;justify-content:center;height:160px;">${movie.poster && movie.poster.startsWith('http') ? `<img src="${movie.poster}" alt="${movie.title}" style="width:100%;height:100%;object-fit:cover;border-radius:16px;">` : '🎬'}</div>
      <div>
        <h2 style="margin:0 0 8px;color:#fff;font-size:22px;">${movie.title}</h2>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
          <span class="badge badge-primary">${movie.genre}</span>
          <span class="badge badge-info">${movie.language}</span>
          <span class="badge badge-success">${movie.duration} min</span>
          <span class="badge badge-warning">★ ${movie.rating}</span>
        </div>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">${movie.description || 'No description available'}</p>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06);">
      <div><strong style="color:#fff;">Director:</strong> <span style="color:rgba(255,255,255,0.7);">${movie.director || '-'}</span></div>
      <div><strong style="color:#fff;">Certificate:</strong> <span style="color:rgba(255,255,255,0.7);">${movie.certificate || '-'}</span></div>
      <div><strong style="color:#fff;">Release Date:</strong> <span style="color:rgba(255,255,255,0.7);">${formatDate(movie.releaseDate)}</span></div>
      <div><strong style="color:#fff;">Status:</strong> <span style="color:rgba(255,255,255,0.7);">${statusMap[movie.status] || movie.status}</span></div>
      <div style="grid-column:1/-1;"><strong style="color:#fff;">Cast:</strong> <span style="color:rgba(255,255,255,0.7);">${movie.cast || '-'}</span></div>
    </div>
  `;

  Modal.alert({ title: 'Movie Details', message: '', type: 'info' });
  setTimeout(() => {
    const wrapper = document.getElementById('modalWrapper');
    if (wrapper) {
      const body = wrapper.querySelector('div > div:nth-child(2)');
      if (body) body.innerHTML = contentHtml;
    }
  }, 50);
};

const editMovie = (id) => {
  const movie = movies.find((m) => m.id === id);
  if (movie) showMovieModal(movie);
};

const deleteMovie = async (id) => {
  const movie = movies.find((m) => m.id === id);
  if (!movie) return;
  const confirmed = await Modal.confirm({ title: 'Delete Movie', message: `Are you sure you want to delete "${movie.title}"? This action cannot be undone.`, confirmText: 'Delete', type: 'danger' });
  if (confirmed) {
    movies = movies.filter((m) => m.id !== id);
    selectedIds.delete(id);
    renderTable();
    showToast('Movie deleted locally (backend does not support DELETE)', 'warning');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('movieSearch');
  if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; renderTable(); });

  ['genreFilter', 'languageFilter', 'statusFilter'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => { currentPage = 1; renderTable(); });
  });

  const createBtn = document.getElementById('createMovieBtn');
  if (createBtn) createBtn.addEventListener('click', () => showMovieModal());

  loadMovies();
});
