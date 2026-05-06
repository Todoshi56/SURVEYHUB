const SampleRequest = require('../models/SampleRequest');
const Product = require('../models/Product');
const Company = require('../models/Company');

const createRequest = async (req, res) => {
  const { productId, message } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    let requesterName = req.user.name;

    if (req.user.role === 'company') {
      const myCompany = await Company.findOne({ user: req.user._id });
      if (!myCompany) {
        return res.status(400).json({ message: 'Please create your company profile before requesting samples.' });
      }
      if (product.company.toString() === myCompany._id.toString()) {
        return res.status(403).json({
          message: "You can't request a sample for one of your own products."
        });
      }
      requesterName = myCompany.companyName;
    }

    const existing = await SampleRequest.findOne({ requester: req.user._id, product: productId });
    if (existing) {
      return res.status(400).json({ message: 'You have already requested a sample for this product.' });
    }

    const request = await SampleRequest.create({
      requester: req.user._id,
      requesterName,
      product: product._id,
      company: product.company,
      message: message?.trim() || ''
    });
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await SampleRequest.find({ requester: req.user._id })
      .populate('product', 'name image')
      .populate('company', 'companyName')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRequestsForCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user._id });
    if (!company) return res.status(404).json({ message: 'Company profile not found.' });
    const requests = await SampleRequest.find({ company: company._id })
      .populate('product', 'name image')
      .populate('requester', 'name email phone role')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRequestStatus = async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'declined', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }
  try {
    const myCompany = await Company.findOne({ user: req.user._id });
    if (!myCompany) return res.status(404).json({ message: 'Company profile not found.' });

    const request = await SampleRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    if (request.company.toString() !== myCompany._id.toString()) {
      return res.status(403).json({ message: 'You can only update requests for your own products.' });
    }

    request.status = status;
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRequest, getMyRequests, getRequestsForCompany, updateRequestStatus };
