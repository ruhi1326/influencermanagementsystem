// /src/admin/components/CampaignTab.js
import React, { useState, useEffect } from "react";
import API from "../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./../css/CampaignTab.css";
import CampaignForm from "./CampaignComponents/CampaignForm";
import CampaignDetailsModal from "./CampaignComponents/CampaignDetailsModal";

export default function CampaignTab() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [detailsCampaign, setDetailsCampaign] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await API.get("/campaigns");
      let data = Array.isArray(res.data?.data) ? res.data.data : [];

      // Map API response to ensure brand_name, status, and duration always exist
      data = data.map(item => ({
        ...item,
        brand_name: item.brands?.name || "-",       // safe brand
        status: item.status || "upcoming",          // safe status fallback
        // duration: item.duration || "-"              // use DB generated duration
      }));

      setCampaigns(data);
    } catch (err) {
      console.error("Campaign fetch error:", err);
      toast.error("Failed to fetch campaigns");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedCampaigns(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (selectedCampaigns.length === 0) return toast.error("No campaigns selected");
    if (!window.confirm("Are you sure you want to delete selected campaign(s)?")) return;
    try {
      await API.post("/campaigns/bulk-delete", { ids: selectedCampaigns });
      toast.success("Deleted successfully");
      setSelectedCampaigns([]);
      fetchCampaigns();
    } catch (err) {
      console.error("Bulk delete error:", err);
      toast.error("Failed to delete campaigns");
    }
  };

  const handleAdd = () => {
    setEditingCampaign(null);
    setShowForm(true);
  };

  const handleEdit = () => {
    if (selectedCampaigns.length !== 1)
      return toast.error("Please select exactly one campaign to edit");
    const campaign = campaigns.find(c => c.campaign_id === selectedCampaigns[0]);
    setEditingCampaign(campaign);
    setShowForm(true);
  };

  const handleRowClick = (campaign) => {
    setDetailsCampaign(campaign);
    setShowDetails(true);
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchSearch =
      (c.campaign_name || "").toLowerCase().includes(searchText.toLowerCase()) ||
      (c.brand_name || "").toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter ? c.status === statusFilter : true;
    return matchSearch && matchStatus;
  });


  return (
  <div className="campaign-tab-container">
    <ToastContainer position="top-center" autoClose={2000} />

    {/* ==== HEADER ==== */}
    <div className="campaign-header">
      <h2>Campaign Management</h2>
      <p>NOTE: Click on campaign name for more details.</p>
    </div>

    {/* ==== TOOLBAR ==== */}
    <div className="campaign-toolbar">
      <div className="toolbar-left">
        <input
          type="text"
          placeholder="🔍Search by campaign/brand"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="campaign-search"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="campaign-filter"
        >
          <option value="">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      <div className="toolbar-right">
        <button className="btn add-btn" onClick={handleAdd}>+ Add Campaign</button>
        <button className="btn edit-btn" onClick={handleEdit}>Edit Campaign</button>
        <button className="btn delete-btn" onClick={handleDelete}>Delete</button>
      </div>
    </div>

    {/* ==== TABLE ==== */}
    {loading ? (
      <p>Loading campaigns...</p>
    ) : (
      <table className="campaign-table">
        <thead>
          <tr>
            <th></th>
            <th>Sr no</th>
            <th>Campaign Name</th>
            <th>Brand</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Budget</th>
            <th>Status</th>            
            <th>Num Influencers</th>
          </tr>
        </thead>
        <tbody>
          {filteredCampaigns.length === 0 ? (
            <tr>
              <td colSpan="9" style={{ textAlign: "center" }}>No campaigns found</td>
            </tr>
          ) : (
            filteredCampaigns.map((c, index) => (
              <tr key={c.campaign_id}>
                {/* <td>{index + 1}</td> */}
                <td>
                  <input
                    type="checkbox"
                    checked={selectedCampaigns.includes(c.campaign_id)}
                    onChange={() => toggleSelect(c.campaign_id)}
                  />
                </td>
                <td>{index + 1}</td>
                <td className="clickable" onClick={() => handleRowClick(c)}>
                  {c.campaign_name || "-"}
                </td>
                <td>{c.brand_name}</td>
                <td>{c.start_date ? new Date(c.start_date).toLocaleDateString('en-IN') : '-'}</td>
                <td>{c.end_date ? new Date(c.end_date).toLocaleDateString('en-IN') : '-'}</td>
                <td>₹{Number(c.budget ?? "-").toLocaleString('en-IN')}</td>
                <td>
                  <span className={`status-badge ${c.status}`}>{c.status}</span>
                </td>
                {/* <td>{c.profit_margin ?? "-"}</td> */}
                <td>{c.num_influencers ?? "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    )}

    {/* ==== MODALS ==== */}
    {showForm && (
      <CampaignForm
        show={showForm}
        onClose={() => {
          setShowForm(false);
          fetchCampaigns();
          setSelectedCampaigns([]);
        }}
        campaign={editingCampaign}
      />
    )}

    {showDetails && detailsCampaign && (
      <CampaignDetailsModal
        show={showDetails}
        onClose={() => setShowDetails(false)}
        campaign={detailsCampaign}
      />
    )}
  </div>
);

}
