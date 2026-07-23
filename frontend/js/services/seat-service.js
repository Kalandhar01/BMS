import { API, ApiClient } from '../config/api.js';

export const SeatService = {
  async getByShow(showId) {
    return ApiClient.get(API.SEATS.BY_SHOW(showId), false);
  },

  async reserve(seatIds, showId) {
    return ApiClient.post(API.SEATS.RESERVE, { seatIds, showId }, true);
  },

  async book(seatIds) {
    return ApiClient.post(API.SEATS.BOOK, { seatIds }, true);
  },

  async release(seatIds) {
    return ApiClient.post(API.SEATS.RELEASE, { seatIds }, true);
  },
};
