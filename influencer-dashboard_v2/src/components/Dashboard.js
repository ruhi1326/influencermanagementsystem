//influencer-dashboard_v2/src/components/Dashboard.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../css/Dashboard.css';

function Dashboard({ setToken }) {
  return (
    <div className="dashboard-layout">
      <Sidebar setToken={setToken} />
      <div className="dashboard-content">
        <Outlet />
      </div>
    </div>
  );
}

export default Dashboard;
