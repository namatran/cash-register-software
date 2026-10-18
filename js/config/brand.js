// Every brand-specific value lives here. To re-brand, edit this file (and the tokens in css/styles.css).
export const brand = {
  storeName: 'Mirevo',
  logoText: 'Mirevo',
  tagline: 'Fresh pastries, bread and coffee',
  receiptFooter: 'Please come again',
  receiptPrefix: '#',
  storageKey: 'mirevo-pos-v1',
  currency: {
    symbol: '$',
    locale: 'en-US',
    // Banknotes offered as quick amounts at checkout, smallest first.
    bills: [1, 5, 10, 20, 50, 100],
  },
  categories: ['Pastries', 'Breads', 'Tea & Juice', 'Coffee', 'Cookies', 'Water'],
};
