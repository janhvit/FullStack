import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Dropdown, DropdownButton } from 'react-bootstrap';
import axios from 'axios';

const NavigationBar = () => {
  const [studentDetails, setStudentDetails] = useState({ name: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchStudentDetails = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/student/students/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setStudentDetails({ name: response.data.name });
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Error fetching student details:', error);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    fetchStudentDetails();
  }, [localStorage.getItem('token')]); 

  const handleLogout = () => {
    localStorage.clear(); 
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleUpdateProfile = () => {
    navigate('/update-profile');
  };

  const getInitials = (name) => {
    const names = name.split(' ');
    return names.map(name => name[0]).join('').toUpperCase();
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand as={Link} to="/dashboard">
        Welcome to Hyancinth's Little Flower School [School Management System]
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto">
          {isLoggedIn && studentDetails.name && (
            <DropdownButton
              style={{ marginRight: '25px' }}
              align="end"
              title={getInitials(studentDetails.name)}
              variant="secondary"
              id="dropdown-menu-align-right"
            >
              <Dropdown.Item onClick={handleUpdateProfile}><h6>Update Profile</h6></Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}><h6>Logout</h6></Dropdown.Item>
            </DropdownButton>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavigationBar;
