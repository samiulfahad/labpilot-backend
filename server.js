/** @format */

const express = require("express");
const cors = require("cors");

const invoiceController = require("./controller/invoice");
const systemController = require("./controller/system");
const userController = require("./controller/user");

const { connect } = require("./database/connection");

const { patientValidationRules } = require("./validations/patientData");
const { invoiceValidationRules } = require("./validations/invoiceData");
const handleValidationErrors = require("./validations/handleValidationErrors");

const app = express();

//Middlewares
app.use(express.json({ limit: "10kb" }));
app.use(cors());

app.get("/", (req, res, next) => {
  res.status(200).send({ success: true, msg: "Server is running" });
});
app.get("/api/v1/user/dataForNewInvoice", userController.getDataForNewInvoice);

app.get("/api/v1/user/cashmemo", userController.getCashMemo);
app.get("/api/v1/user/commission-tracker", userController.getCommissionTracker);

app.post(
  "/api/v1/invoice/new",
  patientValidationRules,
  invoiceValidationRules,
  handleValidationErrors,
  invoiceController.postInvoice
);
app.get("/api/v1/invoice", invoiceController.getInvoiceById);
app.get("/api/v1/invoice/all", invoiceController.getAllInvoices);
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

app.post("/api/v1/system/user/add", systemController.postUser);
app.get("/api/v1/system/test/all", systemController.getAllTest);
app.post("/api/v1/system/test/add", systemController.postTest);

app.get("/api/v1/user/test/all", userController.getTestList);
app.post("/api/v1/user/referrer/add", userController.postReferrer);
app.put("/api/v1/user/referrer/edit", userController.putReferrer);
app.get("/api/v1/user/referrer/all", userController.getReferrerList);
app.put("/api/v1/user/test/update", userController.putTest);
app.put("/api/v1/user/testlist/update", userController.putTestList);

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
