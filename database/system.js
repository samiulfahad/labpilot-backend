/** @format */

const { getClient } = require("./connection");

const handleError = (e, methodName) => {
  console.log(`error in database => system => ${methodName}`);
  console.log(e.message);
  return null;
};

class System {
  constructor() { }

  

  
  static async addLab(lab) {
    try {
      const db = getClient()
      const result = await db.collection("labs").insertOne(lab)
      // console.log(result);
      return result.insertedId ? true : null
    } catch (e) {
      return handleError(e, "addLab => System")
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
