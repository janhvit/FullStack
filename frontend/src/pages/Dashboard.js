import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Dropdown, DropdownButton, Fade } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faClipboard, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './Dashboard.css'; 


const Dashboard = () => {
  const [studentDetails, setStudentDetails] = useState({
    name: '',
    studentClass: '',
    division: ''
  });
  const [showWelcome, setShowWelcome] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/student/students/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setStudentDetails({
          name: response.data.name,
          studentClass: response.data.class ? response.data.class.name : '',
          division: response.data.division ? response.data.division.name : ''
        });
        setShowWelcome(true); 
      } catch (error) {
        console.error('Error fetching student details:', error);
      }
    };

    fetchStudentDetails();
  }, []);

  const getInitials = (name) => {
    const names = name.split(' ');
    const initials = names.map(name => name[0]).join('');
    return initials.toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleUpdateProfile = () => {
    navigate('/update-profile');
  };

  return (
    <div className="container mt-5">
      <Fade in={showWelcome} timeout={300}>
        <div className="mb-4">
          <h2>Welcome to School Management System , {studentDetails.name}!</h2>
          <p>
            <span style={{
              fontSize: '22px',
              fontFamily: 'Times New Roman, serif',
              transition: 'all 0.3s ease-in-out'
            }}>
              <strong>Class:</strong> <b>{studentDetails.studentClass}</b> <br />
              <strong>Division:</strong> <b>{studentDetails.division}</b>
            </span>
          </p>
        </div>
      </Fade>
      <h3>Manage your Courses, Assignments and Attendance.</h3>
      <div className="row">
        <div className="col-md-4">
          <Card className="text-center">
            <Card.Body>
              <FontAwesomeIcon icon={faBook} size="3x" className="mb-3" />
              <Card.Title>Courses</Card.Title>
              <Card.Text><h5>View and manage your courses.</h5></Card.Text>
              <Button as={Link} to="/courses" variant="primary">Go to Courses</Button>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="text-center">
            <Card.Body>
              <FontAwesomeIcon icon={faClipboard} size="3x" className="mb-3" />
              <Card.Title>Assignments</Card.Title>
              <Card.Text><h5>View and submit your assignments.</h5></Card.Text>
              <Button as={Link} to="/assignments" variant="warning">Go to Assignments</Button>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="text-center">
            <Card.Body>
              <FontAwesomeIcon icon={faCheckCircle} size="3x" className="mb-3" />
              <Card.Title>Attendance</Card.Title>
              <Card.Text><h5>Check your attendance record.</h5></Card.Text>
              <Button as={Link} to="/attendance" variant="success">Go to Attendance</Button>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
