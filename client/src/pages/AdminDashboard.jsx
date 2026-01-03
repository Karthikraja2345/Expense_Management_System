import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Analytics from '../components/Analytics';
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  getAllExpenses, 
  getAnalytics, 
  exportCSV,
  getUsersByRole,
  getApproverAssignments,
  createApproverAssignments,
  deleteApproverAssignment,
  getLocations,
  updateLocations,
  getExpenseItems,
  updateExpenseItems
} from '../services/api';
import '../styles/AdminDashboard.css';

const ROLES = ['Employee', 'Approver', 'Admin'];

const AdminDashboard = () => {
  // Dynamic Settings
  const [locations, setLocations] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  
  // User Management State
  const [users, setUsers] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    password: '',
    role: 'Employee',
    location: 'Chennai',
    optionalField1: '',
    optionalField2: ''
  });
  const [userMessage, setUserMessage] = useState('');

  // Expense Management State
  const [expenses, setExpenses] = useState([]);
  const [expenseFilters, setExpenseFilters] = useState({
    locations: 'all',
    status: 'all',
    category: 'all',
    startDate: '',
    endDate: ''
  });

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLocations, setAnalyticsLocations] = useState([]);

  // Settings State
  const [approvers, setApprovers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedApprover, setSelectedApprover] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [newLocation, setNewLocation] = useState('');
  const [newExpenseItem, setNewExpenseItem] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    loadSettings();
    loadUsers();
    loadExpenses();
    loadAnalytics();
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [expenseFilters]);

  useEffect(() => {
    loadAnalytics();
  }, [analyticsLocations]);

  const loadSettings = async () => {
    try {
      const [locationsRes, expenseItemsRes] = await Promise.all([
        getLocations(),
        getExpenseItems()
      ]);
      setLocations(locationsRes.data.locations);
      setExpenseTypes(expenseItemsRes.data.expenseItems);
      setAnalyticsLocations(locationsRes.data.locations);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadExpenses = async () => {
    try {
      const response = await getAllExpenses(expenseFilters);
      setExpenses(response.data);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const locations = analyticsLocations.length > 0 ? analyticsLocations.join(',') : 'all';
      const response = await getAnalytics({ locations });
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const handleUserFormChange = (field, value) => {
    setUserForm({ ...userForm, [field]: value });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setUserMessage('');

    try {
      if (editingUser) {
        await updateUser(editingUser.id, userForm);
        setUserMessage('User updated successfully');
      } else {
        await createUser(userForm);
        setUserMessage('User created successfully');
      }

      setShowUserForm(false);
      setEditingUser(null);
      setUserForm({
        name: '',
        password: '',
        role: 'Employee',
        location: 'Chennai',
        optionalField1: '',
        optionalField2: ''
      });
      loadUsers();
    } catch (error) {
      setUserMessage(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      password: '',
      role: user.role,
      location: user.location,
      optionalField1: user.optionalField1 || '',
      optionalField2: user.optionalField2 || ''
    });
    setShowUserForm(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await deleteUser(userId);
      loadUsers();
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  // Settings Functions
  const loadApproversAndEmployees = async () => {
    try {
      const [approversRes, employeesRes, assignmentsRes] = await Promise.all([
        getUsersByRole('Approver'),
        getUsersByRole('Employee'),
        getApproverAssignments()
      ]);
      setApprovers(approversRes.data);
      setEmployees(employeesRes.data);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      console.error('Failed to load approvers/employees:', error);
    }
  };

  const handleAssignEmployees = async (e) => {
    e.preventDefault();
    if (!selectedApprover || selectedEmployees.length === 0) {
      setSettingsMessage('Please select an approver and at least one employee');
      return;
    }

    try {
      const approver = approvers.find(a => a.id === selectedApprover);
      await createApproverAssignments({
        approverId: selectedApprover,
        approverName: approver.name,
        employeeIds: selectedEmployees
      });
      setSettingsMessage('Employees assigned successfully');
      setSelectedApprover('');
      setSelectedEmployees([]);
      loadApproversAndEmployees();
    } catch (error) {
      setSettingsMessage('Failed to assign employees');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      await deleteApproverAssignment(assignmentId);
      loadApproversAndEmployees();
    } catch (error) {
      alert('Failed to delete assignment');
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!newLocation.trim()) return;

    try {
      const updatedLocations = [...locations, newLocation.trim()];
      await updateLocations(updatedLocations);
      setLocations(updatedLocations);
      setNewLocation('');
      setSettingsMessage('Location added successfully');
    } catch (error) {
      setSettingsMessage('Failed to add location');
    }
  };

  const handleDeleteLocation = async (location) => {
    if (!confirm(`Delete location: ${location}?`)) return;

    try {
      const updatedLocations = locations.filter(l => l !== location);
      await updateLocations(updatedLocations);
      setLocations(updatedLocations);
      setSettingsMessage('Location deleted successfully');
    } catch (error) {
      setSettingsMessage('Failed to delete location');
    }
  };

  const handleAddExpenseItem = async (e) => {
    e.preventDefault();
    if (!newExpenseItem.trim()) return;

    try {
      const updatedItems = [...expenseTypes, newExpenseItem.trim()];
      await updateExpenseItems(updatedItems);
      setExpenseTypes(updatedItems);
      setNewExpenseItem('');
      setSettingsMessage('Expense item added successfully');
    } catch (error) {
      setSettingsMessage('Failed to add expense item');
    }
  };

  const handleDeleteExpenseItem = async (item) => {
    if (!confirm(`Delete expense item: ${item}?`)) return;

    try {
      const updatedItems = expenseTypes.filter(i => i !== item);
      await updateExpenseItems(updatedItems);
      setExpenseTypes(updatedItems);
      setSettingsMessage('Expense item deleted successfully');
    } catch (error) {
      setSettingsMessage('Failed to delete expense item');
    }
  };

  const handleFilterChange = (field, value) => {
    setExpenseFilters({ ...expenseFilters, [field]: value });
  };

  const handleExportCSV = async () => {
    try {
      const response = await exportCSV(expenseFilters);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expenses_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to export CSV');
    }
  };

  const getStatusBadge = (status) => {
    const classMap = {
      'Pending': 'status-pending',
      'Approved-Hold': 'status-hold',
      'Approved-Paid': 'status-paid',
      'Declined': 'status-declined'
    };
    return <span className={`status-badge ${classMap[status]}`}>{status}</span>;
  };

  return (
    <div className="dashboard">
      <Header title="Admin Dashboard" />
      
      <div className="dashboard-content">
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
          <button
            className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            All Expenses
          </button>
          <button
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('settings');
              loadApproversAndEmployees();
            }}
          >
            Settings
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="user-management-section">
            <div className="section-header-row">
              <h2>Users</h2>
              <button
                onClick={() => {
                  setShowUserForm(!showUserForm);
                  setEditingUser(null);
                  setUserForm({
                    name: '',
                    password: '',
                    role: 'Employee',
                    location: 'Chennai',
                    optionalField1: '',
                    optionalField2: ''
                  });
                }}
                className="add-user-btn"
              >
                {showUserForm ? 'Cancel' : '+ Add User'}
              </button>
            </div>

            {userMessage && (
              <div className={`message ${userMessage.includes('success') ? 'success' : 'error'}`}>
                {userMessage}
              </div>
            )}

            {showUserForm && (
              <form onSubmit={handleUserSubmit} className="user-form">
                <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={userForm.name}
                      onChange={(e) => handleUserFormChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Password {!editingUser && '*'}</label>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => handleUserFormChange('password', e.target.value)}
                      required={!editingUser}
                      placeholder={editingUser ? 'Leave blank to keep current' : ''}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Role *</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => handleUserFormChange('role', e.target.value)}
                      required
                    >
                      {ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Location *</label>
                    <select
                      value={userForm.location}
                      onChange={(e) => handleUserFormChange('location', e.target.value)}
                      required
                    >
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Optional Field 1</label>
                    <input
                      type="text"
                      value={userForm.optionalField1}
                      onChange={(e) => handleUserFormChange('optionalField1', e.target.value)}
                      placeholder="e.g., Department"
                    />
                  </div>

                  <div className="form-group">
                    <label>Optional Field 2</label>
                    <input
                      type="text"
                      value={userForm.optionalField2}
                      onChange={(e) => handleUserFormChange('optionalField2', e.target.value)}
                      placeholder="e.g., Employee ID"
                    />
                  </div>
                </div>

                <button type="submit" className="submit-btn">
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </form>
            )}

            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Location</th>
                    <th>Field 1</th>
                    <th>Field 2</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td><span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span></td>
                      <td>{user.location}</td>
                      <td>{user.optionalField1 || '-'}</td>
                      <td>{user.optionalField2 || '-'}</td>
                      <td>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className="no-data">No users found</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="expenses-section">
            <div className="section-header-row">
              <h2>All Expenses</h2>
              <button onClick={handleExportCSV} className="export-btn">
                <svg className="export-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export CSV
              </button>
            </div>

            <div className="expense-filters">
              <select
                value={expenseFilters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved-Hold">Approved-Hold</option>
                <option value="Approved-Paid">Approved-Paid</option>
                <option value="Declined">Declined</option>
              </select>

              <input
                type="date"
                value={expenseFilters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                placeholder="Start Date"
              />

              <input
                type="date"
                value={expenseFilters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                placeholder="End Date"
              />
            </div>

            <div className="table-container">
              <table className="expense-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Approver</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(expense => (
                    <tr key={expense.id}>
                      <td>{expense.dateOfSpend}</td>
                      <td>{expense.employeeName}</td>
                      <td>{expense.location}</td>
                      <td>{expense.expenseType}</td>
                      <td>₹{expense.amount}</td>
                      <td>{getStatusBadge(expense.status)}</td>
                      <td>{expense.approverName || '-'}</td>
                      <td>{expense.paymentRemark || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {expenses.length === 0 && (
                <div className="no-data">No expenses found</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && analyticsData && (
          <Analytics
            data={analyticsData}
            selectedLocations={analyticsLocations}
            onLocationChange={setAnalyticsLocations}
            availableLocations={locations}
          />
        )}

        {activeTab === 'settings' && (
          <div className="settings-section">
            <h2>System Settings</h2>

            {settingsMessage && (
              <div className={`message ${settingsMessage.includes('success') ? 'success' : 'error'}`}>
                {settingsMessage}
              </div>
            )}

            {/* Approver Assignments */}
            <div className="settings-card">
              <h3>Approver Assignments</h3>
              <p className="settings-description">
                Assign specific employees to approvers. Only assigned employees' expenses will appear in the approver's dashboard.
              </p>

              <form onSubmit={handleAssignEmployees} className="assignment-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Select Approver *</label>
                    <select
                      value={selectedApprover}
                      onChange={(e) => setSelectedApprover(e.target.value)}
                      required
                    >
                      <option value="">Choose an approver</option>
                      {approvers.map(approver => (
                        <option key={approver.id} value={approver.id}>
                          {approver.name} ({approver.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Select Employees *</label>
                    <div className="multi-select-box">
                      {employees.map(employee => (
                        <label key={employee.id} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(employee.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEmployees([...selectedEmployees, employee.id]);
                              } else {
                                setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id));
                              }
                            }}
                          />
                          <span>{employee.name} ({employee.location})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <button type="submit" className="submit-btn">
                  Assign Employees
                </button>
              </form>

              <div className="assignments-list">
                <h4>Current Assignments</h4>
                {assignments.length === 0 ? (
                  <p className="no-data">No assignments yet</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Approver</th>
                        <th>Employee</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map(assignment => (
                        <tr key={assignment.id}>
                          <td>{assignment.approverName}</td>
                          <td>{employees.find(e => e.id === assignment.employeeId)?.name || 'Unknown'}</td>
                          <td>
                            <button
                              onClick={() => handleDeleteAssignment(assignment.id)}
                              className="delete-btn-small"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Locations Management */}
            <div className="settings-card">
              <h3>Manage Locations</h3>
              <p className="settings-description">
                Add or remove locations used throughout the system.
              </p>

              <form onSubmit={handleAddLocation} className="inline-form">
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Enter new location"
                  className="inline-input"
                />
                <button type="submit" className="submit-btn">
                  Add Location
                </button>
              </form>

              <div className="tags-list">
                {locations.map(location => (
                  <div key={location} className="tag">
                    <span>{location}</span>
                    <button
                      onClick={() => handleDeleteLocation(location)}
                      className="tag-close"
                      title="Delete location"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Items Management */}
            <div className="settings-card">
              <h3>Manage Expense Items</h3>
              <p className="settings-description">
                Add or remove expense types available for employees to select.
              </p>

              <form onSubmit={handleAddExpenseItem} className="inline-form">
                <input
                  type="text"
                  value={newExpenseItem}
                  onChange={(e) => setNewExpenseItem(e.target.value)}
                  placeholder="Enter new expense item"
                  className="inline-input"
                />
                <button type="submit" className="submit-btn">
                  Add Expense Item
                </button>
              </form>

              <div className="tags-list">
                {expenseTypes.map(item => (
                  <div key={item} className="tag">
                    <span>{item}</span>
                    <button
                      onClick={() => handleDeleteExpenseItem(item)}
                      className="tag-close"
                      title="Delete expense item"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
