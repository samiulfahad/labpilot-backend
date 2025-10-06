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
const labZoneController = require('./controller/system/labZone')

const { connect } = require("./database/connection");

// Input Data validation Rules
const { patientValidationRules } = require("./validations/patientData");
const { invoiceValidationRules } = require("./validations/invoiceData");
const { labAccountValidationRules, validateLabId } = require("./validations/labAccount")
const { searchLabValidationRules } = require("./validations/labSearch")
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



// System Routes
app.get("/api/v1/system/test/all", systemController.getAllTest);
app.post("/api/v1/system/test/add", systemController.postTest);


// Register a new lab
app.post("/api/v1/system/lab/add",
  labAccountValidationRules,
  handleValidationErrors,
  labAccountController.postLab
)

// Search a lab
app.get("/api/v1/system/lab/search",
  searchLabValidationRules,
  handleValidationErrors,
  labAccountController.getLab
)

// Get a lab by zone 

// List of all labs
app.get("/api/v1/system/lab/all", labAccountController.getAllLabs)

// Edit lab data
app.patch("/api/v1/system/lab/edit",
  labAccountValidationRules,
  handleValidationErrors,
  labAccountController.patchLab
)

// delete a lab
app.delete("/api/v1/system/lab/delete",
  validateLabId,
  handleValidationErrors,
  labAccountController.deleteLab
)

// Lab Zone routes
app.post("/api/v1/system/labzone/add", labZoneController.postZone)
app.put("/api/v1/system/labzone/edit", labZoneController.putZone)
app.delete("/api/v1/system/labzone/delete", labZoneController.deleteZone)
app.get("/api/v1/system/labzone/all", labZoneController.getZones)
// Lab Sub Zone routes
app.post("/api/v1/system/labzone/subzone/add", labZoneController.postSubZone)
app.put("/api/v1/system/labzone/subzone/edit", labZoneController.putSubZone)
app.delete("/api/v1/system/labzone/subzone/delete", labZoneController.putSubZone)




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
