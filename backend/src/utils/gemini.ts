import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey || apiKey === 'your_gemini_api_key_here') {
  console.warn('⚠️ GEMINI_API_KEY belum diset. Fitur AI mungkin tidak berfungsi.');
}

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(apiKey);

// We use the recommended standard model for general text/multimodal tasks
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
