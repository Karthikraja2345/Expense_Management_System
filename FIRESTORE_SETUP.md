# Firestore Database Setup Guide

## Collections Structure

### 1. `users` Collection

Each document represents a user in the system.

**Document ID**: Auto-generated or custom user ID
**Fields**:
```javascript
{
  uid: "string",           // Firebase Auth UID
  email: "string",         // User email
  name: "string",          // Full name
  role: "string",          // "Employee", "Approver", or "Admin"
  department: "string",    // User's department
  createdAt: timestamp,    // Account creation date
  updatedAt: timestamp     // Last update date
}
```

**Sample Data**:
```javascript
// Admin User
{
  uid: "admin123",
  email: "admin@company.com",
  name: "Admin User",
  role: "Admin",
  department: "IT",
  createdAt: new Date(),
  updatedAt: new Date()
}

// Approver User
{
  uid: "approver123",
  email: "approver@company.com",
  name: "John Approver",
  role: "Approver",
  department: "Finance",
  createdAt: new Date(),
  updatedAt: new Date()
}

// Employee User
{
  uid: "employee123",
  email: "employee@company.com",
  name: "Jane Employee",
  role: "Employee",
  department: "Sales",
  createdAt: new Date(),
  updatedAt: new Date()
}
```

---

### 2. `expenses` Collection

Each document represents an expense report.

**Document ID**: Auto-generated
**Fields**:
```javascript
{
  employeeId: "string",           // User UID who filed the expense
  employeeName: "string",         // Employee name
  employeeEmail: "string",        // Employee email
  department: "string",           // Employee department
  
  // Expense Items
  items: [
    {
      category: "string",         // "Travel", "Food", "Accommodation", etc.
      description: "string",      // Item description
      amount: number,             // Item amount
      date: "string"              // Date in YYYY-MM-DD format
    }
  ],
  
  // Location & Travel
  locations: ["string"],          // Array of locations
  convenienceExpenses: [          // Travel legs (optional)
    {
      from: "string",
      to: "string",
      date: "string",
      amount: number,
      mode: "string"              // "Flight", "Train", "Bus", "Taxi", "Car"
    }
  ],
  
  // Bill Attachment
  billUrl: "string",              // Firebase Storage URL (optional)
  billFileName: "string",         // Original file name
  
  // Status & Approval
  status: "string",               // "Pending", "Approved", "On Hold", "Declined"
  totalAmount: number,            // Sum of all items + convenience expenses
  
  approvedBy: "string",           // Approver UID (if approved)
  approverName: "string",         // Approver name (if approved)
  approverComments: "string",     // Approval/decline comments
  approvedAt: timestamp,          // Approval date
  
  // Timestamps
  createdAt: timestamp,           // Submission date
  updatedAt: timestamp            // Last update date
}
```

**Sample Data**:
```javascript
{
  employeeId: "employee123",
  employeeName: "Jane Employee",
  employeeEmail: "employee@company.com",
  department: "Sales",
  
  items: [
    {
      category: "Travel",
      description: "Flight to NYC for client meeting",
      amount: 350,
      date: "2024-01-15"
    },
    {
      category: "Accommodation",
      description: "Hotel stay - 2 nights",
      amount: 240,
      date: "2024-01-15"
    },
    {
      category: "Food",
      description: "Client dinner",
      amount: 85,
      date: "2024-01-16"
    }
  ],
  
  locations: ["New York", "Boston"],
  
  convenienceExpenses: [
    {
      from: "New York",
      to: "Boston",
      date: "2024-01-17",
      amount: 45,
      mode: "Train"
    }
  ],
  
  billUrl: "https://firebasestorage.googleapis.com/...",
  billFileName: "receipts-jan-2024.pdf",
  
  status: "Pending",
  totalAmount: 720,
  
  createdAt: new Date("2024-01-18"),
  updatedAt: new Date("2024-01-18")
}
```

---

## Setup Steps in Firebase Console

### Step 1: Create Collections
1. Go to Firebase Console → Firestore Database
2. Click "Start collection"
3. Create `users` collection
4. Create `expenses` collection

### Step 2: Add Initial Admin User
1. Go to Authentication → Users
2. Add a new user with email/password
3. Copy the UID
4. Go to Firestore → `users` collection
5. Add document with the copied UID:
```javascript
{
  uid: "<COPIED_UID>",
  email: "admin@company.com",
  name: "System Admin",
  role: "Admin",
  department: "IT",
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}
```

### Step 3: Create Indexes (Optional but Recommended)
For better query performance:
- Collection: `expenses`
- Fields: `status` (Ascending), `createdAt` (Descending)
- Fields: `employeeId` (Ascending), `createdAt` (Descending)

### Step 4: Set up Storage Rules
Go to Storage → Rules:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /bills/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*|application/pdf');
    }
  }
}
```

---

## Quick Test Data Script

Run this in Firebase Console (Firestore Rules Playground or via SDK):

```javascript
// Add test users
const users = [
  {
    uid: "admin001",
    email: "admin@test.com",
    name: "Admin User",
    role: "Admin",
    department: "Management"
  },
  {
    uid: "approver001",
    email: "approver@test.com",
    name: "Approver User",
    role: "Approver",
    department: "Finance"
  },
  {
    uid: "employee001",
    email: "employee@test.com",
    name: "Employee User",
    role: "Employee",
    department: "Sales"
  }
];

// Add test expense
const expense = {
  employeeId: "employee001",
  employeeName: "Employee User",
  employeeEmail: "employee@test.com",
  department: "Sales",
  items: [
    {
      category: "Travel",
      description: "Business trip",
      amount: 200,
      date: "2024-01-20"
    }
  ],
  locations: ["Delhi"],
  convenienceExpenses: [],
  status: "Pending",
  totalAmount: 200,
  createdAt: new Date(),
  updatedAt: new Date()
};
```

---

## Verification Checklist

- [ ] `users` collection created
- [ ] `expenses` collection created
- [ ] At least one Admin user added to Firestore
- [ ] Firebase Authentication enabled (Email/Password)
- [ ] Storage bucket created with rules
- [ ] Firestore security rules deployed
- [ ] Firebase config added to `client/src/services/firebase-config.js`
- [ ] Service account credentials added to `server/.env`

---

Your Firestore database is now ready! 🎉
