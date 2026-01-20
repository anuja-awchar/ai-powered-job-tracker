# Deployment Guide

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Redis running locally or Upstash account
- OpenAI API key

### Step 1: Start Redis
```bash
# Option A: Local Redis
redis-server

# Option B: Use Upstash (cloud Redis)
# Get REDIS_URL from https://upstash.com
```

### Step 2: Start Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your keys
npm run dev
```

Backend runs on `http://localhost:3001`

### Step 3: Start Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## Production Deployment

### Option 1: Railway (Backend) + Vercel (Frontend)

#### Deploy Backend to Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy Backend**
   ```bash
   cd backend
   npm install -g @railway/cli
   railway login
   railway link
   railway up
   ```

3. **Set Environment Variables in Railway**
   ```
   PORT=3001
   NODE_ENV=production
   OPENAI_API_KEY=sk-...
   REDIS_URL=redis://your-upstash-redis-url
   JWT_SECRET=generate-strong-secret
   CORS_ORIGIN=https://your-vercel-domain.vercel.app
   ```

4. **Get Backend URL**
   - From Railway dashboard, copy your service URL
   - Format: `https://your-service-xyz.railway.app`

#### Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Deploy Frontend**
   ```bash
   cd frontend
   npm install -g vercel
   vercel
   ```

3. **Set Environment Variables in Vercel Dashboard**
   ```
   VITE_API_URL=https://your-backend-url/api
   ```

4. **Your Live App**
   - Frontend: `https://your-project-name.vercel.app`
   - Backend API: `https://your-service-xyz.railway.app`

### Option 2: Heroku (Backend) + Netlify (Frontend)

#### Deploy to Heroku
```bash
cd backend
heroku login
heroku create your-app-name
heroku config:set OPENAI_API_KEY=sk-...
heroku config:set REDIS_URL=redis://...
git push heroku main
```

#### Deploy to Netlify
```bash
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

### Option 3: Docker + Any Cloud Provider

#### Create Dockerfile for Backend
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src ./src
EXPOSE 3001
CMD ["node", "src/server.js"]
```

#### Build and Push
```bash
docker build -t ai-job-tracker-backend .
docker tag ai-job-tracker-backend your-registry/ai-job-tracker-backend:latest
docker push your-registry/ai-job-tracker-backend:latest
```

---

## Setting Up External Services

### 1. Get OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy to your `.env` or environment variables

### 2. Set Up Redis (Upstash)
1. Go to https://upstash.com
2. Create a new database
3. Copy the connection URL
4. Add to `REDIS_URL` environment variable

### 3. Configure CORS
Update `CORS_ORIGIN` to match your frontend URL:
- Local: `http://localhost:3000`
- Production: `https://your-domain.vercel.app`

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows
```

### Redis connection failed
```bash
# Verify Redis is running
redis-cli ping
# Should return: PONG
```

### API calls return 404
- Check CORS_ORIGIN matches frontend URL
- Verify backend is actually running
- Check network tab in browser DevTools

### OpenAI API returns 401
- Verify API key is correct
- Check key has funds/quota available
- Ensure key starts with `sk-`

---

## Monitoring & Scaling

### Monitor Application
- Railway: Dashboard > Services > Logs
- Vercel: Deployments > Logs
- Upstash: Dashboard > Metrics

### Scaling Considerations
- **Horizontal**: Add more Fastify instances behind load balancer
- **Vertical**: Increase Railway/Heroku dyno size
- **Cache**: Use Redis more aggressively
- **API Limits**: Implement rate limiting (100 req/min per user)

---

## Security Checklist

- [ ] Never commit `.env` file
- [ ] Use strong JWT_SECRET (64+ characters)
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Set CORS_ORIGIN to production domain only
- [ ] Monitor API key usage on OpenAI dashboard
- [ ] Use environment variables for all secrets
- [ ] Enable Redis authentication if available
- [ ] Implement rate limiting in production

---

## Rollback Procedure

### Railway
```bash
railway disable # Disable current service
railway up     # Deploy previous version
```

### Vercel
- Dashboard > Deployments > Select previous > Redeploy

### Manual Rollback
```bash
git revert <commit-hash>
git push origin main
# Redeploy through your service
```
