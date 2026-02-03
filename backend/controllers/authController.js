//backend/controllers/authController.js
const { createClient } = require('@supabase/supabase-js');

// Use service role only for admin tasks (not here). For login, use anon key.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.loginInfluencer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Supabase Auth login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    console.log('Supabase login data:', data);
    console.log('Supabase login error:', error);

    // Check if login failed
    if (error || !data.session) {
      return res.status(401).json({ error: error?.message || 'Invalid email or password' });
    }

    // Return access token + user info safely
    return res.status(200).json({
      message: 'Login successful',
      token: data.session.access_token,
      user: data.user
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

