import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavigationBar from './components/shared/Navbar'; 
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './components/Auth/Login';
import AdminDashboard from './pages/AdminDashboard';
import Register from './components/Auth/Register';
import TeacherCourseForm from './components/Courses/TeacherCourseForm';
import StudentEnrollForm from './components/Courses/StudentEnrollForm';
import DivisionManager from './components/Divisions/DivisionManager';
import ClassManager from './components/Classes/ClassManager';
import AdminAssignmentsPage from './components/Assignments/AdminAssignmentsPage';
import StudentAssignmentsPage from './components/Assignments/StudentAssignmentsPage';
import Attendance from './components/Attendance/Attendance';
import AdminAttendance from './components/Attendance/AdminAttendance';
import UpdateProfile from './components/Profile/UpdateProfile';
import ClassDivisionPage from './components/Admin/ClassDivisionPage';
import './App.css';


const ProtectedRoute = ({ element: Component, role, ...rest }) => {
  const token = localStorage.getItem('token');
  const isTeacher = localStorage.getItem('is_teacher') === 'true';

  if (!token) {
    return <Navigate to="/" />;
  }

  if (role === 'teacher' && !isTeacher) {
    return <Navigate to="/dashboard" />;
  }

  if (role === 'student' && isTeacher) {
    return <Navigate to="/admin/dashboard" />;
  }

  return <Component {...rest} />;
};

const App = () => {
  return (
    <Router class='school'>
      <NavigationBar />
      <Routes>
        <Route  path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} role="student" />} />
        <Route path="/courses" element={<StudentEnrollForm />}  />
        <Route path="/admin/courses" element={<TeacherCourseForm />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
        <Route path="/admin/divisions" element={<DivisionManager />} />
        <Route path="/admin/classes" element={<ClassManager />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/admin/attendance" element={<AdminAttendance />} />
        <Route path="/admin/assignments" element={<AdminAssignmentsPage />} />
        <Route path="/admin/class-division" element={<ClassDivisionPage />} />
        <Route path="/assignments" element={<StudentAssignmentsPage />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute element={AdminDashboard} role="teacher" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
