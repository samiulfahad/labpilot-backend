/** @format */

const { getClient } = require("./connection");

const handleError = (e, methodName) => {
  console.log(`error in database => manageLabs => ${methodName}`);
  console.log(e.message);
  return null;
};

class Lab {

  constructor() {

  }

  static async createNew(lab) {
    try {
      const db = getClient()
      const result = await db.collection("labs").insertOne(lab)
      // console.log(result);
      return result.insertedId ? true : null
    } catch (e) {
      return handleError(e, "createNew => Lab2")
    }
  }



  static async findAll() {
    try {
      const db = getClient();
      const result = await db.collection("labs").find({}).toArray();
      // console.log(result);
      return result ? { success: true, list: result } : null;
    } catch (e) { }
  }
}

module.exports = Lab;
