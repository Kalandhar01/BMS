const API_BASE_URL = 'http://localhost:8080';

const API = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    VALIDATE: `${API_BASE_URL}/auth/validate`,
  },
  MOVIES: {
    ALL: `${API_BASE_URL}/movies`,
    BY_ID: (id) => `${API_BASE_URL}/movies/${id}`,
    BY_GENRE: (genre) => `${API_BASE_URL}/movies/genre/${genre}`,
    SEARCH: (query) => `${API_BASE_URL}/movies/search?query=${query}`,
  },
  SHOWS: {
    BY_MOVIE: (movieId) => `${API_BASE_URL}/shows/movie/${movieId}`,
    BY_SCREEN: (screenId) => `${API_BASE_URL}/shows/screen/${screenId}`,
    BY_ID: (id) => `${API_BASE_URL}/shows/${id}`,
  },
  SCREENS: {
    ALL: `${API_BASE_URL}/screens`,
    BY_ID: (id) => `${API_BASE_URL}/screens/${id}`,
  },
  SEATS: {
    BY_SHOW: (showId) => `${API_BASE_URL}/seats/show/${showId}`,
    RESERVE: `${API_BASE_URL}/seats/reserve`,
    BOOK: `${API_BASE_URL}/seats/book`,
    RELEASE: `${API_BASE_URL}/seats/release`,
  },
  BOOKINGS: {
    CREATE: `${API_BASE_URL}/bookings/create`,
    BY_USER: (userId) => `${API_BASE_URL}/bookings/user?userId=${userId}`,
    BY_ID: (id) => `${API_BASE_URL}/bookings/${id}`,
    BY_CODE: (code) => `${API_BASE_URL}/bookings/code/${code}`,
    CONFIRM: (id) => `${API_BASE_URL}/bookings/${id}/confirm`,
    CANCEL: (id) => `${API_BASE_URL}/bookings/${id}/cancel`,
  },
  PAYMENTS: {
    PROCESS: `${API_BASE_URL}/payments/process`,
    BY_BOOKING: (bookingId) => `${API_BASE_URL}/payments/booking/${bookingId}`,
  },
};

class ApiClient {
  static async request(url, options = {}) {
    const { method = 'GET', body, headers = {}, useAuth = false } = options;
    const config = { method, headers: { 'Content-Type': 'application/json', ...headers } };
    if (body) config.body = JSON.stringify(body);
    if (useAuth) {
      const { Auth } = await import('../utils/auth.js');
      const token = Auth.getToken();
      if (token) config.headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(url, config);
    if (!res.ok) {
      const err = new Error(`API Error: ${res.status}`);
      err.status = res.status;
      try { err.data = await res.json(); } catch {}
      throw err;
    }
    return res.status === 204 ? null : res.json();
  }

  static get(url, useAuth = false) {
    return this.request(url, { method: 'GET', useAuth });
  }

  static post(url, body, useAuth = true) {
    return this.request(url, { method: 'POST', body, useAuth });
  }

  static put(url, body, useAuth = true) {
    return this.request(url, { method: 'PUT', body, useAuth });
  }

  static delete(url, useAuth = true) {
    return this.request(url, { method: 'DELETE', useAuth });
  }
}
