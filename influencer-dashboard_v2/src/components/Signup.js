// influencer-dashboard_v2/src/components/Signup.js
import React, { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../css/Signup.css';

function Signup() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError('Invalid signup link. No token provided.');
        setLoading(false);
        return;
      }
      try {
        const res = await API.get(`/request/verifyToken?token=${encodeURIComponent(token)}`);
        // server responds { email, request_id }
        setForm(f => ({ ...f, email: res.data.email }));
        setError('');
      } catch (err) {
        console.error('verifyToken error:', err);
        setError(err.response?.data?.error || 'Invalid or expired signup link.');
      } finally {
        setLoading(false);
      }
    };
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!form.password || form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    try {
      setLoading(true);
      await API.post('/request/signup', { token, password: form.password });
      setSuccessMsg('Signup successful — redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('signup POST error:', err);
      setError(err.response?.data?.error || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loader">Verifying signup link...</div>;

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="profile-card">
          <h2>Invalid signup link</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="profile-card">
        <h2>Complete Signup</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Email" value={form.email} readOnly />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          <button type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Signup'}</button>
        </form>

        {successMsg && <div className="toast success">{successMsg}</div>}
        {error && <div className="toast error">{error}</div>}
      </div>
    </div>
  );
}

export default Signup;
