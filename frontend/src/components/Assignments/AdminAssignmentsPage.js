import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminAssignmentsPage = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', due_date: '', class_id: '' });
  const [error, setError] = useState('');
  const [submissions, setSubmissions] = useState({});

  useEffect(() => {
    const is_teacher = localStorage.getItem('is_teacher');
    if (is_teacher === "false") {
      navigate('/');
    }

    const fetchAssignments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/assignment/assignments', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        setAssignments(response.data);
      } catch (error) {
        console.error('Error fetching assignments:', error.response?.data || error.message || error);
        toast.error('Error fetching assignments');
      }
    };

    fetchAssignments();
  }, [navigate]);

  const fetchSubmissions = async (assignmentId) => {
    try {
      const response = await axios.get(`http://localhost:5000/assignment/assignments/${assignmentId}/submissions`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      setSubmissions((prevSubmissions) => ({
        ...prevSubmissions,
        [assignmentId]: response.data,
      }));
    } catch (error) {
      console.error('Error fetching submissions:', error.response?.data || error.message || error);
      setError('Error fetching submissions');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment({ ...newAssignment, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/assignment/assignments', [newAssignment], {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
     
      const response = await axios.get('http://localhost:5000/assignment/assignments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      setAssignments(response.data);
      setNewAssignment({ title: '', description: '', due_date: '', class_id: '' });
    } catch (error) {
      console.error('Error creating assignment:', error.response?.data || error.message || error);
      setError('Error creating assignment');
    }
  };

  const handleDelete = async (assignmentId) => {
    try {
      await axios.delete(`http://localhost:5000/assignment/assignments/${assignmentId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
    
      const response = await axios.get('http://localhost:5000/assignment/assignments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      setAssignments(response.data);
    } catch (error) {
      console.error('Error deleting assignment:', error.response?.data || error.message || error);
      setError('Error deleting assignment');
    }
  };

  const handleViewSubmissions = (assignmentId) => {
    fetchSubmissions(assignmentId);
  };

  return (
    <div className="container mt-5">
      <h2>Admin Assignments</h2>
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label><h5>Title</h5></label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={newAssignment.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label><h5>Description</h5></label>
          <textarea
            name="description"
            className="form-control"
            value={newAssignment.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label><h5>Due Date</h5></label>
          <input
            type="date"
            name="due_date"
            className="form-control"
            value={newAssignment.due_date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label><h5>Class ID</h5></label>
          <input
            type="number"
            name="class_id"
            className="form-control"
            value={newAssignment.class_id}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Create Assignment</button>
      </form>
      <h3 className="mt-4">Existing Assignments</h3>
      <ul className="list-group">
        {assignments.map((assignment) => (
          <li key={assignment.id} className="list-group-item">
            <div>
              <h5>{assignment.title}</h5>
              <p>{assignment.description}</p>
              <p>Due Date: {assignment.due_date}</p>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <button className="btn btn-secondary mr-2" onClick={() => handleViewSubmissions(assignment.id)}>
                  View Submissions
                </button>
                {submissions[assignment.id] && (
                  <div className="mt-3">
                    <h6>Submissions:</h6>
                    <ul>
                      {submissions[assignment.id].map((submission) => (
                        <li key={submission.id}>
                         <h6> Student Name: {submission.student_name}, Class: {submission.class_name}, Status: {submission.status}</h6>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <button className="btn btn-danger" onClick={() => handleDelete(assignment.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminAssignmentsPage;
