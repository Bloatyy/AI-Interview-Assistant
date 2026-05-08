const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: String,
  role: String,
  overallScore: Number,
  postureScore: Number,
  avgCommunication: Number,
  avgConfidence: Number,
  totalFillers: Number,
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
});

module.exports = mongoose.model('Report', ReportSchema);
