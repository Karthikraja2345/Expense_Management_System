# Installation & Setup Checklist

## ✅ Pre-Installation Checklist

### System Requirements
- [ ] Windows OS
- [ ] Node.js installed (v16 or higher)
  - Check: `node --version`
  - Download: https://nodejs.org
- [ ] npm installed (comes with Node.js)
  - Check: `npm --version`
- [ ] Internet connection
- [ ] Web browser (Chrome recommended)
- [ ] Text editor (VS Code recommended)

### Firebase Account
- [ ] Google account created
- [ ] Access to Firebase Console
- [ ] Credit card (optional, free tier sufficient)

---

## 📦 Installation Steps

### Step 1: Install Project Dependencies ⏱ 5 minutes

```powershell
# Navigate to project directory
cd C:\VSC\Expense_Management_System

# Run installation script
.\install.ps1
```

**Checklist:**
- [ ] Root dependencies installed
- [ ] Client dependencies installed
- [ ] Server dependencies installed
- [ ] No error messages
- [ ] All package.json files processed

---

## 🔥 Firebase Setup Steps

### Step 2: Create Firebase Project ⏱ 10 minutes

#### 2.1 Create Project
- [ ] Go to https://console.firebase.google.com
- [ ] Click "Add project" or "Create a project"
- [ ] Enter project name: `expense-management-system`
- [ ] (Optional) Disable Google Analytics or configure
- [ ] Click "Create project"
- [ ] Wait for project creation
- [ ] Click "Continue"

#### 2.2 Enable Authentication
- [ ] In left sidebar, click "Authentication"
- [ ] Click "Get started"
- [ ] Click "Sign-in method" tab
- [ ] Click "Email/Password"
- [ ] Toggle "Email/Password" to **Enabled**
- [ ] Click "Save"

#### 2.3 Enable Firestore Database
- [ ] In left sidebar, click "Firestore Database"
- [ ] Click "Create database"
- [ ] Select "Start in production mode"
- [ ] Click "Next"
- [ ] Choose location (closest to you):
  - [ ] us-central (Iowa)
  - [ ] europe-west (Belgium)
  - [ ] asia-south1 (Mumbai)
  - [ ] Or other
- [ ] Click "Enable"
- [ ] Wait for database creation

#### 2.4 Enable Firebase Storage
- [ ] In left sidebar, click "Storage"
- [ ] Click "Get started"
- [ ] Click "Next" (production mode)
- [ ] Use same location as Firestore
- [ ] Click "Done"

---

## 🔑 Firebase Configuration

### Step 3: Get Firebase Web Config ⏱ 5 minutes

#### 3.1 Register Web App
- [ ] Click gear icon (⚙️) → "Project settings"
- [ ] Scroll to "Your apps" section
- [ ] Click web icon `</>`
- [ ] Enter app nickname: `Expense Management Web`
- [ ] (Optional) Check "Also set up Firebase Hosting"
- [ ] Click "Register app"

#### 3.2 Copy Configuration
- [ ] Copy the `firebaseConfig` object
- [ ] Should look like:
```javascript
{
  apiKey: "AIza...",
  authDomain: "expense-management-system.firebaseapp.com",
  projectId: "expense-management-system",
  storageBucket: "expense-management-system.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
}
```

#### 3.3 Create Config File
- [ ] Open `client/src/services/firebase-config.example.js`
- [ ] Save As → `firebase-config.js` (same directory)
- [ ] Paste your config
- [ ] Save file
- [ ] **NEVER commit firebase-config.js to git!**

**File location**: `client/src/services/firebase-config.js`

**Example:**
```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export default firebaseConfig;
```

### Step 4: Get Firebase Admin Config ⏱ 3 minutes

#### 4.1 Generate Service Account Key
- [ ] In Firebase Console, click gear icon → "Project settings"
- [ ] Click "Service accounts" tab
- [ ] Click "Generate new private key"
- [ ] Click "Generate key" (confirmation dialog)
- [ ] JSON file downloads automatically
- [ ] Save as `serviceAccountKey.json` (optional, for reference)

#### 4.2 Create .env File
- [ ] Open `server/.env.example`
- [ ] Save As → `.env` (same directory)
- [ ] Open the downloaded JSON file
- [ ] Copy values to .env:

**From JSON file:**
```json
{
  "project_id": "expense-management-system",
  "private_key": "-----BEGIN PRIVATE KEY-----\nABC123...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xyz@expense-management-system.iam.gserviceaccount.com"
}
```

**To .env file:**
```env
PORT=5000
FIREBASE_PROJECT_ID=expense-management-system
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@expense-management-system.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nABC123...\n-----END PRIVATE KEY-----\n"
```

- [ ] Save .env file
- [ ] **NEVER commit .env to git!**
- [ ] Verify .env is in .gitignore

---

## 🔒 Deploy Security Rules

### Step 5: Firestore Security Rules ⏱ 3 minutes

#### Option A: Firebase Console (Easier)
- [ ] In Firebase Console, go to "Firestore Database"
- [ ] Click "Rules" tab
- [ ] Delete existing rules
- [ ] Open `firestore.rules` in project
- [ ] Copy entire content
- [ ] Paste into Firebase Console
- [ ] Click "Publish"
- [ ] Wait for confirmation

#### Option B: Firebase CLI (Advanced)
```powershell
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (select Firestore only)
firebase init

# Deploy rules
firebase deploy --only firestore:rules
```

**Checklist:**
- [ ] Rules deployed successfully
- [ ] No syntax errors
- [ ] Rules tab shows new rules

---

## 👤 Create Initial Admin User

### Step 6: Add Admin User ⏱ 2 minutes

- [ ] In Firebase Console, go to "Firestore Database"
- [ ] Click "Start collection"
- [ ] Collection ID: `users`
- [ ] Click "Next"
- [ ] Document ID: Click "Auto-ID"
- [ ] Add fields (click "+ Add field"):

| Field | Type | Value |
|-------|------|-------|
| name | string | `Admin User` |
| password | string | `admin123` |
| role | string | `Admin` |
| location | string | `Chennai` |
| optionalField1 | string | `` (empty) |
| optionalField2 | string | `` (empty) |
| createdAt | string | `2025-12-24` |

- [ ] Click "Save"
- [ ] Verify document created
- [ ] Note: Change password after first login!

---

## 🚀 Run Application

### Step 7: Start Services ⏱ 1 minute

```powershell
# From project root
.\start.ps1
```

**Checklist:**
- [ ] Client starts on http://localhost:3000
- [ ] Server starts on http://localhost:5000
- [ ] No error messages in console
- [ ] Both services running

**Manual Start (alternative):**
```powershell
# Terminal 1 - Client
cd client
npm run dev

# Terminal 2 - Server
cd server
npm run dev
```

---

## ✅ Verify Installation

### Step 8: Test Application ⏱ 5 minutes

#### 8.1 Test Backend
- [ ] Open browser
- [ ] Navigate to: http://localhost:5000/api/health
- [ ] Should see: `{"status":"OK","message":"Server is running"}`

#### 8.2 Test Frontend
- [ ] Navigate to: http://localhost:3000
- [ ] Should see login page
- [ ] No console errors

#### 8.3 Test Login
- [ ] Enter credentials:
  - Name: `Admin User`
  - Password: `admin123`
- [ ] Click "Login"
- [ ] Should redirect to Admin Dashboard
- [ ] Should see "Admin Dashboard" header
- [ ] Should see your name in header

#### 8.4 Test User Creation
- [ ] Click "User Management" tab
- [ ] Click "+ Add User"
- [ ] Create an Employee:
  - Name: `Test Employee`
  - Password: `test123`
  - Role: `Employee`
  - Location: `Chennai`
- [ ] Click "Create User"
- [ ] Should see success message
- [ ] User appears in table

#### 8.5 Test Employee Login
- [ ] Logout
- [ ] Login as Employee:
  - Name: `Test Employee`
  - Password: `test123`
- [ ] Should redirect to Employee Dashboard
- [ ] Should see "Employee Dashboard" header

#### 8.6 Test Expense Filing
- [ ] Fill out expense form:
  - Date: Today's date
  - Location: Select "Chennai"
  - Expense Type: "Food"
  - Amount: 500
  - Recurring: "One-time"
- [ ] Click "Submit for Approval"
- [ ] Should see success message
- [ ] Expense appears in table below

#### 8.7 Create Approver
- [ ] Logout
- [ ] Login as Admin
- [ ] Create Approver:
  - Name: `Test Approver`
  - Password: `approver123`
  - Role: `Approver`
  - Location: `Chennai`
- [ ] Click "Create User"

#### 8.8 Test Approval Flow
- [ ] Logout
- [ ] Login as Approver
- [ ] Should see pending expense
- [ ] Click "✓ Approve & Pay"
- [ ] Select payment method: "Bank Transfer"
- [ ] Click "Confirm"
- [ ] Expense should disappear from pending

#### 8.9 Test Analytics
- [ ] Should see charts section
- [ ] Charts should show data
- [ ] Total amount displayed
- [ ] Location filters work

#### 8.10 Test Theme Toggle
- [ ] Click sun/moon icon in header
- [ ] Page should switch theme
- [ ] Click again to switch back

---

## 🎉 Installation Complete!

### Checklist Summary

**Pre-Installation:**
- [x] Node.js installed
- [x] npm installed
- [x] Firebase account created

**Installation:**
- [x] Dependencies installed
- [x] No errors during installation

**Firebase Setup:**
- [x] Project created
- [x] Authentication enabled
- [x] Firestore enabled
- [x] Storage enabled

**Configuration:**
- [x] firebase-config.js created
- [x] .env created
- [x] Security rules deployed
- [x] Admin user created

**Testing:**
- [x] Backend health check passed
- [x] Frontend loads
- [x] Admin login works
- [x] Employee creation works
- [x] Expense filing works
- [x] Approval flow works
- [x] Analytics display
- [x] Theme toggle works

---

## 🎓 Next Steps

### Immediate:
1. **Change Admin Password**
   - [ ] Login as Admin
   - [ ] Go to User Management
   - [ ] Edit Admin User
   - [ ] Set new password
   - [ ] Save

2. **Create More Users**
   - [ ] Create Employees
   - [ ] Create Approvers
   - [ ] Assign proper locations

3. **Customize**
   - [ ] Add more locations (edit arrays in code)
   - [ ] Add more expense categories
   - [ ] Adjust optional fields

### Optional:
1. **Production Deployment**
   - [ ] Add password hashing (bcrypt)
   - [ ] Set up hosting (Vercel/Netlify)
   - [ ] Configure environment variables
   - [ ] Enable HTTPS
   - [ ] Add monitoring

2. **Enhancements**
   - [ ] Email notifications
   - [ ] PDF reports
   - [ ] Budget tracking
   - [ ] Recurring expenses

---

## 📞 Troubleshooting

### Common Issues:

**"Module not found"**
- [ ] Run `.\install.ps1` again
- [ ] Check node_modules exists
- [ ] Restart VS Code

**"Firebase: Error (auth/...)"**
- [ ] Check firebase-config.js exists
- [ ] Verify credentials are correct
- [ ] Ensure Authentication is enabled

**"Cannot connect to server"**
- [ ] Check server is running on :5000
- [ ] Verify .env file exists
- [ ] Check firewall settings

**"Permission denied (Firestore)"**
- [ ] Deploy security rules
- [ ] Check rules in Firebase Console
- [ ] Verify user is authenticated

---

## 📚 Resources

- **SETUP_GUIDE.md** - Detailed setup instructions
- **QUICK_REFERENCE.md** - Quick commands
- **PROJECT_OVERVIEW.md** - Architecture details
- **FEATURES.md** - Complete feature list

---

## ✅ Verification Script

Run this to verify everything:

```powershell
# Check configuration
$config = Test-Path "client\src\services\firebase-config.js"
$env = Test-Path "server\.env"

Write-Host "Configuration Check:"
Write-Host "  firebase-config.js: $($config ? '✓' : '✗')"
Write-Host "  .env: $($env ? '✓' : '✗')"

if ($config -and $env) {
    Write-Host "`n✅ Configuration complete!"
    Write-Host "Run: .\start.ps1"
} else {
    Write-Host "`n⚠ Configuration incomplete"
    Write-Host "See SETUP_GUIDE.md"
}
```

---

**Installation Status**: 
- [ ] Not Started
- [ ] In Progress
- [ ] Complete ✅

**Date Completed**: _______________

**Notes**: 
_______________________________________
_______________________________________
_______________________________________

---

**🎉 Congratulations! Your Expense Management System is ready to use!**
