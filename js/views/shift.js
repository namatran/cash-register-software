import { icon } from '../icons.js';
import { openModal } from '../modal.js';
import { getState, startBreak, endBreak, logCash, shiftSummary, endShift } from '../store.js';
import { money, currencySymbol, duration } from '../format.js';

export function showBreak() {
  if (document.querySelector('.break-modal')) return;
  startBreak();
  openModal({
    className: 'modal-sm break-modal',
    dismissible: false,
    render(body, close) {
      body.innerHTML = `
        <div class="break-icon">${icon('pause')}</div>
        <h2>On break</h2>
        <p class="muted">The shift timer is paused.</p>
        <div class="break-time tabular" id="break-time">0h 0m 0s</div>
        <button class="btn-primary btn-xl" autofocus>Resume shift</button>`;
      const timeEl = body.querySelector('#break-time');
      const update = () => { timeEl.textContent = duration(Date.now() - getState().shift.breakStart); };
      update();
      const timer = setInterval(update, 1000);
      body.querySelector('button').addEventListener('click', () => {
        clearInterval(timer);
        endBreak();
        close();
      });
    },
  });
}

export function showCashDialog(type) {
  const isIn = type === 'in';
  openModal({
    title: isIn ? 'Add Cash' : 'Cash Out',
    className: 'modal-sm',
    render(body, close) {
      body.innerHTML = `
        <form class="form" novalidate>
          <label class="field">
            <span>Amount</span>
            <div class="money-input"><span>${currencySymbol}</span><input name="amount" type="text" inputmode="decimal" placeholder="0.00" autocomplete="off" autofocus></div>
          </label>
          <label class="field">
            <span>Reason</span>
            <input name="reason" type="text" placeholder="${isIn ? 'e.g. Starting float' : 'e.g. Bought ice'}" autocomplete="off">
          </label>
          <p class="field-error" hidden>Enter an amount greater than zero.</p>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" data-cancel>Cancel</button>
            <button type="submit" class="btn-primary">${isIn ? 'Add Cash' : 'Cash Out'}</button>
          </div>
        </form>`;
      const form = body.querySelector('form');
      body.querySelector('[data-cancel]').addEventListener('click', close);
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = Math.round(parseFloat(form.amount.value.replace(/[^\d.]/g, '')) * 100) / 100;
        if (!(amount > 0)) {
          body.querySelector('.field-error').hidden = false;
          form.amount.focus();
          return;
        }
        logCash(type, amount, form.reason.value.trim());
        close();
      });
    },
  });
}

export function showEndShift() {
  const s = shiftSummary();
  openModal({
    title: 'End Shift',
    className: 'modal-sm',
    render(body, close) {
      const row = (label, value, cls = '') => `<div class="summary-row ${cls}"><span>${label}</span><span>${value}</span></div>`;
      body.innerHTML = `
        <div class="summary">
          ${row('Shift length', duration(s.elapsed))}
          ${row('Sales', s.count)}
          ${row('Cash sales', money(s.cash))}
          ${row('E-wallet sales', money(s.wallet))}
          ${row('Card sales', money(s.card))}
          ${row('Cash added', money(s.cashIn))}
          ${row('Cash out', `−${money(s.cashOut)}`)}
          ${row('Gross sales', money(s.gross), 'strong')}
          ${row('Expected cash in drawer', money(s.cash + s.cashIn - s.cashOut), 'strong')}
        </div>
        ${getState().cart.length ? '<p class="field-error">The current cart is still open. It stays in the cart for the next shift.</p>' : ''}
        <div class="modal-actions">
          <button class="btn-secondary" data-cancel>Cancel</button>
          <button class="btn-danger" data-end>${icon('logout')}End Shift</button>
        </div>`;
      body.querySelector('[data-cancel]').addEventListener('click', close);
      body.querySelector('[data-end]').addEventListener('click', () => {
        endShift();
        close();
      });
    },
  });
}
