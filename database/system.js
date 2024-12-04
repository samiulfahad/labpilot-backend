/** @format */

const { getClient } = require("./connection");

const handleError = (e, methodName) => {
  console.log("Error in database operation");
  console.log(`${methodName} produced an error`);
  console.log(e.message);
  return null;
};

class System {
  constructor() { }
  
  static async createUser(user) {
    try {
      const db = getClient()
      const result = await db.collection("users").insertOne(user)
      // console.log(result);
      return result.insertedId ? true : null
    } catch (e) {
      return handleError(e, "createUser => System")
     }
  }

  static async createTest(test) {
    try {
      const db = getClient();
      const result = await db.collection("globalTestList").insertOne(test);
      // console.log(result);
      return result.insertedId ? true : null;
    } catch (e) {
      return handleError(e, "createTest => System");
    }
  }


  static async findAllTest() {
    try {
      const db = getClient();
      const result = await db.collection("globalTestList").find({}).toArray();
      // console.log(result);
      return result ? { success: true, list: result } : null;
    } catch (e) {}
  }
}

module.exports = System;
