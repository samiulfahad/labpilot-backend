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
        commissionType,
        commission,
        isDoctor,
        description,
      };

      // Update the user's referrers array by adding the new referrer
      const result = await db.collection("users").updateOne(
        { _id: new ObjectId(userId) }, // Match the user by ID
        { $push: { referrers: newReferrer } } // Push the new referrer into the referrers array
      );

      // Check if the update was successful

      return result.matchedCount === 1 ? true : null;
    } catch (e) {
      return handleError(e, "addReferrer => User");
    }
  }
}

module.exports = User;
