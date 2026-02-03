// backend/controllers/paymentHistoryController.js
const supabase = require("../config/supabaseClient");

exports.getAllPaymentHistory = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("payment_history")
      .select(`
        id,
        profit_percent,
        profit_amount,
        payment_per_influencer,
        num_influencers,
        calculated_at,
        campaigns:campaign_id (
          campaign_id,
          campaign_name,
          budget,
          brands:brand_id (
            brand_id,
            name
          )
        )
      `)
      .order("calculated_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("getAllPaymentHistory:", err.message);
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
};
