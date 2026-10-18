import { brand } from './config/brand.js';

const { symbol, locale } = brand.currency;
const moneyFmt = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const currencySymbol = symbol;

export const money = (n) => `${symbol}${moneyFmt.format(n)}`;

export const receiptNo = (n) => `${brand.receiptPrefix}${String(n).padStart(5, '0')}`;

// "Oct 12, 2026, 12:48 AM"
export const dateTime = (ms) =>
  new Date(ms).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

// "7h 43m 32s"
export function duration(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m ${s % 60}s`;
}

export const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
