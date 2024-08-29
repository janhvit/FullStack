import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Form, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faList } from '@fortawesome/free-solid-svg-icons';
import './StudentEnrollForm.css'; 

const StudentEnrollForm = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/course/courses', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
        });
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    const fetchEnrolledCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/course/courses/enrolled', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
        });
        setEnrolledCourses(response.data.map(course => course.id)); 
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      }
    };

    fetchCourses();
    fetchEnrolledCourses();
  }, []);

  const handleEnroll = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:5000/course/courses/${selectedCourse}/enroll`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      alert('Successfully enrolled in course!');
      setSelectedCourse('');
    
      const updatedEnrolledCourses = await axios.get('http://localhost:5000/course/courses/enrolled', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      setEnrolledCourses(updatedEnrolledCourses.data.map(course => course.id));
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Error enrolling in course');
    }
  };

  return (
    <div className="container mt-5">
      <Card className="mb-4">
        <Card.Body>
          <h2 className="mb-4">Enroll in a Course</h2>
          <Form onSubmit={handleEnroll}>
            <Form.Group controlId="courseSelect">
              <Form.Label className="font-weight-bold">Select Course</Form.Label>
              <Form.Control
                as="select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                required
              >
                <option value="">Select a course</option>
                {courses
                  .filter(course => !enrolledCourses.includes(course.id)) 
                  .map((course) => (
                    <option key={course.id} value={course.id}>
                      <span className="font-weight">{course.course_name}</span>
                    </option>
                  ))}
              </Form.Control>
            </Form.Group>
            <Button type="submit" variant="primary" className="mt-3">
              <FontAwesomeIcon icon={faPlusCircle} className="me-2" /> Enroll
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <h3 className="mb-4">
            <FontAwesomeIcon icon={faList} className="me-2" /> Your Enrolled Courses
          </h3>
          <ListGroup>
            {courses
              .filter(course => enrolledCourses.includes(course.id))
              .map((course) => (
                <ListGroup.Item key={course.id} className="d-flex justify-content-between align-items-center">
                  <span className="font-weight-bold">{course.course_name}</span>
                </ListGroup.Item>
              ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </div>
  );
};

export default StudentEnrollForm;
