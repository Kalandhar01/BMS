import { AuthService } from '../services/auth-service.js';
import { Auth } from '../utils/auth.js';
import { Toast } from '../utils/toast.js';
import { validateName, validateEmail, validatePassword, validatePhone, validateConfirmPassword } from '../utils/validation.js';

document.addEventListener('DOMContentLoaded', () => {
  if (Auth.isAuthenticated()) {
    window.location.href = 'home.html';
    return;
  }

  const registerForm = document.getElementById('registerForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const togglePassword = document.getElementById('togglePassword');
  const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
  const loadingSpinner = document.getElementById('loadingSpinner');

  [togglePassword, toggleConfirmPassword].forEach((btn, i) => {
    const input = i === 0 ? passwordInput : confirmPasswordInput;
    if (btn && input) {
      btn.addEventListener('click', () => {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        btn.classList.toggle('fa-eye');
        btn.classList.toggle('fa-eye-slash');
      });
    }
  });

  function showFieldError(inputId, message) {
    const errorEl = document.getElementById(inputId + 'Error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
  }

  function clearFieldErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.classList.add('hidden'));
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFieldErrors();

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const phone = phoneInput.value.trim();
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      const nameResult = validateName(name);
      if (!nameResult.valid) { showFieldError('name', nameResult.message); return; }
      const emailResult = validateEmail(email);
      if (!emailResult.valid) { showFieldError('email', emailResult.message); return; }
      const phoneResult = validatePhone(phone);
      if (!phoneResult.valid) { showFieldError('phone', phoneResult.message); return; }
      const passResult = validatePassword(password);
      if (!passResult.valid) { showFieldError('password', passResult.message); return; }
      const confirmResult = validateConfirmPassword(password, confirmPassword);
      if (!confirmResult.valid) { showFieldError('confirmPassword', confirmResult.message); return; }

      loadingSpinner?.classList.remove('hidden');

      try {
        await AuthService.register({ name, email, phone, password });
        Toast.success('Registration successful! Please login.');
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
      } catch (err) {
        const msg = err.data?.message || err.data?.error || 'Registration failed. Please try again.';
        Toast.error(msg);
      } finally {
        loadingSpinner?.classList.add('hidden');
      }
    });
  }
});
