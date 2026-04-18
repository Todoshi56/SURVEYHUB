const express = require('express');
const router = express.Router();
const { getSurveys, getSurveyById, createSurvey, updateSurvey, deleteSurvey } = require('../controllers/surveyController');
const { protect, companyOnly } = require('../middleware/authMiddleware');

router.get('/', protect, companyOnly, getSurveys);
router.get('/:id', protect, getSurveyById);
router.post('/', protect, companyOnly, createSurvey);
router.put('/:id', protect, companyOnly, updateSurvey);
router.delete('/:id', protect, companyOnly, deleteSurvey);

module.exports = router;
