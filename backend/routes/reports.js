
//influencer-final/backend/routes/reports.js
const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');

// GET /api/admin/reports?type=requests&month=10&year=2025
router.get('/', async (req, res) => {
    try {
        const { type, month, year } = req.query;

        // 1. Validate query params
        if (!type || type !== 'requests') {
            return res.status(400).json({ error: 'Invalid report type' });
        }
        if (!month || month < 1 || month > 12 || !year) {
            return res.status(400).json({ error: 'Invalid month or year' });
        }

        // 2. Fetch data from Supabase
        const monthInt = parseInt(month);
        const yearInt = parseInt(year);

        // Day-wise request counts
        const { data: dailyData, error: dailyError } = await supabase
            .from('influencer_request')
            .select(`request_date, approved`)
            .gte('request_date', `${yearInt}-${monthInt.toString().padStart(2,'0')}-01`)
            .lt('request_date', `${yearInt}-${(monthInt+1).toString().padStart(2,'0')}-01`);

        if (dailyError) throw dailyError;

        // Aggregate counts per day
        const dayMap = {};
        let totalRequests = 0;
        let approvedRequests = 0;
        let rejectedRequests = 0;
        let pendingRequests = 0;

        dailyData.forEach(item => {
            const date = new Date(item.request_date);
            const day = date.getDate();
            dayMap[day] = (dayMap[day] || 0) + 1;
            totalRequests += 1;
            // Count approved/rejected
            if (item.approved === true) approvedRequests += 1;
            else if (item.approved === false) rejectedRequests += 1;
            else if (item.approved === null) pendingRequests += 1;
        });

        // Find peak day(s)
        const maxCount = Math.max(...Object.values(dayMap), 0);
        const peakDays = Object.keys(dayMap)
            .filter(day => dayMap[day] === maxCount)
            .map(day => `${day} ${new Date(yearInt, monthInt-1).toLocaleString('default', { month: 'short' })}`);

        // Format dailyData for chart
        const chartData = [];
        for (let day = 1; day <= 31; day++) {
            chartData.push({
                day,
                total_requests: dayMap[day] || 0
            });
        }

        // Send response
        res.json({
            summary: {
                total_requests: totalRequests,
                approved_requests: approvedRequests,
                rejected_requests: rejectedRequests,
                pending_requests: pendingRequests,
                peak_days: peakDays
            },
            data: chartData
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/reports/yearly?type=requests&year=2025
router.get('/yearly', async (req, res) => {
  try {
    const { type, year } = req.query;

    if (!type || type !== 'requests') {
      return res.status(400).json({ error: 'Invalid report type' });
    }
    if (!year) {
      return res.status(400).json({ error: 'Year is required' });
    }

    const yearInt = parseInt(year);

    // Fetch all requests for the year
    const { data: yearlyData, error: yearlyError } = await supabase
      .from('influencer_request')
      .select(`request_date, approved`)
      .gte('request_date', `${yearInt}-01-01`)
      .lt('request_date', `${yearInt + 1}-01-01`);

    if (yearlyError) throw yearlyError;

    // Aggregate per month
    const monthMap = {};
    let totalRequests = 0;
    let approvedRequests = 0;
    let rejectedRequests = 0;
    let pendingRequests = 0;

    yearlyData.forEach(item => {
      const date = new Date(item.request_date);
      const month = date.getMonth() + 1; // 1-12
      monthMap[month] = (monthMap[month] || 0) + 1;
      totalRequests++;
      if (item.approved === true) approvedRequests++;
      else if (item.approved === false) rejectedRequests++;
      else if (item.approved === null) pendingRequests++;
    });

    // Find peak month(s)
    const maxCount = Math.max(...Object.values(monthMap), 0);
    const peakMonths = Object.keys(monthMap)
      .filter(m => monthMap[m] === maxCount)
      .map(m => new Date(yearInt, m - 1).toLocaleString('default', { month: 'short' }));

    const chartData = [];
    for (let m = 1; m <= 12; m++) {
      chartData.push({
        month: new Date(yearInt, m - 1).toLocaleString('default', { month: 'short' }),
        total_requests: monthMap[m] || 0
      });
    }

    res.json({
      summary: {
        total_requests: totalRequests,
        approved_requests: approvedRequests,
        rejected_requests: rejectedRequests,
        pending_requests: pendingRequests,
        peak_months: peakMonths
      },
      data: chartData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/reports/campaigns-per-brand
router.get('/campaigns-per-brand', async (req, res) => {
  try {
    const { status } = req.query;

    console.log("📊 /campaigns-per-brand hit with status:", status);

    let query = supabase
      .from('campaigns')
      .select(`
        campaign_id,
        status,
        brand_id,
        brands(name)
      `) // <-- remove !inner for now
      .is('deleted_at', null);

    if (status && status !== 'All') {
      query = query.eq('status', status.toLowerCase());
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log("✅ Supabase data fetched:", data?.length);

    const brandMap = {};
    const statusCount = { upcoming: 0, ongoing: 0, completed: 0 };

    data.forEach(item => {
      const brand = item.brands?.name || 'Unknown';
      brandMap[brand] = (brandMap[brand] || 0) + 1;

      const st = item.status?.toLowerCase();
      if (['upcoming', 'ongoing', 'completed'].includes(st)) {
        statusCount[st]++;
      }
    });

    const chartData = Object.entries(brandMap).map(([brand, count]) => ({
      brand,
      campaigns: count
    }));

    const maxCount = Math.max(...Object.values(brandMap), 0);
    const topBrands = Object.keys(brandMap).filter(b => brandMap[b] === maxCount);

    res.json({
      summary: {
        total_brands: Object.keys(brandMap).length,
        total_campaigns: data.length,
        upcoming_campaigns: statusCount.upcoming,
        ongoing_campaigns: statusCount.ongoing,
        completed_campaigns: statusCount.completed,
        top_brands: topBrands
      },
      data: chartData
    });

  } catch (error) {
    console.error('🔥 Error fetching campaigns per brand:', error);
    res.status(500).json({ error: error.message });
  }
});

// REVENUE (PROFIT) REPORT
router.get('/revenue', async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const monthInt = parseInt(month);
    const yearInt = parseInt(year);

    // Fetch campaigns within that month
    const { data, error } = await supabase
      .from('campaigns')
      .select('created_at, budget, profit_amount, payment_amount')
      .gte('created_at', `${yearInt}-${monthInt.toString().padStart(2, '0')}-01`)
      .lt('created_at', `${yearInt}-${(monthInt + 1).toString().padStart(2, '0')}-01`);

    if (error) throw error;

    // Aggregate daily revenue & profit
    const dayMap = {};
    let totalRevenue = 0;
    let totalProfit = 0;

    data.forEach(item => {
      const date = new Date(item.created_at);
      const day = date.getDate();
      const revenue = Number(item.budget || 0);
      const profit = Number(item.profit_amount || 0);
      totalRevenue += revenue;
      totalProfit += profit;
      if (!dayMap[day]) dayMap[day] = { revenue: 0, profit: 0 };
      dayMap[day].revenue += revenue;
      dayMap[day].profit += profit;
    });

    // Find peak day(s)
    const maxRevenue = Math.max(...Object.values(dayMap).map(d => d.revenue), 0);
    const peakDays = Object.keys(dayMap)
      .filter(d => dayMap[d].revenue === maxRevenue)
      .map(d => `${d} ${new Date(yearInt, monthInt - 1).toLocaleString('default', { month: 'short' })}`);

    // Format data for chart
    const chartData = [];
    for (let day = 1; day <= 31; day++) {
      chartData.push({
        day,
        revenue: dayMap[day]?.revenue || 0,
        profit: dayMap[day]?.profit || 0,
      });
    }

    res.json({
      summary: {
        total_revenue: totalRevenue,
        total_profit: totalProfit,
        peak_days: peakDays,
      },
      data: chartData,
    });

  } catch (error) {
    console.error('🔥 Error fetching monthly revenue report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// 📈 YEARLY REVENUE REPORT
router.get('/revenue/yearly', async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) return res.status(400).json({ error: 'Year is required' });

    const yearInt = parseInt(year);
    const { data, error } = await supabase
      .from('campaigns')
      .select('created_at, budget, profit_amount')
      .gte('created_at', `${yearInt}-01-01`)
      .lt('created_at', `${yearInt + 1}-01-01`);

    if (error) throw error;

    // Aggregate per month
    const monthMap = {};
    let totalRevenue = 0;
    let totalProfit = 0;

    data.forEach(item => {
      const date = new Date(item.created_at);
      const month = date.getMonth() + 1;
      const revenue = Number(item.budget || 0);
      const profit = Number(item.profit_amount || 0);
      totalRevenue += revenue;
      totalProfit += profit;
      if (!monthMap[month]) monthMap[month] = { revenue: 0, profit: 0 };
      monthMap[month].revenue += revenue;
      monthMap[month].profit += profit;
    });

    // Find peak month(s)
    const maxRevenue = Math.max(...Object.values(monthMap).map(m => m.revenue), 0);
    const peakMonths = Object.keys(monthMap)
      .filter(m => monthMap[m].revenue === maxRevenue)
      .map(m => new Date(yearInt, m - 1).toLocaleString('default', { month: 'short' }));

    // Format chart data
    const chartData = [];
    for (let m = 1; m <= 12; m++) {
      chartData.push({
        month: new Date(yearInt, m - 1).toLocaleString('default', { month: 'short' }),
        revenue: monthMap[m]?.revenue || 0,
        profit: monthMap[m]?.profit || 0,
      });
    }

    res.json({
      summary: {
        total_revenue: totalRevenue,
        total_profit: totalProfit,
        peak_months: peakMonths,
      },
      data: chartData,
    });
  } catch (error) {
    console.error('🔥 Error fetching yearly revenue report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;
