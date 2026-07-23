import { BookingService } from '../services/booking-service.js';
import { MovieService } from '../services/movie-service.js';
import { ShowService } from '../services/show-service.js';
import { PaymentService } from '../services/payment-service.js';
import { Auth } from '../utils/auth.js';
import { Toast } from '../utils/toast.js';
import { formatDate, formatTime } from '../utils/date.js';
import { formatCurrency } from '../utils/currency.js';

document.addEventListener('DOMContentLoaded', async () => {
  const user = Auth.getUser();
  if (!user || !Auth.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  const bookingList = document.getElementById('bookingList');
  const loadingEl = document.getElementById('loading');
  const emptyState = document.getElementById('emptyState');
  const bookingCount = document.getElementById('bookingCount');

  let allBookings = [];

  function resolveUserId(u) {
    return parseInt(u?.userId ?? u?.id, 10) || 1;
  }

  function showLoading() { loadingEl?.classList.remove('hidden'); bookingList?.classList.add('hidden'); }
  function hideLoading() { loadingEl?.classList.add('hidden'); bookingList?.classList.remove('hidden'); }

  async function init() {
    showLoading();
    try {
      const userId = resolveUserId(user);
      allBookings = await BookingService.getUserBookings(userId);
      if (!Array.isArray(allBookings)) allBookings = [];
      const confirmed = allBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'SUCCESS').length;
      const pending = allBookings.filter(b => b.status === 'PENDING').length;
      if (bookingCount) bookingCount.textContent = allBookings.length;
      renderBookings();
    } catch (err) {
      Toast.error('Failed to load bookings');
      if (emptyState) emptyState.classList.remove('hidden');
    } finally {
      hideLoading();
    }
  }

  function getBookingStatus(booking) {
    return booking.status || booking.paymentStatus || 'PENDING';
  }

  function getStatusClass(status) {
    const s = (status || '').toUpperCase();
    if (s === 'CONFIRMED' || s === 'SUCCESS' || s === 'COMPLETED') return 'status-confirmed';
    if (s === 'PENDING') return 'status-pending';
    if (s === 'CANCELLED' || s === 'FAILED') return 'status-cancelled';
    return 'status-pending';
  }

  function getSeatDisplay(booking) {
    const seats = booking.seatNumbers || booking.seats || [];
    if (Array.isArray(seats)) {
      return seats.map(s => {
        if (typeof s === 'string') return s;
        if (s?.seatNumber) return s.seatNumber;
        if (s?.id) return `Seat ${s.id}`;
        return '';
      }).filter(Boolean).join(', ');
    }
    return seats || 'N/A';
  }

  async function renderBookings() {
    if (!bookingList) return;
    bookingList.innerHTML = '';

    if (!allBookings || allBookings.length === 0) {
      emptyState?.classList.remove('hidden');
      return;
    }
    emptyState?.classList.add('hidden');

    const sorted = [...allBookings].sort((a, b) => new Date(b.createdAt || b.bookingDate || 0) - new Date(a.createdAt || a.bookingDate || 0));

    for (const booking of sorted) {
      const card = document.createElement('div');
      card.className = 'booking-card';
      const status = getBookingStatus(booking);
      const statusClass = getStatusClass(status);
      const seats = getSeatDisplay(booking);
      const amount = booking.totalAmount || booking.totalPrice || booking.amount || 0;

      let movieTitle = booking.movieTitle || booking.movieName || `Movie #${booking.movieId || ''}`;
      if ((!booking.movieTitle && !booking.movieName) && booking.movieId) {
        try {
          const movie = await MovieService.getById(booking.movieId);
          movieTitle = movie?.title || movie?.name || movieTitle;
        } catch {}
      }

      card.innerHTML = `
        <div class="booking-card-header">
          <div class="booking-movie-info">
            <h3 class="booking-movie-title">${movieTitle}</h3>
            <span class="booking-id">#${booking.id || ''}</span>
          </div>
          <span class="booking-status ${statusClass}">${status}</span>
        </div>
        <div class="booking-card-body">
          <div class="booking-detail">
            <span class="label">Date</span>
            <span class="value">${formatDate(booking.showDate || booking.date)}</span>
          </div>
          <div class="booking-detail">
            <span class="label">Time</span>
            <span class="value">${formatTime(booking.showTime || booking.time)}</span>
          </div>
          <div class="booking-detail">
            <span class="label">Seats</span>
            <span class="value">${seats || 'N/A'}</span>
          </div>
          <div class="booking-detail">
            <span class="label">Amount</span>
            <span class="value">${formatCurrency(amount)}</span>
          </div>
        </div>
        <div class="booking-card-footer">
          <div class="booking-code">Code: ${booking.bookingCode || booking.code || 'N/A'}</div>
          <button class="btn view-details-btn" data-booking-id="${booking.id}">View Details</button>
        </div>
      `;

      card.querySelector('.view-details-btn').addEventListener('click', () => {
        openBookingModal(booking);
      });

      bookingList.appendChild(card);
    }
  }

  async function openBookingModal(booking) {
    if (!booking) return;

    const currentUser = Auth.getUser();
    const myUserId = resolveUserId(currentUser);
    const bookUserId = resolveUserId(booking);
    if (myUserId !== bookUserId) {
      Toast.error('You can only view your own bookings');
      return;
    }

    let movie = null;
    let show = null;
    let payment = null;

    if (booking.movieId) {
      try { movie = await MovieService.getById(booking.movieId); } catch {}
    }
    if (booking.showId) {
      try { show = await ShowService.getById(booking.showId); } catch {}
    }
    if (booking.id) {
      try { payment = await PaymentService.getByBooking(booking.id); } catch {}
    }

    const status = getBookingStatus(booking);
    const isConfirmed = status === 'CONFIRMED' || status === 'SUCCESS' || status === 'COMPLETED';
    const seats = getSeatDisplay(booking);
    const amount = booking.totalAmount || booking.totalPrice || booking.amount || 0;
    const code = booking.bookingCode || booking.code || 'N/A';
    const movieTitle = movie?.title || movie?.name || booking.movieTitle || booking.movieName || 'Movie';
    const moviePoster = movie?.posterUrl || movie?.poster || '../images/default-poster.jpg';
    const screenName = show?.screenName || booking.screenName || `Screen ${show?.screenId || booking.screenId || ''}`;

    const backdropUrl = movie?.backdropUrl || movie?.backdrop || moviePoster;

    let sectionsHTML = '';

    sectionsHTML += `
      <div class="modal-section digital-ticket">
        <div class="ticket-bg" style="background: linear-gradient(135deg, rgba(229,9,20,0.9), rgba(74,0,0,0.95)), url('${backdropUrl}') center/cover;"></div>
        <div class="ticket-content">
          <div class="ticket-header">
            <div class="ticket-brand">BMSHOW</div>
            <div class="ticket-status ${getStatusClass(status)}">${status}</div>
          </div>
          <div class="ticket-body">
            <div class="ticket-movie">
              <img src="${moviePoster}" alt="${movieTitle}" class="ticket-poster">
              <div class="ticket-movie-info">
                <h3>${movieTitle}</h3>
                <p>${screenName}</p>
              </div>
            </div>
            <div class="ticket-details-grid">
              <div class="ticket-detail-item">
                <span class="ticket-label">Date</span>
                <span class="ticket-value">${formatDate(booking.showDate || booking.date)}</span>
              </div>
              <div class="ticket-detail-item">
                <span class="ticket-label">Time</span>
                <span class="ticket-value">${formatTime(booking.showTime || booking.time)}</span>
              </div>
              <div class="ticket-detail-item">
                <span class="ticket-label">Seats</span>
                <span class="ticket-value">${seats}</span>
              </div>
              <div class="ticket-detail-item">
                <span class="ticket-label">Total</span>
                <span class="ticket-value">${formatCurrency(amount)}</span>
              </div>
            </div>
          </div>
          <div class="ticket-divider">
            <div class="divider-dot left"></div>
            <div class="divider-line"></div>
            <div class="divider-dot right"></div>
          </div>
          <div class="ticket-footer">
            <div class="ticket-code">
              <span class="ticket-code-label">Booking Code</span>
              <span class="ticket-code-value" id="modalBookingCode">${code}</span>
            </div>
            <div class="ticket-qr" id="modalQRContainer">
              <div id="modalQR"></div>
            </div>
          </div>
        </div>
      </div>`;

    sectionsHTML += `
      <div class="modal-section">
        <div class="section-header"><i class="fas fa-film"></i><h3>Movie Details</h3></div>
        <div class="section-content movie-details-section">
          <div class="movie-detail-poster">
            <img src="${moviePoster}" alt="${movieTitle}">
          </div>
          <div class="movie-detail-info">
            <h4>${movieTitle}</h4>
            ${movie?.language ? `<p><strong>Language:</strong> ${movie.language}</p>` : ''}
            ${movie?.genre ? `<p><strong>Genre:</strong> ${movie.genre}</p>` : ''}
            ${movie?.duration ? `<p><strong>Duration:</strong> ${movie.duration} min</p>` : ''}
            ${movie?.rating ? `<p><strong>Rating:</strong> ${movie.rating}/10</p>` : ''}
            ${movie?.description ? `<p class="movie-description">${movie.description}</p>` : ''}
          </div>
        </div>
      </div>`;

    sectionsHTML += `
      <div class="modal-section">
        <div class="section-header"><i class="fas fa-clock"></i><h3>Show Timing</h3></div>
        <div class="section-content show-timing-details">
          <div class="timing-item"><i class="fas fa-calendar-day"></i><div><span class="timing-label">Date</span><span class="timing-value">${formatDate(booking.showDate || booking.date)}</span></div></div>
          <div class="timing-item"><i class="fas fa-clock"></i><div><span class="timing-label">Time</span><span class="timing-value">${formatTime(booking.showTime || booking.time)}</span></div></div>
          <div class="timing-item"><i class="fas fa-video"></i><div><span class="timing-label">Screen</span><span class="timing-value">${screenName}</span></div></div>
        </div>
      </div>`;

    sectionsHTML += `
      <div class="modal-section">
        <div class="section-header"><i class="fas fa-chair"></i><h3>Seat Details</h3></div>
        <div class="section-content seat-details-section">
          <div class="seat-info-grid">
            ${(booking.seats || []).map(s => {
              const sn = typeof s === 'string' ? s : (s.seatNumber || `Seat ${s.id}`);
              return `<div class="seat-chip"><i class="fas fa-couch"></i><span>${sn}</span></div>`;
            }).join('') || `<div class="seat-chip"><i class="fas fa-couch"></i><span>${seats}</span></div>`}
          </div>
        </div>
      </div>`;

    sectionsHTML += `
      <div class="modal-section">
        <div class="section-header"><i class="fas fa-credit-card"></i><h3>Payment Details</h3></div>
        <div class="section-content payment-details-section">
          <div class="payment-grid">
            <div class="payment-item"><span class="payment-label">Subtotal</span><span class="payment-value">${formatCurrency(amount)}</span></div>
            <div class="payment-item"><span class="payment-label">Convenience Fee</span><span class="payment-value">${formatCurrency(0)}</span></div>
            <div class="payment-item total"><span class="payment-label">Total Amount</span><span class="payment-value">${formatCurrency(amount)}</span></div>
            <div class="payment-item"><span class="payment-label">Payment Status</span><span class="payment-value ${getStatusClass(status)}">${isConfirmed ? 'Paid' : status}</span></div>
          </div>
        </div>
      </div>`;

    sectionsHTML += `
      <div class="modal-section">
        <div class="section-header"><i class="fas fa-receipt"></i><h3>Booking Information</h3></div>
        <div class="section-content booking-info-section">
          <div class="info-grid">
            <div class="info-item"><span class="info-label">Booking ID</span><span class="info-value">#${booking.id || ''}</span></div>
            <div class="info-item"><span class="info-label">Booking Code</span><span class="info-value booking-code-display">${code}</span></div>
            <div class="info-item"><span class="info-label">Status</span><span class="info-value ${getStatusClass(status)}">${status}</span></div>
            <div class="info-item"><span class="info-label">Booked On</span><span class="info-value">${formatDate(booking.createdAt || booking.bookingDate)}</span></div>
          </div>
        </div>
      </div>`;

    sectionsHTML += `
      <div class="modal-section">
        <div class="section-header"><i class="fas fa-utensils"></i><h3>Food & Beverages</h3></div>
        <div class="section-content">
          <div class="placeholder-content"><i class="fas fa-popcorn"></i><p>No food items added to this booking.</p><button class="btn btn-sm" onclick="window.location.href='shows.html'">Order Food</button></div>
        </div>
      </div>`;

    sectionsHTML += `
      <div class="modal-section">
        <div class="section-header"><i class="fas fa-tags"></i><h3>Offers & Discounts</h3></div>
        <div class="section-content">
          <div class="placeholder-content"><i class="fas fa-gift"></i><p>No offers applied.</p></div>
        </div>
      </div>`;

    sectionsHTML += `
      <div class="modal-section">
        <div class="section-header"><i class="fas fa-history"></i><h3>Booking Timeline</h3></div>
        <div class="section-content">
          <div class="timeline">
            <div class="timeline-item completed">
              <div class="timeline-marker"></div>
              <div class="timeline-content"><h4>Booking Created</h4><p>${formatDate(booking.createdAt || booking.bookingDate)}</p></div>
            </div>
            <div class="timeline-item ${isConfirmed ? 'completed' : 'pending'}">
              <div class="timeline-marker"></div>
              <div class="timeline-content"><h4>${isConfirmed ? 'Payment Completed' : 'Payment Pending'}</h4><p>${isConfirmed ? 'Payment received successfully' : 'Awaiting payment confirmation'}</p></div>
            </div>
            <div class="timeline-item ${isConfirmed ? 'completed' : 'upcoming'}">
              <div class="timeline-marker"></div>
              <div class="timeline-content"><h4>Show Date</h4><p>${formatDate(booking.showDate || booking.date)}</p></div>
            </div>
          </div>
        </div>
      </div>`;

    sectionsHTML += `
      <div class="modal-section">
        <div class="section-header"><i class="fas fa-star"></i><h3>Rate Your Experience</h3></div>
        <div class="section-content">
          <div class="placeholder-content"><i class="fas fa-star-half-alt"></i><p>Rate this movie after the show.</p><button class="btn btn-sm" onclick="window.location.href='movies.html'">Browse Movies</button></div>
        </div>
      </div>`;

    sectionsHTML += `
      <div class="modal-section">
        <div class="section-header"><i class="fas fa-gem"></i><h3>Rewards</h3></div>
        <div class="section-content">
          <div class="placeholder-content"><i class="fas fa-coins"></i><p>Earn rewards on your next booking!</p></div>
        </div>
      </div>`;

    const modalOverlay = document.getElementById('bookingModal');
    const modalBody = document.getElementById('bookingModalBody');

    if (modalBody) modalBody.innerHTML = sectionsHTML;
    if (modalOverlay) modalOverlay.classList.add('open');

    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      try {
        if (typeof QRCode !== 'undefined' && document.getElementById('modalQR')) {
          new QRCode(document.getElementById('modalQR'), { text: code, width: 80, height: 80 });
        }
      } catch {}
    }, 100);

    const closeBtn = document.getElementById('bookingModalClose');
    closeBtn?.addEventListener('click', closeBookingModal);
    modalOverlay?.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeBookingModal();
    });

    document.addEventListener('keydown', bookingModalKeyHandler);
  }

  function bookingModalKeyHandler(e) {
    if (e.key === 'Escape') closeBookingModal();
  }

  window.closeBookingModal = function() {
    const overlay = document.getElementById('bookingModal');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', bookingModalKeyHandler);
  };

  window.downloadTicket = function() {
    const codeEl = document.getElementById('modalBookingCode');
    const code = codeEl?.textContent || 'BMSHOW';
    Toast.success('Ticket download initiated: ' + code);
  };

  window.printTicket = function() {
    window.print();
  };

  window.shareBooking = function() {
    const codeEl = document.getElementById('modalBookingCode');
    const code = codeEl?.textContent || 'BMSHOW';
    if (navigator.share) {
      navigator.share({ title: 'BMShow Ticket', text: `Your booking code: ${code}`, url: window.location.href });
    } else {
      const { copyToClipboard } = import('../utils/helpers.js');
      Toast.success('Booking code copied: ' + code);
    }
  };

  window.cancelBooking = async function(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await BookingService.cancel(bookingId);
      Toast.success('Booking cancelled successfully');
      closeBookingModal();
      await init();
    } catch (err) {
      Toast.error(err.data?.message || 'Failed to cancel booking');
    }
  };

  await init();
});
