//influencer-dashboard_v2/src/admin/components/InfluencerRequests.js

import React, { useEffect, useState } from "react";
import API from "../../api";
import "../css/Admin.css";
import "../css/InfluencerRequests.css";

function InfluencerRequests({ currentAdmin }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Filters ---
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // Fetch requests
  const fetchRequests = async () => {
    try {
      const res = await API.get("/admin/requests");
      setRequests(res.data.requests);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
  if (!currentAdmin?.admin_id) {
    alert("Admin not logged in");
    return;
  }

  try {
    const res = await API.post(`/admin/requests/${id}/action`, { action });

    // Update request locally
    setRequests(prev =>
      prev.map(req =>
        req.request_id === id
          ? {
              ...req,
              status: res.data.status,
              approved: res.data.status === "Approved",
              deleted_at: res.data.status === "Rejected" ? new Date().toISOString() : null,
              email_sent: res.data.email_sent
            }
          : req
      )
    );

    alert(`Request ${res.data.status} successfully`);
  } catch (err) {
    console.error("Action error:", err);
    alert(err.response?.data?.error || "Failed to process request.");
  }
};


  if (loading) return <div className="loader">Loading Influencers Request...</div>;


  //OG RETURN FUNCTION
  return (
    <div className="requests-table-container">
      <h2>Influencer Requests</h2>
      <div className="request-filters">
         <div className="request-filters-left">
              <label>Name:</label>
              <input
                type="text"
                placeholder="🔍 Search by Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="filter-input"
              />
          </div>
          <div className="request-filters-right">
                <label>From:</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="filter-date"
                />

                <label>To:</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="filter-date"
                />
          </div>
      </div>

      <table className="requests-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Instagram ID</th>
            <th>Tags</th>            
            <th>Request Date</th>
            <th>Email Sent</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {requests
            .filter((req) => {
              const matchesName = req.name
                ?.toLowerCase()
                .includes(search.toLowerCase());
              const requestDate = new Date(req.request_date);
              const fromDate = dateRange.from ? new Date(dateRange.from) : null;
              const toDate = dateRange.to ? new Date(dateRange.to) : null;

              const matchesDate =
                (!fromDate || requestDate >= fromDate) &&
                (!toDate || requestDate <= toDate);

              return matchesName && matchesDate;
            })
          .map(req => (
            <tr key={req.request_id}>
              <td>{req.name}</td>
              <td>{req.email}</td>
              <td>{req.instagram_id}</td>
              <td>{Array.isArray(req.tags) ? req.tags.join(", ") : req.tags}</td>


              <td>
                {req.request_date
                  ? new Date(req.request_date).toLocaleDateString("en-IN",)
                  : "—"}
              </td>
              <td>
                {req.email_sent === true
                  ? "Yes"
                  : req.email_sent === false
                  ? "No"
                  : "Pending"}
              </td>

              <td>
                {req.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleAction(req.request_id, "approve")}
                      className="approve-btn"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(req.request_id, "reject")}
                      className="reject-btn"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span className={`status ${req.status}`}>{req.status}</span>
                )}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

}

export default InfluencerRequests;

