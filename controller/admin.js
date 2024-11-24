/** @format */

const GlobalTest = require("../database/admin");

const createGlobalTest = async (req, res, next) => {
  const { name, code, description, type, format } = req.body;
  if (!name || !code || !description || !type) {
    return res.status(400).send({ success: false, msg: "Required field missing" });
  }
  try {
    const test = new GlobalTest(name, code, description, type, format);
    const result = await GlobalTest.insertOne(test);
    if (result) {
      return res.status(201).send({ success: true });
    } else {
      throw new Error("Could not create a new global test @statusCode 500");
    }
  } catch (e) {
    next(e);
  }
};

const getAllGlobalTest = async (req, res, next) => {
  try {
    const result = await GlobalTest.findAll();
    if (result.success) {
      return res.status(200).send({ success: true, list: result.list });
    } else {
      return res.status(400).send({ success: false, msg: "cannot get the list" });
    }
  } catch (e) {
    next(e);
  }
};

module.exports = { createGlobalTest, getAllGlobalTest };
