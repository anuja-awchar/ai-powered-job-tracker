import OpenAI from 'openai';
import { getRedisClient } from './redis.js';

const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export const calculateJobMatchScore = async (jobData, resumeText) => {
  const cacheKey = `match:${jobData.id}:${Buffer.from(resumeText).toString('base64').substring(0, 20)}`;
  
  // Check cache first
  const redis = getRedisClient();
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // If OpenAI not available, return mock score for development
  if (!openai) {
    const mockScore = Math.floor(Math.random() * 40) + 50; // 50-90 range
    const mockResult = {
      score: mockScore,
      keyMatches: ['Development Mode', 'Mock scoring', 'Real API needed for production'],
      missingSkills: [],
      explanation: 'Mock score - add valid OPENAI_API_KEY to .env.local for real scoring',
    };
    // Cache for 1 hour
    await redis.setEx(cacheKey, 3600, JSON.stringify(mockResult));
    return mockResult;
  }

  const prompt = `
You are an expert recruiter analyzing job compatibility. Score how well a resume matches a job posting.

JOB POSTING:
Title: ${jobData.title}
Company: ${jobData.company}
Description: ${jobData.description}
Required Skills: ${jobData.required_skills?.join(', ') || 'Not specified'}
Job Type: ${jobData.job_type}
Location: ${jobData.location}

RESUME:
${resumeText.substring(0, 2000)}

Provide a JSON response with:
{
  "score": number (0-100),
  "keyMatches": [string], // 3-4 key matching areas
  "missingSkills": [string], // Key missing skills if any
  "explanation": string // 1-2 sentence summary
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      score: 50,
      keyMatches: ['Unable to parse response'],
      missingSkills: [],
      explanation: 'Scoring in progress',
    };

    // Cache for 24 hours
    await redis.setEx(cacheKey, 86400, JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('Error calculating match score:', error);
    return {
      score: 0,
      keyMatches: [],
      missingSkills: [],
      explanation: 'Error calculating match score',
    };
  }
};

export const generateChatResponse = async (userMessage, jobsContext, resumeContext) => {
  const prompt = `
You are a helpful job search assistant. Help users find jobs and answer questions about the job search process.

Current User's Resume Summary:
${resumeContext.substring(0, 500)}

Available Jobs Context:
${JSON.stringify(jobsContext.slice(0, 5), null, 2)}

User Question: ${userMessage}

Provide a helpful, concise response (2-3 sentences max). If referring to specific jobs, mention the title and company.
`;

  try {
    // If OpenAI not available, return mock response for development
    if (!openai) {
      return `Thanks for your question! In development mode with mock responses. Add a valid OPENAI_API_KEY to .env.local for real AI responses. Your question: "${userMessage.substring(0, 50)}..."`;
    }

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating chat response:', error);
    return 'I encountered an error processing your request. Please try again.';
  }
};
