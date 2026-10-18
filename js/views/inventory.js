import { icon, productArt } from '../icons.js';
import { products, productById, categories } from '../products.js';
import { getState, subscribe, adjustStock, setStock } from '../store.js';
import { money, escapeHtml } from '../format.js';
import { openModal } from '../modal.js';

let category = 'All';
let query = '';

function showSetStock(id) {
  const p = productById[id];
  openModal({
    title: 'Set stock count',
    className: 'modal-sm',
    render(body, close) {
      body.innerHTML = `
        <form class="form" novalidate>
          <p class="modal-text">${escapeHtml(p.name)}</p>
          <label class="field">
            <span>Units on hand</span>
            <input name="count" type="text" inputmode="numeric" value="${getState().stock[id] ?? 0}" autocomplete="off" autofocus>
          </label>
          <p class="field-error" hidden>Enter a whole number, 0 or more.</p>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" data-cancel>Cancel</button>
            <button type="submit" class="btn-primary">Save</button>
          </div>
        </form>`;
      const form = body.querySelector('form');
      form.count.select();
      body.querySelector('[data-cancel]').addEventListener('click', close);
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const n = Number(form.count.value.trim());
        if (!Number.isInteger(n) || n < 0) {
          body.querySelector('.field-error').hidden = false;
          form.count.focus();
          return;
        }
        setStock(id, n);
        close();
      });
    },
  });
}

export function renderInventory(el) {
  el.innerHTML = `
    <div class="page">
      <header class="page-head">
        <h1>Inventory</h1>
        <span class="spacer"></span>
        <label class="search">
          ${icon('search')}
          <input id="inv-search" type="search" placeholder="Search products or barcode..." autocomplete="off" aria-label="Search inventory">
        </label>
      </header>
      <div class="page-body">
        <div class="stats-row" id="inv-stats"></div>
        <div class="tabs" role="tablist" id="inv-tabs"></div>
        <div class="panel">
          <table class="table inventory-table">
            <thead><tr><th>Product</th><th>Category</th><th class="num">Price</th><th class="num">Stock</th><th class="num">Adjust</th></tr></thead>
            <tbody id="inv-rows"></tbody>
          </table>
        </div>
      </div>
    </div>`;

  const searchEl = el.querySelector('#inv-search');
  const tabsEl = el.querySelector('#inv-tabs');
  const rowsEl = el.querySelector('#inv-rows');
  searchEl.value = query;

  function visible() {
    const q = query.trim().toLowerCase();
    return products.filter((p) =>
      (category === 'All' || p.category === category) &&
      (!q || p.name.toLowerCase().includes(q) || p.barcode.includes(q)));
  }

  function renderTabs() {
    tabsEl.innerHTML = ['All', ...categories]
      .map((c) => `<button class="tab${c === category ? ' active' : ''}" role="tab" aria-selected="${c === category}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`)
      .join('');
  }

  function render() {
    const { stock, settings } = getState();
    const low = products.filter((p) => stock[p.id] > 0 && stock[p.id] <= settings.lowStock).length;
    const out = products.filter((p) => stock[p.id] <= 0).length;
    const units = products.reduce((s, p) => s + (stock[p.id] ?? 0), 0);
    const value = products.reduce((s, p) => s + (stock[p.id] ?? 0) * p.price, 0);
    el.querySelector('#inv-stats').innerHTML = `
      <div class="stat-card"><div class="stat-label">Units in stock</div><div class="stat-value">${units}</div><div class="stat-sub">${products.length} products</div></div>
      <div class="stat-card"><div class="stat-label">Stock value</div><div class="stat-value">${money(value)}</div><div class="stat-sub">at selling price</div></div>
      <div class="stat-card"><div class="stat-label">Low stock</div><div class="stat-value">${low}</div><div class="stat-sub">at or below ${settings.lowStock}</div></div>
      <div class="stat-card"><div class="stat-label">Out of stock</div><div class="stat-value">${out}</div><div class="stat-sub">can't be sold</div></div>`;

    const list = visible();
    rowsEl.innerHTML = list.length
      ? list.map((p) => {
          const n = stock[p.id] ?? 0;
          const badge = n <= 0 ? '<span class="badge-inline">OUT</span>' : n <= settings.lowStock ? '<span class="badge-inline">LOW</span>' : '';
          return `
            <tr data-id="${p.id}">
              <td><div class="inv-name"><span class="product-thumb small">${productArt}</span><span><strong>${escapeHtml(p.name)}</strong><span class="list-sub">${p.barcode}</span></span></div></td>
              <td class="muted">${escapeHtml(p.category)}</td>
              <td class="num">${money(p.price)}</td>
              <td class="num"><span class="stock-count">${n}</span>${badge}</td>
              <td class="num">
                <div class="inv-adjust">
                  <div class="qty">
                    <button data-act="dec" aria-label="Remove one from stock" ${n <= 0 ? 'disabled' : ''}>${icon('minus')}</button>
                    <button data-act="inc" aria-label="Add one to stock">${icon('plus')}</button>
                  </div>
                  <button class="btn-note" data-act="set">Set</button>
                </div>
              </td>
            </tr>`;
        }).join('')
      : `<tr><td colspan="5" class="panel-empty">No products found.</td></tr>`;
  }

  tabsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    category = btn.dataset.cat;
    renderTabs();
    render();
  });

  rowsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const id = btn.closest('tr').dataset.id;
    if (btn.dataset.act === 'inc') adjustStock(id, 1);
    if (btn.dataset.act === 'dec') adjustStock(id, -1);
    if (btn.dataset.act === 'set') showSetStock(id);
  });

  searchEl.addEventListener('input', () => {
    query = searchEl.value;
    render();
  });

  renderTabs();
  render();
  return subscribe(render);
}
