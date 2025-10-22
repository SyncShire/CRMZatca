import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";

import connectDB from "./mongodb/connect.js";

import userRouter from "./routes/user.routes.js";
import propertyRouter from "./routes/property.routes.js";
import clientRouter from "./routes/client.routes.js";
import accountRouter from "./routes/account.routes.js";
import fileUploadRouter from "./middleware/fileUpload.middleware.js";
import currencyRouter from "./routes/currency.routes.js";
import path from "path";
import {fileURLToPath} from "url";
import {dirname} from "path";
import invoiceRouter from "./routes/invoice.routes.js";
import eventRouter from "./routes/event.routes.js";
import analyticsRouter from "./routes/analytics.routes.js";
import clientMediaRouter from "./routes/clientmedia.routes.js";
import onboardClientRouter from "./routes/onboardclient.routes.js";
import myorgprofileRouter from "./routes/myorgprofile.routes.js";
import zatcaBackendRouter from "./routes/zatcabackend.routes.js";
import zatcaComplianceCheckRouter from "./middleware/zatcaComplianceApi.js";
import zatcaReportInvoiceRouter from "./middleware/zatcaReportingApi.js";
import embedPdfRouter from "./middleware/embeddedPdf.js";
import inventoryItemRouter from "./routes/inventoryitem.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({limit: "50mb"}));

app.get("/", (req, res) => {
    res.send({message: "Hello World!"});
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/properties", propertyRouter);
app.use("/api/v1/upload", fileUploadRouter);
app.use("/api/v1/clients", clientRouter);
app.use("/api/v1/accounts", accountRouter);
app.use("/api/v1/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/v1/currencies", currencyRouter);
app.use("/api/v1/invoices", invoiceRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/analytics", analyticsRouter);

app.use("/api/v1/clientmedias", clientMediaRouter);
app.use("/api/v1/myorgprofile", myorgprofileRouter);
app.use("/api/v1/inventoryitems", inventoryItemRouter);


app.use("/api/v1/zatca/onboardClient", onboardClientRouter);
app.use("/api/v1/zatca/checkInvoicesCompliance", zatcaComplianceCheckRouter);
app.use("/api/v1/zatca/reportInvoice", zatcaReportInvoiceRouter);
app.use("/api/v1/zatca", zatcaBackendRouter);


app.use("/api/v1/embedPdf", embedPdfRouter);
app.use("/api/v1/clients/embedPdf", embedPdfRouter);
app.use("/api/v1/clients/checkInvoicesCompliance", zatcaComplianceCheckRouter);
app.use("/api/v1/clients/reportInvoice", zatcaReportInvoiceRouter);
app.use("/api/v1/clients/zatca", zatcaBackendRouter);
app.use("/api/v1/pdf/embed-xml", embedPdfRouter);

const startServer = async () => {
    try {
        //connect to database
        connectDB(process.env.MONGODB_URL);

        const port = process.env.PORT || 8081;

        app.listen(port, () => console.log(`Server has started on port: ${port}`));
    } catch (error) {
        console.log(error);
    }
};

startServer();
