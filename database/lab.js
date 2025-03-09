/** @format */

const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb"); // Ensure ObjectId is imported
const bcrypt = require("bcryptjs");

const { getClient } = require("./connection");

const handleError = (e, methodName) => {
  console.log(`Error in database => lab.js => fn ${methodName}`);
  console.log(e.message);
  return null;
};

class Lab {
  constructor(name) {
    this.name = name;
  }

  // Function 1
  // Cash Memo with associated invoices
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

  // Function 2
  // Cash Memo
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

  // Function 3
  // Commission Tracker without totalInvoice of each referrer
  static async commissionTrackerV1(startDate, endDate) {
    try {
      const db = getClient();

      const result = await db
        .collection("collection-1")
        .aggregate([
          // Filter invoices by invoiceId range
          {
            $match: {
              invoiceId: { $gte: startDate, $lte: endDate },
            },
          },
          // Select relevant fields before unwinding to reduce data size
          {
            $project: {
              referrerId: 1,
              testList: 1,
              commission: 1,
            },
          },
          // Unwind the testList array for individual tests
          {
            $unwind: "$testList",
          },
          // Group by referrerId and test name, calculate the total count per test
          {
            $group: {
              _id: { referrerId: "$referrerId", testName: "$testList.name" },
              total: { $sum: 1 },
            },
          },
          // Reshape the output to group tests under each referrer
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
          // Add referrer details and totalCommission using $lookup
          {
            $lookup: {
              from: "labs",
              let: { referrerId: "$_id" },
              pipeline: [
                { $unwind: "$referrers" },
                { $match: { $expr: { $eq: ["$referrers._id", { $toObjectId: "$$referrerId" }] } } },
                {
                  $project: {
                    "referrers.name": 1,
                    "referrers.isDoctor": 1,
                  },
                },
              ],
              as: "referrerDetails",
            },
          },
          // Flatten the referrerDetails array
          {
            $unwind: "$referrerDetails",
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
                    invoiceId: { $gte: startDate, $lte: endDate },
                  },
                },
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
          // Project the final output, reduce unnecessary data
          {
            $project: {
              _id: 0,
              referrerId: "$_id",
              name: "$referrerDetails.referrers.name",
              isDoctor: "$referrerDetails.referrers.isDoctor",
              totalCommission: "$commissionDetails.totalCommission",
              testList: 1,
            },
          },
        ])
        .toArray();

      // console.log(result);
      return result;
    } catch (e) {
      return handleError(e, "commissionTrackerV1");
    }
  }

  // Function 4
  // Commission Tracker with totalInvoice of each referrer
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
              from: "labs",
              let: { referrerId: "$_id" },
              pipeline: [
                { $unwind: "$referrers" },
                { $match: { $expr: { $eq: ["$referrers._id", { $toObjectId: "$$referrerId" }] } } },
                {
                  $project: {
                    "referrers.name": 1,
                    "referrers.isDoctor": 1,
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
              name: "$referrerDetails.referrers.name",
              isDoctor: "$referrerDetails.referrers.isDoctor",
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

  // incomplete
  // Function 5
  // Invoices by Referrer ID
  static async invoicesByReferrerId(referrerId, startDate, endDate) {
    try {
      const db = getClient();
      const result = await db
        .collection("labs")
        .findOne({ _id: new ObjectId(userId) }, { projection: { testList: 1, referrers: 1, _id: 0 } });
      // console.log(result);
      return result.testList && result.referrers ? { testList: result.testList, referrers: result.referrers } : null;
    } catch (e) {
      return handleError(e, "invoicesByReferrerId");
    }
  }

  // Function 6
  // Data for creating new invoice
  static async dataForNewInvoice(labUId) {
    try {
      const db = getClient();
      const result = await db
        .collection("labs")
        .findOne({ _id: new ObjectId(labUId) }, { projection: { testList: 1, referrers: 1, _id: 0 } });
      // console.log(result);
      return result.testList && result.referrers ? { tests: result.testList, referrers: result.referrers } : null;
    } catch (e) {
      return handleError(e, "dataForNewInvoice");
    }
  }

  // Function 7
  // Testlist of a lab
  static async testList(labUId) {
    try {
      const db = getClient(); // Assumes getClient() initializes the MongoDB connection
      const result = await db.collection("labs").findOne(
        { _id: new ObjectId(labUId) }, // Query by lab ID
        { projection: { testList: 1, _id: 0 } } // Project only the testList field
      );
      // console.log(result.testList);

      return result.testList ? result.testList : null; // Return the testList array or an empty array if not found
    } catch (e) {
      return handleError(e, "testList");
    }
  }

  // Function 8
  // Update Testlist of a lab
  static async updateTestList(labUId, testList) {
    try {
      const db = getClient(); // Assumes getClient() initializes the MongoDB connection

      // Update the user's testList
      const result = await db.collection("labs").updateOne(
        { _id: new ObjectId(labUId) }, // Filter: find the lab by ID
        { $set: { testList: testList } } // Update operation
      );

      // Check if the update was successful
      if (result.matchedCount === 0) {
        return null; // No document found with the given userId
      }

      return true; // Successfully updated
    } catch (e) {
      return handleError(e, "updateTestList");
    }
  }

  // Function 9
  // Update a test
  static async updateTest(labUId, testId, field, value) {
    try {
      const db = getClient();

      // Perform the update using the positional operator `$`
      const result = await db.collection("labs").updateOne(
        {
          _id: new ObjectId(labUId), // Match the user by ID
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
      return handleError(e, "updateTest");
    }
  }

  // Function 10
  // add a new referrer
  static async addReferrer(labUId, name, commissionType, commission, isDoctor, description) {
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
      const result = await db.collection("labs").updateOne(
        { _id: new ObjectId(labUId) }, // Match the user by ID
        { $push: { referrers: newReferrer } } // Push the new referrer into the referrers array
      );

      // Check if the update was successful

      return result.matchedCount === 1 ? true : null;
    } catch (e) {
      return handleError(e, "addReferrer");
    }
  }

  // Function 11
  // update a referrer
  static async updateReferrer(labUId, referrerId, updates) {
    try {
      // Validate `updates` to ensure it is an object
      if (typeof updates !== "object" || updates === null) {
        throw new Error("Invalid updates object");
      }

      const db = getClient();

      // Prepare the update object dynamically
      const setUpdates = {};
      for (const [field, value] of Object.entries(updates)) {
        setUpdates[`referrers.$.${field}`] = value;
      }

      const result = await db.collection("labs").updateOne(
        {
          _id: new ObjectId(labUId), // Match the user by ID
          "referrers._id": new ObjectId(referrerId), // Match the specific referrer by ID
        },
        {
          $set: setUpdates, // Dynamically set fields in the matched referrer
        }
      );

      console.log("Update Result:", result);

      return result.matchedCount > 0; // Return true if a document was matched
    } catch (e) {
      return handleError(e, "updateReferrer");
    }
  }

  // Function 12
  // Referrers of a lab
  static async referrerList(labUId) {
    try {
      const db = getClient(); // Initialize the database connection
      const result = await db.collection("labs").findOne(
        { _id: new ObjectId(labUId) }, // Query by Lab ID
        { projection: { referrers: 1, _id: 0 } } // Project only the testList field
      );
      return result.referrers ? result.referrers : null;
    } catch (e) {
      return handleError(e, "referrerList");
    }
  }

  // Function 13
  // add a new staff
  static async addStaff(labUId, username, email, password, accessControl, fullName = null, contactNo = null) {
    try {
      const db = getClient(); // Initialize the database connection
      const lab = await db.collection("labs").findOne({ _id: new ObjectId(labUId) });

      if (!lab) {
        return false; // Lab not found
      }

      // Check if the username already exists in the userList array
      const usernameExists = await db.collection("labs").findOne({
        _id: new ObjectId(labUId),
        "staffs.username": username,
      });

      if (usernameExists) {
        return { duplicateUsername: true }; // User already exists
      }

      // Create new user object
      const newStaff = {
        _id: new ObjectId(), // Unique ID for the staff
        username,
        email,
        password,
        accessControl,
        fullName,
        contactNo,
      };

      // Push new staff to the staffs array
      await db.collection("labs").updateOne({ _id: new ObjectId(labUId) }, { $push: { staffs: newStaff } });

      return true; // User added successfully
    } catch (e) {
      console.error("Error in addStaff:", e);
      return false; // Handle errors
    }
  }

  // Function 14
  // edit staff
  static async editStaff(labUId, staffId, updatedData) {
    try {
      const db = getClient(); // Initialize the database connection
      const lab = await db.collection("labs").findOne({ _id: new ObjectId(labUId) });

      if (!lab) {
        console.log("Lab NOT found");
        return false;
      }

      // Check if the staff member exists
      const staffExists = await db.collection("labs").findOne({
        _id: new ObjectId(labUId),
        "staffs._id": new ObjectId(staffId),
      });

      if (!staffExists) {
        console.log("Staff does not exist");
        return false;
      }

      // **** Uncomment the following code to update username ***** //

      // Check if the new username already exists in the staffs (excluding the current staff member)
      // const usernameExists = await db.collection("labs").findOne({
      //     _id: new ObjectId(labId),
      //     "staffs": {
      //         $elemMatch: { username: updatedData.username, _id: { $ne: new ObjectId(staffId) } }
      //     }
      // });

      // if (usernameExists) {
      //     return { duplicateUsername: true };
      // }

      // ***** Add the following line to update username, email, password *****  //

      //  "staffs.$.username": updatedData.username,
      // "staffs.$.email": updatedData.email,
      // "staffs.$.password": updatedData.password,

      // Construct the update object
      let updateFields = {
        "staffs.$.accessControl": updatedData.accessControl,
        "staffs.$.fullName": updatedData.fullName,
        "staffs.$.contactNo": updatedData.contactNo,
      };

      // Update the staff details in the staffs array
      const updateResult = await db
        .collection("labs")
        .updateOne({ _id: new ObjectId(labUId), "staffs._id": new ObjectId(staffId) }, { $set: updateFields });

      return updateResult.modifiedCount > 0 ? true : false;
    } catch (e) {
      return handleError(e, "editStaff");
    }
  }

  // Function 15
  // terminate a new staff
  static async terminateStaff(labUId, staffId, action) {
    try {
      const db = getClient(); // Initialize the database connection

      if (action === "delete") {
        // Remove staff from the `staffs` array where `_id` matches `staffId`
        const result = await db
          .collection("labs")
          .updateOne({ _id: new ObjectId(labUId) }, { $pull: { staffs: { _id: new ObjectId(staffId) } } });

        if (result.modifiedCount === 0) {
          console.log("Staff NOT Found");
          return false;
        }
        return true;
      }
      if (action === "deactivate") {
        // Deactivate staff by adding/modifying the `deactivated` field
        const result = await db
          .collection("labs")
          .updateOne(
            { _id: new ObjectId(labUId), "staffs._id": new ObjectId(staffId) },
            { $set: { "staffs.$.deactivated": true } }
          );

        if (result.modifiedCount === 0) {
          console.log("Staff NOT Found");
          return false;
        }
        return true;
      }
      if (action === "reactivate") {
        // Reactivate staff
        const result = await db
          .collection("labs")
          .updateOne(
            { _id: new ObjectId(labUId), "staffs._id": new ObjectId(staffId) },
            { $set: { "staffs.$.deactivated": false } }
          );

        if (result.modifiedCount === 0) {
          console.log("Staff NOT Found");
          return false;
        }
        return true;
      }
    } catch (e) {
      return handleError(e, "terminateStaff");
    }
  }

  // Function 16
  // get staffs
  static async getStaffList(labUId) {
    try {
      const db = getClient(); // Initialize the database connection

      const result = await db.collection("labs").findOne(
        { _id: new ObjectId(labUId) }, // Query by user ID
        { projection: { staffs: 1, _id: 0 } } // Project only the staffs field
      );

      return result?.staffs || null; // Return staffs or null if not found
    } catch (e) {
      return handleError(e, "getStaffList");
    }
  }

  // Function 17
  // login
  static async login(labId, username, password, isAdmin) {
    try {
      const db = getClient();
      const userType = isAdmin ? "admins" : "staffs";

      // 1. Find user by username (without projection for exclusions)
      const lab = await db.collection("labs").findOne(
        {
          labId: labId,
          [userType]: { $elemMatch: { username: username } },
        },
        {
          projection: { [userType]: 1, _id: 0 }, // Keep full user object, will filter manually
        }
      );

      // console.log(lab)
      
      if (!lab || !lab[userType]) return null;

      // 2. Extract the matched user manually
      const user = lab[userType].find((u) => u.username === username);
      if (!user) return null;

      // 3. Compare password
      if (user.password !== password) return null;

      // 4. Remove sensitive fields before returning
      const { password: _, refreshTokens: __, ...filteredUser } = user;

      // 5. Generate tokens
      const accessControl = isAdmin ? ["admin"] : user.accessControl;
      const payload = { id: user._id, username: user.username, labId, accessControl, isAdmin };
      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
      const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

      // 6. Store refresh token inside the user's own refreshTokens array (max 5 tokens)
      await db.collection("labs").updateOne(
        { labId: labId, [`${userType}.username`]: username },
        {
          $push: {
            [`${userType}.$.refreshTokens`]: { $each: [refreshToken], $slice: -5 },
          },
        }
      );
      return { accessToken, refreshToken, user: {...filteredUser, accessControl} };
    } catch (e) {
      return handleError(e, "login");
    }
  }

  // Function 18
  // generate new access token
  static async generateNewAccessToken(refreshToken) {
    try {
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const { username, labId, isAdmin } = decoded;

      if (typeof isAdmin !== "boolean") {
        return null;
      }
      const userType = isAdmin ? "admins" : "staffs";

      const db = getClient();

      // Find the user with the specific labId and username (directly match)
      const lab = await db.collection("labs").findOne(
        {
          labId: labId,
          [`${userType}.username`]: username, // Match the username directly
        },
        {
          projection: { [`${userType}.$`]: 1, _id: 0 }, // Only return the matched user
        }
      );

      // If no lab or user found, return null
      if (!lab || !lab[userType]?.length) return null;

      const user = lab[userType][0]; // As username is unique, take the first match

      // Check if the refresh token is valid for the user
      if (!user.refreshTokens.includes(refreshToken)) return null;

      // Generate a new access token
      const accessControl = isAdmin ? ["admin"] : user.accessControl;
      const payload = { id: user._id, username: user.username, labId, accessControl, isAdmin };
      const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

      return newAccessToken;
    } catch (e) {
      return handleError(e, "generateNewAccessToken");
    }
  }

  // Function 20
  // logout current session
  // Only Logout from the current device
  static async logout(labId, username, isAdmin, refreshToken) {
    try {
      const db = getClient();
      const userType = isAdmin ? "admins" : "staffs";

      // Remove only the given refresh token
      const result = await db
        .collection("labs")
        .updateOne(
          { labId: labId, [`${userType}.username`]: username },
          { $pull: { [`${userType}.$.refreshTokens`]: refreshToken } }
        );

      return result.modifiedCount > 0;
    } catch (e) {
      return handleError(e, "logout");
    }
  }

  // Function 21
  // Logout from all devices
  static async logoutAll(labId, username, isAdmin) {
    try {
      const db = getClient();
      const userType = isAdmin ? "admins" : "staffs";

      // 1. Remove the refresh token from the user's refreshTokens array
      const result = await db.collection("labs").updateOne(
        { labId: labId, [`${userType}.username`]: username },
        { $set: { [`${userType}.$.refreshTokens`]: [] } } // Clearing all stored refresh tokens
      );

      // 2. If no document was modified, return false
      if (result.modifiedCount === 0) return false;

      return true;
    } catch (e) {
      return handleError(e, "logoutAll");
    }
  }
}

module.exports = Lab;
