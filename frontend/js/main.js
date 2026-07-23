import { API, ApiClient } from './api/config.js';
import Auth from './utils/auth.js';
import './components/navbar.js';

document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
});
