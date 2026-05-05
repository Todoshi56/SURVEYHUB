const Survey = require('../models/Survey');
const Company = require('../models/Company');

const getCompanyByUser = async (userId) => {
  return await Company.findOne({ user: userId });
};

const getSurveys = async (req, res) => {
  try {
    const company = await getCompanyByUser(req.user._id);
    if (!company) return res.status(404).json({ message: 'Company profile not found.' });
    const surveys = await Survey.find({ company: company._id })
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getActiveSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find({ isActive: true })
      .populate('company', 'companyName')
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSurveyById = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id).populate('product', 'name');
    if (!survey) return res.status(404).json({ message: 'Survey not found.' });
    res.json(survey);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const normalizeQuestions = (questions = []) => {
  return questions.map((q) => {
    const normalized = {
      questionText: q.questionText,
      questionType: q.questionType,
      required: q.required !== false
    };

    if (q.questionType === 'mcq') {
      const options = Array.isArray(q.options) ? q.options.slice(0, 4).map((o) => String(o || '').trim()) : [];
      if (options.length !== 4 || options.some((opt) => !opt)) {
        throw new Error('Each MCQ question must have exactly 4 non-empty options.');
      }
      normalized.options = options;
    } else {
      normalized.options = [];
    }

    return normalized;
  });
};

const createSurvey = async (req, res) => {
  const { title, description, productId, questions } = req.body;
  try {
    const company = await getCompanyByUser(req.user._id);
    if (!company) return res.status(404).json({ message: 'Please create a company profile first.' });

    const normalizedQuestions = normalizeQuestions(questions);

    const survey = await Survey.create({
      company: company._id,
      product: productId,
      title,
      description,
      questions: normalizedQuestions
    });
    res.status(201).json(survey);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSurvey = async (req, res) => {
  const { title, description, productId, questions, isActive } = req.body;
  try {
    const company = await getCompanyByUser(req.user._id);
    if (!company) return res.status(404).json({ message: 'Company profile not found.' });
    const survey = await Survey.findOne({ _id: req.params.id, company: company._id });
    if (!survey) return res.status(404).json({ message: 'Survey not found.' });

    const normalizedQuestions = normalizeQuestions(questions);

    survey.title = title;
    survey.description = description;
    survey.product = productId;
    survey.questions = normalizedQuestions;
    if (isActive !== undefined) survey.isActive = isActive;
    await survey.save();
    res.json(survey);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSurvey = async (req, res) => {
  try {
    const company = await getCompanyByUser(req.user._id);
    if (!company) return res.status(404).json({ message: 'Company profile not found.' });
    const survey = await Survey.findOne({ _id: req.params.id, company: company._id });
    if (!survey) return res.status(404).json({ message: 'Survey not found.' });
    await survey.deleteOne();
    res.json({ message: 'Survey deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSurveys, getActiveSurveys, getSurveyById, createSurvey, updateSurvey, deleteSurvey };
