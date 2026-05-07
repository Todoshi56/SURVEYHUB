const Company = require('../models/Company');

const createOrUpdateProfile = async (req, res) => {
  const { companyName, description, industry, website, phone } = req.body;
  try {
    let company = await Company.findOne({ user: req.user._id });
    if (company) {
      company.companyName = companyName;
      company.description = description;
      company.industry = industry;
      company.website = website;
      company.phone = phone;
      await company.save();
    } else {
      company = await Company.create({
        user: req.user._id,
        companyName,
        description,
        industry,
        website,
        phone
      });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rateCompany = async (req, res) => {
  const { score } = req.body;
  const companyId = req.params.id;

  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
  }

  try {
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found.' });
    if (company.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'You cannot rate your own company.' });
    }

    const existingRating = company.movementRatings.find((r) => r.user.equals(req.user._id));
    if (existingRating) {
      existingRating.score = score;
    } else {
      company.movementRatings.push({ user: req.user._id, score });
    }

    company.movementRatingCount = company.movementRatings.length;
    company.movementRatingAverage =
      company.movementRatingCount > 0
        ? company.movementRatings.reduce((total, r) => total + r.score, 0) / company.movementRatingCount
        : 0;

    await company.save();
    res.json({
      movementRatingAverage: company.movementRatingAverage,
      movementRatingCount: company.movementRatingCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user._id });
    if (!company) return res.status(404).json({ message: 'Company profile not found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrUpdateProfile, getProfile };
