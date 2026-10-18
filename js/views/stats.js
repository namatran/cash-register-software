import { icon } from '../icons.js';
import { subscribe, salesInRange } from '../store.js';
import { money, escapeHtml } from '../format.js';

const RANGES = [
  { id: 'today', label: 'Today', days: 1 },
  { id: '7d', label: '7 days', days: 7 },
  { id: '30d', label: '30 days', days: 30 },
];
let range = 'today';

// Start of the range: midnight today, or midnight (days - 1) days ago.
function rangeStart(days) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (days - 1));
  return d.getTime();
}

export function renderStats(el) {
  el.innerHTML = `
    <div class="page">
      <header class="page-head">
        <h1>Statistics</h1>
        <span class="spacer"></span>
        <div class="tabs range-tabs" role="tablist" id="range-tabs"></div>
      </header>
      <div class="page-body">
        <div class="stats-row" id="stats-cards"></div>
        <div class="panels" id="stats-panels"></div>
      </div>
    </div>`;

  const tabsEl = el.querySelector('#range-tabs');

  function render() {
    const r = RANGES.find((x) => x.id === range);
    tabsEl.innerHTML = RANGES.map((x) =>
      `<button class="tab${x.id === range ? ' active' : ''}" role="tab" aria-selected="${x.id === range}" data-range="${x.id}">${x.label}</button>`).join('');

    const sales = salesInRange(rangeStart(r.days));
    const gross = sales.reduce((t, s) => t + s.total, 0);
    const items = sales.reduce((t, s) => t + s.items.reduce((n, i) => n + i.qty, 0), 0);
    el.querySelector('#stats-cards').innerHTML = `
      <div class="stat-card"><div class="stat-label">Gross sales</div><div class="stat-value">${money(gross)}</div></div>
      <div class="stat-card"><div class="stat-label">Sales</div><div class="stat-value">${sales.length}</div></div>
      <div class="stat-card"><div class="stat-label">Average sale</div><div class="stat-value">${money(sales.length ? gross / sales.length : 0)}</div></div>
      <div class="stat-card"><div class="stat-label">Items sold</div><div class="stat-value">${items}</div></div>`;

    renderPanels(el.querySelector('#stats-panels'), sales, r);
  }

  tabsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-range]');
    if (!btn) return;
    range = btn.dataset.range;
    render();
  });

  render();
  return subscribe(render);
}

// Buckets: hours for Today (6 AM–10 PM, widened to fit any sale), days for longer ranges.
function buckets(sales, r) {
  if (r.days === 1) {
    const hours = sales.map((s) => new Date(s.at).getHours());
    const from = Math.min(6, ...hours);
    const to = Math.max(22, ...hours);
    return Array.from({ length: to - from + 1 }, (_, i) => {
      const h = from + i;
      const label = `${h % 12 || 12}${h < 12 ? 'a' : 'p'}`;
      return { label, total: sales.filter((s) => new Date(s.at).getHours() === h).reduce((t, s) => t + s.total, 0) };
    });
  }
  const start = rangeStart(r.days);
  return Array.from({ length: r.days }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const from = d.getTime();
    d.setDate(d.getDate() + 1);
    const label = new Date(from).toLocaleDateString('en-US', r.days <= 7 ? { weekday: 'short' } : { month: 'numeric', day: 'numeric' });
    return { label, total: salesInRange(from, d.getTime()).reduce((t, s) => t + s.total, 0) };
  });
}

function chartHtml(sales, r) {
  const data = buckets(sales, r);
  const max = Math.max(...data.map((b) => b.total));
  if (!max) return '<div class="panel-empty">No sales in this range yet.</div>';
  // Thin out labels on dense charts so they don't collide.
  const every = data.length > 14 ? Math.ceil(data.length / 10) : 1;
  return `
    <div class="chart" style="--bars:${data.length}">
      ${data.map((b, i) => `
        <div class="bar-col" title="${b.label}: ${money(b.total)}">
          <div class="bar-track"><div class="bar${b.total === max ? ' peak' : ''}" style="height:${(b.total / max) * 100}%"></div></div>
          <span class="bar-label">${i % every === 0 ? b.label : ''}</span>
        </div>`).join('')}
    </div>`;
}

function renderPanels(panelsEl, sales, r) {
  panelsEl.innerHTML = `
    <section class="panel wide">
      <div class="panel-head"><h2>Sales ${r.days === 1 ? 'by hour' : 'by day'}</h2><span class="stat-sub">${money(sales.reduce((t, s) => t + s.total, 0))}</span></div>
      <div class="panel-body">${chartHtml(sales, r)}</div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Top products</h2><span class="stat-sub">by revenue</span></div>
      ${topProductsHtml(sales)}
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Payment methods</h2></div>
      ${paymentsHtml(sales)}
    </section>`;
}

function topProductsHtml(sales) {
  const byName = new Map();
  sales.forEach((s) => s.items.forEach((i) => {
    const row = byName.get(i.name) || { name: i.name, qty: 0, total: 0 };
    row.qty += i.qty;
    row.total += i.qty * i.price;
    byName.set(i.name, row);
  }));
  const top = [...byName.values()].sort((a, b) => b.total - a.total).slice(0, 5);
  if (!top.length) return '<div class="panel-empty">Nothing sold yet.</div>';
  return top.map((p, i) => `
    <div class="list-row">
      <span class="list-icon rank">${i + 1}</span>
      <span class="list-text">
        <span class="list-title">${escapeHtml(p.name)}</span>
        <span class="list-sub">${p.qty} sold</span>
      </span>
      <span class="list-amount">${money(p.total)}</span>
    </div>`).join('');
}

const METHODS = [
  { id: 'cash', label: 'Cash', icon: 'cash' },
  { id: 'wallet', label: 'E-wallet', icon: 'phone' },
  { id: 'card', label: 'Card', icon: 'card' },
];

function paymentsHtml(sales) {
  const gross = sales.reduce((t, s) => t + s.total, 0);
  return `<div class="pay-split">${METHODS.map((m) => {
    const list = sales.filter((s) => s.method === m.id);
    const total = list.reduce((t, s) => t + s.total, 0);
    const pct = gross ? Math.round((total / gross) * 100) : 0;
    return `
      <div class="pay-row">
        <span class="list-icon ${m.id}">${icon(m.icon)}</span>
        <div class="pay-main">
          <div class="pay-top"><span>${m.label} <span class="list-sub">· ${list.length}</span></span><strong>${money(total)}</strong></div>
          <div class="pay-meter"><div class="pay-fill ${m.id}" style="width:${pct}%"></div></div>
        </div>
        <span class="pay-pct">${pct}%</span>
      </div>`;
  }).join('')}</div>`;
}
