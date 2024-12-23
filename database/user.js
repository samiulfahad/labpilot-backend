/** @format */

const { getClient } = require("./connection");

const { ObjectId } = require("mongodb"); // Ensure ObjectId is imported
const handleError = (e, methodName) => {
  console.log("Error in database operation");
  console.log(`${methodName} produced an error`);
  console.log(e.message);
  return null;
};

class User {
  constructor(name) {
    this.name = name;
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

  static async cashMemo(startDate, endDate) {
    try {
      const db = getClient();

      // Apply date filter if provided
      const matchStage = {};
      if (startDate || endDate) {
        matchStage.invoiceId = {};
        if (startDate) matchStage.invoiceId.$gte = startDate;
        if (endDate) matchStage.invoiceId.$lte = endDate;
      }

      // Aggregation pipeline
      const pipeline = [
        { $match: matchStage },
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
      ];

      const result = await db.collection("collection-1").aggregate(pipeline).toArray();
      // console.log(result);
      if (!result) return null;

      // Return formatted cash memo
      return {
        totalSale: result[0]?.totalSale || 0,
        totalLabAdjustment: result[0]?.totalLabAdjustment || 0,
        totalReferrerDiscount: result[0]?.totalReferrerDiscount || 0,
        totalCommission: result[0]?.totalCommission || 0,
        totalReceived: result[0]?.totalReceived || 0,
        totalCashInCounter: result[0]?.totalCashInCounter || 0,
        totalNetAmount: result[0]?.totalNetAmount || 0,
        totalInvoice: result[0]?.totalInvoice || 0,
      };
    } catch (e) {
      return handleError(e, "cashMemo");
    }
  }

  // Version 1 (Without totalInvoice of each referrer)
  static async commissionTrackerV1(startDate, endDate) {
    try {
      const db = getClient();
  
      const result = await db.collection("collection-1").aggregate([
        // Filter invoices by invoiceId range
        {
          $match: {
            invoiceId: { $gte: startDate, $lte: endDate }
          }
        },
        // Select relevant fields before unwinding to reduce data size
        {
          $project: {
            referrerId: 1,
            testList: 1,
            commission: 1
          }
        },
        // Unwind the testList array for individual tests
        {
          $unwind: "$testList"
        },
        // Group by referrerId and test name, calculate the total count per test
        {
          $group: {
            _id: { referrerId: "$referrerId", testName: "$testList.name" },
            total: { $sum: 1 }
          }
        },
        // Reshape the output to group tests under each referrer
        {
          $group: {
            _id: "$_id.referrerId",
            testList: {
              $push: {
                testName: "$_id.testName",
                total: "$total"
              }
            }
          }
        },
        // Add referrer details and totalCommission using $lookup
        {
          $lookup: {
            from: "users",
            let: { referrerId: "$_id" },
            pipeline: [
              { $unwind: "$referrerList" },
              { $match: { $expr: { $eq: ["$referrerList._id", { $toObjectId: "$$referrerId" }] } } },
              {
                $project: {
                  "referrerList.name": 1,
                  "referrerList.isDoctor": 1
                }
              }
            ],
            as: "referrerDetails"
          }
        },
        // Flatten the referrerDetails array
        {
          $unwind: "$referrerDetails"
        },
        // Add totalCommission field using $lookup, optimized to avoid unnecessary queries
        {
          $lookup: {
            from: "collection-1",
            localField: "_id",
            foreignField: "referrerId",
            pipeline: [
              {
                $match: {
                  invoiceId: { $gte: startDate, $lte: endDate }
                }
              },
              {
                $group: {
                  _id: null,
                  totalCommission: { $sum: "$commission" }
                }
              }
            ],
            as: "commissionDetails"
          }
        },
        {
          $unwind: {
            path: "$commissionDetails",
            preserveNullAndEmptyArrays: true
          }
        },
        // Project the final output, reduce unnecessary data
        {
          $project: {
            _id: 0,
            referrerId: "$_id",
            name: "$referrerDetails.referrerList.name",
            isDoctor: "$referrerDetails.referrerList.isDoctor",
            totalCommission: "$commissionDetails.totalCommission",
            testList: 1
          }
        }
      ]).toArray();
  
      // console.log(result);
      return result;
    } catch (e) {
      return handleError(e, "commissionTrackerV1");
    }
  }
  





  // Version 2 (With totalInvoice of each referrer)
  static async commissionTrackerV2(startDate, endDate) {
    try {
      const db = getClient();

      // Step 1: Get the invoice count for each referrerId
      const invoiceCountResult = await db
        .collection("collection-1")
        .aggregate([
          {
            $match: {
              invoiceId: { $gte: startDate, $lte: endDate },
            },
          },
          {
            $group: {
              _id: "$referrerId",
              totalInvoice: { $sum: 1 }, // Count the total invoices for each referrerId
            },
          },
        ])
        .toArray();

      // Convert the invoice count result into a map for easy lookup
      const invoiceCountMap = invoiceCountResult.reduce((acc, item) => {
        acc[item._id] = item.totalInvoice;
        return acc;
      }, {});

      // Step 2: Run the main aggregation to get commission and test details
      const commissionResult = await db
        .collection("collection-1")
        .aggregate([
          {
            $match: {
              invoiceId: { $gte: startDate, $lte: endDate },
            },
          },
          {
            $unwind: "$testList",
          },
          {
            $group: {
              _id: { referrerId: "$referrerId", testName: "$testList.name" },
              total: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: "$_id.referrerId",
              testList: {
                $push: {
                  testName: "$_id.testName",
                  total: "$total",
                },
              },
            },
          },
          {
            $lookup: {
              from: "users",
              let: { referrerId: "$_id" },
              pipeline: [
                { $unwind: "$referrerList" },
                { $match: { $expr: { $eq: ["$referrerList._id", { $toObjectId: "$$referrerId" }] } } },
                {
                  $project: {
                    "referrerList.name": 1,
                    "referrerList.isDoctor": 1,
                  },
                },
              ],
              as: "referrerDetails",
            },
          },
          {
            $unwind: "$referrerDetails",
          },
          {
            $lookup: {
              from: "collection-1",
              localField: "_id",
              foreignField: "referrerId",
              pipeline: [
                {
                  $group: {
                    _id: null,
                    totalCommission: { $sum: "$commission" },
                  },
                },
              ],
              as: "commissionDetails",
            },
          },
          {
            $unwind: {
              path: "$commissionDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 0,
              referrerId: "$_id",
              name: "$referrerDetails.referrerList.name",
              isDoctor: "$referrerDetails.referrerList.isDoctor",
              totalCommission: "$commissionDetails.totalCommission",
              testList: 1,
            },
          },
        ])
        .toArray();

      // Step 3: Merge the invoice count into the commission result
      const finalResult = commissionResult.map((item) => {
        // Add the invoice count from the invoiceCountMap (if available)
        const totalInvoice = invoiceCountMap[item.referrerId] || 0;

        return {
          ...item,
          totalInvoice, // Add the totalInvoice count to the result
        };
      });

      // console.log(finalResult);
      return finalResult;
    } catch (e) {
      return handleError(e, "commissionTrackerWithStaticTests");
    }
  }






  static async getInvoicesByReferrerId(referrerId, startDate, endDate) {
    try {
      const db = getClient();
      const result = await db
        .collection("users")
        .findOne({ _id: new ObjectId(userId) }, { projection: { testList: 1, referrerList: 1, _id: 0 } });
      // console.log(result);
      return result.testList && result.referrerList
        ? { testList: result.testList, referrerList: result.referrerList }
        : null;
    } catch (e) {
      return handleError(e, "testList => User");
    }
  }




  

  static async getTestListAndReferrerList(userId) {
    try {
      const db = getClient();
      const result = await db
        .collection("users")
        .findOne({ _id: new ObjectId(userId) }, { projection: { testList: 1, referrerList: 1, _id: 0 } });
      // console.log(result);
      return result.testList && result.referrerList
        ? { testList: result.testList, referrerList: result.referrerList }
        : null;
    } catch (e) {
      return handleError(e, "testList => User");
    }
  }

  static async testList(userId) {
    try {
      const db = getClient(); // Assumes getClient() initializes the MongoDB connection
      const result = await db.collection("users").findOne(
        { _id: new ObjectId(userId) }, // Query by user ID
        { projection: { testList: 1, _id: 0 } } // Project only the testList field
      );
      // console.log(result.testList);

      return result.testList ? result.testList : null; // Return the testList array or an empty array if not found
    } catch (e) {
      return handleError(e, "testList => User");
    }
  }

  static async updateTestList(userId, testList) {
    try {
      const db = getClient(); // Assumes getClient() initializes the MongoDB connection

      // Update the user's testList
      const result = await db.collection("users").updateOne(
        { _id: new ObjectId(userId) }, // Filter: find the user by ID
        { $set: { testList: testList } } // Update operation
      );

      // Check if the update was successful
      if (result.matchedCount === 0) {
        return null; // No document found with the given userId
      }

      return true; // Successfully updated
    } catch (e) {
      return handleError(e, "testList => User");
    }
  }

  static async updateTest(userId, testId, field, value) {
    try {
      const db = getClient();

      // Perform the update using the positional operator `$`
      const result = await db.collection("users").updateOne(
        {
          _id: new ObjectId(userId), // Match the user by ID
          "testList._id": testId, // Match the specific test by ID
        },
        {
          $set: {
            [`testList.$.${field}`]: value, // Use positional operator `$` to target the matched test
          },
        }
      );

      console.log("Update Result:", result);

      return result.matchedCount > 0; // Return true if a document was matched
    } catch (e) {
      console.error("Error in updateTest:", e);
      return handleError(e, "testList => User");
    }
  }

  static async addReferrer(userId, name, commissionType, commission, isDoctor, description) {
    try {
      const db = getClient(); // Initialize the database connection

      // Create the new referrer object
      const newReferrer = {
        _id: new ObjectId(), // Generate a unique ID for the referrer
        name,
        commission,
        commissionType,
        isDoctor,
        description,
      };

      // Update the user's referrers array by adding the new referrer
      const result = await db.collection("users").updateOne(
        { _id: new ObjectId(userId) }, // Match the user by ID
        { $push: { referrerList: newReferrer } } // Push the new referrer into the referrers array
      );

      // Check if the update was successful

      return result.matchedCount === 1 ? true : null;
    } catch (e) {
      return handleError(e, "addReferrer => User");
    }
  }

  static async updateReferrer(userId, referrerId, updates) {
    try {
      // Validate `updates` to ensure it is an object
      if (typeof updates !== "object" || updates === null) {
        throw new Error("Invalid updates object");
      }

      const db = getClient();

      // Prepare the update object dynamically
      const setUpdates = {};
      for (const [field, value] of Object.entries(updates)) {
        setUpdates[`referrerList.$.${field}`] = value;
      }

      const result = await db.collection("users").updateOne(
        {
          _id: new ObjectId(userId), // Match the user by ID
          "referrerList._id": new ObjectId(referrerId), // Match the specific referrer by ID
        },
        {
          $set: setUpdates, // Dynamically set fields in the matched referrer
        }
      );

      console.log("Update Result:", result);

      return result.matchedCount > 0; // Return true if a document was matched
    } catch (e) {
      return handleError(e, "updateReferrer => User");
    }
  }

  static async referrerList(userId) {
    try {
      const db = getClient(); // Initialize the database connection
      const result = await db.collection("users").findOne(
        { _id: new ObjectId(userId) }, // Query by user ID
        { projection: { referrerList: 1, _id: 0 } } // Project only the testList field
      );
      return result.referrerList ? result.referrerList : null;
    } catch (e) {
      return handleError(e, "referrerList => User");
    }
  }
}

module.exports = User;
