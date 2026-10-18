import { icon } from '../icons.js';
import { openModal } from '../modal.js';
import { cartTotals, nextReceiptNo, completeSale } from '../store.js';
import { money, currencySymbol, receiptNo } from '../format.js';
import { brand } from '../config/brand.js';

const METHODS = [
  { id: 'cash', label: 'Cash', icon: 'cash' },
  { id: 'wallet', label: 'E-wallet', icon: 'phone' },
  { id: 'card', label: 'Card', icon: 'card' },
];
const BILLS = brand.currency.bills;
const TOP = BILLS[BILLS.length - 1];

// The two smallest bills that cover the total, e.g. 45 → 50, 100.
function quickAmounts(total) {
  const bills = BILLS.filter((b) => b > total).slice(0, 2);
  if (bills.length < 2) {
    const base = Math.ceil(total / TOP) * TOP;
    while (bills.length < 2) bills.push(base + bills.length * TOP + (base === total ? TOP : 0));
  }
  return bills;
}

export function showCheckout({ onComplete }) {
  const { subtotal, total } = cartTotals();
  if (!total) return;
  let method = 'cash';
  let entry = ''; // keypad string, e.g. "1000" or "12.5"

  openModal({
    className: 'checkout',
    render(body, close) {
      body.innerHTML = `
        <div class="checkout-grid">
          <section class="checkout-left">
            <h2 class="checkout-title">Complete Sale</h2>
            <div class="label">Payment Method</div>
            <div class="methods">
              ${METHODS.map((m) => `<button class="method method-${m.id}" data-method="${m.id}" aria-pressed="false">${icon(m.icon)}<span>${m.label}</span></button>`).join('')}
            </div>
            <div class="checkout-sum">
              <div class="row muted"><span>Subtotal</span><span>${money(subtotal)}</span></div>
              <div class="row total"><span>Total</span><span>${money(total)}</span></div>
              <div class="row muted"><span>Tendered</span><span id="co-tendered"></span></div>
              <div class="row change"><span>Change</span><span id="co-change"></span></div>
            </div>
          </section>
          <section class="checkout-right">
            <div class="receipt-no">${receiptNo(nextReceiptNo())}</div>
            <div class="display" id="co-display" aria-live="polite"></div>
            <div class="quick">
              <button data-quick="exact">Exact</button>
              ${quickAmounts(total).map((a) => `<button data-quick="${a}">${money(a)}</button>`).join('')}
            </div>
            <div class="keypad">
              ${['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0'].map((k) => `<button data-key="${k}">${k}</button>`).join('')}
              <button data-key="back" aria-label="Backspace">${icon('backspace')}</button>
              <button class="key-clear" data-key="clear">Clear</button>
            </div>
            <button class="btn-primary btn-xl" id="co-confirm">Confirm Payment</button>
          </section>
        </div>
        <button class="modal-close checkout-close" aria-label="Close">${icon('close')}</button>`;

      const $ = (s) => body.querySelector(s);
      const tendered = () => (entry === '' ? 0 : parseFloat(entry) || 0);

      function update() {
        body.querySelectorAll('.method').forEach((b) => {
          const on = b.dataset.method === method;
          b.classList.toggle('selected', on);
          b.setAttribute('aria-pressed', on);
        });
        const t = tendered();
        $('#co-display').textContent = `${currencySymbol}${entry || '0'}`;
        $('#co-tendered').textContent = money(t);
        $('#co-change').textContent = money(Math.max(0, t - total));
        $('#co-confirm').disabled = t < total;
      }

      function press(key) {
        if (key === 'clear') entry = '';
        else if (key === 'back') entry = entry.slice(0, -1);
        else if (key === '.') { if (!entry.includes('.')) entry = (entry || '0') + '.'; }
        else {
          const [, dec = null] = entry.split('.');
          if (dec !== null && dec.length >= 2) return;
          if (entry.replace('.', '').length >= 8) return;
          entry = entry === '0' ? key : entry + key;
        }
        update();
      }

      body.addEventListener('click', (e) => {
        const t = e.target.closest('button');
        if (!t) return;
        if (t.dataset.method) {
          method = t.dataset.method;
          if (method !== 'cash') entry = String(total);
        } else if (t.dataset.quick) {
          entry = String(t.dataset.quick === 'exact' ? total : t.dataset.quick);
        } else if (t.dataset.key) {
          return press(t.dataset.key);
        } else if (t.id === 'co-confirm') {
          const sale = completeSale({ method, tendered: tendered() });
          close();
          onComplete(sale);
          return;
        } else if (t.classList.contains('checkout-close')) {
          return close();
        }
        update();
      });

      // Physical keyboard / USB keypad support.
      body.addEventListener('keydown', (e) => {
        if (/^[0-9.]$/.test(e.key)) press(e.key);
        else if (e.key === 'Backspace') press('back');
        else if (e.key === 'Enter' && e.target.tagName !== 'BUTTON' && !$('#co-confirm').disabled) $('#co-confirm').click();
        else return;
        e.preventDefault();
      });

      update();
    },
  });
}
