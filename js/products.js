import { brand } from './config/brand.js';

// Seed catalog. `barcode` is what a scanner types; `variant` marks a size option of a base item.
export const LOW_STOCK = 10;

export const categories = brand.categories;

// Matches the order of brand.categories, so renaming a category there renames it here too.
const [PASTRIES, BREADS, TEA, COFFEE, COOKIES, WATER] = categories;

const raw = [
  // Pastries
  ['Almond Twist', PASTRIES, 4.25, 8],
  ['Berry Danish', PASTRIES, 4.25, 6],
  ['Lemon Turnover', PASTRIES, 4.25, 9],
  ['Maple Pecan Swirl', PASTRIES, 4.5, 5],
  ['Mini Apple Puff', PASTRIES, 3.25, 7],
  ['Mini Cherry Puff', PASTRIES, 3.25, 4],
  ['Mini Peach Puff', PASTRIES, 3.25, 8],
  ['Mini Vanilla Puff', PASTRIES, 3.25, 6],
  // Breads
  ['Seeded Loaf', BREADS, 5.5, 14],
  ['Herb Focaccia', BREADS, 4.75, 9],
  ['Cinnamon Knot', BREADS, 3.75, 12],
  ['Dinner Rolls (6 pcs)', BREADS, 4, 20],
  ['Sesame Bun', BREADS, 2.5, 18],
  ['Cheddar Bun', BREADS, 3, 7],
  // Tea & Juice
  ['Peach Iced Tea (12oz)', TEA, 3.5, 6, 'Peach Iced Tea'],
  ['Peach Iced Tea (16oz)', TEA, 4.25, 5, 'Peach Iced Tea'],
  ['Orange Juice (12oz)', TEA, 4, 11, 'Orange Juice'],
  ['Orange Juice (16oz)', TEA, 4.75, 9, 'Orange Juice'],
  ['Chai Latte (12oz)', TEA, 4.25, 8, 'Chai Latte'],
  ['Chai Latte (16oz)', TEA, 4.95, 7, 'Chai Latte'],
  ['Hot Cocoa (12oz)', TEA, 3.25, 12, 'Hot Cocoa'],
  ['Hot Cocoa (16oz)', TEA, 3.95, 10, 'Hot Cocoa'],
  // Coffee
  ['Drip Coffee (12oz)', COFFEE, 2.75, 25, 'Drip Coffee'],
  ['Drip Coffee (16oz)', COFFEE, 3.25, 25, 'Drip Coffee'],
  ['Oat Latte (12oz)', COFFEE, 4.5, 15, 'Oat Latte'],
  ['Oat Latte (16oz)', COFFEE, 5.25, 15, 'Oat Latte'],
  ['Vanilla Latte (12oz)', COFFEE, 4.75, 9, 'Vanilla Latte'],
  ['Vanilla Latte (16oz)', COFFEE, 5.5, 8, 'Vanilla Latte'],
  ['Mocha (12oz)', COFFEE, 4.75, 6, 'Mocha'],
  ['Mocha (16oz)', COFFEE, 5.5, 6, 'Mocha'],
  // Cookies
  ['Chocolate Chunk Cookie', COOKIES, 2.5, 16],
  ['Oatmeal Raisin Cookie', COOKIES, 2.5, 9],
  ['Peanut Butter Cookie', COOKIES, 2.75, 7],
  ['Lemon Sugar Cookie', COOKIES, 2.75, 8],
  // Water
  ['Mirevo Sparkling Water (330ml)', WATER, 1.75, 24, 'Mirevo Sparkling Water'],
  ['Mirevo Sparkling Water (1L)', WATER, 3.25, 12, 'Mirevo Sparkling Water'],
];

export const products = raw.map(([name, category, price, stock, base], i) => ({
  id: `p${String(i + 1).padStart(3, '0')}`,
  barcode: `0000${String(1001 + i)}`,
  name,
  category,
  price,
  stock,
  base: base || null,
}));

export const productById = Object.fromEntries(products.map((p) => [p.id, p]));

export const variantCount = products.filter((p) => p.base).length;
