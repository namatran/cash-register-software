# Mirevo Cash Register design system

This file describes the system as it is in the code. The tokens live at the top of `css/styles.css`;
everything else in that file is built from them.

## Principles
- **Made for tablets.** The layout targets 1024–1200px landscape. The primary actions are 44–56px tall and
  pressed buttons scale down a little.
- **Calm surfaces.** Off-white canvas, white cards, hairline borders, almost no shadow. Color is used
  only to signal state: success, info, warning, danger or low stock.
- **Tabular numbers.** Every amount uses `font-variant-numeric: tabular-nums` so columns of
  numbers line up.

## Tokens

### Color
| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#f7f7f8` | App canvas |
| `--surface` | `#ffffff` | Cards, sidebar, bars, modals |
| `--surface-2` | `#f3f4f6` | Hover fills, thumbnails, keypad display |
| `--border` | `#e7e7ea` | Hairlines |
| `--border-strong` | `#d9d9de` | Secondary button borders |
| `--text` | `#111827` | Primary text |
| `--text-2` | `#374151` | Body text, field labels |
| `--muted` | `#6b7280` | Secondary text, idle nav icons |
| `--faint` | `#9ca3af` | Captions, receipt footer |
| `--primary` / `--primary-hover` | `#1f2340` / `#2a2f55` | Primary buttons, active tab, chart bars |
| `--danger` / `--danger-soft` | `#e5484d` / `#fdecec` | End Shift, Void, delete, reset |
| `--success` / `--success-soft` | `#2f9e5b` / `#e8f6ee` | Cash tile, change due, Sale Complete check |
| `--info` / `--info-soft` | `#2b6fd6` / `#e8f0fd` | E-wallet tile, focus ring |
| `--warn` / `--warn-soft` | `#d9792b` / `#fdf0e6` | Card tile |
| `--low-bg` / `--low-text` | `#fff4dc` / `#d97706` | LOW / OUT stock badges |
| `--banner-bg` / `--banner-text` | `#ecf8ef` / `#1f7a44` | Shift banner |

The three payment methods each use one pair: Cash uses success, E-wallet uses info and Card uses warn. That pairing is the same
on the checkout tiles, the Money list icons and the Statistics payment bars.

### Shape and depth
| Token | Value | Use |
| --- | --- | --- |
| `--radius-sm` | 8px | Nav items, logo tile, small icon boxes |
| `--radius` | 12px | Cards, panels, method tiles |
| `--radius-lg` | 16px | Modals |
| (literal) 10px | | Buttons, actions, keypad keys |
| (literal) 999px | | Pills: tabs, range switch |
| `--shadow-sm`, `--shadow` | very soft | Cards at rest |
| `--shadow-lg` | `0 24px 48px -12px` | Modals only |

### Layout
| Token | Value |
| --- | --- |
| `--sidebar-w` | 64px icon rail |
| `--cart-w` | 380px cart column |

Spacing uses a 4px rhythm: 4, 6, 8, 12, 16 and 20px. Page gutters are 20px.

### Type
- `--font` is the system UI sans stack, with Inter as a fallback.
- `--mono` is the system monospace. The receipt uses it.
- The logo word and the receipt logo use Georgia, so the brand mark reads as a wordmark rather than as UI.

| Size | Weight | Where |
| --- | --- | --- |
| 34px | 700 | Sale Complete total |
| 32px | 700 | Break timer |
| 30px | 700 | Keypad display |
| 24px | 700 | Stat card values, cart total amount |
| 22px | 400–600 | Keypad keys, break heading |
| 20px | 600–700 | Page titles, cart total label, change due |
| 18px | 600 | Modal, cart and checkout titles; `.btn-xl` |
| 17px | 600 | Receipt store name |
| 14–15px | 400–500 | Body text, product names, cart lines (base 14px / 1.4) |
| 12–13px | 400–500 | Labels, list subtext, status line |
| 9–11px | 600 | Table headers, category captions, badges (uppercase, tracked) |

## Components
- **Sidebar.** A 64px rail with a 40px logo tile at the top, main nav icons, and Settings and Help at the bottom.
  Each item is a 40px square with an 8px radius. The active item gets a `--surface-2` fill.
- **Banner.** A full-width strip in `--banner-bg` with a calendar icon, the shift start time in bold, and a hint.
- **Top bar.** A search field with a leading icon, the toolbar actions and a status line
  (Online · Shift timer · active products · product/variant count).
- **Actions** (`.action`). 40px tall with a 10px radius, an icon plus label, and a ghost style at rest. There are two
  variants: `action-outline-danger` (Void) and `action-danger` (End Shift).
- **Tabs** (`.tab`). Pill buttons with a hairline border. The active tab is filled with `--primary`. They're used for categories and for the
  Statistics range.
- **Product card** (`.product`). A white card at least 168px tall with a 44px thumbnail tile, the name, the price in bold
  and an uppercase category caption. A `.badge-low` (LOW or OUT) sits top-right.
- **Cart** (`.cart`). A 380px column: a header with the item count and Park, line cards (name, total, unit × qty,
  a Note chip, a −/+ stepper and trash), and a footer with subtotal, total and `.btn-xl` Complete Sale.
- **Buttons.** `.btn-primary` (navy fill), `.btn-secondary` (white with a strong border), `.btn-danger`, `.btn-link`
  and `.btn-xl` (56px, full width).
- **Modal** (`openModal`). A dimmed backdrop and a white sheet with a 16px radius, a title row and a close ×. It closes on Esc or
  a backdrop click unless it's non-dismissible. `confirmDialog` is the small yes/no version.
- **Checkout.** Two columns. On the left: method tiles (76px, tinted by method) and the totals. On the right: the
  display, quick amounts (Exact plus the next two bills from `brand.currency.bills`), a 3×4 keypad,
  Clear and Confirm Payment.
- **Receipt** (`.receipt`). Monospace on white, with a logo tile, the store name, an italic thank-you line, dashed `hr`s at
  18% inset, item lines with a qty × unit subline, totals, payment and change, and a footer. It prints at 80mm
  by itself.
- **Page components** (Inventory, Money, Statistics, Settings, Help):
  - `.page-head`: a white bar with the title on the left and actions on the right.
  - `.stat-card`: a 12px label and a 24px value, with an optional subline.
  - `.panel` and `.panel-head`: a titled white card.
  - `.table`: hairline rows that stack below 760px.
  - `.list-row`: an icon, text and a trailing amount.
- **Charts.** Plain CSS bars in `--primary`, and payment meters in each method's color. No chart library.
- **Demo notice** (`.demo-note`). 10px muted vertical text, fixed in the sidebar's empty middle. It ignores the pointer
  and is hidden when printing.

## Screens
The sale flow screens are the core design: Register, Complete Sale, Sale Complete and the receipt. The
other pages and dialogs were designed to extend it using the same components.

| Route / dialog | Built from |
| --- | --- |
| `#/register` | Banner, top bar, tabs, product grid, cart |
| Complete Sale | Modal, method tiles, keypad |
| Sale Complete | Modal with a success check, total, change, New Sale and a receipt preview |
| Break / Add Cash / Cash Out / End Shift | Small modals; End Shift is a summary list |
| Void, resets | `confirmDialog` |
| `#/inventory` | Page head with search, stat cards, tabs, table with stepper and Set |
| `#/money` | Stat cards, cash log panel, sales panel (each sale reopens its receipt) |
| `#/stats` | Range pills, stat cards, bar chart, top products, payment split |
| `#/settings` | Form panel, data panel with resets |
| `#/help` | Help panels, a keypad shortcuts panel |

## Motion
- **Easing:** `--ease` is `cubic-bezier(.2, .8, .2, 1)`. Durations: `--fast` is 120ms (hover and color) and `--med` is 200ms.
- **Modals:** the backdrop fades in over 200ms. The sheet pops in over 240ms, rising from 8px down and 97% scale. Both fade out and shrink over 150ms ease-in.
- **Press:** buttons, keys, tiles and tabs scale to `.96` while pressed.
- **Cart:** a new line slides in (220ms). The quantity number gives a short pop (180ms).
- **Product hover:** the thumbnail lifts 2px.
- **Charts:** bars grow up and meters grow right on mount (420ms).
- **Reduced motion:** with `prefers-reduced-motion: reduce`, every animation, transition and press scale is switched off.

## Accessibility
- Icon-only nav links have `aria-label`s. The current page gets `aria-current="page"`.
- Modals use `role="dialog"`, `aria-modal`, their title as the accessible name, Esc to close and focus restore.
- Category tabs use `role="tab"` with `aria-selected`. Payment tiles use `aria-pressed`.
- Focus rings are a 2px `--info` outline on `:focus-visible`.
