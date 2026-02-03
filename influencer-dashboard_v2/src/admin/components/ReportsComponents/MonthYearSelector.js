// influencer-dashboard_v2/src/admin/components/ReportsComponents/MonthYearSelector.js
import React from 'react';

const MonthYearSelector = ({ month, year, onMonthChange, onYearChange }) => {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const years = [];
  const currentYear = new Date().getFullYear();
  for(let i = currentYear-5; i <= currentYear+1; i++) years.push(i);

  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
      <div>
        <label>Month: </label>
        <select value={month} onChange={e => onMonthChange(parseInt(e.target.value))}>
          {months.map((m, idx) => <option key={idx} value={idx+1}>{m}</option>)}
        </select>
      </div>
      <div>
        <label>Year: </label>
        <select value={year} onChange={e => onYearChange(parseInt(e.target.value))}>
          {years.map((y, idx) => <option key={idx} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
};

export default MonthYearSelector;
