import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Alert, Container } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';  // Importing the icons
import './ClassManager.css'; 

const API_URL = 'http://localhost:5000/classes/classes';

const ClassManager = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({ name: '', teacher_id: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(response.data);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      setError('Failed to fetch classes');
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get(`${API_URL}/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(response.data);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
      setError('Failed to fetch teachers');
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
      const headers = { Authorization: `Bearer ${token}` };
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData, { headers });
        setSuccess('Class updated successfully');
      } else {
        await axios.post(API_URL, formData, { headers });
        setSuccess('Class created successfully');
      }
      setFormData({ name: '', teacher_id: '' });
      setEditId(null);
      fetchClasses();
    } catch (err) {
      console.error('Failed to save class:', err);
      setError('Failed to save class');
    }
  };

  const handleEdit = (cls) => {
    setFormData({ name: cls.name, teacher_id: cls.teacher_id });
    setEditId(cls.id);
  };

  const handleDelete = async (id) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const response = await axios.delete(`${API_URL}/${id}`, { headers });
      if (response.status === 200) {
        setSuccess('Class deleted successfully');
        fetchClasses();
      } else {
        setError('Failed to delete class');
        console.error('Unexpected response status:', response.status);
      }
    } catch (err) {
      if (err.response) {
        console.error('Server error:', err.response.data);
        setError(`Server error: ${err.response.data.msg || 'Unknown error'}`);
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('No response from server');
      } else {
        console.error('Error setting up request:', err.message);
        setError(`Error: ${err.message}`);
      }
    }
  };

  return (
    <Container className="mt-5">
      <h2>Manage Classes</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit} className="mb-4">
        <Form.Group controlId="formClassName" className="form-group-sm">
          <Form.Label>Class Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter class name"
            className="form-control-sm"
          />
        </Form.Group>
        <Form.Group controlId="formTeacher" className="form-group-sm">
          <Form.Label>Teacher</Form.Label>
          <Form.Control
            as="select"
            name="teacher_id"
            value={formData.teacher_id}
            onChange={handleChange}
            required
            className="form-control-sm"
          >
            <option value="">Select Teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Button type="submit" variant="primary" size="sm">
          {editId ? 'Update Class' : 'Create Class'}
        </Button>
      </Form>

      <h3>Class List</h3>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Teacher</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((cls) => (
            <tr key={cls.id}>
              <td>{cls.name}</td>
              <td>{cls.teacher_id}</td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => handleEdit(cls)}
                  className="mr-2"
                >
                  <FaEdit /> {/* Edit Icon */}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(cls.id)}
                > 
                  <FaTrash /> {/* Delete Icon */}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ClassManager;
