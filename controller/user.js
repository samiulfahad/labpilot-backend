/** @format */

const { USER_ID } = require("../config"); // Configuration for user ID
const { ObjectId } = require("mongodb"); // MongoDB ObjectId validation utility

const { generateCurrentDate } = require("../helpers/functions");

const User = require("../database/user"); // User database operations

/**
 * Fetches test list and referrer list for creating a new invoice.
 */
const getDataForNewInvoice = async (req, res, next) => {
  try {
    const userId = USER_ID; // Current user ID
    const result = await User.getTestListAndReferrerList(userId); // Fetch data
    if (result) {
      return res.status(200).send({ success: true, testList: result.testList, referrerList: result.referrerList });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    return res.status(400).send({ success: false });
    next(e); // Pass error to next middleware
  }
};

/**
 * Fetches the test list for a user.
 */
const getTestList = async (req, res, next) => {
  try {
    const userId = USER_ID;
    const list = await User.testList(userId); // Fetch test list
    if (list) {
      return res.status(200).send({ success: true, list });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

/**
 * Updates a specific field of a test.
 */
const putTest = async (req, res, next) => {
  try {
    const { testId, field, value } = req.body; // Extract data from request
    const allowedFields = ["price"]; // Define allowed fields to update

    // Validate request
    if (!testId || !field || !value || !allowedFields.includes(field)) {
      return res.status(400).send({ success: false, msg: "Required field missing" });
    }

    // Validate testId as a valid MongoDB ObjectId
    if (!ObjectId.isValid(testId)) {
      return res.status(400).send({ success: false, msg: "Object ID is NOT valid" });
    }

    const userId = USER_ID;
    const result = await User.updateTest(userId, testId, field, value); // Update test
    if (result) {
      return res.status(200).send({ success: true });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

/**
 * Updates the entire test list for a user.
 */
const putTestList = async (req, res, next) => {
  let { testList } = req.body; // Extract test list from request body
  if (!testList) {
    return res.status(400).send({ success: false, msg: "Required field missing" });
  }
  try {
    // Ensure each test in the list has a numeric price
    testList = testList.map((test) => {
      if (typeof test.price !== "number") {
        test.price = 0; // Default to 0 if not a number
      }
      return test;
    });

    const userId = USER_ID;
    const result = await User.updateTestList(userId, testList); // Update test list
    if (result) {
      return res.status(200).send({ success: true });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

/**
 * Adds a new referrer to the user's referrer list.
 */
const postReferrer = async (req, res, next) => {
  try {
    const { name, commissionType, commission, isDoctor, description } = req.body; // Extract data from request
    if (!name || !commission || !commissionType || !isDoctor || !description) {
      return res.status(400).send({ success: false, msg: "Required field missing" });
    }

    const userId = USER_ID;
    const result = await User.addReferrer(userId, name, commissionType, commission, isDoctor, description); // Add referrer
    if (result) {
      return res.status(201).send({ success: true });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

/**
 * Updates an existing referrer.
 */
const putReferrer = async (req, res, next) => {
  try {
    const { referrerId, name, commissionType, commission, isDoctor, description } = req.body; // Extract data from request
    if (!referrerId || !name || !commission || !commissionType || !isDoctor || !description) {
      return res.status(400).send({ success: false, msg: "Required field missing" });
    }

    // Validate referrerId as a valid MongoDB ObjectId
    if (!ObjectId.isValid(referrerId)) {
      return res.status(400).send({ success: false, msg: "Object ID is NOT valid" });
    }

    const updates = { name, commission, commissionType, isDoctor, description };
    const userId = USER_ID;
    const result = await User.updateReferrer(userId, referrerId, updates); // Update referrer
    if (result) {
      return res.status(200).send({ success: true });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

/**
 * Fetches the referrer list for a user.
 */
const getReferrerList = async (req, res, next) => {
  try {
    const userId = USER_ID;
    const list = await User.referrerList(userId); // Fetch referrer list
    if (list) {
      return res.status(200).send({ success: true, list });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

const getCashMemo = async (req, res, next) => {
  try {
    let startDate;
    let endDate;
    console.log(req.query);
    if (req.query?.startDate === "today" || req.query?.endDate === "today") {
      const [start, end] = generateCurrentDate();
      startDate = parseInt(start);
      endDate = parseInt(end);
    } else {
      startDate = parseInt(req.query.startDate) || 0;
      endDate = parseInt(req.query.endDate) || 0;
    }
    console.log(startDate);
    console.log(endDate);
    
    if (!startDate || !endDate) {
      return res.status(400).send({ success: false, msg: "Missing required fields" });
    }
    const userId = USER_ID;
    const cashMemo = await User.cashMemo(startDate, endDate); // Fetch cashmemo
    if (cashMemo) {
      return res.status(200).send({ success: true, cashMemo });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};



module.exports = {
  getDataForNewInvoice,
  getCashMemo,
  getTestList,
  getReferrerList,
  postReferrer,
  putReferrer,
  putTest,
  putTestList,
};
