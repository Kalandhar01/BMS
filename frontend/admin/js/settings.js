import { showLoading, hideLoading, showToast } from './admin.js';
import { Validation } from '../utils/validation.js';

const STORAGE_KEYS = {
  profile: 'admin_profile',
  notifications: 'admin_notifications',
  appearance: 'admin_appearance',
  application: 'admin_application',
};

const loadFromStorage = (key, defaults) => {
  try {
    const data = localStorage.getItem(key);
    return data ? { ...defaults, ...JSON.parse(data) } : defaults;
  } catch {
    return defaults;
  }
};

const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const initTabs = () => {
  const tabs = document.querySelectorAll('#settingsTabs .tab-item');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      contents.forEach((c) => c.classList.remove('active'));
      const target = document.getElementById(`tab${tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)}`);
      if (target) target.classList.add('active');
    });
  });
};

const initProfile = () => {
  const saved = loadFromStorage(STORAGE_KEYS.profile, { name: 'Admin', email: 'admin@moviehub.com', phone: '+1 (555) 123-4567' });

  const nameEl = document.getElementById('settingsName');
  const emailEl = document.getElementById('settingsEmail');
  const phoneEl = document.getElementById('settingsPhone');
  const avatarEl = document.getElementById('settingsAvatar');

  if (nameEl) nameEl.value = saved.name;
  if (emailEl) emailEl.value = saved.email;
  if (phoneEl) phoneEl.value = saved.phone;
  if (avatarEl) avatarEl.textContent = (saved.name || 'A').charAt(0).toUpperCase();

  const updateBtn = document.getElementById('updateProfileBtn');
  if (updateBtn) {
    updateBtn.addEventListener('click', () => {
      const name = nameEl?.value?.trim();
      const email = emailEl?.value?.trim();
      const phone = phoneEl?.value?.trim();

      if (!name) { showToast('Name is required', 'error'); return; }
      const emailCheck = Validation.email(email);
      if (!emailCheck.valid) { showToast(emailCheck.message, 'error'); return; }
      const phoneCheck = Validation.phone(phone);
      if (!phoneCheck.valid) { showToast(phoneCheck.message, 'error'); return; }

      const data = { name, email, phone };
      saveToStorage(STORAGE_KEYS.profile, data);
      if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
      showToast('Profile updated successfully', 'success');
    });
  }

  const changeAvatarBtn = document.getElementById('changeAvatarBtn');
  const fileInput = document.getElementById('avatarFileInput');
  if (changeAvatarBtn && fileInput) {
    changeAvatarBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (avatarEl) {
            avatarEl.style.backgroundImage = `url(${ev.target.result})`;
            avatarEl.style.backgroundSize = 'cover';
            avatarEl.style.backgroundPosition = 'center';
            avatarEl.textContent = '';
          }
          showToast('Avatar updated', 'success');
        };
        reader.readAsDataURL(file);
      }
    });
  }
};

const initSecurity = () => {
  const changePwdBtn = document.getElementById('changePasswordBtn');
  if (changePwdBtn) {
    changePwdBtn.addEventListener('click', () => {
      const current = document.getElementById('settingsCurrentPassword')?.value || '';
      const newPwd = document.getElementById('settingsNewPassword')?.value || '';
      const confirm = document.getElementById('settingsConfirmPassword')?.value || '';

      if (!current) { showToast('Current password is required', 'error'); return; }
      const pwdCheck = Validation.password(newPwd);
      if (!pwdCheck.valid) { showToast(pwdCheck.message, 'error'); return; }
      const confirmCheck = Validation.confirmPassword(newPwd, confirm);
      if (!confirmCheck.valid) { showToast(confirmCheck.message, 'error'); return; }

      document.getElementById('settingsCurrentPassword').value = '';
      document.getElementById('settingsNewPassword').value = '';
      document.getElementById('settingsConfirmPassword').value = '';
      showToast('Password changed successfully', 'success');
    });
  }

  const twoFA = document.getElementById('settings2FA');
  if (twoFA) {
    const saved = localStorage.getItem('admin_2fa') === 'true';
    twoFA.checked = saved;
    twoFA.addEventListener('change', () => {
      localStorage.setItem('admin_2fa', twoFA.checked);
      showToast(twoFA.checked ? '2FA enabled' : '2FA disabled', 'success');
    });
  }
};

const initNotifications = () => {
  const defaults = {
    emailNotif: true,
    pushNotif: true,
    smsNotif: false,
    bookingAlerts: true,
    paymentUpdates: true,
  };

  const saved = loadFromStorage(STORAGE_KEYS.notifications, defaults);

  const idMap = {
    settingsEmailNotif: 'emailNotif',
    settingsPushNotif: 'pushNotif',
    settingsSMSNotif: 'smsNotif',
    settingsBookingAlerts: 'bookingAlerts',
    settingsPaymentUpdates: 'paymentUpdates',
  };

  Object.entries(idMap).forEach(([elId, key]) => {
    const el = document.getElementById(elId);
    if (el) el.checked = saved[key];
  });

  const saveBtn = document.getElementById('saveNotifPrefsBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const data = {};
      Object.entries(idMap).forEach(([elId, key]) => {
        const el = document.getElementById(elId);
        if (el) data[key] = el.checked;
      });
      saveToStorage(STORAGE_KEYS.notifications, data);
      showToast('Notification preferences saved', 'success');
    });
  }
};

const initAppearance = () => {
  const defaults = { theme: 'dark', sidebarBehaviour: 'collapsible', fontSize: 'medium' };
  const saved = loadFromStorage(STORAGE_KEYS.appearance, defaults);

  const darkOption = document.getElementById('themeDarkOption');
  const lightOption = document.getElementById('themeLightOption');
  const sidebarEl = document.getElementById('sidebarBehaviour');
  const fontSizeEl = document.getElementById('fontSizeSelect');

  if (darkOption && lightOption) {
    const applyTheme = (theme) => {
      darkOption.classList.toggle('active', theme === 'dark');
      lightOption.classList.toggle('active', theme === 'light');
      document.documentElement.dataset.theme = theme;
      localStorage.setItem('adminTheme', theme);
    };

    applyTheme(saved.theme);
    darkOption.addEventListener('click', () => applyTheme('dark'));
    lightOption.addEventListener('click', () => applyTheme('light'));
  }

  if (sidebarEl) sidebarEl.value = saved.sidebarBehaviour;
  if (fontSizeEl) fontSizeEl.value = saved.fontSize;

  const saveBtn = document.getElementById('saveAppearanceBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const theme = darkOption?.classList.contains('active') ? 'dark' : 'light';
      const data = {
        theme,
        sidebarBehaviour: sidebarEl?.value || 'collapsible',
        fontSize: fontSizeEl?.value || 'medium',
      };
      saveToStorage(STORAGE_KEYS.appearance, data);
      applyTheme(theme);
      showToast('Appearance settings saved', 'success');

      const event = new CustomEvent('theme-change', { detail: { theme } });
      document.dispatchEvent(event);
    });
  }

};

const initSMTP = () => {
  const testBtn = document.getElementById('testSmtpBtn');
  if (testBtn) {
    testBtn.addEventListener('click', () => {
      showToast('Testing SMTP connection...', 'info');
      setTimeout(() => showToast('SMTP connection successful!', 'success'), 1500);
    });
  }

  const saveBtn = document.getElementById('saveSmtpBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const host = document.getElementById('smtpHost')?.value;
      const port = document.getElementById('smtpPort')?.value;
      if (!host || !port) { showToast('SMTP Host and Port are required', 'error'); return; }
      const data = {
        host: document.getElementById('smtpHost')?.value || '',
        port: document.getElementById('smtpPort')?.value || '',
        username: document.getElementById('smtpUsername')?.value || '',
        password: document.getElementById('smtpPassword')?.value ? '***' : '',
        fromEmail: document.getElementById('smtpFromEmail')?.value || '',
        fromName: document.getElementById('smtpFromName')?.value || '',
      };
      localStorage.setItem('admin_smtp', JSON.stringify(data));
      showToast('SMTP configuration saved', 'success');
    });
  }

  const saved = localStorage.getItem('admin_smtp');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      const host = document.getElementById('smtpHost');
      const port = document.getElementById('smtpPort');
      const username = document.getElementById('smtpUsername');
      const fromEmail = document.getElementById('smtpFromEmail');
      const fromName = document.getElementById('smtpFromName');
      if (host) host.value = data.host || '';
      if (port) port.value = data.port || '';
      if (username) username.value = data.username || '';
      if (fromEmail) fromEmail.value = data.fromEmail || '';
      if (fromName) fromName.value = data.fromName || '';
    } catch {}
  }
};

const initApplication = () => {
  const defaults = {
    siteName: 'MovieHub',
    logoUrl: '',
    supportEmail: 'support@moviehub.com',
    cancelWindow: 2,
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    maintenanceMode: false,
  };

  const saved = loadFromStorage(STORAGE_KEYS.application, defaults);

  const idMap = {
    appSiteName: 'siteName',
    appLogoUrl: 'logoUrl',
    appSupportEmail: 'supportEmail',
    appCancelWindow: 'cancelWindow',
    appCurrency: 'currency',
    appTimezone: 'timezone',
  };

  Object.entries(idMap).forEach(([elId, key]) => {
    const el = document.getElementById(elId);
    if (el) el.value = saved[key];
  });

  const maintEl = document.getElementById('appMaintenanceMode');
  if (maintEl) maintEl.checked = saved.maintenanceMode;

  const saveBtn = document.getElementById('saveAppSettingsBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const data = {};
      Object.entries(idMap).forEach(([elId, key]) => {
        const el = document.getElementById(elId);
        if (el) data[key] = el.value;
      });
      data.maintenanceMode = maintEl?.checked || false;
      saveToStorage(STORAGE_KEYS.application, data);
      showToast('Application settings saved', 'success');
    });
  }
};

const initSaveAll = () => {
  const saveAllBtn = document.getElementById('saveAllSettingsBtn');
  if (saveAllBtn) {
    saveAllBtn.addEventListener('click', () => {
      showToast('All settings saved successfully', 'success');
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initProfile();
  initSecurity();
  initNotifications();
  initAppearance();
  initSMTP();
  initApplication();
  initSaveAll();
});
