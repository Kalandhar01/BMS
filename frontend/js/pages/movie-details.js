import { MovieService } from '../services/movie-service.js';
import { ShowService } from '../services/show-service.js';
import { ScreenService } from '../services/screen-service.js';
import { Auth } from '../utils/auth.js';
import { Toast } from '../utils/toast.js';
import { formatDate, formatTime, formatDuration, getDayOfWeek } from '../utils/date.js';

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('id');

  if (!movieId) {
    document.getElementById('movieDetailsContainer').innerHTML = '<div class="error-message"><h2>Movie not found</h2><a href="movies.html" class="btn">Browse Movies</a></div>';
    return;
  }

  const loadingEl = document.getElementById('loading');
  const container = document.getElementById('movieDetailsContainer');
  const backdrop = document.getElementById('movieBackdrop');
  const poster = document.getElementById('moviePoster');
  const title = document.getElementById('movieTitle');
  const year = document.getElementById('movieYear');
  const language = document.getElementById('movieLanguage');
  const duration = document.getElementById('movieDuration');
  const rating = document.getElementById('movieRating');
  const genresContainer = document.getElementById('genresContainer');
  const description = document.getElementById('movieDescription');
  const castContainer = document.getElementById('castContainer');
  const showDatesContainer = document.getElementById('showDatesContainer');
  const showTimesContainer = document.getElementById('showTimesContainer');
  const screenSelect = document.getElementById('screenSelect');

  let currentMovie = null;
  let shows = [];
  let selectedDate = null;
  let selectedShow = null;

  function showLoading() { loadingEl?.classList.remove('hidden'); container?.classList.add('hidden'); }
  function hideLoading() { loadingEl?.classList.add('hidden'); container?.classList.remove('hidden'); }

  async function init() {
    showLoading();
    try {
      currentMovie = await MovieService.getById(movieId);
      if (!currentMovie) throw new Error('Movie not found');
      renderMovieDetails();
      await loadShows();
    } catch (err) {
      container.innerHTML = `<div class="error-message"><h2>Failed to load movie details</h2><p>${err.message}</p><a href="movies.html" class="btn">Browse Movies</a></div>`;
      Toast.error('Failed to load movie details');
    } finally {
      hideLoading();
    }
  }

  function renderMovieDetails() {
    const m = currentMovie;
    document.title = `${m.title || m.name} - BMShow`;
    if (backdrop) backdrop.style.backgroundImage = `url(${m.backdropUrl || m.backdrop || m.posterUrl || m.poster || ''})`;
    if (poster) poster.src = m.posterUrl || m.poster || '../images/default-poster.jpg';
    if (poster) poster.alt = m.title || m.name;
    if (title) title.textContent = m.title || m.name;
    if (year) year.textContent = m.releaseYear || m.year || '';
    if (language) language.textContent = m.language || '';
    if (duration) duration.textContent = m.duration ? formatDuration(m.duration) : '';
    if (rating) {
      const r = m.rating || m.imdbRating || '';
      rating.textContent = r ? `${r}/10` : '';
    }

    if (genresContainer) {
      const genres = m.genre ? m.genre.split(',').map(g => g.trim()) : [];
      genresContainer.innerHTML = genres.map(g => `<span class="genre-badge">${g}</span>`).join('');
    }

    if (description) description.textContent = m.description || m.plot || m.synopsis || 'No description available.';

    if (castContainer && m.cast) {
      const cast = Array.isArray(m.cast) ? m.cast : (typeof m.cast === 'string' ? m.cast.split(',').map(c => c.trim()) : []);
      if (cast.length > 0) {
        castContainer.innerHTML = '<h3>Cast</h3><div class="cast-list">' +
          cast.map(actor =>
            `<div class="cast-item"><div class="cast-avatar">${(actor.charAt && actor.charAt(0)) || '?'}</div><span>${actor}</span></div>`
          ).join('') + '</div>';
      }
    }
  }

  async function loadShows() {
    try {
      shows = await ShowService.getByMovie(movieId);
      if (!Array.isArray(shows)) shows = [];
      populateScreenFilter();
      populateDateSelector();
    } catch {
      Toast.error('Failed to load shows');
      shows = [];
    }
  }

  function populateScreenFilter() {
    if (!screenSelect) return;
    const screenIds = [...new Set(shows.map(s => s.screenId || s.screen?.id).filter(Boolean))];
    if (screenIds.length <= 1) { screenSelect.style.display = 'none'; return; }
    screenSelect.innerHTML = '<option value="">All Screens</option>' +
      screenIds.map(id => `<option value="${id}">Screen ${id}</option>`).join('');
    screenSelect.addEventListener('change', populateDateSelector);
  }

  function getFilteredShows() {
    const screenId = screenSelect?.value;
    return screenId ? shows.filter(s => (s.screenId || s.screen?.id) == screenId) : shows;
  }

  function populateDateSelector() {
    if (!showDatesContainer) return;
    const filtered = getFilteredShows();
    const dates = [...new Set(filtered.map(s => s.showDate || s.date).filter(Boolean))].sort();
    if (dates.length === 0) {
      showDatesContainer.innerHTML = '<p class="no-shows">No shows available</p>';
      showTimesContainer.innerHTML = '';
      return;
    }
    showDatesContainer.innerHTML = dates.map(d =>
      `<button class="date-btn${selectedDate === d ? ' active' : ''}" data-date="${d}">
        <span class="date-day">${getDayOfWeek(d)}</span>
        <span class="date-num">${new Date(d).getDate()}</span>
        <span class="date-month">${new Date(d).toLocaleString('en', { month: 'short' })}</span>
      </button>`
    ).join('');
    if (!selectedDate || !dates.includes(selectedDate)) selectedDate = dates[0];
    document.querySelectorAll('.date-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedDate = btn.dataset.date;
        document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        populateShowTimes();
      });
    });
    populateShowTimes();
  }

  function populateShowTimes() {
    if (!showTimesContainer) return;
    const filtered = getFilteredShows().filter(s => (s.showDate || s.date) === selectedDate);
    showTimesContainer.innerHTML = filtered.map(s => {
      const time = s.showTime || s.time;
      return `<button class="show-time-btn" data-show-id="${s.id}" data-time="${time}">${formatTime(time)}</button>`;
    }).join('');

    document.querySelectorAll('.show-time-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.show-time-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    if (filtered.length === 0) {
      showTimesContainer.innerHTML = '<p class="no-shows">No shows for this date</p>';
    }
  }

  const bookNowBtn = document.getElementById('bookNowBtn');
  bookNowBtn?.addEventListener('click', () => {
    const activeTimeBtn = document.querySelector('.show-time-btn.active');
    if (!activeTimeBtn) {
      Toast.error('Please select a show time');
      return;
    }
    const showId = activeTimeBtn.dataset.showId;
    if (showId) {
      window.location.href = `seat-selection.html?showId=${showId}`;
    }
  });

  await init();
});
