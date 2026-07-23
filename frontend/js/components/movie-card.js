import { formatDuration } from '../utils/date.js';

export class MovieCard {
  static create(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.movieId = movie.id;

    const rating = movie.rating || movie.imdbRating || 'N/A';
    const year = movie.releaseYear ? ` (${movie.releaseYear})` : '';
    const lang = movie.language ? `<span class="movie-lang">${movie.language}</span>` : '';
    const duration = movie.duration ? formatDuration(movie.duration) : '';
    const poster = movie.posterUrl || movie.poster || '../images/default-poster.jpg';
    const title = movie.title || movie.name || 'Untitled';

    card.innerHTML = `
      <div class="movie-poster">
        <img src="${poster}" alt="${title}" loading="lazy" onerror="this.src='../images/default-poster.jpg'">
        <div class="movie-rating-badge">${rating}</div>
      </div>
      <div class="movie-info">
        <h3 class="movie-title">${title}${year}</h3>
        <div class="movie-meta">
          ${lang}
          ${duration ? `<span class="movie-duration">${duration}</span>` : ''}
        </div>
        ${movie.genre ? `<div class="movie-genres">${movie.genre.split(',').map(g => `<span class="genre-tag">${g.trim()}</span>`).join('')}</div>` : ''}
      </div>
    `;

    card.addEventListener('click', () => {
      window.location.href = `movie-details.html?id=${movie.id}`;
    });

    return card;
  }
}
