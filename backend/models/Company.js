const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  companyName: { type: String, required: true },
  description: { type: String },
  industry: { type: String },
  website: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
