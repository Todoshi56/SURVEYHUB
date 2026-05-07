const express = require('express');
const router = express.Router();
const { createReport, listReports, updateReportStatus } = require('../controllers/reportController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createReport);
router.get('/', protect, adminOnly, listReports);
router.patch('/:id/status', protect, adminOnly, updateReportStatus);

module.exports = router;
