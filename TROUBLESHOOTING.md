# 🔧 Troubleshooting Guide

## Quick Diagnostics

Run this PowerShell script to check your setup:

```powershell
Write-Host "`n🔍 Expense Management System - Diagnostics" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found" -ForegroundColor Red
}

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found" -ForegroundColor Red
}

# Check configuration files
Write-Host "`nChecking configuration..." -ForegroundColor Yellow
$firebaseConfig = Test-Path "client\src\services\firebase-config.js"
$envFile = Test-Path "server\.env"
$clientModules = Test-Path "client\node_modules"
$serverModules = Test-Path "server\node_modules"

Write-Host "  firebase-config.js: $($firebaseConfig ? '✓' : '✗')" -ForegroundColor ($firebaseConfig ? 'Green' : 'Red')
Write-Host "  .env: $($envFile ? '✓' : '✗')" -ForegroundColor ($envFile ? 'Green' : 'Red')
Write-Host "  client/node_modules: $($clientModules ? '✓' : '✗')" -ForegroundColor ($clientModules ? 'Green' : 'Red')
Write-Host "  server/node_modules: $($serverModules ? '✓' : '✗')" -ForegroundColor ($serverModules ? 'Green' : 'Red')

Write-Host "`n"
```

---

## 🚨 Common Issues & Solutions

### 1. Installation Issues

#### Error: "Module not found"
**Symptoms:**
- Import errors
- Module resolution failures
- "Cannot find module 'xyz'"

**Solutions:**
```powershell
# Solution 1: Reinstall dependencies
Remove-Item -Recurse -Force node_modules, client\node_modules, server\node_modules
.\install.ps1

# Solution 2: Clear npm cache
npm cache clean --force
.\install.ps1

# Solution 3: Delete package-lock.json
Remove-Item package-lock.json, client\package-lock.json, server\package-lock.json
.\install.ps1
```

#### Error: "EACCES: permission denied"
**Solutions:**
```powershell
# Run as Administrator
Right-click PowerShell → "Run as Administrator"

# Or fix npm permissions
npm config set prefix %APPDATA%\npm
```

---

### 2. Firebase Configuration Issues

#### Error: "Firebase: Error (auth/invalid-api-key)"
**Cause:** Incorrect API key in firebase-config.js

**Solution:**
1. Go to Firebase Console
2. Project Settings → General
3. Scroll to "Your apps" → Web app
4. Copy the config object
5. Replace in `client/src/services/firebase-config.js`
6. Restart application

#### Error: "Firebase: Error (auth/configuration-not-found)"
**Cause:** firebase-config.js not created

**Solution:**
```powershell
# Check if file exists
Test-Path "client\src\services\firebase-config.js"

# If false, create it
Copy-Item "client\src\services\firebase-config.example.js" "client\src\services\firebase-config.js"

# Then edit with your Firebase credentials
```

#### Error: "Error loading credentials"
**Cause:** server/.env not configured

**Solution:**
```powershell
# Check if file exists
Test-Path "server\.env"

# If false, create it
Copy-Item "server\.env.example" "server\.env"

# Then edit with your Firebase Admin credentials
```

#### Error: "Firebase Admin SDK could not be initialized"
**Causes & Solutions:**

**1. Missing private key:**
```env
# Make sure private key includes \n characters
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**2. Incorrect format:**
```env
# Use quotes around the entire key
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_KEY_HERE
-----END PRIVATE KEY-----"  # WRONG!

# Correct:
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**3. Wrong project ID:**
- Verify in Firebase Console
- Match exactly (case-sensitive)

---

### 3. Authentication Issues

#### Error: "Invalid credentials"
**Cause:** Username or password incorrect

**Solutions:**
1. Verify user exists in Firestore:
   - Firebase Console → Firestore Database
   - Check `users` collection
   - Verify name field matches exactly (case-sensitive)
   
2. Reset password:
   - Login as Admin
   - Edit user
   - Set new password

3. Check console for errors:
   - F12 → Console tab
   - Look for specific error messages

#### Error: "Cannot read property 'role' of undefined"
**Cause:** User document missing fields

**Solution:**
1. Go to Firestore Database
2. Find user document
3. Ensure these fields exist:
   - name (string)
   - password (string)
   - role (string): "Employee", "Approver", or "Admin"
   - location (string)

#### Error: "Firebase: Error (auth/user-not-found)"
**Cause:** User not in Firebase Authentication

**Note:** This is normal! We use Firestore for users, not Firebase Auth.
Custom tokens handle authentication.

**Solution:** No action needed if you can login normally.

---

### 4. Server Connection Issues

#### Error: "Network Error" or "ERR_CONNECTION_REFUSED"
**Cause:** Backend server not running

**Solutions:**
```powershell
# Check if server is running
netstat -ano | findstr :5000

# If not running, start it
cd server
npm run dev

# Or use quick start
.\start.ps1
```

#### Error: "Port 5000 already in use"
**Solutions:**

**Option 1: Kill the process**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill it (replace PID with actual number)
taskkill /PID <PID> /F
```

**Option 2: Change port**
```env
# In server/.env
PORT=5001  # Use different port
```

```javascript
// Then update in client/src/services/api.js
const API_URL = 'http://localhost:5001/api';
```

#### Error: "CORS policy blocked"
**Cause:** CORS not configured properly

**Solution:**
- Check `server/index.js` has `app.use(cors())`
- Restart server
- Clear browser cache

---

### 5. Database Issues

#### Error: "Missing or insufficient permissions"
**Cause:** Firestore security rules not deployed

**Solutions:**

**Option 1: Deploy via Console**
1. Firebase Console → Firestore Database
2. Rules tab
3. Copy content from `firestore.rules`
4. Paste and Publish

**Option 2: Deploy via CLI**
```powershell
firebase deploy --only firestore:rules
```

**Option 3: Use test mode temporarily**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // WARNING: Insecure!
    }
  }
}
```
⚠️ Only for testing! Never use in production!

#### Error: "Document not found"
**Cause:** Required documents don't exist

**Solution:**
1. Check Firestore Database
2. Ensure collections exist:
   - `users`
   - `expenses`
3. Verify at least one admin user exists

---

### 6. Upload Issues

#### Error: "File upload failed"
**Causes & Solutions:**

**1. Storage not enabled:**
- Firebase Console → Storage
- Click "Get started"

**2. Storage rules incorrect:**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /bills/{fileName} {
      allow write: if request.auth != null;
      allow read: if request.auth != null;
    }
  }
}
```

**3. File too large:**
- Current limit: 5MB
- Reduce image size
- Or increase in `server/routes/expenseRoutes.js`:
```javascript
limits: {
  fileSize: 10 * 1024 * 1024, // 10MB
}
```

---

### 7. Frontend Issues

#### Error: "Blank page" or "White screen"
**Solutions:**

**1. Check browser console:**
- F12 → Console
- Look for red errors

**2. Check if frontend is running:**
```powershell
netstat -ano | findstr :3000
```

**3. Restart frontend:**
```powershell
cd client
npm run dev
```

**4. Clear browser cache:**
- Ctrl + Shift + Delete
- Clear cached images and files

#### Error: "Chart not displaying"
**Cause:** No data or Chart.js issue

**Solutions:**
1. Check if data exists:
   - Submit expenses
   - Approve them
   - Then check analytics

2. Check console for errors

3. Verify Chart.js installed:
```powershell
cd client
npm list chart.js react-chartjs-2
```

---

### 8. Routing Issues

#### Error: "Cannot GET /employee"
**Cause:** React Router handles routes, but direct URL access fails

**Solution:** Always start from http://localhost:3000 and login

#### Error: "Redirects to /login immediately"
**Cause:** User not authenticated

**Solutions:**
1. Login first
2. Check localStorage:
   - F12 → Application → Local Storage
   - Should have 'user' key
3. Try incognito mode (fresh session)

---

### 9. Style Issues

#### Issue: "Dark mode not working"
**Solutions:**
1. Check localStorage:
   - F12 → Application → Local Storage
   - Look for 'theme' key

2. Clear localStorage:
```javascript
// In browser console
localStorage.clear();
location.reload();
```

#### Issue: "Styles not loading"
**Solutions:**
1. Check CSS files imported in components
2. Restart frontend
3. Clear browser cache
4. Check for CSS errors in console

---

### 10. Data Issues

#### Issue: "Expenses not appearing"
**Checks:**
1. Are they submitted?
2. Check Firestore Database → `expenses` collection
3. Check status filter (not set to wrong status)
4. Check date range

#### Issue: "Analytics showing 0"
**Cause:** Only approved expenses counted

**Solution:**
1. Submit expenses as Employee
2. Login as Approver
3. Approve expenses
4. Then check analytics

---

## 🔍 Debugging Steps

### 1. Backend Debugging

```powershell
# Run with verbose logging
cd server
$env:DEBUG="*"
npm run dev
```

### 2. Frontend Debugging

**Check Network Requests:**
1. F12 → Network tab
2. Perform action
3. Check for failed requests (red)
4. Click failed request
5. Check Response tab

**Check Console Errors:**
1. F12 → Console tab
2. Look for red errors
3. Expand error for stack trace

### 3. Firebase Debugging

**Check Firebase Console:**
1. Authentication → Users (should be empty, we use Firestore)
2. Firestore Database → Data (check documents)
3. Storage → Files (check uploaded images)
4. Usage (check quotas)

---

## 🛠 Advanced Troubleshooting

### Reset Everything

```powershell
# Stop all processes
# Ctrl+C in terminals

# Delete all dependencies
Remove-Item -Recurse -Force node_modules, client\node_modules, server\node_modules

# Delete all locks
Remove-Item package-lock.json, client\package-lock.json, server\package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall
.\install.ps1

# Restart
.\start.ps1
```

### Check All Services

```powershell
# Backend health
Invoke-RestMethod -Uri "http://localhost:5000/api/health"

# Frontend (should return HTML)
Invoke-WebRequest -Uri "http://localhost:3000"
```

### Database Connection Test

```powershell
# In server directory
node -e "
const { db } = require('./firebase.js');
db.collection('users').limit(1).get()
  .then(() => console.log('✓ Firestore connected'))
  .catch(err => console.log('✗ Error:', err.message));
"
```

---

## 📞 Getting Help

### Information to Gather:

1. **Error Message:**
   - Full error text
   - Stack trace

2. **Environment:**
   - Node.js version: `node --version`
   - npm version: `npm --version`
   - Windows version

3. **What You Were Doing:**
   - Step by step actions
   - Which page/feature
   - Which user role

4. **Console Output:**
   - Browser console (F12)
   - Server terminal
   - Client terminal

5. **Configuration:**
   - Files exist? (firebase-config.js, .env)
   - Firebase services enabled?
   - Security rules deployed?

### Resources:

- **SETUP_GUIDE.md** - Setup instructions
- **QUICK_REFERENCE.md** - Quick commands
- **PROJECT_OVERVIEW.md** - Architecture
- **Firebase Docs**: https://firebase.google.com/docs
- **React Docs**: https://react.dev

---

## ✅ Health Check Script

Save and run this script:

```powershell
# health-check.ps1

Write-Host "`n🏥 Health Check" -ForegroundColor Cyan
Write-Host "=============`n" -ForegroundColor Cyan

# 1. Check backend
Write-Host "1. Checking backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 5
    Write-Host "   ✓ Backend: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Backend not responding" -ForegroundColor Red
}

# 2. Check frontend
Write-Host "2. Checking frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5
    Write-Host "   ✓ Frontend: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Frontend not responding" -ForegroundColor Red
}

# 3. Check files
Write-Host "3. Checking configuration..." -ForegroundColor Yellow
$checks = @{
    "firebase-config.js" = "client\src\services\firebase-config.js"
    ".env" = "server\.env"
    "client node_modules" = "client\node_modules"
    "server node_modules" = "server\node_modules"
}

foreach ($item in $checks.GetEnumerator()) {
    $exists = Test-Path $item.Value
    $status = if ($exists) { "✓" } else { "✗" }
    $color = if ($exists) { "Green" } else { "Red" }
    Write-Host "   $status $($item.Key)" -ForegroundColor $color
}

Write-Host "`n"
```

---

## 🎯 Quick Fixes

### "Nothing works!"
1. Delete node_modules folders
2. Run `.\install.ps1`
3. Check configuration files
4. Run `.\start.ps1`

### "Login doesn't work!"
1. Check Firestore for user
2. Verify name matches exactly
3. Check browser console
4. Verify backend is running

### "Can't see my expenses!"
1. Check status filter
2. Verify expenses in Firestore
3. Check date range
4. Try "All Status"

### "Charts are empty!"
1. Submit expenses
2. Approve them
3. Check analytics again
4. Verify data in Firestore

---

**Still having issues? Check the documentation or review your configuration!** 📚
