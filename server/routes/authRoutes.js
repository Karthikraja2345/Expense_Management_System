import express from 'express';
import { db, auth } from '../firebase.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password are required' });
    }

    // Get user by name from Firestore
    const usersSnapshot = await db.collection('users')
      .where('name', '==', name)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    // In production, you should use proper password hashing (bcrypt)
    // For now, direct comparison (NOT SECURE - USE BCRYPT IN PRODUCTION)
    if (userData.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create custom token for Firebase Authentication
    const customToken = await auth.createCustomToken(userDoc.id);

    res.json({
      token: customToken,
      user: {
        id: userDoc.id,
        name: userData.name,
        role: userData.role,
        location: userData.location,
        optionalField1: userData.optionalField1 || '',
        optionalField2: userData.optionalField2 || ''
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const decodedToken = await auth.verifyIdToken(token);
    
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    
    res.json({
      user: {
        id: userDoc.id,
        name: userData.name,
        role: userData.role,
        location: userData.location,
        optionalField1: userData.optionalField1 || '',
        optionalField2: userData.optionalField2 || ''
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
