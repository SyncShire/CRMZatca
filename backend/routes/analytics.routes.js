import express from "express";

import {
    getMonthlyIncomeDetails,
    getInvoiceStatusDetails,
    getMostStockItems, getLeastStockItems, getInventoryValue, getPotentialRevenue,
} from "../controllers/analytics.controller.js";

const router = express.Router();

router.route("/monthly-income").get(getMonthlyIncomeDetails);
router.route("/invoice-status").get(getInvoiceStatusDetails);
router.route("/inventory-most-stock").get(getMostStockItems);
router.route("/inventory-least-stock").get(getLeastStockItems);
router.route("/inventory-value").get(getInventoryValue);
router.route("/inventory-potentialRevenue").get(getPotentialRevenue);

export default router;
