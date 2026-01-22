import axios from 'axios';

// Use environment variable or fallback to production URL
const API_URL = import.meta.env.VITE_API_URL || 
                (import.meta.env.PROD 
                  ? 'https://expense-backend-0e6d.onrender.com/api' 
                  : 'http://localhost:5000/api');

console.log('API URL:', API_URL, 'Production:', import.meta.env.PROD);

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

export const getPendingExpenses = (locations, approverId) => 
  api.get('/expenses/pending', { params: { locations, approverId } });

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

// Settings - Approver Assignments
export const getApproverAssignments = () => 
  api.get('/settings/approver-assignments');

export const createApproverAssignments = (data) => 
  api.post('/settings/approver-assignments', data);

export const deleteApproverAssignment = (id) => 
  api.delete(`/settings/approver-assignments/${id}`);

export const getAssignedEmployees = (approverId) => 
  api.get(`/settings/approver-assignments/approver/${approverId}`);

// Get approver assigned to an employee
export const getAssignedApprover = (employeeId) => 
  api.get(`/settings/approver-assignments/employee/${employeeId}`);

// Settings - Locations
export const getLocations = () => 
  api.get('/settings/locations');

export const updateLocations = (locations) => 
  api.put('/settings/locations', { locations });

// Settings - Expense Items
export const getExpenseItems = () => 
  api.get('/settings/expense-items');

export const updateExpenseItems = (expenseItems) => 
  api.put('/settings/expense-items', { expenseItems });

export default api;
