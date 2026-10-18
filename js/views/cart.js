import { icon } from '../icons.js';
import { getState, subscribe, cartLines, cartTotals, setQty, setNote, removeLine, parkCart, restoreParked } from '../store.js';
import { money, escapeHtml } from '../format.js';
import { openModal } from '../modal.js';
import { productById } from '../products.js';

function showParked() {
  openModal({
    title: 'Parked carts',
    className: 'modal-sm',
    render(body, close) {
      const { parked } = getState();
      body.innerHTML = `<div class="parked-list">${parked.map((p, i) => {
        const { total, count } = cartTotals(p.items);
        const names = p.items.map((l) => productById[l.id]?.name).filter(Boolean).join(', ');
        const time = new Date(p.at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        return `
          <button class="parked-item" data-i="${i}">
            <span class="parked-top"><strong>${count} item${count === 1 ? '' : 's'} · ${money(total)}</strong><span>${time}</span></span>
            <span class="parked-names">${escapeHtml(names)}</span>
          </button>`;
      }).join('')}</div>`;
      body.addEventListener('click', (e) => {
        const btn = e.target.closest('.parked-item');
        if (!btn) return;
        restoreParked(Number(btn.dataset.i));
        close();
      });
    },
  });
}

// Renders the cart panel into `el`. Returns a cleanup function.
export function mountCart(el, { onCheckout }) {
  const openNotes = new Set();
  let prevQty = null; // id -> qty from the last render, to animate what changed

  el.innerHTML = `
    <div class="cart-head">
      <h2>Cart</h2>
      <div class="cart-meta">
        <span id="cart-count"></span>
        <span class="cart-tools" id="cart-tools"></span>
      </div>
    </div>
    <div class="cart-lines" id="cart-lines"></div>
    <div class="cart-foot">
      <div class="row muted"><span>Subtotal</span><span id="cart-subtotal"></span></div>
      <div class="row total"><span>Total</span><span id="cart-total"></span></div>
      <button class="btn-primary btn-xl" id="checkout">Complete Sale</button>
    </div>`;

  const linesEl = el.querySelector('#cart-lines');
  const checkoutBtn = el.querySelector('#checkout');

  function render() {
    const lines = cartLines();
    const { subtotal, total, count } = cartTotals();
    el.querySelector('#cart-count').textContent = `${count} item${count === 1 ? '' : 's'}`;
    el.querySelector('#cart-subtotal').textContent = money(subtotal);
    el.querySelector('#cart-total').textContent = money(total);
    checkoutBtn.disabled = !lines.length;

    const parkedCount = getState().parked.length;
    el.querySelector('#cart-tools').innerHTML = `
      ${parkedCount ? `<button class="btn-link" data-tool="parked">Parked (${parkedCount})</button>` : ''}
      <button class="btn-link" data-tool="park" ${lines.length ? '' : 'disabled'}>${icon('archive')}Park</button>`;

    linesEl.innerHTML = lines.length
      ? lines.map((l) => `
          <article class="line${prevQty && !prevQty.has(l.id) ? ' enter' : ''}" data-id="${l.id}">
            <div class="line-top">
              <span class="line-name">${escapeHtml(l.product.name)}</span>
              <span class="line-total">${money(l.total)}</span>
            </div>
            <div class="line-unit">${money(l.product.price)} × ${l.qty}</div>
            ${l.note && !openNotes.has(l.id) ? `<div class="line-note">${escapeHtml(l.note)}</div>` : ''}
            ${openNotes.has(l.id) ? `<textarea class="note-input" rows="2" placeholder="Add a note (e.g. less sugar)">${escapeHtml(l.note)}</textarea>` : ''}
            <div class="line-controls">
              <button class="btn-note${l.note ? ' has-note' : ''}" data-act="note">${icon('note')}Note</button>
              <div class="qty">
                <button data-act="dec" aria-label="Decrease quantity">${icon('minus')}</button>
                <span class="qty-value${prevQty?.has(l.id) && prevQty.get(l.id) !== l.qty ? ' tick' : ''}">${l.qty}</span>
                <button data-act="inc" aria-label="Increase quantity">${icon('plus')}</button>
              </div>
              <button class="btn-trash" data-act="remove" aria-label="Remove ${escapeHtml(l.product.name)}">${icon('trash')}</button>
            </div>
          </article>`).join('')
      : `<div class="cart-empty">${icon('cart')}<p>Cart is empty</p><span>Tap a product to add it.</span></div>`;

    linesEl.querySelector('.enter')?.scrollIntoView({ block: 'nearest' });
    prevQty = new Map(lines.map((l) => [l.id, l.qty]));
  }

  linesEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const id = btn.closest('.line').dataset.id;
    const line = getState().cart.find((l) => l.id === id);
    switch (btn.dataset.act) {
      case 'inc': setQty(id, line.qty + 1); break;
      case 'dec': setQty(id, line.qty - 1); break;
      case 'remove': openNotes.delete(id); removeLine(id); break;
      case 'note':
        if (openNotes.has(id)) openNotes.delete(id); else openNotes.add(id);
        render();
        linesEl.querySelector(`[data-id="${id}"] .note-input`)?.focus();
        break;
    }
  });

  // Save on change (blur) rather than every keystroke so re-rendering doesn't steal focus.
  linesEl.addEventListener('change', (e) => {
    if (!e.target.matches('.note-input')) return;
    setNote(e.target.closest('.line').dataset.id, e.target.value.trim());
  });

  el.querySelector('#cart-tools').addEventListener('click', (e) => {
    const tool = e.target.closest('[data-tool]')?.dataset.tool;
    if (tool === 'park') { openNotes.clear(); parkCart(); }
    if (tool === 'parked') showParked();
  });

  checkoutBtn.addEventListener('click', () => onCheckout());

  render();
  return subscribe(render);
}
