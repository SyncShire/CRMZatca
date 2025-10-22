import Invoice from "../mongodb/models/invoice.js";
import Account from "../mongodb/models/account.js";
import Service from "../mongodb/models/service.js";
import Client from "../mongodb/models/client.js";
import MyOrgProfile from "../mongodb/models/myorgprofile.js";
import InventoryItemModel from "../mongodb/models/inventoryitem.js";
import User from "../mongodb/models/user.js";
import mongoose from "mongoose";
import InvoiceBuilder from "../helpers/InvoiceBuilder.js";
import {createInvoiceZatcaBackend, updateInvoiceZatcaBackend} from "../middleware/zatcaApis.js";
import axios from "axios";
import InvoiceCounter from "../mongodb/models/invoicecounter.js";

const ZATCA_API_BASE_URL = process.env.ZATCA_BACKEND_BASE_URL;


const roundToTwo = (num) => {
    return Number(Number(num).toFixed(2));
};

const getAllInvoices = async (req, res) => {
    try {
        const query = {};
        const options = {sort: {}, limit: 10, skip: 0};

        const {
            _start,
            _end,
            q,
            invoiceDate_gte,
            invoiceDate_lte,
            "invoice.invoiceDate": invoiceDates,
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

        if (q) {
            query.$or = [
                {name: {$regex: new RegExp(q, "i")}},
                {custom_id: {$regex: new RegExp(q, "i")}},
            ];
        }

        // ✅ Date range filter
        if (invoiceDates) {
            const datesArray = Array.isArray(invoiceDates) ? invoiceDates : [invoiceDates];
            if (datesArray.length === 2) {
                const [startDate, endDate] = datesArray.map((d) => new Date(d));
                if (!isNaN(startDate) && !isNaN(endDate)) {
                    query.invoiceDate = {$gte: startDate, $lte: endDate};
                }
            } else if (datesArray.length === 1) {
                const exactDate = new Date(datesArray[0]);
                if (!isNaN(exactDate)) {
                    // optional: match all invoices for that day
                    const nextDay = new Date(exactDate);
                    nextDay.setDate(exactDate.getDate() + 1);
                    query.invoiceDate = {$gte: exactDate, $lt: nextDay};
                }
            }
        }


        const {
            "filters[invoice_name][$containsi]": invoiceNameFilter,
            "filters[phoneNumber][$containsi]": phoneFilter,
            "filters[status][$containsi]": statusFilter,
        } = req.query;

        if (invoiceNameFilter)
            query.invoice_name = {$regex: new RegExp(invoiceNameFilter, "i")};
        if (phoneFilter) query.phoneNumber = {$regex: new RegExp(phoneFilter, "i")};
        if (statusFilter) query.status = {$regex: new RegExp(statusFilter, "i")};
        Object.keys(req.query).forEach((key) => {
            if (key.endsWith("_like")) {
                const field = key.replace("_like", "");
                query[field] = {$regex: new RegExp(req.query[key], "i")};
            }
        });

        const {id, invoice_name, status} = req.query;
        if (id) {
            query.id = {$regex: new RegExp(`^${id}$`, "i")};
        }
        if (invoice_name) {
            query.invoice_name = {$regex: new RegExp(`^${invoice_name}$`, "i")}; // Exact match for title, case-insensitive
        }
        if (status) {
            query.status = {$regex: new RegExp(`^${status}$`, "i")}; // Exact match for title, case-insensitive
        }

        const {
            ["account.account_name"]: accountName,
            ["client.partyLegalEntityRegistrationName"]: clientName,
        } = req.query;
        if (accountName) {
            const account = await Account.findOne({
                account_name: new RegExp(`^${accountName}$`, "i"),
            }).select("_id");

            if (account) {
                query.account = account._id;
            }
        }
        if (clientName) {
            const client = await Client.findOne({
                account_name: new RegExp(`^${clientName}$`, "i"),
            }).select("_id");

            if (client) {
                query.client = client._id;
            }
        }


        let queryBuilder = Invoice.find(query)
            .limit(options.limit)
            .skip(options.skip)
            .sort(options.sort);
        const {"populate[2]": populateInvoices} = req.query;
        if (populateInvoices) {
            queryBuilder = queryBuilder.populate("invoices");
        }

        queryBuilder = queryBuilder.populate([{path: "client"}]);
        queryBuilder = queryBuilder.populate([{path: "account"}]);
        queryBuilder = queryBuilder.populate([{path: "myOrgProfile"}]);
        queryBuilder = queryBuilder.populate([{path: "services"}]);

        const totalCount = await Invoice.countDocuments(query);

        const invoices = await queryBuilder;

        res.header("x-total-count", totalCount);
        res.header("Access-Control-Expose-Headers", "x-total-count");
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

const getInvoiceDetail = async (req, res) => {
    const {id} = req.params;
    const invoiceExists = await Invoice.findOne({id: id})
        .populate("account")
        .populate("client")
        .populate("services")
        .populate("myOrgProfile");
    if (invoiceExists) {
        res.status(200).json(invoiceExists);
    } else {
        res.status(404).json({message: "Invoice not found"});
    }
};

const createInvoice = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let {
            account,
            client,
            services,
            invoice_name,
            invoiceDate,
            deliveryDate,
            invoice_type,
            currency,
            tax_category,
            tax_scheme_id,
            payment_means,
            note,
            discount,
            tax_percentage,
            subtotal,
            total,
            userId,
        } = req.body;

        if (
            !account ||
            !services.length ||
            !invoice_name ||
            !client ||
            !invoiceDate ||
            !services ||
            !total
        ) {
            return res.status(400).json({message: "Missing required fields"});
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({message: "User Not Found"});
        }

        const serviceDocs = await Service.insertMany(
            services.map((service) => ({...service, creator: userId})),
            {session}
        );

        await handleInventoryUpdate(services, session);

        let totalRounded = roundToTwo(total);

        const clientDoc = await Client.findById(client)
        const myOrgProfile = await MyOrgProfile.findOne();

        if (!clientDoc) {
            return res.status(404).json({message: "Client not found for clientId:" + clientDoc});
        }
        if (!myOrgProfile) {
            return res.status(404).json({message: "OrgProfile not found"});
        }

        const builder = new InvoiceBuilder();

        const jsonPayload = await builder.createInvoiceFromRequest(req.body, "new", clientDoc, myOrgProfile, session);

        const {zatcaStatus, zatcaData} = await createInvoiceZatcaBackend(jsonPayload);
        if (![200, 202].includes(zatcaStatus)) {
            return res.status(500).json({data: zatcaData, message: zatcaData?.message || "Failed at backend"});
        }
        // assume zatcaData is the JSON response you showed
        const qrRef = zatcaData?.additionalDocumentReference?.find(
            (doc) => doc.id === "QR"
        );
        const qrCode = qrRef?.attachment?.embeddedDocumentBinaryObject?.value;

        const newInvoice = new Invoice({
            id: jsonPayload.id,
            invoice_id: jsonPayload.id,
            uuid: jsonPayload.uuid,
            invoice_name,
            account,
            client,
            myOrgProfile,
            services: serviceDocs.map((s) => s._id),
            status: "Draft",
            invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
            invoiceTime: jsonPayload.issueTime,
            deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
            invoice_type,
            tax_category,
            tax_scheme_id,
            payment_means,
            tax_percentage,
            subtotal,
            total: totalRounded,
            discount,
            note,
            currency,
            creator: userId,
            zatca_qr_code: qrCode,
            invoice_type_code_value: jsonPayload.invoiceTypeCode.value,
            invoice_type_code_name: jsonPayload.invoiceTypeCode.name,
        });

        const savedInvoice = await newInvoice.save({session});

        if (account) {
            const accountToUpdate = await Account.findOne({_id: account});
            accountToUpdate.invoices.push(newInvoice._id);
            await accountToUpdate.save({session});
        }

        if (client) {
            const clientToUpdate = await Client.findOne({_id: client});
            clientToUpdate.invoices.push(newInvoice._id);
            await clientToUpdate.save({session});
        }


        await session.commitTransaction();
        res
            .status(201)
            .json({message: "Invoice created successfully", data: savedInvoice});


    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        if (error.code === 11000) {
            return res.status(409).json({message: "Owner email already exists"});
        }
        res.status(500).json({message: error.message});
    } finally {
        session.endSession(); // always close session
    }
};

const updateInvoice = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const {id} = req.params;
        const {
            account,
            client,
            invoice_name,
            invoiceDate,
            deliveryDate,
            invoice_type,
            tax_category,
            tax_scheme_id,
            payment_means,
            currency,
            note,
            services,
            tax_percentage,
            discount,
            subtotal,
            total,
            userId,
            status,
        } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({message: "User Not Found"});
        }

        const existingInvoice = await Invoice.findOne({id: id}).session(session);
        if (!existingInvoice) {
            await session.abortTransaction();
            return res.status(404).json({message: "Invoice not found"});
        }

        const forbiddenStatuses = ["ZatcaReported W", "ZatcaReported", "Paid"];

        if (forbiddenStatuses.includes(existingInvoice.status)) {
            await session.abortTransaction();
            return res.status(403).json({
                message: `Invoice cannot be edited in status: ${existingInvoice.status}`
            });
        }

        const clientDoc = await Client.findById(client)
        const myOrgProfile = await MyOrgProfile.findOne();

        if (!clientDoc) {
            return res.status(404).json({message: "Client not found for clientId:" + clientDoc});
        }
        if (!myOrgProfile) {
            return res.status(404).json({message: "OrgProfile not found"});
        }

        const mergedReqBody = {
            ...existingInvoice.toObject(), // fallback to old values
            ...req.body                    // override with new ones
        };

        const builder = new InvoiceBuilder();

        const jsonPayload = await builder.createInvoiceFromRequest(mergedReqBody, "update", clientDoc, myOrgProfile, session);

        const {zatcaStatus, zatcaData} = await updateInvoiceZatcaBackend(jsonPayload, existingInvoice.uuid);
        if (![200, 202].includes(zatcaStatus)) {
            return res.status(500).json({data: zatcaData, message: zatcaData?.message || "Failed at backend"});
        }
        // assume zatcaData is the JSON response you showed
        const qrRef = zatcaData?.additionalDocumentReference?.find(
            (doc) => doc.id === "QR"
        );
        const qrCode = qrRef?.attachment?.embeddedDocumentBinaryObject?.value;
        if (qrCode) {
            console.log("QR Code:", qrCode);
        } else {
            console.log("QR Code not found");
        }

        // Extract existing service IDs
        const existingServiceIds = existingInvoice.services.map((s) => s.toString());

        // Separate services: existing, new, and deleted
        const newServices = services.filter((s) => !s._id); // No ID means new service
        const updatedServices = services.filter(
            (s) => s._id && existingServiceIds.includes(s._id)
        );
        const deletedServices = existingServiceIds.filter(
            (sId) => !services.some((s) => s._id === sId)
        );

        // Insert new services
        const newServiceDocs = await Service.insertMany(
            newServices.map((service) => ({...service, creator: userId})),
            {session}
        );

        // Update existing services
        for (const service of updatedServices) {
            await Service.findByIdAndUpdate(service._id, service, {session});
        }

        // await handleInventoryUpdate(updatedServices, session);

        // Remove deleted services
        if (deletedServices.length > 0) {
            await Service.deleteMany({_id: {$in: deletedServices}}, {session});
        }
        // await handleInventoryUpdate(deletedServices, session, "deleteService");

        let totalRounded = roundToTwo(total);

        //update only that are there
        // Only update if the field exists in the payload
        if (account !== undefined) existingInvoice.account = account;
        if (client !== undefined) existingInvoice.client = client;
        if (invoice_name !== undefined) existingInvoice.invoice_name = invoice_name;
        if (invoice_type !== undefined) existingInvoice.invoice_type = invoice_type;
        if (tax_category !== undefined) existingInvoice.tax_category = tax_category;
        if (tax_scheme_id !== undefined) existingInvoice.tax_scheme_id = tax_scheme_id;
        if (payment_means !== undefined) existingInvoice.payment_means = payment_means;
        if (currency !== undefined) existingInvoice.currency = currency;
        if (note !== undefined) existingInvoice.note = note;
        if (tax_percentage !== undefined) existingInvoice.tax_percentage = tax_percentage;
        if (subtotal !== undefined) existingInvoice.subtotal = subtotal;
        if (discount !== undefined) existingInvoice.discount = discount;
        if (total !== undefined) existingInvoice.total = totalRounded;
        if (services !== undefined) {
            existingInvoice.services = [
                ...updatedServices.map((s) => s._id),
                ...newServiceDocs.map((s) => s._id),
            ];
        }

        //mandatory should be updated whenever edited
        existingInvoice.status = "Draft";
        existingInvoice.invoiceDate = invoiceDate ? new Date(invoiceDate) : null;
        existingInvoice.invoiceTime = jsonPayload.issueTime;
        existingInvoice.deliveryDate = deliveryDate ? new Date(deliveryDate) : null;
        existingInvoice.creator = userId;
        existingInvoice.zatca_qr_code = qrCode;
        existingInvoice.invoice_type_code_value = jsonPayload.invoiceTypeCode.value;
        existingInvoice.invoice_type_code_name = jsonPayload.invoiceTypeCode.name;

        try {
            await existingInvoice.save({session});
        } catch (err) {
            await session.abortTransaction();
            return res.status(500).json({message: "Failed to save invoice", error: err.message});
        }

        if (account) {
            const accountToUpdate = await Account.findById({_id: account._id}).session(
                session
            );
            if (accountToUpdate && !accountToUpdate.invoices.includes(existingInvoice._id)) {
                accountToUpdate.invoices.push(existingInvoice._id);
                await accountToUpdate.save({session});
            }
        }

        if (client) {
            const clientToUpdate = await Client.findOne({_id: client._id}).session(
                session
            );
            if (clientToUpdate && !clientToUpdate.invoices.includes(existingInvoice._id)) {
                clientToUpdate.invoices.push(existingInvoice._id);
                await clientToUpdate.save({session});
            }
        }

        await session.commitTransaction();
        res
            .status(200)
            .json({message: "Invoice updated successfully", data: existingInvoice});
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({message: error.message});
    } finally {
        session.endSession();
    }
};

const deleteInvoice = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {id} = req.params;

        const invoice = await Invoice.findOne({id})
            .populate("account")
            .populate("client")
            .session(session);

        if (!invoice) {
            await session.abortTransaction();
            return res.status(404).json({message: "Invoice not found"});
        }

        const ALLOWED_STATUSES = ["Draft", "Validated W", "Validated", "ValidationFailed"];
        if (!ALLOWED_STATUSES.includes(invoice.status)) {
            await session.abortTransaction();
            return res.status(403).json({message: "Reported invoices to Zatca can't be deleted"});
        }

        invoice.account.invoices.pull(invoice);
        invoice.client.invoices.pull(invoice);

        await invoice.account.save({session})

        await Invoice.deleteOne({id}).session(session);
        await InvoiceCounter.deleteOne({invoice_id: id}).session(session);

        // 🔥 Call Spring Boot delete endpoint
        try {
            await axios.delete(ZATCA_API_BASE_URL + "/invoice/" + invoice.uuid);
        } catch (springError) {
            // If Spring Boot fails, rollback Mongo as well
            await session.abortTransaction();
            session.endSession();
            return res.status(500).json({
                message: "Failed to delete invoice in backend service",
                error: springError.response?.data || springError.message,
            });
        }

        await session.commitTransaction();
        session.endSession();

        res
            .status(200)
            .json({message: "Invoice and related resources deleted successfully"});
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({message: error.message});
    }
};

async function handleInventoryUpdate(services, session, flag) {
    // 2️⃣ Safely update stock for each service
    for (const service of services) {
        const {item_code, quantity} = service;

        if (!item_code) continue; // skip if no item_code linked to inventory

        const inventoryItem = await InventoryItemModel.findOne({item_code}).session(session);

        if (!inventoryItem) {
            throw new Error(`Inventory item not found for item_code: ${item_code}`);
        }

        if (inventoryItem.is_service) continue; // skip if it's a service item

        if (inventoryItem.current_stock < quantity) {
            throw new Error(
                `Insufficient stock for ${inventoryItem.item_name} ItemCode: ${inventoryItem.item_code}.
                 Available: ${inventoryItem.current_stock}, Requested: ${quantity}`
            );
        }

        if (flag !== "deleteService") {
            // Atomic decrement
            await InventoryItemModel.updateOne(
                {_id: inventoryItem._id},
                {$inc: {current_stock: -quantity}},
                {session}
            );
        } else {
            await InventoryItemModel.updateOne(
                {_id: inventoryItem._id},
                {$inc: {current_stock: +quantity}},
                {session}
            );
        }
    }

}

export {
    getAllInvoices,
    getInvoiceDetail,
    createInvoice,
    updateInvoice,
    deleteInvoice,
};
