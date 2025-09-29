/** @format */

const { ObjectId } = require("mongodb");

const Lab = require("../../database/system/labAccount");

// Create a new Lab
const postLab = async (req, res, next) => {
  try {
    //Incomplete Task: get this systemId from user request
    const systemId = 555
    const { labName, labId, address, zone, subZone, email, contact1, contact2, activeStatus } = req.body;
    const lab = new Lab(labName, labId, address, zone, subZone, contact1.toString(), contact2.toString(), email, activeStatus, systemId);
    const success = await lab.save()
    if (success) {
      return res.status(201).send({ success: true, msg: "Lab created" });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};


// Get Lab by labId, email, contact
const getLab = async (req, res, next) => {
  try {
    const { field, value } = req.body;

    const lab = await Lab.find(field, value);
    if (lab) {
      return res.status(200).send({ success: true, lab });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};



// Get All Labs
const getAllLabs = async (req, res, next) => {
  try {
    const lab = await Lab.findAll();
    if (lab) {
      return res.status(200).send({ success: true, lab });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};


// Update Lab by Lab ID
const patchLab = async (req, res, next) => {
  try {
    // Incomplete Task 2
    // Get systemId from req.body
    const systemId = 777
    const { labName, labId, address, zone, subZone, email, contact1, contact2, activeStatus } = req.body;
    const newData = { labName, address, zone, subZone, contact1, contact2, email, activeStatus }
    const success = await Lab.updateById(labId, newData, systemId);
    if (success) {
      return res.status(201).send({ success: true, msg: "Lab updated" });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};


// Update Lab by Lab ID
const deleteLab = async (req, res, next) => {
  try {
    // Incomplete Task 3
    // Get systemId from req.body
    const systemId = 999
    const { labId } = req.body;
    const success = await Lab.deleteById(labId, systemId);
    if (success) {
      return res.status(201).send({ success: true, msg: "Lab deleted" });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};



module.exports = {
  postLab,
  getLab,
  getAllLabs,
  patchLab,
  deleteLab
}