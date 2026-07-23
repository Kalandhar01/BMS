import { BookingService } from '../services/booking-service.js';
import { PaymentService } from '../services/payment-service.js';
import { Auth } from '../utils/auth.js';
import { Toast } from '../utils/toast.js';
import { formatCurrency } from '../utils/currency.js';
import { formatTime, formatDate } from '../utils/date.js';

document.addEventListener('DOMContentLoaded', () => {
  const user = Auth.getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const showId = urlParams.get('showId');
  const seatIds = urlParams.get('seatIds');
  const seatNumbers = urlParams.get('seatNumbers');
  const totalParam = urlParams.get('total');

  if (!showId || !seatIds) {
    document.getElementById('paymentContainer').innerHTML = '<div class="error"><h2>Missing booking details</h2><a href="movies.html" class="btn">Browse Movies</a></div>';
    return;
  }

  const orderSummary = document.getElementById('orderSummary');
  const paymentForm = document.getElementById('paymentForm');
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
  const cardDetails = document.getElementById('cardDetails');
  const upiDetails = document.getElementById('upiDetails');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const payBtn = document.getElementById('payBtn');
  const totalAmountEl = document.getElementById('totalAmount');

  const total = totalParam ? parseFloat(totalParam) : 0;
  const seats = seatNumbers ? decodeURIComponent(seatNumbers) : `Seats: ${seatIds}`;

  if (orderSummary) {
    orderSummary.innerHTML = `
      <div class="summary-item"><span>Show</span><span>#${showId}</span></div>
      <div class="summary-item"><span>Seats</span><span>${seats}</span></div>
      <div class="summary-item total"><span>Total</span><span>${formatCurrency(total)}</span></div>
    `;
  }
  if (totalAmountEl) totalAmountEl.textContent = formatCurrency(total);

  paymentMethods?.forEach(method => {
    method.addEventListener('change', () => {
      cardDetails?.classList.toggle('hidden', method.value !== 'card');
      upiDetails?.classList.toggle('hidden', method.value !== 'upi');
    });
  });

  paymentForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'card';

    loadingSpinner?.classList.remove('hidden');
    payBtn.disabled = true;

    try {
      const userId_val = parseInt(user?.userId ?? user?.id, 10) || 1;

      const bookingData = {
        userId: userId_val,
        showId: parseInt(showId, 10),
        seatIds: seatIds,
        seatNumbers: seats,
        totalAmount: total,
      };

      const booking = await BookingService.create(bookingData);
      if (!booking || !booking.id) throw new Error('Booking creation failed');

      const paymentData = {
        bookingId: booking.id,
        amount: total,
        paymentMethod: paymentMethod,
        transactionId: 'TXN' + Date.now(),
        status: 'SUCCESS',
      };

      const payment = await PaymentService.process(paymentData);
      if (!payment) throw new Error('Payment processing failed');

      Toast.success('Payment successful!');
      window.location.href = `booking-success.html?bookingId=${booking.id}`;
    } catch (err) {
      const msg = err.data?.message || err.data?.error || 'Payment failed. Please try again.';
      Toast.error(msg);
    } finally {
      loadingSpinner?.classList.add('hidden');
      payBtn.disabled = false;
    }
  });
});
