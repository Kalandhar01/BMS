const MODAL_OVERLAY_ID = 'modalOverlay';
const MODAL_WRAPPER_ID = 'modalWrapper';

const SIZE_MAP = { sm: '400px', md: '600px', lg: '800px', xl: '1000px' };

const TYPE_STYLES = {
  danger: { icon: 'error', accent: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  warning: { icon: 'warning', accent: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  info: { icon: 'info', accent: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  success: { icon: 'success', accent: '#22C55E', bg: 'rgba(16,185,129,0.1)' },
};

const CONFIRM_ICONS = {
  danger: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  warning: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  success: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
};

const createOverlay = () => {
  let overlay = document.getElementById(MODAL_OVERLAY_ID);
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = MODAL_OVERLAY_ID;
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
    zIndex: '9999', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px', opacity: '0', transition: 'opacity 0.25s ease',
  });

  const wrapper = document.createElement('div');
  wrapper.id = MODAL_WRAPPER_ID;
  Object.assign(wrapper.style, {
    width: '100%', maxWidth: '600px', maxHeight: '90vh',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
  });
  overlay.appendChild(wrapper);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => { overlay.style.opacity = '1'; });
  return overlay;
};

const createModalContent = ({ title, content, size = 'md', footer, onClose }) => {
  const overlay = createOverlay();
  const wrapper = document.getElementById(MODAL_WRAPPER_ID);
  wrapper.style.maxWidth = SIZE_MAP[size] || SIZE_MAP.md;

  const modal = document.createElement('div');
  Object.assign(modal.style, {
    background: 'rgba(25, 25, 40, 0.97)', backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px', boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '100%',
    transform: 'translateY(20px) scale(0.97)', opacity: '0',
    transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease',
  });

  requestAnimationFrame(() => {
    modal.style.transform = 'translateY(0) scale(1)';
    modal.style.opacity = '1';
  });

  const header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  });

  const titleEl = document.createElement('h2');
  titleEl.textContent = title;
  Object.assign(titleEl.style, {
    margin: '0', fontSize: '18px', fontWeight: '600', color: '#fff',
    fontFamily: "'Inter', -apple-system, sans-serif",
  });
  header.appendChild(titleEl);

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  Object.assign(closeBtn.style, {
    background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer', width: '36px', height: '36px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
  });
  closeBtn.addEventListener('mouseenter', () => { closeBtn.style.background = 'rgba(255,255,255,0.12)'; closeBtn.style.color = '#fff'; });
  closeBtn.addEventListener('mouseleave', () => { closeBtn.style.background = 'rgba(255,255,255,0.05)'; closeBtn.style.color = 'rgba(255,255,255,0.6)'; });
  closeBtn.addEventListener('click', () => closeModal(onClose));
  header.appendChild(closeBtn);
  modal.appendChild(header);

  const body = document.createElement('div');
  Object.assign(body.style, {
    padding: '24px', overflowY: 'auto', flex: '1', color: 'rgba(255,255,255,0.85)',
    fontSize: '14px', fontFamily: "'Inter', -apple-system, sans-serif", lineHeight: '1.6',
  });

  if (typeof content === 'string') body.innerHTML = content;
  else if (content instanceof HTMLElement) body.appendChild(content);
  modal.appendChild(body);

  if (footer) {
    let footerEl;
    if (typeof footer === 'string') {
      footerEl = document.createElement('div');
      footerEl.innerHTML = footer;
    } else if (footer instanceof HTMLElement) {
      footerEl = footer;
    }
    if (footerEl) {
      Object.assign(footerEl.style, {
        padding: '16px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex', justifyContent: 'flex-end', gap: '12px',
      });
      modal.appendChild(footerEl);
    }
  }

  wrapper.innerHTML = '';
  wrapper.appendChild(modal);
};

const closeModal = (onClose) => {
  const overlay = document.getElementById(MODAL_OVERLAY_ID);
  if (!overlay) return;

  const wrapper = document.getElementById(MODAL_WRAPPER_ID);
  const modal = wrapper?.firstChild;
  if (modal) {
    modal.style.transform = 'translateY(20px) scale(0.97)';
    modal.style.opacity = '0';
  }
  overlay.style.opacity = '0';

  setTimeout(() => {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (typeof onClose === 'function') onClose();
  }, 300);
};

export const Modal = {
  show: ({ title, content, size = 'md', footer, onClose }) => {
    closeModal();
    createModalContent({ title, content, size, footer, onClose });
    return { close: () => closeModal(onClose) };
  },
  close: () => closeModal(),
  confirm: ({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, type = 'danger' }) => {
    return new Promise((resolve) => {
      const style = TYPE_STYLES[type] || TYPE_STYLES.danger;
      const footerEl = document.createElement('div');

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = cancelText;
      Object.assign(cancelBtn.style, {
        padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
        background: 'transparent', color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
        fontSize: '14px', fontWeight: '500', fontFamily: "'Inter', -apple-system, sans-serif",
        transition: 'all 0.2s',
      });
      cancelBtn.addEventListener('mouseenter', () => { cancelBtn.style.background = 'rgba(255,255,255,0.05)'; cancelBtn.style.color = '#fff'; });
      cancelBtn.addEventListener('mouseleave', () => { cancelBtn.style.background = 'transparent'; cancelBtn.style.color = 'rgba(255,255,255,0.7)'; });

      const confirmBtn = document.createElement('button');
      confirmBtn.textContent = confirmText;
      Object.assign(confirmBtn.style, {
        padding: '10px 24px', borderRadius: '10px', border: 'none',
        background: style.accent, color: '#fff', cursor: 'pointer',
        fontSize: '14px', fontWeight: '600', fontFamily: "'Inter', -apple-system, sans-serif",
        transition: 'all 0.2s',
      });
      confirmBtn.addEventListener('mouseenter', () => { confirmBtn.style.filter = 'brightness(1.15)'; });
      confirmBtn.addEventListener('mouseleave', () => { confirmBtn.style.filter = 'none'; });

      cancelBtn.addEventListener('click', () => { closeModal(); resolve(false); });
      confirmBtn.addEventListener('click', () => { closeModal(); if (typeof onConfirm === 'function') onConfirm(); resolve(true); });

      footerEl.appendChild(cancelBtn);
      footerEl.appendChild(confirmBtn);

      const iconHtml = CONFIRM_ICONS[type] || CONFIRM_ICONS.info;
      const contentHtml = `
        <div style="display:flex;align-items:flex-start;gap:16px;">
          <div style="flex-shrink:0;display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:14px;background:${style.bg};">
            ${iconHtml}
          </div>
          <div style="flex:1;">
            <p style="margin:0 0 4px;font-weight:600;color:#fff;font-size:15px;">${title}</p>
            <p style="margin:0;color:rgba(255,255,255,0.65);font-size:14px;line-height:1.5;">${message}</p>
          </div>
        </div>`;

      createModalContent({ title: '', content: contentHtml, size: 'sm', footer: footerEl, onClose: () => resolve(false) });
    });
  },
  alert: ({ title, message, type = 'info' }) => {
    return new Promise((resolve) => {
      const style = TYPE_STYLES[type] || TYPE_STYLES.info;
      const footerEl = document.createElement('div');
      const okBtn = document.createElement('button');
      okBtn.textContent = 'OK';
      Object.assign(okBtn.style, {
        padding: '10px 28px', borderRadius: '10px', border: 'none',
        background: style.accent, color: '#fff', cursor: 'pointer',
        fontSize: '14px', fontWeight: '600', fontFamily: "'Inter', -apple-system, sans-serif",
        transition: 'all 0.2s',
      });
      okBtn.addEventListener('mouseenter', () => { okBtn.style.filter = 'brightness(1.15)'; });
      okBtn.addEventListener('mouseleave', () => { okBtn.style.filter = 'none'; });
      okBtn.addEventListener('click', () => { closeModal(); resolve(); });
      footerEl.appendChild(okBtn);

      const iconHtml = CONFIRM_ICONS[type] || CONFIRM_ICONS.info;
      const contentHtml = `
        <div style="display:flex;align-items:flex-start;gap:16px;">
          <div style="flex-shrink:0;display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:14px;background:${style.bg};">
            ${iconHtml}
          </div>
          <div style="flex:1;">
            <p style="margin:0 0 4px;font-weight:600;color:#fff;font-size:15px;">${title}</p>
            <p style="margin:0;color:rgba(255,255,255,0.65);font-size:14px;line-height:1.5;">${message}</p>
          </div>
        </div>`;

      createModalContent({ title: '', content: contentHtml, size: 'sm', footer: footerEl, onClose: () => resolve() });
    });
  },
  prompt: ({ title, message, defaultValue = '', onConfirm }) => {
    return new Promise((resolve) => {
      const footerEl = document.createElement('div');
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      Object.assign(cancelBtn.style, {
        padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
        background: 'transparent', color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
        fontSize: '14px', fontWeight: '500', fontFamily: "'Inter', -apple-system, sans-serif",
        transition: 'all 0.2s',
      });
      cancelBtn.addEventListener('mouseenter', () => { cancelBtn.style.background = 'rgba(255,255,255,0.05)'; cancelBtn.style.color = '#fff'; });
      cancelBtn.addEventListener('mouseleave', () => { cancelBtn.style.background = 'transparent'; cancelBtn.style.color = 'rgba(255,255,255,0.7)'; });

      const okBtn = document.createElement('button');
      okBtn.textContent = 'Submit';
      Object.assign(okBtn.style, {
        padding: '10px 24px', borderRadius: '10px', border: 'none',
        background: '#FF3D5A', color: '#fff', cursor: 'pointer',
        fontSize: '14px', fontWeight: '600', fontFamily: "'Inter', -apple-system, sans-serif",
        transition: 'all 0.2s',
      });
      okBtn.addEventListener('mouseenter', () => { okBtn.style.filter = 'brightness(1.15)'; });
      okBtn.addEventListener('mouseleave', () => { okBtn.style.filter = 'none'; });

      cancelBtn.addEventListener('click', () => { closeModal(); resolve(null); });

      const inputId = 'modal-prompt-input';
      const contentHtml = `
        <div>
          <p style="margin:0 0 16px;color:rgba(255,255,255,0.65);font-size:14px;line-height:1.5;">${message}</p>
          <input id="${inputId}" type="text" value="${defaultValue.replace(/"/g, '&quot;')}" 
            style="width:100%;padding:12px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);
            background:rgba(255,255,255,0.05);color:#fff;font-size:14px;font-family:'Inter',-apple-system,sans-serif;
            outline:none;box-sizing:border-box;transition:border-color 0.2s;" />
        </div>`;

      const doConfirm = () => {
        const input = document.getElementById(inputId);
        const value = input ? input.value : defaultValue;
        closeModal();
        if (typeof onConfirm === 'function') onConfirm(value);
        resolve(value);
      };

      okBtn.addEventListener('click', doConfirm);
      footerEl.appendChild(cancelBtn);
      footerEl.appendChild(okBtn);

      createModalContent({ title, content: contentHtml, size: 'sm', footer: footerEl, onClose: () => resolve(null) });

      setTimeout(() => {
        const input = document.getElementById(inputId);
        if (input) { input.focus(); input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doConfirm(); }); }
      }, 100);
    });
  },
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

document.addEventListener('click', (e) => {
  const overlay = document.getElementById(MODAL_OVERLAY_ID);
  if (overlay && e.target === overlay) closeModal();
});
