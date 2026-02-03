//influencer-dashboard_v2/src/admin/components/CampaignComponents/CampaignDetailsModal.js
import React from "react";
import "./../../css/CampaignTab.css";

export default function CampaignDetailsModal({ campaign, onClose }) {
  if (!campaign) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Campaign Details</h3>
        <table style={{ width: "100%", marginTop: "10px" }}>
          <tbody>
            <tr>
              <td><strong>Brand Name:</strong></td>
              <td>{campaign.brand_name}</td>
            </tr>
            <tr>
              <td><strong>Start Date:</strong></td>
              <td>{new Date(campaign.start_date).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>End Date:</strong></td>
              <td>{new Date(campaign.end_date).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>Duration:</strong></td>
              <td>{campaign.duration}</td>
            </tr>
            <tr>
              <td><strong>Budget:</strong></td>
              <td>₹{Number(campaign.budget).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td><strong>Profit Margin %:</strong></td>
              <td>{campaign.profit_margin}%</td>
            </tr>
            <tr>
              <td><strong>Profit Amount:</strong></td>
              <td>₹{Number(campaign.profit_amount).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td><strong>Payment per Influencer:</strong></td>
              <td>₹{Number(campaign.payment_amount).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td><strong>Number of Influencers:</strong></td>
              <td>{campaign.num_influencers}</td>
            </tr>
            <tr>
              <td><strong>Status:</strong></td>
              <td>{campaign.status}</td>
            </tr>
            <tr>
              <td><strong>Objective:</strong></td>
              <td>{campaign.objective}</td>
            </tr>
          </tbody>
        </table>

        <div className="modal-actions" style={{ justifyContent: "center", marginTop: "20px" }}>
          <button className="cancel-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
