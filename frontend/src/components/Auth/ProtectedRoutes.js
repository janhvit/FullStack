
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
    const token = localStorage.getItem('token');
    const isTeacher = localStorage.getItem('is_teacher') === 'true';

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (role === 'teacher' && !isTeacher) {
        return <Navigate to="/student-dashboard" />;
    }

    if (role === 'student' && isTeacher) {
        return <Navigate to="/teacher-dashboard" />;
    }

    return children;
};

export default ProtectedRoute;
