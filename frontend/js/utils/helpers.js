/**
 * General utility/helper functions.
 */

/**
 * Format duration minutes to "Xh Ym" string.
 * @param {number} minutes
 * @returns {string}
 */
export function formatDuration(minutes) {
  if (typeof minutes === 'string' && minutes.includes('h')) return minutes;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

/**
 * Format a date to a readable string.
 * @param {string|Date} date
 * @param {Object} [options]
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
}

/**
 * Format time to "HH:MM AM/PM".
 * @param {string} time - "14:30" or "2024-01-15T14:30:00"
 * @returns {string}
 */
export function formatTime(time) {
  try {
    const d = new Date(`1970-01-01T${time}`);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return time;
  }
}

/**
 * Format currency to INR.
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate star rating HTML.
 * @param {number} rating - 0-10 scale
 * @param {number} [maxStars=5]
 * @returns {string}
 */
export function renderStars(rating, maxStars = 5) {
  const normalized = (rating / 10) * maxStars;
  const full  = Math.floor(normalized);
  const half  = (normalized - full) >= 0.5 ? 1 : 0;
  const empty = maxStars - full - half;

  const star = '★';
  return (
    `<span class="rating-stars" aria-label="Rating: ${rating} out of 10">` +
    star.repeat(full).split('').map(() => `<span class="star-icon">★</span>`).join('') +
    (half ? `<span class="star-icon half">★</span>` : '') +
    star.repeat(empty).split('').map(() => `<span class="star-icon empty">★</span>`).join('') +
    `</span>`
  );
}

/**
 * Debounce a function call.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function calls.
 * @param {Function} fn
 * @param {number} limit
 * @returns {Function}
 */
export function throttle(fn, limit = 200) {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

/**
 * Get URL query parameters as an object.
 * @returns {Object}
 */
export function getQueryParams() {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

/**
 * Set URL query parameter without page reload.
 * @param {string} key
 * @param {string} value
 */
export function setQueryParam(key, value) {
  const url = new URL(window.location);
  if (value === null || value === undefined || value === '') {
    url.searchParams.delete(key);
  } else {
    url.searchParams.set(key, value);
  }
  window.history.replaceState({}, '', url);
}

/**
 * Lazy load images using IntersectionObserver.
 * @param {string} [selector='[data-src]']
 */
export function initLazyLoad(selector = '[data-src]') {
  if (!('IntersectionObserver' in window)) {
    // Fallback: load all images immediately
    document.querySelectorAll(selector).forEach(el => {
      if (el.dataset.src) { el.src = el.dataset.src; el.removeAttribute('data-src'); }
    });
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.dataset.src) {
          el.src = el.dataset.src;
          el.removeAttribute('data-src');
          el.classList.add('loaded');
        }
        obs.unobserve(el);
      }
    });
  }, { rootMargin: '200px 0px' });

  document.querySelectorAll(selector).forEach(el => observer.observe(el));
}

/**
 * Animate elements as they enter the viewport.
 * @param {string} [selector='.animate-on-scroll']
 */
export function initScrollAnimations(selector = '.animate-on-scroll') {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll(selector).forEach(el => observer.observe(el));
}

/**
 * Generate a random booking ID.
 * @returns {string}
 */
export function generateBookingId() {
  return 'MH' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
}

/**
 * Copy text to clipboard.
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
}

/**
 * Pluralize a word.
 * @param {number} count
 * @param {string} singular
 * @param {string} [plural]
 * @returns {string}
 */
export function pluralize(count, singular, plural = singular + 's') {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
}

/**
 * Truncate text at a word boundary.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

/**
 * Smooth scroll to element.
 * @param {string|Element} target
 * @param {number} [offset]
 */
export function scrollTo(target, offset = 80) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}
