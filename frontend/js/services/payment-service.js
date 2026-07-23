import { API, ApiClient } from '../config/api.js';

export const PaymentService = {
  async process(paymentData) {
    return ApiClient.post(API.PAYMENTS.PROCESS, paymentData, false);
  },

  async getByBooking(bookingId) {
    return ApiClient.get(API.PAYMENTS.BY_BOOKING(bookingId), false);
  },
};
