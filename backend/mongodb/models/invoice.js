import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
        id: {type: String, required: true, unique: true},
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client",
        },
        account: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
        },
        myOrgProfile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MyOrgProfile",
        },
        reference_number: {type: String},
        services: [{type: mongoose.Schema.Types.ObjectId, ref: "Service"}],
        creator: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
        status: {type: String, required: true},
        invoice_name: {type: String, required: true},
        invoiceDate: {type: Date, required: true},
        invoiceTime: {type: String, required: true},// can be Date if you want
        deliveryDate: {type: Date},
        invoice_type: {type: String, required: true},
        currency: {type: String, required: true},
        tax_category: {type: String},
        tax_scheme_id: {type: String},
        payment_means: {type: String},
        note: {type: String},

        invoice_id: {type: String, unique: true, required: true},
        uuid: {type: String, required: true},
        invoice_type_code_value: {type: String},
        invoice_type_code_name: {type: String},
        allowance_charge_indicator: {type: Boolean, default: false},
        allowance_charge_reason: {type: String},
        allowance_charge_amount_value: {type: String},

        zatca_qr_code: {type: String, required: true},
        discount_percentage: {type: Number, default: 0},
        total_discount_amount: {type: Number, default: 0},
        surcharge_percentage: {type: Number, default: 0},
        total_surcharge_amount: {type: Number, default: 0},
        tax_percentage: {type: Number, default: 0},
        total_tax_amount: {type: Number, default: 0},
        custom_id: {type: String},
        subtotal: {type: Number, required: true},
        total: {type: Number, required: true},
        prepaid_amount: {type: Number, default: 0},
        zatcaErrorMessages: {type: [String], default: []},
        zatcaWarningMessages: {type: [String], default: []},
        zatca_response: {
            type: mongoose.Schema.Types.Mixed, // or Object
            default: {},
        },
        invoice_xml_link: {type: String},
    },
    {timestamps: true} // adds createdAt, updatedAt
);

const invoiceModel = mongoose.model("Invoice", InvoiceSchema);

export default invoiceModel;
