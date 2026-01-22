# Expense Management System - Quick Reference

## 🚀 Quick Commands

### Installation
```powershell
# Run installation script
.\install.ps1

# Or manually
npm install
cd client && npm install
cd ../server && npm install
```

### Running the Application
```powershell
# Quick start (recommended)
.\start.ps1

# Or manually
npm run dev

# Or run separately
cd client && npm run dev    # Frontend on :3000
cd server && npm run dev    # Backend on :5000
```

### Building for Production
```powershell
cd client
npm run build
```

## 🔑 Default Access

### First Login
After setting up Firebase and creating initial admin user:

**URL**: http://localhost:3000

**Credentials** (use the admin user you created in Firestore):
- Name: `Admin User`
- Password: `admin123` (or whatever you set)

⚠️ **Change this password immediately!**

## 📱 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🔐 User Roles & Access

| Role | Can Do | Dashboard Path |
|------|--------|----------------|
| **Employee** | File expenses, view own expenses, see analytics | `/employee` |
| **Approver** | Review & approve/decline expenses, view analytics, export CSV | `/approver` |
| **Admin** | Manage users, view all expenses, full analytics, export CSV | `/admin` |

## 📊 Features Quick Reference

### Employee Features
- ✅ File expenses with multiple items
- ✅ Add travel legs (convenience expenses)
- ✅ Upload multiple bill images
- ✅ Track expense status
- ✅ View personal analytics
- ✅ Sort and filter expenses

### Approver Features
- ✅ View pending approvals
- ✅ Filter by location
- ✅ View bill images (zoom)
- ✅ Approve with payment method
- ✅ Approve and hold
- ✅ Decline with reason
- ✅ Export to CSV
- ✅ View analytics

### Admin Features
- ✅ Create/Edit/Delete users
- ✅ Assign roles and locations
- ✅ View all expenses
- ✅ Advanced filtering
- ✅ Export to CSV
- ✅ System-wide analytics

## 🎨 UI Features

- **Dark/Light Mode**: Click sun/moon icon in header
- **Real-time Analytics**: 4 chart types (Pie, Bar, Line, Stacked Bar)
- **CSV Export**: Download filtered expense data
- **Status Badges**: Color-coded expense status
- **Responsive Tables**: Sortable columns
- **Image Zoom**: Click bill images to enlarge

## 🔧 Configuration Files

### Client Configuration
**File**: `client/src/services/firebase-config.js`
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
export default firebaseConfig;
```

### Server Configuration
**File**: `server/.env`
```env
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 📦 Available Locations

Default locations (customizable):
- Chennai
- Salem
- Madurai
- Omalur
- Coimbatore
- Trichy

**To add more**: Edit `LOCATIONS` array in:
- `client/src/pages/EmployeeDashboard.jsx`
- `client/src/pages/ApproverDashboard.jsx`
- `client/src/pages/AdminDashboard.jsx`

## 💰 Expense Types

Default categories (customizable):
- Food
- Cable
- Travel
- Rent
- Utilities
- Office Supplies
- Other

**To add more**: Edit `EXPENSE_TYPES` array in `EmployeeDashboard.jsx`

## 🔄 Expense Status Flow

1. **Pending** → Employee submitted, awaiting review
2. **Approved-Hold** → Approved but payment pending
3. **Approved-Paid** → Approved and paid
4. **Declined** → Rejected with reason

## 📈 Analytics Data

### Charts Available:
1. **Pie Chart**: Expenses by location
2. **Bar Chart**: Expenses by category
3. **Line Chart**: Monthly total amounts
4. **Stacked Bar**: Last 3 months category breakdown

### Filters:
- Location multi-select
- Date range
- Category
- Status

## 🐛 Common Issues & Solutions

### Port Already in Use
```powershell
# Find process using port
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Firebase Connection Issues
1. Check `firebase-config.js` credentials
2. Verify Firestore, Auth, Storage are enabled
3. Check Firebase Console for errors
4. Ensure security rules are deployed

### Login Not Working
1. Verify user exists in Firestore `users` collection
2. Check browser console for errors
3. Verify backend is running on :5000
4. Check Firebase Authentication is enabled

### Images Not Uploading
1. Check Firebase Storage is enabled
2. Verify storage rules allow uploads
3. Check file size (5MB limit)
4. Ensure internet connection is stable

## 📝 API Testing

### Using PowerShell
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:5000/api/health"

# Login
$body = @{
    name = "Admin User"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```

### Using curl
```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","password":"admin123"}'
```

## 🎯 Keyboard Shortcuts

- **Tab**: Navigate form fields
- **Enter**: Submit forms
- **Escape**: Close modals
- **Ctrl+Click**: Open links in new tab

## 📚 File Structure Quick Access

```
Important Files:
├── client/src/
│   ├── pages/               # Main dashboards
│   ├── components/          # Reusable components
│   ├── services/            # API & Firebase
│   └── styles/              # CSS files
├── server/
│   ├── routes/              # API endpoints
│   └── firebase.js          # Firebase Admin
└── Configuration:
    ├── firestore.rules      # Security rules
    ├── SETUP_GUIDE.md       # Detailed setup
    └── PROJECT_OVERVIEW.md  # Full documentation
```

## 🔒 Security Checklist

Before production:
- [ ] Hash passwords with bcrypt
- [ ] Use HTTPS
- [ ] Set up environment variables properly
- [ ] Deploy Firestore security rules
- [ ] Enable Firebase App Check
- [ ] Add rate limiting
- [ ] Review and test all permissions
- [ ] Remove console.log statements
- [ ] Add error logging service
- [ ] Set up monitoring

## 💡 Pro Tips

1. **Use CSV Export**: Great for accounting and records
2. **Filter Analytics**: Select specific locations for targeted insights
3. **Bill Images**: Upload clear images for faster approval
4. **Batch Expenses**: File multiple items in one submission
5. **Dark Mode**: Easier on eyes for long sessions
6. **Sort Tables**: Click column headers to sort
7. **Status Tracking**: Check dashboard regularly for updates

## 📞 Need Help?

1. **Setup Issues**: See `SETUP_GUIDE.md`
2. **Feature Details**: See `PROJECT_OVERVIEW.md`
3. **Firebase Docs**: https://firebase.google.com/docs
4. **React Docs**: https://react.dev

## 🎉 Getting Started Checklist

- [ ] Run `.\install.ps1`
- [ ] Create Firebase project
- [ ] Enable Auth, Firestore, Storage
- [ ] Create `firebase-config.js`
- [ ] Create `.env` file
- [ ] Create initial admin user in Firestore
- [ ] Deploy security rules
- [ ] Run `.\start.ps1`
- [ ] Login and create users
- [ ] Test expense flow
- [ ] Verify analytics

---

**Happy Expense Managing! 🎊**
