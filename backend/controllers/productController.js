const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const Company = require('../models/Company');

const getCompanyByUser = async (userId) => {
  return await Company.findOne({ user: userId });
};

const removeImageFile = (imageUrl) => {
  if (!imageUrl) return;
  const filename = path.basename(imageUrl);
  const filepath = path.join(__dirname, '..', 'uploads', 'products', filename);
  fs.unlink(filepath, () => {});
};

const buildImageUrl = (req) =>
  req.file ? `/uploads/products/${req.file.filename}` : undefined;

const getProducts = async (req, res) => {
  try {
    const company = await getCompanyByUser(req.user._id);
    if (!company) return res.status(404).json({ message: 'Company profile not found. Please create one first.' });
    const products = await Product.find({ company: company._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const browseProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('company', 'companyName')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addProduct = async (req, res) => {
  const { name, description, category } = req.body;
  try {
    const company = await getCompanyByUser(req.user._id);
    if (!company) return res.status(404).json({ message: 'Please create a company profile first.' });
    const product = await Product.create({
      company: company._id,
      name,
      description,
      category,
      image: buildImageUrl(req)
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  const { name, description, category, removeImage } = req.body;
  try {
    const company = await getCompanyByUser(req.user._id);
    if (!company) return res.status(404).json({ message: 'Company profile not found.' });
    const product = await Product.findOne({ _id: req.params.id, company: company._id });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    product.name = name;
    product.description = description;
    product.category = category;

    const newImageUrl = buildImageUrl(req);
    if (newImageUrl) {
      removeImageFile(product.image);
      product.image = newImageUrl;
    } else if (removeImage === 'true' || removeImage === true) {
      removeImageFile(product.image);
      product.image = undefined;
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const company = await getCompanyByUser(req.user._id);
    if (!company) return res.status(404).json({ message: 'Company profile not found.' });
    const product = await Product.findOne({ _id: req.params.id, company: company._id });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    removeImageFile(product.image);
    await product.deleteOne();
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts, browseProducts, addProduct, updateProduct, deleteProduct };
