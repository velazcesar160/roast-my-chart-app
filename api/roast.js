import { GoogleGenerativeAI } from '@google/generative-ai';

// Allow 5MB payload for high-res chart screenshots
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

// ── ZERO-SETUP RATE LIMITER (In-Memory) ──
// Protects your free Gemini API key from basic spam without needing Redis/KV.
const rateLimitCache = new Map();
const LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3; // Max 3 roasts per minute per IP

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Check Rate Limit
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown-ip';
  const now = Date.now();
  const userRecord = rateLimitCache.get(ip) || { count: 0, startTime: now };

  if (now - userRecord.startTime > LIMIT_WINDOW_MS) {
    // Reset window if 1 minute has passed
    userRecord.count = 1;
    userRecord.startTime = now;
  } else {
    userRecord.count++;
  }
  rateLimitCache.set(ip, userRecord);

  if (userRecord.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ 
      error: 'Woah there. Free tier limit reached (3 per min). Slow down or join the Sovereign Pro waitlist.' 
    });
  }

  // 2. Process Gemini Request
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error: Missing API Key.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType || 'image/jpeg',
      },
    };

    const prompt = `You are Auditor Pro, an elite risk manager. Roast this trading chart screenshot. 
    Rule 1: If it's a blank chart, insult them. 
    Rule 2: If there are trades, be highly analytical, sarcastic, and mean. 
    STRICT LIMIT: Maximum 160 characters.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const roast = response.text().trim();

    return res.status(200).json({ roast });
  } catch (error) {
    console.error("Error in roast API:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
