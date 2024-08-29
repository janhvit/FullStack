import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; 

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    is_teacher: false,
    first_name: '', 
    last_name: '',  
    class_id: '',   
    division_id: '' 
  });
  const [classes, setClasses] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [filteredDivisions, setFilteredDivisions] = useState([]); 
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/classes/classes');
        setClasses(response.data);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setError('Error fetching classes');
      }
    };

    fetchClasses();
  }, []);

  
  useEffect(() => {
    const fetchAllDivisions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/division/divisions');
        setDivisions(response.data);
      } catch (error) {
        console.error('Error fetching divisions:', error);
        setError('Error fetching divisions');
      }
    };

    fetchAllDivisions();
  }, []);

  
  useEffect(() => {
    if (formData.class_id) {
      const filtered = divisions.filter(division => division.class_id === parseInt(formData.class_id));
      setFilteredDivisions(filtered);
    } else {
      setFilteredDivisions([]); 
    }
  }, [formData.class_id, divisions]);

  const validateForm = () => {
    const errors = {};
    if (!formData.username) errors.username = 'Username is required';
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters long';
    if (!formData.is_teacher) {
      if (!formData.first_name) errors.first_name = 'First name is required';
      if (!formData.last_name) errors.last_name = 'Last name is required';
      if (!formData.class_id) errors.class_id = 'Class is required';
      if (!formData.division_id) errors.division_id = 'Division is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post('http://localhost:5000/auth/register', formData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Registration successful:', response.data);
        navigate('/');
      } catch (error) {
        setError(error.response ? error.response.data.error : 'An error occurred. Please try again.');
      }
    }
  };

  return (
    <Container fluid className="p-5" >
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <div className="p-4 border rounded bg-white shadow-sm">
            <h2 className="text-center mb-4">Register</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  isInvalid={!!formErrors.username}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.username}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!formErrors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.email}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  isInvalid={!!formErrors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.password}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formIsTeacher">
                <Form.Check
                  type="checkbox"
                  name="is_teacher"
                  label="Teacher"
                  checked={formData.is_teacher}
                  onChange={handleChange}
                />
              </Form.Group>

             
              {!formData.is_teacher && (
                <>
                  <Form.Group className="mb-3" controlId="formFirstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      isInvalid={!!formErrors.first_name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.first_name}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formLastName">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      isInvalid={!!formErrors.last_name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.last_name}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formClassId">
                    <Form.Label>Class</Form.Label>
                    <Form.Control
                      as="select"
                      name="class_id"
                      value={formData.class_id}
                      onChange={handleChange}
                      isInvalid={!!formErrors.class_id}
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.class_id}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formDivisionId">
                    <Form.Label>Division</Form.Label>
                    <Form.Control
                      as="select"
                      name="division_id"
                      value={formData.division_id}
                      onChange={handleChange}
                      isInvalid={!!formErrors.division_id}
                    >
                      <option value="">Select Division</option>
                      {filteredDivisions.map((div) => (
                        <option key={div.id} value={div.id}>{div.name}</option>
                      ))}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.division_id}
                    </Form.Control.Feedback>
                  </Form.Group>
                </>
              )}

              <Button variant="primary" type="submit" className="w-100">
                Register
              </Button>
              {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
