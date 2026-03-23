const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Product = require('../models/Product');

const envFromConfig = path.join(__dirname, '..', 'config', '.env');
const envFallback = path.join(__dirname, '..', '.env');

const envResult = dotenv.config({ path: envFromConfig });
if (envResult.error) {
  dotenv.config({ path: envFallback });
}

const now = new Date();
const saleStart = new Date(now);
saleStart.setDate(saleStart.getDate() - 2);
const saleEnd = new Date(now);
saleEnd.setDate(saleEnd.getDate() + 14);

const imageFor = (slug, label, bg = 'E8F2EC', fg = '1F2A1F') => ({
  public_id: `seed/${slug}`,
  url: `https://placehold.co/800x800/${bg}/${fg}?text=${encodeURIComponent(label)}`,
});

const sampleProducts = [
  {
    name: 'Monstera Deliciosa',
    price: 1299,
    discountedPrice: 1149,
    discountPercentage: 17,
    discountStartDate: saleStart,
    discountEndDate: saleEnd,
    isOnSale: true,
    description: 'Statement indoor plant with broad split leaves that thrives in bright, indirect light.',
    category: 'Plants',
    stock: 24,
    images: [imageFor('monstera-deliciosa', 'Monstera Deliciosa', 'D9EED8')],
  },
  {
    name: 'Snake Plant Laurentii',
    price: 649,
    discountedPrice: null,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    isOnSale: false,
    description: 'Low-maintenance upright plant that handles low light and irregular watering with ease.',
    category: 'Plants',
    stock: 31,
    images: [imageFor('snake-plant-laurentii', 'Snake Plant Laurentii', 'F3ECD8')],
  },
  {
    name: 'Basil Starter Seed Pack',
    price: 149,
    discountedPrice: null,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    isOnSale: false,
    description: 'Fast-germinating sweet basil seeds suited for kitchen windows, beds, and patio containers.',
    category: 'Seeds & Propagation',
    stock: 88,
    images: [imageFor('basil-starter-seed-pack', 'Basil Starter Seed Pack', 'DCE9F5')],
  },
  {
    name: 'Seedling Tray Propagation Kit',
    price: 329,
    discountedPrice: 279,
    discountPercentage: 15,
    discountStartDate: saleStart,
    discountEndDate: saleEnd,
    isOnSale: true,
    description: 'Reusable starter tray with humidity dome and cell inserts for cuttings and young seedlings.',
    category: 'Seeds & Propagation',
    stock: 36,
    images: [imageFor('seedling-tray-propagation-kit', 'Seedling Tray Kit', 'E7E1F6')],
  },
  {
    name: 'Terracotta Pot Set',
    price: 499,
    discountedPrice: null,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    isOnSale: false,
    description: 'Breathable clay planters in assorted sizes for herbs, foliage plants, and patio styling.',
    category: 'Pots & Planters',
    stock: 42,
    images: [imageFor('terracotta-pot-set', 'Terracotta Pot Set', 'F8E2DD')],
  },
  {
    name: 'Self-Watering Balcony Planter',
    price: 899,
    discountedPrice: null,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    isOnSale: false,
    description: 'Rectangular planter with reservoir base to keep balcony greens evenly watered.',
    category: 'Pots & Planters',
    stock: 19,
    images: [imageFor('self-watering-balcony-planter', 'Balcony Planter', 'FCEBCF')],
  },
  {
    name: 'All-Purpose Potting Mix',
    price: 289,
    discountedPrice: null,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    isOnSale: false,
    description: 'Balanced soil blend for indoor plants and container gardens with strong drainage support.',
    category: 'Soil & Fertilizers',
    stock: 53,
    images: [imageFor('all-purpose-potting-mix', 'Potting Mix', 'D8F1EA')],
  },
  {
    name: 'Organic Bloom Fertilizer Pellets',
    price: 359,
    discountedPrice: 679,
    discountPercentage: 15,
    discountStartDate: saleStart,
    discountEndDate: saleEnd,
    isOnSale: true,
    description: 'Slow-release organic feed formulated to support flowering plants and stronger blooms.',
    category: 'Soil & Fertilizers',
    stock: 28,
    images: [imageFor('organic-bloom-fertilizer-pellets', 'Bloom Fertilizer', 'E3F2D3')],
  },
  {
    name: 'Galvanized Watering Can 2L',
    price: 549,
    discountedPrice: null,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    isOnSale: false,
    description: 'Slim-spout watering can designed for accurate indoor watering and easy daily use.',
    category: 'Watering & Irrigation',
    stock: 34,
    images: [imageFor('galvanized-watering-can-2l', 'Watering Can 2L', 'E8F4E1')],
  },
  {
    name: 'Adjustable Drip Irrigation Kit',
    price: 1199,
    discountedPrice: null,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    isOnSale: false,
    description: 'Expandable drip set for raised beds and pots with adjustable emitters for steady watering.',
    category: 'Watering & Irrigation',
    stock: 17,
    images: [imageFor('adjustable-drip-irrigation-kit', 'Drip Irrigation Kit', 'DDEBF7')],
  },
  {
    name: 'Stainless Hand Trowel',
    price: 229,
    discountedPrice: null,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    isOnSale: false,
    description: 'Rust-resistant hand trowel for repotting, loosening soil, and transplanting seedlings.',
    category: 'Garden Tools',
    stock: 61,
    images: [imageFor('stainless-hand-trowel', 'Hand Trowel', 'F2E7D8')],
  },
  {
    name: 'Bypass Pruning Shears',
    price: 799,
    discountedPrice: 679,
    discountPercentage: 13,
    discountStartDate: saleStart,
    discountEndDate: saleEnd,
    isOnSale: true,
    description: 'Comfort-grip pruning shears for trimming stems, deadheading flowers, and light shaping.',
    category: 'Garden Tools',
    stock: 26,
    images: [imageFor('bypass-pruning-shears', 'Pruning Shears', 'D7EEF7')],
  },
  {
    name: 'Neem Oil Plant Spray',
    price: 319,
    discountedPrice: null,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    isOnSale: false,
    description: 'Ready-to-use plant-safe spray that helps manage common leaf pests on ornamentals and herbs.',
    category: 'Pest Control',
    stock: 40,
    images: [imageFor('neem-oil-plant-spray', 'Neem Oil Spray', 'E8E6F6')],
  },
  {
    name: 'Yellow Sticky Gnat Traps',
    price: 189,
    discountedPrice: null,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    isOnSale: false,
    description: 'Bright adhesive traps that help control fungus gnats and flying pests around pots.',
    category: 'Pest Control',
    stock: 72,
    images: [imageFor('yellow-sticky-gnat-traps', 'Sticky Gnat Traps', 'F6E8E1')],
  },
];

const shouldReplace = process.argv.includes('--replace');

async function seedProducts() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Check backend/config/.env');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  if (shouldReplace) {
    const removed = await Product.deleteMany({
      'images.public_id': { $regex: '^seed/' },
    });
    console.log(`Removed ${removed.deletedCount} existing seeded products`);
  }

  let created = 0;
  let updated = 0;

  for (const sample of sampleProducts) {
    const existing = await Product.findOne({ name: sample.name });

    if (existing) {
      Object.assign(existing, sample);
      await existing.save();
      updated += 1;
    } else {
      await Product.create(sample);
      created += 1;
    }
  }

  console.log(`Seed complete: ${created} created, ${updated} updated`);
}

seedProducts()
  .catch((error) => {
    console.error('Product seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
