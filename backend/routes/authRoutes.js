//backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { loginInfluencer } = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', loginInfluencer);

module.exports = router;
