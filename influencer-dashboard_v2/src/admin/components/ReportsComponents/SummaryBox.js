// influencer-dashboard_v2/src/admin/components/ReportsComponents/SummaryBox.js
import React from 'react';

const SummaryBox = ({ summary }) => {
  if (!summary) return null;

  // Gracefully handle both monthly and yearly
  const {
    total_requests = 0,
    approved_requests = 0,
    rejected_requests = 0,
    pending_requests = 0,
    peak_days = [],
    peak_months = [],
  } = summary;

  // Determine what to display based on which array exists
  const hasPeakMonths = Array.isArray(peak_months) && peak_months.length > 0;
  const peaksLabel = hasPeakMonths ? 'Peak Months' : 'Peak Days';
  const peaksValue = hasPeakMonths
    ? peak_months.join(', ')
    : Array.isArray(peak_days)
    ? peak_days.join(', ')
    : 'N/A';

  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: '#fff',
        marginTop: '20px',
      }}
    >
      <p><strong>Total Requests:</strong> {total_requests}</p>
      <p><strong>Approved Requests:</strong> {approved_requests}</p>
      <p><strong>Rejected Requests:</strong> {rejected_requests}</p>
      <p><strong>Pending Requests:</strong> {pending_requests}</p>
      <p><strong>{peaksLabel}:</strong> {peaksValue}</p>
    </div>
  );
};

export default SummaryBox;
