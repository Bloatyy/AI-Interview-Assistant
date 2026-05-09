const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// GET all reports for a user
router.get('/:userId', async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET the latest report for a user
router.get('/latest/:userId', async (req, res) => {
  try {
    const report = await Report.findOne({ userId: req.params.userId }).sort({ date: -1 });
    if (!report) return res.status(404).json({ message: "No reports found" });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new report
router.post('/', async (req, res) => {
  const report = new Report({
    userId: req.body.userId,
    company: req.body.company,
    role: req.body.role,
    overallScore: req.body.overallScore,
    postureScore: req.body.postureScore,
    avgCommunication: req.body.avgCommunication,
    avgConfidence: req.body.avgConfidence,
    totalFillers: req.body.totalFillers,
    results: req.body.results,
    thoughtProcesses: req.body.thoughtProcesses
  });

  try {
    const newReport = await report.save();
    res.status(201).json(newReport);
  } catch (err) {
    console.error("REPORT SAVE ERROR:", err.message);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
