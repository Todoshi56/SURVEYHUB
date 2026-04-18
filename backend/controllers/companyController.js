const Company = require('../models/Company');

const createOrUpdateProfile = async (req, res) => {
  const { companyName, description, industry, website } = req.body;
  try {
    let company = await Company.findOne({ user: req.user._id });
    if (company) {
      company.companyName = companyName;
      company.description = description;
      company.industry = industry;
      company.website = website;
      await company.save();
    } else {
      company = await Company.create({
        user: req.user._id,
        companyName,
        description,
        industry,
        website
      });
    }
    res.json(company);
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
