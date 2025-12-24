import express from 'express';
import { db } from '../firebase.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        id: doc.id,
        name: data.name,
        role: data.role,
        location: data.location,
        optionalField1: data.optionalField1 || '',
        optionalField2: data.optionalField2 || ''
      });
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { name, password, role, location, optionalField1, optionalField2 } = req.body;

    if (!name || !password || !role || !location) {
      return res.status(400).json({ error: 'Name, password, role, and location are required' });
    }

    // Check if user with same name exists
    const existingUser = await db.collection('users')
      .where('name', '==', name)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      return res.status(400).json({ error: 'User with this name already exists' });
    }

    // Create user in Firestore
    const userRef = await db.collection('users').add({
      name,
      password, // In production, hash this with bcrypt
      role,
      location,
      optionalField1: optionalField1 || '',
      optionalField2: optionalField2 || '',
      createdAt: new Date().toISOString().split('T')[0]
    });

    res.status(201).json({
      id: userRef.id,
      name,
      role,
      location,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, password, role, location, optionalField1, optionalField2 } = req.body;

    const updateData = {
      name,
      role,
      location,
      optionalField1: optionalField1 || '',
      optionalField2: optionalField2 || ''
    };

    if (password) {
      updateData.password = password; // Hash in production
    }

    await db.collection('users').doc(id).update(updateData);

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('users').doc(id).delete();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get users by role (Approvers)
router.get('/role/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const usersSnapshot = await db.collection('users')
      .where('role', '==', role)
      .get();

    const users = [];
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        id: doc.id,
        name: data.name,
        location: data.location
      });
    });

    res.json(users);
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
