import { API, ApiClient } from '../config/api.js';

export const MovieService = {
  async getAll() {
    return ApiClient.get(API.MOVIES.ALL, false);
  },

  async getById(id) {
    return ApiClient.get(API.MOVIES.BY_ID(id), false);
  },

  async getByGenre(genre) {
    return ApiClient.get(API.MOVIES.BY_GENRE(genre), false);
  },

  async search(query) {
    return ApiClient.get(API.MOVIES.SEARCH(encodeURIComponent(query)), false);
  },
};
