//backend/controllers/adminController.js
const supabase = require('../config/supabaseClient');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/email');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const supabase_signup = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Admin login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, admin_id } = req.body;

    if (!email || !admin_id) {
      return res.status(400).json({ error: 'Email and Admin ID are required' });
    }

    // Fetch admin from supabase
    const { data: admin, error } = await supabase
      .from('admin')
      .select('*')
      .eq('email', email)
      .eq('admin_id', admin_id)
      .single();

    if (error || !admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

     const token = jwt.sign(
       { email: admin.email, admin_id: admin.admin_id },
       process.env.JWT_SECRET, // define this in .env
       { expiresIn: '9h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      admin
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// adminController.js
exports.getInfluencerRequests = async (req, res) => {
  try {
    // Get all requests that aren't soft deleted
    const { data, error } = await supabase
      .from('influencer_request')
      .select('*')
      .order('request_date', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Transform the data to match frontend expectations
    const transformedData = data.map(request => ({
      ...request,
      id: request.request_id,
      status: request.deleted_at ? 'rejected' : (request.approved_at ? 'approved' : 'pending'),
       email_sent: request.email_sent === null ? null : !!request.email_sent
    }));

    res.status(200).json({ requests: transformedData });
  } catch (err) {
    console.error('Fetch requests error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Handle request approval
exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Approving request:', req.params);

    // First, get the request details
    const { data: request, error: fetchError } = await supabase
      .from('influencer_request')
      .select('*')
      .eq('request_id', id)
      .single();

    console.log('Request data:', request, 'Error:', fetchError);

    if (fetchError || !request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.approved) {
      return res.status(400).json({ error: 'Request already approved' });
    }

    // Generate signup token
    console.log('Generating signup token');
    const signupToken = crypto.randomBytes(32).toString('hex');

    // Store token in signup_tokens table
    const { error: tokenError } = await supabase
      .from('signup_tokens')
      .insert([{
        token: signupToken,
        email: request.email,
        request_id: id,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }]);

    if (tokenError) {
      console.error('Token creation error:', tokenError);
      return res.status(500).json({ error: 'Failed to create signup token' });
    }

    // Send approval email
    let emailSent = false;
    try {
      sendApprovalEmail(request.email, request.name, signupToken);
      emailSent = true;
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
      // Continue with approval but mark email as not sent
    }

    // Update request status
    const { error: updateError } = await supabase
      .from('influencer_request')
      .update({
        approved: true,
        approved_at: new Date().toISOString(),
        approved_by: req.admin?.admin_id || null,
        email_sent: emailSent
      })
      .eq('request_id', id);

    if (updateError) {
      // If update fails, cleanup the token
      await supabase.from('signup_tokens').delete().eq('request_id', id);
      return res.status(500).json({ error: 'Failed to update request status' });
    }

    return res.status(200).json({
      message: emailSent ? 'Request approved and email sent' : 'Request approved but email failed',
      data: { ...request, approved: true, email_sent: emailSent }
    });
  } catch (err) {
    console.error('Approve request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Handle request rejection
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the request details first
    const { data: request, error: fetchError } = await supabase
      .from('influencer_request')
      .select('*')
      .eq('request_id', id)
      .is('deleted_at', null)
      .is('approved_at', null)
      .single();

    if (fetchError || !request) {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from('influencer_request')
      .update({ 
        deleted_at: now,
        email_sent: true
      })
      .eq('request_id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Send rejection email
    try {
      await sendRejectionEmail(request.email, request.name);
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    res.status(200).json({ 
      message: 'Request rejected successfully',
      request: { ...request, deleted_at: now, email_sent: true }
    });
  } catch (err) {
    console.error('Reject request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.handleRequestAction = async (req, res) => {
  const { id } = req.params; // request_id
  const { action } = req.body;
  const adminId = req.admin?.admin_id;

  if (!action || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: "Invalid action" });
  }

  if (!adminId) {
    return res.status(401).json({ error: "Admin not authenticated" });
  }

  try {
    const { data: request, error: fetchError } = await supabase
      .from('influencer_request')
      .select('*')
      .eq('request_id', id)
      .single();

    if (fetchError || !request) return res.status(404).json({ error: "Request not found" });

    if (request.approved !== null || request.deleted_at) {
      return res.status(400).json({ error: "Action already taken" });
    }

    let emailSent = false;

    if (action === 'approve') {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      // 2) insert the token using service-role client
  const { data: insertedToken, error: tokenInsertError } = await supabase_signup
    .from('signup_tokens')
    .insert([{
      token,
      email: request.email,
      request_id: request.request_id,
      expires_at: expiresAt,
      used: false
    }])
    .select()
    .single();

  if (tokenInsertError) {
    console.error('signup_tokens insert failed:', tokenInsertError);
    return res.status(500).json({ error: 'Failed to create signup token' });
  }

      // Update approved first
      const { error: updateError } = await supabase
        .from('influencer_request')
        .update({
          approved: true,
          approved_at: new Date().toISOString(),
          approved_by: adminId,
          email_sent: null
        })
        .eq('request_id', id);

      if (updateError) {
    // cleanup token if request update failed
    await supabase_signup.from('signup_tokens').delete().eq('token', token);
    console.error('Failed to mark request approved:', updateError);
    return res.status(500).json({ error: 'Failed to update request' }); 
      }

      // Send approval email
      let emailSent = false;
      try {
        sendApprovalEmail(request.email, request.name, token);
        emailSent = true;
      } catch (emailErr) {
        console.error('Approval email failed:', emailErr);
        emailSent = false;
      }

       // 5) persist email_sent true/false
  const { error: emailUpdErr } = await supabase
    .from('influencer_request')
    .update({ email_sent: emailSent })
    .eq('request_id', id);

  if (emailUpdErr) {
    console.error('Failed to update email_sent:', emailUpdErr);
  }

  return res.json({ success: true, status: 'approved', email_sent: emailSent });
}

    if (action === 'reject') {
      const now = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('influencer_request')
        .update({
          approved: false,
          deleted_at: now,
          approved_by: adminId
        })
        .eq('request_id', id);

      if (updateError) throw updateError;

      // Send rejection email
      try {
        await sendRejectionEmail(request.email, request.name);
        emailSent = true;
      } catch (emailErr) {
        console.error('Rejection email failed:', emailErr);
        emailSent = false;
      }

      await supabase
        .from('influencer_request')
        .update({ email_sent: emailSent })
        .eq('request_id', id);

      return res.json({ success: true, status: "rejected", email_sent: emailSent });
    }
  } catch (err) {
    console.error("Error handling influencer request:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update status
exports.updateStatus = async (req, res) => {
  try {
    const { influencer_id, status } = req.body;

    if (!influencer_id || !status)
      return res.status(400).json({ error: "Missing fields" });

    const { data, error } = await supabase
      .from("influencer")
      .update({ status })
      .eq("influencer_id", influencer_id);

    if (error) throw error;

    res.json({ success: true, message: "Status updated" });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
