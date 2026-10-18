import { icon } from '../icons.js';
import { openModal } from '../modal.js';
import { money, receiptNo, dateTime, escapeHtml } from '../format.js';
import { getState } from '../store.js';

const METHOD_LABEL = { cash: 'CASH', wallet: 'E-WALLET', card: 'CARD' };

export function receiptHtml(sale) {
  // Sales keep the store name and footer they were rung up with; older ones fall back to settings.
  const { settings } = getState();
  const store = escapeHtml(sale.store ?? settings.storeName);
  const footer = sale.footer ?? settings.receiptFooter;
  const items = sale.items.map((i) => `
    <div class="r-item">
      <div class="r-line"><span>${escapeHtml(i.name)}</span><span>${money(i.price * i.qty)}</span></div>
      <div class="r-sub">${i.qty} × ${money(i.price)}</div>
      ${i.note ? `<div class="r-sub">“${escapeHtml(i.note)}”</div>` : ''}
    </div>`).join('');

  return `
    <div class="receipt" id="receipt">
      <div class="r-logo">${store.split(' ')[0]}</div>
      <div class="r-store">${store}</div>
      <div class="r-thanks">Thank you for your purchase!</div>
      <div class="r-meta">
        <div class="r-line"><span>${dateTime(sale.at)}</span><span>${receiptNo(sale.no)}</span></div>
        <div class="r-sub">Cashier: ${escapeHtml(sale.cashier)}</div>
      </div>
      <hr>
      ${items}
      <hr>
      <div class="r-line r-muted"><span>Subtotal</span><span>${money(sale.subtotal)}</span></div>
      <div class="r-line r-total"><span>TOTAL</span><span>${money(sale.total)}</span></div>
      <hr>
      <div class="r-line r-muted"><span>Payment (${METHOD_LABEL[sale.method]})</span><span>${money(sale.tendered)}</span></div>
      <div class="r-line r-muted"><span>Change</span><span>${money(sale.change)}</span></div>
      <hr>
      <div class="r-foot">${store}</div>
      ${footer ? `<div class="r-foot r-small">${escapeHtml(footer)}</div>` : ''}
    </div>`;
}

// Reopens a past receipt, with a Print button. Reuses the Sale Complete print styles.
export function showReceipt(sale) {
  openModal({
    className: 'sale-complete reprint',
    render(body, close) {
      body.innerHTML = `
        <div class="sc-title reprint-head">
          <h2>Receipt ${receiptNo(sale.no)}</h2>
          <span class="spacer"></span>
          <button class="btn-link sc-print">${icon('printer')}Print</button>
          <button class="modal-close" aria-label="Close">${icon('close')}</button>
        </div>
        <div class="sc-grid"><section class="sc-right">${receiptHtml(sale)}</section></div>`;
      body.querySelector('.sc-print').addEventListener('click', () => window.print());
      body.querySelector('.modal-close').addEventListener('click', close);
    },
  });
}

export function showSaleComplete(sale) {
  openModal({
    className: 'sale-complete',
    render(body, close) {
      body.innerHTML = `
        <h2 class="sc-title">Sale Complete</h2>
        <div class="sc-grid">
          <section class="sc-left">
            <div class="sc-check">${icon('check')}</div>
            <div class="sc-status">Paid · ${METHOD_LABEL[sale.method]}</div>
            <div class="sc-total">${money(sale.total)}</div>
            <div class="sc-change">Change: ${money(sale.change)}</div>
            <button class="btn-primary sc-new" autofocus>New Sale</button>
            <button class="btn-link sc-print">${icon('printer')}Print receipt</button>
          </section>
          <section class="sc-right">${receiptHtml(sale)}</section>
        </div>`;
      body.querySelector('.sc-new').addEventListener('click', close);
      body.querySelector('.sc-print').addEventListener('click', () => window.print());
    },
  });
}
