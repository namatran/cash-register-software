# Mirevo POS

A fictional tablet cash register for a made-up café called Mirevo. It's built as a reusable
template in plain HTML, CSS and JavaScript, with no build step and no dependencies.
Everything is saved in the browser's `localStorage`, and nothing leaves the browser.

Pages: Register (product grid, cart, checkout, receipt), Inventory, Money, Statistics, Settings and Help.

> Fictional demo. Not a real business. Every product, price and name is invented.

## How to run it

```sh
cd ~/Dev/pos-template
python3 -m http.server 8124
```

Then open <http://localhost:8124>. You need to serve it over http because ES modules don't load
from `file://`. Any free port works.

- **Reset data:** go to **Settings → Data**.
- **A change doesn't show up after reloading:** do a hard reload (Cmd+Shift+R).

## Where things live

| Path | What it does |
| --- | --- |
| `index.html` | App shell: sidebar, main view, modal root, demo notice |
| `js/config/brand.js` | **Every brand-specific value**: name, tagline, currency, receipt prefix, storage key, categories |
| `css/styles.css` | All styles. Design tokens are at the top; print and reduced-motion rules are near the end |
| `js/app.js` | Applies the brand to the shell; sidebar nav and the hash router (`#/register`, `#/inventory`, …) |
| `js/store.js` | App state and actions: cart, parked carts, sales, stock, shift, cash log, settings |
| `js/products.js` | Seed catalog. `base` marks a size variant; `LOW_STOCK` is the default low-stock level |
| `js/format.js` | `money()`, receipt numbers, dates and durations |
| `js/icons.js` | Inline SVG icons |
| `js/modal.js` | `openModal` and `confirmDialog` |
| `js/views/register.js` | Register: banner, search, toolbar, status line, category tabs, product grid |
| `js/views/cart.js` | Cart panel: quantity, notes, Park, parked carts |
| `js/views/checkout.js` | Complete Sale dialog: payment method and keypad |
| `js/views/receipt.js` | Sale Complete screen, receipt and reprint |
| `js/views/shift.js` | Break, Add Cash, Cash Out and End Shift dialogs |
| `js/views/inventory.js`, `money.js`, `stats.js`, `settings.js`, `help.js` | The other sidebar pages |
| `docs/DESIGN-SYSTEM.md` | Tokens, type scale, components, screens and motion |

## How to re-brand it

1. Edit `js/config/brand.js`:
   - `storeName` and `logoText` set the sidebar logo, page title and receipt header.
   - `tagline` sets the meta description.
   - `receiptFooter` is the default last line on receipts.
   - `receiptPrefix` goes before receipt numbers (`#00028`).
   - `storageKey` is the `localStorage` key. Give each brand its own key so their data doesn't mix.
   - `currency.symbol` and `currency.locale` control how money is formatted.
   - `currency.bills` sets the quick amounts at checkout.
   - `categories` are the category tabs, in order.
2. Edit `js/products.js` to change the catalog. Products take their categories from `brand.categories`
   by position.
3. For a new look, edit the tokens at the top of `css/styles.css`.

Store name, cashier, receipt footer and the low-stock level can also be changed in the app, on the Settings page.

## Handoff prompt

> I'm working on a fictional tablet cash register template in `~/Dev/pos-template` (plain HTML/CSS/JS,
> ES modules, no build step, data in `localStorage`). Read `README.md` and `docs/DESIGN-SYSTEM.md`
> first. To run it: `python3 -m http.server 8124`. Brand values live in `js/config/brand.js`; design
> tokens are at the top of `css/styles.css`. Build new pages from the shared page components
> (`.page-head`, `.stat-card`, `.panel`, `.table`, `.list-row`). Next step: [describe the change].
> Commit in small Conventional Commits and never push.
