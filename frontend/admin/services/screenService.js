import { API, HTTP_METHODS } from '../utils/constants.js';

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

export const ScreenService = {
  async getAll() {
    return makeRequest(API.SCREENS.ALL());
  },

  async getById(id) {
    return makeRequest(API.SCREENS.BY_ID(id));
  },

  async create(data) {
    return makeRequest(API.SCREENS.ALL(), {
      method: HTTP_METHODS.POST,
      body: data,
    });
  },

  async getTheatres() {
    return makeRequest(API.SCREENS.THEATRES());
  },

  async getTheatreNames() {
    return makeRequest(API.SCREENS.THEATRE_NAMES());
  },
};
