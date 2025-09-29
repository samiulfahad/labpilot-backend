/** @format */

const { ObjectId } = require("mongodb");

const Lab = require("../../database/system/labAccount");

// Create a new Lab
const postLab = async (req, res, next) => {
  try {
    //Incomplete Task: get this systemId from user request
    const systemId = 555
    const { labName, address, zone, subZone, email, contact1, contact2, activeStatus } = req.body;
    const lab = new Lab(labName, address, zone, subZone, contact1, contact2, email, activeStatus, systemId);
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