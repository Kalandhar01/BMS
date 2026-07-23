/**
 * API Configuration
 * All requests flow through the Spring Boot API Gateway.
 * Frontend never communicates directly with microservices.
 */

const API_GATEWAY_BASE = 'http://localhost:8080';

export const API = {
  BASE: API_GATEWAY_BASE,

  // Auth / User Service → /auth/**
  AUTH: {
    LOGIN:    `${API_GATEWAY_BASE}/auth/login`,
    REGISTER: `${API_GATEWAY_BASE}/auth/register`,
    LOGOUT:   `${API_GATEWAY_BASE}/auth/logout`,
    PROFILE:  `${API_GATEWAY_BASE}/auth/profile`,
    UPDATE:   `${API_GATEWAY_BASE}/auth/profile/update`,
    CHANGE_PASSWORD: `${API_GATEWAY_BASE}/auth/change-password`,
    BOOKINGS: `${API_GATEWAY_BASE}/auth/bookings`,
    VALIDATE: `${API_GATEWAY_BASE}/auth/validate`,
  },

  // Movie Service → /movies/**
  MOVIES: {
    ALL:        `${API_GATEWAY_BASE}/movies`,
    BY_ID:      (id) => `${API_GATEWAY_BASE}/movies/${id}`,
    SEARCH:     `${API_GATEWAY_BASE}/movies/search`,
    FEATURED:   `${API_GATEWAY_BASE}/movies/featured`,
    TRENDING:   `${API_GATEWAY_BASE}/movies/trending`,
    UPCOMING:   `${API_GATEWAY_BASE}/movies/upcoming`,
    POPULAR:    `${API_GATEWAY_BASE}/movies/popular`,
    BY_GENRE:   (genre) => `${API_GATEWAY_BASE}/movies/genre/${genre}`,
    BY_LANGUAGE:(lang)  => `${API_GATEWAY_BASE}/movies/language/${lang}`,
  },

  // Screen Service → /screens/**
  SCREENS: {
    ALL:      `${API_GATEWAY_BASE}/screens`,
    BY_ID:    (id) => `${API_GATEWAY_BASE}/screens/${id}`,
    THEATRES: `${API_GATEWAY_BASE}/screens/theatres`,
  },

  // Show Service → /shows/**
  SHOWS: {
    ALL:          `${API_GATEWAY_BASE}/shows`,
    BY_ID:        (id) => `${API_GATEWAY_BASE}/shows/${id}`,
    BY_MOVIE:     (movieId) => `${API_GATEWAY_BASE}/shows/movie/${movieId}`,
    BY_DATE:      `${API_GATEWAY_BASE}/shows/date`,
    BY_THEATRE:   (theatreId) => `${API_GATEWAY_BASE}/shows/theatre/${theatreId}`,
    SEARCH:       `${API_GATEWAY_BASE}/shows/search`,
  },

  // Seat Service → /seats/**
  SEATS: {
    LAYOUT:     (showId)  => `${API_GATEWAY_BASE}/seats/show/${showId}/layout`,
    AVAILABLE:  (showId)  => `${API_GATEWAY_BASE}/seats/show/${showId}/available`,
    RESERVE:    `${API_GATEWAY_BASE}/seats/reserve`,
    RELEASE:    `${API_GATEWAY_BASE}/seats/release`,
    STATUS:     (seatId)  => `${API_GATEWAY_BASE}/seats/${seatId}/status`,
  },

  // Booking Service → /bookings/**
  BOOKINGS: {
    CREATE:       `${API_GATEWAY_BASE}/bookings`,
    BY_ID:        (id) => `${API_GATEWAY_BASE}/bookings/${id}`,
    CANCEL:       (id) => `${API_GATEWAY_BASE}/bookings/${id}/cancel`,
    USER_HISTORY: `${API_GATEWAY_BASE}/bookings/user`,
    MY_BOOKINGS:  `${API_GATEWAY_BASE}/bookings/user`,
    CONFIRM:      (id) => `${API_GATEWAY_BASE}/bookings/${id}/confirm`,
    CALCULATE:    `${API_GATEWAY_BASE}/bookings/calculate`,
  },

  // User Service → /users/** (via API Gateway)
  USER: {
    PROFILE:         `${API_GATEWAY_BASE}/users/me`,
    CHANGE_PASSWORD: `${API_GATEWAY_BASE}/users/me/password`,
    PREFERENCES:     `${API_GATEWAY_BASE}/users/me/preferences`,
    AVATAR:          `${API_GATEWAY_BASE}/users/me/avatar`,
  },

  // Payment Service → /payments/**
  PAYMENTS: {
    PROCESS:    `${API_GATEWAY_BASE}/payments/process`,
    STATUS:     (txnId) => `${API_GATEWAY_BASE}/payments/${txnId}/status`,
    REFUND:     (txnId) => `${API_GATEWAY_BASE}/payments/${txnId}/refund`,
  },
};

/**
 * HTTP Client — wraps fetch with JWT, error handling, and loading states.
 */
export class ApiClient {
  static getToken() {
    return localStorage.getItem('moviehub_token') || sessionStorage.getItem('moviehub_token');
  }

  static buildHeaders(authenticated = true, contentType = 'application/json') {
    const headers = { 'Content-Type': contentType };
    if (authenticated) {
      const token = this.getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Generic request method with full error handling.
   * All API calls funnel through this.
   */
  static async request(url, options = {}, authenticated = true) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.buildHeaders(authenticated),
          ...(options.headers || {}),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 401 → redirect to login
      if (response.status === 401) {
        this.handleUnauthorized();
        throw new ApiError('Session expired. Please log in again.', 401);
      }

      // 403 → forbidden
      if (response.status === 403) {
        throw new ApiError('You do not have permission to perform this action.', 403);
      }

      const contentType = response.headers.get('content-type') || '';
      let data;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const message = (data && (data.message || data.error)) || `Request failed (${response.status})`;
        throw new ApiError(message, response.status, data);
      }

      return data;

    } catch (err) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        throw new ApiError('Request timed out. Please check your connection.', 408);
      }

      if (err instanceof ApiError) throw err;

      // Network error
      throw new ApiError('Network error. Please check your connection and try again.', 0);
    }
  }

  // Convenience methods
  static get(url, authenticated = true) {
    return this.request(url, { method: 'GET' }, authenticated);
  }

  static post(url, body, authenticated = true) {
    return this.request(url, { method: 'POST', body: JSON.stringify(body) }, authenticated);
  }

  static put(url, body, authenticated = true) {
    return this.request(url, { method: 'PUT', body: JSON.stringify(body) }, authenticated);
  }

  static patch(url, body, authenticated = true) {
    return this.request(url, { method: 'PATCH', body: JSON.stringify(body) }, authenticated);
  }

  static delete(url, authenticated = true) {
    return this.request(url, { method: 'DELETE' }, authenticated);
  }

  static handleUnauthorized() {
    localStorage.removeItem('moviehub_token');
    localStorage.removeItem('moviehub_user');
    sessionStorage.removeItem('moviehub_token');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/pages/login.html?session=expired';
    }
  }
}

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}


