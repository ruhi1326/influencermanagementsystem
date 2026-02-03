// backend/routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const { addPaymentHistory } = require("../controllers/paymentController");

// POST /payment-history
router.post("/", addPaymentHistory);

module.exports = router;
