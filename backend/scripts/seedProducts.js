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
    name: 'Premium Salmon Kibble',
    price: 899,
    discountedPrice: 749,
    discountPercentage: 17,
    discountStartDate: saleStart,
    discountEndDate: saleEnd,
    isOnSale: true,
    description: 'Protein-rich dry food made for adult dogs with salmon, brown rice, and omega support.',
    category: 'Pet Food',
    stock: 42,
    images: [imageFor('premium-salmon-kibble', 'Premium Salmon Kibble', 'D9EED8')],
  },
  {
    name: 'Indoor Cat Chicken Bites',
    price: 549,
    discountedPrice: null,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    isOnSale: false,
    description: 'Crunchy chicken-based cat food crafted for indoor cats with balanced vitamins and minerals.',
    category: 'Pet Food',
    stock: 58,
    images: [imageFor('indoor-cat-chicken-bites', 'Indoor Cat Chicken Bites', 'F3ECD8')],
  },
  {
    name: 'Reflective Walk Harness',
    price: 699,
    discountedPrice: null,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    isOnSale: false,
    description: 'Adjustable harness with reflective stitching for comfortable day and night walks.',
    category: 'Pet Accessories',
    stock: 27,
    images: [imageFor('reflective-walk-harness', 'Reflective Walk Harness', 'DCE9F5')],
  },
  {
    name: 'Travel Pet Carrier Tote',
    price: 1299,
    discountedPrice: 1099,
    discountPercentage: 15,
    discountStartDate: saleStart,
    discountEndDate: saleEnd,
    isOnSale: true,
    description: 'Ventilated travel tote with soft interior padding for short trips and vet visits.',
    category: 'Pet Accessories',
    stock: 16,
    images: [imageFor('travel-pet-carrier-tote', 'Travel Pet Carrier Tote', 'E7E1F6')],
  },
  {
    name: 'Rope Tug Bone Toy',
    price: 249,
    discountedPrice: null,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    isOnSale: false,
    description: 'Durable rope toy designed for chewing, tug play, and light fetch sessions.',
    category: 'Pet Toys',
    stock: 73,
    images: [imageFor('rope-tug-bone-toy', 'Rope Tug Bone Toy', 'F8E2DD')],
  },
  {
    name: 'Feather Chase Teaser Wand',
    price: 199,
    discountedPrice: null,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    isOnSale: false,
    description: 'Interactive teaser wand with soft feathers to keep cats active and engaged.',
    category: 'Pet Toys',
    stock: 64,
    images: [imageFor('feather-chase-teaser-wand', 'Feather Chase Teaser Wand', 'FCEBCF')],
  },
  {
    name: 'Calming Pet Supplement Chews',
    price: 459,
    discountedPrice: null,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    isOnSale: false,
    description: 'Soft chews formulated to support calmer behavior during travel, storms, and grooming.',
    category: 'Health & Wellness',
    stock: 31,
    images: [imageFor('calming-pet-supplement-chews', 'Calming Supplement Chews', 'D8F1EA')],
  },
  {
    name: 'Joint Support Soft Chews',
    price: 799,
    discountedPrice: 679,
    discountPercentage: 15,
    discountStartDate: saleStart,
    discountEndDate: saleEnd,
    isOnSale: true,
    description: 'Daily glucosamine and chondroitin chews that support mobility and healthy joints.',
    category: 'Health & Wellness',
    stock: 24,
    images: [imageFor('joint-support-soft-chews', 'Joint Support Soft Chews', 'E3F2D3')],
  },
  {
    name: 'Oatmeal Pet Shampoo',
    price: 329,
    discountedPrice: null,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    isOnSale: false,
    description: 'Gentle oatmeal shampoo that helps soothe dry skin while leaving the coat soft and clean.',
    category: 'Grooming Supplies',
    stock: 37,
    images: [imageFor('oatmeal-pet-shampoo', 'Oatmeal Pet Shampoo', 'E8F4E1')],
  },
  {
    name: 'Deshedding Grooming Brush',
    price: 389,
    discountedPrice: null,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    isOnSale: false,
    description: 'Comfort-grip deshedding brush built to reduce loose fur and maintain a healthy coat.',
    category: 'Grooming Supplies',
    stock: 29,
    images: [imageFor('deshedding-grooming-brush', 'Deshedding Grooming Brush', 'DDEBF7')],
  },
  {
    name: 'Non-Slip Double Food Bowl',
    price: 279,
    discountedPrice: null,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    isOnSale: false,
    description: 'Dual feeding bowl with a non-slip base for neat daily meals and water service.',
    category: 'Feeding Supplies',
    stock: 55,
    images: [imageFor('non-slip-double-food-bowl', 'Non-Slip Double Food Bowl', 'F2E7D8')],
  },
  {
    name: 'Auto Water Fountain',
    price: 1499,
    discountedPrice: 1299,
    discountPercentage: 13,
    discountStartDate: saleStart,
    discountEndDate: saleEnd,
    isOnSale: true,
    description: 'Filtered water fountain that encourages steady hydration for cats and small dogs.',
    category: 'Feeding Supplies',
    stock: 18,
    images: [imageFor('auto-water-fountain', 'Auto Water Fountain', 'D7EEF7')],
  },
  {
    name: 'Foldable Wire Crate',
    price: 2199,
    discountedPrice: null,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    isOnSale: false,
    description: 'Secure foldable crate with front and side access for home training and travel use.',
    category: 'Housing & Cages',
    stock: 14,
    images: [imageFor('foldable-wire-crate', 'Foldable Wire Crate', 'E8E6F6')],
  },
  {
    name: 'Small Pet Cozy Habitat',
    price: 1899,
    discountedPrice: null,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    isOnSale: false,
    description: 'Compact habitat setup for small pets with platform levels, hideout, and feeder space.',
    category: 'Housing & Cages',
    stock: 11,
    images: [imageFor('small-pet-cozy-habitat', 'Small Pet Cozy Habitat', 'F6E8E1')],
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
    const names = sampleProducts.map((product) => product.name);
    const removed = await Product.deleteMany({ name: { $in: names } });
    console.log(`Removed ${removed.deletedCount} existing sample products`);
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
