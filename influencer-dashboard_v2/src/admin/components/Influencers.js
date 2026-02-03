// src/admin/components/Influencers.js
import React, { useEffect, useState } from 'react';
import API from '../../api';
import '../css/Influencers.css';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function Influencers() {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

    const [search, setSearch] = useState("");
    const [tagSearch, setTagSearch] = useState("");

  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        const res = await API.get('/admin/influencers');
        setInfluencers(res.data.influencers);
        setError("");
      } catch (err) {
        setError("Failed to fetch influencers.");
      } finally {
        setLoading(false);
      }
    };
    fetchInfluencers();
  }, []);

  if (loading) return <div className="loader">Loading influencers...</div>;
  if (error) return <div className="error">{error}</div>;

  // Convert data to CSV and trigger download
// const exportCSV = () => {
//   const filteredData = influencers.filter((inf) => {
//     const nameMatch = inf.name?.toLowerCase().includes(search.toLowerCase());
//     const tagMatch = tagSearch
//       ? inf.tags?.some((t) =>
//           t.toLowerCase().includes(tagSearch.toLowerCase())
//         )
//       : true;
//     return nameMatch && tagMatch;
//   });

//   if (filteredData.length === 0) {
//     alert("No data to export.");
//     return;
//   }

//   // CSV Header
//   const headers = ["Name", "Email", "Instagram", "Phone", "Tags", "Joined"];

//   // CSV Rows
//   const rows = filteredData.map(inf => [
//     inf.name,
//     inf.email,
//     inf.instagram_id,
//     inf.phone,
//     inf.tags.join(" | "),
//     new Date(inf.joined_at).toLocaleDateString()
//   ]);

//   // Convert to CSV string
//   let csvContent =
//     "data:text/csv;charset=utf-8," +
//     [headers, ...rows].map(e => e.join(",")).join("\n");

//   // Create download link
//   const encodedUri = encodeURI(csvContent);
//   const link = document.createElement("a");
//   link.setAttribute("href", encodedUri);
//   link.setAttribute("download", "influencers_export.csv");
//   document.body.appendChild(link);
//   link.click();
//   link.remove();
// };

const exportExcel = () => {
  const filteredData = influencers.filter((inf) => {
    const nameMatch = inf.name?.toLowerCase().includes(search.toLowerCase());
    const tagMatch = tagSearch
      ? inf.tags?.some((t) => t.toLowerCase().includes(tagSearch.toLowerCase()))
      : true;

    return nameMatch && tagMatch;
  });

  if (filteredData.length === 0) {
    alert("No data to export.");
    return;
  }

  // Convert data to worksheet format
  const excelData = filteredData.map(inf => ({
    Name: inf.name,
    Email: inf.email,
    Instagram: inf.instagram_id,
    Phone: inf.phone,
    Tags: inf.tags.join(" | "),
    Joined: new Date(inf.joined_at).toLocaleDateString()
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Influencers");

  // Export the Excel file
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, "influencers_export.xlsx");
};

const updateStatus = async (id, currentStatus) => {
  const newStatus = currentStatus === "active" ? "inactive" : "active";

  try {
    await API.patch("/admin/update-status", {
      influencer_id: id,
      status: newStatus
    });

    // Update UI instantly
    setInfluencers(prev =>
      prev.map(inf =>
        inf.influencer_id === id
          ? { ...inf, status: newStatus }
          : inf
      )
    );

  } catch (err) {
    alert("Failed to update status");
  }
};


  return (
    <div className="influencers-container">
      <h2>Influencers</h2>
      <div className='influencer-filters'>
         <div className="influencer-filters-left">
              <label>Name:</label>
              <input
                type="text"
                placeholder="🔍 Search by Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="filter-input"
              />
          </div>

          <div className="influencer-status-filter">
            <label>Status:</label>
            <select
              className="filter-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

            <div className="influencer-filters-right">
              <label>Tags:</label>
              <input
                type="text"
                placeholder="🏷️ Search by Tags"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="filter-input"
              />

              {/* <button className="export-btn" onClick={exportCSV}>Export CSV</button> */}
              <button className="export-btn" onClick={exportExcel}>Export Excel</button>

            </div>
      </div>
      {influencers.length === 0 ? (
        <div className="empty">No influencers found.</div>
      ) : (
        <table className="influencers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Instagram</th>
              <th>Phone</th>
              <th>Tags</th>
              <th>Joined</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>

            {influencers
              .filter((inf) => {
                const nameMatch = inf.name?.toLowerCase().includes(search.toLowerCase());
                const tagMatch = tagSearch
                  ? inf.tags?.some((t) => t.toLowerCase().includes(tagSearch.toLowerCase()))
                  : true;

                const statusMatch =
                  statusFilter === "all" ? true : inf.status === statusFilter;

                return nameMatch && tagMatch && statusMatch;
              })
            .map(inf => (
              <tr key={inf.influencer_id} className="influencer-row">
                <td>{inf.name}</td>
                <td>{inf.email}</td>
                <td>{inf.instagram_id}</td>
                <td>{inf.phone}</td>
                <td>{inf.tags.join(', ')}</td>
                <td>{new Date(inf.joined_at).toLocaleDateString()}</td>
                <td className="status-cell">
                  <span className={`status-badge ${inf.status}`}> {inf.status}  </span>

                  <i className="fas fa-edit edit-icon" title="Change Status" onClick={() => updateStatus(inf.influencer_id, inf.status)}> </i>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Influencers;