import { BookingService } from '../services/booking-service.js';
import { PaymentService } from '../services/payment-service.js';
import { Auth } from '../utils/auth.js';
import { Toast } from '../utils/toast.js';
import { formatDate, formatTime } from '../utils/date.js';
import { formatCurrency } from '../utils/currency.js';
import { copyToClipboard } from '../utils/helpers.js';

document.addEventListener('DOMContentLoaded', async () => {
  const user = Auth.getUser();
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get('bookingId');
  const bookingCode = urlParams.get('code');

  const bookingIdDisplay = document.getElementById('bookingIdDisplay');
  const movieTitle = document.getElementById('movieTitle');
  const bookingDate = document.getElementById('bookingDate');
  const bookingTime = document.getElementById('bookingTime');
  const seatNumbers = document.getElementById('seatNumbers');
  const screenName = document.getElementById('screenName');
  const totalAmount = document.getElementById('totalAmount');
  const paymentStatus = document.getElementById('paymentStatus');
  const bookingCodeEl = document.getElementById('bookingCode');
  const qrContainer = document.getElementById('qrContainer');

  if (!bookingId && !bookingCode) {
    document.querySelector('.success-container').innerHTML = '<h2>No booking information found</h2><a href="movies.html" class="btn">Browse Movies</a>';
    return;
  }

  try {
    let booking;
    if (bookingCode) {
      booking = await BookingService.getByCode(bookingCode);
    } else {
      booking = await BookingService.getById(bookingId);
    }

    if (!booking) throw new Error('Booking not found');

    const total = booking.totalAmount || booking.totalPrice || booking.amount || 0;
    const seats = booking.seatNumbers || booking.seats || [];
    const status = booking.status || booking.paymentStatus || 'CONFIRMED';
    const code = booking.bookingCode || booking.code || bookingCode || 'N/A';

    if (bookingCodeEl) bookingCodeEl.textContent = code;

    if (bookingIdDisplay && booking.id) bookingIdDisplay.textContent = `Booking #${booking.id}`;

    if (movieTitle) {
      if (booking.movieTitle || booking.movieName) {
        movieTitle.textContent = booking.movieTitle || booking.movieName;
      } else if (booking.movieId) {
        try {
          const { MovieService } = await import('../services/movie-service.js');
          const movie = await MovieService.getById(booking.movieId);
          movieTitle.textContent = movie?.title || movie?.name || `Movie #${booking.movieId}`;
        } catch {
          movieTitle.textContent = `Movie #${booking.movieId}`;
        }
      }
    }

    if (bookingDate) bookingDate.textContent = formatDate(booking.showDate || booking.date);
    if (bookingTime) bookingTime.textContent = formatTime(booking.showTime || booking.time);

    if (seatNumbers) {
      if (Array.isArray(seats)) {
        seatNumbers.textContent = seats.map(s => {
          if (typeof s === 'string') return s;
          if (s && s.seatNumber) return s.seatNumber;
          if (s && s.id) return `Seat ${s.id}`;
          return '';
        }).filter(Boolean).join(', ');
      } else {
        seatNumbers.textContent = seats || 'N/A';
      }
    }

    if (screenName) {
      const screen = booking.screenName || booking.screen?.name || '';
      screenName.textContent = screen || (booking.screenId ? `Screen ${booking.screenId}` : 'N/A');
    }

    if (totalAmount) totalAmount.textContent = formatCurrency(total);

    if (paymentStatus) {
      const isConfirmed = status === 'CONFIRMED' || status === 'SUCCESS' || status === 'COMPLETED';
      paymentStatus.textContent = isConfirmed ? 'Payment Successful' : status;
      paymentStatus.className = isConfirmed ? 'status-confirmed' : 'status-pending';

      if (!isConfirmed && booking.id) {
        try {
          const payment = await PaymentService.getByBooking(booking.id);
          if (payment && payment.status === 'SUCCESS') {
            paymentStatus.textContent = 'Payment Successful';
            paymentStatus.className = 'status-confirmed';
          }
        } catch {}
      }
    }

    if (qrContainer) {
      const qrData = code !== 'N/A' ? code : `BMS-${booking.id || ''}-${Date.now()}`;
      qrContainer.innerHTML = `<div id="qrcode"></div>`;
      try {
        if (typeof QRCode === 'undefined') {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
          script.onload = () => new QRCode(document.getElementById('qrcode'), { text: qrData, width: 150, height: 150 });
          document.head.appendChild(script);
        } else {
          new QRCode(document.getElementById('qrcode'), { text: qrData, width: 150, height: 150 });
        }
      } catch {
        qrContainer.innerHTML = `<div style="padding:20px;text-align:center">Booking Code: <strong>${qrData}</strong></div>`;
      }
    }
  } catch (err) {
    Toast.error('Failed to load booking details');
    document.querySelector('.success-container').innerHTML = '<h2>Could not load booking details</h2><a href="movies.html" class="btn">Browse Movies</a>';
  }
});
