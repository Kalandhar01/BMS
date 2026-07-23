import { API, ApiClient } from '../config/api.js';
import { Auth } from '../utils/auth.js';

export const AuthService = {
  async login(email, password) {
    const data = await ApiClient.post(API.AUTH.LOGIN, { email, password }, false);
    if (data.token) {
      Auth.setSession({ token: data.token, user: data });
    }
    return data;
  },

  async register(userData) {
    const data = await ApiClient.post(API.AUTH.REGISTER, userData, false);
    return data;
  },

  async validate() {
    const token = Auth.getToken();
    if (!token) return null;
    try {
      return await ApiClient.get(API.AUTH.VALIDATE, true);
    } catch {
      Auth.clearSession();
      return null;
    }
  },

  async loginWithGoogle() {
    const { Auth } = await import('../utils/auth.js');
    Auth.setSession({
      token: 'google-demo-token-' + Date.now(),
      user: { userId: 1, name: 'Google User', email: 'google@example.com' },
    });
    return true;
  },

  logout() {
    Auth.clearSession();
    window.location.href = 'login.html';
  },
};
