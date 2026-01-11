// Simple seed script to insert mock data for demo purposes
require('dotenv').config();
const mongoose = require('mongoose');
const WasteScan = require('./models/WasteScan');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecosort';

const samples = [
  {
    qrCode: 'QR-1001',
    itemName: 'Plastic Bottle',
    category: 'dry',
    impact: { co2Saved: 0.2, energySaved: 0.05 },
  },
  {
    qrCode: 'QR-1002',
    itemName: 'Apple Core',
    category: 'wet',
    impact: { co2Saved: 0.05, energySaved: 0.02 },
  },
  {
    qrCode: 'QR-1003',
    itemName: 'Old Phone',
    category: 'ewaste',
    impact: { co2Saved: 2.5, energySaved: 1.1 },
  },
  {
    qrCode: 'QR-1004',
    itemName: 'Battery',
    category: 'hazardous',
    impact: { co2Saved: 0.1, energySaved: 0.01 },
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB for seeding');

    const count = await WasteScan.countDocuments();
    if (count > 0) {
      console.log('Database already contains data. Aborting seed.');
      process.exit(0);
    }

    await WasteScan.insertMany(samples);
    console.log('Seeded sample waste scan records');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
