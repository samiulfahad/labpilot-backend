/** @format */

const System = require("../database/system");

const postTest = async (req, res, next) => {
  const { name, code, description, type, format } = req.body;
  if (!name || !code || !description || !type) {
    return res.status(400).send({ success: false, msg: "Required field missing" });
  }
  try {
    const result = await System.createTest(name, code, description, type, format)
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

module.exports = { postTest, getAllTest };
