const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  userId: {
    type: String, // Support both ObjectId strings and social auth strings
    required: true
  },
  company: String,
  role: String,
  overallScore: { type: Number, default: 0 },
  postureScore: { type: Number, default: 0 },
  avgCommunication: { type: Number, default: 0 },
  avgConfidence: { type: Number, default: 0 },
  totalFillers: { type: Number, default: 0 },
  results: [
    {
      question: String,
      evaluation: {
        score: Number,
        feedback: String,
        strengths: [String],
        weaknesses: [String],
        transcript: String,
        confidence: Number,
        filler_count: Number
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
}, { strict: false }); // Allow extra AI metrics to be saved without being in schema

module.exports = mongoose.model('Report', ReportSchema);
