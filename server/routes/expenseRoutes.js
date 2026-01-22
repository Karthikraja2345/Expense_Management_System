import express from 'express';
import multer from 'multer';
import { db } from '../firebase.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
  },
});

// Submit expense (Employee)
router.post('/', (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 10MB per file.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(500).json({ error: 'File upload failed' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      dateOfSpend,
      location,
      expenseItems,
      convenienceExpenses
    } = req.body;

    const dateOfPost = new Date().toISOString().split('T')[0];
    
    // Parse expense items
    const items = JSON.parse(expenseItems);
    const convItems = convenienceExpenses ? JSON.parse(convenienceExpenses) : [];

    // Process bill images - organize by expense item index
    const billsByIndex = {};
    if (req.files && req.files.length > 0) {
      try {
        console.log(`Processing ${req.files.length} file(s)...`);
        
        for (const file of req.files) {
          // Extract index from field name (e.g., "billImage_0" -> 0)
          const match = file.fieldname.match(/billImage_(\d+)/);
          if (match) {
            const index = parseInt(match[1]);
            console.log(`Uploading bill for expense item ${index}...`);
            
            // Convert buffer to base64
            const b64 = Buffer.from(file.buffer).toString('base64');
            const dataURI = `data:${file.mimetype};base64,${b64}`;
            
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(dataURI, {
              folder: 'expense-bills',
              resource_type: 'auto'
            });
            
            console.log(`✓ Uploaded bill for item ${index}: ${result.secure_url}`);
            billsByIndex[index] = result.secure_url;
          }
        }
        console.log(`✓ All bills uploaded successfully`);
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        // Continue without file upload - images are optional
      }
    }

    // Create expense entries (split for approver view)
    const batch = db.batch();
    const expenseIds = [];

    // Regular expense items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const expenseRef = db.collection('expenses').doc();
      
      // Get bill URL for this specific item (if exists)
      const billImageUrls = billsByIndex[i] ? [billsByIndex[i]] : [];
      console.log(`Item ${i}: ${item.expenseType}, Bill URLs:`, billImageUrls);
      
      batch.set(expenseRef, {
        employeeId,
        employeeName,
        location,
        expenseType: item.expenseType,
        amount: parseInt(item.amount),
        recurringType: item.recurringType,
        status: 'Pending',
        approverName: '',
        approvalDate: '',
        paymentRemark: '',
        declineReason: '',
        billImageUrls,
        dateOfSpend,
        dateOfPost,
        isConvenience: false,
        createdAt: new Date().toISOString()
      });
      expenseIds.push(expenseRef.id);
    }

    // Convenience expense items (travel legs don't have individual bills)
    for (const item of convItems) {
      const expenseRef = db.collection('expenses').doc();
      batch.set(expenseRef, {
        employeeId,
        employeeName,
        location,
        expenseType: 'Travel',
        amount: parseInt(item.amount),
        recurringType: 'One-time',
        status: 'Pending',
        approverName: '',
        approvalDate: '',
        paymentRemark: '',
        declineReason: '',
        billImageUrls: [],
        dateOfSpend,
        dateOfPost,
        isConvenience: true,
        travelDetails: item.description,
        createdAt: new Date().toISOString()
      });
      expenseIds.push(expenseRef.id);
    }

    await batch.commit();

    res.status(201).json({
      message: 'Expenses submitted successfully',
      expenseIds
    });
  } catch (error) {
    console.error('Submit expense error:', error);
    res.status(500).json({ error: 'Failed to submit expenses' });
  }
});

// Get expenses by employee
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const expensesSnapshot = await db.collection('expenses')
      .where('employeeId', '==', employeeId)
      .orderBy('createdAt', 'desc')
      .get();

    const expenses = [];
    expensesSnapshot.forEach(doc => {
      expenses.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(expenses);
  } catch (error) {
    console.error('Get employee expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Get pending expenses (Approver)
router.get('/pending', async (req, res) => {
  try {
    const { locations, approverId } = req.query;
    
    let query = db.collection('expenses').where('status', '==', 'Pending');
    
    if (locations && locations !== 'all') {
      const locationArray = locations.split(',');
      query = query.where('location', 'in', locationArray);
    }
    
    const expensesSnapshot = await query.orderBy('createdAt', 'desc').get();

    let expenses = [];
    expensesSnapshot.forEach(doc => {
      expenses.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Filter by approver assignments if approverId is provided
    if (approverId) {
      const assignmentsSnapshot = await db.collection('approverAssignments')
        .where('approverId', '==', approverId)
        .get();
      
      const assignedEmployeeIds = [];
      assignmentsSnapshot.forEach(doc => {
        assignedEmployeeIds.push(doc.data().employeeId);
      });

      // Only show expenses from assigned employees
      // If no assignments, show empty array (no expenses)
      if (assignedEmployeeIds.length > 0) {
        expenses = expenses.filter(expense => 
          assignedEmployeeIds.includes(expense.employeeId)
        );
      } else {
        // No assignments = no expenses to show
        expenses = [];
      }
    }

    res.json(expenses);
  } catch (error) {
    console.error('Get pending expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch pending expenses' });
  }
});

// Get all expenses (Admin/Approver)
router.get('/', async (req, res) => {
  try {
    const { locations, status, startDate, endDate, category } = req.query;
    
    let query = db.collection('expenses');
    
    // Apply filters
    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }
    
    const expensesSnapshot = await query.get();
    
    let expenses = [];
    expensesSnapshot.forEach(doc => {
      expenses.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Client-side filtering for complex queries
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

    // Sort by date
    expenses.sort((a, b) => new Date(b.dateOfSpend) - new Date(a.dateOfSpend));

    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Approve expense
router.put('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { approverName, paymentRemark, hold, feedback } = req.body;

    const status = hold ? 'Approved-Hold' : 'Approved-Paid';
    const approvalDate = new Date().toISOString().split('T')[0];

    await db.collection('expenses').doc(id).update({
      status,
      approverName,
      approvalDate,
      paymentRemark: paymentRemark || '',
      feedback: feedback || '',
    });

    res.json({ message: 'Expense approved successfully' });
  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(500).json({ error: 'Failed to approve expense' });
  }
});

// Decline expense
router.put('/:id/decline', async (req, res) => {
  try {
    const { id } = req.params;
    const { approverName, declineReason } = req.body;

    if (!declineReason) {
      return res.status(400).json({ error: 'Decline reason is required' });
    }

    const approvalDate = new Date().toISOString().split('T')[0];

    await db.collection('expenses').doc(id).update({
      status: 'Declined',
      approverName,
      approvalDate,
      declineReason,
    });

    res.json({ message: 'Expense declined successfully' });
  } catch (error) {
    console.error('Decline expense error:', error);
    res.status(500).json({ error: 'Failed to decline expense' });
  }
});

export default router;
