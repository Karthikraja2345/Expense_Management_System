import React, { useState, useEffect, useContext } from 'react';
import Header from '../components/Header';
import Analytics from '../components/Analytics';
import { AuthContext } from '../context/AuthContext';
import { getPendingExpenses, approveExpense, declineExpense, getAnalytics, exportCSV } from '../services/api';
import '../styles/ApproverDashboard.css';

const LOCATIONS = ['Chennai', 'Salem', 'Madurai', 'Omalur', 'Coimbatore', 'Trichy'];

const ApproverDashboard = () => {
  const { user } = useContext(AuthContext);

  // Expense Review State
  const [expenses, setExpenses] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState(LOCATIONS);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [modalExpense, setModalExpense] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [paymentRemark, setPaymentRemark] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLocations, setAnalyticsLocations] = useState(LOCATIONS);

  // Image Modal
  const [imageModal, setImageModal] = useState(null);

  useEffect(() => {
    loadExpenses();
    loadAnalytics();
  }, [selectedLocations]);

  useEffect(() => {
    loadAnalytics();
  }, [analyticsLocations]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const locations = selectedLocations.length > 0 ? selectedLocations.join(',') : 'all';
      const response = await getPendingExpenses(locations);
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
    setDeclineReason('');
  };

  const closeModal = () => {
    setModalExpense(null);
    setModalAction(null);
    setPaymentRemark('');
    setDeclineReason('');
  };

  const handleApprove = async (hold = false) => {
    if (!modalExpense) return;

    setActionLoading(true);
    try {
      await approveExpense(modalExpense.id, {
        approverName: user.name,
        paymentRemark,
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
        <div className="approver-section">
          <div className="section-header-row">
            <h2>Pending Approvals</h2>
            <button onClick={handleExportCSV} className="export-btn">
              📥 Export CSV
            </button>
          </div>

          <div className="location-filters">
            <h3>Filter by Location:</h3>
            <div className="filter-buttons">
              {LOCATIONS.map(location => (
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

        {analyticsData && (
          <Analytics
            data={analyticsData}
            selectedLocations={analyticsLocations}
            onLocationChange={setAnalyticsLocations}
            availableLocations={LOCATIONS}
          />
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
            </div>

            {(modalAction === 'approve-pay' || modalAction === 'approve-hold') && (
              <div className="form-group">
                <label>Payment Remark:</label>
                {modalAction === 'approve-pay' ? (
                  <select
                    value={paymentRemark}
                    onChange={(e) => setPaymentRemark(e.target.value)}
                  >
                    <option value="">Select payment method</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="GPay">GPay</option>
                    <option value="Cash">Cash</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={paymentRemark}
                    onChange={(e) => setPaymentRemark(e.target.value)}
                    placeholder="Payment Pending"
                  />
                )}
              </div>
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
