// /src/admin/components/CampaignComponents/CampaignForm.js
import React, { useState, useEffect } from "react";
import API from "./../../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./../../css/CampaignTab.css";

export default function CampaignForm({ show, onClose, campaign }) {
  const [form, setForm] = useState({
    campaign_name: "",
    brand_id: "",
    objective: "",
    start_date: "",
    end_date: "",
    budget: "",
    num_influencers: 0
  });
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBrands();
    if (campaign) {
      setForm({
        campaign_name: campaign.campaign_name || "",
        brand_id: campaign.brand_id || "",
        objective: campaign.objective || "",
        start_date: campaign.start_date ? campaign.start_date.split("T")[0] : "",
        end_date: campaign.end_date ? campaign.end_date.split("T")[0] : "",
        budget: campaign.budget ?? "",
        num_influencers: campaign.num_influencers ?? 0
      });
    }
  }, [campaign]);

  const fetchBrands = async () => {
    try {
      const res = await API.get("/brands");
      setBrands(res.data);
    } catch (err) {
      console.error("fetchBrands", err);
      toast.error("Failed to fetch brands");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.campaign_name.trim()) return "Campaign Name is required";
    if (!form.brand_id) return "Brand is required";
    if (!form.objective || !form.objective.trim()) return "Objective is required";
    if (!form.start_date || !form.end_date) return "Start and End dates are required";
    if (new Date(form.end_date) < new Date(form.start_date)) return "End Date must be after Start Date";
    if (form.budget === "" || Number(form.budget) <= 0) return "Budget must be greater than 0";
    if (form.num_influencers === "" || Number(form.num_influencers) < 0) return "Number of influencers required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      campaign_name: form.campaign_name,
      brand_id: form.brand_id,
      objective: form.objective,
      start_date: form.start_date,
      end_date: form.end_date,
      budget: Number(form.budget),
      num_influencers: Number(form.num_influencers)
    };

    try {
      if (campaign) {
        const res = await API.put(`/campaigns/${campaign.campaign_id}`, payload);
        toast.success(res.data.message || "Campaign updated successfully");
      } else {
        const res = await API.post("/campaigns", payload);
        toast.success(res.data.message || "Campaign added successfully");
      }
      onClose();
    } catch (err) {
      console.error("handleSubmit err:", err);
      const serverMsg = err.response?.data?.error || err.message || "Failed to save campaign";
      setError(serverMsg);
      toast.error(serverMsg);
    }
  };

  if (!show) return null;

  return (
    <div className="campaign-modal-overlay">
      <div className="campaign-modal-content">
        <h3>{campaign ? "Edit Campaign" : "Add Campaign"}</h3>
        <button type="button" className="close-btn" onClick={onClose}>×</button>
        {error && <p className="error">{error}</p>}
        <form className="campaign-form" onSubmit={handleSubmit}>
          <label>Campaign Name*</label>
          <input name="campaign_name" value={form.campaign_name} onChange={handleChange} required />

          <label>Brand*</label>
          <select name="brand_id" value={form.brand_id} onChange={handleChange} required>
            <option value="">Select Brand</option>
            {brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.name}</option>)}
          </select>

          <label>Objective*</label>
          <textarea name="objective" value={form.objective} onChange={handleChange} rows={5} required />

          <div className="campaign-date-row">
            <div>
              <label>Start Date*</label>
              <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required />
            </div>
            <div>
              <label>End Date*</label>
              <input type="date" name="end_date" value={form.end_date} onChange={handleChange} required />
            </div>
          </div>

          <label>Budget*</label>
          <input type="number" name="budget" value={form.budget} onChange={handleChange} required />

          <label>Number of Influencers*</label>
          <input type="number" name="num_influencers" value={form.num_influencers} onChange={handleChange} required />

          <div className="modal-actions">
            <button type="submit" className="save-btn">Save</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
