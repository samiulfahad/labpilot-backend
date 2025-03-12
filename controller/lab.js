/** @format */

const { LAB_ID } = require("../config"); // Configuration for lab ID
const { ObjectId } = require("mongodb"); // MongoDB ObjectId validation utility

const { generateCurrentDate } = require("../helpers/functions");

const Lab = require("../database/lab"); // Lab database operations

/**
 * Fetches test list and referrer list for creating a new invoice.
 */
const getDataForNewInvoice = async (req, res, next) => {
  try {
    const labId = LAB_ID; // Current lab ID
    const result = await Lab.dataForNewInvoice(labId); // Fetch data
    if (result) {
      return res.status(200).send({ success: true, tests: result.tests, referrers: result.referrers });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e); // Pass error to next middleware
  }
};

/**
 * Fetches the test list for a lab
 */
const getTestList = async (req, res, next) => {
  try {
    const labId = LAB_ID;
    let project;
    if (req.query.uploadReport === 1) {
      console.log(req.query);
      project = { _id: 1, code: 1, name: 1, description: 1 };
    }
    const list = await Lab.testList(labId, project); // Fetch test list
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

    const labId = LAB_ID;
    const result = await Lab.updateTest(labId, testId, field, value); // Update test
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
 * Updates the entire test list for a lab.
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

    const labId = LAB_ID;
    const result = await Lab.updateTestList(labId, testList); // Update test list
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
 * Adds a new referrer to the lab's referrer list.
 */
const postReferrer = async (req, res, next) => {
  try {
    const { name, commissionType, commission, isDoctor, description } = req.body; // Extract data from request
    if (!name || !commission || !commissionType || !isDoctor || !description) {
      return res.status(400).send({ success: false, msg: "Required field missing" });
    }

    const labId = LAB_ID;
    const result = await Lab.addReferrer(labId, name, commissionType, commission, isDoctor, description); // Add referrer
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
    const labId = LAB_ID;
    const result = await Lab.updateReferrer(labId, referrerId, updates); // Update referrer
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
 * Fetches the referrer list for a Lab.
 */
const getReferrerList = async (req, res, next) => {
  try {
    const labId = LAB_ID;
    const list = await Lab.referrerList(labId); // Fetch referrer list
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
    if (req.query?.startDate === "today" || req.query?.endDate === "today") {
      const [start, end] = generateCurrentDate();
      startDate = parseInt(start);
      endDate = parseInt(end);
    } else {
      startDate = parseInt(req.query.startDate) || 0;
      endDate = parseInt(req.query.endDate) || 0;
    }

    if (!startDate || !endDate) {
      return res.status(400).send({ success: false, msg: "Missing required fields" });
    }
    const labId = LAB_ID;
    const cashMemo = await Lab.cashMemo(startDate, endDate); // Fetch cashmemo
    if (cashMemo) {
      return res.status(200).send({ success: true, cashMemo });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

const getCommissionTracker = async (req, res, next) => {
  try {
    let startDate;
    let endDate;
    if (req.query?.startDate === "today" || req.query?.endDate === "today") {
      const [start, end] = generateCurrentDate();
      startDate = parseInt(start);
      endDate = parseInt(end);
    } else {
      startDate = parseInt(req.query.startDate) || 0;
      endDate = parseInt(req.query.endDate) || 0;
    }

    if (!startDate || !endDate) {
      return res.status(400).send({ success: false, msg: "Missing required fields" });
    }

    const list = await Lab.commissionTrackerV1(startDate, endDate); // Fetch commissionTracker
    if (list) {
      return res.status(200).send({ success: true, list });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

// Incomplete
const getInvoicesByReferrer = async (req, res, next) => {
  try {
    let startDate;
    let endDate;
    if (req.query?.startDate === "today" || req.query?.endDate === "today") {
      const [start, end] = generateCurrentDate();
      startDate = parseInt(start);
      endDate = parseInt(end);
    } else {
      startDate = parseInt(req.query.startDate) || 0;
      endDate = parseInt(req.query.endDate) || 0;
    }

    if (!startDate || !endDate) {
      return res.status(400).send({ success: false, msg: "Missing required fields" });
    }

    const list = await Lab.invoicesByReferrerId(startDate, endDate);
    if (list) {
      return res.status(200).send({ success: true, list });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

const postStaff = async (req, res, next) => {
  try {
    const labId = LAB_ID;
    const { username, password, email, accessControl, fullName, contactNo } = req.body;
    // console.log(accessControl);
    if (!username || !password || !email || accessControl.length === 0) {
      return res.status(400).send({ success: false, msg: "Missing Required Fields" });
    }
    const result = await Lab.addStaff(labId, username, email, password, accessControl, fullName, contactNo);
    if (result.duplicateUsername) {
      return res.status(200).send({ duplicateUsername: true });
    } else if (result) {
      return res.status(201).send({ success: true });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

const putStaff = async (req, res, next) => {
  try {
    const labId = LAB_ID;
    const { username, email, accessControl, fullName, contactNo, staffId } = req.body;
    // console.log(accessControl);
    if (!staffId || !email || accessControl.length === 0) {
      return res.status(400).send({ success: false, msg: "Missing Required Fields" });
    }
    // Validate staffId as a valid MongoDB ObjectId
    if (!ObjectId.isValid(staffId)) {
      return res.status(400).send({ success: false, msg: "Staff ID is NOT valid" });
    }
    const updatedData = { accessControl, fullName, contactNo };
    const result = await Lab.editStaff(labId, staffId, updatedData);
    if (result) {
      return res.status(200).send({ success: true });
    } else {
      return res.status(204).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

const terminateStaff = async (req, res, next) => {
  try {
    const labId = LAB_ID;
    const { staffId, action } = req.body;
    if (!staffId) {
      return res.status(400).send({ success: false, msg: "Missing Required Fields" });
    }
    // Validate staffId as a valid MongoDB ObjectId
    if (!ObjectId.isValid(staffId)) {
      return res.status(400).send({ success: false, msg: "Staff ID is NOT valid" });
    }
    const validAction = ["delete", "deactivate", "reactivate"].includes(action);
    if (!validAction) {
      return res.status(400).send({ success: false, msg: "Invalid action type" });
    }
    const result = await Lab.terminateStaff(labId, staffId, action);
    if (result) {
      return res.status(200).send({ success: true });
    } else {
      return res.status(204).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

const getStaffList = async (req, res, next) => {
  try {
    const labId = LAB_ID;
    const staffs = await Lab.getStaffList(labId);
    if (staffs) {
      return res.status(200).send({ success: true, staffs });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const { labId, username, password, isAdmin } = req.body;
    if (!labId || !username || !password || isAdmin === undefined) {
      return res.status(400).json({ success: false, msg: "Required field missing" });
    }
    if (typeof isAdmin !== "boolean") {
      return res.status(400).json({ success: false, msg: "Required field missing" });
    }

    const result = await Lab.login(parseInt(labId), username, password.toString(), isAdmin);

    if (!result) return res.status(400).json({ success: false, msg: "Invalid credentials" });
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/api/v1/lab/auth/refresh-token", // ← RESTRICT TO SPECIFIC PATH
    });

    res.json({ success: true, accessToken: result.accessToken, user: result.user });
  } catch (e) {
    next(e);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    // console.log(refreshToken);
    if (!refreshToken) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        path: "/api/v1/lab/auth/refresh-token",
      });
      return res.status(400).json({ success: false, forcedLogout: true, msg: "Refresh token missing" });
    }

    const newAccessToken = await Lab.generateNewAccessToken(refreshToken);

    if (newAccessToken) {
      console.log("token refreshed");
      return res.json({ success: true, accessToken: newAccessToken });
    } else {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        path: "/api/v1/lab/auth/refresh-token",
      });
      return res.status(403).json({ success: false, forcedLogout: true, msg: "Invalid refresh token" });
    }
  } catch (e) {
    next(e);
  }
};

// Logout the current device
const logout = async (req, res, next) => {
  try {
    const { labId, username, isAdmin } = req.user;
    const refreshToken = req.cookies.refreshToken; // Get token from cookie

    if (!labId || !username || isAdmin === undefined || !refreshToken) {
      return res.status(400).json({ success: false, msg: "Required field missing" });
    }
    if (typeof isAdmin !== "boolean") {
      return res.status(400).json({ success: false, msg: "Required field missing" });
    }
    const result = await Lab.logout(parseInt(labId), username, isAdmin, refreshToken);

    if (!result) {
      return res.status(400).json({ success: false, msg: "Logout failed" });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/api/v1/lab/auth/refresh-token",
    });
    res.status(200).json({ success: true, msg: "Logged out successfully" });
  } catch (e) {
    next(e);
  }
};

// Logout from all devices
const logoutAll = async (req, res, next) => {
  try {
    const { labId, username, isAdmin } = req.body;

    if (!labId || !username || isAdmin === undefined) {
      return res.status(400).json({ success: false, msg: "Required field missing" });
    }
    if (typeof isAdmin !== "boolean") {
      return res.status(400).json({ success: false, msg: "Required field missing" });
    }

    const result = await Lab.logout(parseInt(labId), username, isAdmin);

    if (!result) {
      return res.status(400).json({ success: false, msg: "Logout failed" });
    }

    // Clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/api/v1/lab/auth/refresh-token",
    });

    res.status(200).json({ success: true, msg: "Logged out successfully" });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  getCashMemo,
  getCommissionTracker,
  getDataForNewInvoice,
  getInvoicesByReferrer,
  getTestList,
  getReferrerList,
  postReferrer,
  putReferrer,
  putTest,
  putTestList,
  postStaff,
  putStaff,
  terminateStaff,
  getStaffList,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
};
