//backend/controllers/requestController.js
const supabase = require('../config/supabaseClient');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); // Needed for randomUUID and randomBytes
const { sendApprovalEmail , sendRejectionEmail} = require('../utils/email'); // if you have a helper for sending emails 

const { createClient } = require('@supabase/supabase-js');
const supabase_signup = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);


// Handle influencer request submission
const submitRequest = async (req, res) => {
  try {
    const { name, email, phone, tags, instagram_id } = req.body;

    // Insert into influencer_request table
    const { data, error } = await supabase
      .from('influencer_request')
      .insert([
        { name, email, phone, tags, instagram_id }
      ]);

     if (error) {
      if (error.code === '23505') {
        if (error.details?.includes('email')) {
          return res.status(400).json({ error: 'Email already exists, use another email.' });
        }
        if (error.details?.includes('phone')) {
          return res.status(400).json({ error: 'Phone number already exists, use another phone.' });
        }
      }
      return res.status(400).json({ error: error.message });
    }    

    res.status(200).json({ message: 'Request submitted successfully', data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ APPROVE REQUEST
const approveRequest = async (req, res) => {
  const { request_id, admin_id } = req.body;

  try {
    // Validate admin
    const { data: admin, error: adminError } = await supabase
      .from('admin')
      .select('*')
      .eq('admin_id', admin_id)
      .single();

    if (adminError || !admin) {
      return res.status(403).json({ error: 'Forbidden: Not an admin' });
    }

    // Fetch influencer request
    const { data: request, error: reqError } = await supabase
      .from('influencer_request')
      .select('*')
      .eq('request_id', request_id)
      .single();

    if (reqError || !request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // ✅ Insert into signup_tokens
    const { error: tokenError } = await supabase
      .from('signup_tokens')
      .insert([{
        token,
        email: request.email,
        request_id: request.request_id,
        expires_at: expiresAt,
        used: false
      }]);

    if (tokenError) {
      console.error('Token insert error:', tokenError);
      return res.status(500).json({ error: 'Failed to create signup token' });
    }

    // ✅ Update influencer_request
    await supabase
      .from('influencer_request')
      .update({
        approved: true,
        approved_at: new Date().toISOString(),
        approved_by: admin_id,
        email_sent: null // stays null until attempt
      })
      .eq('request_id', request_id);

    let emailSent = null;

    // Try sending email
    try {
      await sendApprovalEmail(request.email, request.name, token);
      emailSent = true;
    } catch (emailError) {
      console.error('Approval email failed:', emailError);
      emailSent = false;
    }

    // Update email_sent in DB
    await supabase
      .from('influencer_request')
      .update({ email_sent: emailSent })
      .eq('request_id', request_id);

    return res.status(200).json({
      success: true,
      status: "approved",
      email_sent: emailSent,
      message: emailSent
        ? "Request approved and email sent successfully"
        : "Request approved but email failed"
    });
  } catch (err) {
    console.error('Approve error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ✅ REJECT REQUEST
const rejectRequest = async (req, res) => {
  const { request_id, admin_id } = req.body;

  try {
    // Validate admin
    const { data: admin, error: adminError } = await supabase
      .from('admin')
      .select('*')
      .eq('admin_id', admin_id)
      .single();

    if (adminError || !admin) {
      return res.status(403).json({ error: 'Forbidden: Not an admin' });
    }

    // Fetch influencer request
    const { data: request, error: fetchError } = await supabase
      .from('influencer_request')
      .select('*')
      .eq('request_id', request_id)
      .single();

    if (fetchError || !request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Update as rejected
    await supabase
      .from('influencer_request')
      .update({
        approved: false,
        deleted_at: new Date().toISOString(),
        approved_by: admin_id,
        email_sent: null
      })
      .eq('request_id', request_id);

    let emailSent = null;

    // Try sending rejection email
    try {
      await sendRejectionEmail(request.email, request.name);
      emailSent = true;
    } catch (emailError) {
      console.error('Rejection email failed:', emailError);
      emailSent = false;
    }

    // Update email_sent in DB
    await supabase
      .from('influencer_request')
      .update({ email_sent: emailSent })
      .eq('request_id', request_id);

    return res.status(200).json({
      success: true,
      status: "rejected",
      email_sent: emailSent,
      message: emailSent
        ? "Request rejected and email sent successfully"
        : "Request rejected but email failed"
    });
  } catch (err) {
    console.error('Reject error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};


const influencerSignup = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Verify token
    const { data: tokenData, error: tokenError } = await supabase
      .from('signup_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      return res.status(400).json({ error: 'Invalid signup token' });
    }

    if (tokenData.used) {
      return res.status(400).json({ error: 'Token already used' });
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Token expired' });
    }

    const request_id = tokenData.request_id;
    const email = tokenData.email;

    // Fetch influencer request
    const { data: request, error: reqError } = await supabase
      .from('influencer_request')
      .select('*')
      .eq('request_id', request_id)
      .single();

    if (reqError || !request) {
      return res.status(400).json({ error: 'Invalid or unapproved request' });
    }

    // Create Supabase Auth user
    const { data, error: authError } = await supabase_signup.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) return res.status(400).json({ error: authError.message });

    const authUserId = data.user.id;

    // Insert influencer profile
    const { error: insertError } = await supabase
      .from('influencer')
      .insert([{
        request_id,
        auth_user_id: authUserId,
        name: request.name,
        email: request.email,
        phone: request.phone,
        joined_at: new Date(),
        tags: request.tags,
        instagram_id: request.instagram_id
      }]);

    if (insertError) return res.status(400).json({ error: insertError.message });

    // Mark token as used
    await supabase
      .from('signup_tokens')
      .update({ used: true })
      .eq('token', token);

    return res.status(200).json({ message: 'Signup successful', auth_user_id: authUserId });

  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};


const verifyToken = async (req, res) => {
  const { token } = req.query;

  if (!token) return res.status(400).json({ error: 'Token is required' });

  try {
    const { data, error } = await supabase
      .from('signup_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Invalid or expired token' });
    }

    // Optional: check expiration
    if (new Date(data.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Token expired' });
    }

    res.status(200).json({ email: data.email, request_id: data.request_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { submitRequest, approveRequest, rejectRequest, influencerSignup, verifyToken };
