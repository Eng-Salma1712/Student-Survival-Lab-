import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  const models = ['gemini-2.5-flash', 'gemini-2.5-flash-8b', 'gemini-3.1-flash-preview', 'gemini-3.1-8b'];
  for (const m of models) {
    try {
      const res = await ai.models.generateContent({ model: m, contents: 'Hello' });
      console.log(m, 'SUCCESS:', res.text.substring(0, 10));
    } catch(e) {
      console.error(m, 'ERROR:', e.message);
    }
  }
}
run();
