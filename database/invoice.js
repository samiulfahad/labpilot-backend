/** @format */

const { ObjectId } = require("mongodb");

const { getClient } = require("./connection");
const { generateInvoiceId } = require("../helpers/functions");

const handleError = (e, methodName) => {
  console.log("Error in database operation");
  console.log(`${methodName} produced an error`);
  console.log(e.message);
  return null;
};

class Invoice {
  constructor(patientData, invoiceData) {
    this.invoiceId = generateInvoiceId();
    this.referrerId = invoiceData.referrerId;
    this.name = patientData.name;
    this.age = patientData.age;
    this.contact = patientData.contact;
    this.gender = patientData.gender;
    this.doctorName = patientData.doctorName;
    this.total = invoiceData.total;
    this.discount = invoiceData.discount;
    this.labAdjustment = invoiceData.labAdjustment;
    this.netAmount = invoiceData.netAmount;
    this.paid = invoiceData.paid;
    this.commission = invoiceData.commission;
    this.testList = invoiceData.testList;
    this.notified = false;
    this.delivered = false;
    this.labId = "bhaluka123";
  }


  static async cashMemoWithInvoices(startDate, endDate, page = 1, limit = 50) {
    try {
      const db = getClient();
  
      // Build match stage based on the date range
      const matchStage = {};
      if (startDate || endDate) {
        matchStage.invoiceId = {};
        if (startDate) matchStage.invoiceId.$gte = parseInt(startDate);
        if (endDate) matchStage.invoiceId.$lte = parseInt(endDate);
      }
  
      // Aggregation pipeline for combined data
      const pipeline = [
        { $match: matchStage },
        {
          $facet: {
            summary: [
              {
                $group: {
                  _id: null,
                  totalSale: { $sum: "$total" },
                  totalLabAdjustment: { $sum: "$labAdjustment" },
                  totalReferrerDiscount: { $sum: "$discount" },
                  totalCommission: { $sum: "$commission" },
                  totalReceived: { $sum: "$paid" },
                  totalNetAmount: { $sum: "$netAmount" },
                  totalInvoice: { $count: {} },
                },
              },
            ],
            invoices: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              {
                $project: {
                  _id: 0, // Exclude MongoDB internal ID if not needed
                  invoiceId: 1,
                  name: 1,
                  testList: 1,
                  total: 1,
                  discount: 1,
                  labAdjustment: 1,
                  netAmount: 1,
                  paid: 1,
                  commission: 1,
                },
              },
            ],
          },
        },
      ];
  
      const result = await db.collection("collection-1").aggregate(pipeline).toArray();
  
      // Format the final result
      const summary = result[0]?.summary[0] || {};
      const invoices = result[0]?.invoices || [];
  
      return {
        cashMemo: {
          totalSale: summary.totalSale || 0,
          totalLabAdjustment: summary.totalLabAdjustment || 0,
          totalReferrerDiscount: summary.totalReferrerDiscount || 0,
          totalCommission: summary.totalCommission || 0,
          totalReceived: summary.totalReceived || 0,
          totalNetAmount: summary.totalNetAmount || 0,
          totalInvoice: summary.totalInvoice || 0,
        },
        invoices,
      };
    } catch (e) {
      return handleError(e, "cashMemoWithInvoices");
    }
  }
  


  // Find invoices created in a specific month
  static async findByMonth(year, month) {
    try {
      const db = getClient();
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      const invoices = await db
        .collection("collection-1")
        .find({
          createdAt: { $gte: startDate, $lte: endDate },
        })
        .toArray();
      return invoices;
    } catch (e) {
      return handleError(e, "findByMonth");
    }
  }

  // Find invoices for a specific date
  static async findByDate(year, month, day) {
    try {
      const db = getClient();
      const startDate = new Date(year, month - 1, day);
      const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
      const invoices = await db
        .collection("collection-1")
        .find({
          createdAt: { $gte: startDate, $lte: endDate },
        })
        .toArray();
      return invoices;
    } catch (e) {
      return handleError(e, "findByDate");
    }
  }

  // Find invoices within a date range
  static async findByDateRange(start, end) {
    try {
      const db = getClient();
      const startDate = parseInt(start);
      const endDate = parseInt(end);
      const invoices = await db
        .collection("collection-1")
        .find({ invoiceId: { $gte: startDate, $lte: endDate } })
        .toArray();
      return invoices ? invoices : null;
    } catch (e) {
      return handleError(e, "findByDateRange");
    }
  }

  // Create invoice
  static async insertOne(doc) {
    try {
      const db = getClient();
      const result = await db.collection("collection-1").insertOne(doc);
      return result.insertedId ? doc.invoiceId : null;
    } catch (e) {
      return handleError(e, "insertOne");
    }
  }

  // Find invoice by id
  static async findById(id) {
    try {
      const db = getClient();
      const invoice = await db.collection("collection-1").findOne({ _id: new ObjectId(id) });
      // console.log(invoice);
      return invoice ? invoice : null;
    } catch (e) {
      return handleError(e, "findById");
    }
  }

  // Find All Invoices
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
      // console.log(invoices);
      const total = await db.collection("collection-1").countDocuments();
      return { total, invoices };
    } catch (e) {
      return handleError(e, "findAll");
    }
  }

  // Update Patient Data
  static async updateById(_id, patientData) {
    const { name, age, contact, gender, doctorName } = patientData;
    const update = { name, age, contact, gender, doctorName };
    try {
      const db = getClient();
      const filter = { _id: new ObjectId(_id) };
      const result = await db.collection("collection-1").updateOne(filter, { $set: update });
      return result.modifiedCount === 1 ? true : null;
    } catch (e) {
      return handleError(e, "updateById");
    }
  }

  // Update invoice actions
  static async updateActions(_id, update) {
    try {
      const db = getClient();
      const filter = { _id: new ObjectId(_id) };
      if (update === "paid") {
        const result = await db.collection("collection-1").updateOne(filter, [{ $set: { paid: "$netAmount" } }]);
        return result.modifiedCount === 1 ? true : null;
      } else if (update === "delivered") {
        const result = await db.collection("collection-1").updateOne(filter, { $set: { delivered: true } });
        return result.modifiedCount === 1 ? true : null;
      } else if (update === "notified") {
        const result = await db.collection("collection-1").updateOne(filter, { $set: { notified: true } });
        return result.modifiedCount === 1 ? true : null;
      } else {
        return null;
      }
    } catch (e) {
      return handleError(e, "updateById");
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
