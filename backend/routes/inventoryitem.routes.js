import express from "express";

import {
    createInventoryItem,
    deleteInventoryItem,
    getAllInventoryItems,
    getInventoryItemDetail,
    updateInventoryItem,
} from "../controllers/inventoryitem.controller.js";

const router = express.Router();

router.route("/").get(getAllInventoryItems);
router.route("/:id").get(getInventoryItemDetail);
router.route("/").post(createInventoryItem);
router.route("/:id").patch(updateInventoryItem);
router.route("/:id").delete(deleteInventoryItem);

export default router;