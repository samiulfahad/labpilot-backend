/** @format */

const { ObjectId } = require("mongodb");

const Lab = require("../../database/system/labAccount");

// Create a new invoice
const postLab = async (req, res, next) => {
  try {
    //Incomplete Task: get this systemId from user request
    const systemId = 555
    const { labName, zone, address, email, contact1, contact2, activeStatus } = req.body;
    const labData = { labName, zone, address, email, contact1, contact2, activeStatus }
    const lab = new Lab(labData, systemId);
    const result = await lab.save()
    if (result) {
      return res.status(201).send({ success: true, msg: "Lab created" });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

module.exports = {
    postLab
}