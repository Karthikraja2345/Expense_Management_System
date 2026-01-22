import React, { useState, useEffect, useContext } from 'react';
import Header from '../components/Header';
import Analytics from '../components/Analytics';
import { AuthContext } from '../context/AuthContext';
import { getPendingExpenses, approveExpense, declineExpense, getAnalytics, exportCSV, getLocations, getAssignedEmployees } from '../services/api';
import '../styles/ApproverDashboard.css';

const ApproverDashboard = () => {
  const { user } = useContext(AuthContext);

  // Dynamic Settings
  const [availableLocations, setAvailableLocations] = useState([]);

  // Active Tab
  const [activeTab, setActiveTab] = useState('approvals');

  // Assigned Employees State
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);

  // Expense Review State
  const [expenses, setExpenses] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [modalExpense, setModalExpense] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [paymentRemark, setPaymentRemark] = useState('');
  const [feedback, setFeedback] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLocations, setAnalyticsLocations] = useState([]);

  // Image Modal
  const [imageModal, setImageModal] = useState(null);

  useEffect(() => {
    loadSettings();
    loadAssignedEmployees();
  }, []);

  useEffect(() => {
    if (availableLocations.length > 0) {
      loadExpenses();
      loadAnalytics();
    }
  }, [selectedLocations, availableLocations]);

  useEffect(() => {
    if (availableLocations.length > 0) {
      loadAnalytics();
    }
  }, [analyticsLocations, availableLocations]);

  const loadSettings = async () => {
    try {
      const locationsRes = await getLocations();
      setAvailableLocations(locationsRes.data.locations);
      setSelectedLocations(locationsRes.data.locations);
      setAnalyticsLocations(locationsRes.data.locations);
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Fallback to default values
      const defaultLocations = ['Chennai', 'Salem', 'Madurai', 'Omalur', 'Coimbatore', 'Trichy'];
      setAvailableLocations(defaultLocations);
      setSelectedLocations(defaultLocations);
      setAnalyticsLocations(defaultLocations);
    }
  };

  const loadAssignedEmployees = async () => {
    setAssignmentsLoading(true);
    try {
      const response = await getAssignedEmployees(user.id);
      setAssignedEmployees(response.data.employees || []);
    } catch (error) {
      console.error('Failed to load assigned employees:', error);
      setAssignedEmployees([]);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const locations = selectedLocations.length > 0 ? selectedLocations.join(',') : 'all';
      const response = await getPendingExpenses(locations, user.id);
      console.log('Loaded expenses:', response.data);
      response.data.forEach((exp, idx) => {
        console.log(`Expense ${idx}: ${exp.expenseType}, Bills:`, exp.billImageUrls);
      });
      setExpenses(response.data);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setLoading(false);
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

  const openModal = (expense, action) => {
    setModalExpense(expense);
    setModalAction(action);
    setPaymentRemark('');
    setFeedback('');
    setDeclineReason('');
  };

  const closeModal = () => {
    setModalExpense(null);
    setModalAction(null);
    setPaymentRemark('');
    setFeedback('');
    setDeclineReason('');
  };

  const handleApprove = async (hold = false) => {
    if (!modalExpense) return;

    setActionLoading(true);
    try {
      await approveExpense(modalExpense.id, {
        approverName: user.name,
        paymentRemark,
        feedback,
        hold
      });

      closeModal();
      loadExpenses();
      loadAnalytics();
    } catch (error) {
      alert('Failed to approve expense');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!modalExpense || !declineReason.trim()) {
      alert('Please provide a decline reason');
      return;
    }

    setActionLoading(true);
    try {
      await declineExpense(modalExpense.id, {
        approverName: user.name,
        declineReason
      });

      closeModal();
      loadExpenses();
      loadAnalytics();
    } catch (error) {
      alert('Failed to decline expense');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const locations = selectedLocations.length > 0 ? selectedLocations.join(',') : 'all';
      const response = await exportCSV({ locations });
      
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

  return (
    <div className="dashboard">
      <Header title="Approver Dashboard" />
      
      <div className="dashboard-content">
        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'approvals' ? 'active' : ''}`}
            onClick={() => setActiveTab('approvals')}
          >
            Pending Approvals
          </button>
          <button
            className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            My Assigned Employees
          </button>
          <button
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>

        {/* Pending Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="approver-section">
            <div className="section-header-row">
              <h2>Pending Approvals</h2>
              <button onClick={handleExportCSV} className="export-btn">
                <svg className="export-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export CSV
              </button>
            </div>

            <div className="location-filters">
            <h3>Filter by Location:</h3>
            <div className="filter-buttons">
              {availableLocations.map(location => (
                <button
                  key={location}
                  className={`filter-btn ${selectedLocations.includes(location) ? 'active' : ''}`}
                  onClick={() => handleLocationToggle(location)}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading expenses...</div>
          ) : (
            <div className="expense-cards">
              {expenses.map(expense => (
                <div key={expense.id} className="expense-card">
                  <div className="card-header">
                    <h3>{expense.employeeName}</h3>
                    <span className="expense-amount">₹{expense.amount}</span>
                  </div>
                  
                  <div className="card-body">
                    <div className="card-row">
                      <span className="label">Location:</span>
                      <span className="value">{expense.location}</span>
                    </div>
                    <div className="card-row">
                      <span className="label">Expense Type:</span>
                      <span className="value">{expense.expenseType}</span>
                    </div>
                    <div className="card-row">
                      <span className="label">Date of Spend:</span>
                      <span className="value">{expense.dateOfSpend}</span>
                    </div>
                    <div className="card-row">
                      <span className="label">Submitted:</span>
                      <span className="value">{expense.dateOfPost}</span>
                    </div>
                    {expense.isConvenience && expense.travelDetails && (
                      <div className="card-row">
                        <span className="label">Travel:</span>
                        <span className="value">{expense.travelDetails}</span>
                      </div>
                    )}
                    
                    {expense.billImageUrls && expense.billImageUrls.length > 0 && (
                      <div className="bill-images">
                        <span className="label">Bill Images:</span>
                        <div className="image-thumbnails">
                          {expense.billImageUrls.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt="Bill"
                              className="thumbnail"
                              onClick={() => setImageModal(url)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="card-actions">
                    <button
                      onClick={() => openModal(expense, 'approve-pay')}
                      className="action-btn approve-btn"
                    >
                      ✓ Approve & Pay
                    </button>
                    <button
                      onClick={() => openModal(expense, 'approve-hold')}
                      className="action-btn hold-btn"
                    >
                      ⏸ Approve & Hold
                    </button>
                    <button
                      onClick={() => openModal(expense, 'decline')}
                      className="action-btn decline-btn"
                    >
                      ✕ Decline
                    </button>
                  </div>
                </div>
              ))}

              {expenses.length === 0 && (
                <div className="no-data">No pending expenses</div>
              )}
            </div>
          )}
        </div>
        )}

        {/* Assigned Employees Tab */}
        {activeTab === 'assignments' && (
          <div className="approver-section">
            <h2>My Assigned Employees</h2>
            {assignmentsLoading ? (
              <div className="loading">Loading assignments...</div>
            ) : assignedEmployees.length > 0 ? (
              <div className="assignments-grid">
                {assignedEmployees.map(employee => (
                  <div key={employee.id} className="employee-card">
                    <svg className="employee-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <h3>{employee.name}</h3>
                    <p className="employee-location">
                      <svg className="location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {employee.location}
                    </p>
                    <p className="employee-id">ID: {employee.id}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No employees have been assigned to you yet.</p>
                <p>Contact your administrator to assign employees to your approval queue.</p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analyticsData && (
          <Analytics
            data={analyticsData}
            selectedLocations={analyticsLocations}
            onLocationChange={setAnalyticsLocations}
            availableLocations={availableLocations}
          />
        )}

        {activeTab === 'analytics' && !analyticsData && (
          <div className="loading">Loading analytics...</div>
        )}
      </div>

      {/* Action Modal */}
      {modalExpense && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>
              {modalAction === 'approve-pay' && 'Approve & Pay'}
              {modalAction === 'approve-hold' && 'Approve & Hold'}
              {modalAction === 'decline' && 'Decline Expense'}
            </h2>

            <div className="modal-info">
              <p><strong>Employee:</strong> {modalExpense.employeeName}</p>
              <p><strong>Amount:</strong> ₹{modalExpense.amount}</p>
              <p><strong>Type:</strong> {modalExpense.expenseType}</p>
              <p><strong>Location:</strong> {modalExpense.location}</p>
              <p><strong>Date of Spend:</strong> {modalExpense.dateOfSpend}</p>
              
              {modalExpense.billImageUrls && modalExpense.billImageUrls.length > 0 && (
                <div className="modal-bill-images">
                  <strong>Bill Images:</strong>
                  <div className="modal-image-thumbnails">
                    {modalExpense.billImageUrls.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt="Bill"
                        className="modal-thumbnail"
                        onClick={() => setImageModal(url)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {(modalAction === 'approve-pay' || modalAction === 'approve-hold') && (
              <>
                <div className="form-group">
                  <label>Payment Method: *</label>
                  {modalAction === 'approve-pay' ? (
                    <div className="payment-buttons">
                      <button
                        type="button"
                        className={`payment-btn ${paymentRemark === 'Bank Transfer' ? 'selected' : ''}`}
                        onClick={() => setPaymentRemark('Bank Transfer')}
                      >
                        Bank Transfer
                      </button>
                      <button
                        type="button"
                        className={`payment-btn ${paymentRemark === 'GPay' ? 'selected' : ''}`}
                        onClick={() => setPaymentRemark('GPay')}
                      >
                        GPay
                      </button>
                      <button
                        type="button"
                        className={`payment-btn ${paymentRemark === 'Paytm' ? 'selected' : ''}`}
                        onClick={() => setPaymentRemark('Paytm')}
                      >
                        Paytm
                      </button>
                      <button
                        type="button"
                        className={`payment-btn ${paymentRemark === 'PhonePe' ? 'selected' : ''}`}
                        onClick={() => setPaymentRemark('PhonePe')}
                      >
                        PhonePe
                      </button>
                      <button
                        type="button"
                        className={`payment-btn ${paymentRemark === 'Cash' ? 'selected' : ''}`}
                        onClick={() => setPaymentRemark('Cash')}
                      >
                        Cash
                      </button>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={paymentRemark}
                      onChange={(e) => setPaymentRemark(e.target.value)}
                      placeholder="Payment Pending"
                    />
                  )}
                </div>
                <div className="form-group">
                  <label>Feedback/Comments:</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Add any feedback or comments (optional)"
                    rows="3"
                  />
                </div>
              </>
            )}

            {modalAction === 'decline' && (
              <div className="form-group">
                <label>Decline Reason: *</label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Please provide a reason for declining"
                  rows="4"
                  required
                />
              </div>
            )}

            <div className="modal-actions">
              {modalAction === 'approve-pay' && (
                <button
                  onClick={() => handleApprove(false)}
                  disabled={actionLoading}
                  className="confirm-btn"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Approve & Pay'}
                </button>
              )}
              {modalAction === 'approve-hold' && (
                <button
                  onClick={() => handleApprove(true)}
                  disabled={actionLoading}
                  className="confirm-btn"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Approve & Hold'}
                </button>
              )}
              {modalAction === 'decline' && (
                <button
                  onClick={handleDecline}
                  disabled={actionLoading}
                  className="confirm-btn decline"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Decline'}
                </button>
              )}
              <button onClick={closeModal} className="cancel-btn" disabled={actionLoading}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {imageModal && (
        <div className="modal-overlay" onClick={() => setImageModal(null)}>
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setImageModal(null)}>✕</button>
            <img src={imageModal} alt="Bill" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproverDashboard;
