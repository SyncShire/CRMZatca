import express from "express";
import Invoice from "../mongodb/models/invoice.js";


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


export {getMonthlyIncomeDetails, getInvoiceStatusDetails};
