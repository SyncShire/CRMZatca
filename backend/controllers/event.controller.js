import Event from "../mongodb/models/event.js";
import User from "../mongodb/models/user.js";
import * as dotenv from "dotenv";
import dayjs from "dayjs";

import mongoose from "mongoose";
import InventoryItem from "../mongodb/models/inventoryitem.js";
import Helper from "../helpers/Helper.js";
dotenv.config();


const getAllEvents = async (req, res) => {
    try {
        const query = {};
        const options = { sort: {}, limit: 10, skip: 0 };

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

        const { _sort = "updatedAt", _order = "desc", sort } = req.query;
        if (sort) {
            const [sortField, sortOrder] = sort.split(":");
            options.sort[sortField] = sortOrder === "desc" ? -1 : 1;
        } else if (_sort) {
            options.sort[_sort] = _order === "desc" ? -1 : 1;
        }

        const {
            "filters[event_name][$containsi]": eventNameFilter,
            "filters[status][$containsi]": eventStatusFilter,
            "filters[phone][$containsi]": phoneFilter,
        } = req.query;
        if (eventStatusFilter)
            query.status = { $regex: new RegExp(eventStatusFilter, "i") };
        if (eventNameFilter)
            query.event_name = { $regex: new RegExp(eventNameFilter, "i") };
        if (phoneFilter) query.phone = { $regex: new RegExp(phoneFilter, "i") };
        Object.keys(req.query).forEach((key) => {
            if (key.endsWith("_like")) {
                const field = key.replace("_like", "");
                query[field] = { $regex: new RegExp(req.query[key], "i") };
            }
        });

        const { id, event_name, status, date } = req.query;
        if (id) {
            query.id = { $regex: new RegExp(`^${id}$`, "i") };
        }
        if (event_name) {
            query.event_name = { $regex: new RegExp(`^${event_name}$`, "i") }; // Exact match for title, case-insensitive
        }
        if (status) {
            query.status = status;  // Partial match for owner, case-insensitive
        }
        if (date) {
            const start = dayjs(date, "YYYY-MM-DD").startOf("day").toDate();
            const end = dayjs(date, "YYYY-MM-DD").endOf("day").toDate();

            query.date = {
                $gte: start,
                $lt: end,
            };
        }

        // Population: Handle populate parameters
        let queryBuilder = Event.find(query)
            .limit(options.limit)
            .skip(options.skip)
            .sort(options.sort);
        const totalCount = await Event.countDocuments(query);

        // Execute query
        const events = await queryBuilder;

        // Respond with results and total count
        res.header("x-total-count", totalCount);
        res.header("Access-Control-Expose-Headers", "x-total-count");
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getEventDetail = async (req, res) => {
    const { id } = req.params;
    const eventExists = await Event.findOne({
        id: id,
    });
    if (eventExists) {
        res.status(200).json(eventExists);
    } else {
        res.status(404).json({ message: "Event not found" });
    }
};

const createEvent = async (req, res) => {
    try {
        const {
            event_name,
            date,
            phone,
            agenda,
            status,
            userId,
        } = req.body;

        if (!event_name || !date || !status) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        const allIds = await Event.find().sort({id: 1}).select("id");

        const nextId = Helper.getNextIdForModel(allIds)

        const newEvent = new Event({
            id: nextId,
            event_name,
            date,
            phone,
            agenda,
            status,
            creator: userId,
        });

        const savedEvent = await newEvent.save();

        res
            .status(201)
            .json({ message: "Event created successfully", data: savedEvent });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Conflicting details duplicates not allowed" });
        }
        res.status(500).json({ message: error.message });
    }
};

const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            event_name,
            date,
            phone,
            agenda,
            status,
            userId,
        } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        const event = await Event.findOne({ id: id });
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        const _id = event._id;

        const updatedFields = {};

        // Add other fields to `updatedFields` if they are provided
        if (event_name) updatedFields.event_name = event_name;
        if (date) updatedFields.date = date;
        if (phone) updatedFields.phone = phone;
        if (agenda) updatedFields.agenda = agenda;
        if (status) updatedFields.status = status;
        if (userId) updatedFields.creator = userId;

        const updatedEvent = await Event.findByIdAndUpdate(
            _id,
            { $set: updatedFields },
            { new: true, runValidators: true } // Return the updated document and run validations
        );

        res
            .status(200)
            .json({ message: "Event updated successfully", data: updatedEvent });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Owner email already exists" });
        }
        res.status(500).json({ message: error.message });
    }
};

const deleteEvent = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;

        const event = await Event.findOne({ id }).session(session);

        if (!event) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Event not found" });
        }

        await Event.deleteOne({ id }).session(session);

        await session.commitTransaction();
        session.endSession();

        res
            .status(200)
            .json({ message: "Event and related resources deleted successfully" });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: error.message });
    }
};

export {
    getAllEvents,
    getEventDetail,
    createEvent,
    updateEvent,
    deleteEvent,
};
