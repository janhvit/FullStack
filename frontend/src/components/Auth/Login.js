
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/auth/login', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('is_teacher', response.data.is_admin);
      localStorage.setItem('teacher_id', response.data.teacher_id);
      localStorage.setItem('student_id', response.data.student_id);  
      console.log('Login successful:', response.data);

      const isTeacher = response.data.is_admin; 
      if (isTeacher) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (error) {
      
      setError(error.response ? error.response.data.error : 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            className="form-control-sm"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            className="form-control-sm"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
        {error && <p className="text-danger mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
