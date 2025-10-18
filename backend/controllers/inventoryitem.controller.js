import InventoryItem from "../mongodb/models/inventoryItem.js";
import User from "../mongodb/models/user.js";
import mongoose from "mongoose";

const getAllInventoryItems = async (req, res) => {
    try {
        const query = {};
        const options = {sort: {}, limit: 10, skip: 0};

        const {
            _start,
            _end,
            "pagination[page]": page,
            "pagination[pageSize]": pageSize,
        } = req.query;
        if (_start) options.skip = parseInt(_start, 10);
        if (_end) options.limit = parseInt(_end, 10) - options.skip;
        if (page && pageSize) {
            options.limit = parseInt(pageSize, 10);
            options.skip = (parseInt(page, 10) - 1) * options.limit;
        }

        const {_sort = "updatedAt", _order = "desc", sort} = req.query;
        if (sort) {
            const [sortField, sortOrder] = sort.split(":");
            options.sort[sortField] = sortOrder === "desc" ? -1 : 1;
        } else if (_sort) {
            options.sort[_sort] = _order === "desc" ? -1 : 1;
        }

        const {
            "filters[item_name][$containsi]": itemNameFilter,
            "filters[item_code][$containsi]": itemCodeFilter,
            "filters[description][$containsi]": descriptionFilter,
        } = req.query;
        if (itemNameFilter)
            query.item_name = {$regex: new RegExp(itemNameFilter, "i")};
        if (itemCodeFilter) query.item_code = {$regex: new RegExp(itemCodeFilter, "i")};
        if (descriptionFilter) query.description = {$regex: new RegExp(descriptionFilter, "i")};
        Object.keys(req.query).forEach((key) => {
            if (key.endsWith("_like")) {
                const field = key.replace("_like", "");
                query[field] = {$regex: new RegExp(req.query[key], "i")};
            }
        });

        const {id, item_name, item_code, description} = req.query;
        if (id) {
            query.id = {$regex: new RegExp(`^${id}$`, "i")};
        }
        if (item_name) {
            query.item_name = {$regex: new RegExp(`^${item_name}$`, "i")}; // Exact match for title, case-insensitive
        }
        if (item_code) {
            query.item_code = {$regex: new RegExp(`^${item_code}$`, "i")};
        }
        if (description) {
            query.description = {$regex: new RegExp(`^${description}$`, "i")};
        }

        let queryBuilder = InventoryItem.find(query)
            .limit(options.limit)
            .skip(options.skip)
            .sort(options.sort);
        const {"populate[2]": populateInvoices} = req.query;

        const totalCount = await InventoryItem.countDocuments(query);

        const inventoryItems = await queryBuilder;

        res.header("x-total-count", totalCount);
        res.header("Access-Control-Expose-Headers", "x-total-count");
        res.status(200).json(inventoryItems);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

const getInventoryItemDetail = async (req, res) => {
    const {id} = req.params;
    const inventoryItemExists = await InventoryItem.findOne({id: id});

    if (inventoryItemExists) {
        res.status(200).json(inventoryItemExists);
    } else {
        res.status(404).json({message: "InventoryItem not found"});
    }
};

const createInventoryItem = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const {
            item_name,
            description,
            category,
            unit,
            sku,
            barcode,
            is_service,
            cost_price,
            selling_price,
            tax_rate,
            discount_rate,
            current_stock,
        } = req.body;

        if (!item_name || !unit) {
            return res.status(400).json({message: "Missing required fields"});
        }

        const maxIdInventoryItem = await InventoryItem.findOne().sort({id: -1}).select("id");
        const nextId = maxIdInventoryItem ? parseInt(maxIdInventoryItem.id) + 1 : 1;
        // Generate item_code in format ITM00001
        const itemCode = `ITM000${String(nextId)}`;

        let photoUrl = "";

        const newInventoryItem = new InventoryItem({
            id: nextId,
            item_code: itemCode,
            item_name,
            description,
            category,
            unit,
            sku,
            barcode,
            is_service,
            cost_price,
            selling_price,
            tax_rate,
            discount_rate,
            current_stock,
        });

        const savedInventoryItem = await newInventoryItem.save({session});

        await session.commitTransaction();

        res
            .status(201)
            .json({message: "InventoryItem created successfully", data: savedInventoryItem});
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        if (error.code === 11000) {
            return res.status(409).json({message: "InventoryItem already exists"});
        }
        res.status(500).json({message: error.message});
    }
};

const updateInventoryItem = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const {id} = req.params;
        const {
            item_code,
            item_name,
            description,
            category,
            unit,
            sku,
            barcode,
            is_service,
            cost_price,
            selling_price,
            tax_rate,
            discount_rate,
            current_stock,
            userId,
        } =
            req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({message: "User Not Found"});
        }

        const inventoryItem = await InventoryItem.findOne({id: id});
        if (!inventoryItem) {
            return res.status(404).json({message: "InventoryItem not found"});
        }

        const _id = inventoryItem._id;

        const updatedFields = {};

        if (item_code) updatedFields.item_code = item_code;
        if (item_name) updatedFields.item_name = item_name;
        if (description) updatedFields.description = description;
        if (category) updatedFields.category = category;
        if (unit) updatedFields.unit = unit;
        if (sku) updatedFields.sku = sku;
        if (barcode) updatedFields.barcode = barcode;
        if (is_service !== undefined) updatedFields.is_service = is_service;
        if (cost_price) updatedFields.cost_price = cost_price;
        if (selling_price) updatedFields.selling_price = selling_price;
        if (tax_rate) updatedFields.tax_rate = tax_rate;
        if (discount_rate) updatedFields.discount_rate = discount_rate;

        const updatedInventoryItem = await InventoryItem.findByIdAndUpdate(
            _id,
            {$set: updatedFields},
            {new: true, runValidators: true} // Return the updated document and run validations
        );

        if (!updateInventoryItem) {
            throw new Error("InventoryItem not found");
        }

        await session.commitTransaction();

        res
            .status(200)
            .json({message: "InventoryItem updated successfully", data: updatedInventoryItem});
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        if (error.code === 11000) {
            return res.status(409).json({message: "InventoryItem exists"});
        }
        res.status(500).json({message: error.message});
    }
};

const deleteInventoryItem = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {id} = req.params;

        const inventoryItem = await InventoryItem.findOne({id})
            .session(session);

        if (!inventoryItem) {
            await session.abortTransaction();
            return res.status(404).json({message: "InventoryItem not found"});
        }

        await InventoryItem.deleteOne({id}).session(session);

        await session.commitTransaction();
        await session.endSession();

        res
            .status(200)
            .json({message: "InventoryItem deleted successfully"});
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        res.status(500).json({message: error.message});
    }
};

export {
    getAllInventoryItems,
    getInventoryItemDetail,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
};
