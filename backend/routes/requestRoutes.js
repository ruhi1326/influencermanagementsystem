//backend/routes/requestRoutes.js
const express = require('express');
const router = express.Router();
const { submitRequest, approveRequest, rejectRequest, influencerSignup, verifyToken  } = require('../controllers/requestController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// POST /api/request
router.post('/', submitRequest);

//router.post('/:request_id/approve', adminMiddleware, approveRequest);
//router.post('/:request_id/reject', adminMiddleware, rejectRequest);

// Approve a request
router.post('/approve', approveRequest);

// Reject a request
router.post('/reject', rejectRequest);

// Influencer signup
router.post('/signup', influencerSignup);

// const { verifySignupToken } = require('../controllers/tokenController');
// router.get('/verify', verifySignupToken);

router.get('/verifyToken', verifyToken);

module.exports = router;
