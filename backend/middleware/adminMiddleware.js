//backend/middleware/adminMiddleware.js
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient');

const adminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    const token = authHeader.split(' ')[1];

    // Decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.admin_id) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Fetch admin from Supabase
    const { data: adminData, error } = await supabase
      .from('admin')
      .select('*')
      .eq('admin_id', decoded.admin_id)
      .single();

    if (error || !adminData) {
      return res.status(403).json({ error: 'Forbidden: Not an admin' });
    }

    req.admin = adminData; // pass admin info to route handlers
    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = adminMiddleware;
