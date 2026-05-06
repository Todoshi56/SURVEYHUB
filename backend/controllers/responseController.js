const Response = require('../models/Response');
const Survey = require('../models/Survey');
const Company = require('../models/Company');
const SampleRequest = require('../models/SampleRequest');

const getCompanyByUser = (userId) => Company.findOne({ user: userId });

const submitResponse = async (req, res) => {
  const { surveyId, answers } = req.body;
  try {
    const survey = await Survey.findById(surveyId);
    if (!survey) return res.status(404).json({ message: 'Survey not found.' });

    if (req.user.role === 'company') {
      const myCompany = await getCompanyByUser(req.user._id);
      if (myCompany && survey.company.toString() === myCompany._id.toString()) {
        return res.status(403).json({
          message: "You can't submit a survey for a product owned by your own company."
        });
      }
    }

    const approvedSample = await SampleRequest.findOne({
      requester: req.user._id,
      product: survey.product,
      status: 'approved'
    });
    if (!approvedSample) {
      return res.status(403).json({
        message: 'You can only take this survey after the company approves your sample request for this product.'
      });
    }

    const existingResponse = await Response.findOne({
      survey: surveyId,
      user: req.user._id
    });
    if (existingResponse) {
      return res.status(400).json({ message: 'You have already submitted this survey.' });
    }

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

const getSurveyResponses = async (req, res) => {
  const { surveyId } = req.params;
  try {
    const survey = await Survey.findById(surveyId);
    if (!survey) return res.status(404).json({ message: 'Survey not found.' });

    const company = await getCompanyByUser(req.user._id);
    if (!company || survey.company.toString() !== company._id.toString()) {
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

const checkUserSubmission = async (req, res) => {
  const { surveyId } = req.params;
  try {
    const response = await Response.findOne({
      survey: surveyId,
      user: req.user._id
    });

    res.json({
      hasSubmitted: !!response,
      response: response || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

const getSurveyAnalytics = async (req, res) => {
  const { surveyId } = req.params;
  try {
    const survey = await Survey.findById(surveyId);
    if (!survey) return res.status(404).json({ message: 'Survey not found.' });

    const company = await getCompanyByUser(req.user._id);
    if (!company || survey.company.toString() !== company._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const responses = await Response.find({ survey: surveyId });
    const totalResponses = responses.length;

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
