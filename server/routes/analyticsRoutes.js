import express from 'express';
import { db } from '../firebase.js';

const router = express.Router();

// Get analytics data
router.get('/', async (req, res) => {
  try {
    const { locations, startDate, endDate, category } = req.query;
    
    let query = db.collection('expenses');
    
    const expensesSnapshot = await query.get();
    
    let expenses = [];
    expensesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'Approved-Paid' || data.status === 'Approved-Hold') {
        expenses.push(data);
      }
    });

    // Apply filters
    if (locations && locations !== 'all') {
      const locationArray = locations.split(',');
      expenses = expenses.filter(e => locationArray.includes(e.location));
    }

    if (startDate) {
      expenses = expenses.filter(e => e.dateOfSpend >= startDate);
    }

    if (endDate) {
      expenses = expenses.filter(e => e.dateOfSpend <= endDate);
    }

    if (category && category !== 'all') {
      expenses = expenses.filter(e => e.expenseType === category);
    }

    // Calculate analytics
    const locationWise = {};
    const categoryWise = {};
    const monthlyData = {};
    const monthlyLocationData = {}; // New: Monthly data by location
    let totalAmount = 0;

    expenses.forEach(expense => {
      const amount = expense.amount;
      totalAmount += amount;

      // Location-wise
      if (!locationWise[expense.location]) {
        locationWise[expense.location] = 0;
      }
      locationWise[expense.location] += amount;

      // Category-wise
      if (!categoryWise[expense.expenseType]) {
        categoryWise[expense.expenseType] = 0;
      }
      categoryWise[expense.expenseType] += amount;

      // Monthly data
      const month = expense.dateOfSpend.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = {};
      }
      if (!monthlyData[month][expense.expenseType]) {
        monthlyData[month][expense.expenseType] = 0;
      }
      monthlyData[month][expense.expenseType] += amount;

      // Monthly location data for area chart
      if (!monthlyLocationData[month]) {
        monthlyLocationData[month] = {};
      }
      if (!monthlyLocationData[month][expense.location]) {
        monthlyLocationData[month][expense.location] = 0;
      }
      monthlyLocationData[month][expense.location] += amount;
    });

    res.json({
      totalAmount,
      locationWise,
      categoryWise,
      monthlyData,
      monthlyLocationData,
      expenseCount: expenses.length
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Export to CSV
router.get('/export', async (req, res) => {
  try {
    const { locations, startDate, endDate, category, status } = req.query;
    
    let query = db.collection('expenses');
    const expensesSnapshot = await query.get();
    
    let expenses = [];
    expensesSnapshot.forEach(doc => {
      expenses.push(doc.data());
    });

    // Apply filters
    if (locations && locations !== 'all') {
      const locationArray = locations.split(',');
      expenses = expenses.filter(e => locationArray.includes(e.location));
    }

    if (status && status !== 'all') {
      expenses = expenses.filter(e => e.status === status);
    }

    if (startDate) {
      expenses = expenses.filter(e => e.dateOfSpend >= startDate);
    }

    if (endDate) {
      expenses = expenses.filter(e => e.dateOfSpend <= endDate);
    }

    if (category && category !== 'all') {
      expenses = expenses.filter(e => e.expenseType === category);
    }

    // Create CSV
    const headers = [
      'Date of Spend',
      'Date of Post',
      'Employee Name',
      'Location',
      'Expense Type',
      'Amount',
      'Recurring Type',
      'Status',
      'Approver',
      'Approval Date',
      'Payment Remark',
      'Decline Reason'
    ];

    const csvRows = [headers.join(',')];

    expenses.forEach(expense => {
      const row = [
        expense.dateOfSpend,
        expense.dateOfPost,
        expense.employeeName,
        expense.location,
        expense.expenseType,
        expense.amount,
        expense.recurringType,
        expense.status,
        expense.approverName || '',
        expense.approvalDate || '',
        expense.paymentRemark || '',
        expense.declineReason || ''
      ];
      csvRows.push(row.map(field => `"${field}"`).join(','));
    });

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="expenses_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

export default router;
