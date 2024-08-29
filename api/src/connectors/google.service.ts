import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';

// Access your API key as an environment variable
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
