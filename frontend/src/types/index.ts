import type {UploadFile} from "antd";
import type {UploadChangeParam} from "antd/lib/upload";

export type UploadResponse = UploadChangeParam<UploadFile>;

export type AccountForm = {
    account_name: string;
    owner_name: string;
    owner_email: string;
    country: string;
    address: string;
    phone: string;
    logo: string;
};

export interface Logo {
    name: string;
    url: string;
    size: number;
    uid: string;
}

export type Account = {
    id: string;
    createdDate: string;
    updatedDate: string;
    logo?: string;
    invoices?: Invoice[];
    clients?: Client[];
} & Omit<AccountForm, "logo">;

export type Client = {
    id: string;
    streetName: string;
    buildingNumber: string;
    citySubdivisionName: string;
    cityName: string;
    postalZone: string;
    countryIdentificationCode: string;
    partyTaxSchemeCompanyID: string;
    partyTaxSchemeTaxSchemeId: string;
    partyLegalEntityRegistrationName: string;
    client_email: string;
    phoneNumber: string;
    invoices?: Invoice[];
    account: Account;
    userId: string;
};

export type Invoice = {
    id: string;
    account: Account;
    client: Client;
    services: Service[];
    myOrgProfile: MyOrgProfile;
    status: string;
    invoice_name: string
    invoiceDate: string;
    deliveryDate: string;
    invoice_type: string;
    currency: string;
    tax_category: string;
    tax_scheme_id: string;     //eg VAT
    payment_means: string;
    note: string;

    invoice_id: string;
    reference_number: string;
    uuid: string
    invoice_type_code_value: string;
    invoice_type_code_name: string;
    allowance_charge_indicator: boolean;
    allowance_charge_reason: string;
    allowance_charge_amount_value: string;

    zatca_qr_code: string;

    discount_percentage: number;
    total_discount_amount: number;
    surcharge_percentage: number;
    total_surcharge_amount: number;
    tax_percentage: number;
    total_tax_amount: number;
    subtotal: number;
    total: number;
    prepaid_amount: number;
    zatca_response: string;
    invoice_xml_link: string;
};

export interface InvoiceFilterVariables {
    q?: string;
    _id?: string;
    invoiceDate?: [Date, Date];
}

export type Service = {
    name: string;
    description: string;
    unitPrice: number;
    unitCode: string;
    item_code: string
    quantity: number;
    price_without_discount: number;
    item_discount_percentage: number;
    item_discount_amount: number;
    totalPrice: number;
};
export type InventoryItem = {
    _id: string;
    id: string;
    item_code: string;
    item_name: string;
    description: string;
    category: string; // e.g., "Electronics", "Consumables"
    unit: string; // e.g., pcs, kg, box
    sku: string;
    barcode: string;
    is_service: boolean;

// Pricing
    cost_price: number;
    selling_price: number;
    tax_rate: number; // %
    discount_rate: number;
    current_stock: number;
    userId: string;
}

export type MyOrgProfile = {
    id: string;
    partyId: string;
    schemeId: string;
    streetName: string;
    buildingNumber: string;
    citySubdivisionName: string;
    cityName: string;
    postalZone: string;
    saudi_national_address: string;// short code
    countryIdentificationCode: string;
    partyTaxSchemeCompanyID: string;
    partyTaxSchemeTaxSchemeId: string;
    partyLegalEntityRegistrationName: string;
    email: string;
    phoneNumber: string;

    business_type: string;
    organization_unit: string;
    industry_type: string;
    logo: string;

    onboarding_complete: boolean;
    plan_type: string;
    otp: string;
    userId: string;
};

export type User = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    address: string;
    phone_number: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdDate: string;
    updatedDate: string;
};

export type IEvent = {
    id: number;
    event_name: string;
    phone: number;
    date: string;
    agenda: string;
    status: "new" | "done" | "cancelled";
}
export type ClientMedia = {
    id: number;
    client: Client;
    phone: number;
    date: string;
    agenda: string;
    status: "new" | "done" | "cancelled";
}


export type Media = {
    id: string;
    name: string;
    alternativeText: any;
    caption: any;
    width: number;
    height: number;
    formats: any;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: any;
    provider: string;
    provider_metadata: any;
    createdDate: string;
    updatedDate: string;
};

export type SimplifiedInvoice = {
    id: string;
    invoice_name: string;
    invoiceDate: string;
    total: number;
    client: Client;
    account: Account;
    note?: string;
    currency: string;
    status: string;
    // Add any other fields specific to simplified invoices
};

export type StandardInvoice = {
    id: string;
    invoice_name: string;
    invoiceDate: string;
    discount: number;
    tax: number;
    custom_id: string;
    services: Service[];
    subtotal: number;
    total: number;
    createdDate: string;
    updatedDate: string;
    account: Account;
    client: Client;
    note: string;
    currency: string;
    status: string;
    // Add any other fields specific to standard invoices
};
