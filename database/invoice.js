/** @format */

const { ObjectId } = require("mongodb");

const { getClient } = require("./connection");
const { generateInvoiceId } = require("../helpers/functions");

const handleError = (e, methodName) => {
  console.log(`${methodName} produced an error`);
  console.log(e);
  return null;
};

class Invoice {
  constructor(patientData, invoiceData) {
    const invoiceId = generateInvoiceId();
    this.invoiceId = invoiceId;
    this.name = patientData.name;
    this.age = patientData.age;
    this.gender = patientData.gender;
    this.contact = patientData.contact;
    this.doctorName = patientData.doctorName;
    this.referrerId = invoiceData.referrerId;
    this.total = invoiceData.total;
    this.netAmount = invoiceData.netAmount;
    this.discount = invoiceData.discount;
    this.discountType = invoiceData.discountType;
    this.paid = invoiceData.paid;
    this.testList = invoiceData.testList;
    this.notified = false;
    this.labId = "bhaluka123";
  }

  // Create a new invoice
  static async insertOne(doc) {
    try {
      const db = getClient();
      const result = await db.collection("collection-1").insertOne(doc);
      return result.insertedId ? doc.invoiceId : null;
    } catch (e) {
      return handleError(e, "insertOne");
    }
  }

  // Find one document by id
  static async findById(id) {
    try {
      const db = getClient();
      const invoice = await db.collection("collection-1").findOne({ _id: id });
      return invoice ? { success: true, invoice } : null;
    } catch (e) {
      return handleError(e, "findById");
    }
  }

  static async findAll() {
    try {
      const db = getClient();
      const projection = {
        invoiceId: 1,
        name: 1,
        contact: 1,
        netAmount: 1,
        paid: 1,
        testList: 1,
        completed: 1,
        delivered: 1,
        notified: 1,
      };
      const invoices = await db.collection("collection-1").find({}).project(projection).toArray();
      const total = await db.collection("collection-1").countDocuments();
      return { total, invoices };
    } catch (e) {
      return handleError(e, "findAll");
    }
  }

  // Count all documents of a collection
  static async countAll() {
    try {
      const db = getClient();
      const count = await db.collection("collection-1").countDocuments();
      if (count) {
        return count;
      }
    } catch (e) {
      return handleError(e, "countAll");
    }
  }

  // Update a document
  static async updateById(_id, update) {
    try {
      const db = getClient();
      const filter = { _id: new ObjectId(_id) };

      if (update === "paid") {
        // Fetch the document to get the current netAmount
        const document = await db.collection("collection-1").findOne(filter);
        if (!document) {
          return { success: false, message: "Document not found" };
        }

        // Update the paid field to match netAmount
        const result = await db.collection("collection-1").updateOne(filter, {
          $set: { paid: document.netAmount },
        });

        return result.modifiedCount === 1
          ? { success: true, message: "Paid amount updated successfully" }
          : { success: false, message: "Update failed" };
      }

      // Generic update logic for other updates
      const result = await db.collection("collection-1").updateOne(filter, {
        $set: update,
      });

      return result.modifiedCount === 1
        ? { success: true, message: "Document updated successfully" }
        : { success: false, message: "Update failed" };
    } catch (e) {
      return handleError(e, "updateById");
    }
  }

  // Drop a collection
  static async dropCollection() {
    try {
      const db = getClient();
      const result = await db.collection("collection-1").drop();
      if (result) {
        return true;
      } else {
        return null;
      }
    } catch (e) {
      return handleError(e, "dropCollection");
    }
  }
}

module.exports = Invoice;
