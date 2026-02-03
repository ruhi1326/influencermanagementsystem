// influencer-dashboard_v2/src/components/RequestForm.js
import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import '../css/RequestForm.css';

function RequestForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    instagram_id: '',
    tags: ''
  });

  const [tagsArray, setTagsArray] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const setError = (field, message) => setErrors(prev => ({ ...prev, [field]: message }));
  const clearError = (field) => setErrors(prev => { const c = { ...prev }; delete c[field]; return c; });

  // --- VALIDATIONS ---
  const validateName = (name) => {
    if (!name.trim()) { setError('name', 'Name is required.'); return false; }
    if (!/^[A-Za-z ]{1,50}$/.test(name.trim())) {
      setError('name', 'Name can only contain letters and spaces (max 50 chars).');
      return false;
    }
    clearError('name');
    return true;
  };

  const validateEmail = (email) => {
    if (!email.trim()) { setError('email', 'Email is required.'); return false; }

    const [usernamePart, domainPart] = email.split('@');
    if (!usernamePart || !domainPart) { setError('email', 'Enter a valid email.'); return false; }

    // --- Username rules ---
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*[A-Za-z0-9]$/.test(usernamePart)) {
      setError('email', 'Email username must start and end with letter/number and can contain ., _, - in between.');
      return false;
    }
    if (usernamePart.includes('..')) { setError('email', 'Email username cannot have consecutive dots.'); return false; }

    // --- Domain rules ---
    const domainSegments = domainPart.split('.');
    if (domainSegments.length < 2) { setError('email', 'Email domain must have extension.'); return false; }
    const domainName = domainSegments.slice(0, -1).join('.');
    if (!/^[A-Za-z][A-Za-z-]*[A-Za-z]$/.test(domainName)) {
      setError('email', 'Domain must start and end with letter and can contain hyphens in between.');
      return false;
    }
    if (domainName.includes('--')) { setError('email', 'Domain cannot have consecutive hyphens.'); return false; }

    // --- Extension rules ---
    const ext = domainSegments[domainSegments.length -1];
    if (!/^[A-Za-z]{2,}$/.test(ext)) { setError('email', 'Email extension must be at least 2 letters.'); return false; }

    clearError('email');
    return true;
  };

  const validatePhone = (phone) => {
    if (!/^\d{10}$/.test(phone)) { setError('phone', 'Enter a valid 10-digit phone number.'); return false; }
    clearError('phone'); return true;
  };

  const validateInstagram = (ig) => {
  if (!ig || ig.trim().length < 2) {
    setError('instagram_id', 'Instagram ID is required and must be at least 2 characters.');
    return false;
  }
  if (/\s|@/.test(ig)) {
    setError('instagram_id', 'Instagram ID must not contain spaces or "@".');
    return false;
  }
  clearError('instagram_id');
  return true;
};


  const validateTagsPresence = (arr) => {
    if (!arr || arr.length === 0) { setError('tags', 'Add at least 1 tag (max 5).'); return false; }
    clearError('tags'); return true;
  };

  const validateAll = () => {
      let ok = true;
      if (!validateName(form.name)) ok = false;
      if (!validateEmail(form.email)) ok = false;
      if (!validatePhone(form.phone)) ok = false;
      if (!validateInstagram(form.instagram_id)) ok = false;
      if (!validateTagsPresence(tagsArray)) ok = false;
      return ok;
  };

  // --- HANDLE CHANGE ---
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'tags') {
      // Allow only letters, spaces, hyphen, and commas
      const cleaned = value.replace(/[^A-Za-z\s\-,]/g, '');
      setForm(prev => ({ ...prev, tags: cleaned }));

      // Split by comma to count tags
      const parts = cleaned.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length > 5) {
        setError('tags', 'Only 5 tags allowed.');
      } else {
        clearError('tags');
      }
      setTagsArray(parts);
      return;
    }

    if (name === 'phone') {
      const onlyDigits = value.replace(/\D/g, '');
      setForm(prev => ({ ...prev, phone: onlyDigits }));
      if (onlyDigits.length >= 10) validatePhone(onlyDigits); else clearError('phone');
      return;
    }

    if (name === 'instagram_id') {
      const cleaned = value.replace(/@/g, '').replace(/\s/g, '');
      setForm(prev => ({ ...prev, instagram_id: cleaned }));
      validateInstagram(cleaned);
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'name') validateName(value);
    if (name === 'email') validateEmail(value);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validateAll()) return;

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        instagram_id: form.instagram_id.trim(),
        tags: tagsArray.slice(0,5)
      };
      await API.post('/request', payload);
      setForm({ name:'', email:'', phone:'', instagram_id:'', tags:'' });
      setTagsArray([]);
      setShowModal(true);
    } catch (err) {
      setError('form', err.response?.data?.error || 'Failed to submit request.');
    } finally { setLoading(false); }
  };

  return (
    <div className="dashboard-container">
      <div className="profile-card">
        <h2>Request to Join Community</h2>
        <form onSubmit={handleSubmit} className="request-form" noValidate>

          <label htmlFor="request-name">Full Name</label>
          <input id="request-name" type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
          {errors.name && <div className="error-message">{errors.name}</div>}

          <label htmlFor="request-email">Email</label>
          <input id="request-email" type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          {errors.email && <div className="error-message">{errors.email}</div>}

          <label htmlFor="request-phone">Phone</label>
          <input id="request-phone" type="text" name="phone" placeholder="10-digit phone number" value={form.phone} onChange={handleChange} required maxLength={10} />
          {errors.phone && <div className="error-message">{errors.phone}</div>}

          <label htmlFor="request-instagram">Instagram ID</label>
          <input id="request-instagram" type="text" name="instagram_id" placeholder="Instagram ID (no @ or spaces)" value={form.instagram_id} onChange={handleChange} />
          {errors.instagram_id && <div className="error-message">{errors.instagram_id}</div>}

          <label htmlFor="request-tags">Niche (comma separated, max 5)</label>
          <input id="request-tags" type="text" name="tags" placeholder="Add tags, use comma" value={form.tags} onChange={handleChange} />
          {errors.tags && <div className="error-message">{errors.tags}</div>}

          {errors.form && <div className="error-message">{errors.form}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'}</button>
        </form>

        <div className="request-actions">
          <button className="action-btn" onClick={()=>navigate('/')}>Back to Landing Page</button>
        </div>
      </div>

      {showModal && (
        <div className="success-modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="success-modal" onClick={(e)=>e.stopPropagation()}>
            <h3>Thank you!</h3>
            <p>Your request was submitted successfully.</p>
            <div className="modal-actions">
              <button onClick={()=>setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>



  );
}

export default RequestForm;
