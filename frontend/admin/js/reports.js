import { showLoading, hideLoading, formatCurrency, formatDate, showToast } from './admin.js';
import { downloadFile } from '../utils/helpers.js';

const demoMovies = [
  { title: 'Jawan', genre: 'Action', rating: 4.6, bookings: 4567, revenue: 8923450 },
  { title: 'Gadar 2', genre: 'Action', rating: 4.4, bookings: 3890, revenue: 7456780 },
  { title: 'Oppenheimer', genre: 'Drama', rating: 4.8, bookings: 3456, revenue: 7234560 },
  { title: 'Barbie', genre: 'Comedy', rating: 4.2, bookings: 3123, revenue: 6123450 },
  { title: 'Mission Impossible', genre: 'Action', rating: 4.5, bookings: 2890, revenue: 5890120 },
  { title: 'Fighter', genre: 'Action', rating: 4.3, bookings: 2345, revenue: 4567890 },
  { title: 'Dunki', genre: 'Comedy', rating: 4.1, bookings: 2123, revenue: 4234560 },
  { title: 'Animal', genre: 'Action', rating: 4.0, bookings: 1987, revenue: 3987650 },
  { title: 'Salaar', genre: 'Action', rating: 4.3, bookings: 1789, revenue: 3567890 },
  { title: 'Pushpa 2', genre: 'Action', rating: 4.5, bookings: 1654, revenue: 3345670 },
];

const demoUsers = [
  { name: 'Rahul Sharma', email: 'rahul.sharma@email.com', bookings: 12, membership: 'Gold', joinDate: '2025-01-15' },
  { name: 'Priya Patel', email: 'priya.patel@email.com', bookings: 8, membership: 'Silver', joinDate: '2025-02-20' },
  { name: 'Amit Kumar', email: 'amit.kumar@email.com', bookings: 15, membership: 'Platinum', joinDate: '2024-11-01' },
  { name: 'Neha Gupta', email: 'neha.gupta@email.com', bookings: 6, membership: 'Basic', joinDate: '2025-04-10' },
  { name: 'Vikram Singh', email: 'vikram.singh@email.com', bookings: 20, membership: 'Platinum', joinDate: '2024-08-15' },
];

let activeTab = 'revenue';
let reportChartInstance = null;

const generateRevenueByMonth = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((m, i) => ({
    month: m,
    revenue: 500000 + Math.floor(Math.random() * 800000) + i * 100000,
    bookings: 500 + Math.floor(Math.random() * 400) + i * 50,
  }));
};

const generateDailyTrend = (days = 30) => {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.floor(Math.random() * 150) + 50,
    });
  }
  return data;
};

const genreData = [
  { genre: 'Action', count: 6, color: '#EF4444' },
  { genre: 'Comedy', count: 2, color: '#F59E0B' },
  { genre: 'Drama', count: 1, color: '#3B82F6' },
  { genre: 'Sci-Fi', count: 1, color: '#10B981' },
];

const membershipData = [
  { tier: 'Basic', count: 45, color: '#6B7280' },
  { tier: 'Silver', count: 30, color: '#9CA3AF' },
  { tier: 'Gold', count: 18, color: '#F59E0B' },
  { tier: 'Platinum', count: 7, color: '#8B5CF6' },
];

const setStats = (tab) => {
  const data = {
    revenue: { totalRevenue: 12456780, totalBookings: 23456, totalMovies: 156, activeUsers: 45678 },
    movies: { totalRevenue: 12456780, totalBookings: 23456, totalMovies: 156, activeUsers: 45678 },
    bookings: { totalRevenue: 12456780, totalBookings: 23456, totalMovies: 156, activeUsers: 45678 },
    users: { totalRevenue: 12456780, totalBookings: 23456, totalMovies: 156, activeUsers: 45678 },
  };
  const s = data[tab] || data.revenue;
  const el1 = document.getElementById('reportTotalRevenue');
  const el2 = document.getElementById('reportTotalBookings');
  const el3 = document.getElementById('reportTotalMovies');
  const el4 = document.getElementById('reportActiveUsers');
  if (el1) el1.textContent = formatCurrency(s.totalRevenue);
  if (el2) el2.textContent = s.totalBookings.toLocaleString();
  if (el3) el3.textContent = s.totalMovies;
  if (el4) el4.textContent = s.activeUsers.toLocaleString();
};

const renderChart = (tab) => {
  const canvas = document.getElementById('reportChart');
  if (!canvas) return;

  if (reportChartInstance) { reportChartInstance.destroy(); reportChartInstance = null; }

  if (typeof Chart === 'undefined') {
    const parent = canvas.parentElement;
    const ph = document.createElement('div');
    Object.assign(ph.style, { padding: '60px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '14px' });
    ph.textContent = '📊 Chart.js library not loaded';
    parent.insertBefore(ph, canvas);
    canvas.style.display = 'none';
    return;
  }

  canvas.style.display = 'block';
  const chartDefaults = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: 'rgba(255,255,255,0.7)', font: { family: "'Inter', sans-serif" } } } },
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };

  if (tab === 'revenue') {
    const data = generateRevenueByMonth();
    reportChartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.map((d) => d.month),
        datasets: [{
          label: 'Revenue (₹)',
          data: data.map((d) => d.revenue),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16,185,129,0.1)',
          fill: true, tension: 0.4,
        }],
      },
      options: chartDefaults,
    });
  } else if (tab === 'movies') {
    reportChartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: genreData.map((d) => d.genre),
        datasets: [{ data: genreData.map((d) => d.count), backgroundColor: genreData.map((d) => d.color), borderWidth: 0 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.7)', font: { family: "'Inter', sans-serif" }, padding: 16 } } },
      },
    });
  } else if (tab === 'bookings') {
    const data = generateDailyTrend(30);
    reportChartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.map((d) => d.date),
        datasets: [{
          label: 'Bookings',
          data: data.map((d) => d.value),
          backgroundColor: '#3B82F6',
          borderRadius: 4,
        }],
      },
      options: { ...chartDefaults, plugins: { legend: { display: false } } },
    });
  } else if (tab === 'users') {
    const data = generateDailyTrend(30);
    reportChartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.map((d) => d.date),
        datasets: [{
          label: 'New Users',
          data: data.map((d) => Math.floor(d.value / 3)),
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139,92,246,0.1)',
          fill: true, tension: 0.4,
        }],
      },
      options: chartDefaults,
    });
  }
};

const renderTable = (tab) => {
  const thead = document.getElementById('reportTableHead');
  const tbody = document.getElementById('reportTableBody');
  const count = document.getElementById('reportDataCount');
  if (!thead || !tbody) return;

  if (tab === 'revenue') {
    const data = generateRevenueByMonth();
    thead.innerHTML = '<tr><th>Month</th><th>Revenue</th><th>Bookings</th><th>Avg Booking Value</th></tr>';
    tbody.innerHTML = data.map((d) => {
      const avg = d.bookings > 0 ? d.revenue / d.bookings : 0;
      return `<tr><td>${d.month}</td><td>${formatCurrency(d.revenue)}</td><td>${d.bookings.toLocaleString()}</td><td>${formatCurrency(avg)}</td></tr>`;
    }).join('');
    if (count) count.textContent = `Showing ${data.length} months`;
  } else if (tab === 'movies') {
    thead.innerHTML = '<tr><th>Movie</th><th>Genre</th><th>Rating</th><th>Bookings</th><th>Revenue</th></tr>';
    tbody.innerHTML = demoMovies.sort((a, b) => b.rating - a.rating).map((m) =>
      `<tr><td>${m.title}</td><td>${m.genre}</td><td>★ ${m.rating}</td><td>${m.bookings.toLocaleString()}</td><td>${formatCurrency(m.revenue)}</td></tr>`
    ).join('');
    if (count) count.textContent = `Showing ${demoMovies.length} movies`;
  } else if (tab === 'bookings') {
    const statusData = [
      { status: 'Confirmed', count: 14567, color: '#10B981' },
      { status: 'Pending', count: 3456, color: '#F59E0B' },
      { status: 'Cancelled', count: 2345, color: '#EF4444' },
      { status: 'Refunded', count: 1088, color: '#3B82F6' },
    ];
    thead.innerHTML = '<tr><th>Status</th><th>Count</th><th>% of Total</th></tr>';
    const total = statusData.reduce((s, d) => s + d.count, 0);
    tbody.innerHTML = statusData.map((d) => {
      const pct = ((d.count / total) * 100).toFixed(1);
      return `<tr><td><span class="badge badge-${d.status === 'Confirmed' ? 'success' : d.status === 'Pending' ? 'warning' : d.status === 'Cancelled' ? 'danger' : 'info'}">${d.status}</span></td><td>${d.count.toLocaleString()}</td><td>${pct}%</td></tr>`;
    }).join('');
    if (count) count.textContent = `Showing ${statusData.length} statuses`;
  } else if (tab === 'users') {
    thead.innerHTML = '<tr><th>Name</th><th>Email</th><th>Bookings</th><th>Membership</th><th>Joined</th></tr>';
    tbody.innerHTML = demoUsers.map((u) =>
      `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.bookings}</td><td>${u.membership}</td><td>${formatDate(u.joinDate)}</td></tr>`
    ).join('');
    if (count) count.textContent = `Showing ${demoUsers.length} users`;
  }
};

const generateReport = () => {
  setStats(activeTab);
  renderChart(activeTab);
  renderTable(activeTab);
};

const exportCSV = () => {
  const thead = document.getElementById('reportTableHead');
  const tbody = document.getElementById('reportTableBody');
  if (!thead || !tbody) return;

  const headers = [...thead.querySelectorAll('th')].map((th) => th.textContent);
  const rows = [...tbody.querySelectorAll('tr')].map((tr) => {
    return [...tr.querySelectorAll('td')].map((td) => td.textContent.trim());
  });

  let csv = headers.join(',') + '\n';
  rows.forEach((row) => {
    csv += row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',') + '\n';
  });

  downloadFile(csv, `report_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  showToast('CSV exported successfully', 'success');
};

const getExportTableData = () => {
  const thead = document.getElementById('reportTableHead');
  const tbody = document.getElementById('reportTableBody');
  if (!thead || !tbody) return null;
  const headers = [...thead.querySelectorAll('th')].map((th) => th.textContent);
  const rows = [...tbody.querySelectorAll('tr')].map((tr) => [...tr.querySelectorAll('td')].map((td) => td.textContent.trim()));
  return { headers, rows };
};

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('#reportTabs .tab-item');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      generateReport();
    });
  });

  const generateBtn = document.getElementById('generateReportBtn');
  if (generateBtn) generateBtn.addEventListener('click', generateReport);

  const exportCSVBtn = document.getElementById('exportCSVBtn');
  if (exportCSVBtn) exportCSVBtn.addEventListener('click', exportCSV);

  const exportExcelBtn = document.getElementById('exportExcelBtn');
  if (exportExcelBtn) exportExcelBtn.addEventListener('click', () => {
    const data = getExportTableData();
    if (!data) return;
    const csv = data.headers.join(',') + '\n' + data.rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    downloadFile(csv, `report_${activeTab}.xls`, 'application/vnd.ms-excel');
    showToast('Excel exported successfully', 'success');
  });

  const exportPDFBtn = document.getElementById('exportPDFBtn');
  if (exportPDFBtn) exportPDFBtn.addEventListener('click', () => {
    showToast('PDF export initiated (download simulated)', 'info');
  });

  const dateFrom = document.getElementById('reportDateFrom');
  const dateTo = document.getElementById('reportDateTo');
  if (dateFrom) {
    const d = new Date(); d.setDate(d.getDate() - 30);
    dateFrom.value = d.toISOString().split('T')[0];
  }
  if (dateTo) {
    dateTo.value = new Date().toISOString().split('T')[0];
  }

  generateReport();
});
