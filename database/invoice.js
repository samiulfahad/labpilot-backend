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

  static async findByDateRange(start, end, referrerId = null) {
    try {
      const db = getClient();

      const startDate = parseInt(start);
      const endDate = parseInt(end);

      // Construct the query
      const query = {
        invoiceId: { $gte: startDate, $lte: endDate },
      };
      // Add referrerId to query if provided
      if (referrerId) {
        query.referrerId = referrerId
      }
      // console.log(query);
      let projection = {
        invoiceId: 1,
        total: 1,
        commission: 1,
        discount: 1,
        labAdjustment: 1,
        netAmount: 1,
        paid: 1,
        "testList.name": 1,
      };
      // Fetch invoices with the query and projection
      const invoices = await db.collection("collection-1").find(query).project(projection).toArray();
      // console.log(invoices);
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
  static async findById(id, referrerName) {
    const userId = "675097ebd9d252419e9a7e98"
    try {
      const db = getClient();
      const invoice = await db.collection("collection-1").findOne({ _id: new ObjectId(id) });
      // console.log(invoice);
      let referrer
      if (invoice && referrerName) {
        referrer = await db.collection('users').aggregate([
          {
            $match: { _id: new ObjectId(userId) } // Match the specific user document
          },
          {
            $project: {
              referrerName: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$referrerList",
                      as: "referrer",
                      cond: {
                        $eq: ["$$referrer._id", new ObjectId(invoice.referrerId)]
                      }
                    }
                  },
                  0
                ]
              }
            }
          },
          {
            $project: {
              referrerName: "$referrerName.name" // Project only the 'name' field
            }
          }
        ]).toArray();
      
        referrer = referrer.length > 0 ? referrer[0].referrerName : "NOT AVAILABLE";

      }
      

      return invoice ? {...invoice, referrerName: referrer} : null;
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
