//src/admin/components/Report.js
import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api';
import MonthYearSelector from './ReportsComponents/MonthYearSelector';
import SummaryBox from './ReportsComponents/SummaryBox';
import LineChartComponent from './ReportsComponents/LineChartComponent';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaChartLine } from 'react-icons/fa';
import '../css/Reports.css';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import html2canvas from "html2canvas";
import { useRef } from "react";



const Reports = () => {
  const today = new Date();
  const [reportType, setReportType] = useState("monthly"); // new toggle
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    total_requests: 0,
    approved_requests: 0,
    rejected_requests: 0,
    pending_requests: 0,
    peak_days: [],
    peak_months: []
  });

  const requestChartRef = useRef(null);
  const campaignsChartRef = useRef(null);

  const fetchReport = useCallback(async () => {
    try {
      let res;
      if (reportType === "monthly") {
        res = await API.get(`/admin/reports?type=requests&month=${month}&year=${year}`);
      } else {
        res = await API.get(`/admin/reports/yearly?type=requests&year=${year}`);
      }

      setData(res.data.data);
      setSummary(res.data.summary);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  }, [month, year, reportType]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // ---------- Export CSV ----------
  const exportCSV = () => {
    if (!data || data.length === 0) return;

    const summaryRows = reportType === "monthly"
      ? [
          { day: 'Total Requests', total_requests: summary.total_requests },
          { day: 'Approved Requests', total_requests: summary.approved_requests },
          { day: 'Rejected Requests', total_requests: summary.rejected_requests },
          { day: 'Pending Requests', total_requests: summary.pending_requests },
          { day: 'Peak Days', total_requests: summary.peak_days.join(', ') }
        ]
      : [
          { month: 'Total Requests', total_requests: summary.total_requests },
          { month: 'Approved Requests', total_requests: summary.approved_requests },
          { month: 'Rejected Requests', total_requests: summary.rejected_requests },
          { month: 'Pending Requests', total_requests: summary.pending_requests },
          { month: 'Peak Months', total_requests: summary.peak_months.join(', ') }
        ];

    const csvData = [...data, ...summaryRows];
    const csv = Papa.unparse(csvData, { header: true });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `influencer_requests_${reportType}_${year}.csv`);
  };

const exportPDF = async () => {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(`Influencer Request Report (${reportType})`, 14, 15);
  doc.setFontSize(11);
  doc.text(`Year: ${year}${reportType === "monthly" ? `, Month: ${month}` : ""}`, 14, 22);

  // ✅ Corrected Chart Capture
  if (requestChartRef.current) {
    await new Promise((res) => setTimeout(res, 500)); // ensure rendering done
    const chartCanvas = await html2canvas(requestChartRef.current.querySelector(".recharts-wrapper"), {
      backgroundColor: "#ffffff",
      scale: 2,
    });
    const chartImg = chartCanvas.toDataURL("image/png", 1.0);
    doc.addImage(chartImg, "PNG", 10, 30, 180, 90);
  }

  let currentY = 130;

  const tableColumn = reportType === "monthly" ? ["Day", "Total Requests"] : ["Month", "Total Requests"];
  const tableRows = data.map((d) => [reportType === "monthly" ? d.day : d.month, d.total_requests]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: currentY,
  });

  const summaryStartY = doc.lastAutoTable.finalY + 10;
  const summaryText = [
    `Total Requests: ${summary.total_requests}`,
    `Approved Requests: ${summary.approved_requests}`,
    `Rejected Requests: ${summary.rejected_requests}`,
    `Pending Requests: ${summary.pending_requests}`,
    reportType === "monthly"
      ? `Peak Days: ${summary.peak_days.join(", ")}`
      : `Peak Months: ${summary.peak_months.join(", ")}`
  ];
  summaryText.forEach((line, idx) => {
    doc.text(line, 14, summaryStartY + idx * 7);
  });

  doc.save(`influencer_requests_${reportType}_${year}.pdf`);
};


// --- add these states
const [status, setStatus] = useState("All");
const [campaignsData, setCampaignsData] = useState([]);
const [campaignsSummary, setCampaignsSummary] = useState({});

// --- fetch campaigns data dynamically
useEffect(() => {
  const fetchCampaignsReport = async () => {
    try {
      const res = await API.get(`/admin/reports/campaigns-per-brand?status=${status}`);
      setCampaignsData(res.data.data);
      setCampaignsSummary(res.data.summary);
    } catch (err) {
      console.error("Error fetching campaigns report:", err);
    }
  };
  fetchCampaignsReport();
}, [status]);

// --- Export CSV / PDF functions
const exportCampaignsCSV = () => {
  if (!campaignsData.length) return;
  const csv = Papa.unparse(campaignsData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `campaigns_per_brand_${status}.csv`);
};

const exportCampaignsPDF = async () => {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(`Campaigns per Brand (${status})`, 14, 15);

  // ✅ Corrected Chart Capture
  if (campaignsChartRef.current) {
    await new Promise((res) => setTimeout(res, 500));
    const chartCanvas = await html2canvas(campaignsChartRef.current.querySelector(".recharts-wrapper"), {
      backgroundColor: "#ffffff",
      scale: 2,
    });
    const chartImg = chartCanvas.toDataURL("image/png", 1.0);
    doc.addImage(chartImg, "PNG", 10, 25, 180, 90);
  }

  let currentY = 125;
  autoTable(doc, {
    head: [["Brand", "Campaigns"]],
    body: campaignsData.map((d) => [d.brand, d.campaigns]),
    startY: currentY,
  });

  const summaryStartY = doc.lastAutoTable.finalY + 10;
  doc.text(`Total Brands: ${campaignsSummary.total_brands || 0}`, 14, summaryStartY);
  doc.text(`Total Campaigns: ${campaignsSummary.total_campaigns || 0}`, 14, summaryStartY + 7);
  doc.text(`Top Brands: ${campaignsSummary.top_brands?.join(", ") || "-"}`, 14, summaryStartY + 14);

  doc.save(`campaigns_per_brand_${status}.pdf`);
};

  const [revenueType, setRevenueType] = useState("monthly");
  const [revenueData, setRevenueData] = useState([]);
  const [revenueSummary, setRevenueSummary] = useState({});
  const [revenueMonth, setRevenueMonth] = useState(today.getMonth() + 1);
  const [revenueYear, setRevenueYear] = useState(today.getFullYear());

  useEffect(() => {
  const fetchRevenueReport = async () => {
    try {
      let res;
      if (revenueType === "monthly") {
        res = await API.get(`/admin/reports/revenue?month=${revenueMonth}&year=${revenueYear}`);
      } else {
        res = await API.get(`/admin/reports/revenue/yearly?year=${revenueYear}`);
      }
      setRevenueData(res.data.data);
      setRevenueSummary(res.data.summary);
    } catch (error) {
      console.error("Error fetching revenue report:", error);
    }
  };
  fetchRevenueReport();
}, [revenueMonth, revenueYear, revenueType]);


const exportRevenueCSV = () => {
  if (!revenueData.length) return;
  const csv = Papa.unparse(revenueData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `revenue_report_${revenueType}_${revenueYear}.csv`);
};

const exportRevenuePDF = async () => {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(`Revenue (Profit) Report (${revenueType})`, 14, 15);
  doc.setFontSize(11);
  doc.text(`Year: ${revenueYear}${revenueType === "monthly" ? `, Month: ${revenueMonth}` : ""}`, 14, 22);

  // Capture chart
  const chartElement = document.getElementById("revenue-chart");
  if (chartElement) {
    const canvas = await html2canvas(chartElement.querySelector(".recharts-wrapper"), { backgroundColor: "#fff", scale: 2 });
    const img = canvas.toDataURL("image/png", 1.0);
    doc.addImage(img, "PNG", 10, 30, 180, 90);
  }

  let currentY = 130;
  autoTable(doc, {
    head: [[revenueType === "monthly" ? "Day" : "Month", "Revenue", "Profit"]],
    body: revenueData.map(d => [
      revenueType === "monthly" ? d.day : d.month,
      d.revenue.toFixed(2),
      d.profit.toFixed(2),
    ]),
    startY: currentY,
  });

  const summaryStartY = doc.lastAutoTable.finalY + 10;
  doc.text(`Total Revenue: ₹${revenueSummary.total_revenue?.toFixed(2) || 0}`, 14, summaryStartY);
  doc.text(`Total Profit: ₹${revenueSummary.total_profit?.toFixed(2) || 0}`, 14, summaryStartY + 7);
  if (revenueType === "monthly")
    doc.text(`Peak Days: ${revenueSummary.peak_days?.join(", ") || "-"}`, 14, summaryStartY + 14);
  else
    doc.text(`Peak Months: ${revenueSummary.peak_months?.join(", ") || "-"}`, 14, summaryStartY + 14);

  doc.save(`revenue_report_${revenueType}_${revenueYear}.pdf`);
};




  return (
    <div className="reports-main">      
      <div className="reports-header">
        <h2>Reports Dashboard</h2>
      </div>
      <div className="reports-card" ref={requestChartRef}>  
        <div className="reports-title">
          <FaChartLine className="reports-icon" />
          <h2>Influencer Request Report</h2>
        </div>

        {/* Report Type Toggle */}
        <div className="report-type-toggle" style={{ marginBottom: "15px" }}>
          <label>
            <input
              type="radio"
              value="monthly"
              checked={reportType === "monthly"}
              onChange={() => setReportType("monthly")}
            />
            Monthly Report
          </label>
          <label style={{ marginLeft: "15px" }}>
            <input
              type="radio"
              value="yearly"
              checked={reportType === "yearly"}
              onChange={() => setReportType("yearly")}
            />
            Yearly Report
          </label>
        </div>

        {/* Filters + Export */}
        <div className="reports-filters">
          <div className="reports-left">
            {reportType === "monthly" ? (
              <MonthYearSelector
                month={month}
                year={year}
                onMonthChange={setMonth}
                onYearChange={setYear}
              />
            ) : (
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="year-select"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const y = today.getFullYear() - i;
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
            )}
          </div>
          <div className="reports-right">
            <button className="export-btn" onClick={exportCSV}>Export CSV</button>
            <button className="export-btn" onClick={exportPDF}>Export PDF</button>
          </div>
        </div>

        {/* Chart + Summary */}
        <div className="reports-content">
          <div className="reports-chart">
            <LineChartComponent data={data} />
          </div>
          <div className="reports-summary">
            <SummaryBox summary={summary} />
          </div>
        </div>
      </div>


{/* ✅ Campaigns per Brand Report */}
<div className="reports-card" ref={campaignsChartRef}>
  <div className="reports-title">
    <FaChartLine className="reports-icon" />
    <h2>Campaigns per Brand</h2>
  </div>

  {/* Status Filter */}
  <div className="reports-filters">
    <div className="reports-left">
      <label>Status: </label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="year-select"
      >
        <option>All</option>
        <option>Upcoming</option>
        <option>Ongoing</option>
        <option>Completed</option>
      </select>
    </div>
    <div className="reports-right">
      <button className="export-btn" onClick={exportCampaignsCSV}>Export CSV</button>
      <button className="export-btn" onClick={exportCampaignsPDF}>Export PDF</button>
    </div>
  </div>

  {/* Chart + Summary */}
  <div className="reports-content">
    <div className="reports-chart">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={campaignsData} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="brand" angle={-25} textAnchor="end" height={60} />
          <YAxis label={{ value: "No. of Campaigns", angle: -90, position: "insideLeft", style: { textAnchor: "middle" }, }} />
          <Tooltip />
          <Bar dataKey="campaigns" fill="#2ecc71" />
        </BarChart>
      </ResponsiveContainer>
    </div>
<div className="reports-summary">
  <div style={{ padding: "20px" }}>
    <p><strong>Total Brands:</strong> {campaignsSummary.total_brands}</p>
    <p><strong>Total Campaigns:</strong> {campaignsSummary.total_campaigns}</p>
    <p><strong>Upcoming Campaigns:</strong> {campaignsSummary.upcoming_campaigns}</p>
    <p><strong>Ongoing Campaigns:</strong> {campaignsSummary.ongoing_campaigns}</p>
    <p><strong>Completed Campaigns:</strong> {campaignsSummary.completed_campaigns}</p>
    <p><strong>Top Brands:</strong> {campaignsSummary.top_brands?.join(', ')}</p>
  </div>
</div>

  </div>
</div>

{/* ✅ Revenue (Profit) Report */}
<div className="reports-card-revenue" id="revenue-chart">
  <div className="reports-title">
    <FaChartLine className="reports-icon" />
    <h2>Revenue & Profit Report</h2>
  </div>

  {/* Type toggle */}
  <div className="report-type-toggle" style={{ marginBottom: "15px" }}>
    <label>
      <input
        type="radio"
        value="monthly"
        checked={revenueType === "monthly"}
        onChange={() => setRevenueType("monthly")}
      />
      Monthly Report
    </label>
    <label style={{ marginLeft: "15px" }}>
      <input
        type="radio"
        value="yearly"
        checked={revenueType === "yearly"}
        onChange={() => setRevenueType("yearly")}
      />
      Yearly Report
    </label>
  </div>

  {/* Filters + Export */}
  <div className="reports-filters">
    <div className="reports-left">
      {revenueType === "monthly" ? (
        <MonthYearSelector
          month={revenueMonth}
          year={revenueYear}
          onMonthChange={setRevenueMonth}
          onYearChange={setRevenueYear}
        />
      ) : (
        <select
          value={revenueYear}
          onChange={(e) => setRevenueYear(Number(e.target.value))}
          className="year-select"
        >
          {Array.from({ length: 5 }, (_, i) => {
            const y = today.getFullYear() - i;
            return <option key={y} value={y}>{y}</option>;
          })}
        </select>
      )}
    </div>
    <div className="reports-right">
      <button className="export-btn" onClick={exportRevenueCSV}>Export CSV</button>
      <button className="export-btn" onClick={exportRevenuePDF}>Export PDF</button>
    </div>
  </div>

{/* Chart + Summary */}
<div className="revenue-section">

  {/* Chart */}
  <div className="revenue-chart">
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={revenueData}
        margin={{ top: 20, right: 20, left: 50, bottom: 45 }}
        barCategoryGap="35%"
        barSize={45}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={revenueType === "monthly" ? "day" : "month"}
          angle={-25}
          textAnchor="end"
          height={60}
        />
        <YAxis
          label={{
            value: "Amount (₹)",
            angle: -90,
            position: "outsideLeft",
            dx: -55,  // push more outward
            dy: 30,   // align closer to axis bottom
            style: { textAnchor: "middle" },
          }}
        />
        <Tooltip />
        <Bar dataKey="revenue" fill="#3498db" name="Revenue" />
        <Bar dataKey="profit" fill="#2ecc71" name="Profit" />
      </BarChart>
    </ResponsiveContainer>
  </div>

  {/* Summary Cards */}
  <div className="revenue-summary-row">
    <div className="revenue-summary-card">
      <h4>Total Revenue</h4>
      <p>₹{Number(revenueSummary.total_revenue?? "-").toLocaleString('en-IN') || 0}</p>
    </div>
    <div className="revenue-summary-card">
      <h4>Total Profit</h4>
      <p>₹{Number(revenueSummary.total_profit?? "-").toLocaleString('en-IN') || 0}</p>
    </div>
    <div className="revenue-summary-card">
      <h4>Peak {revenueType === "monthly" ? "Days" : "Months"}</h4>
      <p>
        {revenueType === "monthly"
          ? revenueSummary.peak_days?.join(", ") || "-"
          : revenueSummary.peak_months?.join(", ") || "-"}
      </p>
    </div>
  </div>
</div>


</div>


    </div>
  );
};

export default Reports;
