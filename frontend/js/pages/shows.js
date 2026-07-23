import { ShowService } from '../services/show-service.js';
import { MovieService } from '../services/movie-service.js';
import { ScreenService } from '../services/screen-service.js';
import { formatDate, formatTime, formatDuration } from '../utils/date.js';
import { Toast } from '../utils/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('movieId');

  const showsContainer = document.getElementById('showsContainer');
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const movieTitleEl = document.getElementById('movieTitle');
  const dateFilter = document.getElementById('dateFilter');
  const screenFilter = document.getElementById('screenFilter');
  const timeFilter = document.getElementById('timeFilter');

  let allShows = [];
  let movieCache = {};
  let screenCache = {};

  function showLoading() { loadingEl?.classList.remove('hidden'); showsContainer?.classList.add('hidden'); }
  function hideLoading() { loadingEl?.classList.add('hidden'); showsContainer?.classList.remove('hidden'); }

  async function getMovie(mId) {
    if (movieCache[mId]) return movieCache[mId];
    try { movieCache[mId] = await MovieService.getById(mId); } catch { movieCache[mId] = null; }
    return movieCache[mId];
  }

  async function getScreen(sId) {
    if (screenCache[sId]) return screenCache[sId];
    try { screenCache[sId] = await ScreenService.getById(sId); } catch { screenCache[sId] = null; }
    return screenCache[sId];
  }

  function renderShowCard(show) {
    const card = document.createElement('div');
    card.className = 'show-card';
    card.dataset.date = show.showDate || show.date || '';
    card.dataset.time = show.showTime || show.time || '';
    card.dataset.screenId = show.screenId || show.screen?.id || '';

    const movie = movieCache[show.movieId || show.movie?.id];
    const screen = screenCache[show.screenId || show.screen?.id];
    const screenName = screen?.name || `Screen ${show.screenId || ''}`;
    const movieName = movie?.title || movie?.name || `Movie #${show.movieId}`;
    const date = formatDate(show.showDate || show.date);
    const time = formatTime(show.showTime || show.time);
    const price = show.price || show.ticketPrice || 'N/A';

    card.innerHTML = `
      <div class="show-card-header">
        <h3>${movieName}</h3>
        <span class="show-screen">${screenName}</span>
      </div>
      <div class="show-card-body">
        <div class="show-detail">
          <span class="label">Date</span>
          <span class="value">${date}</span>
        </div>
        <div class="show-detail">
          <span class="label">Time</span>
          <span class="value">${time}</span>
        </div>
        <div class="show-detail">
          <span class="label">Price</span>
          <span class="value">₹${price}</span>
        </div>
      </div>
      <div class="show-card-footer">
        <button class="btn book-show-btn" data-show-id="${show.id}">Book Now</button>
      </div>
    `;

    card.querySelector('.book-show-btn').addEventListener('click', () => {
      window.location.href = `seat-selection.html?showId=${show.id}`;
    });

    return card;
  }

  function renderShows(shows) {
    if (!showsContainer) return;
    showsContainer.innerHTML = '';
    if (shows.length === 0) {
      showsContainer.innerHTML = '<div class="no-results"><h3>No shows found</h3><p>Try changing filters or check back later.</p></div>';
      return;
    }
    const fragment = document.createDocumentFragment();
    shows.forEach(s => fragment.appendChild(renderShowCard(s)));
    showsContainer.appendChild(fragment);
  }

  function filterShows() {
    let filtered = [...allShows];
    const dateVal = dateFilter?.value;
    const screenVal = screenFilter?.value;
    const timeVal = timeFilter?.value;

    if (dateVal) filtered = filtered.filter(s => (s.showDate || s.date) === dateVal);
    if (screenVal) filtered = filtered.filter(s => (s.screenId || s.screen?.id) == screenVal);
    if (timeVal) {
      filtered = filtered.filter(s => {
        const t = s.showTime || s.time || '';
        return t.startsWith(timeVal);
      });
    }
    renderShows(filtered);
  }

  async function init() {
    showLoading();
    try {
      if (movieId) {
        const movie = await getMovie(movieId);
        if (movieTitleEl) movieTitleEl.textContent = movie?.title || movie?.name || 'All Shows';
        allShows = await ShowService.getByMovie(movieId);
      } else {
        if (movieTitleEl) movieTitleEl.textContent = 'All Shows';
        allShows = await ShowService.getByMovie(0).catch(() => []);
      }
      if (!Array.isArray(allShows)) allShows = [];

      const movieIds = [...new Set(allShows.map(s => s.movieId || s.movie?.id).filter(Boolean))];
      const screenIds = [...new Set(allShows.map(s => s.screenId || s.screen?.id).filter(Boolean))];
      await Promise.all([...movieIds.map(getMovie), ...screenIds.map(getScreen)]);

      populateFilters();
      filterShows();
    } catch (err) {
      errorEl?.classList.remove('hidden');
      Toast.error('Failed to load shows');
    } finally {
      hideLoading();
    }
  }

  function populateFilters() {
    if (dateFilter) {
      const dates = [...new Set(allShows.map(s => s.showDate || s.date).filter(Boolean))].sort();
      dateFilter.innerHTML = '<option value="">All Dates</option>' +
        dates.map(d => `<option value="${d}">${formatDate(d)}</option>`).join('');
      dateFilter.addEventListener('change', filterShows);
    }
    if (screenFilter) {
      const screens = [...new Set(allShows.map(s => s.screenId || s.screen?.id).filter(Boolean))];
      screenFilter.innerHTML = '<option value="">All Screens</option>' +
        screens.map(id => `<option value="${id}">Screen ${id}</option>`).join('');
      screenFilter.addEventListener('change', filterShows);
    }
    if (timeFilter) {
      const times = ['09', '12', '15', '18', '21'];
      timeFilter.innerHTML = '<option value="">All Times</option>' +
        times.map(t => `<option value="${t}">${formatTime(t + ':00')}</option>`).join('');
      timeFilter.addEventListener('change', filterShows);
    }
  }

  await init();
});
