import { icon } from '../icons.js';
import { getState, subscribe, shiftSummary, salesInRange } from '../store.js';
import { money, escapeHtml, receiptNo } from '../format.js';
import { showCashDialog } from './shift.js';
import { showReceipt } from './receipt.js';

const METHOD_ICON = { cash: 'cash', wallet: 'phone', card: 'card' };

const time = (ms) => new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

export function renderMoney(el) {
  el.innerHTML = `
    <div class="page">
      <header class="page-head">
        <h1>Money</h1>
        <span class="spacer"></span>
        <button class="action" data-cash="out">${icon('cashOut')}Cash Out</button>
        <button class="action" data-cash="in">${icon('addCash')}Add Cash</button>
      </header>
      <div class="page-body">
        <div class="stats-row" id="money-stats"></div>
        <div class="panels" id="money-panels">
          <section class="panel">
            <div class="panel-head"><h2>Cash drawer log</h2><span class="stat-sub">This shift</span></div>
            <div id="cash-log"></div>
          </section>
          <section class="panel">
            <div class="panel-head"><h2>Today's sales</h2><span class="stat-sub" id="sales-total"></span></div>
            <div id="sales-list"></div>
          </section>
        </div>
      </div>
    </div>`;

  el.querySelector('.page-head').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cash]');
    if (btn) showCashDialog(btn.dataset.cash);
  });

  function render() {
    const s = shiftSummary();
    const expected = s.cash + s.cashIn - s.cashOut;
    el.querySelector('#money-stats').innerHTML = `
      <div class="stat-card"><div class="stat-label">Expected in drawer</div><div class="stat-value">${money(expected)}</div><div class="stat-sub">cash sales + added − out</div></div>
      <div class="stat-card"><div class="stat-label">Cash sales</div><div class="stat-value">${money(s.cash)}</div><div class="stat-sub">${s.count} sale${s.count === 1 ? '' : 's'} this shift</div></div>
      <div class="stat-card"><div class="stat-label">Cash added</div><div class="stat-value positive">${money(s.cashIn)}</div><div class="stat-sub">floats and top-ups</div></div>
      <div class="stat-card"><div class="stat-label">Cash out</div><div class="stat-value">${money(s.cashOut)}</div><div class="stat-sub">payouts and expenses</div></div>`;

    const log = [...getState().shift.cashLog].reverse();
    el.querySelector('#cash-log').innerHTML = log.length
      ? log.map((c) => `
          <div class="list-row">
            <span class="list-icon ${c.type === 'in' ? 'cash' : 'danger'}">${icon(c.type === 'in' ? 'addCash' : 'cashOut')}</span>
            <span class="list-text">
              <span class="list-title">${escapeHtml(c.reason || (c.type === 'in' ? 'Cash added' : 'Cash out'))}</span>
              <span class="list-sub">${time(c.at)}</span>
            </span>
            <span class="list-amount ${c.type === 'in' ? 'positive' : 'negative'}">${c.type === 'in' ? '+' : '−'}${money(c.amount)}</span>
          </div>`).join('')
      : '<div class="panel-empty">No cash added or taken out this shift.</div>';

    const midnight = new Date().setHours(0, 0, 0, 0);
    const sales = salesInRange(midnight).reverse();
    el.querySelector('#sales-total').textContent = `${sales.length} · ${money(sales.reduce((t, s) => t + s.total, 0))}`;
    el.querySelector('#sales-list').innerHTML = sales.length
      ? sales.map((s) => {
          const items = s.items.reduce((n, i) => n + i.qty, 0);
          return `
            <button class="list-row" data-no="${s.no}">
              <span class="list-icon ${s.method}">${icon(METHOD_ICON[s.method])}</span>
              <span class="list-text">
                <span class="list-title">${receiptNo(s.no)} · ${items} item${items === 1 ? '' : 's'}</span>
                <span class="list-sub">${time(s.at)} · ${s.method === 'wallet' ? 'E-wallet' : s.method[0].toUpperCase() + s.method.slice(1)}</span>
              </span>
              <span class="list-amount">${money(s.total)}</span>
            </button>`;
        }).join('')
      : '<div class="panel-empty">No sales yet today.</div>';
  }

  el.querySelector('#sales-list').addEventListener('click', (e) => {
    const row = e.target.closest('[data-no]');
    if (!row) return;
    const sale = getState().sales.find((s) => s.no === Number(row.dataset.no));
    if (sale) showReceipt(sale);
  });

  render();
  return subscribe(render);
}
