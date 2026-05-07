const express = require('express');
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  getRequestsForCompany,
  updateRequestStatus
} = require('../controllers/sampleRequestController');
const { protect, companyOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createRequest);
router.get('/mine', protect, getMyRequests);
router.get('/company', protect, companyOnly, getRequestsForCompany);
router.patch('/:id/status', protect, companyOnly, updateRequestStatus);

module.exports = router;
