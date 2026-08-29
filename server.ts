import webpush from "web-push";
import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import type { StudentInput } from './src/types.js';

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  console.log(`[Express] Received request: ${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// System Prompt for AI Engine as specified in user guidelines
const SYSTEM_PROMPT = `
You are an expert Educational Psychologist and AI Adaptive Study Coach for Egyptian school and high school students (covering both المرحلة الإعدادية and المرحلة الثانوية - علمي وأدبي).
Analyze the student's input data, educational stage, grade year, and performance state from the Questions Page and generate a highly personalized, adaptive, situation-aware result.
IMPORTANT: ALL text fields in the output JSON (diagnosis, whyThisPlan, todaysGoal, studyPlan titles, focusTypes, notes, priorities, smartTips, motivationalMessage, adaptiveInsights) MUST be in fluent, natural, empathetic ARABIC tailored to their specific educational stage and target goal.

---
Inputs to analyze:
- Psychological state
- Focus level (1-5)
- Stress level (1-5)
- Available study hours
- Presence of an upcoming exam
- Study subjects & Subject Tasks
- Subject Mastery Levels (weak / medium / strong for each subject)
- Difficult subjects
- Peak productivity time (morning / evening / night)
- Student preference (understanding / memorization / practice)
- Preference for strict or flexible plan

---
ADAPTIVE ENGINE RULES:
1. Increase frequency and duration allocated to WEAK subjects (🔴 ضعيف): schedule deep study/explanation & heavy practice for them, place them during peak productivity hours.
2. Reduce repetition and duration of STRONG subjects (🟢 قوي): schedule brief, fast-paced revision & high-yield exam question sessions to avoid wasting energy.
3. BEFORE EXAMS (if upcoming exam is tomorrow, in a few days, or next week): Shift focus strictly away from passive reading towards 100% past exam practice, solving questions, and quick formula review.
4. Dynamic Schedule Variation (Interleaving): Do NOT repeat the same subject in adjacent sessions. Interleave subjects (e.g. Math -> Physics practice -> Arabic review -> Chemistry) to boost long-term memory retention and avoid monotonous daily schedules.
5. Provide adaptiveTags for sessions (e.g., "🔴 مادة ضعيفة: تكثيف الشرح والحل" | "🟢 مادة قوية: مراجعة خاطفة" | "🎯 تركيز امتحان: حل تدريبات").

---
Output Structure (ALL TEXT IN ARABIC):
- scenario: Exactly one of "Last Night", "Extremely Pressured", "Limited Time", "Regaining Control"
- diagnosis: A precise, empathetic diagnosis of student status in Arabic.
- whyThisPlan: Explain how the plan adaptively balances weak vs strong subjects and exam preparation.
- todaysGoal: A clear, inspiring daily goal in Arabic.
- studyPlan: Array of session objects:
  * id: string
  * title: session title in Arabic
  * subject: subject name in Arabic
  * durationMinutes: integer duration (e.g., 30-90m based on mastery & energy)
  * breakMinutes: break duration
  * focusType: specific method in Arabic
  * priority: "high" | "medium" | "low"
  * notes: concise execution advice
  * adaptiveTag: short badge string in Arabic explaining the adaptive choice
- priorities: Array of strings in Arabic
- smartTips: Array of situation-specific tips in Arabic
- motivationalMessage: Empathetic motivational message in Arabic
- adaptiveInsights: Array of 2-4 strings in Arabic summarizing how the adaptive engine tailored the plan.
`;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: 'gemini-3.6-flash' });
});

// Cache for prayer times: key: `${city}_${dateStr}`
const prayerTimesCache = new Map<string, { timestamp: number; data: any }>();

// Prayer Times Endpoint using Aladhan API for Egypt (Africa/Cairo timezone & Egyptian Survey Authority method 5)
app.get('/api/prayer-times', async (req, res) => {
  try {
    const city = (req.query.city as string) || 'Cairo';
    const country = (req.query.country as string) || 'Egypt';

    // Get current date string in Africa/Cairo
    const now = new Date();
    const cairoDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
    const cacheKey = `${city.toLowerCase()}_${cairoDateStr}`;

    const cached = prayerTimesCache.get(cacheKey);
    // Cache valid for 6 hours
    if (cached && Date.now() - cached.timestamp < 6 * 60 * 60 * 1000) {
      res.json(cached.data);
      return;
    }

    const apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=5`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Aladhan API responded with status ${response.status}`);
    }

    const payload: any = await response.json();
    if (payload.code === 200 && payload.data) {
      prayerTimesCache.set(cacheKey, { timestamp: Date.now(), data: payload.data });
      res.json(payload.data);
      return;
    }

    throw new Error('Invalid response structure from Aladhan API');
  } catch (err: any) {
    console.error('Error fetching prayer times from Aladhan:', err.message);
    res.status(502).json({
      error: 'PRAYER_TIMES_FETCH_FAILED',
      message: err.message,
    });
  }
});

// AI Study Coach Route
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, studentContext } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({ error: 'GEMINI_API_KEY_MISSING', message: 'Gemini API key is not configured.' });
      return;
    }

    const studentName = studentContext?.name || 'يا بطل';
    const studentGoal = studentContext?.goalTitle || studentContext?.collegeName || 'كلية الأحلام';
    const gender = studentContext?.gender || 'female';
    const stage = studentContext?.stage === 'prep' ? 'المرحلة الإعدادية' : 'المرحلة الثانوية';
    const track = studentContext?.track ? (studentContext.track === 'scientific' ? 'شعبة علمي' : 'شعبة أدبي') : '';
    const grade = studentContext?.gradeLabel || studentContext?.grade || '';

    const coachSystemInstruction = `
# STUDENT SURVIVAL LAB — MASTER AI SYSTEM PROMPT

## ROLE
You are the Student Survival Lab AI Assistant. You are an intelligent, conversational academic assistant designed to help students learn, understand, plan, solve problems, and navigate the application.

Student Context:
- Student Name: ${studentName} (${gender === 'female' ? 'طالبة' : 'طالب'})
- Educational Stage: ${stage} ${track ? `(${track})` : ''} ${grade ? `- ${grade}` : ''}
- Target / Dream College / Goal: ${studentGoal}

## CAPABILITIES & FLEXIBILITY
You are a genuinely conversational AI. 
1. You can answer study questions, explain concepts (e.g., C++, Mathematics, Programming, AI, Data Science), help with assignments, plan study sessions, and provide motivation.
2. Maintain conversation context naturally. If a student asks a follow-up question, understand the context from previous messages.
3. Be flexible. You are NOT restricted to a small list of predefined intents. Handle unexpected or differently worded questions gracefully and intelligently.
4. If a question is outside the main educational purpose, provide a useful general answer if appropriate.
5. If you genuinely do not know something, be transparent instead of inventing information. Do not hallucinate facts.
6. If a question is ambiguous or lacks necessary details to give a good answer, ask a short, natural clarification question instead of returning a generic error.

## CONVERSATION STYLE & LANGUAGE
- Communicate naturally in Arabic by default (Student Survival Lab is an Arabic-first application).
- Understand and seamlessly blend Egyptian Arabic, Modern Standard Arabic, common student slang, abbreviations, and English technical terms.
- Adapt your response to the user's message.
  - If they ask for an explanation → explain clearly.
  - If they ask "why?" → explain the reasoning.
  - If they ask for an example → provide an example.
  - If they ask for a solution → solve it step by step.
  - If they ask a programming question → provide a clear explanation with code when appropriate.
  - If they are confused → simplify the explanation.
  - If they are stressed → respond supportively and practically.
- Never respond with a generic hardcoded fallback like "لم أفهم سؤالك" if you can deduce meaning or ask a clarifying question.

## STRESS & OVERWHELM
Use: ONE PROBLEM → ONE DECISION → ONE ACTION.
Reduce cognitive load.

Output Formatting: Keep responses well-structured, scannable, using clear bullet points and appropriate emojis. Make the reading experience comfortable, motivating, and immediately actionable.
`;

    // Map message history to Gemini API format, handling multimodal attachments
    const formattedContents = messages.map((m: any) => {
      const parts: any[] = [];
      
      // Add text part if present
      if (m.text && typeof m.text === 'string' && m.text.trim()) {
        parts.push({ text: m.text });
      }

      // Add attachments (images, PDFs) if present
      if (m.attachments && Array.isArray(m.attachments)) {
        for (const att of m.attachments) {
          if (att.data && att.mimeType) {
            // Strip data URL prefix if present (e.g. data:image/png;base64,...)
            const base64Clean = att.data.includes('base64,')
              ? att.data.split('base64,')[1]
              : att.data;
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: base64Clean,
              },
            });
          }
        }
      }

      // Fallback if parts is empty
      if (parts.length === 0) {
        parts.push({ text: '...' });
      }

      return {
        role: m.role === 'user' ? 'user' : 'model',
        parts,
      };
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: formattedContents,
      config: {
        systemInstruction: coachSystemInstruction,
        temperature: 0.7,
      },
    });

    if (!response.text) {
      throw new Error('Empty response from Gemini Coach.');
    }

    res.json({ reply: response.text.trim() });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({ error: 'CHAT_FAILED', message: err?.message || 'Coach is currently taking a short breath.' });
  }
});

// --- Smart Notification Engine ---
const subscriptions = new Map(); // Simple in-memory storage for push subscriptions
let activityLogs = [];

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:test@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

app.post('/api/notifications/subscribe', (req, res) => {
  const subscription = req.body;
  // Use a dummy user ID for prototype
  const userId = 'user_123';
  subscriptions.set(userId, subscription);
  res.status(201).json({ status: 'subscribed' });
});

app.post('/api/notifications/activity', (req, res) => {
  const { userId = 'user_123', type, metadata } = req.body;
  activityLogs.push({ userId, type, metadata, timestamp: Date.now() });
  // Keep only last 50
  if (activityLogs.length > 50) activityLogs.shift();
  res.status(200).json({ status: 'logged' });
});

app.post('/api/notifications/trigger', async (req, res) => {
  const { userId = 'user_123', title, body } = req.body;
  const sub = subscriptions.get(userId);
  if (!sub) return res.status(404).json({ error: 'No subscription found' });
  
  try {
    await webpush.sendNotification(sub, JSON.stringify({ title, body }));
    res.status(200).json({ status: 'sent' });
  } catch (err) {
    console.error('Push error', err);
    res.status(500).json({ error: 'Failed to send' });
  }
});

// Smart AI Notification background worker (simulated)
setInterval(async () => {
  const sub = subscriptions.get('user_123');
  if (!sub || !getGeminiClient()) return;
  // In a real app, we would use Gemini to analyze activityLogs and decide whether to send a push.
  // For safety and cost in this prototype, we just log that the AI Engine checked.
  console.log('[Smart Notifications Engine] Checked user activity. Deeming optimal time is later to avoid fatigue.');
}, 60000); // Check every minute
// ---------------------------------

app.post('/api/generate-plan', async (req, res) => {
  try {
    const input: StudentInput = req.body;
    if (!input || !input.psychologicalState) {
      res.status(400).json({ error: 'Missing required student input data.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      console.warn('GEMINI_API_KEY not configured. Responding with client-side fallback flag.');
      res.status(503).json({ error: 'GEMINI_API_KEY_MISSING', message: 'Gemini API key is not configured.' });
      return;
    }

    const promptText = `
Student Data Input:
- Educational Stage: ${input.studentStage === 'prep' ? 'المرحلة الإعدادية' : 'المرحلة الثانوية'}
- Track: ${input.studentTrack ? (input.studentTrack === 'scientific' ? 'شعبة علمي' : 'شعبة أدبي') : 'غير محدد'}
- Grade / Year: ${input.studentGrade || 'الثانوية العامة'}
- Target Goal / College: ${input.targetGoal || 'كلية الأحلام'}
- Psychological State: ${input.psychologicalState}
- Focus Level (1-5): ${input.focusLevel}
- Stress Level (1-5): ${input.stressLevel}
- Available Study Hours: ${input.availableHours} hours
- Upcoming Exam: ${input.upcomingExam} ${input.examSubject ? `(Subject: ${input.examSubject})` : ''}
- All Subjects: ${input.subjects.join(', ')}
- Subject Mastery Levels (Weak/Medium/Strong): ${JSON.stringify(input.subjectMastery || {})}
- Difficult Subjects: ${input.difficultSubjects.join(', ')}
- Peak Productivity Time: ${input.peakTime}
- Learning Preference: ${input.learningPreference}
- Plan Preference: ${input.planPreference}
- Additional Notes: ${input.additionalNotes || 'None'}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenario: {
              type: Type.STRING,
              description: 'Must be one of "Last Night", "Extremely Pressured", "Limited Time", "Regaining Control"',
            },
            diagnosis: {
              type: Type.STRING,
              description: 'Precise and concise diagnosis of current student situation.',
            },
            whyThisPlan: {
              type: Type.STRING,
              description: 'Detailed explanation why this custom plan fits the student state.',
            },
            todaysGoal: {
              type: Type.STRING,
              description: 'A clear, actionable, achievable goal for today.',
            },
            studyPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  breakMinutes: { type: Type.INTEGER },
                  focusType: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  notes: { type: Type.STRING },
                  adaptiveTag: { type: Type.STRING },
                },
                required: ['id', 'title', 'subject', 'durationMinutes', 'breakMinutes', 'focusType', 'priority'],
              },
            },
            priorities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            smartTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            motivationalMessage: {
              type: Type.STRING,
              description: 'Human, empathetic motivational message matched to psychological state.',
            },
            adaptiveInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'scenario',
            'diagnosis',
            'whyThisPlan',
            'todaysGoal',
            'studyPlan',
            'priorities',
            'smartTips',
            'motivationalMessage',
          ],
        },
      },
    });

    if (!response.text) {
      throw new Error('Empty text response received from Gemini.');
    }

    const resultData = JSON.parse(response.text.trim());

    // Wrap with metadata ID & timestamps
    const fullResult = {
      id: `diagnosis-${Date.now()}`,
      timestamp: Date.now(),
      ...resultData,
      inputsSummary: input,
    };

    res.json(fullResult);
  } catch (err: any) {
    console.error('Error in /api/generate-plan:', err);
    res.status(500).json({ error: 'AI_GENERATION_FAILED', message: err?.message || 'Failed to generate plan.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
