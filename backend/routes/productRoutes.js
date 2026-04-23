const express = require('express');
const router = express.Router();
const { getProducts, addProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, companyOnly } = require('../middleware/authMiddleware');

router.get('/', protect, companyOnly, getProducts);
router.post('/', protect, companyOnly, addProduct);
router.put('/:id', protect, companyOnly, updateProduct);
router.delete('/:id', protect, companyOnly, deleteProduct);

module.exports = router;
