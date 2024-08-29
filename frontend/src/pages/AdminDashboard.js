import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Navbar, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faClipboard, faCheckCircle, faChalkboardTeacher, faUsers } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminDashboard.css'; 
const AdminDashboard = () => {
  const [teacherDetails, setTeacherDetails] = useState({
    name: '',
    role: ''
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/auth/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setTeacherDetails({
          name: response.data.username,
          role: 'Teacher'
        });
        setIsLoggedIn(true); 
      } catch (error) {
        console.error('Error fetching teacher details:', error);
        setIsLoggedIn(false);
      }
    };

    fetchTeacherDetails();
  }, []); 

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <>
      
        <Nav className="ms-auto logout"> 
          <Button variant="danger" onClick={handleLogout}>Logout</Button>
        </Nav>
      

      <div className="container mt-5">
        <center><h3>Welcome to AdminDashboard..!</h3></center><br></br>
        <div className="row">
          <div className="col-md-4">
            <Card className="text-center">
              <Card.Body>
                <FontAwesomeIcon icon={faBook} size="3x" className="mb-3" />
                <Card.Title>Courses</Card.Title>
                <Card.Text><h4>Manage all courses.</h4></Card.Text>
                <Button as={Link} to="/admin/courses" variant="primary">Go to Courses</Button>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-4">
            <Card className="text-center">
              <Card.Body>
                <FontAwesomeIcon icon={faUsers} size="3x" className="mb-3" />
                <Card.Title>Divisions</Card.Title>
                <Card.Text><h4>Manage all divisions.</h4></Card.Text>
                <Button as={Link} to="/admin/divisions" variant="secondary">Go to Divisions</Button>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-4">
            <Card className="text-center">
              <Card.Body>
                <FontAwesomeIcon icon={faChalkboardTeacher} size="3x" className="mb-3" />
                <Card.Title>Classes</Card.Title>
                <Card.Text><h4>Manage all classes.</h4></Card.Text>
                <Button as={Link} to="/admin/classes" variant="success">Go to Classes</Button>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-4 mt-4">
            <Card className="text-center">
              <Card.Body>
                <FontAwesomeIcon icon={faClipboard} size="3x" className="mb-3" />
                <Card.Title>Assignments</Card.Title>
                <Card.Text><h4>Manage all assignments.</h4></Card.Text>
                <Button as={Link} to="/admin/assignments" variant="warning">Go to Assignments</Button>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-4 mt-4">
            <Card className="text-center">
              <Card.Body>
                <FontAwesomeIcon icon={faUsers} size="3x" className="mb-3" />
                <Card.Title>Student Activity</Card.Title>
                <Card.Text><h4>Manage Student Activity.</h4></Card.Text>
                <Button as={Link} to="/admin/class-division" variant="warning">Go to Class & Division</Button>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-4 mt-4">
            <Card className="text-center">
              <Card.Body>
                <FontAwesomeIcon icon={faCheckCircle} size="3x" className="mb-3" />
                <Card.Title>Attendance</Card.Title>
                <Card.Text><h4>Manage student attendance.</h4></Card.Text>
                <Button as={Link} to="/admin/attendance" variant="success">Go to Attendance</Button>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
