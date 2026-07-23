import { showLoading, hideLoading, formatCurrency, formatDate, formatTime, showToast } from './admin.js';

const demoStats = [
  { id: 'statTotalMovies', value: 156, label: 'Total Movies', suffix: '' },
  { id: 'statActiveShows', value: 156, label: 'Active Shows', suffix: '' },
  { id: 'statTotalBookings', value: 1234, label: 'Total Bookings', suffix: '' },
  { id: 'statRevenue', value: 1245678, label: 'Revenue', suffix: '', prefix: '₹' },
  { id: 'statTheatres', value: 23, label: 'Theatres', suffix: '' },
  { id: 'statScreens', value: 89, label: 'Screens', suffix: '' },
  { id: 'statActiveUsers', value: 45678, label: 'Active Users', suffix: '' },
  { id: 'statActiveOffers', value: 12, label: 'Active Offers', suffix: '' },
];

const recentBookings = [
  { id: 'BK-001', customer: 'Rahul Sharma', movie: 'Jawan', show: '15 Jul 2025, 2:30 PM', seats: 'A1, A2', amount: 560, status: 'Confirmed' },
  { id: 'BK-002', customer: 'Priya Patel', movie: 'Gadar 2', show: '15 Jul 2025, 6:00 PM', seats: 'B4, B5, B6', amount: 840, status: 'Confirmed' },
  { id: 'BK-003', customer: 'Amit Kumar', movie: 'Oppenheimer', show: '15 Jul 2025, 9:00 PM', seats: 'C1', amount: 320, status: 'Pending' },
  { id: 'BK-004', customer: 'Neha Gupta', movie: 'Barbie', show: '16 Jul 2025, 10:00 AM', seats: 'D2, D3', amount: 560, status: 'Confirmed' },
  { id: 'BK-005', customer: 'Vikram Singh', movie: 'Mission Impossible', show: '16 Jul 2025, 2:30 PM', seats: 'E1, E2, E3, E4', amount: 1280, status: 'Cancelled' },
];

const activityFeed = [
  { text: 'New booking confirmed for Jawan by Rahul Sharma', time: '2 minutes ago', type: 'success' },
  { text: 'Payment of ₹1,240 received for booking BK-002', time: '15 minutes ago', type: 'info' },
  { text: 'New movie "Fighter" added to catalog', time: '1 hour ago', type: 'accent' },
  { text: 'Show #SH-045 cancelled due to technical issues', time: '2 hours ago', type: 'danger' },
  { text: 'New theatre "PVR Cinemas" registered', time: '3 hours ago', type: 'warning' },
];

let charts = {};

const animateCounter = (el, target, duration = 1500) => {
  const isCurrency = el.id === 'statRevenue';
  const start = 0;
  const startTime = performance.now();

  const tick = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * eased);

    if (isCurrency) {
      el.textContent = '₹' + current.toLocaleString('en-IN');
    } else {
      el.textContent = current.toLocaleString('en-IN');
    }

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const animateAllCounters = () => {
  demoStats.forEach((stat) => {
    const el = document.getElementById(stat.id);
    if (el) animateCounter(el, stat.value);
  });
};

const generateRevenueData = (days = 30) => {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.floor(Math.random() * 50000) + 20000,
      bookings: Math.floor(Math.random() * 80) + 30,
    });
  }
  return data;
};

const generateGenreData = () => [
  { genre: 'Action', count: 42, color: '#EF4444' },
  { genre: 'Comedy', count: 28, color: '#F59E0B' },
  { genre: 'Drama', count: 35, color: '#3B82F6' },
  { genre: 'Horror', count: 18, color: '#8B5CF6' },
  { genre: 'Sci-Fi', count: 22, color: '#10B981' },
  { genre: 'Romance', count: 15, color: '#EC4899' },
];

const generatePopularMovies = () => [
  { title: 'Jawan', bookings: 4567 },
  { title: 'Gadar 2', bookings: 3890 },
  { title: 'Oppenheimer', bookings: 3456 },
  { title: 'Barbie', bookings: 3123 },
  { title: 'Mission Impossible', bookings: 2890 },
  { title: 'Fighter', bookings: 2345 },
  { title: 'Dunki', bookings: 2123 },
  { title: 'Animal', bookings: 1987 },
];

const renderRecentBookings = () => {
  const tbody = document.getElementById('recentBookingsTableBody');
  if (!tbody) return;

  tbody.innerHTML = recentBookings.map((b) => `
    <tr>
      <td><span class="text-muted">${b.id}</span></td>
      <td>${b.customer}</td>
      <td>${b.movie}</td>
      <td>${b.show}</td>
      <td>${b.seats}</td>
      <td>${formatCurrency(b.amount)}</td>
      <td><span class="badge badge-${b.status.toLowerCase()}">${b.status}</span></td>
    </tr>
  `).join('');

  const count = document.getElementById('recentBookingCount');
  if (count) count.textContent = `Showing ${recentBookings.length} entries`;
};

const renderActivityFeed = () => {
  const feed = document.getElementById('activityFeed');
  if (!feed) return;

  feed.innerHTML = activityFeed.map((a) => `
    <div class="activity-item">
      <div class="activity-dot activity-dot-${a.type}"></div>
      <div class="activity-content">
        <span class="activity-text">${a.text}</span>
        <span class="activity-time">${a.time}</span>
      </div>
    </div>
  `).join('');
};

const initCharts = () => {
  if (typeof Chart === 'undefined') {
    document.querySelectorAll('canvas').forEach((c) => {
      const parent = c.parentElement;
      if (parent) {
        const ph = document.createElement('div');
        Object.assign(ph.style, {
          padding: '60px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)',
          fontSize: '14px', fontFamily: "'Inter', sans-serif",
        });
        ph.textContent = '📊 Chart.js library not loaded';
        parent.insertBefore(ph, c);
        c.style.display = 'none';
      }
    });
    return;
  }

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: 'rgba(255,255,255,0.7)', font: { family: "'Inter', sans-serif" } } },
    },
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.5)', font: { family: "'Inter', sans-serif" } }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: 'rgba(255,255,255,0.5)', font: { family: "'Inter', sans-serif" } }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };

  const revCanvas = document.getElementById('revenueChart');
  if (revCanvas) {
    const revData = generateRevenueData(30);
    charts.revenue = new Chart(revCanvas, {
      type: 'line',
      data: {
        labels: revData.map((d) => d.date),
        datasets: [{
          label: 'Revenue (₹)',
          data: revData.map((d) => d.revenue),
          borderColor: '#6366F1',
          backgroundColor: 'rgba(99,102,241,0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
        }],
      },
      options: {
        ...chartDefaults,
        plugins: { ...chartDefaults.plugins, legend: { ...chartDefaults.plugins.legend, display: true, position: 'top' } },
      },
    });
  }

  const bktCanvas = document.getElementById('bookingTrendChart');
  if (bktCanvas) {
    const revData = generateRevenueData(30);
    charts.bookingTrend = new Chart(bktCanvas, {
      type: 'bar',
      data: {
        labels: revData.map((d) => d.date),
        datasets: [{
          label: 'Bookings',
          data: revData.map((d) => d.bookings),
          backgroundColor: 'rgba(16,185,129,0.7)',
          borderRadius: 4,
        }],
      },
      options: { ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } },
    });
  }

  const popCanvas = document.getElementById('popularMoviesChart');
  if (popCanvas) {
    const popData = generatePopularMovies();
    charts.popular = new Chart(popCanvas, {
      type: 'bar',
      data: {
        labels: popData.map((d) => d.title),
        datasets: [{
          label: 'Bookings',
          data: popData.map((d) => d.bookings),
          backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'],
          borderRadius: 4,
        }],
      },
      options: {
        ...chartDefaults,
        indexAxis: 'y',
        plugins: { ...chartDefaults.plugins, legend: { display: false } },
      },
    });
  }

  const genreCanvas = document.getElementById('genreDistributionChart');
  if (genreCanvas) {
    const genreData = generateGenreData();
    charts.genre = new Chart(genreCanvas, {
      type: 'doughnut',
      data: {
        labels: genreData.map((d) => d.genre),
        datasets: [{
          data: genreData.map((d) => d.count),
          backgroundColor: genreData.map((d) => d.color),
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.7)', font: { family: "'Inter', sans-serif" }, padding: 16 } },
        },
      },
    });
  }
};

const handleResize = () => {
  Object.values(charts).forEach((chart) => {
    if (chart && typeof chart.resize === 'function') chart.resize();
  });
};

document.addEventListener('DOMContentLoaded', () => {
  showLoading(document.body);
  setTimeout(() => {
    animateAllCounters();
    renderRecentBookings();
    renderActivityFeed();
    initCharts();
    hideLoading(document.body);

    const periodSelectors = document.querySelectorAll('.chart-period-select');
    periodSelectors.forEach((sel) => {
      sel.addEventListener('change', () => {
        showLoading(document.body);
        setTimeout(() => {
          Object.values(charts).forEach((c) => { if (c) c.destroy(); });
          charts = {};
          initCharts();
          hideLoading(document.body);
          showToast('Chart updated', 'success');
        }, 300);
      });
    });

    const refreshBtn = document.getElementById('refreshDashboardBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        showToast('Dashboard refreshed', 'info');
      });
    }

    const exportBtn = document.getElementById('exportDashboardBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        showToast('Dashboard data exported', 'success');
      });
    }
  }, 500);
});

window.addEventListener('resize', handleResize);
