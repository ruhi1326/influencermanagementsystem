//backend/server.js
const express = require('express');
const cors = require('cors');
const requestRoutes = require('./routes/requestRoutes');
const authRoutes = require('./routes/authRoutes');
const influencerRoutes = require('./routes/influencerRoutes');
const adminRoutes = require('./routes/adminRoutes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes4
app.use('/api/request', requestRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/influencer', influencerRoutes);

app.get('/', (req, res) => res.send('API running'));

const reportsRoute = require('./routes/reports');
app.use('/api/admin/reports', reportsRoute);

app.use('/api/admin', adminRoutes);

const brandRoutes = require('./routes/brandRoutes');
app.use('/api/brands', brandRoutes);
app.use('/admin/brands', brandRoutes);

const campaignRoutes = require('./routes/campaignRoutes');
app.use('/api/campaigns', campaignRoutes);

const paymentHistoryRoutes = require("./routes/paymentHistoryRoutes");
app.use("/api/payment-history", paymentHistoryRoutes);


// Global error handler (simple)
app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Server error' });
});


const PORT = process.env.PORT || 5000;
// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
