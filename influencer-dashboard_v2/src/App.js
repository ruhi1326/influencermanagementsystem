//influencer-dashboard_v2/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from "./components/Landing";
import Login from './components/Login';
import RequestForm from './components/RequestForm';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ProfileTab from './components/ProfileTab';
import TaskTab from './components/TaskTab';
import PaymentTab from './components/PaymentTab';
import NotificationTab from './components/NotificationTab';
import './App.css';
import AdminApp from './admin/AdminApp';

function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => {
      const storedToken = sessionStorage.getItem('token');
      setToken(storedToken);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/" element={<Landing />} />
        <Route 
          path="/login" 
          element={!token ? <Login setToken={setToken} /> : <Navigate to="/influencer/profile" />} 
        />
        <Route 
          path="/influencer/*" 
          element={token ? <Dashboard setToken={setToken} /> : <Navigate to="/login" />} 
        >
          <Route path="profile" element={<ProfileTab setToken={setToken} />} />
          <Route path="tasks" element={<TaskTab />} />
          <Route path="payments" element={<PaymentTab />} />
          <Route path="notifications" element={<NotificationTab />} />
        </Route>
        <Route path="/request" element={<RequestForm />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to={token ? "/influencer/profile" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
