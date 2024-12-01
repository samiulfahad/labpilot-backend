/** @format */

const { ObjectId } = require("mongodb");
const User = require("../database/user");

const getTestList = async (req, res, next) => {
  try {
    const userId = "6747696d74e437e56a1f3540";
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

// Update a test
const putTest = async (req, res, next) => {
  try {
    console.log(111);
    const { testId, field, value } = req.body;
    console.log(testId, field, value);
    const allowedFields = ["price"];
    if (!testId || !field || !value || !allowedFields.includes(field)) {
      return res.status(400).send({ success: false, msg: "Required field missing" });
    }

    // Validate object id
    if (!ObjectId.isValid(testId)) {
      return res.status(400).send({ success: false, msg: "Object ID is NOT valid" });
    }
    const userId = "6747696d74e437e56a1f3540";
    const result = await User.updateTest(userId, testId, field, value);
    if (result) {
      return res.status(200).send({ success: true });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

const putTestList = async (req, res, next) => {
  const { testList } = req.body;
  if (!testList) {
    return res.status(400).send({ success: false, msg: "Required field missing" });
  }
  try {
    const userId = "6747696d74e437e56a1f3540";
    const result = await User.updateTestList(userId, testList);
    if (result) {
      return res.status(200).send({ success: true });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

const postReferrer = async (req, res, next) => {
  try {
    const { name, commissionType, commission, isDoctor, description } = req.body;
    if (!name || !commission || !commissionType || !isDoctor || !description) {
      return res.status(400).send({ success: false, msg: "Required field missing" });
    }
    const userId = "6747696d74e437e56a1f3540";
    const result = await User.addReferrer(userId, name, commissionType, commission, isDoctor, description);
    if (result) {
      return res.status(201).send({ success: true });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

// Update a Referrer
const putReferrer = async (req, res, next) => {
  try {
    const { referrerId, name, commissionType, commission, isDoctor, description } = req.body;
    console.log(req.body);
    if (!referrerId || !name || !commission || !commissionType || !isDoctor || !description) {
      return res.status(400).send({ success: false, msg: "Required field missing" });
    }
    // Validate object id
    if (!ObjectId.isValid(referrerId)) {
      return res.status(400).send({ success: false, msg: "Object ID is NOT valid" });
    }
    const updates = { name, commission, commissionType, isDoctor, description };
    const userId = "6747696d74e437e56a1f3540";
    const result = await User.updateReferrer(userId, referrerId, updates);
    if (result) {
      return res.status(200).send({ success: true });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

// Get referrer list
const getReferrerList = async (req, res, next) => {
  try {
    const userId = "6747696d74e437e56a1f3540";
    const list = await User.referrerList(userId);
    if (list) {
      return res.status(200).send({ success: true, list });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

module.exports = { getTestList, getReferrerList, postReferrer, putReferrer, putTest, putTestList };
