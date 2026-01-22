# Vercel Deployment Steps

## Step 1: Deploy Backend to Render (Free)

1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: expense-management-api
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: Free

5. Add Environment Variables in Render:
   ```
   PORT=5000
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-email
   FIREBASE_PRIVATE_KEY=your-key
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

6. Click "Create Web Service"
7. Copy the URL (e.g., `https://expense-management-api.onrender.com`)

---

## Step 2: Update Frontend API URL

Update `client/src/services/api.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

---

## Step 3: Deploy Frontend to Vercel

### Method A: Vercel CLI (Faster)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   cd client
   vercel
   ```

4. Add environment variable in Vercel dashboard:
   - `VITE_API_URL` = `https://your-render-url.onrender.com/api`

5. Redeploy:
   ```bash
   vercel --prod
   ```

### Method B: Vercel Dashboard (Easier)

1. Go to https://vercel.com and sign up
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variable:
   - Name: `VITE_API_URL`
   - Value: `https://your-render-url.onrender.com/api`

6. Click "Deploy"

---

## Step 4: Update Firebase & CORS

1. In Firebase Console → Authentication → Settings:
   - Add your Vercel domain to authorized domains
   - Example: `your-app.vercel.app`

2. Update `server/index.js` CORS configuration:
   ```javascript
   const cors = require('cors');
   app.use(cors({
     origin: ['https://your-app.vercel.app', 'http://localhost:3000'],
     credentials: true
   }));
   ```

3. Redeploy backend on Render

---

## Deployment Checklist

- [ ] Backend deployed to Render
- [ ] Backend URL copied
- [ ] `VITE_API_URL` added to Vercel env variables
- [ ] Frontend deployed to Vercel
- [ ] Vercel domain added to Firebase authorized domains
- [ ] CORS updated in backend
- [ ] Test login functionality
- [ ] Test expense submission
- [ ] Test image upload to Cloudinary
- [ ] Test all three dashboards (Employee, Approver, Admin)

---

## Alternative: Both on Vercel (Serverless)

If you want everything on Vercel, you'll need to convert the Express backend to serverless functions. Let me know if you prefer this approach!

---

## Free Tier Limits

**Render Free Tier:**
- 750 hours/month
- Spins down after 15 mins of inactivity
- First request may take 30 seconds (cold start)

**Vercel Free Tier:**
- 100GB bandwidth/month
- Unlimited deployments
- Perfect for frontend

**Total Cost: $0** ✅
