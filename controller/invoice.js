/** @format */

const Invoice = require("../database/invoice");
const { generateDate } = require("../helpers/functions");
const AllowedList = ["CBC", "RBC", "XRAY", "ECG"];

// Create a new invoice
const createInvoice = async (req, res, next) => {
  try {
    const { patientData, invoiceData } = req.body;
    console.log(patientData);
    const invoice = new Invoice(patientData, invoiceData);
    const invoiceId = await Invoice.insertOne(invoice);
    if (invoiceId) {
      res.status(201).send({ success: true, msg: "Invoice created", invoiceId, date: generateDate(), statusCode: 201 });
    } else {
      throw new Error("Could not create a new invoice @statusCode 500");
    }
    // Create Uploadable Tests
    // CreateTest("bhaluka123", invoiceId, filteredTestList)
  } catch (e) {
    next(e);
  }
};

// All invoices
const getAllInvoices = async (req, res, next) => {
  try {
    const result = await Invoice.findAll();
    if (result) {
      res.status(201).send({ success: true, total: result.total, invoices: result.invoices });
    } else {
      throw new Error("Could not get all invoices @statusCode 500");
    }
  } catch (e) {
    next(e);
  }
};

// Send SMS to Patient
const notifyPatient = async (req, res, next) => {
  try {
    const result = await Invoice.updateByInvoiceId(req.body.invoiceId, { notified: true });
    if (result) {
      res.status(201).send({ success: true, total: result.total, invoices: result.invoices });
    } else {
      throw new Error("Could not get send SMS @statusCode 500");
    }
  } catch (e) {
    next(e);
  }
};

// Update invoice
const update = async (req, res, next) => {
  try {
    const { _id, update } = req.body;

    // Input validation
    if (!_id || !update) {
      return res.status(400).send({ success: false, msg: "Missing required fields" });
    }

    // Validate update fields
    if (!["payment", "reportDelivery", "notified"].includes(update)) {
      return res.status(400).send({ success: false, msg: "Invalid update type" });
    }

    let result = null;

    // Update paid amount
    if (req.body.update === "payment") {
      result = await Invoice.updateById(req.body._id, "paid");
    }
    
    // Update delivery status
    if (req.body.update === "reportDelivery") {
      result = await Invoice.updateById(req.body._id, "delivered");
    }

    // Update notified
    if (req.body.update === "notified") {
      result = await Invoice.updateById(req.body._id, { notified: true });
    }

    // Sending back response
    if (result && result.success) {
      res.status(200).send({ success: true, message: "Updated" });
    } else {
      res.status(400).send({ success: false, message: "Failed to update" });
    }
  } catch (e) {
    next(e);
  }
};

// Drop a collection
const dropCollection = async (req, res, next) => {
  try {
    const result = await Invoice.dropCollection();
    if (result) {
      res.status(200).send({ success: true, msg: "Collection cleared" });
    } else {
      throw new Error("Could not clear invoice collection @statusCode 500");
    }
  } catch (e) {
    next(e);
  }
};

module.exports = { createInvoice, getAllInvoices, notifyPatient, update, dropCollection };
