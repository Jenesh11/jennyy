# Deploying JENNY Store to Vercel

## ✅ Your Frontend is Ready!

Your Next.js frontend is **already configured** and ready to deploy to Vercel!

---

## 🚀 Deployment Steps

### Step 1: Push to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial commit - JENNY clothing store"
   ```

2. **Create a GitHub repository**:
   - Go to https://github.com/new
   - Create a new repository (e.g., `jenny-store`)
   - Don't initialize with README (we already have one)

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/jenny-store.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** with your GitHub account
3. **Click "Add New Project"**
4. **Import your GitHub repository**:
   - Select `jenny-store` from the list
   - Click "Import"

5. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (or leave default)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)

6. **Add Environment Variable**:
   - Click "Environment Variables"
   - Add:
     - **Name**: `NEXT_PUBLIC_MEDUSA_BACKEND_URL`
     - **Value**: Your Medusa backend URL
       - For testing: `http://localhost:9000` (won't work in production)
       - For production: Your deployed Medusa URL (see below)

7. **Click "Deploy"**

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? jenny-store
# - Directory? ./
# - Override settings? No

# Add environment variable
vercel env add NEXT_PUBLIC_MEDUSA_BACKEND_URL
# Enter your Medusa backend URL when prompted

# Deploy to production
vercel --prod
```

---

## 🔧 Deploying Your Medusa Backend

Your frontend needs a **publicly accessible Medusa backend**. Here are your options:

### Option 1: Railway (Recommended - Easy)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your backend repository
4. Add environment variables:
   - `DATABASE_URL` - PostgreSQL connection string (Railway provides this)
   - `JWT_SECRET` - Your secret key
   - `COOKIE_SECRET` - Your secret key
5. Deploy!

Railway will give you a URL like: `https://your-app.railway.app`

### Option 2: Heroku

1. Install Heroku CLI
2. Create a new app:
   ```bash
   cd backend
   heroku create jenny-backend
   heroku addons:create heroku-postgresql:mini
   git push heroku main
   ```

### Option 3: DigitalOcean App Platform

1. Go to https://cloud.digitalocean.com/apps
2. Create new app from GitHub
3. Configure environment variables
4. Deploy

### Option 4: Self-Hosted (VPS)

Deploy to any VPS (DigitalOcean, AWS, etc.) with:
- Node.js
- PostgreSQL
- Nginx (reverse proxy)

---

## 🌐 Update Frontend with Backend URL

Once your Medusa backend is deployed:

1. **Get your backend URL** (e.g., `https://jenny-backend.railway.app`)

2. **Update Vercel environment variable**:
   - Go to your Vercel project dashboard
   - Settings → Environment Variables
   - Update `NEXT_PUBLIC_MEDUSA_BACKEND_URL` with your backend URL
   - Redeploy

3. **Or update via CLI**:
   ```bash
   vercel env add NEXT_PUBLIC_MEDUSA_BACKEND_URL production
   # Enter your backend URL
   vercel --prod
   ```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Frontend loads at your Vercel URL
- [ ] Products display correctly (if added to Medusa)
- [ ] Navigation works
- [ ] Images load properly
- [ ] Mobile responsive design works
- [ ] Cart functionality works
- [ ] API calls to Medusa backend succeed

---

## 🎯 Your Deployment URLs

After deployment, you'll have:

- **Frontend**: `https://jenny-store.vercel.app` (or your custom domain)
- **Backend**: `https://your-backend-url.com`
- **Admin Panel**: `https://your-backend-url.com/app`

---

## 🔒 Security Notes

### CORS Configuration

Update your Medusa backend's `.env` to allow your Vercel domain:

```env
STORE_CORS=https://jenny-store.vercel.app
ADMIN_CORS=https://jenny-store.vercel.app
```

### Environment Variables

**Never commit** `.env.local` to Git! It's already in `.gitignore`.

---

## 🚨 Common Issues

### Issue: "Failed to fetch products"
**Solution**: Check that `NEXT_PUBLIC_MEDUSA_BACKEND_URL` is set correctly and your backend is accessible.

### Issue: CORS errors
**Solution**: Update `STORE_CORS` in your Medusa backend to include your Vercel URL.

### Issue: Images not loading
**Solution**: Ensure image URLs from Medusa are publicly accessible.

### Issue: Build fails on Vercel
**Solution**: 
- Check build logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

---

## 📊 Performance Optimization

Vercel automatically provides:
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Image optimization
- ✅ Edge caching
- ✅ Analytics

---

## 🎉 You're All Set!

Your Next.js frontend is **production-ready** and optimized for Vercel deployment. Just push to GitHub and deploy!

**Need help?** Check out:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Medusa Documentation](https://docs.medusajs.com)
