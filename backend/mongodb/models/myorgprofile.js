import mongoose from "mongoose";

const MyOrgProfileSchema = new mongoose.Schema({
        id: {type: String, unique: true},
        // partyIdentification
        partyId: {type: String},                        // id
        partySchemeID: {type: String, default: "CRN"},  // schemeID

        // postalAddress
        streetName: {type: String},
        buildingNumber: {type: String},
        citySubdivisionName: {type: String},
        cityName: {type: String},
        postalZone: {type: String},
        countryIdentificationCode: {type: String},// country.identificationCode
        saudi_national_address: {type: String},// short code

        // partyTaxScheme
        partyTaxSchemeCompanyID: {type: String},
        partyTaxSchemeTaxSchemeId: {type: String}, // taxScheme.id

        // partyLegalEntity
        partyLegalEntityRegistrationName: {type: String, unique: true},

        // other fields
        logo: {type: String, required: false},
        email: {type: String, required: false},
        phoneNumber: {type: String, required: false},
        business_type: {type: String, required: true},
        organization_unit: {type: String, required: true},
        industry_type: {type: String, required: true},

        onboarding_complete: {type: Boolean, default: false},
        plan_type: {type: String, required: true},
        creator: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    },
    {timestamps: true}
);
const myOrgProfileModel = mongoose.model("MyOrgProfile", MyOrgProfileSchema);

export default myOrgProfileModel;
