/** @format */

const { getClient } = require("./connection");

const handleError = (e, methodName) => {
  console.log("Error in database operation");
  console.log(`${methodName} produced an error`);
  console.log(e.message);
  return null;
};

class System {
  constructor() {}

  static async createTest(name, code, description, type, format = "standard") {
    const test = {
      name: name,
      code: code,
      description: description,
      type: type,
      format: format,
      price: 0
    };
    try {
      const db = getClient();
      const result = await db.collection("globalTestList").insertOne(test);
      console.log(result);
      return result.acknowledged ? true : null;
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
