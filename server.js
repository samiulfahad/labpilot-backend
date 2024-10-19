/** @format */

const express = require("express");
const cors = require("cors")

const invoiceController = require("./controller/invoice");
const { connect } = require("./database/connection");

const { patientValidationRules } = require("./validations/patientData");
const { invoiceValidationRules } = require("./validations/invoiceData");
const handleValidationErrors = require("./validations/handleValidationErrors");

const app = express();

//Middlewares
app.use(express.json({ limit: "10kb" }));
app.use(cors())

app.get("/", (req, res, next) => {
  res.status(200).send({ success: true, msg: "Server is running" });
});
app.post(
  "/api/v1/invoice/new",
  patientValidationRules,
  invoiceValidationRules,
  handleValidationErrors,
  invoiceController.CreateInvoice
);
app.get("/api/v1/invoice/all", invoiceController.GetAllInvoices);
app.get("/api/v1/invoice/clear", invoiceController.DropCollection);
app.put("/api/v1/invoice/update", invoiceController.Update);

// Error Handling Center
app.use((err, req, res, next) => {
  console.log(err);
  let errMsg = err.message;
  let statusCode = 500;
  if (err.message.includes("@statusCode")) {
    errMsg = err.message.split("@statusCode")[0];
    statusCode = err.message.split("@statusCode")[1];
    statusCode = parseInt(statusCode);
  }
  console.log("Centrall Error handling Starting..........");
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
