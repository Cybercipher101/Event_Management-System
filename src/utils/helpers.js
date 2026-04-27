export function getCurrencySymbol(currency) {
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  return symbols[currency] || '₹';
}

export function formatPrice(amount, currency = 'INR') {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${Number(amount).toLocaleString('en-IN')}`;
}

export function getTypeClass(type) {
  return `type-${type}`;
}

export function getStatusClass(status) {
  return `status-${status}`;
}

export function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
