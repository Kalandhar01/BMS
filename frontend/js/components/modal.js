export class Modal {
  constructor(options = {}) {
    this.options = {
      closeOnOverlay: true,
      closeOnEscape: true,
      animation: true,
      ...options,
    };
    this.modal = null;
    this.overlay = null;
    this._onClose = null;
  }

  create({ id = 'dynamic-modal', title = '', content = '', width = '600px', footer = '' } = {}) {
    this.destroy();
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.id = id + '-overlay';

    this.modal = document.createElement('div');
    this.modal.className = `modal-container ${this.options.animation ? 'modal-animate' : ''}`;
    this.modal.id = id;
    this.modal.style.maxWidth = width;

    this.modal.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">${title}</h2>
        <button class="modal-close-btn" id="${id}-close">&times;</button>
      </div>
      <div class="modal-body" id="${id}-body">${content}</div>
      ${footer ? `<div class="modal-footer" id="${id}-footer">${footer}</div>` : ''}
    `;

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.modal);

    document.getElementById(`${id}-close`).addEventListener('click', () => this.close());
    if (this.options.closeOnOverlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.close();
      });
    }
    if (this.options.closeOnEscape) {
      this._keyHandler = (e) => { if (e.key === 'Escape') this.close(); };
      document.addEventListener('keydown', this._keyHandler);
    }

    requestAnimationFrame(() => {
      this.overlay.classList.add('active');
      this.modal.classList.add('active');
    });
  }

  setContent(html) {
    const body = this.modal?.querySelector('.modal-body');
    if (body) body.innerHTML = html;
  }

  setFooter(html) {
    const footer = this.modal?.querySelector('.modal-footer');
    if (footer) footer.innerHTML = html;
  }

  getBody() {
    return this.modal?.querySelector('.modal-body');
  }

  onClose(callback) {
    this._onClose = callback;
  }

  close() {
    if (this.overlay) {
      this.overlay.classList.remove('active');
      this.overlay.remove();
    }
    if (this.modal) {
      this.modal.classList.remove('active');
      this.modal.remove();
    }
    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler);
    }
    if (this._onClose) this._onClose();
    this.modal = null;
    this.overlay = null;
  }

  destroy() {
    this.close();
  }
}
