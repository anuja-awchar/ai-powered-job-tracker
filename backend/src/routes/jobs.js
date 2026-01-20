import axios from 'axios';
import { getRedisClient } from '../utils/redis.js';
import { calculateJobMatchScore } from '../utils/ai.js';

// Mock job data for testing (replace with real API integration)
const mockJobs = [
  {
    id: 'job_1',
    title: 'Senior React Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    description: 'We are looking for an experienced React developer with 5+ years of experience...',
    job_type: 'Full-time',
    work_mode: 'Remote',
    posted_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    required_skills: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
    link: 'https://example.com/job1',
  },
  {
    id: 'job_2',
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'New York, NY',
    description: 'Seeking full stack engineer comfortable with modern tech stack...',
    job_type: 'Full-time',
    work_mode: 'Hybrid',
    posted_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    required_skills: ['JavaScript', 'Node.js', 'React', 'MongoDB'],
    link: 'https://example.com/job2',
  },
  {
    id: 'job_3',
    title: 'Python Developer',
    company: 'DataAI Inc',
    location: 'Remote',
    description: 'Join our data science team working on ML projects...',
    job_type: 'Full-time',
    work_mode: 'Remote',
    posted_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    required_skills: ['Python', 'Machine Learning', 'TensorFlow'],
    link: 'https://example.com/job3',
  },
];

export default async function jobRoutes(fastify) {
  // Get all jobs with filters
  fastify.get('/feed', async (request, reply) => {
    const {
      userId,
      title,
      skills,
      jobType,
      workMode,
      location,
      dateRange,
      matchScoreFilter,
    } = request.query;

    if (!userId) {
      return reply.status(400).send({ error: 'userId required' });
    }

    const redis = getRedisClient();
    let jobs = [...mockJobs];

    // Apply filters
    if (title) {
      jobs = jobs.filter(j => j.title.toLowerCase().includes(title.toLowerCase()));
    }

    if (jobType) {
      jobs = jobs.filter(j => j.job_type === jobType);
    }

    if (workMode) {
      jobs = jobs.filter(j => j.work_mode === workMode);
    }

    if (location) {
      jobs = jobs.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));
    }

    // Get user's resume for matching
    const resumeKey = `resume:${userId}`;
    const resumeText = await redis.get(resumeKey) || 'No resume uploaded yet';

    // Calculate match scores for each job
    const jobsWithScores = await Promise.all(
      jobs.map(async job => {
        const scoreData = await calculateJobMatchScore(job, resumeText);
        return {
          ...job,
          matchScore: scoreData.score,
          keyMatches: scoreData.keyMatches,
          missingSkills: scoreData.missingSkills,
          explanation: scoreData.explanation,
        };
      })
    );

    // Apply match score filter
    let filteredJobs = jobsWithScores;
    if (matchScoreFilter) {
      if (matchScoreFilter === 'high') {
        filteredJobs = filteredJobs.filter(j => j.matchScore > 70);
      } else if (matchScoreFilter === 'medium') {
        filteredJobs = filteredJobs.filter(j => j.matchScore >= 40 && j.matchScore <= 70);
      }
    }

    // Sort by match score
    filteredJobs.sort((a, b) => b.matchScore - a.matchScore);

    // Get best matches (top 6-8)
    const bestMatches = filteredJobs.slice(0, 8);

    return reply.send({
      total: filteredJobs.length,
      bestMatches,
      allJobs: filteredJobs,
    });
  });

  // Get single job
  fastify.get('/:jobId', async (request, reply) => {
    const { jobId } = request.params;
    const job = mockJobs.find(j => j.id === jobId);

    if (!job) {
      return reply.status(404).send({ error: 'Job not found' });
    }

    return reply.send(job);
  });

  // Search jobs (simple search)
  fastify.get('/search/query', async (request, reply) => {
    const { userId, query } = request.query;

    if (!userId || !query) {
      return reply.status(400).send({ error: 'userId and query required' });
    }

    const redis = getRedisClient();
    let jobs = mockJobs;

    // Simple search across multiple fields
    const lowerQuery = query.toLowerCase();
    jobs = jobs.filter(j =>
      j.title.toLowerCase().includes(lowerQuery) ||
      j.company.toLowerCase().includes(lowerQuery) ||
      j.description.toLowerCase().includes(lowerQuery) ||
      j.required_skills?.some(s => s.toLowerCase().includes(lowerQuery))
    );

    // Get user's resume for matching
    const resumeKey = `resume:${userId}`;
    const resumeText = await redis.get(resumeKey) || 'No resume uploaded yet';

    // Calculate match scores
    const jobsWithScores = await Promise.all(
      jobs.map(async job => {
        const scoreData = await calculateJobMatchScore(job, resumeText);
        return {
          ...job,
          matchScore: scoreData.score,
          keyMatches: scoreData.keyMatches,
          missingSkills: scoreData.missingSkills,
          explanation: scoreData.explanation,
        };
      })
    );

    jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    return reply.send({
      query,
      total: jobsWithScores.length,
      jobs: jobsWithScores,
    });
  });
}
