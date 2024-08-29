import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './TeacherCourseForm.css'; 
import { toast } from 'react-toastify';

const TeacherCourseForm = () => {
  const [courseName, setCourseName] = useState('');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [teacherId, setTeacherId] = useState(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchTeacherInfo = async () => {
      try {
        const response = await axios.get('http://localhost:5000/course/teachers/me', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setTeacherId(response.data.id);
      } catch (error) {
        setError('Failed to fetch teacher info');
      }
    };

    fetchTeacherInfo();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/course/courses', {
        course_name: courseName,
        teacher_id: teacherId
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setCourses([...courses, response.data]);
      setCourseName('');
      setError('');
    } catch (error) {
      setError('Error creating course');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/course/courses', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setCourses(response.data);
    } catch (error) {
      setError('Error fetching courses');
    }
  };

  const fetchEnrollments = async (courseId) => {
    try {
      const response = await axios.get(`http://localhost:5000/course/courses/${courseId}/enrollments`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setEnrollments(response.data);
      const course = courses.find(course => course.id === courseId);
      setSelectedCourse(course ? course.course_name : 'Course Not Found');
      setError('');
      setShowModal(true); // Show the modal
    } catch (error) {
      setError('Error fetching enrollments');
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCloseModal = () => {
    setShowModal(false); // Hide the modal
  };

  return (
    <div className="container mt-5 teacher-course-form">
      <h1 className="mb-4">Create Course</h1>
      <form onSubmit={handleCreateCourse} className="mb-4">
        <div className="form-group d-flex">
          <input
            type="text"
            id="courseName"
            placeholder="Enter course name"
            className="form-control-sm me-3" 
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Create Course
          </button>
        </div>
        {error && <div className="alert-danger mt-3">{error}</div>}
      </form>

      <h2 className="mb-4">My Courses</h2>
      <div className="list-group mb-4">
        {courses.map(course => (
          <div key={course.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span className="font-weight">{course.course_name}</span>
            <button
              className="btn btn-info btn-sm"
              onClick={() => fetchEnrollments(course.id)}
            >
              View Enrollments
            </button>
          </div>
        ))}
      </div>


      <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">Enrollments for Course: {selectedCourse}</h5>
             
               
             
            </div>
            <div className="modal-body">
              <ul className="list-group">
                {enrollments.map(enrollment => (
                  <li key={enrollment.id} className="list-group-item">
                    <small>
                      <b>Student Name:</b> {enrollment.student_name} - <b>Class:</b> {enrollment.class} - <b>Division:</b> {enrollment.division}
                    </small>
                  </li>
                ))}
              </ul>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherCourseForm;
