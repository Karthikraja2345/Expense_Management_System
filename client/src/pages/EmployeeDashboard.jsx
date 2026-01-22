import React, { useState, useEffect, useContext } from 'react';
import Header from '../components/Header';
import Analytics from '../components/Analytics';
import { AuthContext } from '../context/AuthContext';
import { submitExpense, getEmployeeExpenses, getAnalytics, getLocations, getExpenseItems, getAssignedApprover } from '../services/api';
import '../styles/EmployeeDashboard.css';

const RECURRING_TYPES = ['Monthly', 'Weekly', 'One-time'];

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  
  // Dynamic Settings
  const [locations, setLocations] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [assignedApprover, setAssignedApprover] = useState(null);
  
  // Expense Filing State
  const [dateOfSpend, setDateOfSpend] = useState('');
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [expenseItems, setExpenseItems] = useState([{ expenseType: '', amount: '', recurringType: 'One-time', billFile: null }]);
  const [convenienceExpenses, setConvenienceExpenses] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Expense List State
  const [expenses, setExpenses] = useState([]);
  const [sortField, setSortField] = useState('dateOfSpend');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLocations, setAnalyticsLocations] = useState([]);

  useEffect(() => {
    loadSettings();
    loadExpenses();
    loadAnalytics();
    loadAssignedApprover();
  }, []);

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
      // Set first expense type if available
      if (expenseItemsRes.data.expenseItems.length > 0) {
        setExpenseItems([{ 
          expenseType: expenseItemsRes.data.expenseItems[0], 
          amount: '', 
          recurringType: 'One-time',
          billFile: null
        }]);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Fallback to default values
      setLocations(['Chennai', 'Salem', 'Madurai', 'Omalur', 'Coimbatore', 'Trichy']);
      setExpenseTypes(['Food', 'Cable', 'Travel', 'Rent', 'Utilities', 'Office Supplies', 'Other']);
    }
  };

  const loadAssignedApprover = async () => {
    try {
      const response = await getAssignedApprover(user.id);
      setAssignedApprover(response.data.approver);
    } catch (error) {
      console.error('Failed to load assigned approver:', error);
    }
  };

  const loadExpenses = async () => {
    try {
      const response = await getEmployeeExpenses(user.id);
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

  const handleLocationToggle = (location) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter(l => l !== location));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  const addExpenseItem = () => {
    setExpenseItems([...expenseItems, { 
      expenseType: expenseTypes[0] || '', 
      amount: '', 
      recurringType: 'One-time',
      billFile: null
    }]);
  };

  const removeExpenseItem = (index) => {
    setExpenseItems(expenseItems.filter((_, i) => i !== index));
  };

  const updateExpenseItem = (index, field, value) => {
    const updated = [...expenseItems];
    updated[index][field] = value;
    setExpenseItems(updated);
  };

  const updateExpenseItemFile = (index, file) => {
    if (file && file.size > 10 * 1024 * 1024) {
      setSubmitMessage('File too large. Maximum size is 10MB per file.');
      setTimeout(() => setSubmitMessage(''), 3000);
      return;
    }
    const updated = [...expenseItems];
    updated[index].billFile = file;
    setExpenseItems(updated);
    console.log(`File selected for item ${index}:`, file ? file.name : 'none');
  };

  const addConvenienceExpense = () => {
    setConvenienceExpenses([...convenienceExpenses, { description: '', amount: '' }]);
  };

  const removeConvenienceExpense = (index) => {
    setConvenienceExpenses(convenienceExpenses.filter((_, i) => i !== index));
  };

  const updateConvenienceExpense = (index, field, value) => {
    const updated = [...convenienceExpenses];
    updated[index][field] = value;
    setConvenienceExpenses(updated);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedLocations.length === 0) {
      setSubmitMessage('Please select at least one location');
      return;
    }

    if (expenseItems.length === 0) {
      setSubmitMessage('Please add at least one expense item');
      return;
    }

    setSubmitLoading(true);
    setSubmitMessage('');

    try {
      const formData = new FormData();
      formData.append('employeeId', user.id);
      formData.append('employeeName', user.name);
      formData.append('dateOfSpend', dateOfSpend);
      formData.append('location', selectedLocations.join(', '));
      
      // Send expense items without billFile property
      const itemsForSubmit = expenseItems.map(({ billFile, ...rest }) => rest);
      formData.append('expenseItems', JSON.stringify(itemsForSubmit));
      
      // Append bill files with index reference
      expenseItems.forEach((item, index) => {
        if (item.billFile) {
          console.log(`Appending bill for item ${index}:`, item.billFile.name);
          formData.append(`billImage_${index}`, item.billFile);
        }
      });
      
      console.log('Total files to upload:', expenseItems.filter(item => item.billFile).length);
      
      if (convenienceExpenses.length > 0) {
        formData.append('convenienceExpenses', JSON.stringify(convenienceExpenses));
      }

      await submitExpense(formData);
      
      setSubmitMessage('Expenses submitted successfully!');
      
      // Reset form
      setDateOfSpend('');
      setSelectedLocations([]);
      setExpenseItems([{ 
        expenseType: expenseTypes[0] || '', 
        amount: '', 
        recurringType: 'One-time',
        billFile: null
      }]);
      setConvenienceExpenses([]);
      
      // Reload expenses
      loadExpenses();
      loadAnalytics();
    } catch (error) {
      setSubmitMessage(error.response?.data?.error || 'Failed to submit expenses');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortedExpenses = () => {
    let filtered = expenses;
    
    if (filterStatus !== 'all') {
      filtered = expenses.filter(e => e.status === filterStatus);
    }

    return filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'amount') {
        aVal = parseInt(aVal);
        bVal = parseInt(bVal);
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
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
      <Header title="Employee Dashboard" />
      
      <div className="dashboard-content">
        {/* Assigned Approver Info */}
        {assignedApprover && (
          <div className="approver-info-banner">
            <svg className="info-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <div className="info-content">
              <strong>Your Assigned Approver:</strong> {assignedApprover.name}
              <span className="approver-location">
                <svg className="location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {assignedApprover.location}
              </span>
            </div>
          </div>
        )}
        {!assignedApprover && (
          <div className="approver-info-banner warning">
            <svg className="info-icon-svg warning" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div className="info-content">
              <strong>No Approver Assigned:</strong> Please contact your administrator to assign an approver for your expenses.
            </div>
          </div>
        )}

        <div className="expense-filing-section">
          <h2>File New Expense</h2>
          
          <form onSubmit={handleSubmit} className="expense-form">
            <div className="form-row">
              <div className="form-group">
                <label>Date of Spend *</label>
                <input
                  type="date"
                  value={dateOfSpend}
                  onChange={(e) => setDateOfSpend(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Date of Post</label>
                <input
                  type="date"
                  value={new Date().toISOString().split('T')[0]}
                  disabled
                />
              </div>
            </div>

            <div className="form-group">
              <label>Location (Multi-select) *</label>
              <div className="location-select">
                {locations.map(location => (
                  <button
                    key={location}
                    type="button"
                    className={`location-btn ${selectedLocations.includes(location) ? 'selected' : ''}`}
                    onClick={() => handleLocationToggle(location)}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>

            <div className="expense-items-section">
              <div className="section-header">
                <h3>Expense Items</h3>
                <button type="button" onClick={addExpenseItem} className="add-btn">
                  + Add Item
                </button>
              </div>

              {expenseItems.map((item, index) => (
                <div key={index} className="expense-item-with-bill">
                  <div className="expense-item">
                    <select
                      value={item.expenseType}
                      onChange={(e) => updateExpenseItem(index, 'expenseType', e.target.value)}
                      required
                    >
                      <option value="">Select Type</option>
                      {expenseTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Amount"
                      value={item.amount}
                      onChange={(e) => updateExpenseItem(index, 'amount', e.target.value)}
                      required
                      min="1"
                      step="1"
                    />

                    <select
                      value={item.recurringType}
                      onChange={(e) => updateExpenseItem(index, 'recurringType', e.target.value)}
                      required
                    >
                      {RECURRING_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>

                    <div className="item-actions">
                      <label className="upload-bill-btn" title="Upload Bill">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => updateExpenseItemFile(index, e.target.files[0])}
                          style={{ display: 'none' }}
                        />
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        {item.billFile && <span className="file-indicator">✓</span>}
                      </label>

                      {expenseItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExpenseItem(index)}
                          className="remove-btn"
                          title="Remove Item"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  {item.billFile && (
                    <div className="bill-file-name">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                        <polyline points="13 2 13 9 20 9"/>
                      </svg>
                      {item.billFile.name}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="convenience-section">
              <div className="section-header">
                <h3>Convenience Expense (Travel Legs)</h3>
                <button type="button" onClick={addConvenienceExpense} className="add-btn">
                  + Add Travel Leg
                </button>
              </div>

              {convenienceExpenses.map((item, index) => (
                <div key={index} className="convenience-item">
                  <input
                    type="text"
                    placeholder="e.g., Office → Client"
                    value={item.description}
                    onChange={(e) => updateConvenienceExpense(index, 'description', e.target.value)}
                    required
                  />

                  <input
                    type="number"
                    placeholder="Amount"
                    value={item.amount}
                    onChange={(e) => updateConvenienceExpense(index, 'amount', e.target.value)}
                    required
                    min="1"
                    step="1"
                  />

                  <button
                    type="button"
                    onClick={() => removeConvenienceExpense(index)}
                    className="remove-btn"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>



            {submitMessage && (
              <div className={`message ${submitMessage.includes('success') ? 'success' : 'error'}`}>
                {submitMessage}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={submitLoading}>
              {submitLoading ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </form>
        </div>

        <div className="expense-list-section">
          <h2>My Expenses</h2>
          
          <div className="filter-bar">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved-Hold">Approved-Hold</option>
              <option value="Approved-Paid">Approved-Paid</option>
              <option value="Declined">Declined</option>
            </select>
          </div>

          <div className="table-container">
            <table className="expense-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('dateOfSpend')}>
                    Date {sortField === 'dateOfSpend' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Location</th>
                  <th>Type</th>
                  <th onClick={() => handleSort('amount')}>
                    Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('status')}>
                    Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Approver</th>
                  <th>Approval Date</th>
                  <th>Decline Reason</th>
                </tr>
              </thead>
              <tbody>
                {getSortedExpenses().map(expense => (
                  <tr key={expense.id}>
                    <td>{expense.dateOfSpend}</td>
                    <td>{expense.location}</td>
                    <td>{expense.expenseType}</td>
                    <td>₹{expense.amount}</td>
                    <td>{getStatusBadge(expense.status)}</td>
                    <td>{expense.approverName || '-'}</td>
                    <td>{expense.approvalDate || '-'}</td>
                    <td>{expense.declineReason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {getSortedExpenses().length === 0 && (
              <div className="no-data">No expenses found</div>
            )}
          </div>
        </div>

        {analyticsData && (
          <Analytics
            data={analyticsData}
            selectedLocations={analyticsLocations}
            onLocationChange={setAnalyticsLocations}
            availableLocations={locations}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
