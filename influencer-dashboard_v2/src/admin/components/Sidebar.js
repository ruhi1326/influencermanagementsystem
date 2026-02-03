// influencer-dashboard_v2/src/admin/components/Sidebar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Sidebar({ setAdmin }) {
  const navigate = useNavigate();

  const handleLogout = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('admin');
  setAdmin(null);
  navigate('/admin/login');
};

  return (
    <div className="sidebar">
      <h3>Admin Panel</h3>
      <ul>
        <li onClick={() => navigate('/admin/requests')}>Influencer Requests</li>
        <li onClick={() => navigate('/admin/influencers')}>Influencers</li>
        <li onClick={() => navigate('/admin/brands')}>Brands</li>
        <li onClick={() => navigate('/admin/campaigns')}>Campaigns</li>
        <li onClick={() => navigate('/admin/payments')}>Payments</li>
        <li onClick={() => navigate('/admin/reports')}>Reports</li>
        <li onClick={handleLogout}>Logout</li>
        
      </ul>
    </div>
  );
}

export default Sidebar;
