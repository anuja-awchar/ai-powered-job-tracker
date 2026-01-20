# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Clone Repository
```bash
git clone https://github.com/anuja-awchar/ai-powered-job-tracker.git
cd ai-job-tracker
```

### Step 2: Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend (in another terminal)
cd frontend
npm install
```

### Step 3: Set Up Environment Variables

**Backend** (`backend/.env.local`):
```
PORT=3001
NODE_ENV=development
OPENAI_API_KEY=sk-your-key-here
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-change-in-prod
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```
VITE_API_URL=http://localhost:3001/api
```

### Step 4: Start Services

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
# Server running at http://localhost:3001
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
# App running at http://localhost:3000
```

### Step 5: Open Browser
Navigate to **http://localhost:3000**

## 📝 Default Test User
- Email: `test@example.com`
- Password: `password123`
- (You can register new accounts too!)

## 🔑 Get API Keys

### OpenAI
1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Paste in `OPENAI_API_KEY`

### Redis (Optional - for production)
1. Go to https://upstash.com
2. Create free Redis database
3. Copy connection URL
4. Use as `REDIS_URL`

## ⚡ Key Features to Try

### 1. Register & Login
Create a new account or login

### 2. Upload Resume
- Upload a PDF or TXT resume
- System extracts text automatically

### 3. Browse Jobs
- See job feed with AI match scores
- Filter by type, location, mode
- Color badges show match quality

### 4. Apply to Jobs
- Click "Apply Now" → opens job link
- Return to app → smart popup confirms
- Application tracked automatically

### 5. Track Applications
- View all your applications
- Update status: Applied → Interview → Offer
- See timeline of actions

### 6. Chat with AI
- Right sidebar has AI assistant
- Ask: "Show me remote React jobs"
- Get filtered recommendations

## 📱 Responsive Design
Works perfectly on:
- Desktop (1920px+)
- Tablet (768px+)
- Mobile (320px+)

## 🛠️ Troubleshooting

**Backend won't start?**
```bash
# Check port 3001 is free
netstat -ano | findstr :3001
# Kill process if needed, or change PORT in .env
```

**Redis not connecting?**
```bash
# Make sure Redis is running
redis-cli ping
# Should return: PONG
```

**Frontend can't reach backend?**
- Check backend is running on port 3001
- Verify CORS_ORIGIN in backend .env
- Check VITE_API_URL in frontend .env

**OpenAI errors?**
- Verify API key is correct
- Check account has credits
- Ensure API key starts with `sk-`

## 📚 Documentation

Read these for more info:
- **README.md** - Full project documentation
- **DEPLOYMENT.md** - Deploy to production
- **PROJECT_SUMMARY.md** - Project overview

## 🚢 Deploy to Production

### Option 1: Railway (Recommended)
```bash
npm install -g @railway/cli
railway login
cd backend
railway link
railway up
```

### Option 2: Vercel (Frontend)
```bash
npm install -g vercel
cd frontend
vercel
```

See DEPLOYMENT.md for complete instructions.

## 💡 Tips

1. **Test with multiple jobs** - Create several applications to see timeline
2. **Try different filters** - Combine multiple filters for better results
3. **Upload a real resume** - Better AI matching with actual resume
4. **Use chat** - Ask AI questions about jobs
5. **Check mobile** - Responsive design works great on phones

## 🎯 Next Steps

1. Get an OpenAI API key
2. Set up Redis (or use Upstash)
3. Start backend and frontend
4. Create account and upload resume
5. Browse jobs with AI matching
6. Deploy to production!

## ❓ Questions?

Check the docs:
- Architecture: See README.md
- Deployment: See DEPLOYMENT.md
- Project Info: See PROJECT_SUMMARY.md
- Code: Explore src/ folders

---

**Happy job hunting! 🎉**
