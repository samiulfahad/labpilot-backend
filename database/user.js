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

  // Complete the getCashMemo function
static async cashMemo(collectionName) {
  try {
    const db = getClient(); // Get the MongoDB client

    // Perform aggregation to calculate the required sums and count
    const result = await db.collection("collection-1").aggregate([
      {
        $group: {
          _id: null, // Group all documents
          totalSale: { $sum: "$total" },
          totalLabAdjustment: { $sum: "$labAdjustment" },
          totalReferrerDiscount: { $sum: "$discount" },
          totalCommission: { $sum: "$commission" },
          totalReceived: { $sum: "$paid" },
          totalCashInCounter: { $sum: "$paid" }, // Assuming this is equivalent to totalReceived
          totalNetAmount: { $sum: "$netAmount" },
          totalInvoice: { $count: {} } // Count the number of documents
        }
      }
    ]).toArray();

    // console.log(result);

    // If no data found, return null
    if (!result) {
      return null;
    }
   

    // Prepare the output based on aggregation result
    const cashMemo = {
      totalSale: result[0]?.totalSale || 0,
      totalLabAdjustment: result[0]?.totalLabAdjustment || 0,
      totalReferrerDiscunt: result[0]?.totalReferrerDiscount || 0,
      totalCommission: result[0]?.totalCommission || 0,
      totalReceived: result[0]?.totalReceived || 0,
      totalCashInCounter: result[0]?.totalCashInCounter || 0,
      totalNetAmount: result[0]?.totalNetAmount || 0,
      totalInvoice: result[0]?.totalInvoice || 0
    };

    return cashMemo;
  } catch (e) {
    // Handle error and return null
    return handleError(e, "cashMemo => Collection");
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
