import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './DivisionManager.css';

const API_URL = 'http://localhost:5000/division';
const CLASS_API_URL = 'http://localhost:5000/classes'; 

const DivisionManager = () => {
  const [divisions, setDivisions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({ name: '', class_id: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDivisions();
    fetchClasses();
  }, []);

  const fetchDivisions = async () => {
    try {
      const response = await axios.get(`${API_URL}/divisions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDivisions(response.data);
    } catch (err) {
      console.error('Failed to fetch divisions:', err);
      setError('Failed to fetch divisions');
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${CLASS_API_URL}/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(response.data);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      setError('Failed to fetch classes');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}/divisions/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Division updated successfully');
      } else {
        await axios.post(`${API_URL}/divisions`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Division created successfully');
      }
      setFormData({ name: '', class_id: '' });
      setEditId(null);
      fetchDivisions();
    } catch (err) {
      console.error('Failed to save division:', err);
      setError('Failed to save division');
    }
  };

  const handleEdit = (division) => {
    setFormData({ name: division.name, class_id: division.class_id });
    setEditId(division.id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/divisions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Division deleted successfully');
      fetchDivisions();
    } catch (err) {
      console.error('Failed to delete division:', err);
      setError('Failed to delete division');
    }
  };

  return (
    <div className="container mt-5 division-manager">
      <h2 className="mb-4">Manage Divisions</h2>
      {error && <div className="alert alert-danger fade-in">{error}</div>}
      {success && <div className="alert alert-success fade-in">{success}</div>}

      <div className="card mb-4 form-card">
        <div className="card-body">
          <h5 className="card-title">{editId ? 'Edit Division' : 'Create Division'}</h5>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name"><h5>Name :</h5></label>
              <input
                type="text"
                name="name"
                id="name"
                className="form-control-sm"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="class_id"><h5>Class :</h5></label>
              <select
                name="class_id"
                id="class_id"
                className="form-control-sm"
                value={formData.class_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Class</option>
                {classes.map((class_) => (
                  <option key={class_.id} value={class_.id}>
                    {class_.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary transition-button">
              {editId ? 'Update Division' : 'Create Division'}
            </button>
          </form>
        </div>
      </div>

      <h3 className="mt-5">Division List</h3>
      <div className="row">
        {divisions.map((division) => (
          <div key={division.id} className="col-md-4 mb-4">
            <div className="card division-card transition-card">
              <div className="card-body">
                <h5 className="card-title">{division.name}</h5>
                <p className="card-text">Class Name: {division.class_name}</p>
                <button
                  className="btn btn-warning btn-sm mr-2 transition-button"
                  onClick={() => handleEdit(division)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm transition-button"
                  onClick={() => handleDelete(division.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DivisionManager;
