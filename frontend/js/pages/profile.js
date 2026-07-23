import { Auth } from '../utils/auth.js';
import { Toast } from '../utils/toast.js';
import { validateName, validateEmail, validatePhone } from '../utils/validation.js';

document.addEventListener('DOMContentLoaded', () => {
  const user = Auth.getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const nameInput = document.getElementById('profileName');
  const emailInput = document.getElementById('profileEmail');
  const phoneInput = document.getElementById('profilePhone');
  const avatarName = document.getElementById('avatarName');
  const memberSince = document.getElementById('memberSince');
  const editBtn = document.getElementById('editProfileBtn');
  const saveBtn = document.getElementById('saveProfileBtn');
  const cancelBtn = document.getElementById('cancelEditBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const form = document.getElementById('profileForm');
  const inputs = [nameInput, phoneInput].filter(Boolean);
  const initialName = user.name || user.fullName || 'User';
  const initialPhone = user.phone || user.mobile || '';

  if (nameInput) nameInput.value = initialName;
  if (emailInput) emailInput.value = user.email || '';
  if (phoneInput) phoneInput.value = initialPhone;

  if (avatarName) avatarName.textContent = (initialName.charAt(0) || 'U').toUpperCase();
  if (memberSince) memberSince.textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : 'Member since 2025';

  function setEditMode(enabled) {
    inputs.forEach(inp => inp.disabled = !enabled);
    saveBtn?.classList.toggle('hidden', !enabled);
    cancelBtn?.classList.toggle('hidden', !enabled);
    editBtn?.classList.toggle('hidden', enabled);
  }

  setEditMode(false);

  editBtn?.addEventListener('click', () => setEditMode(true));
  cancelBtn?.addEventListener('click', () => {
    nameInput.value = initialName;
    phoneInput.value = initialPhone;
    setEditMode(false);
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameInput?.value?.trim();
    const phone = phoneInput?.value?.trim();

    const nameResult = validateName(name);
    if (!nameResult.valid) { Toast.error(nameResult.message); return; }
    const phoneResult = validatePhone(phone);
    if (!phoneResult.valid) { Toast.error(phoneResult.message); return; }

    try {
      const updatedUser = { ...user, name, phone };
      Auth.setSession({ token: Auth.getToken(), user: updatedUser });
      if (avatarName) avatarName.textContent = (name.charAt(0) || 'U').toUpperCase();
      setEditMode(false);
      Toast.success('Profile updated successfully');
    } catch {
      Toast.error('Failed to update profile');
    }
  });

  logoutBtn?.addEventListener('click', () => {
    Auth.clearSession();
    Toast.success('Logged out successfully');
    setTimeout(() => { window.location.href = 'login.html'; }, 500);
  });
});
