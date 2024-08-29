import axios from 'axios';

const API_URL = 'http://localhost:5000';  // Adjust if necessary

export const register = (userData) => axios.post(`http://localhost:5000/auth/register`, userData);

export const login = (userData) => axios.post(`${API_URL}/auth/login`, userData);

export const getProfile = (token) => axios.get(`${API_URL}/profile`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

// Add more API functions for courses, classes, divisions, assignments...
