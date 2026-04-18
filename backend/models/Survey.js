const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: { type: String, enum: ['mcq', 'rating', 'text'], required: true },
  options: [String],
  required: { type: Boolean, default: true }
});

const surveySchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  description: { type: String },
  questions: [questionSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Survey', surveySchema);
