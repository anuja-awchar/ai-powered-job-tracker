# AI-Powered Job Tracker

An intelligent job tracking system that fetches jobs from external APIs, intelligently tracks application status, and uses AI to match jobs with user's resume.

## 🎯 Features

### Core Features
- **Job Feed & External Integration**: Fetch and display jobs in a clean feed with filtering
- **Resume Upload**: Upload and update resume (PDF/TXT support)
- **AI-Powered Job Matching**: Automatic scoring of jobs against user's resume
- **Smart Application Tracking**: Popup confirmation when returning to app after applying
- **AI Sidebar Assistant**: Chat interface for intelligent job filtering and recommendations

### Filters Available
- 🔍 Role/Title: Search by job title
- 💼 Job Type: Full-time, Part-time, Contract, Internship
- 🏢 Work Mode: Remote, Hybrid, On-site
- 📍 Location: City/region filter
- ⭐ Match Score: High (>70%), Medium (40-70%), All
- 📅 Date Posted: Last 24 hours, Last week, Last month, Any time

### Smart Features
- ✅ Color-coded match badges (Green >70%, Yellow 40-70%, Gray <40%)
- ✅ "Best Matches" section at top with 6-8 highest scoring jobs
- ✅ Key skills and experience alignment explanation
- ✅ Application timeline tracking
- ✅ Status updates: Applied → Interview → Offer/Rejected

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Client (React Frontend)                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Auth | JobFeed | Applications | Resume Upload           │   │
│  │  ├─ Login/Register                                       │   │
│  │  ├─ Job Cards with Match Scores                          │   │
│  │  ├─ Filters & Search                                     │   │
│  │  └─ AI Chat Sidebar                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↕ HTTP/REST                           │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│             API Server (Node.js + Fastify)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Routes & Controllers                                     │   │
│  │ ├─ /api/auth (login, register, profile)                │   │
│  │ ├─ /api/jobs (feed, search, filters)                   │   │
│  │ ├─ /api/applications (CRUD, status updates)            │   │
│  │ ├─ /api/resume (upload, update, delete)                │   │
│  │ └─ /api/chat (AI conversations)                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↕                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Services & Utilities                                     │   │
│  │ ├─ AI Matching Service (GPT-4o-mini)                   │   │
│  │ ├─ Job Data Processing                                 │   │
│  │ └─ Authentication/Authorization                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↕                                      │
└─────────────────────────────────────────────────────────────────┘
         │                         │                    │
         ↓                         ↓                    ↓
    ┌─────────┐          ┌──────────────┐      ┌──────────────┐
    │  Redis  │          │ OpenAI API   │      │  Job APIs    │
    │ Storage │          │ (Matching &  │      │ (Adzuna,     │
    │ (Cache) │          │  Chat)       │      │  JSearch)    │
    └─────────┘          └──────────────┘      └──────────────┘
```

## 🔄 Data Flow

### 1. Job Matching Process
```
User Resume → AI Service → Job Data
              ↓
         Calculate Score (0-100%)
              ↓
         Color Badge Assignment
         (Green/Yellow/Gray)
              ↓
         Cache Result (24h)
              ↓
         Display on Job Card
```

### 2. Application Tracking Flow
```
User Clicks "Apply"
    ↓
Job Opens in New Tab
    ↓
User Returns to App
    ↓
Smart Popup: "Did you apply?"
    ↓ Yes
Application Recorded with Timestamp
    ↓
Status Tracked: Applied → Interview → Offer/Rejected
```

### 3. AI Chat Flow
```
User Message → Backend API
    ↓
AI Service Receives:
  - User's Resume Context
  - Current Jobs Context
  - User Query
    ↓
Generate Smart Response
    ↓
Return Filtered Jobs/Recommendations
    ↓
Cache Conversation History (1 day)
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Redis (local or Upstash cloud)
- OpenAI API key

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Configure Environment Variables**
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
PORT=3001
NODE_ENV=development
OPENAI_API_KEY=sk-...
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000
```

3. **Run Server**
```bash
npm run dev
```

Server runs on `http://localhost:3001`

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Configure Environment Variables**
```bash
cp .env.example .env
```

3. **Run Development Server**
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

### Deployment (Vercel + Railway)

**Backend (Railway):**
```bash
cd backend
railway link
railway up
```

**Frontend (Vercel):**
```bash
cd frontend
vercel
```

Set environment variables in Vercel dashboard pointing to your Railway backend URL.

## 🤖 AI Matching Logic

### Match Score Calculation

The AI matching system uses OpenAI's GPT-4o-mini model to analyze:

1. **Job Requirements Analysis**
   - Required skills extraction
   - Experience level requirements
   - Technical stack analysis

2. **Resume Analysis**
   - Skill identification
   - Experience level assessment
   - Key achievements matching

3. **Scoring Factors**
   - Direct skill matches (40%)
   - Experience alignment (30%)
   - Industry/company culture fit (20%)
   - Additional qualifications (10%)

### Efficiency Considerations
- **Caching**: Results cached for 24 hours to minimize API calls
- **Batch Processing**: Multiple jobs processed efficiently
- **Lazy Loading**: Scores calculated on-demand for visible jobs first
- **Cost Optimization**: Using GPT-4o-mini for faster, cheaper processing

### Example Response
```json
{
  "score": 85,
  "keyMatches": [
    "5+ years React experience",
    "Node.js backend knowledge",
    "TypeScript proficiency"
  ],
  "missingSkills": ["GraphQL"],
  "explanation": "Strong match with excellent React expertise and relevant backend experience"
}
```

## 🎯 Critical Thinking: Popup Flow Design

### Design Decision: Smart Application Detection
When users click "Apply", the job opens in a new tab. Upon returning to the app, a popup confirms:
> "Did you apply to [Job Title] at [Company]?"

### Why This Approach?

1. **Privacy Respecting**: We can't track external site activities (same-origin policy)
2. **Accurate Tracking**: User explicitly confirms rather than guessing
3. **User-Friendly**: Non-intrusive confirmation only when returning
4. **Flexible**: Options for different user intents

### Edge Cases Handled
- ✅ User applies and returns immediately → Confirmation popup shows
- ✅ User navigates away and returns later → Popup still shows (in sessionStorage)
- ✅ User cancels without applying → "Just browsing" option
- ✅ User applied previously → "Applied Earlier" option for updates
- ✅ Multiple tabs → Each job tracked independently

### Alternatives Considered
| Approach | Pros | Cons |
|----------|------|------|
| **Current (Popup)** | Private, accurate, flexible | Requires user confirmation |
| Auto-track clicks | Automatic, seamless | Inaccurate, privacy concerns |
| Browser extension | Precise tracking | Complex, UX intrusive |
| Open job in iframe | Contained, trackable | Job sites block iframes |

## 📊 Scalability Analysis

### Handling 100 Jobs at Once
- **Match Score Calculation**: Parallel processing with Promise.all()
- **Batch API Calls**: Group scores calculation into batches of 10
- **Caching Strategy**: Multi-level caching (24h Redis, 5min in-memory)
- **Database Indexing**: Index on userId, jobId for quick lookups

### Handling 10,000 Users
- **Load Distribution**: Horizontal scaling with multiple Fastify instances
- **Redis Clustering**: Use Upstash Redis for auto-scaling
- **Database Sharding**: Shard by userId for distributed data
- **API Rate Limiting**: 1000 requests/hour per user
- **Job Queue**: Background processing for bulk operations

### Performance Optimization
```
Job Load Times:
- Best case: 200ms (cached scores)
- Typical case: 500ms (fresh scores)
- Worst case: 2s (all jobs new)

Memory Usage:
- Per user: ~2MB (resume + cache)
- Per 10k users: ~20GB (manageable)

API Costs:
- Matching: $0.0015 per job score (GPT-4o-mini)
- 100 jobs = $0.15
- 10k users × 10 jobs/day = $1,500/day
```

### Scaling Architecture
```
Load Balancer
    ↓
[Fastify 1] [Fastify 2] [Fastify 3]
    ↓           ↓           ↓
  Redis Cluster (Upstash)
    ↓
Database Replicas
```

## 🔧 Tradeoffs & Future Improvements

### Known Limitations
| Limitation | Impact | Future Solution |
|-----------|--------|-----------------|
| Mock job data | Not real jobs | Integrate Adzuna/JSearch API |
| Single resume per user | Limited flexibility | Multiple resume versions |
| In-memory storage | Data loss on restart | Persistent database (MongoDB/PostgreSQL) |
| No background jobs | Synchronous processing | Bull queue for async tasks |
| Basic auth | Low security | OAuth 2.0, 2FA, JWT refresh |

## 📝 License

MIT

## 👤 Author

Built as a demonstration of AI-powered job tracking.

---
**GitHub**: https://github.com/anuja-awchar/ai-powered-job-tracker
