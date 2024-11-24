/** @format */

const User = require("../database/user");

const getTestList = async (req, res, next) => {
  try {
    const userId = "6741b20bd7ce5dce5f5638ce";
    const list = await User.testList(userId);
    if (list) {
      return res.status(200).send({ success: true, list });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

module.exports = { getTestList };
