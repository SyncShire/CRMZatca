import * as dotenv from "dotenv";
import MyOrgProfile from "../mongodb/models/myorgprofile.js";
import mongoose from "mongoose";

dotenv.config();

import axios from "axios";
import Invoice from "../mongodb/models/invoice.js";
import URLEncoder from "pdfkit/js/pdfkit.standalone.js";

const ZATCA_API_BASE_URL = process.env.ZATCA_BACKEND_BASE_URL;

export const api = axios.create({
    baseURL: ZATCA_API_BASE_URL,
    headers: {"Content-Type": "application/json"},
});

export async function handleRequest(promise) {
    try {
        const response = await promise;
        return {zatcaStatus: response.status, zatcaData: response.data};
    } catch (error) {
        console.error("ZATCA API Error:", error.response?.data || error.message);
        return {
            zatcaStatus: error.response?.status || 500,
            zatcaData: error.response?.data || {message: error.message},
        };
    }
}

export async function createInvoiceZatcaBackend(payload) {
    const myOrgProfile = await MyOrgProfile.findOne();
    const encodedName = encodeURIComponent(myOrgProfile.partyLegalEntityRegistrationName);
    return handleRequest(api.post("/invoice/create", payload, {headers: {egsClientName: encodedName}}));
}

export async function updateInvoiceZatcaBackend(payload, uuid) {
    const myOrgProfile = await MyOrgProfile.findOne();
    const encodedName = encodeURIComponent(myOrgProfile.partyLegalEntityRegistrationName);
    return handleRequest(api.put("/invoice/" + uuid, payload, {headers: {egsClientName: encodedName}}));
}

export async function onboardZatcaClient(payload) {
    return handleRequest(api.post("/onboardClient", payload, {headers: {Accept: "application/json"}}));
}