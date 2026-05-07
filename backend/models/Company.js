const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true, min: 1, max: 5 }
}, { _id: false });

const companySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  companyName: { type: String, required: true },
  description: { type: String },
  industry: { type: String },
  website: { type: String },
  phone: { type: String },
  movementRatings: [ratingSchema],
  movementRatingAverage: { type: Number, default: 0 },
  movementRatingCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
