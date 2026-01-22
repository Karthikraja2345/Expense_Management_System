# Expense Management System - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
cd ..
```

### 2. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name: `expense-management-system`
4. Follow the setup wizard

#### Enable Authentication
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Save changes

#### Enable Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **production mode** (we'll add rules later)
4. Choose a location close to your users
5. Click "Enable"

#### Enable Firebase Storage
1. Go to **Storage**
2. Click "Get started"
3. Start in **production mode**
4. Use same location as Firestore
5. Click "Done"

#### Get Firebase Configuration

**For Client (Web):**
1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the web icon `</>`
4. Register app with nickname: "Expense Management Web"
5. Copy the `firebaseConfig` object
6. Create `client/src/services/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export default firebaseConfig;
```

**For Server (Admin SDK):**
1. Go to **Project Settings** → **Service Accounts**
2. Click "Generate new private key"
3. Save the JSON file as `server/serviceAccountKey.json`
4. Create `server/.env`:

```env
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

**Note:** Replace the values with your actual Firebase credentials from the service account JSON.

#### Deploy Firestore Security Rules
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize project: `firebase init` (select Firestore only)
4. Deploy rules: `firebase deploy --only firestore:rules`

Or manually copy the rules from `firestore.rules` to Firebase Console:
- Go to **Firestore Database** → **Rules**
- Paste the rules from the file
- Click "Publish"

### 3. Create Initial Admin User

Since we need an admin to create other users, let's manually add one:

1. Go to **Firestore Database** in Firebase Console
2. Click "Start collection"
3. Collection ID: `users`
4. Add first document:
   - Document ID: (auto-generate)
   - Fields:
     ```
     name: "Admin User"
     password: "admin123"  (change this immediately!)
     role: "Admin"
     location: "Chennai"
     optionalField1: ""
     optionalField2: ""
     createdAt: "2025-12-24"
     ```
5. Click "Save"

**⚠️ IMPORTANT:** This is for initial setup only. In production, use bcrypt to hash passwords!

### 4. Run the Application

```bash
# From root directory
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### 5. First Login

1. Open http://localhost:3000
2. Login with:
   - Name: `Admin User`
   - Password: `admin123`
3. You'll be redirected to Admin Dashboard
4. Create more users (Employees, Approvers, Admin)

## 📋 Usage Flow

### Admin Workflow
1. Login as Admin
2. Go to "User Management" tab
3. Create users with appropriate roles:
   - **Employees**: Can file expenses
   - **Approvers**: Can review and approve/decline expenses
   - **Admins**: Full system access
4. View all expenses in "All Expenses" tab
5. Check analytics in "Analytics" tab
6. Export data as CSV

### Employee Workflow
1. Login as Employee
2. Fill expense form:
   - Select date of spend
   - Select location(s)
   - Add expense items (type, amount, recurring)
   - Add travel legs if needed
   - Upload bill images
3. Submit for approval
4. Track submitted expenses in the table below
5. View analytics of your approved expenses

### Approver Workflow
1. Login as Approver
2. See pending expenses (default: all locations)
3. Filter by location if needed
4. For each expense:
   - View details and bill images
   - Click bill images to zoom
   - **Approve & Pay**: Select payment method (Bank/GPay/Cash)
   - **Approve & Hold**: Mark as approved but payment pending
   - **Decline**: Provide mandatory reason
5. Export expenses as CSV
6. View analytics

## 🎨 Features

### Dark/Light Mode
- Click sun/moon icon in header
- Preference saved in localStorage
- Smooth transitions

### Analytics
- **Location-wise Pie Chart**: See expenses by location
- **Category-wise Bar Chart**: Compare expense types
- **Monthly Line Chart**: Track spending over time
- **Stacked Bar (Last 3 Months)**: Category breakdown
- **Filters**: Select specific locations
- **Interactive**: Click charts to see amounts

### CSV Export
- Available for Approvers and Admins
- Filter before export:
  - Date range
  - Location
  - Category
  - Status
- Download button generates CSV file

### Real-time Data
- All charts show real data from Firestore
- No mock data
- Updates after every action

## 🔒 Security Notes

### For Production Deployment:

1. **Password Hashing**:
   ```bash
   npm install bcrypt
   ```
   Update authentication to use bcrypt:
   ```javascript
   const bcrypt = require('bcrypt');
   const hashedPassword = await bcrypt.hash(password, 10);
   const isMatch = await bcrypt.compare(password, user.password);
   ```

2. **Environment Variables**:
   - Never commit `.env` or `firebase-config.js`
   - Use environment variables in production
   - Rotate Firebase credentials regularly

3. **Firebase Rules**:
   - Review and test Firestore security rules
   - Ensure Storage rules are restrictive
   - Enable App Check for additional security

4. **HTTPS Only**:
   - Use HTTPS in production
   - Enable CORS properly
   - Set up proper headers

5. **Rate Limiting**:
   - Add rate limiting to API endpoints
   - Use Firebase App Check
   - Monitor usage

## 🐛 Troubleshooting

### "Permission Denied" Error
- Check Firestore security rules are deployed
- Verify user is authenticated
- Check user role in Firestore

### "Network Error" on API Calls
- Ensure backend is running on port 5000
- Check CORS settings
- Verify API_URL in client/src/services/api.js

### Firebase Auth Errors
- Verify firebase-config.js has correct credentials
- Check Authentication is enabled
- Ensure custom token generation is working

### Charts Not Showing
- Check browser console for errors
- Verify Chart.js is installed
- Ensure data is being fetched

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🎯 Next Steps

1. Add more expense categories
2. Implement email notifications
3. Add expense reports (PDF)
4. Mobile responsive improvements
5. Add expense approval workflows
6. Implement recurring expense automation
7. Add budget tracking
8. Multi-currency support

## 📞 Support

For issues or questions:
1. Check Firebase Console for errors
2. Review browser console logs
3. Verify all environment variables
4. Check Firestore data structure

---

**Built with ❤️ using React, Node.js, and Firebase**
