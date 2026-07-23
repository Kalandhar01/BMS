/**
 * Authentication Utilities
 * Handles JWT token storage, user session, and auth state management.
 */

const TOKEN_KEY = 'moviehub_token';
const USER_KEY  = 'moviehub_user';

export const Auth = {
  /**
   * Save JWT and user info after login.
   * @param {string} token - JWT token
   * @param {Object} user  - User object
   * @param {boolean} remember - If true, persist to localStorage; else sessionStorage
   */
  setSession(token, user, remember = true) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(USER_KEY, JSON.stringify(user));
    document.body.classList.add('is-authenticated');
    window.dispatchEvent(new CustomEvent('auth:login', { detail: user }));
  },

  /**
   * Clear session data on logout.
   */
  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    document.body.classList.remove('is-authenticated');
    window.dispatchEvent(new CustomEvent('auth:logout'));
  },

  /**
   * Get the current JWT token.
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get the current user object.
   * @returns {Object|null}
   */
  getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if the user is currently authenticated.
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Decode JWT payload (base64)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // convert to ms
      if (Date.now() >= exp) {
        this.clearSession();
        return false;
      }
      return true;
    } catch {
      // Not a valid JWT — treat as authenticated but unverifiable
      return true;
    }
  },

  /**
   * Get a specific field from the JWT payload.
   * @param {string} field
   * @returns {*}
   */
  getTokenClaim(field) {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload[field] ?? null;
    } catch {
      return null;
    }
  },

  /**
   * Initialize auth state on page load.
   * Applies CSS class to body and dispatches event.
   */
  init() {
    if (this.isAuthenticated()) {
      document.body.classList.add('is-authenticated');
    } else {
      document.body.classList.remove('is-authenticated');
    }
    return this.isAuthenticated();
  },

  /**
   * Require authentication — redirect to login if not authenticated.
   * @param {string} [redirectPath] - Path to redirect to after login
   */
  requireAuth(redirectPath = window.location.href) {
    if (!this.isAuthenticated()) {
      const encoded = encodeURIComponent(redirectPath);
      window.location.href = `/pages/login.html?redirect=${encoded}`;
      return false;
    }
    return true;
  },
};

export default Auth;
