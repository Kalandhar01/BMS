import { API, ApiClient } from '../config/api.js';

export const BookingService = {
  async create(bookingData) {
    return ApiClient.post(API.BOOKINGS.CREATE, bookingData, true);
  },

  async getUserBookings(userId) {
    return ApiClient.get(API.BOOKINGS.BY_USER(userId), false);
  },

  async getById(id) {
    return ApiClient.get(API.BOOKINGS.BY_ID(id), true);
  },

  async getByCode(code) {
    return ApiClient.get(API.BOOKINGS.BY_CODE(code), true);
  },

  async confirm(id) {
    return ApiClient.put(API.BOOKINGS.CONFIRM(id), {}, true);
  },

  async cancel(id) {
    return ApiClient.put(API.BOOKINGS.CANCEL(id), {}, true);
  },
};
