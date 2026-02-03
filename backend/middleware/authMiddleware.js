//backend/middleware/authMiddleware.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Admin not logged in" });
    // Verify token with Supabase
   const { data: { user }, error } = await supabase.auth.getUser(token);

if (error) {
  return res.status(401).json({ error: `Auth error: ${error.message}` });
}

if (!user) {
  return res.status(401).json({ error: 'No user found for this token' });
}

    // Attach user to request for later use
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ error: 'Server error during authentication' });
  }
};

module.exports = authMiddleware;

