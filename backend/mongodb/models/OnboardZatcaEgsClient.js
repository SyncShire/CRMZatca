import mongoose from "mongoose";

const OnboardZatcaEgsClientSchema = new mongoose.Schema({
  otp: { type: String, required: true },
  egs_client_name: { type: String, required: true, unique: true },
  vat_registration_number: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  country_code: { type: String, required: true },
  business_type: { type: String, required: true },
  location_address: { type: String, required: true },
  industry_type: { type: String, required: true },
  contact_number: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  zip_code: { type: String, required: true },
  organization_unit: { type: String, required: true },
  createdDate: { type: Date, required: true, default: Date.now },
  updatedDate: { type: Date, required: false },
});

const onboardZatcaEgsClientModel = mongoose.model("OnboardZatcaEgsClient", OnboardZatcaEgsClientSchema);

export default onboardZatcaEgsClientModel;