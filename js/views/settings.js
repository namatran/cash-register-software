import { icon } from '../icons.js';
import { getState, updateSettings, resetSales, resetAll } from '../store.js';
import { escapeHtml } from '../format.js';
import { confirmDialog } from '../modal.js';

export function renderSettings(el) {
  const s = getState().settings;
  el.innerHTML = `
    <div class="page">
      <header class="page-head"><h1>Settings</h1></header>
      <div class="page-body settings">
        <section class="panel">
          <div class="panel-head"><h2>Store and receipt</h2><span class="stat-sub saved-note" id="saved" hidden>${icon('check')}Saved</span></div>
          <form class="form panel-body" id="settings-form" novalidate>
            <label class="field">
              <span>Store name</span>
              <input name="storeName" type="text" value="${escapeHtml(s.storeName)}" maxlength="40" autocomplete="off" required>
            </label>
            <label class="field">
              <span>Cashier name</span>
              <input name="cashier" type="text" value="${escapeHtml(s.cashier)}" maxlength="30" autocomplete="off" required>
            </label>
            <label class="field">
              <span>Receipt footer line</span>
              <input name="receiptFooter" type="text" value="${escapeHtml(s.receiptFooter)}" maxlength="60" autocomplete="off">
            </label>
            <label class="field">
              <span>Low-stock warning at</span>
              <input name="lowStock" type="text" inputmode="numeric" value="${s.lowStock}" autocomplete="off">
            </label>
            <p class="field-error" hidden></p>
            <div class="modal-actions">
              <button type="submit" class="btn-primary">Save changes</button>
            </div>
          </form>
        </section>
        <section class="panel danger-zone">
          <div class="panel-head"><h2>Data</h2><span class="stat-sub">Stored on this device only</span></div>
          <div class="list-row">
            <span class="list-text">
              <span class="list-title">Reset sales and shift</span>
              <span class="list-sub">Clears sales, carts and the cash log. Keeps settings, stock and receipt numbers.</span>
            </span>
            <button class="btn-secondary" data-reset="sales">Reset</button>
          </div>
          <div class="list-row">
            <span class="list-text">
              <span class="list-title">Reset everything</span>
              <span class="list-sub">Restores the app to its first-run state, including stock and settings.</span>
            </span>
            <button class="btn-danger" data-reset="all">Reset all</button>
          </div>
        </section>
      </div>
    </div>`;

  const form = el.querySelector('#settings-form');
  const errorEl = form.querySelector('.field-error');
  const savedEl = el.querySelector('#saved');

  form.addEventListener('input', () => { savedEl.hidden = true; });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const storeName = form.storeName.value.trim();
    const cashier = form.cashier.value.trim();
    const lowStock = Number(form.lowStock.value.trim());
    let error = '';
    if (!storeName) error = 'Store name can’t be empty.';
    else if (!cashier) error = 'Cashier name can’t be empty.';
    else if (!Number.isInteger(lowStock) || lowStock < 0) error = 'Low-stock warning must be a whole number, 0 or more.';
    errorEl.textContent = error;
    errorEl.hidden = !error;
    if (error) return;
    updateSettings({ storeName, cashier, receiptFooter: form.receiptFooter.value.trim(), lowStock });
    savedEl.hidden = false;
  });

  el.querySelector('.danger-zone').addEventListener('click', async (e) => {
    const kind = e.target.closest('[data-reset]')?.dataset.reset;
    if (!kind) return;
    const all = kind === 'all';
    const ok = await confirmDialog({
      title: all ? 'Reset everything?' : 'Reset sales and shift?',
      message: all
        ? 'All sales, stock counts and settings on this device will be erased. This can’t be undone.'
        : 'All sales, parked carts and the cash log on this device will be erased. This can’t be undone.',
      confirmLabel: all ? 'Reset everything' : 'Reset sales',
      danger: true,
    });
    if (!ok) return;
    if (all) {
      resetAll();
      renderSettings(el); // refill the form with defaults
    } else {
      resetSales();
    }
  });
}
