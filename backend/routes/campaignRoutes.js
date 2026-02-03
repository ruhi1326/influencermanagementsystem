// backend/routes/campaignRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/campaignController');

// List with query params
router.get('/', ctrl.listCampaigns);

// Get single
router.get('/:id', ctrl.getCampaigns);

// Create
router.post('/', ctrl.createCampaign);

// Update
router.put('/:id', ctrl.updateCampaign);

// Bulk soft-delete
router.post('/bulk-delete', ctrl.bulkDeleteCampaigns);

// Payment calculation and save
router.put('/:id/payment', ctrl.updateCampaignPayment);

// Campaigns by brand
router.get('/brand/:brand_id', async (req, res) => {
  const { brand_id } = req.params;
  try {
    const { data, error } = await require('../config/supabaseClient')
      .from('campaigns')
      .select('*')
      .eq('brand_id', brand_id)
      .eq('deleted', false)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
