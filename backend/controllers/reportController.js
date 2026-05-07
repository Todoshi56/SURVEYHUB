const Report = require('../models/Report');
const User = require('../models/User');

const createReport = async (req, res) => {
  const { targetUserId, reason } = req.body;
  try {
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Please describe the issue.' });
    }
    if (String(targetUserId) === String(req.user._id)) {
      return res.status(400).json({ message: "You can't report yourself." });
    }
    const target = await User.findById(targetUserId);
    if (!target) return res.status(404).json({ message: 'User not found.' });
    if (target.role === 'admin') {
      return res.status(400).json({ message: "You can't report an admin." });
    }

    const report = await Report.create({
      reporter: req.user._id,
      target: target._id,
      targetRole: target.role,
      reason: reason.trim()
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email role')
      .populate('target', 'name email phone role')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReportStatus = async (req, res) => {
  const { status } = req.body;
  if (!['open', 'resolved', 'dismissed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    report.status = status;
    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReport, listReports, updateReportStatus };
