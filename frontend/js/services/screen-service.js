import { API, ApiClient } from '../config/api.js';

export const ScreenService = {
  async getAll() {
    return ApiClient.get(API.SCREENS.ALL, false);
  },

  async getById(id) {
    return ApiClient.get(API.SCREENS.BY_ID(id), false);
  },
};
