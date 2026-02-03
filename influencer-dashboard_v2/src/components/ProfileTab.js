//src/components/ProfileTab.js
import React, { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import '../css/ProfileTab.css';
import Toast from "./Toast";

function ProfileTab({ setToken }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [showTagsModal, setShowTagsModal] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [tagsError, setTagsError] = useState("");

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [newPhone, setNewPhone] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [newInstagram, setNewInstagram] = useState("");

  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
  if (toastMessage) {
    const timer = setTimeout(() => setToastMessage(""), 2000);
    return () => clearTimeout(timer);
  }
}, [toastMessage]);


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/influencer/me');
        const profileData = res.data?.data ?? res.data ?? res;
        setProfile(profileData);
        setError("");
      } catch (err) {
        if (err.response?.status === 401) {
          sessionStorage.removeItem('token');
          setToken(null);
          navigate('/login');
        } else {
          setError("Failed to fetch profile. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate, setToken]);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loader-wrapper">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="empty-state">
          <span className="empty-icon">👤</span>
          <p>No profile data found.</p>
        </div>
      </div>
    );
  }

  const safeTags = Array.isArray(profile.tags) 
    ? profile.tags 
    : (profile.tags ? [profile.tags] : []);

    const handleLogout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="profile-intro">
          <h1 className="profile-name">{profile.name}</h1>
          <p className="profile-email">{profile.email}</p>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2 className="section-title">Contact Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{profile.email}</span>
            </div>

            <div className="info-item phone-item">
              <div className="info-label-row">
                <span className="info-label">Phone</span>

                <i
                  className="fas fa-edit edit-icon"
                  onClick={() => {
                    setNewPhone(profile.phone || "");
                    setShowPhoneModal(true);
                  }}
                ></i>
              </div>

              <span className="info-value">
                {profile.phone || "Not provided"}
              </span>
            </div>


            <div className="info-item insta-item">
              <div className="info-label-row">
                <span className="info-label">Insta</span>

                <i
                  className="fas fa-edit edit-icon"
                  onClick={() => {
                    setNewInstagram(profile.instagram_id);
                    setShowModal(true);
                  }}
                ></i>
              </div>

              <span className="info-value">{profile.instagram_id || "Not provided"}</span>
            </div>



          </div>
        </div>

        {safeTags.length > 0 && (
          <div className="profile-section">
            
            <div className="tags-title-row">
              <h2 className="section-title">Niche</h2>

              <i
                className="fas fa-edit edit-icon"
                onClick={() => {
                  setTagsInput(safeTags.join(", "));
                  setTagsError("");
                  setShowTagsModal(true);
                }}
              ></i>
            </div>

            <div className="tags-container">
              {safeTags.map((tag, idx) => (
                <span key={idx} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        <div className="profile-actions">
          <button onClick={handleLogout} className="btn btn-outline">Logout</button>
        </div>
      </div>

      {showModal && (
          <div className="modal-overlay">
            <div className="modal-box">

              <h3>Edit Instagram ID</h3>

              <input
                type="text"
                value={newInstagram}
                maxLength={30}
                onChange={(e) => {
                  const val = e.target.value;

                  // Allow only letters, numbers, periods, underscores
                  if (/^[a-zA-Z0-9._]*$/.test(val)) {
                    setNewInstagram(val);
                  }
                }}
                className="modal-input"
              />


              <div className="modal-actions">
                <button
                  className="btn save-btn"
                  onClick={async () => {
                    try {
                      const res = await API.patch("/influencer/update-instagram", {
                        instagram_id: newInstagram,
                      });

                      console.log(res);

                      setProfile(prev => ({
                          ...prev,
                          instagram_id: newInstagram,
                        }));

                        setShowModal(false);
                        setToastMessage("Instagram updated successfully!");
                    } catch (err) {
                      alert("Failed to update Instagram ID");
                    }
                  }}
                >
                  Save
                </button>

                <button className="btn cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )}


        {showPhoneModal && (
            <div className="modal-overlay">
              <div className="modal-box">

                <h3>Edit Phone Number</h3>

                <input
                    type="text"
                    value={newPhone}
                    maxLength={10}
                    onChange={(e) => {
                      const val = e.target.value;

                      // Allow only digits
                      if (/^\d*$/.test(val)) {
                        setNewPhone(val);
                      }
                    }}
                    className="modal-input"
                  />


                <div className="modal-actions">
                  <button
                    className="btn save-btn"
                    onClick={async () => {
                      try {
                        const res = await API.patch("/influencer/update-phone", {
                          phone: newPhone,
                        });

                        console.log(res);

                        setProfile((prev) => ({
                          ...prev,
                          phone: newPhone,
                        }));

                        setShowPhoneModal(false);
                        setToastMessage("Phone number updated successfully!");
                      } catch (err) {
                        alert("Failed to update phone");
                      }
                    }}
                  >
                    Save
                  </button>

                  <button
                    className="btn cancel-btn"
                    onClick={() => setShowPhoneModal(false)}
                  >
                    Cancel
                  </button>
                </div>

              </div>
            </div>
          )}

      {showTagsModal && (
  <div className="modal-overlay">
    <div className="modal-box">

      <h3>Edit Tags</h3>

      <input
        type="text"
        value={tagsInput}
        onChange={(e) => {
          const value = e.target.value;
          setTagsInput(value);
        }}
        className="modal-input"
        placeholder="e.g., fashion, beauty, travel"
      />

      {tagsError && <p className="error-text">{tagsError}</p>}

      <div className="modal-actions">
        <button
          className="btn save-btn"
          onClick={async () => {

            // Split tags
            let tags = tagsInput
              .split(",")
              .map(t => t.trim())
              .filter(t => t.length > 0);

            // Remove duplicates
            tags = [...new Set(tags)];

            // VALIDATIONS
            if (tags.length > 5) {
              return setTagsError("Maximum 5 tags allowed.");
            }

            const invalidTags = tags.filter(tag => !/^[A-Za-z ]+$/.test(tag));
            if (invalidTags.length > 0) {
              return setTagsError("Tags may only contain letters A–Z.");
            }

            try {
              const res = await API.put("/influencer/tags", {
                tags
              });
              console.log(res);

              // update UI
              setProfile(prev => ({
                ...prev,
                tags
              }));

              setShowTagsModal(false);
              setToastMessage("Tags updated successfully!");
            } catch (err) {
              setTagsError("Failed to update tags");
            }
          }}
        >
          Save
        </button>

        <button className="btn cancel-btn" onClick={() => setShowTagsModal(false)}>
          Cancel
        </button>
      </div>

    </div>
  </div>
          )}
          
      <Toast message={toastMessage} />

    </div>
  );
}

export default ProfileTab;