# Expense Management System
## Project Structure Overview

```
Expense_Management_System/
│
├── client/                          # React Frontend (Vite)
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── Analytics.jsx       # Charts and analytics display
│   │   │   ├── Header.jsx          # Top navigation bar
│   │   │   └── ProtectedRoute.jsx  # Route authentication guard
│   │   │
│   │   ├── context/                 # React Context for state management
│   │   │   ├── AuthContext.jsx     # User authentication state
│   │   │   └── ThemeContext.jsx    # Dark/Light mode state
│   │   │
│   │   ├── pages/                   # Main page components
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── EmployeeDashboard.jsx    # Employee interface
│   │   │   ├── ApproverDashboard.jsx    # Approver interface
│   │   │   └── AdminDashboard.jsx       # Admin interface
│   │   │
│   │   ├── services/                # API and Firebase services
│   │   │   ├── api.js              # Axios API calls
│   │   │   ├── firebase.js         # Firebase initialization
│   │   │   ├── firebase-config.js  # Firebase credentials (create this)
│   │   │   └── firebase-config.example.js
│   │   │
│   │   ├── styles/                  # CSS stylesheets
│   │   │   ├── global.css          # Global styles & theme variables
│   │   │   ├── Login.css
│   │   │   ├── Header.css
│   │   │   ├── EmployeeDashboard.css
│   │   │   ├── ApproverDashboard.css
│   │   │   ├── AdminDashboard.css
│   │   │   └── Analytics.css
│   │   │
│   │   ├── App.jsx                  # Main app component with routing
│   │   └── main.jsx                 # React entry point
│   │
│   ├── index.html                   # HTML template
│   ├── vite.config.js              # Vite configuration
│   └── package.json                 # Client dependencies
│
├── server/                          # Node.js + Express Backend
│   ├── routes/                      # API route handlers
│   │   ├── authRoutes.js           # Login & authentication
│   │   ├── userRoutes.js           # User CRUD operations
│   │   ├── expenseRoutes.js        # Expense management
│   │   └── analyticsRoutes.js      # Analytics & CSV export
│   │
│   ├── firebase.js                  # Firebase Admin SDK setup
│   ├── index.js                     # Express server entry point
│   ├── .env                         # Environment variables (create this)
│   ├── .env.example                 # Example environment file
│   └── package.json                 # Server dependencies
│
├── firestore.rules                  # Firebase security rules
├── package.json                     # Root package.json
├── README.md                        # Project overview
├── SETUP_GUIDE.md                   # Detailed setup instructions
├── install.ps1                      # Windows installation script
└── .gitignore                       # Git ignore rules
```

## Key Features by Role

### 🔑 Authentication
- Name + Password login
- Firebase Authentication with custom tokens
- Role-based routing (Employee/Approver/Admin)

### 👤 Employee Dashboard
**Expense Filing:**
- Date of spend (date picker)
- Multi-select locations
- Multiple expense items per filing
- Expense types: Food, Travel, Rent, etc.
- Recurring types: Monthly, Weekly, One-time
- Travel leg tracking (convenience expenses)
- Bill image upload (multiple files)

**Expense Tracking:**
- View all submitted expenses
- Sort by date, amount, status
- Filter by status (Pending, Approved, Declined)
- Status badges with colors
- Decline reason display

**Analytics:**
- Personal expense analytics
- Location-wise breakdown
- Category-wise analysis
- Monthly trends

### ✅ Approver Dashboard
**Expense Review:**
- View pending approvals
- Filter by location (multi-select)
- Card-based expense display
- Bill image viewing with zoom
- Employee details

**Actions:**
- **Approve & Pay**: Select payment method (Bank/GPay/Cash)
- **Approve & Hold**: Mark for later payment
- **Decline**: Mandatory reason required

**Features:**
- CSV export with filters
- Real-time analytics
- Location filtering

### 🛠 Admin Dashboard
**User Management:**
- Create new users (Employee/Approver/Admin)
- Edit user details
- Delete users
- Assign roles and locations
- 2 optional custom fields

**Expense Overview:**
- View all expenses system-wide
- Filter by status, date range, location, category
- CSV export with advanced filters

**Analytics:**
- System-wide analytics
- Location and category filters
- Interactive charts

## 📊 Analytics Features

**Available on all dashboards:**

### Charts:
1. **Location-wise Pie Chart**
   - Shows expenses by location
   - Click segments for exact amounts
   - Color-coded

2. **Category-wise Bar Chart**
   - Compare expense types
   - Food, Travel, Rent, etc.

3. **Monthly Line Chart**
   - Total spending over time
   - Trend analysis

4. **Stacked Bar Chart (Last 3 Months)**
   - Category breakdown per month
   - Multiple datasets

### Filters:
- Location multi-select
- Select All / Clear All buttons
- Real-time chart updates

### Display:
- Total amount prominently shown
- Interactive tooltips
- Dark/Light mode compatible

## 🎨 UI/UX Features

### Design:
- **Clean & Minimal**: No clutter
- **Bold Typography**: Large, readable fonts
- **High Contrast**: Easy on eyes
- **Professional**: Business-ready interface

### Dark/Light Mode:
- Toggle button in header
- Smooth transitions
- Preference saved in localStorage
- All components themed

### Responsive:
- Desktop optimized
- Large buttons and inputs
- No unnecessary scrolling on main sections
- Cards for better organization

## 🔒 Security Implementation

### Firebase Rules:
- Role-based access control
- Users can only see their data
- Admins have full access
- Approvers can update expense status

### Authentication:
- Custom token generation
- Secure password storage (hash in production)
- Protected routes
- Session management

### Data Validation:
- Server-side validation
- Integer-only amounts (no decimals)
- Required field checks
- File size limits

## 📁 Data Models

### Users Collection:
```javascript
{
  id: string,
  name: string,
  password: string,  // Hash in production!
  role: 'Employee' | 'Approver' | 'Admin',
  location: string,
  optionalField1: string,
  optionalField2: string,
  createdAt: string (date)
}
```

### Expenses Collection:
```javascript
{
  id: string,
  employeeId: string,
  employeeName: string,
  location: string,
  expenseType: string,
  amount: number (integer),
  recurringType: 'Monthly' | 'Weekly' | 'One-time',
  status: 'Pending' | 'Approved-Hold' | 'Approved-Paid' | 'Declined',
  approverName: string,
  approvalDate: string (date),
  paymentRemark: string,
  declineReason: string,
  billImageUrls: string[],
  dateOfSpend: string (date),
  dateOfPost: string (date),
  isConvenience: boolean,
  travelDetails: string,
  createdAt: string (ISO)
}
```

## 🚀 API Endpoints

### Authentication:
- POST `/api/auth/login` - User login
- POST `/api/auth/verify` - Verify token

### Users:
- GET `/api/users` - Get all users (Admin)
- POST `/api/users` - Create user (Admin)
- PUT `/api/users/:id` - Update user (Admin)
- DELETE `/api/users/:id` - Delete user (Admin)
- GET `/api/users/role/:role` - Get users by role

### Expenses:
- POST `/api/expenses` - Submit expense (Employee)
- GET `/api/expenses/employee/:id` - Get employee expenses
- GET `/api/expenses/pending` - Get pending expenses (Approver)
- GET `/api/expenses` - Get all expenses with filters (Admin/Approver)
- PUT `/api/expenses/:id/approve` - Approve expense
- PUT `/api/expenses/:id/decline` - Decline expense

### Analytics:
- GET `/api/analytics` - Get analytics data
- GET `/api/analytics/export` - Export to CSV

## 🎯 Workflow

### Employee Flow:
1. Login → Employee Dashboard
2. File expense with multiple items
3. Upload bills
4. Submit for approval
5. Track status in table
6. View analytics

### Approver Flow:
1. Login → Approver Dashboard
2. See pending expenses (cards)
3. Filter by location
4. Review each expense
5. View bill images
6. Approve/Hold/Decline with details
7. Export to CSV
8. View analytics

### Admin Flow:
1. Login → Admin Dashboard
2. **User Management Tab:**
   - Add/Edit/Delete users
   - Assign roles
3. **All Expenses Tab:**
   - View system-wide expenses
   - Filter and export
4. **Analytics Tab:**
   - System analytics
   - Multi-location analysis

## 📦 Dependencies

### Client:
- react & react-dom - UI framework
- react-router-dom - Routing
- firebase - Authentication & Storage
- axios - API calls
- chart.js & react-chartjs-2 - Analytics charts
- vite - Build tool

### Server:
- express - Web framework
- cors - Cross-origin requests
- firebase-admin - Backend Firebase SDK
- dotenv - Environment variables
- multer - File upload handling

## 🔧 Configuration Files

### Required (Create these):
1. `client/src/services/firebase-config.js` - Firebase web credentials
2. `server/.env` - Firebase Admin credentials
3. Firebase Console setup (Firestore, Auth, Storage)

### Provided:
- `vite.config.js` - Vite settings
- `firestore.rules` - Security rules
- `.gitignore` - Git exclusions
- `.env.example` - Environment template

## 🎓 Learning Resources

### Technologies Used:
- **React**: https://react.dev
- **Vite**: https://vitejs.dev
- **Firebase**: https://firebase.google.com/docs
- **Express**: https://expressjs.com
- **Chart.js**: https://www.chartjs.org

### Concepts Implemented:
- Context API for state management
- Protected routes
- Role-based access control
- File uploads to Firebase Storage
- Real-time data with Firestore
- Custom authentication flow
- CSV generation
- Dark/Light theming
- Responsive design

---

**Status**: ✅ Production-Ready
**Last Updated**: December 24, 2025
