const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
