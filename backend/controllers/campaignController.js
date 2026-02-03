// backend/controllers/campaignController.js
const supabase = require('../config/supabaseClient');

const isValidDate = (d) => !isNaN(new Date(d).getTime());
const requiredFieldsPresent = (obj, fields) => fields.every(f => obj[f] !== undefined && obj[f] !== null && `${obj[f]}`.toString().trim() !== '');

const ALLOWED_STATUSES = ['upcoming','ongoing','completed','paused'];


async function listCampaigns(req, res) {
  try {
    const { status, search, page = 1, limit = 20, brand_id } = req.query;
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

    // Include duration and brand name
    let query = supabase
      .from('campaigns')
      .select(`
        campaign_id,
        campaign_name,
        start_date,
        end_date,
        objective,
        budget,
        num_influencers,
        duration,
        status,
        profit_margin,
        profit_amount,
        payment_amount,
        brand_id,
        brands!campaigns_brand_id_fkey(name)
      `, { count: 'exact' })
      .is('deleted_at', null);

    if (status) query = query.eq('status', status);
    if (brand_id) query = query.eq('brand_id', brand_id);
    if (search) query = query.ilike('campaign_name', `%${search}%`);

    query = query.order('created_at', { ascending: false })
                 .range(offset, offset + parseInt(limit, 10) - 1);

    const { data = [], error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const today = new Date();
    const updatedData = data.map(item => {
      const calcStatus = item.status || (() => {
        const start = new Date(item.start_date);
        const end = new Date(item.end_date);
        if (today >= start && today <= end) return 'ongoing';
        if (today > end) return 'completed';
        return 'upcoming';
      })();

      return {
        ...item,
        status: calcStatus,
        brand_name: item.brands?.name || "-", // map brand relation to brand_name
        duration: item.duration || "-"       // use generated duration column
      };
    });

    res.json({
      data: updatedData,
      total: count || updatedData.length,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });
  } catch (err) {
    console.error("listCampaigns catch:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}


async function getCampaigns(req, res) {
  try {
    const { id } = req.params;

    // Base query with brand info
    let query = supabase
      .from("campaigns")
      .select(`
        campaign_id,
        campaign_name,
        objective,
        start_date,
        end_date,
        budget,
        num_influencers,
        brand_id,
        status,
        profit_margin,
        profit_amount,
        payment_amount,
        brands!campaigns_brand_id_fkey(name)
      `);

    if (id) query = query.eq("campaign_id", id).single();

    const { data, error } = await query;

    if (error) {
      console.error("Supabase getCampaigns error:", error);
      return res.status(500).json({ error: error.message });
    }

    const today = new Date();

    // Function to calculate status
    const calcStatus = (item) => {
      const start = new Date(item.start_date);
      const end = new Date(item.end_date);
      if (item.status) return item.status; // use DB value if present
      if (today >= start && today <= end) return "ongoing";
      if (today > end) return "completed";
      return "upcoming";
    };

    let updatedData;

    if (Array.isArray(data)) {
      updatedData = data.map(item => ({ ...item, status: calcStatus(item) }));
    } else if (data) {
      updatedData = { ...data, status: calcStatus(data) };
    } else {
      updatedData = null;
    }

    res.status(200).json(updatedData);
  } catch (err) {
    console.error("getCampaigns catch:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}


async function createCampaign(req, res) {
  try {
    const required = ['campaign_name','brand_id','objective','start_date','end_date','budget','num_influencers'];
    if (!requiredFieldsPresent(req.body, required)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { campaign_name, brand_id, objective, start_date, end_date, budget, num_influencers } = req.body;

    const start = new Date(start_date);
    const end = new Date(end_date);
    const today = new Date();
    let status = "upcoming";
    if (today >= start && today <= end) status = "ongoing";
    else if (today > end) status = "completed";

    const { data, error } = await supabase
      .from("campaigns")
      .insert([
        {
          campaign_name,
          brand_id,
          objective,
          start_date,
          end_date,
          budget,
          num_influencers,
          status
        }
      ])
      .select("*")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: "Campaign created successfully", campaign: data });
  } catch (err) {
    console.error("createCampaign catch:", err);
    res.status(500).json({ error: err.message });
  }
}


// async function updateCampaign(req, res) {
//   try {
//     const { id } = req.params;
//     const { campaign_name, objective, start_date, end_date, budget, num_influencers, status } = req.body;

    
    

//     // Validate dates if present
//     if ((start_date && !isValidDate(start_date)) || (end_date && !isValidDate(end_date)))
//       return res.status(400).json({ error: 'Invalid dates' });

//     if (start_date && end_date && new Date(end_date) < new Date(start_date))
//       return res.status(400).json({ error: 'end_date must be >= start_date' });

//     if (status && !ALLOWED_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });

//     const updateObj = {};
//     if (campaign_name !== undefined) updateObj.campaign_name = campaign_name;
//     if (objective !== undefined) updateObj.objective = objective;
//     if (start_date !== undefined) updateObj.start_date = start_date;
//     if (end_date !== undefined) updateObj.end_date = end_date;
//     if (budget !== undefined) {
//       if (Number(budget) <= 0) return res.status(400).json({ error: 'Budget must be > 0' });
//       updateObj.budget = budget;
//     }
//     if (num_influencers !== undefined) {
//       if (Number(num_influencers) < 0) return res.status(400).json({ error: 'num_influencers must be >= 0' });
//       updateObj.num_influencers = num_influencers;
//     }
//     if (status !== undefined) updateObj.status = status;
//     if (objective !== undefined) updateObj.objective = objective;

//     const { data, error } = await supabase
//       .from('campaigns')
//       .update({ ...updateObj, updated_at: new Date() })
//       .eq('campaign_id', id)
//       .select('*')
//       .single();

//     if (error) return res.status(500).json({ error: error.message });

//     res.json({ message: 'Campaign updated', campaign: data });
//   } catch (err) {
//     console.error('updateCampaign', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// }


async function updateCampaign(req, res) {
  try {
    const { id } = req.params;
    const {
      campaign_name,
      objective,
      start_date,
      end_date,
      budget,
      num_influencers,
      status, // optional, but we’ll override it based on date logic
    } = req.body;

    // Helper to validate date strings
    const isValidDate = (d) => !isNaN(new Date(d).getTime());

    // Validate dates if present
    if ((start_date && !isValidDate(start_date)) || (end_date && !isValidDate(end_date)))
      return res.status(400).json({ error: "Invalid dates" });

    if (start_date && end_date && new Date(end_date) < new Date(start_date))
      return res.status(400).json({ error: "end_date must be >= start_date" });

    const updateObj = {};

    if (campaign_name !== undefined) updateObj.campaign_name = campaign_name;
    if (objective !== undefined) updateObj.objective = objective;
    if (start_date !== undefined) updateObj.start_date = start_date;
    if (end_date !== undefined) updateObj.end_date = end_date;

    if (budget !== undefined) {
      if (Number(budget) <= 0)
        return res.status(400).json({ error: "Budget must be > 0" });
      updateObj.budget = budget;
    }

    if (num_influencers !== undefined) {
      if (Number(num_influencers) < 0)
        return res.status(400).json({ error: "num_influencers must be >= 0" });
      updateObj.num_influencers = num_influencers;
    }

    // 🔹 Recalculate campaign status automatically
    const today = new Date();
    const startDate = start_date ? new Date(start_date) : null;
    const endDate = end_date ? new Date(end_date) : null;

    let recalculatedStatus = status; // fallback
    if (startDate && endDate) {
      if (today < startDate) recalculatedStatus = "upcoming";
      else if (today >= startDate && today <= endDate)
        recalculatedStatus = "ongoing";
      else recalculatedStatus = "completed";
    }

    updateObj.status = recalculatedStatus;
    updateObj.updated_at = new Date();

    // 🔹 Update in Supabase
    const { data, error } = await supabase
      .from("campaigns")
      .update(updateObj)
      .eq("campaign_id", id)
      .select("*")
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.json({
      message: "Campaign updated successfully",
      campaign: data,
    });
  } catch (err) {
    console.error("updateCampaign Error:", err);
    res.status(500).json({ error: "Server error" });
  }
}


async function bulkDeleteCampaigns(req, res) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array required' });

    const { data, error } = await supabase
      .from('campaigns')
      .update({ deleted_at: new Date(), status: 'paused', updated_at: new Date() })
      .in('campaign_id', ids)
      .select('*');

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Campaign(s) soft-deleted', campaigns: data });
  } catch (err) {
    console.error('bulkDeleteCampaigns', err);
    res.status(500).json({ error: 'Server error' });
  }
}


async function updateCampaignPayment(req, res) {
  try {
    const { id } = req.params;
    let { profit_margin_percent, num_influencers } = req.body;

    if (profit_margin_percent === undefined)
      return res.status(400).json({ error: "profit_margin_percent required" });

    profit_margin_percent = Number(profit_margin_percent);
    if (isNaN(profit_margin_percent) || profit_margin_percent < 0 || profit_margin_percent > 100)
      return res.status(400).json({ error: "profit_margin_percent must be between 0 and 100" });

    // 1️⃣ Fetch campaign details
    const { data: campaign, error: fetchErr } = await supabase
      .from("campaigns")
      .select("campaign_id, campaign_name, budget, num_influencers, status")
      .eq("campaign_id", id)
      .single();

    if (fetchErr || !campaign)
      return res.status(404).json({ error: fetchErr?.message || "Campaign not found" });

    // 2️⃣ Prevent updates on completed campaigns
    if (campaign.status === "completed") {
      return res.status(400).json({ error: "Cannot update payment for a completed campaign" });
    }

    // 3️⃣ Determine influencer count
    const effective_num_influencers =
      num_influencers && Number(num_influencers) > 0
        ? Number(num_influencers)
        : Number(campaign.num_influencers);

    if (!effective_num_influencers || effective_num_influencers <= 0)
      return res.status(400).json({ error: "num_influencers must be > 0" });

    // 4️⃣ Calculate profit & payment
    const budget = Number(campaign.budget);
    const profit_amount = Math.round(((budget * profit_margin_percent) / 100) * 100) / 100;
    const payment_amount =
      Math.round(((budget - profit_amount) / effective_num_influencers) * 100) / 100;

    if (payment_amount < 0)
      return res.status(400).json({ error: "Invalid calculation (profit too large)" });

    // 5️⃣ Update Campaigns Table
    const { data: updatedCampaign, error: updateErr } = await supabase
      .from("campaigns")
      .update({
        profit_margin: profit_margin_percent,
        profit_amount,
        payment_amount,
        num_influencers: effective_num_influencers,
        updated_at: new Date(),
      })
      .eq("campaign_id", id)
      .select("*")
      .single();

    if (updateErr) return res.status(500).json({ error: updateErr.message });

    // 6️⃣ Insert record in Payment History
    const { data: historyEntry, error: insertErr } = await supabase
      .from("payment_history")
      .insert([
        {
          campaign_id: campaign.campaign_id,
          profit_percent: profit_margin_percent,
          profit_amount,
          payment_per_influencer: payment_amount,
          num_influencers: effective_num_influencers,
        },
      ])
      .select("*")
      .single();

    if (insertErr) {
      console.error("⚠️ Payment history insert failed:", insertErr.message);
      // Not fatal — campaign update already succeeded
    }

    // 7️⃣ Respond back
    return res.json({
      message: "✅ Payment calculated and saved successfully",
      campaign: updatedCampaign,
      payment_history: historyEntry || null,
    });

  } catch (err) {
    console.error("updateCampaignPayment Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}


module.exports = {
  listCampaigns,
  getCampaigns,
  createCampaign,
  updateCampaign,
  bulkDeleteCampaigns,
  updateCampaignPayment
};
