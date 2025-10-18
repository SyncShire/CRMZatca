import mongoose from "mongoose";

const InventoryItemSchema = new mongoose.Schema({
        id: {type: String},
        // partyIdentification
        item_code: {type: String, required: true, unique: true},
        item_name: {type: String, required: true},
        description: {type: String},
        category: {type: String}, // e.g., "Electronics", "Consumables"
        unit: {type: String, default: "PCE"}, // e.g., pcs, kg, box
        sku: {type: String},
        barcode: {type: String},
        is_service: {type: Boolean, default: false},

        // Pricing
        cost_price: {type: Number, default: 0},
        selling_price: {type: Number, default: 0},
        tax_rate: {type: Number, default: 0}, // %
        discount_rate: {type: Number, default: 0},

        current_stock: {type: Number, default: 0},
        creator: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    },
    {timestamps: true}
);
const inventoryItemModel =
    mongoose.models.InventoryItem || mongoose.model("InventoryItem", InventoryItemSchema);

export default inventoryItemModel;
