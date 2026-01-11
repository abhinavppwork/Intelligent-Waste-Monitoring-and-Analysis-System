// Script to clear all WasteScan documents from the database
require('dotenv').config();
const mongoose = require('mongoose');
const WasteScan = require('./models/WasteScan');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecosort';

async function clearData() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const result = await WasteScan.deleteMany({});
    console.log(`✓ Deleted ${result.deletedCount} WasteScan documents`);

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing data:', err.message);
    process.exit(1);
  }
}

clearData();
