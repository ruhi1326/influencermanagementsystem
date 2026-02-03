//backend/routes/paymentHistoryRoutes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/paymentHistoryController");

router.get("/", ctrl.getAllPaymentHistory);

module.exports = router;
