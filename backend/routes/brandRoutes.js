// backend/routes/brandRoutes.js
const express = require('express');
const router = express.Router();
const { getBrands, addBrand, updateBrand, deleteBrand } = require('../controllers/brandController');

// Get all brands
router.get('/', getBrands);

// Add new brand
router.post('/', addBrand);

// Update brand by ID
router.put('/:id', updateBrand);

// Delete brand by ID
router.delete('/:id', deleteBrand);

module.exports = router;
