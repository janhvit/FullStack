import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './StudentAssignmentsPage.css'; 
const StudentAssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [submission, setSubmission] = useState({ status: '' });
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [error, setError] = useState('');
  const [submittedAssignments, setSubmittedAssignments] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/assignment/assignments', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        console.log('Fetched assignments:', response.data); 
        setAssignments(response.data);
      } catch (error) {
        console.error('Error fetching assignments:', error.response?.data || error.message);
        setError('Error fetching assignments');
      }
    };

    const fetchSubmittedAssignments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/assignment/assignment/submission', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        console.log('Fetched submitted assignments:', response.data); 
        const submissions = response.data.reduce((acc, sub) => {
          acc[sub.assignment_id] = sub.status;
          return acc;
        }, {});
        setSubmittedAssignments(submissions);
      } catch (error) {
        console.error('Error fetching submitted assignments:', error.response?.data || error.message);
        setError('Error fetching submitted assignments');
      }
    };

    fetchAssignments();
    fetchSubmittedAssignments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssignment || !submission.status) {
      setError('Please select an assignment and status.');
      return;
    }

    try {
      await axios.post(`http://localhost:5000/assignment/assignments/${selectedAssignment}/submit`, {
        status: submission.status,
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Assignment submitted successfully');
      setSubmittedAssignments({ ...submittedAssignments, [selectedAssignment]: submission.status });
    } catch (error) {
      console.error('Error submitting assignment:', error.response?.data || error.message);
      setError('Error submitting assignment');
    }
  };

  const handleAssignmentChange = (e) => {
    setSelectedAssignment(e.target.value);
    setSubmission({ status: submittedAssignments[e.target.value] || '' });
  };

  const handleSubmissionChange = (e) => {
    setSubmission({ ...submission, status: e.target.value });
  };

  return (
    <div className="container mt-5">
      <h2 className="font-weight-bold">Student Assignments</h2>
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="font-weight-bold">Select Assignment</label>
          <select
            className="form-control"
            value={selectedAssignment || ''}
            onChange={handleAssignmentChange}
            required
          >
            <option value="" disabled>Select an assignment</option>
            {assignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.title}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group mt-3">
          <label className="font-weight-bold">Status</label>
          <select
            className="form-control status-select"
            value={submission.status}
            onChange={handleSubmissionChange}
            required
            disabled={submittedAssignments[selectedAssignment] === 'Completed'}
          >
            <option value="" disabled>Select status</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <button
          type="submit"
          className={`btn mt-3 ${submittedAssignments[selectedAssignment] ? 'btn-warning' : 'btn-primary'}`}
          disabled={submittedAssignments[selectedAssignment] === 'Completed'}
        >
          {submittedAssignments[selectedAssignment] ? 'Update Assignment' : 'Submit Assignment'}
        </button>
      </form>
      <h3 className="mt-4 font-weight-bold">Your Assignments</h3>
      <ul className="list-group">
        {assignments.map((assignment) => (
          <li key={assignment.id} className="list-group-item">
            <h5 className="font-weight-bold">{assignment.title}</h5>
            <h6> <p>{assignment.description}</p></h6>
            <h6>  <p>Due Date: {assignment.due_date}</p></h6>
            {submittedAssignments[assignment.id] && (
              <p className={`status-badge ${submittedAssignments[assignment.id] === 'Completed' ? 'badge-success' : 'badge-primary'}`}>
                {submittedAssignments[assignment.id]}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentAssignmentsPage;
