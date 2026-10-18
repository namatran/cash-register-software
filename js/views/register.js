import { icon, productArt } from '../icons.js';
import { products, categories, variantCount } from '../products.js';
import { getState, subscribe, addToCart, clearCart, shiftElapsed } from '../store.js';
import { confirmDialog } from '../modal.js';
import { money, escapeHtml, duration } from '../format.js';
import { mountCart } from './cart.js';
import { showBreak, showCashDialog, showEndShift } from './shift.js';
import { showCheckout } from './checkout.js';
import { showSaleComplete } from './receipt.js';

let category = 'All';
let query = '';

export function renderRegister(el) {
  el.innerHTML = `
    <div class="register">
      <div class="banner" id="banner"></div>
      <header class="topbar">
        <div class="topbar-row">
          <label class="search">
            ${icon('search')}
            <input id="search" type="search" placeholder="Search products or scan barcode..." autocomplete="off" enterkeyhint="search" aria-label="Search products or scan barcode">
          </label>
          <div class="actions" id="actions"></div>
        </div>
        <div class="status" id="status"></div>
      </header>
      <div class="register-body">
        <section class="catalog">
          <div class="tabs" role="tablist" id="tabs"></div>
          <div class="grid" id="grid"></div>
        </section>
        <aside class="cart" id="cart" aria-label="Cart"></aside>
      </div>
    </div>`;

  const tabsEl = el.querySelector('#tabs');
  const gridEl = el.querySelector('#grid');
  const searchEl = el.querySelector('#search');
  searchEl.value = query;

  function renderTabs() {
    tabsEl.innerHTML = ['All', ...categories]
      .map((c) => `<button class="tab${c === category ? ' active' : ''}" role="tab" aria-selected="${c === category}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`)
      .join('');
  }

  function visibleProducts() {
    const q = query.trim().toLowerCase();
    return products.filter((p) =>
      (category === 'All' || p.category === category) &&
      (!q || p.name.toLowerCase().includes(q) || p.barcode.includes(q)));
  }

  function renderGrid() {
    const { stock, settings } = getState();
    const list = visibleProducts();
    gridEl.innerHTML = list.length
      ? list.map((p) => {
          const low = stock[p.id] <= settings.lowStock;
          return `
            <button class="product" data-id="${p.id}" ${stock[p.id] <= 0 ? 'disabled' : ''}>
              ${low ? `<span class="badge-low">${stock[p.id] <= 0 ? 'OUT' : 'LOW'}</span>` : ''}
              <span class="product-thumb">${productArt}</span>
              <span class="product-name">${escapeHtml(p.name)}</span>
              <span class="product-price">${money(p.price)}</span>
              <span class="product-cat">${escapeHtml(p.category)}</span>
            </button>`;
        }).join('')
      : `<p class="empty">No products found.</p>`;
  }

  tabsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    category = btn.dataset.cat;
    renderTabs();
    renderGrid();
    btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  });

  searchEl.addEventListener('input', () => {
    query = searchEl.value;
    renderGrid();
  });

  // Barcode scanners type the code and press Enter: add an exact match straight to the cart.
  searchEl.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const code = searchEl.value.trim();
    const hit = products.find((p) => p.barcode === code);
    const list = visibleProducts();
    const pick = hit || (list.length === 1 ? list[0] : null);
    if (!pick) return;
    addToCart(pick.id);
    query = searchEl.value = '';
    renderGrid();
  });

  gridEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.product');
    if (btn) addToCart(btn.dataset.id);
  });

  const actionsEl = el.querySelector('#actions');
  actionsEl.innerHTML = `
    <button class="action" data-action="refresh">${icon('refresh')}Refresh</button>
    <button class="action action-outline-danger" data-action="void">${icon('void')}Void</button>
    <button class="action" data-action="break">${icon('pause')}Break</button>
    <button class="action" data-action="cashOut">${icon('cashOut')}Cash Out</button>
    <button class="action" data-action="addCash">${icon('addCash')}Add Cash</button>
    <button class="action action-danger" data-action="endShift">${icon('logout')}End Shift</button>`;

  const actionHandlers = {
    refresh() {
      category = 'All';
      query = searchEl.value = '';
      renderTabs();
      renderGrid();
      gridEl.scrollTop = 0;
    },
    async void() {
      if (!getState().cart.length) return;
      const ok = await confirmDialog({
        title: 'Void this sale?',
        message: 'All items will be removed from the cart.',
        confirmLabel: 'Void sale',
        danger: true,
      });
      if (ok) clearCart();
    },
    break: showBreak,
    cashOut: () => showCashDialog('out'),
    addCash: () => showCashDialog('in'),
    endShift: showEndShift,
  };

  actionsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (btn) actionHandlers[btn.dataset.action]();
  });

  const statusEl = el.querySelector('#status');

  function renderStatus() {
    const { stock, shift } = getState();
    const online = navigator.onLine;
    const active = products.filter((p) => stock[p.id] > 0).length;
    const started = new Date(shift.start).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    el.querySelector('#banner').innerHTML = `
      ${icon('calendar')}<strong>Shift started ${started}</strong>
      <span>Count the cash drawer before you end your shift.</span>`;
    statusEl.innerHTML = `
      <span class="status-item ${online ? 'online' : 'offline'}">${icon('wifi')}${online ? 'Online' : 'Offline'}</span>
      <span class="dot">•</span>
      <span class="status-item">${icon('clock')}Shift: <span id="shift-time" class="tabular">${duration(shiftElapsed())}</span>${shift.breakStart ? ' (on break)' : ''}</span>
      <span class="dot">•</span>
      <span class="status-item">${active} active products</span>
      <span class="dot">•</span>
      <span class="status-item">${icon('layers')}${products.length} products, ${variantCount} variants <span class="ok">✓</span></span>`;
  }

  function tick() {
    const t = statusEl.querySelector('#shift-time');
    if (t) t.textContent = duration(shiftElapsed());
  }

  renderTabs();
  renderGrid();
  renderStatus();
  const timer = setInterval(tick, 1000);
  // A break that was running when the page closed resumes its overlay.
  if (getState().shift.breakStart) showBreak();
  window.addEventListener('online', renderStatus);
  window.addEventListener('offline', renderStatus);
  const unsubs = [
    () => clearInterval(timer),
    () => window.removeEventListener('online', renderStatus),
    () => window.removeEventListener('offline', renderStatus),
    subscribe(renderStatus),
    subscribe(renderGrid),
    mountCart(el.querySelector('#cart'), { onCheckout: () => showCheckout({ onComplete: showSaleComplete }) }),
  ];
  return () => unsubs.forEach((fn) => fn());
}
