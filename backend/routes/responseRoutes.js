const express = require('express');
const router = express.Router();
const {
  submitResponse,
  getSurveyResponses,
  checkUserSubmission,
  getUserResponse,
  getSurveyAnalytics
} = require('../controllers/responseController');
const { protect, companyOnly } = require('../middleware/authMiddleware');

// Customer routes
router.post('/submit', protect, submitResponse);
router.get('/check/:surveyId', protect, checkUserSubmission);
router.get('/user-response/:surveyId', protect, getUserResponse);

// Company routes (analytics)
router.get('/survey/:surveyId', protect, companyOnly, getSurveyResponses);
router.get('/analytics/:surveyId', protect, companyOnly, getSurveyAnalytics);

module.exports = router;
