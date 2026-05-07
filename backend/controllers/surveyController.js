const Survey = require('../models/Survey');
const Company = require('../models/Company');

/**
 * HELPER: Fetches company profile by User ID
 * Centralized to avoid repetitive logic in controllers.
 */
const getCompanyOrThrow = async (userId) => {
  const company = await Company.findOne({ user: userId });
  if (!company) {
    const error = new Error('Company profile not found.');
    error.statusCode = 404;
    throw error;
  }
  return company;
};

/**
 * Validates and formats question structures.
 * Enforces consistency for MCQ and other question types.
 */
const normalizeQuestions = (questions = []) => {
  return questions.map((q) => {
    const normalized = {
      questionText: q.questionText?.trim(),
      questionType: q.questionType,
      required: q.required !== false
    };

    if (!normalized.questionText) {
      throw new Error('All questions must have valid text.');
    }

    if (q.questionType === 'mcq') {
      const options = Array.isArray(q.options) 
        ? q.options.filter(o => String(o || '').trim() !== '') 
        : [];
      
      if (options.length < 2) {
        throw new Error('MCQ questions must have at least 2 non-empty options.');
      }
      normalized.options = options;
    } else {
      normalized.options = [];
    }

    return normalized;
  });
};

/**
 * GET /surveys
 * Returns surveys based on role (Admin sees all, Company sees their own).
 */
const getSurveys = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role !== 'admin') {
      const company = await getCompanyOrThrow(req.user._id);
      query.company = company._id;
    }

    const surveys = await Survey.find(query)
      .populate('company', 'companyName user')
      .populate('product', 'name image')
      .sort({ createdAt: -1 });

    res.json(surveys);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * GET /surveys/active
 * Publicly accessible list of active surveys.
 */
const getActiveSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find({ isActive: true })
      .populate('company', 'companyName user')
      .populate('product', 'name image')
      .sort({ createdAt: -1 });
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /surveys
 * Creates a new survey linked to the user's company.
 */
const createSurvey = async (req, res) => {
  try {
    const { title, description, productId, questions } = req.body;
    
    if (!questions?.length) {
      return res.status(400).json({ message: 'Please add at least one question.' });
    }

    const company = await getCompanyOrThrow(req.user._id);
    const validatedQuestions = normalizeQuestions(questions);

    const survey = await Survey.create({
      company: company._id,
      product: productId,
      title,
      description,
      questions: validatedQuestions
    });

    res.status(201).json(survey);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * PUT /surveys/:id
 * Updates an existing survey if owned by the requesting company.
 */
const updateSurvey = async (req, res) => {
  try {
    const company = await getCompanyOrThrow(req.user._id);
    const { title, description, productId, questions, isActive } = req.body;

    const survey = await Survey.findOne({ _id: req.params.id, company: company._id });
    if (!survey) return res.status(404).json({ message: 'Survey not found.' });

    if (questions) {
      survey.questions = normalizeQuestions(questions);
    }

    survey.title = title || survey.title;
    survey.description = description || survey.description;
    survey.product = productId || survey.product;
    if (isActive !== undefined) survey.isActive = isActive;

    await survey.save();
    res.json(survey);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * DELETE /surveys/:id
 */
const deleteSurvey = async (req, res) => {
  try {
    const company = await getCompanyOrThrow(req.user._id);
    const result = await Survey.deleteOne({ _id: req.params.id, company: company._id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Survey not found or unauthorized.' });
    }

    res.json({ message: 'Survey deleted successfully.' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

module.exports = { 
  getSurveys, 
  getActiveSurveys, 
  createSurvey, 
  updateSurvey, 
  deleteSurvey 
};