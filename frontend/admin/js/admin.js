import { Toast } from '../utils/toast.js';

const getDOMElements = () => ({
  sidebar: document.getElementById('sidebar'),
  sidebarToggle: document.getElementById('sidebarToggle'),
  sidebarOverlay: document.getElementById('sidebarOverlay'),
  searchInput: document.getElementById('globalSearch'),
  notifBtn: document.getElementById('notifBtn'),
  msgBtn: document.getElementById('msgBtn'),
  themeToggle: document.getElementById('themeToggle'),
  currentDate: document.getElementById('currentDate'),
  adminProfile: document.getElementById('adminProfile'),
  quickAddBtn: document.getElementById('quickAddBtn'),
});

const initSidebar = () => {
  const { sidebar, sidebarToggle, sidebarOverlay } = getDOMElements();
  if (!sidebar || !sidebarToggle) return;

  const savedState = localStorage.getItem('sidebarCollapsed');
  if (savedState === 'true') sidebar.classList.add('collapsed');

  sidebarToggle.addEventListener('click', () => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      sidebar.classList.toggle('mobile-open');
      if (sidebarOverlay) {
        sidebarOverlay.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('mobile-open') ? 'hidden' : '';
      }
    } else {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }
  });

  sidebarOverlay?.addEventListener('click', () => {
    sidebar?.classList.remove('mobile-open');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && sidebar) {
      sidebar.classList.remove('mobile-open');
      sidebarOverlay?.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
};

const initNavbar = () => {
  const { currentDate, searchInput } = getDOMElements();

  if (currentDate) {
    const updateDate = () => {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      currentDate.textContent = now.toLocaleDateString('en-US', options);
    };
    updateDate();
    setInterval(updateDate, 60000);
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const event = new CustomEvent('admin-search', { detail: { query: e.target.value } });
      document.dispatchEvent(event);
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchInput.blur();
      }
    });
  }
};

const initThemeToggle = () => {
  const { themeToggle } = getDOMElements();
  if (!themeToggle) return;

  const storedTheme = localStorage.getItem('adminTheme');
  if (storedTheme === 'light') {
    document.documentElement.dataset.theme = 'light';
    themeToggle.classList.add('light-mode');
  }

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme || 'dark';
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = newTheme;
    localStorage.setItem('adminTheme', newTheme);
    themeToggle.classList.toggle('light-mode');
    const event = new CustomEvent('theme-change', { detail: { theme: newTheme } });
    document.dispatchEvent(event);
  });
};

const initAdminProfile = () => {
  const { adminProfile } = getDOMElements();
  if (!adminProfile) return;

  const user = JSON.parse(localStorage.getItem('moviehub_user') || 'null');
  if (user) {
    const avatarEl = adminProfile.querySelector('.admin-avatar');
    const nameEl = adminProfile.querySelector('.admin-name');
    if (avatarEl) avatarEl.textContent = (user.name || 'A')[0].toUpperCase();
    if (nameEl) nameEl.textContent = user.name || 'Admin';
  }

  adminProfile.addEventListener('click', () => {
    window.location.href = '../admin/settings.html';
  });
};

const initQuickAdd = () => {
  const { quickAddBtn } = getDOMElements();
  if (!quickAddBtn) return;
  quickAddBtn.addEventListener('click', () => {
    window.location.href = '../admin/movies.html';
  });
};

let loadingOverlay = null;

export const showLoading = (container = document.body) => {
  if (loadingOverlay) return;
  loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'admin-loading-overlay';
  Object.assign(loadingOverlay.style, {
    position: 'fixed', inset: '0',
    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)', zIndex: '99999',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  });
  const spinner = document.createElement('div');
  spinner.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:12px;">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF3D5A" stroke-width="2">
      <circle cx="12" cy="12" r="10" stroke-dasharray="31.4 31.4" stroke-linecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
      </circle>
    </svg>
    <span style="color:#fff;font-size:14px;font-weight:500;">Loading...</span>
  </div>`;
  loadingOverlay.appendChild(spinner);
  container.appendChild(loadingOverlay);
};

export const hideLoading = (container = document.body) => {
  if (loadingOverlay) { loadingOverlay.remove(); loadingOverlay = null; }
};

export const showToast = (message, type = 'info') => {
  const types = ['success', 'error', 'warning', 'info'];
  if (!types.includes(type)) type = 'info';
  Toast[type](message);
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '-';
  return '₹' + Number(amount).toLocaleString('en-IN');
};

export const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatTime = (time) => {
  if (!time) return '-';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initNavbar();
  initThemeToggle();
  initAdminProfile();
  initQuickAdd();
});
