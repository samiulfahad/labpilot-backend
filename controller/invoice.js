/** @format */

const { validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");

const { validateContact, validateName, validateAge, validateDoctorName } = require("../validations/patientData");
const Invoice = require("../database/invoice");
const { generateDate } = require("../helpers/functions");

const AllowedList = ["CBC", "RBC", "XRAY", "ECG"];

// Validation Errors
const validationError = (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return { hasError: true, errors: errors.array() };
  } else {
    return { hasError: false };
  }
};

// Create a new invoice
const createInvoice = async (req, res, next) => {
  try {
    const { patientData, invoiceData } = req.body;
    // console.log(patientData);
    const invoice = new Invoice(patientData, invoiceData);
    const invoiceId = await Invoice.insertOne(invoice);
    if (invoiceId) {
      return res.status(201).send({ success: true, msg: "Invoice created", invoiceId });
    } else {
      return res.status(400).send({success: false})
    }
    // Create Uploadable Tests
    // CreateTest("bhaluka123", invoiceId, filteredTestList)
  } catch (e) {
    next(e);
  }
};

// Get Invoice by ID
const getInvoiceById = async (req, res, next) => {
  try {
    const { _id } = req.query;

    // Input validation
    if (!_id) {
      return res.status(400).send({ success: false, msg: "Missing required field" });
    }
    // Validate object id
    if (!ObjectId.isValid(_id)) {
      return res.status(400).send({ success: false, msg: "Object ID is NOT valid" });
    }

    const invoice = await Invoice.findById(_id);
    // console.log(invoice);
    if (invoice) {
      res.status(200).send({ success: true, invoice });
    } else {
      res.status(400).send({ success: false, msg: "Not Found" });
    }
  } catch (e) {
    next(e);
  }
};

// All invoices
const getAllInvoices = async (req, res, next) => {
  try {
    const result = await Invoice.findAll();
    if (result) {
      res.status(200).send({ success: true, total: result.total, invoices: result.invoices });
    } else {
      res.status(400).send({ success: false, msg: "Could not retrive data" });
    }
  } catch (e) {
    next(e);
  }
};

// Update invoice
const update = async (req, res, next) => {
  try {
    // console.log(req.body);
    const { _id, update } = req.body;

    
    // Input validation
    if (!_id || !update) {
      return res.status(400).send({ success: false, msg: "Missing required fields" });
    }
    
    if (!ObjectId.isValid(_id)) {
      return res.status(400).send({ success: false, msg: "Object ID is NOT valid" });
    }

    // // Validate update fields
    // if (!["payment", "reportDelivery", "notified", "name", "doctorName", "contact", "age", "gender"].includes(update)) {
    //   return res.status(400).send({ success: false, msg: "Invalid update type" });
    // }

    let result = null;

    // Update paid amount
    if (req.body.update === "payment") {
      result = await Invoice.updateById(req.body._id, "paid");
    }

    // Update delivery status
    if (req.body.update === "reportDelivery") {
      result = await Invoice.updateById(req.body._id, "delivered");
    }

    // Update name
    if (req.body.update === "name") {
      // Simulate `patientData.name` structure for validation
      req.body.patientData = { name: req.body.value };
      await validateName.run(req);
      const validation = validationError(req, res);
      if (validation.hasError) {
        return res.status(400).send({ success: false, errors: validation.errors });
      } else {
        result = await Invoice.updateById(_id, "name", req.body.value);
      }
    }

    // Update Age
    if (req.body.update === "age") {
      // Simulate `patientData.age` structure for validation
      req.body.patientData = { age: req.body.value };
      await validateAge.run(req);
      const validation = validationError(req, res);
      if (validation.hasError) {
        return res.status(400).send({ success: false, errors: validation.errors });
      } else {
        result = await Invoice.updateById(_id, "age", req.body.value);
      }
    }

    // Update contact
    if (req.body.update === "contact") {
      // Simulate `patientData.contact` structure for validation
      req.body.patientData = { contact: req.body.value };
      await validateContact.run(req);
      const validation = validationError(req, res);
      if (validation.hasError) {
        return res.status(400).send({ success: false, errors: validation.errors });
      } else {
        result = await Invoice.updateById(_id, "contact", req.body.value);
      }
    }

     // Update contact
     if (req.body.update === "doctorName") {
      // Simulate `patientData.contact` structure for validation
      req.body.patientData = { doctorName: req.body.value };
      await validateDoctorName.run(req);
      const validation = validationError(req, res);
      if (validation.hasError) {
        return res.status(400).send({ success: false, errors: validation.errors });
      } else {
        result = await Invoice.updateById(_id, "doctorName", req.body.value);
      }
    }

    // Update notified
    if (req.body.update === "notified") {
      result = await Invoice.updateById(req.body._id, { notified: true });
    }

    // Sending back response
    if (result && result.success) {
      res.status(200).send({ success: true, message: "Updated" });
    } else {
      res.status(400).send({ success: false, message: "No matching update found" });
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

module.exports = { createInvoice, getInvoiceById, getAllInvoices, notifyPatient, update, dropCollection };
