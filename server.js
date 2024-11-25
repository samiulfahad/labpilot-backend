/** @format */

const express = require("express");
const cors = require("cors");

const invoiceController = require("./controller/invoice");
const systemController = require("./controller/system");
const userController = require("./controller/user");

const { connect } = require("./database/connection");

const { patientValidationRules } = require("./validations/patientData");
const { validateName, validateContact } = require("./validations/patientData");
const { invoiceValidationRules } = require("./validations/invoiceData");
const handleValidationErrors = require("./validations/handleValidationErrors");

const app = express();

//Middlewares
app.use(express.json({ limit: "10kb" }));
app.use(cors());

app.get("/", (req, res, next) => {
  res.status(200).send({ success: true, msg: "Server is running" });
});
app.post(
  "/api/v1/invoice/new",
  patientValidationRules,
  invoiceValidationRules,
  handleValidationErrors,
  invoiceController.createInvoice
);
app.get("/api/v1/invoice", invoiceController.getInvoiceById);
app.get("/api/v1/invoice/all", invoiceController.getAllInvoices);
app.put("/api/v1/invoice/update", invoiceController.update);
app.get("/api/v1/invoice/clear", invoiceController.dropCollection);

app.get("/api/v1/global/test/all", systemController.getAllTest);
app.post("/api/v1/global/test/add", systemController.postTest);

app.get("/api/v1/user/test/all", userController.getTestList);
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
