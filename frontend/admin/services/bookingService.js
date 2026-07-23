import { API, API_BASE, HTTP_METHODS } from '../utils/constants.js';

const makeRequest = async (url, options = {}) => {
  const token = localStorage.getItem('adminToken');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  if (config.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage;
    try {
      const errData = await response.json();
      errorMessage = errData.message || errData.error || `Request failed with status ${response.status}`;
    } catch {
      errorMessage = `Request failed with status ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const BookingService = {
  async getAll() {
    return makeRequest(API.BOOKINGS.ALL());
  },

  async getById(id) {
    return makeRequest(API.BOOKINGS.BY_ID(id));
  },

  async getByUser(userId) {
    return makeRequest(API.BOOKINGS.BY_USER(userId));
  },

  async getByStatus(status) {
    return makeRequest(`${API_BASE}/bookings?status=${status}`);
  },

  async cancel(id) {
    return makeRequest(API.BOOKINGS.CANCEL(id), {
      method: HTTP_METHODS.PATCH,
    });
  },

  async refund(id) {
    return makeRequest(`${API_BASE}/bookings/${id}/cancel`, {
      method: HTTP_METHODS.PUT,
    });
  },

  async delete(id) {
    return makeRequest(API.BOOKINGS.BY_ID(id), {
      method: HTTP_METHODS.DELETE,
    });
  },
};
