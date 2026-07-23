import { API, ApiClient } from '../config/api.js';

export const ShowService = {
  async getByMovie(movieId) {
    return ApiClient.get(API.SHOWS.BY_MOVIE(movieId), false);
  },

  async getByScreen(screenId) {
    return ApiClient.get(API.SHOWS.BY_SCREEN(screenId), false);
  },

  async getById(id) {
    return ApiClient.get(API.SHOWS.BY_ID(id), false);
  },

  async getShowDetails(showId) {
    const show = await this.getById(showId);
    if (!show) return null;
    const [movieRes, screenRes] = await Promise.allSettled([
      import('./movie-service.js').then(m => m.MovieService.getById(show.movieId || show.movie?.id)),
      import('./screen-service.js').then(s => s.ScreenService.getById(show.screenId || show.screen?.id)),
    ]);
    const movie = movieRes.status === 'fulfilled' ? movieRes.value : null;
    const screen = screenRes.status === 'fulfilled' ? screenRes.value : null;
    return { show, movie, screen };
  },
};
