const Response = require('../models/Response');
const Survey = require('../models/Survey');

// Submit a survey response
const submitResponse = async (req, res) => {
  const { surveyId, answers } = req.body;
  try {
    // Check if survey exists
    const survey = await Survey.findById(surveyId);
    if (!survey) return res.status(404).json({ message: 'Survey not found.' });

    // Check if user already submitted
    const existingResponse = await Response.findOne({
      survey: surveyId,
      user: req.user._id
    });
    if (existingResponse) {
      return res.status(400).json({ message: 'You have already submitted this survey.' });
    }

    // Save response
    const response = await Response.create({
      survey: surveyId,
      user: req.user._id,
      answers
    });

    res.status(201).json({
      message: 'Survey submitted successfully!',
      response
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all responses for a survey (company only)
const getSurveyResponses = async (req, res) => {
  const { surveyId } = req.params;
  try {
    const survey = await Survey.findById(surveyId);
    if (!survey) return res.status(404).json({ message: 'Survey not found.' });

    // Check if current user is the survey owner
    if (survey.company.toString() !== req.user.company) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const responses = await Response.find({ survey: surveyId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      surveyTitle: survey.title,
      totalResponses: responses.length,
      responses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if user already submitted a survey
const checkUserSubmission = async (req, res) => {
  const { surveyId } = req.params;
  try {
    const response = await Response.findOne({
      survey: surveyId,
      user: req.user._id
    });

    res.json({
      alreadySubmitted: !!response,
      response: response || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's response for a survey
const getUserResponse = async (req, res) => {
  const { surveyId } = req.params;
  try {
    const response = await Response.findOne({
      survey: surveyId,
      user: req.user._id
    });

    if (!response) {
      return res.status(404).json({ message: 'You have not submitted this survey.' });
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get analytics data for a survey (for Week 4)
const getSurveyAnalytics = async (req, res) => {
  const { surveyId } = req.params;
  try {
    const survey = await Survey.findById(surveyId);
    if (!survey) return res.status(404).json({ message: 'Survey not found.' });

    const responses = await Response.find({ survey: surveyId });
    const totalResponses = responses.length;

    // Calculate stats per question
    const analytics = survey.questions.map((q) => {
      const questionResponses = responses.map(r =>
        r.answers.find(a => a.questionId === q._id.toString())
      ).filter(Boolean);

      return {
        questionId: q._id,
        questionText: q.questionText,
        questionType: q.questionType,
        totalAnswers: questionResponses.length,
        answers: questionResponses.map(a => a.answer)
      };
    });

    res.json({
      surveyTitle: survey.title,
      totalResponses,
      analytics
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitResponse,
  getSurveyResponses,
  checkUserSubmission,
  getUserResponse,
  getSurveyAnalytics
};
