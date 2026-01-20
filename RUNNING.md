# 🚀 Project Running - Quick Start

## ✅ Both Servers Are Running!

```
🔵 FRONTEND (React + Vite)
   → http://localhost:3000
   Status: Running ✅
   
🟢 BACKEND (Node.js + Fastify)
   → http://localhost:3001/api
   Health Check: http://localhost:3001/health
   Status: Running ✅
```

## 📝 First Steps

1. **Open the app**: http://localhost:3000
2. **Register a new account** with email and password
3. **Upload a sample resume** (PDF or TXT)
4. **View the job feed** with AI match scores
5. **Apply to jobs** and track applications
6. **Chat with the AI assistant** for job advice

## 🔧 Development Mode Features

### What's Working:
- ✅ User authentication (register/login/logout)
- ✅ Resume upload & management
- ✅ Job feed with filters
- ✅ **Mock AI scoring** (50-90% range) - add real OpenAI key for production
- ✅ Application tracking
- ✅ Chat sidebar (mock responses)
- ✅ In-memory caching (no Redis needed for dev)

### What to Note:
- 🟡 **AI Scoring**: Using mock scores (50-90%) since OpenAI key not configured
  - To use real AI: Add `OPENAI_API_KEY=sk-...` to `backend/.env.local`
- 🟡 **Caching**: Using in-memory cache since Redis not running
  - To use Redis: Start Redis on `localhost:6379` or set `REDIS_URL`
- ✅ **Session Storage**: Working (tracks pending applications)
- ✅ **Error Handling**: Complete with user-friendly messages

## 🛑 To Stop The Project

1. In backend terminal: Press `Ctrl+C`
2. In frontend terminal: Press `Ctrl+C`

## 📚 API Endpoints (from Postman/cURL)

### Register
```bash
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!",
  "name": "Test User"
}
```

### Login
```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!"
}
# Returns: { token, userId }
```

### Get Jobs
```bash
GET http://localhost:3001/api/jobs/feed?userId=USER_ID
Authorization: Bearer TOKEN
```

## 💡 Pro Tips

1. **Try all features**: Register → Upload resume → Browse jobs → Apply → Track
2. **Check browser console**: `F12` → Console tab for any frontend errors
3. **Check terminal logs**: Watch both server terminals for API calls
4. **Open DevTools**: F12 to see network requests and responses
5. **Test responsive design**: Use DevTools to test mobile/tablet sizes

## 🎨 Features to Explore

1. **Job Filters** - Try filtering by experience level, salary, employment type
2. **Match Scores** - See AI match scores (mock: 50-90%)
3. **Smart Popup** - Apply to a job, then navigate to another page and back
4. **Chat Sidebar** - Talk to the AI assistant (mock responses in dev mode)
5. **Application Timeline** - Track all your applications

## 📞 Troubleshooting

**Issue**: "Cannot connect to API"
- Check: Backend terminal shows "🚀 Server running at http://localhost:3001"
- Fix: Restart backend with `npm start`

**Issue**: "Login fails"
- Check: Backend terminal for errors
- Try: Register a new account first

**Issue**: "Jobs won't load"
- Check: Backend is running
- Try: Refresh the page (F5)
- Note: Using mock data for demo

**Issue**: Page is blank
- Check: Frontend terminal shows "Vite... ready"
- Try: Clear browser cache (Ctrl+Shift+Delete)
- Fix: Refresh with F5

## 🎉 You're All Set!

The AI Job Tracker is now running in development mode. The app is fully functional with mock AI scoring and in-memory caching. For production use, configure real OpenAI keys and Redis.

**Frontend**: http://localhost:3000 ✅
**Backend**: http://localhost:3001 ✅
**Status**: 🟢 RUNNING

Enjoy exploring the app! 🚀
