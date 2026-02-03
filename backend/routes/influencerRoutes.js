//backend/routes/influencerRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getMyProfile, updateInfluencerTags, updateInstagram, updatePhone  } = require('../controllers/influencerController');

// Protected route: Influencer Profile
router.get('/me', authMiddleware, getMyProfile);

router.put('/tags', authMiddleware, updateInfluencerTags);

router.patch('/update-instagram', authMiddleware, updateInstagram);

router.patch('/update-phone', authMiddleware, updatePhone);

module.exports = router;
