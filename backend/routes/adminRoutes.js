//backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {getInfluencerRequests, loginAdmin, handleRequestAction, updateStatus } = require('../controllers/adminController');
const { getAllInfluencers } = require('../controllers/influencerController');
const adminMiddleware = require('../middleware/adminMiddleware');

// Admin login route
router.post('/login', loginAdmin);

// Get all influencer requests
router.get('/requests', getInfluencerRequests);

// Get all influencers
router.get('/influencers', getAllInfluencers);

//Update status
router.patch('/update-status', updateStatus);

// Handle action (approve/reject via single endpoint)
router.post('/requests/:id/action', adminMiddleware, handleRequestAction);

module.exports = router;
