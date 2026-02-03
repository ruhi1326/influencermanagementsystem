//influencer-dashboard_v2/src/admin/AdminApp.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import InfluencerRequests from './components/InfluencerRequests';
import Influencers from './components/Influencers';
import Sidebar from './components/Sidebar';
import './css/Admin.css';
import Reports from './components/Reports';
import BrandTab from './components/BrandTab';
import CampaignTab from './components/CampaignTab';
import PaymentTab from './components/PaymentTab';


function AdminApp() {
  const [admin, setAdmin] = useState(null);
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  // Load admin from sessionStorage on page load
  useEffect(() => {
    const savedAdmin = sessionStorage.getItem('admin');
    const token = sessionStorage.getItem('token');
    if (savedAdmin && token) {
      setAdmin(JSON.parse(savedAdmin));
    }
    setLoadingAdmin(false); // done loading admin info
  }, []);

  // Show loader while admin state is being loaded
  if (loadingAdmin) return <div className="loader">Loading admin...</div>;


  return (
    <Routes>
      <Route
        path="login"
        element={!admin ? <AdminLogin setAdmin={setAdmin} /> : <Navigate to="/admin/requests" replace />}
      />
      <Route
        path="requests"
        element={
          admin ? (
            <div>
              <Sidebar setAdmin={setAdmin} />               
                <InfluencerRequests currentAdmin={admin} />              
            </div>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route
        path="influencers"
        element={
          admin ? (
            <div>
              <Sidebar setAdmin={setAdmin} />
              <div>
                <Influencers />
              </div>
            </div>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
       <Route
        path="reports"
        element={
          admin ? (
            <div >
              <Sidebar setAdmin={setAdmin} />
              <div >
                <Reports />
              </div>
            </div>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route
        path="brands"
        element={
          admin ? (
            <div>
              <Sidebar setAdmin={setAdmin} />
              <div>
                <BrandTab />
              </div>
            </div>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />

      <Route
        path="campaigns"
        element={
          admin ? (
            <div >
              <Sidebar setAdmin={setAdmin} />
              <div >
                <CampaignTab />
              </div>
            </div>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />

      <Route
        path="payments"
        element={
          admin ? (
            <div>
              <Sidebar setAdmin={setAdmin} />
              <div>
                <PaymentTab />
              </div>
            </div>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />




      <Route path="*" element={<Navigate to={admin ? "/admin/requests" : "/admin/login"} replace />} />
    </Routes>
  );

  
}

export default AdminApp;

