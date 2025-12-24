import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const login = (name, password) => 
  api.post('/auth/login', { name, password });

export const verifyToken = (token) => 
  api.post('/auth/verify', { token });

// Users
export const getAllUsers = () => 
  api.get('/users');

export const createUser = (userData) => 
  api.post('/users', userData);

export const updateUser = (id, userData) => 
  api.put(`/users/${id}`, userData);

export const deleteUser = (id) => 
  api.delete(`/users/${id}`);

export const getUsersByRole = (role) => 
  api.get(`/users/role/${role}`);

// Expenses
export const submitExpense = (formData) => 
  api.post('/expenses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const getEmployeeExpenses = (employeeId) => 
  api.get(`/expenses/employee/${employeeId}`);

export const getPendingExpenses = (locations) => 
  api.get('/expenses/pending', { params: { locations } });

export const getAllExpenses = (filters) => 
  api.get('/expenses', { params: filters });

export const approveExpense = (id, data) => 
  api.put(`/expenses/${id}/approve`, data);

export const declineExpense = (id, data) => 
  api.put(`/expenses/${id}/decline`, data);

// Analytics
export const getAnalytics = (filters) => 
  api.get('/analytics', { params: filters });

export const exportCSV = (filters) => {
  return api.get('/analytics/export', { 
    params: filters,
    responseType: 'blob'
  });
};

export default api;
