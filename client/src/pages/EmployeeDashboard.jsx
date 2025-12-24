import React, { useState, useEffect, useContext } from 'react';
import Header from '../components/Header';
import Analytics from '../components/Analytics';
import { AuthContext } from '../context/AuthContext';
import { submitExpense, getEmployeeExpenses, getAnalytics } from '../services/api';
import '../styles/EmployeeDashboard.css';

const LOCATIONS = ['Chennai', 'Salem', 'Madurai', 'Omalur', 'Coimbatore', 'Trichy'];
const EXPENSE_TYPES = ['Food', 'Cable', 'Travel', 'Rent', 'Utilities', 'Office Supplies', 'Other'];
const RECURRING_TYPES = ['Monthly', 'Weekly', 'One-time'];

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  
  // Expense Filing State
  const [dateOfSpend, setDateOfSpend] = useState('');
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [expenseItems, setExpenseItems] = useState([{ expenseType: 'Food', amount: '', recurringType: 'One-time' }]);
  const [convenienceExpenses, setConvenienceExpenses] = useState([]);
  const [billImages, setBillImages] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Expense List State
  const [expenses, setExpenses] = useState([]);
  const [sortField, setSortField] = useState('dateOfSpend');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLocations, setAnalyticsLocations] = useState(LOCATIONS);

  useEffect(() => {
    loadExpenses();
    loadAnalytics();
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [analyticsLocations]);

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
    setExpenseItems([...expenseItems, { expenseType: 'Food', amount: '', recurringType: 'One-time' }]);
  };

  const removeExpenseItem = (index) => {
    setExpenseItems(expenseItems.filter((_, i) => i !== index));
  };

  const updateExpenseItem = (index, field, value) => {
    const updated = [...expenseItems];
    updated[index][field] = value;
    setExpenseItems(updated);
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

  const handleFileChange = (e) => {
    setBillImages(Array.from(e.target.files));
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
      formData.append('expenseItems', JSON.stringify(expenseItems));
      
      if (convenienceExpenses.length > 0) {
        formData.append('convenienceExpenses', JSON.stringify(convenienceExpenses));
      }

      billImages.forEach(file => {
        formData.append('billImages', file);
      });

      await submitExpense(formData);
      
      setSubmitMessage('Expenses submitted successfully!');
      
      // Reset form
      setDateOfSpend('');
      setSelectedLocations([]);
      setExpenseItems([{ expenseType: 'Food', amount: '', recurringType: 'One-time' }]);
      setConvenienceExpenses([]);
      setBillImages([]);
      
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
                {LOCATIONS.map(location => (
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
                <div key={index} className="expense-item">
                  <select
                    value={item.expenseType}
                    onChange={(e) => updateExpenseItem(index, 'expenseType', e.target.value)}
                    required
                  >
                    {EXPENSE_TYPES.map(type => (
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

                  {expenseItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExpenseItem(index)}
                      className="remove-btn"
                    >
                      ✕
                    </button>
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

            <div className="form-group">
              <label>Upload Bill Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
              />
              {billImages.length > 0 && (
                <div className="file-info">{billImages.length} file(s) selected</div>
              )}
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
            availableLocations={LOCATIONS}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
