import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Database configuration missing in Vercel. Please check SUPABASE_URL and SUPABASE_ANON_KEY.' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ email }]);

    if (error) {
      if (error.code === '23505') { // Postgres duplicate key error
        return res.status(200).json({ success: true, message: 'Already on waitlist' });
      }
      throw error;
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Waitlist API error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
