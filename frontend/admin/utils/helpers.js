export const formatDate = (dateStr, options = {}) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return date.toLocaleDateString('en-US', defaultOptions);
}

export const formatTime = (timeStr) => {
  if (!timeStr) return '-';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return '-';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '-';
  return new Intl.NumberFormat('en-US').format(num);
}

export const truncate = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

export const throttle = (fn, delay = 300) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export const copyToClipboard = (text) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  return Promise.resolve();
}

export const downloadFile = (content, filename, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

export const randomColor = () => {
  const colors = [
    '#4F46E5', '#7C3AED', '#EC4899', '#EF4444',
    '#F59E0B', '#10B981', '#3B82F6', '#6366F1',
    '#8B5CF6', '#D946EF', '#F97316', '#14B8A6',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export const pluralize = (count, singular, plural) => {
  return count === 1 ? singular : plural;
}

export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
}

export const sortBy = (array, key, direction = 'asc') => {
  const sorted = [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === 'string') {
      return direction === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return direction === 'asc' ? aVal - bVal : bVal - aVal;
  });
  return sorted;
}

export const filterBy = (array, filters) => {
  return array.filter((item) =>
    Object.entries(filters).every(([key, value]) => {
      if (value === null || value === undefined || value === '') return true;
      const itemValue = item[key];
      if (typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(String(value).toLowerCase());
      }
      return itemValue === value;
    })
  );
}

export const paginate = (array, page = 1, perPage = 10) => {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return {
    data: array.slice(start, end),
    total: array.length,
    page,
    perPage,
    totalPages: Math.ceil(array.length / perPage),
  };
}
