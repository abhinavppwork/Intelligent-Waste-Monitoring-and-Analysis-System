const mongoose = require('mongoose');

// Subdocument for impact metrics
const ImpactSchema = new mongoose.Schema(
  {
    co2Saved: { type: Number, default: 0 },
    energySaved: { type: Number, default: 0 },
  },
  { _id: false }
);

const WasteScanSchema = new mongoose.Schema({
  qrCode: { type: String, required: true },
  // Optional user identifier (email or user id) for per-user analytics
  userId: { type: String },
  itemName: { type: String, required: true },
  category: {
    type: String,
    enum: ['dry', 'wet', 'ewaste', 'hazardous'],
    required: true,
  },
  weight: { type: Number, default: 0 }, // Weight of waste in kg or grams
  unit: { type: String, enum: ['kg', 'g'], default: 'kg' }, // Unit of weight
  timestamp: { type: Date, default: Date.now },
  impact: { type: ImpactSchema, default: () => ({}) },
});

module.exports = mongoose.model('WasteScan', WasteScanSchema);
