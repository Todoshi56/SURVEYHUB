const express = require('express');
const router = express.Router();
const { getProducts, browseProducts, addProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, companyOnly } = require('../middleware/authMiddleware');
const { uploadProductImage } = require('../middleware/uploadMiddleware');

router.get('/browse', protect, browseProducts);
router.get('/', protect, companyOnly, getProducts);
router.post('/', protect, companyOnly, uploadProductImage, addProduct);
router.put('/:id', protect, companyOnly, uploadProductImage, updateProduct);
router.delete('/:id', protect, companyOnly, deleteProduct);

module.exports = router;
