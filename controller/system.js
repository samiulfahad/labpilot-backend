/** @format */

const System = require("../database/system");

const postUser = async (req, res, next) => {
  const { labName, contact, email } = req.body;
  if (!labName || !contact || !email) {
    return res.status(400).send({ success: false, msg: "Missing required fields" });
  }
  try {
    const user = { labName, contact, email, testList: [], referrerList: [] };
    const result = await System.createUser(user);
    if (result) {
      return res.status(201).send({ success: true });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

const postTest = async (req, res, next) => {
  const { name, code, description, type, format } = req.body;
  if (!name || !code || !description || !type || !format) {
    return res.status(400).send({ success: false, msg: "Required field missing" });
  }
  try {
    const test = { name, code, description, type, format };
    const result = await System.createTest(test);
    if (result) {
      return res.status(201).send({ success: true });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

const getAllTest = async (req, res, next) => {
  try {
    const result = await System.findAllTest();
    if (result.success) {
      return res.status(200).send({ success: true, list: result.list });
    } else {
      return res.status(400).send({ success: false, msg: "cannot get the list" });
    }
  } catch (e) {
    next(e);
  }
};

module.exports = { postUser, postTest, getAllTest };
