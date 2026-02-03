// src/admin/components/BrandTab.js
import React, { useState, useEffect } from "react";
import API from "../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./../css/BrandTab.css";

export default function BrandTab() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");


  const [form, setForm] = useState({
    name: "",
    category: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    description: "",
    status: "active",
  });

  // Fetch all brands
  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await API.get("/brands");
      setBrands(res.data);
    } catch (err) {
      console.error("Error fetching brands:", err);
      toast.error("Failed to fetch brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Form field change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Validate form (all fields required except description)
  const validateForm = () => {
    if (!form.name.trim()) return "Brand name is required";
    if (!form.category.trim()) return "Category is required";
    if (!form.contact_person.trim()) return "Contact person is required";
    if (!form.contact_email.trim()) return "Contact email is required";
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.contact_email))
      return "Invalid email format";
    if (!form.contact_phone.trim()) return "Contact phone is required";
    if (!/^\d{10}$/.test(form.contact_phone))
      return "Invalid phone number (10 digits required)";
    if (!form.status.trim()) return "Status is required";
    return null;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) return setError(validationError);

    setError("");
    try {
      if (editingBrand) {
        // Update existing brand
        const res = await API.put(`/brands/${editingBrand.brand_id}`, {
          contact_person: form.contact_person,
          contact_email: form.contact_email,
          contact_phone: form.contact_phone,
          status: form.status,
        });
        toast.success(res.data.message || "Brand updated successfully");
      } else {
        // Add new brand
        const res = await API.post("/brands", form);
        toast.success(res.data.message || "Brand added successfully");
      }
      setShowForm(false);
      setEditingBrand(null);
      resetForm();
      fetchBrands();
    } catch (err) {
      console.error("Error saving brand:", err);
      const msg = err.response?.data?.error || "Something went wrong";
      toast.error(msg);
      setError(msg);
    }
  };

  // Soft Delete brand
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this brand?")) return;
    try {
      const res = await API.delete(`/brands/${id}`);
      toast.success(res.data.message || "Brand deleted successfully");
      fetchBrands();
    } catch (err) {
      console.error("Error deleting brand:", err);
      toast.error(err.response?.data?.error || "Failed to delete brand");
    }
  };

  // Edit brand
  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setForm(brand);
    setShowForm(true);
  };

  // Add new brand
  const handleAdd = () => {
    setEditingBrand(null);
    resetForm();
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      contact_person: "",
      contact_email: "",
      contact_phone: "",
      description: "",
      status: "active",
    });
  };

  return (
    <div className="brand-tab-container">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="brand-header">
        <h2>Brand Management</h2>
      </div>
      <div className="brand-filters">
        <div className="brand-filters-left">
          <label>Search:</label>
          <input
            type="text"
            placeholder="🔍 Search by Brand Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-input"
          />

          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="brand-filters-right">
          <button className="add-btn" onClick={handleAdd}>
            + Add Brand
          </button>
        </div>
      </div>


      {loading ? (
        <p>Loading brands...</p>
      ) : (
        <table className="brand-table">
          <thead>
            <tr>
              <th>Joined Date</th>
              <th>Name</th>
              <th>Category</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  No brands found
                </td>
              </tr>
            ) : (
              brands
                .filter((brand) => {
                  const nameMatch = brand.name
                    ?.toLowerCase()
                    .includes(search.toLowerCase());
                  const statusMatch =
                    statusFilter === "All" || brand.status === statusFilter;
                  return nameMatch && statusMatch;
                })
              .map((brand) => (
                <tr key={brand.brand_id}>
                  <td>{new Date(brand.created_at).toLocaleDateString()}</td>
                  <td>{brand.name}</td>
                  <td>{brand.category}</td>
                  <td>{brand.contact_person}</td>
                  <td>{brand.contact_email}</td>
                  <td>{brand.contact_phone}</td>
                  <td>
                    <span className={`status-badge ${brand.status}`}>
                      {brand.status}
                    </span>
                  </td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(brand)}>
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(brand.brand_id)}
                    >
                      Delete
                    </button>                    
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingBrand ? "Edit Brand" : "Add Brand"}</h3>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit} className="brand-form">
              {!editingBrand && (
                <>
                  <label>Name*</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />

                  <label>Category*</label>
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                  />

                  <label>Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                  ></textarea>
                </>
              )}

              <label>Contact Person*</label>
              <input
                name="contact_person"
                value={form.contact_person}
                onChange={handleChange}
                required
              />

              <label>Contact Email*</label>
              <input
                name="contact_email"
                value={form.contact_email}
                onChange={handleChange}
                required
              />

              <label>Contact Phone*</label>
              <input
                name="contact_phone"
                value={form.contact_phone}
                onChange={handleChange}
                required
              />

              <label>Status*</label>
              <select name="status" value={form.status} onChange={handleChange} required>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  Save
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
