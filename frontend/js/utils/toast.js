/**
 * Toast Notification Utility
 * Creates beautiful animated toast messages.
 */

const ICONS = {
  success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
  error:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
};

const CLOSE_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

const LABELS = {
  success: 'Success',
  error:   'Error',
  warning: 'Warning',
  info:    'Info',
};

/**
 * Show a toast notification.
 * @param {string} message - The message text
 * @param {('success'|'error'|'warning'|'info')} type - Toast type
 * @param {Object} options
 * @param {string}  [options.title]    - Custom title (default is type name)
 * @param {number}  [options.duration] - Duration in ms (default 4000)
 */
export function showToast(message, type = 'info', options = {}) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const {
    title    = LABELS[type] || 'Notification',
    duration = type === 'error' ? 6000 : 4000,
  } = options;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.style.setProperty('--duration', `${duration}ms`);

  toast.innerHTML = `
    <div class="toast__icon">${ICONS[type] || ICONS.info}</div>
    <div class="toast__body">
      <div class="toast__title">${title}</div>
      <div class="toast__message">${message}</div>
    </div>
    <button class="toast__close" aria-label="Dismiss notification">${CLOSE_ICON}</button>
  `;

  // Set progress bar animation duration
  toast.style.setProperty('--toast-duration', `${duration}ms`);
  const progressStyle = document.createElement('style');
  const id = `toast-${Date.now()}`;
  toast.id = id;

  // Close button
  const closeBtn = toast.querySelector('.toast__close');
  closeBtn.addEventListener('click', () => removeToast(toast));

  // Auto remove
  const timer = setTimeout(() => removeToast(toast), duration);

  // Pause on hover
  toast.addEventListener('mouseenter', () => clearTimeout(timer));
  toast.addEventListener('mouseleave', () => {
    setTimeout(() => removeToast(toast), 1500);
  });

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
}

function removeToast(toast) {
  if (!toast.parentNode) return;
  toast.classList.add('removing');
  toast.addEventListener('animationend', () => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  });
}

// Convenience wrappers
export const toast = {
  success: (msg, opts) => showToast(msg, 'success', opts),
  error:   (msg, opts) => showToast(msg, 'error', opts),
  warning: (msg, opts) => showToast(msg, 'warning', opts),
  info:    (msg, opts) => showToast(msg, 'info', opts),
};

export default toast;
