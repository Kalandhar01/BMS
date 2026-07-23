/**
 * Home Page Controller
 * Fetches and renders featured hero, trending, upcoming, popular, recommended movies.
 * Falls back to mock data if API Gateway is unavailable.
 */
import { API, ApiClient } from '../api/config.js';
import Auth from '../utils/auth.js';
import toast from '../utils/toast.js';
import { formatDuration, initLazyLoad, initScrollAnimations, debounce } from '../utils/helpers.js';

/* ── Badge colors by genre ─────────────────────────────────── */
const GENRE_COLORS = {
  'Action':    'badge--red',
  'Thriller':  'badge--warning',
  'Drama':     'badge--info',
  'Sci-Fi':    'badge--primary',
  'Comedy':    'badge--success',
  'Horror':    'badge--ghost',
  'Fantasy':   'badge--gold',
  'Romance':   'badge--red',
  'Adventure': 'badge--success',
  'Mystery':   'badge--ghost',
};

/* ── Normalize movie data ─────────────────────────────────── */
function normalizeMovie(m) {
  const genreArray = typeof m.genre === 'string' ? m.genre.split(',').map(g => g.trim()).filter(Boolean) : (m.genre || []);
  return {
    ...m,
    posterUrl: m.posterUrl || m.poster || '',
    backdropUrl: m.backdropUrl || m.backdrop || '',
    duration: m.duration ? (typeof m.duration === 'number' ? formatDuration(m.duration) : m.duration) : '',
    releaseDate: m.releaseDate || m.release_date || '',
    genre: genreArray,
    trailerUrl: m.trailerUrl || '',
    description: m.description || '',
  };
}

/* ── Movie Card renderer ───────────────────────────────────── */
function renderMovieCard(rawMovie, index = 0) {
  const movie = normalizeMovie(rawMovie);
  const genres  = movie.genre.slice(0, 2);

  return `
    <article class="movie-card animate-on-scroll" role="listitem"
      style="animation-delay: ${index * 60}ms"
      data-movie-id="${movie.id}"
      tabindex="0"
      aria-label="${movie.title}, ${movie.rating} rating"
    >
      <div class="movie-card__poster">
        <img
          data-src="${movie.posterUrl}"
          src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
          alt="Poster for ${movie.title}"
          loading="lazy"
        />
        ${movie.trending ? `<div class="movie-card__trending-badge">🔥 Hot</div>` : `
          <div class="movie-card__rating-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFD700"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${movie.rating}
          </div>
        `}
        <button class="movie-card__wishlist" aria-label="Add to watchlist">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <div class="movie-card__overlay">
          <button class="movie-card__quick-book" data-id="${movie.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6"/></svg>
            Book Now
          </button>
        </div>
      </div>
      <div class="movie-card__body">
        <h3 class="movie-card__title" title="${movie.title}">${movie.title}</h3>
        <div class="movie-card__meta">
          <span class="movie-card__meta-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#FFD700"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${movie.rating}
          </span>
          <span class="movie-card__meta-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${movie.duration}
          </span>
          <span class="movie-card__meta-item">${movie.language}</span>
        </div>
        <div class="movie-card__genres">
          ${genres.map(g => `<span class="badge badge--xs ${GENRE_COLORS[g] || 'badge--ghost'}">${g}</span>`).join('')}
        </div>
        <button class="movie-card__book-btn" data-id="${movie.id}" aria-label="Book ticket for ${movie.title}">
          Book Ticket
        </button>
      </div>
    </article>
  `;
}

/* ── Hero Banner ───────────────────────────────────────────── */
class HeroBanner {
  constructor(movies) {
    this.movies  = movies;
    this.current = 0;
    this.timer   = null;
    this.isAnimating = false;

    this.backdrop = document.getElementById('heroBackdrop');
    this.title    = document.getElementById('heroTitle');
    this.info     = document.getElementById('heroInfo');
    this.desc     = document.getElementById('heroDesc');
    this.badges   = document.getElementById('heroBadges');
    this.actions  = document.getElementById('heroActions');
    this.poster   = document.getElementById('heroPoster');
    this.dots     = document.getElementById('heroDots');
    this.prevBtn  = document.getElementById('heroPrev');
    this.nextBtn  = document.getElementById('heroNext');
    this.trailerBtn = document.getElementById('heroTrailerBtn');
    this.bookBtn    = document.getElementById('heroBookBtn');

    this.renderDots();
    this.show(0);
    this.startAutoPlay();
    this.bindEvents();
  }

  renderDots() {
    if (!this.dots) return;
    this.dots.innerHTML = this.movies.map((_, i) =>
      `<button class="hero-dot${i === 0 ? ' active' : ''}" role="tab" aria-label="Go to slide ${i + 1}" data-index="${i}"></button>`
    ).join('');
    this.dots.querySelectorAll('.hero-dot').forEach(dot => {
      dot.addEventListener('click', () => this.show(parseInt(dot.dataset.index)));
    });
  }

  show(index) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const raw = this.movies[index];
    if (!raw) { this.isAnimating = false; return; }
    const movie = normalizeMovie(raw);
    this.current = index;

    if (this.backdrop) {
      this.backdrop.style.opacity = '0';
      setTimeout(() => {
        this.backdrop.style.backgroundImage = `url('${movie.backdropUrl}')`;
        this.backdrop.style.opacity = '1';
      }, 300);
    }

    if (this.poster) {
      this.poster.innerHTML = `<img src="${movie.posterUrl}" alt="Poster for ${movie.title}" loading="eager" />`;
    }

    if (this.badges) {
      const genres = movie.genre.slice(0, 3);
      this.badges.innerHTML = genres.map(g =>
        `<span class="badge ${GENRE_COLORS[g] || 'badge--ghost'}">${g}</span>`
      ).join('') + (movie.language ? `<span class="badge badge--ghost">${movie.language}</span>` : '');
    }

    if (this.title) this.title.textContent = movie.title;

    if (this.info) {
      this.info.innerHTML = `
        <span class="hero__info-item rating">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          ${movie.rating} / 10
        </span>
        <span class="hero__info-divider"></span>
        <span class="hero__info-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${movie.duration}
        </span>
        <span class="hero__info-divider"></span>
        <span class="hero__info-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Now Showing'}
        </span>
      `;
    }

    if (this.desc) this.desc.textContent = movie.description;

    if (this.trailerBtn) {
      this.trailerBtn.disabled = !movie.trailerUrl;
      this.trailerBtn.dataset.trailer = movie.trailerUrl || '';
    }

    if (this.bookBtn) {
      this.bookBtn.disabled = false;
      this.bookBtn.dataset.id = movie.id;
    }

    this.dots?.querySelectorAll('.hero-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    setTimeout(() => { this.isAnimating = false; }, 500);
  }

  startAutoPlay() {
    this.timer = setInterval(() => {
      this.show((this.current + 1) % this.movies.length);
    }, 6000);
  }

  stopAutoPlay() {
    clearInterval(this.timer);
  }

  bindEvents() {
    this.prevBtn?.addEventListener('click', () => {
      this.stopAutoPlay();
      this.show((this.current - 1 + this.movies.length) % this.movies.length);
      this.startAutoPlay();
    });

    this.nextBtn?.addEventListener('click', () => {
      this.stopAutoPlay();
      this.show((this.current + 1) % this.movies.length);
      this.startAutoPlay();
    });

    this.trailerBtn?.addEventListener('click', () => {
      const url = this.trailerBtn.dataset.trailer;
      if (!url) return;
      openTrailerModal(url);
    });

    this.bookBtn?.addEventListener('click', () => {
      const id = this.bookBtn.dataset.id;
      if (id) window.location.href = `/pages/movie-details.html?id=${id}`;
    });
  }
}

/* ── Trailer Modal ─────────────────────────────────────────── */
function openTrailerModal(url) {
  const modal  = document.getElementById('trailerModal');
  const frame  = document.getElementById('trailerFrame');
  const close  = document.getElementById('trailerClose');

  if (!modal || !frame) return;

  // Convert YouTube watch URL to embed URL
  const embedUrl = url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/');
  frame.src = embedUrl + '?autoplay=1&rel=0';

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');

  const closeModal = () => {
    modal.classList.remove('open');
    frame.src = '';
    modal.setAttribute('aria-hidden', 'true');
  };

  close?.addEventListener('click', closeModal, { once: true });
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); }, { once: true });
}

/* ── Book button handler ───────────────────────────────────── */
function handleBookClick(movieId) {
  if (!Auth.isAuthenticated()) {
    toast.warning('Please sign in to book tickets.');
    setTimeout(() => {
      window.location.href = `/pages/login.html?redirect=${encodeURIComponent(window.location.href)}`;
    }, 1500);
    return;
  }
  window.location.href = `/pages/shows.html?movieId=${movieId}`;
}

/* ── Grid renderer ─────────────────────────────────────────── */
function renderMoviesGrid(gridEl, movies) {
  if (!gridEl) return;
  if (!movies || movies.length === 0) {
    gridEl.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1">
        <div class="empty-state__icon">🎬</div>
        <div class="empty-state__title">No movies found</div>
        <div class="empty-state__desc">Check back soon for more movies!</div>
      </div>
    `;
    return;
  }
  gridEl.innerHTML = movies.map((m, i) => renderMovieCard(m, i)).join('');
  initLazyLoad('[data-src]');

  // Bind book buttons
  gridEl.querySelectorAll('[data-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleBookClick(btn.dataset.id);
    });
  });

  // Wishlist buttons
  gridEl.querySelectorAll('.movie-card__wishlist').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.classList.toggle('active');
      const isAdded = btn.classList.contains('active');
      toast.success(isAdded ? 'Added to watchlist!' : 'Removed from watchlist');
    });
  });

  // Entire card click → movie details
  gridEl.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      window.location.href = `/pages/movie-details.html?id=${card.dataset.movieId}`;
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') window.location.href = `/pages/movie-details.html?id=${card.dataset.movieId}`;
    });
  });
}

/* ── Main init ─────────────────────────────────────────────── */
async function initHomePage() {
  const trendingGrid   = document.getElementById('trendingGrid');
  const upcomingGrid   = document.getElementById('upcomingGrid');
  const popularGrid    = document.getElementById('popularGrid');
  const recommendedGrid = document.getElementById('recommendedGrid');

  try {
    const [featured, trending, upcoming, popular] = await Promise.all([
      ApiClient.get(API.MOVIES.FEATURED, false),
      ApiClient.get(API.MOVIES.TRENDING, false),
      ApiClient.get(API.MOVIES.UPCOMING, false),
      ApiClient.get(API.MOVIES.POPULAR,  false),
    ]);

    if (featured?.length) new HeroBanner(featured);
    renderMoviesGrid(trendingGrid,    trending);
    renderMoviesGrid(upcomingGrid,    upcoming);
    renderMoviesGrid(popularGrid,     popular);

    if (Auth.isAuthenticated()) {
      const recommended = await ApiClient.get(API.MOVIES.ALL + '?recommended=true', false);
      renderMoviesGrid(recommendedGrid, recommended?.slice?.(0, 4) || []);
    } else {
      renderMoviesGrid(recommendedGrid, popular?.slice?.(0, 4) || []);
    }

    initScrollAnimations();

  } catch (err) {
    console.error('Home page error:', err);
    document.querySelectorAll('.movie-grid').forEach(g => {
      g.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state__icon">🎬</div>
        <div class="empty-state__title">Unable to load movies</div>
        <div class="empty-state__desc">Please check your connection and try again.</div>
      </div>`;
    });
  }
}

document.addEventListener('DOMContentLoaded', initHomePage);
