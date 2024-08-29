import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Table, Row, Col } from 'react-bootstrap';
import './AdminAttendance.css';

const AdminAttendance = () => {
    const [attendanceSummary, setAttendanceSummary] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedClassDiv, setSelectedClassDiv] = useState(null);

    useEffect(() => {
        const fetchAttendances = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://localhost:5000/attendance/attendances', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setAttendanceSummary(response.data);
            } catch (error) {
                console.error('Error fetching attendance:', error);
            }
        };

        fetchAttendances();
    }, []);

    const handleVerify = async (attendanceId) => {
        if (!attendanceId) {
            console.error('No attendance ID provided');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(
                `http://localhost:5000/attendance/attendances/${attendanceId}`,
                { verified: true },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setAttendanceSummary(prevSummary => {
                const updatedSummary = { ...prevSummary };

                Object.keys(updatedSummary).forEach(date => {
                    Object.keys(updatedSummary[date]).forEach(classDiv => {
                        updatedSummary[date][classDiv] = updatedSummary[date][classDiv].map(student => 
                            student.attendance_id === attendanceId 
                                ? { ...student, verified: true, status: 'Verified' } 
                                : student
                        );
                    });
                });

                return updatedSummary;
            });
        } catch (error) {
            console.error('Error verifying attendance:', error.response?.data || error.message);
        }
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
        setSelectedClassDiv(null);  // Reset class/division selection when a new date is selected
    };

    const handleClassDivClick = (classDiv) => {
        setSelectedClassDiv(classDiv);
    };

    return (
        <Container className="mt-5">
            <h1 className="mb-4 text-center">Attendance Summary</h1>
            
            {/* Date Selection Buttons */}
            <Row className="mb-4">
                {Object.keys(attendanceSummary).map(date => (
                    <Col key={date} xs={6} sm={4} md={3} lg={2} className="mb-3">
                        <Button
                            variant="secondary"
                            className="w-100"
                            onClick={() => handleDateClick(date)}
                        >
                            {date}
                        </Button>
                    </Col>
                ))}
            </Row>

            {selectedDate && (
                <div>
                    <h2 className="mb-4">Attendance on {selectedDate}</h2>
                    
                    {/* Class-Division Selection Buttons */}
                    <Row className="mb-4">
                        {Object.keys(attendanceSummary[selectedDate] || {}).map(classDiv => (
                            <Col key={classDiv} xs={6} sm={4} md={3} lg={2} className="mb-3">
                                <Button
                                    variant="primary"
                                    className="w-100"
                                    onClick={() => handleClassDivClick(classDiv)}
                                >
                                    {classDiv}
                                </Button>
                            </Col>
                        ))}
                    </Row>

                    {selectedClassDiv && (
                        <div>
                            <h3 className="mb-4">Attendance for {selectedClassDiv}</h3>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Student Name</th>
                                        <th>Status</th>
                                        <th>Action</th> {/* Column for verification */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceSummary[selectedDate][selectedClassDiv]?.map(student => (
                                        <tr key={student.attendance_id}>
                                            <td>{student.student_name}</td>
                                            <td>{student.status}</td>
                                            <td>
                                                {student.verified ? (
                                                    <span>Verified</span>
                                                ) : (
                                                    <Button
                                                        variant="primary"
                                                        onClick={() => handleVerify(student.attendance_id)}
                                                    >
                                                        Verify
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </div>
            )}
        </Container>
    );
};

export default AdminAttendance;
