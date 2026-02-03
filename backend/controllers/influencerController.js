//backend/controllers/influencerController.js
const supabase = require('../config/supabaseClient');

exports.getMyProfile = async (req, res) => {
  try {
    const auth_user_id = req.user.id;

    const { data, error } = await supabase
      .from('influencer')
      .select('*')
      .eq('auth_user_id', auth_user_id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Influencer profile not found' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get all influencers for admin view
exports.getAllInfluencers = async (req, res) => {
  try {
    // Fetch all influencers from supabase
    const { data: influencers, error } = await supabase
      .from('influencer')
      .select('*');

    if (error) {
      console.error('Error fetching influencers:', error);
      return res.status(500).json({ error: 'Failed to fetch influencers' });
    }

    // Convert any null values in tags to empty array
    const processedInfluencers = influencers.map(inf => ({
      ...inf,
      tags: inf.tags || []
    }));

    res.status(200).json({ influencers: processedInfluencers });
  } catch (err) {
    console.error('Error in getAllInfluencers:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


// Update influencer tags & Instagram ID
exports.updateInfluencerTags = async (req, res) => {
  try {
    const auth_user_id = req.user.id;
    const { tags, instagram_id } = req.body;

    // Fetch influencer record
    const { data: influencer, error: fetchError } = await supabase
      .from('influencer')
      .select('*')
      .eq('auth_user_id', auth_user_id)
      .single();

    if (fetchError || !influencer) {
      return res.status(404).json({ error: 'Influencer profile not found' });
    }

    // ✅ Validation: tags
    if (tags) {
      if (!Array.isArray(tags)) {
        return res.status(400).json({ error: 'Tags must be an array.' });
      }

      if (tags.length > 5) {
        return res.status(400).json({ error: 'Maximum 5 tags allowed.' });
      }

        const invalidTags = tags.filter(tag => !/^[A-Za-z ]+$/.test(tag));

      if (invalidTags.length > 0) {
        return res.status(400).json({ error: 'Tags may only contain letters (A–Z or a–z).' });
      }
    }

    // ✅ Prepare updated fields
    const updateData = {};
    if (tags) updateData.tags = tags;
    if (instagram_id !== undefined) updateData.instagram_id = instagram_id;

    // ✅ Update in Supabase
    const { data: updatedData, error: updateError } = await supabase
      .from('influencer')
      .update(updateData)
      .eq('auth_user_id', auth_user_id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Update influencer error:', updateError);
      return res.status(500).json({ error: 'Failed to update influencer.' });
    }

    // ✅ Return updated influencer
    return res.status(200).json(updatedData);
  } catch (err) {
    console.error('Update influencer tags error:', err);
    return res.status(500).json({ error: 'Server error during update.' });
  }
};


exports.updateInstagram = async (req, res) => {
  try {
    const auth_user_id = req.user.id;
    const { instagram_id } = req.body;

    if (!instagram_id) {
      return res.status(400).json({ error: "Instagram ID is required" });
    }

    const { data, error } = await supabase
      .from("influencer")
      .update({ instagram_id })
      .eq("auth_user_id", auth_user_id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Instagram ID updated",
      data
    });

  } catch (err) {
    console.error("Update Instagram error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


exports.updatePhone = async (req, res) => {
  try {
    const auth_user_id = req.user.id;
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const { data, error } = await supabase
      .from("influencer")
      .update({ phone })
      .eq("auth_user_id", auth_user_id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Phone updated",
      data
    });

  } catch (err) {
    console.error("Update phone error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

