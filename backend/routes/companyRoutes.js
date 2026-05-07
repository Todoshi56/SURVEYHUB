const express = require('express');
const router = express.Router();
const { createOrUpdateProfile, getProfile, rateCompany } = require('../controllers/companyController');
const { protect, companyOnly } = require('../middleware/authMiddleware');

router.get('/profile', protect, companyOnly, getProfile);
router.post('/profile', protect, companyOnly, createOrUpdateProfile);
router.post('/:id/rating', protect, rateCompany);

module.exports = router;
