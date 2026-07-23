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

export const ShowService = {
  async getAll() {
    return makeRequest(API.SHOWS.ALL());
  },
  
  async getById(id) {
    return makeRequest(API.SHOWS.BY_ID(id));
  },
  
  async getByMovie(movieId) {
    return makeRequest(API.SHOWS.BY_MOVIE(movieId));
  },
  
  async getByScreen(screenId) {
    return makeRequest(API.SHOWS.BY_SCREEN(screenId));
  },
  
  async getByDate(date) {
    const formatted = date instanceof Date ? date.toISOString().split('T')[0] : date;
    return makeRequest(API.SHOWS.BY_DATE(formatted));
  },

  async create(data) {
    return makeRequest(API.SHOWS.ALL(), {
      method: HTTP_METHODS.POST,
      body: data,
    });
  },

  async update(id, data) {
    return makeRequest(API.SHOWS.BY_ID(id), {
      method: HTTP_METHODS.PUT,
      body: data,
    });
  },

  async delete(id) {
    return makeRequest(API.SHOWS.BY_ID(id), {
      method: HTTP_METHODS.DELETE,
    });
  },
};
