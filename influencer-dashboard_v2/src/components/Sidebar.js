//src/components/Sidebar.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Sidebar.css';

function Sidebar({ setToken }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const isActive = (path) => location.pathname.includes(path) ? "active" : "";

  return (
    <>
      <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        <h3 className="sidebar-title">Influencer Panel</h3>
        <ul>
          <li className={isActive('/profile')} onClick={() => navigate('/influencer/profile')}>
            👤 Profile
          </li>
          <li className={isActive('/tasks')} onClick={() => navigate('/influencer/tasks')}>
            📋 Tasks
          </li>
          <li className={isActive('/payments')} onClick={() => navigate('/influencer/payments')}>
            💳 Payments
          </li>
          <li className={isActive('/notifications')} onClick={() => navigate('/influencer/notifications')}>
            🔔 Notifications
          </li>
        </ul>
      </div>
    </>
  );
}

export default Sidebar;
