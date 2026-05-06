const mongoose = require('mongoose');

const sampleRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesterName: { type: String, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  message: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('SampleRequest', sampleRequestSchema);
