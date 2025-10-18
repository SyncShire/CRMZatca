import express from "express";

import { getMonthlyIncomeDetails, getInvoiceStatusDetails } from "../controllers/analytics.controller.js";

const router = express.Router();

router.route("/monthly-income").get(getMonthlyIncomeDetails);
router.route("/invoice-status").get(getInvoiceStatusDetails);

export default router;
