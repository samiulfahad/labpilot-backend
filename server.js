/** @format */

const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');

require('dotenv').config();
const verifyAccessToken = require('./middlewares/auth');
const invoiceController = require("./controller/invoice");
const systemController = require("./controller/system");
const labController = require("./controller/lab");
const labAccountController = require('./controller/system/labAccount')

const { connect } = require("./database/connection");

const { patientValidationRules } = require("./validations/patientData");
const { invoiceValidationRules } = require("./validations/invoiceData");
const handleValidationErrors = require("./validations/handleValidationErrors");

const app = express();

//Middlewares
app.use(express.json({ limit: "10kb" }));
const corsOptions = {
  origin: "http://localhost:5173", // Allow only your frontend
  credentials: true, // Allow cookies and authorization headers
};

app.use(cors(corsOptions));
app.use(cookieParser())

app.get("/", (req, res, next) => {
  res.status(200).send({ success: true, msg: "Server is running" });
});

app.post(
  "/api/v1/invoice/new",
  patientValidationRules,
  invoiceValidationRules,
  handleValidationErrors,
  invoiceController.postInvoice
);

app.get("/api/v1/invoice", invoiceController.getInvoiceById);
app.get("/api/v1/invoice/all", verifyAccessToken, invoiceController.getAllInvoices);
app.get("/api/v1/invoice/render-list", invoiceController.getInvoicesByDate);

app.put("/api/v1/invoice/update/actions", invoiceController.putActions);
app.put(
  "/api/v1/invoice/update/patient-data",
  patientValidationRules,
  handleValidationErrors,
  invoiceController.putPatientData
);

app.get("/api/v1/invoice/date", invoiceController.getInvoicesByDate);
app.get("/api/v1/invoice/clear", invoiceController.dropCollection);

app.post("/api/v1/lab/login", labController.login);
app.post("/api/v1/lab/auth/refresh-token", labController.refreshAccessToken)
app.post("/api/v1/lab/logout", verifyAccessToken, labController.logout)
app.get("/api/v1/lab/dataForNewInvoice", labController.getDataForNewInvoice);
app.get("/api/v1/lab/cashmemo", labController.getCashMemo);
app.get("/api/v1/lab/commission-tracker", labController.getCommissionTracker);
app.get("/api/v1/lab/test/all", labController.getTestList);
app.post("/api/v1/lab/staff-management/add", labController.postStaff);
app.put("/api/v1/lab/staff-management/edit", labController.putStaff);
app.patch("/api/v1/lab/staff-management/terminate", labController.terminateStaff);
app.get("/api/v1/lab/staffs", labController.getStaffList);
app.post("/api/v1/lab/referrer/add", labController.postReferrer);
app.put("/api/v1/lab/referrer/edit", labController.putReferrer);
app.get("/api/v1/lab/referrer/all", labController.getReferrerList);
app.put("/api/v1/lab/test/update", labController.putTest);
app.put("/api/v1/lab/testlist/update", labController.putTestList);


app.get("/api/v1/system/test/all", systemController.getAllTest);
app.post("/api/v1/system/add/lab", systemController.postLab)
app.post("/api/v1/system/test/add", systemController.postTest);

app.post("/api/v1/system/lab/add", labAccountController.postLab)


// 404 Not Found Handler
app.use((req, res, next) => {
  res.status(404).send({
    success: false,
    message: "The requested resource was not found on this server.",
    statusCode: 404,
  });
});

// Error Handling Center
app.use((err, req, res, next) => {
  // console.log(err);
  let errMsg = err.message;
  let statusCode = 500;
  if (err.message.includes("@statusCode")) {
    errMsg = err.message.split("@statusCode")[0];
    statusCode = err.message.split("@statusCode")[1];
    statusCode = parseInt(statusCode);
  }
  console.log("Centrall Error handling Starting..........");
  console.log(errMsg);
  console.log("Details error");
  console.log(err);
  console.log("Centrall Error handling Ending..........");
  res.status(statusCode).send({ success: false, message: errMsg, statusCode });
});

// Start the Server
app.listen(3000, async () => {
  console.log("Server is running");
  try {
    await connect();
  } catch (e) {
    console.log("Error in connecting database");
    console.log(e);
  }
});
