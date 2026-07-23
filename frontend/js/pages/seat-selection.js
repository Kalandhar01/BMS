import { SeatService } from '../services/seat-service.js';
import { ShowService } from '../services/show-service.js';
import { Auth } from '../utils/auth.js';
import { Toast } from '../utils/toast.js';
import { formatTime, formatDate } from '../utils/date.js';
import { formatCurrency } from '../utils/currency.js';

document.addEventListener('DOMContentLoaded', async () => {
  const user = Auth.getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const showId = urlParams.get('showId');

  if (!showId) {
    document.getElementById('seatContainer').innerHTML = '<div class="error"><h2>No show selected</h2><a href="movies.html" class="btn">Browse Movies</a></div>';
    return;
  }

  const seatContainer = document.getElementById('seatContainer');
  const screenIndicator = document.getElementById('screenIndicator');
  const showInfoEl = document.getElementById('showInfo');
  const selectedSeatsInfo = document.getElementById('selectedSeatsInfo');
  const totalPriceEl = document.getElementById('totalPrice');
  const proceedBtn = document.getElementById('proceedToPayment');
  const loadingEl = document.getElementById('loading');
  const seatLegend = document.getElementById('seatLegend');

  const CATEGORY_ORDER = ['Silver', 'Gold', 'Premium', 'VIP'];
  const CATEGORY_COLORS = { Silver: '#95a5a6', Gold: '#f39c12', Premium: '#e74c3c', VIP: '#2ecc71' };
  const CATEGORY_PRICES = { Silver: 100, Gold: 180, Premium: 300, VIP: 500 };

  let allSeats = [];
  let selectedSeats = [];
  let showData = null;

  function showLoading() { loadingEl?.classList.remove('hidden'); seatContainer?.classList.add('hidden'); }
  function hideLoading() { loadingEl?.classList.add('hidden'); seatContainer?.classList.remove('hidden'); }

  async function init() {
    showLoading();
    try {
      showData = await ShowService.getById(showId);
      if (!showData) throw new Error('Show not found');
      renderShowInfo();
      await loadSeats();
    } catch (err) {
      seatContainer.innerHTML = `<div class="error"><h2>Failed to load show data</h2><p>${err.message}</p></div>`;
      Toast.error('Failed to load show data');
    } finally {
      hideLoading();
    }
  }

  function renderShowInfo() {
    if (!showData) return;
    if (showInfoEl) {
      showInfoEl.innerHTML = `
        <div class="show-info-item"><span class="label">Date:</span> ${formatDate(showData.showDate || showData.date)}</div>
        <div class="show-info-item"><span class="label">Time:</span> ${formatTime(showData.showTime || showData.time)}</div>
        <div class="show-info-item"><span class="label">Screen:</span> ${showData.screenName || `Screen ${showData.screenId || ''}`}</div>
      `;
    }
  }

  async function loadSeats() {
    try {
      allSeats = await SeatService.getByShow(showId);
      if (!Array.isArray(allSeats)) allSeats = [];
      renderSeats();
      renderLegend();
    } catch {
      Toast.error('Failed to load seats');
      allSeats = [];
    }
  }

  function getCategory(seat) {
    return seat.category || seat.seatCategory || 'Silver';
  }

  function getPrice(category) {
    if (showData?.prices) {
      const p = showData.prices[category];
      if (p) return p;
    }
    return CATEGORY_PRICES[category] || 100;
  }

  function renderLegend() {
    if (!seatLegend) return;
    const categories = [...new Set(allSeats.map(getCategory))].sort(
      (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
    );
    seatLegend.innerHTML = categories.map(cat => `
      <div class="legend-item">
        <span class="legend-color" style="background:${CATEGORY_COLORS[cat] || '#95a5a6'}"></span>
        <span class="legend-label">${cat} - ${formatCurrency(getPrice(cat))}</span>
      </div>
    `).join('') + `
      <div class="legend-item"><span class="legend-color" style="background:#2ecc71"></span><span>Available</span></div>
      <div class="legend-item"><span class="legend-color" style="background:#e74c3c"></span><span>Booked</span></div>
      <div class="legend-item"><span class="legend-color selected-sample"></span><span>Selected</span></div>
    `;
  }

  function renderSeats() {
    if (!seatContainer) return;
    if (screenIndicator) screenIndicator.style.display = 'block';
    const categorized = {};
    allSeats.forEach(seat => {
      const cat = getCategory(seat);
      if (!categorized[cat]) categorized[cat] = [];
      categorized[cat].push(seat);
    });

    const sortedCategories = Object.keys(categorized).sort(
      (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
    );

    seatContainer.innerHTML = sortedCategories.map(cat => `
      <div class="seat-section">
        <div class="section-header">
          <h3>${cat}</h3>
          <span class="section-price">${formatCurrency(getPrice(cat))}</span>
        </div>
        <div class="seat-grid" data-category="${cat}">
          ${categorized[cat].map(seat => {
            const status = seat.status || 'AVAILABLE';
            const isBooked = status === 'BOOKED' || status === 'RESERVED';
            const isSelected = selectedSeats.some(s => s.id === seat.id);
            return `<div class="seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}" 
                       data-seat-id="${seat.id}" 
                       data-seat-number="${seat.seatNumber || `Seat ${seat.id}`}"
                       data-category="${cat}"
                       title="${cat} - ${formatCurrency(getPrice(cat))}">
              <span>${seat.seatNumber || seat.row || ''}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    `).join('');

    seatContainer.querySelectorAll('.seat:not(.booked)').forEach(el => {
      el.addEventListener('click', () => toggleSeat(el));
    });
  }

  function toggleSeat(el) {
    const seatId = parseInt(el.dataset.seatId, 10);
    const seatData = allSeats.find(s => s.id === seatId);
    if (!seatData) return;
    const status = seatData.status || 'AVAILABLE';
    if (status === 'BOOKED' || status === 'RESERVED') return;

    const idx = selectedSeats.findIndex(s => s.id === seatId);
    if (idx >= 0) {
      selectedSeats.splice(idx, 1);
      el.classList.remove('selected');
    } else {
      selectedSeats.push(seatData);
      el.classList.add('selected');
    }
    updateSummary();
  }

  function updateSummary() {
    if (selectedSeatsInfo) {
      if (selectedSeats.length === 0) {
        selectedSeatsInfo.textContent = 'No seats selected';
      } else {
        selectedSeatsInfo.textContent = selectedSeats
          .map(s => s.seatNumber || `Seat ${s.id}`)
          .join(', ');
      }
    }
    const total = selectedSeats.reduce((sum, s) => sum + getPrice(getCategory(s)), 0);
    if (totalPriceEl) totalPriceEl.textContent = formatCurrency(total);
    if (proceedBtn) {
      proceedBtn.disabled = selectedSeats.length === 0;
      proceedBtn.style.opacity = selectedSeats.length === 0 ? '0.5' : '1';
    }
  }

  proceedBtn?.addEventListener('click', () => {
    if (selectedSeats.length === 0) {
      Toast.error('Please select at least one seat');
      return;
    }
    const seatIds = selectedSeats.map(s => s.id).join(',');
    const seatNumbers = selectedSeats.map(s => s.seatNumber || `Seat ${s.id}`).join(',');
    const total = selectedSeats.reduce((sum, s) => sum + getPrice(getCategory(s)), 0);
    window.location.href = `payment.html?showId=${showId}&seatIds=${seatIds}&seatNumbers=${encodeURIComponent(seatNumbers)}&total=${total}`;
  });

  await init();
});
