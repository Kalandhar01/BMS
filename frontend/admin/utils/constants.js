export const API_BASE = 'http://localhost:8080';

export const API = {
  AUTH: {
    LOGIN: () => `${API_BASE}/auth/login`,
    REGISTER: () => `${API_BASE}/auth/register`,
    VALIDATE: () => `${API_BASE}/auth/validate`,
    PROFILE: () => `${API_BASE}/auth/profile`,
    UPDATE_PROFILE: () => `${API_BASE}/auth/profile/update`,
    CHANGE_PASSWORD: () => `${API_BASE}/auth/change-password`,
    BOOKINGS: () => `${API_BASE}/auth/bookings`,
  },
  MOVIES: {
    ALL: () => `${API_BASE}/movies`,
    BY_ID: (id) => `${API_BASE}/movies/${id}`,
    FEATURED: () => `${API_BASE}/movies/featured`,
    TRENDING: () => `${API_BASE}/movies/trending`,
    UPCOMING: () => `${API_BASE}/movies/upcoming`,
    POPULAR: () => `${API_BASE}/movies/popular`,
    BY_GENRE: (genre) => `${API_BASE}/movies/genre/${genre}`,
    BY_LANG: (lang) => `${API_BASE}/movies/language/${lang}`,
    SEARCH: (query) => `${API_BASE}/movies/search?q=${encodeURIComponent(query)}`,
  },
  SHOWS: {
    ALL: () => `${API_BASE}/shows`,
    BY_MOVIE: (movieId) => `${API_BASE}/shows/movie/${movieId}`,
    BY_SCREEN: (screenId) => `${API_BASE}/shows/screen/${screenId}`,
    BY_DATE: (date) => `${API_BASE}/shows/date?date=${date}`,
    BY_THEATRE: (theatreId) => `${API_BASE}/shows/theatre/${theatreId}`,
    SEARCH: (params) => `${API_BASE}/shows/search?${new URLSearchParams(params)}`,
    BY_ID: (id) => `${API_BASE}/shows/${id}`,
  },
  SCREENS: {
    ALL: () => `${API_BASE}/screens`,
    BY_ID: (id) => `${API_BASE}/screens/${id}`,
    THEATRES: () => `${API_BASE}/screens/theatres`,
    THEATRE_NAMES: () => `${API_BASE}/screens/theatre-names`,
  },
  SEATS: {
    BY_SHOW: (showId) => `${API_BASE}/seats/show/${showId}`,
    LAYOUT: (showId) => `${API_BASE}/seats/show/${showId}/layout`,
    AVAILABLE: (showId) => `${API_BASE}/seats/show/${showId}/available`,
    RESERVE: () => `${API_BASE}/seats/reserve`,
    BOOK: () => `${API_BASE}/seats/book`,
    RELEASE: () => `${API_BASE}/seats/release`,
    STATUS: (seatId) => `${API_BASE}/seats/${seatId}/status`,
  },
  BOOKINGS: {
    ALL: () => `${API_BASE}/bookings`,
    CREATE: () => `${API_BASE}/bookings`,
    BY_ID: (id) => `${API_BASE}/bookings/${id}`,
    BY_USER: (userId) => `${API_BASE}/bookings/user?userId=${userId}`,
    BY_CODE: (code) => `${API_BASE}/bookings/code/${code}`,
    CONFIRM: (id) => `${API_BASE}/bookings/${id}/confirm`,
    CANCEL: (id) => `${API_BASE}/bookings/${id}/cancel`,
    CALCULATE: () => `${API_BASE}/bookings/calculate`,
  },
  PAYMENTS: {
    ALL: () => `${API_BASE}/payments`,
    PROCESS: () => `${API_BASE}/payments/process`,
    STATUS: (txnId) => `${API_BASE}/payments/${txnId}/status`,
    REFUND: (txnId) => `${API_BASE}/payments/${txnId}/refund`,
  },
  USERS: {
    ALL: () => `${API_BASE}/users`,
    BY_ID: (id) => `${API_BASE}/users/${id}`,
    UPDATE: (id) => `${API_BASE}/users/${id}`,
    DELETE: (id) => `${API_BASE}/users/${id}`,
  },
};

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  COMPLETED: 'COMPLETED',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

export const TOAST_DURATION = 3000;
export const DEBOUNCE_DELAY = 300;
