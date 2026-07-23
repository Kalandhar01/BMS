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

export const MovieService = {
  async getAll() {
    return makeRequest(API.MOVIES.ALL());
  },

  async getById(id) {
    return makeRequest(API.MOVIES.BY_ID(id));
  },

  async create(data) {
    return makeRequest(API.MOVIES.ALL(), {
      method: HTTP_METHODS.POST,
      body: data,
    });
  },

  async update(id, data) {
    return makeRequest(API.MOVIES.BY_ID(id), {
      method: HTTP_METHODS.PUT,
      body: data,
    });
  },

  async delete(id) {
    return makeRequest(API.MOVIES.BY_ID(id), {
      method: HTTP_METHODS.DELETE,
    });
  },

  async search(query) {
    return makeRequest(API.MOVIES.SEARCH(query));
  },

  async getByGenre(genre) {
    return makeRequest(API.MOVIES.BY_GENRE(genre));
  },

  async uploadPoster(file) {
    const formData = new FormData();
    formData.append('file', file);
    return makeRequest(`${API.MOVIES.ALL()}/upload/poster`, {
      method: HTTP_METHODS.POST,
      body: formData,
    });
  },

  async uploadBanner(file) {
    const formData = new FormData();
    formData.append('file', file);
    return makeRequest(`${API.MOVIES.ALL()}/upload/banner`, {
      method: HTTP_METHODS.POST,
      body: formData,
    });
  },
};
