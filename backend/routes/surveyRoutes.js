const express = require('express');
const router = express.Router();
const { getSurveys, getActiveSurveys, getSurveyById, createSurvey, updateSurvey, deleteSurvey } = require('../controllers/surveyController');
const { protect, companyOnly } = require('../middleware/authMiddleware');

router.get('/browse/active', getActiveSurveys);
router.get('/', protect, companyOnly, getSurveys);
router.get('/:id', getSurveyById);
router.post('/', protect, companyOnly, createSurvey);
router.put('/:id', protect, companyOnly, updateSurvey);
router.delete('/:id', protect, companyOnly, deleteSurvey);

module.exports = router;
