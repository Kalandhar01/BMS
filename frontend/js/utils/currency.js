function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₹0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function parseCurrency(str) {
  if (!str) return 0;
  const cleaned = str.replace(/[₹,\s]/g, '');
  return parseFloat(cleaned) || 0;
}

function calculateTotal(prices) {
  return prices.reduce((sum, p) => sum + (typeof p === 'string' ? parseCurrency(p) : p), 0);
}
