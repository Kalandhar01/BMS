const TOAST_CONTAINER_ID = 'toastContainer';

const ICONS = {
  success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
};

const ensureContainer = () => {
  let container = document.getElementById(TOAST_CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = TOAST_CONTAINER_ID;
    Object.assign(container.style, {
      position: 'fixed', top: '20px', right: '20px', zIndex: '10000',
      display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'none',
    });
    document.body.appendChild(container);
  }
  return container;
};

const createToast = (message, type, duration) => {
  const container = ensureContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  Object.assign(toast.style, {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '14px 16px', borderRadius: '12px',
    background: 'rgba(30, 30, 45, 0.95)', backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', color: '#fff',
    fontSize: '14px', fontFamily: "'Inter', -apple-system, sans-serif",
    minWidth: '320px', maxWidth: '420px', pointerEvents: 'auto',
    transform: 'translateX(120%)', opacity: '0',
    transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease',
    position: 'relative', overflow: 'hidden',
  });

  const accentMap = { success: '#22C55E', error: '#EF4444', warning: '#F59E0B', info: '#3B82F6' };
  const accentBar = document.createElement('div');
  Object.assign(accentBar.style, {
    position: 'absolute', left: '0', top: '0', bottom: '0', width: '4px',
    borderRadius: '12px 0 0 12px', background: accentMap[type] || '#3B82F6',
  });
  toast.appendChild(accentBar);

  const iconWrapper = document.createElement('span');
  iconWrapper.style.cssText = 'flex-shrink:0;display:flex;align-items:center;';
  iconWrapper.innerHTML = ICONS[type] || ICONS.info;
  const svg = iconWrapper.querySelector('svg');
  if (svg) svg.style.color = accentMap[type];
  toast.appendChild(iconWrapper);

  const messageSpan = document.createElement('span');
  messageSpan.style.cssText = 'flex:1;line-height:1.4;';
  messageSpan.textContent = message;
  toast.appendChild(messageSpan);

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  Object.assign(closeBtn.style, {
    flexShrink: '0', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex',
    alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s, background 0.2s',
  });
  closeBtn.addEventListener('mouseenter', () => { closeBtn.style.color = '#fff'; closeBtn.style.background = 'rgba(255,255,255,0.1)'; });
  closeBtn.addEventListener('mouseleave', () => { closeBtn.style.color = 'rgba(255,255,255,0.5)'; closeBtn.style.background = 'none'; });
  closeBtn.addEventListener('click', () => dismiss(toast));
  toast.appendChild(closeBtn);

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  });

  let dismissTimer = setTimeout(() => dismiss(toast), duration);

  const dismiss = (el) => {
    clearTimeout(dismissTimer);
    el.style.transform = 'translateX(120%)';
    el.style.opacity = '0';
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
      if (container.children.length === 0 && container.parentNode) {
        document.body.removeChild(container);
      }
    }, 350);
  };

  toast._dismiss = dismiss;
  return toast;
};

export const Toast = {
  success: (message, duration = 3000) => createToast(message, 'success', duration),
  error: (message, duration = 4000) => createToast(message, 'error', duration),
  warning: (message, duration = 3000) => createToast(message, 'warning', duration),
  info: (message, duration = 3000) => createToast(message, 'info', duration),
};

export default Toast;
