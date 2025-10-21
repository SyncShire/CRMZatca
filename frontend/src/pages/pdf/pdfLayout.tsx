import {
    Document,
    Image,
    Page,
    StyleSheet,
    View,
    Text,
    PDFViewer,
} from "@react-pdf/renderer";

import {Invoice} from "../../types/index";
import QRCode from "qrcode";
import React from "react";
import {Font} from "@react-pdf/renderer";
import {styles} from "./stylesheet";
import {roundHalfUp} from "@/utils/helperMethods";

Font.register({
    family: "Amiri",
    src: "/fonts/Amiri-Regular.ttf", // path in your project
});

// Optional: register bold/italic if needed
Font.register({
    family: "Amiri-Bold",
    src: "/fonts/Amiri-Bold.ttf",
    fontWeight: "bold",
});

const getFontFamily = (text: string) => {
    // Arabic Unicode range: 0600–06FF
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text) ? "Amiri" : "Helvetica";
};


const API_URL = import.meta.env.VITE_BACKEND_SERVER_URL;

type PdfProps = {
    record: Invoice | undefined;
};



// return parts for display; decimals param controls fractional digits
function formatNumberParts(value: number | string | undefined, decimals = 2) {
    const n = Number(value || 0);
    const rounded = roundHalfUp(n, decimals);
    const s = rounded.toFixed(decimals); // always returns string with trailing zeros
    const [intPart, fracPart] = s.split(".");
    // we include the decimal point together with fractional part so it visually sticks to integer
    return { intPart, fracPart: "." + (fracPart ?? "".padEnd(decimals, "0")) };
}

export const PdfLayout: React.FC<PdfProps> = ({record}) => {
    const logoUrl = record?.account?.logo
        ? `${API_URL}${record?.account?.logo}`
        : undefined;

    const summaryData = [
        { en: "Sub Total", ar: "الإجمالي", value: record?.subtotal },
        { en: "Discount", ar: "الخصم", value: record?.total_discount_amount },
        { en: "VAT 15%", ar: "الضريبة", value: record?.tax_percentage },
        { en: "Net Total", ar: "المجموع", value: record?.total },
    ];

    const [qrCodeDataUrl, setQrCodeDataUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (record?.zatca_qr_code) {
            QRCode.toDataURL(record.zatca_qr_code, {errorCorrectionLevel: "H"})
                .then(setQrCodeDataUrl)
                .catch(console.error);
        }
    }, [record?.zatca_qr_code]);

    return (

                <Page style={styles.page} size="A3">
                    {/* Header Section */}
                    <View style={styles.headerSection}>
                        <View style={styles.companyInfo}>
                            {record?.account?.logo && (
                                <Image src={record.account.logo} style={styles.logo}/>
                            )}
                            <Text style={styles.companyName}>{"SyncShire Enterprises"}</Text>
                        </View>

                        <View style={{flex: 2, justifyContent: "center"}}>
                            {qrCodeDataUrl && (
                                <Image src={qrCodeDataUrl} style={styles.qrCode}/>
                            )}
                        </View>


                        {/* Row 1 */}
                        <View style={{flex: 3}}>
                            <View style={[styles.row1, {justifyContent: "flex-end"}]}>
                                <Text style={[styles.cell, styles.leftCell, styles.bolded]}>Invoice Id</Text>
                                <Text style={styles.cell}>{record?.invoice_id}</Text>
                                <Text style={[styles.cell, styles.rightCell, styles.cellArabic]}>رقم الفاتورة</Text>
                            </View>


                            {[
                                {label: "Invoice Name", value: record?.invoice_name, arabic: "رقم الفاتورة"},
                                {
                                    label: "Date & Time",
                                    value: record?.invoiceDate ? new Date(record.invoiceDate).toLocaleString("en-GB", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    }) : "",
                                    arabic: "التاريخ والوقت"
                                },
                                {
                                    label: "Delivery Date",
                                    value: record?.deliveryDate ? new Date(record.deliveryDate).toLocaleDateString("en-GB") : "",
                                    arabic: "تاريخ التسليم"
                                },
                                {label: "Tax Category", value: record?.tax_category, arabic: "فئة الضريبة"},
                                {label: "Payment Means", value: record?.payment_means, arabic: "طريقة الدفع"},
                                {label: "Invoice Reference", value: record?.reference_number, arabic: "المرجع"}
                            ].map((row, index) => (
                                <View key={index} style={[styles.row,]}>
                                    <Text style={[styles.cell, styles.leftCell, styles.bolded]}>{row.label}</Text>
                                    <Text style={[styles.cell]}>{row.value}</Text>
                                    <Text style={[styles.cell, styles.rightCell, styles.cellArabic]}>{row.arabic}</Text>
                                </View>
                            ))}
                            {/* Add more rows here */}
                        </View>
                    </View>

                    {/* Seller Details */}
                    <View style={styles.partyDetails}>
                        {/* Seller Box */}
                        <View style={styles.partyBox}>
                            <Text style={styles.partyTitle}>Seller Details | بيانات المورد</Text>
                            {[
                                {label: "Name", value: record?.myOrgProfile?.partyLegalEntityRegistrationName, arabic: "الاسم"},
                                {label: "VAT Number", value: record?.myOrgProfile?.partyTaxSchemeCompanyID, arabic: "الرقم الضريبي"},
                                {label: "Building No.", value: record?.myOrgProfile?.buildingNumber, arabic: "رقم المبنى"},
                                {label: "Street Name", value: record?.myOrgProfile?.streetName, arabic: "اسم الشارع"},
                                {label: "City", value: record?.myOrgProfile?.cityName, arabic: "المدينة"},
                                {label: "City Subdivision", value: record?.myOrgProfile?.citySubdivisionName, arabic: "الحي"},
                                {label: "Postal Code", value: record?.myOrgProfile?.postalZone, arabic: "الرمز البريدي"},
                                {label: "Country", value: record?.myOrgProfile?.countryIdentificationCode, arabic: "رمز الدولة"},
                                {label: "Commercial Registration (CRN)", value: record?.myOrgProfile?.partyId, arabic: "نوع الهوية"},
                            ].map((row, i) => (
                                <View style={styles.row} key={i}>
                                    <Text style={[styles.cell, styles.leftCell, styles.bolded]}>{row.label}</Text>
                                    <Text style={[styles.cell, styles.cellArabic]}>{row.value}</Text>
                                    <Text style={[styles.cell, styles.rightCell, styles.cellArabic]}>{row.arabic}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Buyer Box */}
                        <View style={styles.partyBox}>
                            <Text style={styles.partyTitle}>Buyer Details | بيانات العميل</Text>
                            {[
                                {
                                    label: "Name",
                                    value: record?.client?.partyLegalEntityRegistrationName,
                                    arabic: "الاسم"
                                },
                                {label: "VAT Number", value: record?.client?.partyTaxSchemeCompanyID, arabic: "الرقم الضريبي"},
                                {label: "Building No.", value: record?.client?.buildingNumber, arabic: "رقم المبنى"},
                                {label: "Street Name", value: record?.client?.streetName, arabic: "اسم الشارع"},
                                {label: "City", value: record?.client?.cityName, arabic: "المدينة"},
                                {label: "City Subdivision", value: record?.client?.citySubdivisionName, arabic: "الحي"},
                                {label: "Postal Code", value: record?.client?.postalZone, arabic: "الرمز البريدي"},
                                {label: "Country", value: record?.client?.countryIdentificationCode, arabic: "رمز الدولة"},
                                {label: "Commercial Registration Number (CRN)", value: "", arabic: ""},
                            ].map((row, i) => (
                                <View style={styles.row} key={i}>
                                    <Text style={[styles.cell, styles.leftCell, styles.bolded]}>{row.label}</Text>
                                    <Text style={[styles.cell, styles.cellArabic]}>{row.value}</Text>
                                    <Text style={[styles.cell, styles.rightCell, styles.cellArabic]}>{row.arabic}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <View style={styles.divider}/>

                    {/* Items Table */}
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.th, { flex: 0.5 }]}>
                                {`الرقم\nSl. No`}
                            </Text>
                            <Text style={[styles.th, { flex: 1 }]}>
                                {`رمز العنصر\nItem Code`}
                            </Text>
                            <Text style={[styles.th, { flex: 2 }]}>
                                {`الوصف\nDescription`}
                            </Text>
                            <Text style={[styles.th, { flex: 1 }]}>
                                {`الكمية\nQty`}
                            </Text>
                            <Text style={[styles.th, { flex: 1 }]}>
                                {`سعر الوحدة\nUnit Price`}
                            </Text>
                            <Text style={[styles.th, { flex: 1 }]}>
                                {`الخصم (%)\nDiscount (%)`}
                            </Text>
                            <Text style={[styles.th, { flex: 1 }]}>
                                {`الإجمالي\nTotal`}
                            </Text>
                        </View>
                        {/* Table Rows */}
                        {record?.services?.map((item, i) => {
                            // compute displayed parts
                            const qtyParts = formatNumberParts(item.quantity, 2);           // quantities -> 6 decimals
                            const unitPriceParts = formatNumberParts(item.unitPrice, 2);   // money -> 2 decimals
                            const discountParts = formatNumberParts(item.item_discount_amount, 2);
                            const totalParts = formatNumberParts(item.totalPrice, 2);

                            return (
                                <View key={i} style={styles.tableRow}>
                                    <View style={[styles.td, { flex: 0.5, justifyContent: "center" }]}>
                                        <Text style={styles.cellText}>{i + 1}</Text>
                                    </View>

                                    <View style={[styles.td, { flex: 1 }]}>
                                        <Text style={styles.cellText}>{item.item_code}</Text>
                                    </View>

                                    <View style={[styles.td, { flex: 2, paddingLeft: 4 }]}>
                                        <Text style={styles.cellText}>{item.name}</Text>
                                    </View>

                                    {/* Quantity (2 decimals) */}
                                    <View style={[styles.td, { flex: 1 }]}>
                                        <View style={styles.numberCell}>
                                            <Text style={styles.numberInt}>{qtyParts.intPart}</Text>
                                            <Text style={styles.numberDec6}>{qtyParts.fracPart}</Text>
                                        </View>
                                    </View>

                                    {/* Unit Price (2 decimals) */}
                                    <View style={[styles.td, { flex: 1 }]}>
                                        <View style={styles.numberCell}>
                                            <Text style={styles.numberInt}>{unitPriceParts.intPart}</Text>
                                            <Text style={styles.numberDec}>{unitPriceParts.fracPart}</Text>
                                        </View>
                                    </View>

                                    {/* Discount (2 decimals) */}
                                    <View style={[styles.td, { flex: 1 }]}>
                                        <View style={styles.numberCell}>
                                            <Text style={styles.numberInt}>{discountParts.intPart}</Text>
                                            <Text style={styles.numberDec}>{discountParts.fracPart}</Text>
                                        </View>
                                    </View>

                                    {/* Total (2 decimals) */}
                                    <View style={[styles.td, { flex: 1 }]}>
                                        <View style={styles.numberCell}>
                                            <Text style={styles.numberInt}>{totalParts.intPart}</Text>
                                            <Text style={styles.numberDec}>{totalParts.fracPart}</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.summaryTable}>
                        {summaryData.map((row, i) => {
                            const { intPart, fracPart } = formatNumberParts(row.value, 2);

                            return (
                                <View key={i} style={styles.summaryRow}>
                                    {/* Label cell */}
                                    <View style={styles.labelCell}>
                                        <Text>
                                            <Text style={styles.labelEn}>{row.en} </Text>
                                            <Text style={styles.labelAr}>{row.ar}</Text>
                                        </Text>
                                    </View>

                                    {/* Value cell */}
                                    <View style={styles.valueCell}>
                                        <Text>
                                            {intPart}
                                            <Text>{fracPart}</Text>
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            {record?.myOrgProfile?.cityName},
                        </Text>
                    </View>
                </Page>
    );
};