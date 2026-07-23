import { showLoading, hideLoading, formatDate, showToast } from './admin.js';
import { Modal } from '../utils/modal.js';

const demoTheatres = ['PVR: City Centre', 'INOX: Mall Road', 'Cinepolis: Central Plaza', 'Big Cinemas: Westend'];
const demoScreens = ['Screen 1', 'Screen 2', 'Screen 3', 'IMAX', '4DX'];

const SEAT_CATEGORIES = [
  { id: 'standard', label: 'Standard', color: '#2D2D3A', border: '#3D3D4A', textColor: 'rgba(255,255,255,0.5)' },
  { id: 'vip', label: 'VIP', color: '#4F46E5', border: '#6366F1', textColor: '#fff' },
  { id: 'premium', label: 'Premium', color: '#7C3AED', border: '#8B5CF6', textColor: '#fff' },
  { id: 'gold', label: 'Gold', color: '#F59E0B', border: '#FBBF24', textColor: '#000' },
  { id: 'silver', label: 'Silver', color: '#6B7280', border: '#9CA3AF', textColor: '#fff' },
  { id: 'normal', label: 'Normal', color: '#374151', border: '#4B5563', textColor: 'rgba(255,255,255,0.6)' },
  { id: 'couple', label: 'Couple', color: '#EC4899', border: '#F472B6', textColor: '#fff' },
  { id: 'wheelchair', label: 'Wheelchair', color: '#3B82F6', border: '#60A5FA', textColor: '#fff' },
  { id: 'reserved', label: 'Reserved', color: '#EF4444', border: '#F87171', textColor: '#fff' },
  { id: 'unavailable', label: 'Unavailable', color: '#1A1A2E', border: '#2A2A3E', textColor: 'rgba(255,255,255,0.2)' },
];

let seatLayouts = [];
let currentLayout = null;
let selectedCategory = 'standard';
let isDragging = false;

const getCategory = (id) => SEAT_CATEGORIES.find((c) => c.id === id) || SEAT_CATEGORIES[0];

const categoryCycle = SEAT_CATEGORIES.map((c) => c.id);

const generateSeatGrid = () => {
  const grid = document.getElementById('seatGrid');
  const rowsEl = document.getElementById('layoutRowCount');
  const seatsEl = document.getElementById('layoutSeatsPerRow');
  if (!grid || !rowsEl || !seatsEl) return;

  const rows = parseInt(rowsEl.value) || 8;
  const seatsPerRow = parseInt(seatsEl.value) || 12;

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const layout = [];
  for (let r = 0; r < Math.min(rows, 26); r++) {
    const row = [];
    for (let s = 1; s <= seatsPerRow; s++) {
      row.push({ id: `${letters[r]}${s}`, row: letters[r], number: s, category: 'standard' });
    }
    layout.push(row);
  }

  currentLayout = layout;
  renderSeatGrid();
};

const renderSeatGrid = () => {
  const grid = document.getElementById('seatGrid');
  if (!grid || !currentLayout) return;

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  grid.innerHTML = currentLayout.map((row, ri) => {
    const rowLabel = letters[ri] || `R${ri + 1}`;
    const seats = row.map((seat) => {
      const cat = getCategory(seat.category);
      return `<div class="seat-item" data-row="${seat.row}" data-number="${seat.number}" data-id="${seat.id}" data-category="${seat.category}" style="width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:9px;cursor:pointer;background:${cat.color};border:1px solid ${cat.border};color:${cat.textColor};transition:all 0.15s;user-select:none;font-family:'Inter',sans-serif;font-weight:500;" title="${seat.id}">${seat.number}</div>`;
    }).join('');
    return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><span style="width:24px;text-align:center;font-size:12px;font-weight:600;color:rgba(255,255,255,0.4);font-family:'Inter',sans-serif;">${rowLabel}</span><div style="display:flex;gap:6px;">${seats}</div></div>`;
  }).join('');

  grid.querySelectorAll('.seat-item').forEach((el) => {
    el.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handleSeatClick(el);
      isDragging = true;
    });
    el.addEventListener('mouseenter', () => {
      if (isDragging) handleSeatClick(el);
    });
  });

  document.addEventListener('mouseup', () => { isDragging = false; });
};

const handleSeatClick = (el) => {
  const currentCat = el.dataset.category;
  const idx = categoryCycle.indexOf(currentCat);
  const nextCat = categoryCycle[(idx + 1) % categoryCycle.length];
  const appliedCat = selectedCategory !== 'standard' ? selectedCategory : nextCat;
  el.dataset.category = appliedCat;
  const cat = getCategory(appliedCat);
  el.style.background = cat.color;
  el.style.borderColor = cat.border;
  el.style.color = cat.textColor;

  if (currentLayout) {
    for (const row of currentLayout) {
      const seat = row.find((s) => s.id === el.dataset.id);
      if (seat) seat.category = appliedCat;
    }
  }
};

const buildLegend = () => {
  const legend = document.getElementById('seatLegend');
  if (!legend) return;

  legend.innerHTML = SEAT_CATEGORIES.map((cat) => `
    <div class="legend-item ${cat.id === selectedCategory ? 'active' : ''}" data-category="${cat.id}" style="cursor:pointer;opacity:${cat.id === selectedCategory ? 1 : 0.6};transition:opacity 0.2s;">
      <span class="legend-color" style="display:inline-block;width:16px;height:16px;border-radius:4px;background:${cat.color};border:1px solid ${cat.border};vertical-align:middle;margin-right:6px;"></span>
      <span class="legend-label" style="font-size:12px;color:rgba(255,255,255,0.7);font-family:'Inter',sans-serif;">${cat.label}</span>
    </div>
  `).join('');

  legend.querySelectorAll('.legend-item').forEach((item) => {
    item.addEventListener('click', () => {
      selectedCategory = item.dataset.category;
      legend.querySelectorAll('.legend-item').forEach((li) => {
        li.style.opacity = li.dataset.category === selectedCategory ? '1' : '0.6';
      });
      showToast(`Category: ${getCategory(selectedCategory).label}`, 'info');
    });
  });
};

const saveLayout = () => {
  if (!currentLayout) { showToast('Generate a layout first', 'warning'); return; }

  const theatre = document.getElementById('layoutTheatreSelect')?.value || '';
  const screen = document.getElementById('layoutScreenSelect')?.value || '';
  if (!theatre || !screen) { showToast('Please select theatre and screen', 'error'); return; }

  const totalSeats = currentLayout.reduce((sum, row) => sum + row.length, 0);
  const counts = {};
  SEAT_CATEGORIES.forEach((c) => { counts[c.id] = 0; });
  currentLayout.forEach((row) => row.forEach((seat) => { counts[seat.category] = (counts[seat.category] || 0) + 1; }));

  const existing = seatLayouts.findIndex((l) => l.theatre === theatre && l.screen === screen);
  const layoutData = {
    theatre, screen, totalSeats, counts,
    layout: JSON.parse(JSON.stringify(currentLayout)),
    updatedAt: new Date().toISOString(),
  };

  if (existing !== -1) {
    seatLayouts[existing] = layoutData;
    showToast('Layout updated successfully', 'success');
  } else {
    seatLayouts.push(layoutData);
    showToast('Layout saved successfully', 'success');
  }

  renderLayoutsTable();
};

const renderLayoutsTable = () => {
  const tbody = document.getElementById('seatLayoutsTableBody');
  if (!tbody) return;

  if (seatLayouts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">No seat layouts saved yet</td></tr>`;
    return;
  }

  tbody.innerHTML = seatLayouts.map((l, idx) => {
    const c = l.counts || {};
    return `
      <tr>
        <td>${l.theatre}</td>
        <td>${l.screen}</td>
        <td>${l.totalSeats}</td>
        <td>${c.standard || 0}</td>
        <td>${c.premium || 0}</td>
        <td>${c.vip || 0}</td>
        <td>${(c.wheelchair || 0) + (c.accessible || 0)}</td>
        <td>${formatDate(l.updatedAt)}</td>
        <td>
          <div class="action-btns">
            <button class="btn-icon btn-load" data-idx="${idx}" title="Load">📂</button>
            <button class="btn-icon btn-delete" data-idx="${idx}" title="Delete">🗑</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.btn-load').forEach((btn) => btn.addEventListener('click', () => {
    const layout = seatLayouts[parseInt(btn.dataset.idx)];
    if (layout && layout.layout) {
      currentLayout = JSON.parse(JSON.stringify(layout.layout));
      document.getElementById('layoutRowCount').value = layout.layout.length;
      document.getElementById('layoutSeatsPerRow').value = layout.layout[0]?.length || 12;
      renderSeatGrid();
      showToast('Layout loaded', 'success');
    }
  }));

  tbody.querySelectorAll('.btn-delete').forEach((btn) => btn.addEventListener('click', async () => {
    const idx = parseInt(btn.dataset.idx);
    const confirmed = await Modal.confirm({ title: 'Delete Layout', message: 'Delete this seat layout?', type: 'danger' });
    if (confirmed) {
      seatLayouts.splice(idx, 1);
      renderLayoutsTable();
      showToast('Layout deleted', 'success');
    }
  }));
};

const populateSelectors = () => {
  const theatreSelect = document.getElementById('layoutTheatreSelect');
  const screenSelect = document.getElementById('layoutScreenSelect');
  if (theatreSelect) {
    demoTheatres.forEach((t) => {
      const o = document.createElement('option');
      o.value = t; o.textContent = t;
      theatreSelect.appendChild(o);
    });
    theatreSelect.addEventListener('change', () => {
      const existing = seatLayouts.find((l) => l.theatre === theatreSelect.value && l.screen === screenSelect?.value);
      if (existing && existing.layout) {
        currentLayout = JSON.parse(JSON.stringify(existing.layout));
        document.getElementById('layoutRowCount').value = existing.layout.length;
        document.getElementById('layoutSeatsPerRow').value = existing.layout[0]?.length || 12;
        renderSeatGrid();
      }
    });
  }
  if (screenSelect) {
    demoScreens.forEach((s) => {
      const o = document.createElement('option');
      o.value = s; o.textContent = s;
      screenSelect.appendChild(o);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  populateSelectors();
  buildLegend();

  const generateBtn = document.getElementById('generateLayoutBtn');
  if (generateBtn) generateBtn.addEventListener('click', generateSeatGrid);

  const saveBtn = document.getElementById('saveSeatLayoutBtn');
  if (saveBtn) saveBtn.addEventListener('click', saveLayout);

  renderLayoutsTable();

  const rowsInput = document.getElementById('layoutRowCount');
  const seatsInput = document.getElementById('layoutSeatsPerRow');
  if (rowsInput) rowsInput.addEventListener('change', () => { if (currentLayout) generateSeatGrid(); });
  if (seatsInput) seatsInput.addEventListener('change', () => { if (currentLayout) generateSeatGrid(); });
});
