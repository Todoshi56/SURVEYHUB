const express = require('express');
const router = express.Router();
const {
  submitResponse,
  getSurveyResponses,
  checkUserSubmission,
  getUserResponse,
  getSurveyAnalytics,
  deleteResponse
} = require('../controllers/responseController');
const { protect, companyOrAdmin, adminOnly } = require('../middleware/authMiddleware');

router.post('/submit', protect, submitResponse);
router.get('/check/:surveyId', protect, checkUserSubmission);
router.get('/user-response/:surveyId', protect, getUserResponse);

router.get('/survey/:surveyId', protect, companyOrAdmin, getSurveyResponses);
router.get('/analytics/:surveyId', protect, companyOrAdmin, getSurveyAnalytics);

router.delete('/:id', protect, adminOnly, deleteResponse);

module.exports = router;
