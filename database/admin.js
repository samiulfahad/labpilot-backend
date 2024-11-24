/** @format */

const { getClient } = require("./connection");

const handleError = (e, methodName) => {
  console.log("Error in database operation");
  console.log(`${methodName} produced an error`);
  console.log(e.message);
  return null;
};

class GlobalTest {
  constructor(name, code, description, type, format = "standard") {
    this.name = name;
    this.code = code;
    this.description = description;
    this.type = type;
    this.format = format;
  }

  // Create Test
  static async insertOne(doc) {
    try {
      const db = getClient();
      const result = await db.collection("globalTestList").insertOne(doc);
      console.log(result);
      return result.acknowledged ? true : null;
    } catch (e) {
      return handleError(e, "insertOne => GlobalTest");
    }
  }

  static async findAll() {
    try {
      const db = getClient();
      const result = await db.collection("globalTestList").find({}).toArray();
      // console.log(result);
      return result ? { success: true, list: result } : null;
    } catch (e) {}
  }
}

module.exports = GlobalTest;
