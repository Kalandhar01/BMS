import { AuthService } from '../services/auth-service.js';
import { Auth } from '../utils/auth.js';
import { Toast } from '../utils/toast.js';

document.addEventListener('DOMContentLoaded', () => {
  if (Auth.isAuthenticated()) {
    window.location.href = 'home.html';
    return;
  }

  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('togglePassword');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const errorMessage = document.getElementById('errorMessage');
  const googleLoginBtn = document.getElementById('googleLoginBtn');

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePassword.classList.toggle('fa-eye');
      togglePassword.classList.toggle('fa-eye-slash');
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!email || !password) {
        Toast.error('Please fill in all fields');
        return;
      }

      loadingSpinner?.classList.remove('hidden');
      errorMessage?.classList.add('hidden');

      try {
        const data = await AuthService.login(email, password);
        if (data.token) {
          Toast.success('Login successful! Redirecting...');
          setTimeout(() => { window.location.href = 'home.html'; }, 1000);
        }
      } catch (err) {
        const msg = err.data?.message || err.data?.error || 'Login failed. Please check your credentials.';
        if (errorMessage) {
          errorMessage.textContent = msg;
          errorMessage.classList.remove('hidden');
        }
        Toast.error(msg);
      } finally {
        loadingSpinner?.classList.add('hidden');
      }
    });
  }

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
      try {
        googleLoginBtn.disabled = true;
        await AuthService.loginWithGoogle();
        Toast.success('Google login successful!');
        setTimeout(() => { window.location.href = 'home.html'; }, 1000);
      } catch {
        Toast.error('Google login failed');
      } finally {
        googleLoginBtn.disabled = false;
      }
    });
  }
});
