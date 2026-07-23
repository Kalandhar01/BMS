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

export const PaymentService = {
  async getAll() {
    return makeRequest(API.PAYMENTS.ALL());
  },

  async getByStatus(status) {
    return makeRequest(`${API_BASE}/payments?status=${status}`);
  },
  
  async processRefund(paymentId) {
    return makeRequest(API.PAYMENTS.REFUND(paymentId), {
      method: HTTP_METHODS.POST,
    });
  },
};
