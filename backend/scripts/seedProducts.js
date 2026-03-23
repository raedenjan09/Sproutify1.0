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

  // 🌱 SEEDS & PROPAGATION
  {
    name: 'Basil Starter Seed Pack',
    price: 149,
    category: 'Seeds & Propagation',
    stock: 88,
    description: 'Fast-growing basil seeds for kitchen gardening.',
    images: [imageFor('basil-seeds', 'Basil Seeds')],
    rating: 4.5,
    brand: 'Sproutify',
  },
  {
    name: 'Cherry Tomato Seed Pack',
    price: 159,
    category: 'Seeds & Propagation',
    stock: 90,
    description: 'Sweet cherry tomatoes ideal for pots.',
    images: [imageFor('tomato-seeds', 'Tomato Seeds', 'FFE4E1')],
  },
  {
    name: 'Seedling Tray Kit',
    price: 329,
    discountedPrice: 279,
    discountPercentage: 15,
    discountStartDate: saleStart,
    discountEndDate: saleEnd,
    isOnSale: true,
    category: 'Seeds & Propagation',
    stock: 36,
    description: 'Starter tray with humidity dome.',
    images: [imageFor('seed-tray', 'Seed Tray', 'E7E1F6')],
  },
  {
    name: 'Germination Heat Mat',
    price: 799,
    category: 'Seeds & Propagation',
    stock: 25,
    description: 'Improves seed sprouting success.',
    images: [imageFor('heat-mat', 'Heat Mat')],
  },

  // 🪴 POTS & PLANTERS
  {
    name: 'Terracotta Pot Set',
    price: 499,
    category: 'Pots & Planters',
    stock: 42,
    description: 'Classic clay pots for plants.',
    images: [imageFor('terracotta', 'Terracotta Pots')],
  },
  {
    name: 'Self-Watering Planter',
    price: 899,
    category: 'Pots & Planters',
    stock: 19,
    description: 'Keeps plants hydrated automatically.',
    images: [imageFor('self-watering', 'Self Watering')],
  },
  {
    name: 'Ceramic Pot',
    price: 599,
    category: 'Pots & Planters',
    stock: 30,
    description: 'Modern decorative ceramic planter.',
    images: [imageFor('ceramic-pot', 'Ceramic Pot')],
  },
  {
    name: 'Hanging Macrame Planter',
    price: 349,
    category: 'Pots & Planters',
    stock: 38,
    description: 'Stylish hanging plant holder.',
    images: [imageFor('macrame', 'Macrame')],
  },

  // 🌾 SOIL & FERTILIZERS
  {
    name: 'Potting Mix',
    price: 289,
    category: 'Soil & Fertilizers',
    stock: 53,
    description: 'All-purpose soil mix.',
    images: [imageFor('soil', 'Soil Mix')],
  },
  {
    name: 'Organic Fertilizer Pellets',
    price: 359,
    discountedPrice: 299,
    discountPercentage: 15,
    discountStartDate: saleStart,
    discountEndDate: saleEnd,
    isOnSale: true,
    category: 'Soil & Fertilizers',
    stock: 28,
    description: 'Slow-release nutrients.',
    images: [imageFor('fertilizer', 'Fertilizer')],
  },
  {
    name: 'Vermicast',
    price: 199,
    category: 'Soil & Fertilizers',
    stock: 60,
    description: 'Organic worm cast fertilizer.',
    images: [imageFor('vermicast', 'Vermicast')],
  },
  {
    name: 'Coco Peat',
    price: 149,
    category: 'Soil & Fertilizers',
    stock: 70,
    description: 'Lightweight soil alternative.',
    images: [imageFor('coco', 'Coco Peat')],
  },

  // 💧 WATERING & IRRIGATION
  {
    name: 'Watering Can',
    price: 549,
    category: 'Watering & Irrigation',
    stock: 34,
    description: 'Precision watering can.',
    images: [imageFor('watering-can', 'Watering Can')],
  },
  {
    name: 'Drip Irrigation Kit',
    price: 1199,
    category: 'Watering & Irrigation',
    stock: 17,
    description: 'Efficient watering system.',
    images: [imageFor('drip', 'Drip Kit')],
  },
  {
    name: 'Plant Mister',
    price: 199,
    category: 'Watering & Irrigation',
    stock: 45,
    description: 'Fine mist spray bottle.',
    images: [imageFor('mister', 'Mister')],
  },
  {
    name: 'Water Timer',
    price: 999,
    category: 'Watering & Irrigation',
    stock: 20,
    description: 'Automated watering timer.',
    images: [imageFor('timer', 'Water Timer')],
  },

  // 🛠️ GARDEN TOOLS
  {
    name: 'Hand Trowel',
    price: 229,
    category: 'Garden Tools',
    stock: 61,
    description: 'Basic gardening tool.',
    images: [imageFor('trowel', 'Trowel')],
  },
  {
    name: 'Pruning Shears',
    price: 799,
    discountedPrice: 679,
    discountPercentage: 13,
    discountStartDate: saleStart,
    discountEndDate: saleEnd,
    isOnSale: true,
    category: 'Garden Tools',
    stock: 26,
    description: 'Sharp trimming tool.',
    images: [imageFor('shears', 'Shears')],
  },
  {
    name: 'Garden Tool Set',
    price: 499,
    category: 'Garden Tools',
    stock: 50,
    description: '3-piece gardening tools.',
    images: [imageFor('toolset', 'Tool Set')],
  },
  {
    name: 'Soil pH Meter',
    price: 699,
    category: 'Garden Tools',
    stock: 30,
    description: 'Measures soil acidity.',
    images: [imageFor('ph', 'pH Meter')],
  },

  // 🐛 PEST CONTROL
  {
    name: 'Neem Oil Spray',
    price: 319,
    category: 'Pest Control',
    stock: 40,
    description: 'Natural pest control spray.',
    images: [imageFor('neem', 'Neem Oil')],
  },
  {
    name: 'Sticky Traps',
    price: 189,
    category: 'Pest Control',
    stock: 72,
    description: 'Traps flying insects.',
    images: [imageFor('traps', 'Sticky Traps')],
  },
  {
    name: 'Insecticidal Soap',
    price: 259,
    category: 'Pest Control',
    stock: 55,
    description: 'Safe pest removal spray.',
    images: [imageFor('soap', 'Soap Spray')],
  },
  {
    name: 'Garden Net',
    price: 399,
    category: 'Pest Control',
    stock: 33,
    description: 'Protect plants from pests.',
    images: [imageFor('net', 'Garden Net')],
  },
];

const shouldReplace = process.argv.includes('--replace');

async function seedProducts() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  if (shouldReplace) {
    const removed = await Product.deleteMany({
      'images.public_id': { $regex: '^seed/' },
    });
    console.log(`Removed ${removed.deletedCount} old products`);
  }

  let created = 0;
  let updated = 0;

  for (const sample of sampleProducts) {
    const existing = await Product.findOne({ name: sample.name });

    if (existing) {
      Object.assign(existing, sample);
      await existing.save();
      updated++;
    } else {
      await Product.create(sample);
      created++;
    }
  }

  console.log(`Done: ${created} created, ${updated} updated`);
}

seedProducts()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => mongoose.disconnect());