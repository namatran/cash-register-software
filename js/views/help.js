import { icon } from '../icons.js';

const SECTIONS = [
  {
    title: 'Making a sale',
    icon: 'cart',
    steps: [
      'Tap products to add them to the cart, or pick a category tab first to narrow the grid.',
      'Use − and + on a cart line to change the quantity, or the trash can to remove it. Tap Note to add a request like “less sugar”.',
      'Tap Complete Sale, choose Cash, E-wallet or Card, enter the amount received, and tap Confirm Payment.',
      'The Sale Complete screen shows the change due. Tap New Sale to start the next customer, or Print receipt.',
    ],
  },
  {
    title: 'Search and barcodes',
    icon: 'search',
    steps: [
      'Type in the search bar to filter products by name or barcode.',
      'A barcode scanner types the code and presses Enter, which adds the matching product to the cart straight away.',
      'If only one product matches your search, pressing Enter adds it too.',
    ],
  },
  {
    title: 'Parking and voiding',
    icon: 'archive',
    steps: [
      'Park sets the current cart aside so you can serve someone else. Open Parked to bring it back.',
      'Void clears the whole cart after you confirm.',
    ],
  },
  {
    title: 'Shifts and the cash drawer',
    icon: 'clock',
    steps: [
      'Break pauses the shift timer until you tap Resume shift.',
      'Add Cash records money put into the drawer, such as the starting float. Cash Out records money taken out.',
      'End Shift shows the shift summary, including how much cash should be in the drawer, then starts a new shift.',
      'The Money page shows the drawer log and today’s sales. Tap a sale to reopen or reprint its receipt.',
    ],
  },
  {
    title: 'Stock',
    icon: 'box',
    steps: [
      'Each sale lowers stock automatically. Products at or below the low-stock level show a LOW badge.',
      'On the Inventory page, use − and + for small changes or Set to enter an exact count after restocking.',
      'Change the low-stock level in Settings.',
    ],
  },
];

const SHORTCUTS = [
  ['0–9 and .', 'Enter the amount received'],
  ['Backspace', 'Delete the last digit'],
  ['Enter', 'Confirm payment'],
  ['Esc', 'Close a dialog'],
];

export function renderHelp(el) {
  el.innerHTML = `
    <div class="page">
      <header class="page-head"><h1>Help</h1></header>
      <div class="page-body">
        <div class="panels help">
          ${SECTIONS.map((s) => `
            <section class="panel">
              <div class="panel-head"><h2 class="help-title"><span class="list-icon">${icon(s.icon)}</span>${s.title}</h2></div>
              <ol class="help-steps">${s.steps.map((t) => `<li>${t}</li>`).join('')}</ol>
            </section>`).join('')}
          <section class="panel">
            <div class="panel-head"><h2 class="help-title"><span class="list-icon">${icon('money')}</span>Keypad shortcuts</h2><span class="stat-sub">in Complete Sale</span></div>
            ${SHORTCUTS.map(([k, d]) => `<div class="list-row"><kbd>${k}</kbd><span class="list-text"><span class="list-sub">${d}</span></span></div>`).join('')}
          </section>
        </div>
        <p class="help-foot">Everything is saved on this device only. To clear it, go to Settings → Data.</p>
      </div>
    </div>`;
}
