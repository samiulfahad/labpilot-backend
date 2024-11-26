/** @format */

const { ObjectId } = require("mongodb");

const Invoice = require("../database/invoice");

// Create a new invoice
const postInvoice = async (req, res, next) => {
  try {
    const { patientData, invoiceData } = req.body;
    // console.log(patientData);
    const invoice = new Invoice(patientData, invoiceData);
    const invoiceId = await Invoice.insertOne(invoice);
    if (invoiceId) {
      return res.status(201).send({ success: true, msg: "Invoice created", invoiceId });
    } else {
      return res.status(400).send({ success: false });
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

// Update patient data
const putPatientData = async (req, res, next) => {
  const { _id, patientData } = req.body;
  if ((!_id, !patientData)) {
    return res.status(400).send({ success: false, msg: "Missing Required Fields" });
  }
  console.log(patientData);
  console.log(_id);
  // Validate object id
  if (!ObjectId.isValid(_id)) {
    return res.status(400).send({ success: false, msg: "Object ID is NOT valid" });
  }
  try {
    const result = await Invoice.updateById(_id, patientData);
    console.log(result);
    if (result) {
      return res.status(200).send({ success: true });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

// Update invoice actions
const putActions = async (req, res, next) => {
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

    let result = null;

    // Update paid amount
    if (req.body.update === "payment") {
      result = await Invoice.updateActions(req.body._id, "paid");
    }

    // Update delivery status
    if (req.body.update === "reportDelivery") {
      result = await Invoice.updateActions(req.body._id, "delivered");
    }

    // Update notified
    if (req.body.update === "notified") {
      result = await Invoice.updateActions(req.body._id, "notified");
    }

    // Sending back response
    if (result) {
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

module.exports = {
  postInvoice,
  putActions,
  putPatientData,
  getInvoiceById,
  getAllInvoices,
  notifyPatient,
  dropCollection,
};
