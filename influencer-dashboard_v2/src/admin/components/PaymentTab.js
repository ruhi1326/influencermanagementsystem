//influencer-dashboard_v2/src/admin/components/PaymentTab.js
import React, { useState, useEffect } from "react";
import API from "../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./../css/PaymentTab.css";

export default function PaymentTab() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [profitPercent, setProfitPercent] = useState("");
  const [numInfluencers, setNumInfluencers] = useState("");
  const [calculatedProfit, setCalculatedProfit] = useState(0);
  const [calculatedPPI, setCalculatedPPI] = useState(0);

  // Fetch all campaigns (exclude completed)
  const fetchCampaigns = async () => {
    try {
      const res = await API.get("/campaigns");
      console.log("CAMPAIGN API RESPONSE:", res.data);

      const campaignArray = Array.isArray(res.data)
        ? res.data
        : res.data?.data || []; // ✅ safely grab res.data.data

      const filtered = campaignArray.filter(
        (c) => c.status?.toLowerCase() !== "completed"
      );

setCampaigns(filtered);

      
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch campaigns");
    }
  };


  const [paymentHistory, setPaymentHistory] = useState([]);

// const fetchPaymentHistory = async () => {
//       try {
//         const res = await API.get("/payment-history");
//         setPaymentHistory(Array.isArray(res.data) ? res.data : []);
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to fetch payment history");
//       }
//     };

const fetchPaymentHistory = async () => {
  try {
    const res = await API.get("/payment-history");

    // Adjust depending on backend structure
    const history = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
      ? res.data.data
      : [];

    setPaymentHistory(history);
  }catch (err) {
    console.error(err);
    toast.error("Failed to fetch payment history");
  }
};


useEffect(() => {
  fetchCampaigns();
  fetchPaymentHistory();
}, []);


  // When campaign changes → auto fill budget & influencers
  const handleCampaignSelect = (id) => {
    setSelectedCampaignId(id);
    const c = campaigns.find((x) => x.campaign_id === id);
    setSelectedCampaign(c || null);
    if (c) {
      setNumInfluencers(c.num_influencers || "");
    }
    setProfitPercent("");
    setCalculatedProfit(0);
    setCalculatedPPI(0);
  };

  // Calculate profit & PPI
const handleCalculate = () => {
  if (!selectedCampaign) return toast.error("Select a campaign first");
  if (!profitPercent || profitPercent <= 0)
    return toast.error("Enter a valid profit percentage");

  const profit = (selectedCampaign.budget * parseFloat(profitPercent)) / 100;
  const ppi =
    numInfluencers > 0
      ? (selectedCampaign.budget - profit) / numInfluencers
      : 0;

  setCalculatedProfit(profit.toFixed(2));
  setCalculatedPPI(ppi.toFixed(2));
};


  // Save payment → backend + payment_history
  const handleSave = async () => {
    if (!selectedCampaignId) return toast.error("Select a campaign first");

    try {
      const payload = {
        profit_margin_percent: profitPercent,
        num_influencers: numInfluencers,
      };

      await API.put(`/campaigns/${selectedCampaignId}/payment`, payload);
      toast.success("Payment details saved successfully!");

      // Reset
      setSelectedCampaignId("");
      setSelectedCampaign(null);
      setProfitPercent("");
      setNumInfluencers("");
      setCalculatedProfit(0);
      setCalculatedPPI(0);

      fetchCampaigns();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save payment details");
    }
  };

  // Cancel → clear all
  const handleCancel = () => {
    setSelectedCampaignId("");
    setSelectedCampaign(null);
    setProfitPercent("");
    setNumInfluencers("");
    setCalculatedProfit(0);
    setCalculatedPPI(0);
  };

  return (
    <div className="payment-tab-container">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="payment-tab-header">
      <h2>Campaign Payment Calculator</h2>
      </div>

      <div className="calculator">
        <label>Select Campaign:</label>
        <select
          value={selectedCampaignId}
          onChange={(e) => handleCampaignSelect(e.target.value)}
        >
          <option value="">--Select Campaign--</option>
          {campaigns.map((c) => (
            <option key={c.campaign_id} value={c.campaign_id}>
              {c.campaign_name} ({c.brand_name})
            </option>
          ))}
        </select>

        {selectedCampaign && (
          <>
            <label>Budget (₹):</label>
            <input
              type="number"
              value={selectedCampaign.budget}
              readOnly
              className="readonly"
            />

            <label>Number of Influencers:</label>
            <input
              type="number"
              value={numInfluencers}
              onChange={(e) => setNumInfluencers(e.target.value)}
              placeholder="Enter influencer count"
            />

            <label>Profit Margin (%):</label>
            <input
              type="number"
              value={profitPercent}
              onChange={(e) => {
                const val = e.target.value;
                if (val <= 99) setProfitPercent(val);
              }}
              placeholder="Enter profit % (max 99)"
            />

            <div className="calculator-buttons">
              <button onClick={handleCalculate}>Calculate</button>
              <button onClick={handleSave} className="save-btn" disabled={calculatedPPI <= 0}> Save </button>
              <button onClick={handleCancel} className="cancel-btn"> Cancel </button>
            </div>

            {calculatedProfit > 0 && (
              <div className="calculator-result">
                <p>Profit Amount: ₹{calculatedProfit}</p>
                <p>Payment per Influencer: ₹{calculatedPPI}</p>
              </div>
            )}
          </>
        )}
      </div>

        <div className="payment-history-section">
          <h3 style={{ marginTop: "30px" }}>Payment History Table</h3>
          <table className="payment-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Brand</th>
                <th>Profit %</th>
                <th>Profit ₹</th>
                <th>Pay/Influencer</th>
                <th>Influencers</th>
                <th>Calculated At</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No payment history found
                  </td>
                </tr>
              ) : (
                paymentHistory.map((p) => (
                  <tr key={p.id}>
                    <td>{p.campaigns?.campaign_name || "—"}</td>
                    <td>{p.campaigns?.brands?.name || "—"}</td>
                    <td>{p.profit_percent}%</td>
                    <td>₹{Number(p.profit_amount).toLocaleString('en-IN')}</td>
                    <td>₹{Number(p.payment_per_influencer).toLocaleString('en-IN')}</td>
                    <td>{p.num_influencers}</td>
                    <td>{new Date(p.calculated_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>




    </div>
  );
}
