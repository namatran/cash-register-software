import { products, productById, LOW_STOCK } from './products.js';
import { brand } from './config/brand.js';

const KEY = brand.storageKey;

const toCents = (n) => Math.round(n * 100) / 100;

function freshShift() {
  return { start: Date.now(), breakStart: null, breakMs: 0, cashLog: [] };
}

const defaultSettings = () => ({
  storeName: brand.storeName,
  cashier: 'Owner',
  receiptFooter: brand.receiptFooter,
  lowStock: LOW_STOCK,
});

const defaultStock = () => Object.fromEntries(products.map((p) => [p.id, p.stock]));

function initialState() {
  return {
    settings: defaultSettings(),
    cart: [],          // [{ id, qty, note }]
    parked: [],        // [{ at, items: cart }]
    sales: [],         // completed sales
    receiptSeq: 27,    // last used receipt number
    stock: defaultStock(),
    shift: freshShift(),
  };
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved) {
      const base = initialState();
      // Nested objects merge too, so products and settings added later get defaults.
      return {
        ...base,
        ...saved,
        settings: { ...base.settings, ...saved.settings },
        stock: { ...base.stock, ...saved.stock },
      };
    }
  } catch { /* storage unavailable or corrupt: start fresh */ }
  return initialState();
}

let state = load();
const listeners = new Set();

function commit(next) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((fn) => fn(state));
}

export const getState = () => state;

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ---------- Cart ----------
export function cartLines(cart = state.cart) {
  return cart
    .filter((l) => productById[l.id])
    .map((l) => ({ ...l, product: productById[l.id], total: productById[l.id].price * l.qty }));
}

export function cartTotals(cart = state.cart) {
  const lines = cartLines(cart);
  // Round to cents so decimal prices don't drift (4.25 + 4.25 + 3.85 must equal a typed 12.35).
  const subtotal = toCents(lines.reduce((s, l) => s + l.total, 0));
  return { subtotal, total: subtotal, count: lines.reduce((s, l) => s + l.qty, 0) };
}

export function addToCart(id) {
  const existing = state.cart.find((l) => l.id === id);
  const cart = existing
    ? state.cart.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l))
    : [...state.cart, { id, qty: 1, note: '' }];
  commit({ ...state, cart });
}

export function setQty(id, qty) {
  if (qty <= 0) return removeLine(id);
  commit({ ...state, cart: state.cart.map((l) => (l.id === id ? { ...l, qty } : l)) });
}

export function setNote(id, note) {
  commit({ ...state, cart: state.cart.map((l) => (l.id === id ? { ...l, note } : l)) });
}

export function removeLine(id) {
  commit({ ...state, cart: state.cart.filter((l) => l.id !== id) });
}

export function clearCart() {
  commit({ ...state, cart: [] });
}

export function parkCart() {
  if (!state.cart.length) return;
  commit({ ...state, parked: [...state.parked, { at: Date.now(), items: state.cart }], cart: [] });
}

// Restoring swaps: a non-empty current cart gets parked in its place.
export function restoreParked(index) {
  const entry = state.parked[index];
  if (!entry) return;
  const parked = state.parked.filter((_, i) => i !== index);
  if (state.cart.length) parked.push({ at: Date.now(), items: state.cart });
  commit({ ...state, parked, cart: entry.items });
}

// ---------- Sales ----------
export const nextReceiptNo = () => state.receiptSeq + 1;

export function completeSale({ method, tendered }) {
  const lines = cartLines();
  const { subtotal, total } = cartTotals();
  const no = nextReceiptNo();
  const sale = {
    no,
    at: Date.now(),
    cashier: state.settings.cashier,
    store: state.settings.storeName,
    footer: state.settings.receiptFooter,
    method,
    items: lines.map((l) => ({ id: l.id, name: l.product.name, price: l.product.price, qty: l.qty, note: l.note })),
    subtotal,
    total,
    tendered,
    change: Math.max(0, toCents(tendered - total)),
  };
  const stock = { ...state.stock };
  lines.forEach((l) => { stock[l.id] = Math.max(0, (stock[l.id] ?? 0) - l.qty); });
  commit({ ...state, sales: [...state.sales, sale], receiptSeq: no, stock, cart: [] });
  return sale;
}

// ---------- Shift ----------
export function shiftElapsed(now = Date.now()) {
  const { start, breakStart, breakMs } = state.shift;
  return (breakStart ?? now) - start - breakMs;
}

export function startBreak() {
  if (state.shift.breakStart) return;
  commit({ ...state, shift: { ...state.shift, breakStart: Date.now() } });
}

export function endBreak() {
  const { breakStart, breakMs } = state.shift;
  if (!breakStart) return;
  commit({ ...state, shift: { ...state.shift, breakStart: null, breakMs: breakMs + Date.now() - breakStart } });
}

export function logCash(type, amount, reason) {
  const entry = { type, amount, reason, at: Date.now() };
  commit({ ...state, shift: { ...state.shift, cashLog: [...state.shift.cashLog, entry] } });
}

export function shiftSummary() {
  const { start, cashLog } = state.shift;
  const sales = state.sales.filter((s) => s.at >= start);
  const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
  const byMethod = (m) => sum(sales.filter((s) => s.method === m), (s) => s.total);
  return {
    elapsed: shiftElapsed(),
    count: sales.length,
    gross: sum(sales, (s) => s.total),
    cash: byMethod('cash'),
    wallet: byMethod('wallet'),
    card: byMethod('card'),
    cashIn: sum(cashLog.filter((c) => c.type === 'in'), (c) => c.amount),
    cashOut: sum(cashLog.filter((c) => c.type === 'out'), (c) => c.amount),
  };
}

export function endShift() {
  commit({ ...state, shift: freshShift() });
}

// ---------- Inventory ----------
export function setStock(id, n) {
  if (!productById[id]) return;
  commit({ ...state, stock: { ...state.stock, [id]: Math.max(0, Math.round(n)) } });
}

export function adjustStock(id, delta) {
  setStock(id, (state.stock[id] ?? 0) + delta);
}

// ---------- Reports ----------
export function salesInRange(from, to = Infinity) {
  return state.sales.filter((s) => s.at >= from && s.at < to);
}

// ---------- Settings ----------
export function updateSettings(patch) {
  commit({ ...state, settings: { ...state.settings, ...patch } });
}

// Clears sales, carts and the shift but keeps settings, stock and the receipt counter.
export function resetSales() {
  commit({ ...state, sales: [], cart: [], parked: [], shift: freshShift() });
}

export function resetAll() {
  commit(initialState());
}
