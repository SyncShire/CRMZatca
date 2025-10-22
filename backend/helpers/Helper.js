import {randomUUID} from "crypto";

class Helper {

    static getNextIdForModel(allIds) {
        if (!allIds || allIds.length === 0) return 1;

        // Convert to integers and sort
        const ids = allIds.map(item => parseInt(item.id)).sort((a, b) => a - b);

        let nextId = 1;
        for (let i = 0; i < ids.length; i++) {
            if (ids[i] !== nextId) {
                // gap found
                break;
            }
            nextId++;
        }

        return nextId;
    }


    /**
     * Generate a UUID (v4 by default)
     */
    static generateUUID() {
        return randomUUID();
    }

    /**
     * Extract prefix from English part of a string
     */
    static getPrefixFromName(name) {
        // Keep only English letters/words
        const englishPart = name.replace(/[^A-Za-z\s]/g, "").trim();

        // Take first letters of each word
        const prefix = englishPart
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase())
            .join("");

        // Limit to 3–5 letters for readability
        return prefix.substring(0, 5);
    }

    static formatDateToZatca(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    static getTimeNowZatca() {
        const d = new Date();
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        const seconds = String(d.getSeconds()).padStart(2, "0");
        return `${hours}:${minutes}:${seconds}`;
    }

    static getZatcaInvoiceType(invoiceType) {
        switch (invoiceType) {
            case "StandardInvoice":
                return {value: "388", name: "0100000"};
            case "StandardInvoiceCreditNote":
                return {value: "381", name: "0100000"};
            case "StandardInvoiceDebitNote":
                return {value: "383", name: "0100000"};

            case "SimplifiedInvoice":
                return {value: "388", name: "0200000"};
            case "SimplifiedInvoiceCreditNote":
                return {value: "381", name: "0200000"};
            case "SimplifiedInvoiceDebitNote":
                return {value: "383", name: "0200000"};

            default:
                throw new Error(`Unknown invoice type: ${invoiceType}`);
        }
    }

    static toTwoDecimalsString(value) {
        if (isNaN(value) || value === null) return "0.00";
        return parseFloat(value).toFixed(2);
    }

    static toFixedTruncate(num, decimals = 2) {
        const factor = Math.pow(10, decimals);
        return Math.floor(num * factor) / factor;
    }

    static roundHalfUp(num, decimals = 2) {
        const factor = Math.pow(10, decimals);
        return Math.round(num * factor) / factor;
    }


    // Example: reqBody.items = [
//   { id: 1, name: "قلم رصاص", unitCode: "PCE", quantity: 2, unitPrice: 2.00, taxPercent: 15 }
// ]
    static buildInvoiceLines(items, currency, taxCateogory, taxPercentage, taxScheme) {
        return items.map((item, index) => {
            const lineExtensionAmount = this.roundHalfUp(item.unitPrice * item.quantity, 2); // total before tax
            const taxAmount = this.roundHalfUp((item.unitPrice * item.quantity * taxPercentage) / 100, 2);
            const roundingAmount = lineExtensionAmount + taxAmount;

            return {
                id: String(index + 1),
                invoicedQuantity: {
                    value: item.quantity, // UBL needs 6 decimals
                    unitCode: item.unitCode || "PCE",
                },
                lineExtensionAmount: {
                    value: lineExtensionAmount,
                    currencyId: currency,
                },
                taxTotal: {
                    taxAmount: {
                        value: taxAmount,
                        currencyId: currency,
                    },
                    roundingAmount: {
                        value: this.roundHalfUp(roundingAmount, 2),
                        currencyId: currency,
                    },
                },
                item: {
                    name: item.name,
                    classifiedTaxCategory: {
                        id: taxCateogory.split("-")[0], // Standard-rated
                        percent: taxPercentage.toFixed(2),
                        taxScheme: {
                            id: taxScheme,
                        },
                    },
                },
                price: {
                    priceAmount: {
                        value: item.unitPrice,
                        currencyId: currency,
                    },
                },
            };
        });
    }

    static buildAccountingCustomerParty(ClientModel) {

        // Map Mongo fields into required structure
        return {
            party: {
                postalAddress: {
                    streetName: ClientModel.streetName,
                    buildingNumber: ClientModel.buildingNumber,
                    citySubdivisionName: ClientModel.citySubdivisionName,
                    cityName: ClientModel.cityName,
                    postalZone: ClientModel.postalZone,
                    country: {
                        identificationCode: ClientModel.countryIdentificationCode
                    }
                },
                partyTaxScheme: {
                    companyID: ClientModel.partyTaxSchemeCompanyID,
                    taxScheme: {
                        id: ClientModel.partyTaxSchemeTaxSchemeId
                    }
                },
                partyLegalEntity: {
                    registrationName: ClientModel.partyLegalEntityRegistrationName
                }
            }
        };
    }

    static buildAccountingSupplierParty(MyOrgProfileModel) {
        // Fetch MyOrgProfile document
        return {
            party: {
                partyIdentification: {
                    id: MyOrgProfileModel.partyId,
                    schemeID: MyOrgProfileModel.partySchemeID || "CRN" // default if missing
                },
                postalAddress: {
                    streetName: MyOrgProfileModel.streetName,
                    buildingNumber: MyOrgProfileModel.buildingNumber,
                    citySubdivisionName: MyOrgProfileModel.citySubdivisionName,
                    cityName: MyOrgProfileModel.cityName,
                    postalZone: MyOrgProfileModel.postalZone,
                    country: {
                        identificationCode: MyOrgProfileModel.countryIdentificationCode
                    }
                },
                partyTaxScheme: {
                    companyID: MyOrgProfileModel.partyTaxSchemeCompanyID,
                    taxScheme: {
                        id: MyOrgProfileModel.partyTaxSchemeTaxSchemeId
                    }
                },
                partyLegalEntity: {
                    registrationName: MyOrgProfileModel.partyLegalEntityRegistrationName
                }
            }
        };
    }


    /**
     * Concatenate multiple strings with a separator
     */
    static joinStrings(parts, separator = "") {
        return parts.join(separator);
    }

    /**
     * Convert a string to Title Case
     */
    static toTitleCase(str) {
        return str.replace(/\w\S*/g, txt => {
            return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
        });
    }

    /**
     * Pad a string to a specific length
     */
    static padString(str, length, padChar = " ") {
        if (str.length >= length) return str;
        return str + padChar.repeat(length - str.length);
    }

    /**
     * Repeat a string N times
     */
    static repeatString(str, times) {
        return str.repeat(times);
    }
}

export default Helper;
