import { MovieService } from '../services/movie-service.js';
import { MovieCard } from '../components/movie-card.js';
import { Toast } from '../utils/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  const moviesGrid = document.getElementById('moviesGrid');
  const searchInput = document.getElementById('searchInput');
  const genreFilter = document.getElementById('genreFilter');
  const langFilter = document.getElementById('langFilter');
  const sortSelect = document.getElementById('sortSelect');
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const noResults = document.getElementById('noResults');
  const movieCount = document.getElementById('movieCount');

  let allMovies = [];
  let filteredMovies = [];

  function showLoading() {
    loadingEl?.classList.remove('hidden');
    errorEl?.classList.add('hidden');
    noResults?.classList.add('hidden');
  }

  function hideLoading() {
    loadingEl?.classList.add('hidden');
  }

  function renderMovies(movies) {
    if (!moviesGrid) return;
    moviesGrid.innerHTML = '';
    if (!movies || movies.length === 0) {
      noResults?.classList.remove('hidden');
      if (movieCount) movieCount.textContent = '0';
      return;
    }
    noResults?.classList.add('hidden');
    if (movieCount) movieCount.textContent = movies.length;
    const fragment = document.createDocumentFragment();
    movies.forEach(movie => fragment.appendChild(MovieCard.create(movie)));
    moviesGrid.appendChild(fragment);
  }

  function filterAndSort() {
    const searchTerm = searchInput?.value?.toLowerCase().trim() || '';
    const genre = genreFilter?.value || '';
    const lang = langFilter?.value || '';
    const sort = sortSelect?.value || 'popularity';

    filteredMovies = allMovies.filter(m => {
      const title = (m.title || m.name || '').toLowerCase();
      if (searchTerm && !title.includes(searchTerm)) return false;
      if (genre && !(m.genre || '').toLowerCase().includes(genre.toLowerCase())) return false;
      if (lang && (m.language || '').toLowerCase() !== lang.toLowerCase()) return false;
      return true;
    });

    switch (sort) {
      case 'title':
        filteredMovies.sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
        break;
      case 'rating':
        filteredMovies.sort((a, b) => parseFloat(b.rating || b.imdbRating || 0) - parseFloat(a.rating || a.imdbRating || 0));
        break;
      case 'year':
        filteredMovies.sort((a, b) => parseInt(b.releaseYear || b.year || 0) - parseInt(a.releaseYear || a.year || 0));
        break;
      default:
        break;
    }

    renderMovies(filteredMovies);
  }

  async function init() {
    showLoading();
    try {
      allMovies = await MovieService.getAll();
      if (!Array.isArray(allMovies)) allMovies = [];
      allMovies.forEach((m, i) => { if (!m.id) m.id = i + 1; });
      filterAndSort();
    } catch (err) {
      errorEl?.classList.remove('hidden');
      Toast.error('Failed to load movies');
    } finally {
      hideLoading();
    }
  }

  searchInput?.addEventListener('input', filterAndSort);
  genreFilter?.addEventListener('change', filterAndSort);
  langFilter?.addEventListener('change', filterAndSort);
  sortSelect?.addEventListener('change', filterAndSort);

  await init();
});
