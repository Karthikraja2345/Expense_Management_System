import express from 'express';
import { db } from '../firebase.js';

const router = express.Router();

// ============================================
// APPROVER ASSIGNMENTS
// ============================================

// Get all approver assignments
router.get('/approver-assignments', async (req, res) => {
  try {
    const assignmentsSnapshot = await db.collection('approverAssignments').get();
    const assignments = [];
    
    assignmentsSnapshot.forEach(doc => {
      assignments.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(assignments);
  } catch (error) {
    console.error('Get approver assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch approver assignments' });
  }
});

// Assign employees to approver
router.post('/approver-assignments', async (req, res) => {
  try {
    const { approverId, approverName, employeeIds } = req.body;

    if (!approverId || !employeeIds || !Array.isArray(employeeIds)) {
      return res.status(400).json({ error: 'Approver ID and employee IDs are required' });
    }

    // Remove existing assignments for these employees
    const existingAssignments = await db.collection('approverAssignments')
      .where('employeeId', 'in', employeeIds)
      .get();

    const batch = db.batch();
    existingAssignments.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Create new assignments
    employeeIds.forEach(employeeId => {
      const docRef = db.collection('approverAssignments').doc();
      batch.set(docRef, {
        approverId,
        approverName,
        employeeId,
        createdAt: new Date().toISOString()
      });
    });

    await batch.commit();

    res.json({ message: 'Approver assignments created successfully' });
  } catch (error) {
    console.error('Create approver assignment error:', error);
    res.status(500).json({ error: 'Failed to create approver assignments' });
  }
});

// Get assigned employees for an approver (MUST come before /:id route)
router.get('/approver-assignments/approver/:approverId', async (req, res) => {
  try {
    const { approverId } = req.params;
    const assignmentsSnapshot = await db.collection('approverAssignments')
      .where('approverId', '==', approverId)
      .get();

    const employeeIds = [];
    const assignments = [];
    assignmentsSnapshot.forEach(doc => {
      const data = doc.data();
      employeeIds.push(data.employeeId);
      assignments.push({
        id: doc.id,
        ...data
      });
    });

    // Get employee details
    if (employeeIds.length > 0) {
      const usersSnapshot = await db.collection('users')
        .where('__name__', 'in', employeeIds)
        .get();
      
      const employees = [];
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        employees.push({
          id: doc.id,
          name: data.name,
          location: data.location
        });
      });
      
      res.json({ employeeIds, employees, assignments });
    } else {
      res.json({ employeeIds: [], employees: [], assignments: [] });
    }
  } catch (error) {
    console.error('Get assigned employees error:', error);
    res.status(500).json({ error: 'Failed to fetch assigned employees' });
  }
});

// Get assigned approver for an employee (MUST come before /:id route)
router.get('/approver-assignments/employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const assignmentSnapshot = await db.collection('approverAssignments')
      .where('employeeId', '==', employeeId)
      .limit(1)
      .get();

    if (assignmentSnapshot.empty) {
      return res.json({ approver: null });
    }

    const assignmentData = assignmentSnapshot.docs[0].data();
    
    // Get approver details
    const approverDoc = await db.collection('users').doc(assignmentData.approverId).get();
    
    if (!approverDoc.exists) {
      return res.json({ approver: null });
    }

    const approverData = approverDoc.data();
    res.json({ 
      approver: {
        id: assignmentData.approverId,
        name: approverData.name,
        location: approverData.location
      }
    });
  } catch (error) {
    console.error('Get assigned approver error:', error);
    res.status(500).json({ error: 'Failed to fetch assigned approver' });
  }
});

// Delete approver assignment (MUST come AFTER specific routes)
router.delete('/approver-assignments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('approverAssignments').doc(id).delete();
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

// ============================================
// LOCATIONS MANAGEMENT
// ============================================

// Get all locations
router.get('/locations', async (req, res) => {
  try {
    const settingsDoc = await db.collection('settings').doc('locations').get();
    
    if (!settingsDoc.exists) {
      // Return default locations
      const defaultLocations = ['Chennai', 'Salem', 'Madurai', 'Omalur', 'Coimbatore', 'Trichy'];
      return res.json({ locations: defaultLocations });
    }

    res.json({ locations: settingsDoc.data().list || [] });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Update locations
router.put('/locations', async (req, res) => {
  try {
    const { locations } = req.body;

    if (!Array.isArray(locations)) {
      return res.status(400).json({ error: 'Locations must be an array' });
    }

    await db.collection('settings').doc('locations').set({
      list: locations,
      updatedAt: new Date().toISOString()
    });

    res.json({ message: 'Locations updated successfully', locations });
  } catch (error) {
    console.error('Update locations error:', error);
    res.status(500).json({ error: 'Failed to update locations' });
  }
});

// ============================================
// EXPENSE ITEMS MANAGEMENT
// ============================================

// Get all expense items
router.get('/expense-items', async (req, res) => {
  try {
    const settingsDoc = await db.collection('settings').doc('expenseItems').get();
    
    if (!settingsDoc.exists) {
      // Return default expense items with the new ones included
      const defaultItems = [
        'Food',
        'Cable',
        'Travel',
        'Rent',
        'Utilities',
        'Office Supplies',
        'System purchase',
        'Base',
        'Incentive',
        'EPF&ESI',
        'Vendor Charges',
        'Tax',
        'Travel Expenses',
        'Courier expenses',
        'Electricity',
        'Internet and SIM',
        'Wifi',
        'Food expenses',
        'Employee benefits',
        'Latefee',
        'Repairs',
        'Other'
      ];
      return res.json({ expenseItems: defaultItems });
    }

    res.json({ expenseItems: settingsDoc.data().list || [] });
  } catch (error) {
    console.error('Get expense items error:', error);
    res.status(500).json({ error: 'Failed to fetch expense items' });
  }
});

// Update expense items
router.put('/expense-items', async (req, res) => {
  try {
    const { expenseItems } = req.body;

    if (!Array.isArray(expenseItems)) {
      return res.status(400).json({ error: 'Expense items must be an array' });
    }

    await db.collection('settings').doc('expenseItems').set({
      list: expenseItems,
      updatedAt: new Date().toISOString()
    });

    res.json({ message: 'Expense items updated successfully', expenseItems });
  } catch (error) {
    console.error('Update expense items error:', error);
    res.status(500).json({ error: 'Failed to update expense items' });
  }
});

export default router;
