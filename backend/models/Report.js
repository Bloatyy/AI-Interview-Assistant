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
        technical_score: Number,
        confidence: Number,
        integrity_score: Number,
        filler_count: Number,
        filler_breakdown: Object,
        feedback: String,
        strengths: [String],
        weaknesses: [String],
        transcript: String,
        confidence_analysis: String,
        technical_analysis: String,
        integrity_analysis: String,
        attire: String,
        grooming: String,
        looks_grade: Number
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
}, { strict: false }); // Allow extra AI metrics to be saved without being in schema

module.exports = mongoose.model('Report', ReportSchema);
