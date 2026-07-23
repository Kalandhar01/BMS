/**
 * Navbar Component
 * Handles sticky scroll, mobile menu, user dropdown, notifications.
 */
import Auth from '../utils/auth.js';
import toast from '../utils/toast.js';
import { API, ApiClient } from '../api/config.js';
import { debounce, formatDate } from '../utils/helpers.js';

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'success',
    icon: '🎟️',
    title: 'Booking Confirmed!',
    body: 'Interstellar Odyssey – 3 seats confirmed.',
    time: '2m ago',
    read: false,
  },
  {
    id: 2,
    type: 'info',
    icon: '🎬',
    title: 'New Movie Added',
    body: 'The Last Horizon is now available for booking.',
    time: '1h ago',
    read: false,
  },
  {
    id: 3,
    type: 'warning',
    icon: '⏰',
    title: 'Show in 2 Hours',
    body: 'Don\'t forget! Crimson Shadows starts at 7:00 PM.',
    time: '30m ago',
    read: true,
  },
];

class NavbarController {
  constructor() {
    this.navbar       = document.getElementById('navbar');
    this.hamburgerBtn = document.getElementById('hamburgerBtn');
    this.mobileOverlay= document.getElementById('mobileMenuOverlay');
    this.mobileClose  = document.getElementById('mobileCloseBtn');
    this.userAvatarBtn= document.getElementById('userAvatarBtn');
    this.userDropdown = document.getElementById('userDropdown');
    this.notifBtn     = document.getElementById('notifBtn');
    this.notifPanel   = document.getElementById('notifPanel');
    this.notifBadge   = document.getElementById('notifBadge');
    this.logoutBtn    = document.getElementById('logoutBtn');
    this.globalSearch = document.getElementById('globalSearch');
    this.searchDropdown = document.getElementById('searchDropdown');
    this.markAllRead  = document.getElementById('markAllRead');

    this.init();
  }

  init() {
    this.initScrollBehavior();
    this.initMobileMenu();
    this.initUserDropdown();
    this.initNotifications();
    this.initSearch();
    this.initAuthState();
    this.initNavHighlight();
    this.initCloseOnOutsideClick();
  }

  initScrollBehavior() {
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 50) {
        this.navbar.classList.add('scrolled');
      } else {
        this.navbar.classList.remove('scrolled');
      }
      lastY = y;
    }, { passive: true });
  }

  initMobileMenu() {
    this.hamburgerBtn?.addEventListener('click', () => {
      const isOpen = this.mobileOverlay.classList.toggle('open');
      this.hamburgerBtn.classList.toggle('open', isOpen);
      this.hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
      this.mobileOverlay.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    this.mobileClose?.addEventListener('click', () => this.closeMobileMenu());

    this.mobileOverlay?.addEventListener('click', (e) => {
      if (e.target === this.mobileOverlay) this.closeMobileMenu();
    });
  }

  closeMobileMenu() {
    this.mobileOverlay?.classList.remove('open');
    this.hamburgerBtn?.classList.remove('open');
    this.hamburgerBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  initUserDropdown() {
    this.userAvatarBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = this.userDropdown.classList.toggle('open');
      this.userAvatarBtn.setAttribute('aria-expanded', String(isOpen));
      this.userDropdown.setAttribute('aria-hidden', String(!isOpen));
      // Close notification panel
      this.notifPanel?.classList.remove('open');
    });

    this.logoutBtn?.addEventListener('click', () => {
      Auth.clearSession();
      this.updateAuthState(false, null);
      toast.success('You have been logged out.');
      setTimeout(() => window.location.href = '/index.html', 1000);
    });
  }

  initNotifications() {
    this.renderNotifications();

    this.notifBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = this.notifPanel.classList.toggle('open');
      this.notifPanel.setAttribute('aria-hidden', String(!isOpen));
      this.userDropdown?.classList.remove('open');
    });

    this.markAllRead?.addEventListener('click', () => {
      NOTIFICATIONS.forEach(n => n.read = true);
      this.renderNotifications();
      if (this.notifBadge) this.notifBadge.textContent = '';
    });
  }

  renderNotifications() {
    const list = document.getElementById('notifList');
    if (!list) return;

    const unread = NOTIFICATIONS.filter(n => !n.read).length;
    if (this.notifBadge) {
      this.notifBadge.textContent = unread > 0 ? String(unread) : '';
    }

    list.innerHTML = NOTIFICATIONS.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
        <div class="notif-icon notif-icon--${n.type}">${n.icon}</div>
        <div class="notif-text">
          <div class="notif-title">${n.title}</div>
          <div class="notif-body">${n.body}</div>
        </div>
        <span class="notif-time">${n.time}</span>
      </div>
    `).join('');

    list.querySelectorAll('.notif-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.dataset.id);
        const notif = NOTIFICATIONS.find(n => n.id === id);
        if (notif) { notif.read = true; this.renderNotifications(); }
      });
    });
  }

  initSearch() {
    if (!this.globalSearch) return;

    const debouncedSearch = debounce(async (query) => {
      if (query.length < 2) {
        this.searchDropdown.classList.remove('show');
        return;
      }
      await this.performSearch(query);
    }, 350);

    this.globalSearch.addEventListener('input', (e) => {
      debouncedSearch(e.target.value.trim());
    });

    this.globalSearch.addEventListener('focus', (e) => {
      if (e.target.value.trim().length >= 2) {
        this.searchDropdown.classList.add('show');
      }
    });
  }

  async performSearch(query) {
    try {
      // Try real API first
      let results;
      try {
        results = await ApiClient.get(
          `${API.MOVIES.SEARCH}?q=${encodeURIComponent(query)}&limit=6`,
          false
        );
      } catch {
        results = [];
      }

      this.renderSearchResults(results, query);
    } catch {
      this.searchDropdown.innerHTML = `<div class="search-no-results">Something went wrong. Try again.</div>`;
      this.searchDropdown.classList.add('show');
    }
  }

  renderSearchResults(movies, query) {
    if (!movies || movies.length === 0) {
      this.searchDropdown.innerHTML = `<div class="search-no-results">No movies found for "${query}"</div>`;
    } else {
      this.searchDropdown.innerHTML = movies.map(m => `
        <a class="search-dropdown-item" href="/pages/movie-details.html?id=${m.id}">
          <img data-src="${m.posterUrl}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="${m.title}" loading="lazy" />
          <div class="search-item-info">
            <div class="item-title">${m.title}</div>
            <div class="item-meta">${m.genre?.[0] || ''} • ${m.language} • ⭐ ${m.rating}</div>
          </div>
        </a>
      `).join('');
    }
    this.searchDropdown.classList.add('show');
  }

  initAuthState() {
    const user = Auth.getUser();
    const isAuth = Auth.isAuthenticated();
    this.updateAuthState(isAuth, user);

    window.addEventListener('auth:login',  (e) => this.updateAuthState(true, e.detail));
    window.addEventListener('auth:logout', ()  => this.updateAuthState(false, null));
  }

  updateAuthState(isAuth, user) {
    document.body.classList.toggle('is-authenticated', isAuth);

    const displayName = document.getElementById('userDisplayName');
    const dropdownName = document.getElementById('dropdownName');
    const dropdownEmail = document.getElementById('dropdownEmail');
    const mobileLogin = document.getElementById('mobileLoginLink');

    if (isAuth && user) {
      const name = user.firstName || user.name || user.username || 'User';
      if (displayName)  displayName.textContent = name;
      if (dropdownName)  dropdownName.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || name;
      if (dropdownEmail) dropdownEmail.textContent = user.email || '';
      if (mobileLogin) mobileLogin.style.display = 'none';

      // Set avatar initials if no picture
      if (user.profilePicture) {
        const avatarEl = document.getElementById('userAvatar');
        if (avatarEl) avatarEl.innerHTML = `<img src="${user.profilePicture}" alt="${name}" />`;
      }
    } else {
      if (displayName)   displayName.textContent = 'Sign In';
      if (dropdownName)  dropdownName.textContent = 'Guest User';
      if (dropdownEmail) dropdownEmail.textContent = 'Sign in to continue';
      if (mobileLogin)   mobileLogin.style.display = '';
    }
  }

  initNavHighlight() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && path.endsWith(href.replace(/^\//, '').split('?')[0])) {
        link.classList.add('active');
      }
    });

    // Home
    if (path === '/' || path.endsWith('index.html')) {
      document.getElementById('nav-home')?.classList.add('active');
    }
  }

  initCloseOnOutsideClick() {
    document.addEventListener('click', (e) => {
      if (this.userDropdown && !this.userAvatarBtn?.contains(e.target) && !this.userDropdown.contains(e.target)) {
        this.userDropdown.classList.remove('open');
      }
      if (this.notifPanel && !this.notifBtn?.contains(e.target) && !this.notifPanel.contains(e.target)) {
        this.notifPanel.classList.remove('open');
      }
      if (this.searchDropdown && !this.globalSearch?.contains(e.target) && !this.searchDropdown.contains(e.target)) {
        this.searchDropdown.classList.remove('show');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.userDropdown?.classList.remove('open');
        this.notifPanel?.classList.remove('open');
        this.searchDropdown?.classList.remove('show');
        this.closeMobileMenu();
      }
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new NavbarController();
  Auth.init();
});
