import express from "express";
import Invoice from "../mongodb/models/invoice.js";
import InventoryItem from "../mongodb/models/inventoryitem.js";
import Helper from "../helpers/Helper.js";


const getMonthlyIncomeDetails = async (req, res) => {
    try {
        const incomeData = await Invoice.aggregate([
            {
                $match: {
                    createdAt: {$exists: true, $ne: null},
                    total: {$exists: true, $ne: null} // ensure total exists
                },
            },
            {
                $project: {
                    year: {$year: "$createdAt"},
                    month: {$month: "$createdAt"},
                    total: {$toDouble: "$total"}, // convert to number in case it's a string
                },
            },
            {
                $group: {
                    _id: {year: "$year", month: "$month"},
                    totalIncome: {$sum: "$total"},
                },
            },
            {$sort: {"_id.year": 1, "_id.month": 1}},
        ]);

        const formattedData = incomeData.map((item) => ({
            year: item._id.year,
            month: new Date(item._id.year, item._id.month - 1, 1).toLocaleString("default", {
                month: "long",
            }),
            income: item.totalIncome,
        }));

        res.status(200).json(formattedData);
    } catch (error) {
        console.error("Error fetching income details:", error);
        res.status(500).json({message: "Server Error", error});
    }
};

const getInvoiceStatusDetails = async (req, res) => {
    try {
        const summary = await Invoice.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: {$sum: 1},
                },
            },
        ]);

        // Convert array to object: { Draft: 3, Paid: 5, ... }
        let result = {}; // <-- just a plain object in JS
        summary.forEach((item) => {
            result[item._id] = item.count;
        });

        // ensure all statuses exist (even 0)
        const allStatuses = [
            "Draft",
            "Validated W",
            "Validated",
            "ValidationFailed",
            "Paid",
            "ZatcaReported W",
            "ZatcaReported",
            "ZatcaReportingFailed",
        ];

        allStatuses.forEach((status) => {
            if (!result[status]) result[status] = 0;
        });

        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching invoice status summary:", error);
        res.status(500).json({message: "Server error", error});
    }
};

const getMostStockItems = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8; // allow ?limit=10

        const items = await InventoryItem.aggregate([
            {$sort: {current_stock: -1}}, // highest first
            {$limit: limit},
            {
                $project: {
                    _id: 0,
                    item_name: 1,
                    item_code: 1,
                    current_stock: 1,
                    category: 1,
                },
            },
        ]);

        // Convert to object for frontend chart usage
        const result = {};
        items.forEach((item) => {
            result[item.item_name] = item.current_stock;
        });

        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching most stocked items:", error);
        res.status(500).json({message: "Server error", error});
    }
};

const getLeastStockItems = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8; // allow ?limit=10

        const items = await InventoryItem.aggregate([
            {$sort: {current_stock: 1}}, // lowest first
            {$limit: limit},
            {
                $project: {
                    _id: 0,
                    item_name: 1,
                    item_code: 1,
                    current_stock: 1,
                    category: 1,
                },
            },
        ]);

        // Convert to object for frontend chart usage
        const result = {};
        items.forEach((item) => {
            result[item.item_name] = item.current_stock;
        });

        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching least stocked items:", error);
        res.status(500).json({message: "Server error", error});
    }
};

const getInventoryValue = async (req, res) => {
    try {
        const result = await InventoryItem.aggregate([
            {
                $group: {
                    _id: null,
                    totalValue: {
                        $sum: {$multiply: ["$cost_price", "$current_stock"]},
                    },
                },
            },
        ]);

        res.status(200).json({
            totalValue: Helper.roundHalfUp(result[0]?.totalValue, 2) || 0,
        });
    } catch (error) {
        console.error("Error fetching inventory value:", error);
        res.status(500).json({message: "Server error", error});
    }
};

const getPotentialRevenue = async (req, res) => {
    try {
        const result = await InventoryItem.aggregate([
            {
                $addFields: {
                    effectivePrice: {
                        $multiply: [
                            "$selling_price",
                            {$subtract: [1, {$divide: ["$discount_rate", 100]}]},
                            {$add: [1, {$divide: ["$tax_rate", 100]}]},
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: {$multiply: ["$effectivePrice", "$current_stock"]},
                    },
                },
            },
        ]);

        res.status(200).json({
            totalRevenue: Helper.roundHalfUp(result[0]?.totalRevenue, 2) || 0,
        });
    } catch (error) {
        console.error("Error fetching potential revenue:", error);
        res.status(500).json({message: "Server error", error});
    }
};


export {
    getMonthlyIncomeDetails,
    getInvoiceStatusDetails,
    getLeastStockItems,
    getMostStockItems,
    getInventoryValue,
    getPotentialRevenue
};
