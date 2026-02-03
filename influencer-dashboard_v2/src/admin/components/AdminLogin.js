//influencer-dashboard_v2/src/admin/components/AdminLogin.js
import React, { useState } from 'react';
import API from '../../api'; // adjust path if needed
import { useNavigate } from 'react-router-dom';

function AdminLogin({ setAdmin }) {
  const [email, setEmail] = useState("");
  const [adminId, setAdminId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
    const res = await API.post('/admin/login', { email, admin_id: adminId });

    // ✅ Save token + admin data
    // localStorage.setItem('token', res.data.token);
    // localStorage.setItem('admin', JSON.stringify(res.data.admin));

    // Replace localStorage with sessionStorage
    sessionStorage.setItem('token', res.data.token);
    sessionStorage.setItem('admin', JSON.stringify(res.data.admin));

    // Update state
    setAdmin({ ...res.data.admin, id: res.data.admin.admin_id });
    navigate('/admin/requests');
  } catch (err) {
    setError(err.response?.data?.error || "Login failed");
  } finally {
    setLoading(false);
  }

    // try {
    //   const res = await API.post('/admin/login', { email, admin_id: adminId });
    //   setAdmin({ ...res.data.admin, id: res.data.admin.admin_id });
    //   navigate('/admin/requests');
    // } catch (err) {
    //   setError(err.response?.data?.error || "Login failed");
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div className="admin-login-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin} className="admin-login-form">
        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <label htmlFor="admin-id">Admin ID</label>
        <input
          id="admin-id"
          type="text"
          placeholder="Admin ID"
          value={adminId}
          onChange={e => setAdminId(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>
      {error && <div className="error" role="alert">{error}</div>}
    </div>
  );
}

export default AdminLogin;
