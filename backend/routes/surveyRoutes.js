const express = require('express');
const router = express.Router();
const { getSurveys, getActiveSurveys, getSurveyById, createSurvey, updateSurvey, deleteSurvey } = require('../controllers/surveyController');
const { protect, companyOnly, companyOrAdmin } = require('../middleware/authMiddleware');

// GET all surveys for the logged-in company (admin sees all)
router.get('/', protect, companyOrAdmin, getSurveys);

// GET all active surveys (public - for customers to browse)
router.get('/browse/active', getActiveSurveys);

// GET a single survey by its ID
router.get('/:id', getSurveyById);

// POST - create a new survey (company only)
router.post('/', protect, companyOnly, createSurvey);

// PUT - update/edit an existing survey (company only)
router.put('/:id', protect, companyOnly, updateSurvey);

// DELETE - remove a survey permanently (company or admin)
router.delete('/:id', protect, companyOrAdmin, deleteSurvey);

module.exports = router;
