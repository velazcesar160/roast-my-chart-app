import { GoogleGenerativeAI } from '@google/generative-ai';

// Vercel config to allow larger image payloads via JSON
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error: Missing API Key.' });
    }

    // Initialize Gemini using the server's environment variable
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Format the image for Gemini
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

    // Call the model
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const roast = response.text().trim();

    return res.status(200).json({ roast });
  } catch (error) {
    console.error("Error in roast API:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
