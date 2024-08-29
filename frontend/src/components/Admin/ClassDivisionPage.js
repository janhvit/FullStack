import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Alert, Button, Modal } from 'react-bootstrap';

const ClassDivisionPage = () => {
    const [classes, setClasses] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [filteredDivisions, setFilteredDivisions] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDivision, setSelectedDivision] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentDetails, setStudentDetails] = useState({});
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);

    const token = localStorage.getItem('token'); 
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await axios.get('http://localhost:5000/classes/classes', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setClasses(response.data);
            } catch (error) {
                console.error('Error fetching classes:', error);
                setError('Error fetching classes');
            }
        };

        fetchClasses();
    }, [token]);

    useEffect(() => {
        const fetchAllDivisions = async () => {
            try {
                const response = await axios.get('http://localhost:5000/division/divisions', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDivisions(response.data);
            } catch (error) {
                console.error('Error fetching divisions:', error);
                setError('Error fetching divisions');
            }
        };

        fetchAllDivisions();
    }, [token]);

    useEffect(() => {
        if (selectedClass) {
            const filtered = divisions.filter(division => division.class_id === parseInt(selectedClass));
            setFilteredDivisions(filtered);
        } else {
            setFilteredDivisions([]);
        }
    }, [selectedClass, divisions]);

    useEffect(() => {
        const fetchStudents = async () => {
            if (selectedClass && selectedDivision) {
                try {
                    const response = await axios.get(`http://localhost:5000/classes/classes/${selectedClass}/divisions/${selectedDivision}/students`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setStudents(response.data);
                } catch (error) {
                    console.error('Error fetching students:', error);
                    setError('Error fetching students');
                }
            }
        };

        fetchStudents();
    }, [selectedClass, selectedDivision, token]);

    const handleClassChange = (event) => {
        setSelectedClass(event.target.value);
        setSelectedDivision(''); 
        setStudents([]); 
    };

    const handleDivisionChange = (event) => {
        setSelectedDivision(event.target.value);
    };

    const handleStudentClick = async (studentId) => {
        try {
            const response = await axios.get(`http://localhost:5000/classes/students/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudentDetails(response.data);
            setSelectedStudent(studentId);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching student details:', error);
            setError('Error fetching student details');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false); 
        setSelectedStudent(null);
    };

    const handleDeleteStudent = async (studentId) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await axios.delete(`http://localhost:5000/classes/students/${studentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setStudents(students.filter(student => student.student_id !== studentId));
                setError(''); 
            } catch (error) {
                console.error('Error deleting student:', error);
                setError('Error deleting student');
            }
        }
    };

    return (
        <Container>
            <Row className="mt-5">
                <Col>
                    <h1>View Students by Class and Division</h1>
                    <br />
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form>
                        <Form.Group controlId="classSelect" className="mb-3">
                            <Form.Label><h4>Class</h4></Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedClass}
                                onChange={handleClassChange}
                                className="custom-small-input"  >
                                <option value="" disabled>Select a class</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="divisionSelect" className="mb-3">
                            <Form.Label><h4>Division</h4></Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedDivision}
                                onChange={handleDivisionChange}
                                disabled={!selectedClass}
                                className="custom-small-input"  
                            >
                                <option value="" disabled>Select a division</option>
                                {filteredDivisions.map(div => (
                                    <option key={div.id} value={div.id}>{div.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Col>
            </Row>

            <Row>
                <Col>
                    <h3>Students List</h3>
                    {students.length === 0 ? (
                        <h4>No students found for the selected class and division.</h4>
                    ) : (
                        <ul className="list-group">
                            {students.map(student => (
                                <li
                                    key={student.student_id}
                                    className="list-group-item d-flex justify-content-between align-items-center"
                                    onClick={() => handleStudentClick(student.student_id)}
                                >
                                    <h6>{student.username} ({student.email})</h6>
                                    <Button 
                                        variant="danger" 
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteStudent(student.student_id);
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </Col>
            </Row>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Student Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {studentDetails && (
                        <div>
                            <h4>{studentDetails.username}</h4>
                            <p><b>Email:</b> {studentDetails.email}</p>
                            <h4>Assignments</h4>
                            {studentDetails.assignments && studentDetails.assignments.length > 0 ? (
                                <ul>
                                    {studentDetails.assignments.map(assignment => (
                                        <li key={assignment.assignment_id}>
                                            {assignment.title} - {assignment.description} (Due: {assignment.due_date})
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No assignments found.</p>
                            )}
                            <h4>Attendance</h4>
                            {studentDetails.attendance && studentDetails.attendance.length > 0 ? (
                                <ul>
                                    {studentDetails.attendance.map(record => (
                                        <li key={record.date}>
                                            Date: {record.date} - Status: {record.status}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No attendance records found.</p>
                            )}
                            <h4>Courses Enrolled</h4>
                            {studentDetails.courses && studentDetails.courses.length > 0 ? (
                                <ul>
                                    {studentDetails.courses.map(course => (
                                        <li key={course.course_id}>
                                            {course.course_name}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No courses enrolled.</p>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ClassDivisionPage;
