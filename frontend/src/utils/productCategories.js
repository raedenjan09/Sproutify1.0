export const PRODUCT_CATEGORIES = [
  'Plants',
  'Seeds & Propagation',
  'Pots & Planters',
  'Soil & Fertilizers',
  'Watering & Irrigation',
  'Garden Tools',
  'Pest Control',
];

export const isProductCategoryCurrent = (category) =>
  PRODUCT_CATEGORIES.includes(category);
