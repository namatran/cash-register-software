import { icon } from './icons.js';
import { brand } from './config/brand.js';
import { renderRegister } from './views/register.js';
import { renderInventory } from './views/inventory.js';
import { renderMoney } from './views/money.js';
import { renderStats } from './views/stats.js';
import { renderSettings } from './views/settings.js';
import { renderHelp } from './views/help.js';

const routes = [
  { path: 'register', label: 'Register', icon: 'cart', group: 'main' },
  { path: 'inventory', label: 'Inventory', icon: 'box', group: 'main' },
  { path: 'money', label: 'Money', icon: 'money', group: 'main' },
  { path: 'stats', label: 'Statistics', icon: 'chart', group: 'main' },
  { path: 'settings', label: 'Settings', icon: 'settings', group: 'bottom' },
  { path: 'help', label: 'Help', icon: 'help', group: 'bottom' },
];

// Each view is render(el, route) and may return a cleanup function.
const views = {
  register: renderRegister,
  inventory: renderInventory,
  money: renderMoney,
  stats: renderStats,
  settings: renderSettings,
  help: renderHelp,
};
let cleanup = null;

function renderNav() {
  const link = (r) =>
    `<a href="#/${r.path}" class="nav-item" data-path="${r.path}" title="${r.label}" aria-label="${r.label}">${icon(r.icon)}</a>`;
  document.getElementById('nav-main').innerHTML = routes.filter((r) => r.group === 'main').map(link).join('');
  document.getElementById('nav-bottom').innerHTML = routes.filter((r) => r.group === 'bottom').map(link).join('');
}

function currentPath() {
  const path = location.hash.replace(/^#\/?/, '');
  return routes.some((r) => r.path === path) ? path : 'register';
}

function route() {
  const path = currentPath();
  document.querySelectorAll('.nav-item').forEach((a) => {
    a.classList.toggle('active', a.dataset.path === path);
    if (a.dataset.path === path) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  if (cleanup) cleanup();
  const el = document.getElementById('view');
  const render = views[path];
  const info = routes.find((r) => r.path === path);
  el.innerHTML = '';
  cleanup = render ? render(el, info) : null;
}

function renderBrand() {
  document.title = `${brand.storeName} Cash Register`;
  document.querySelector('meta[name="description"]').content = brand.tagline;
  const logo = document.getElementById('logo');
  logo.textContent = brand.logoText;
  logo.setAttribute('aria-label', brand.storeName);
}

renderBrand();
renderNav();
window.addEventListener('hashchange', route);
route();
