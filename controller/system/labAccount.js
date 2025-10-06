/** @format */

const Lab = require("../../database/system/labAccount");

// Create a new Lab
const postLab = async (req, res, next) => {
  try {
    // Get systemId from authenticated user (from middleware)
    const systemId = req.user?.id || req.user?.systemId || 555; // Fallback for development
    const { labName, labId, address, zoneId, subZoneId, email, contact1, contact2, activeStatus } = req.body;
    
    const lab = new Lab(labName, labId, address, zoneId, subZoneId, contact1.toString(), contact2.toString(), email, activeStatus, systemId);
    const success = await lab.save();
    
    if (success) {
      return res.status(201).send({ success: true, msg: "Lab created successfully" });
    } else {
      return res.status(400).send({ success: false, msg: "Failed to create lab" });
    }
  } catch (e) {
    next(e);
  }
};

// Get Lab by labId, email, contact
const getLab = async (req, res, next) => {
  try {
    const { field, value } = req.body;

    const labs = await Lab.find(field, value);
    if (labs && labs.length > 0) {
      return res.status(200).send({ success: true, labs, msg: "Labs found successfully" });
    } else {
      return res.status(200).send({ success: true, labs: [], msg: "No labs found" });
    }
  } catch (e) {
    next(e);
  }
};

// Get All Labs
const getAllLabs = async (req, res, next) => {
  try {
    const labs = await Lab.findAll();
    if (labs && labs.length > 0) {
      return res.status(200).send({ success: true, labs, msg: "Labs retrieved successfully" });
    } else {
      return res.status(200).send({ success: true, labs: [], msg: "No labs found" });
    }
  } catch (e) {
    next(e);
  }
};

// Update Lab by Lab ID
const patchLab = async (req, res, next) => {
  try {
    // Get systemId from authenticated user
    const systemId = req.user?.id || req.user?.systemId || 777;
    const { labId, labName, address, zoneId, subZoneId, email, contact1, contact2, activeStatus } = req.body;
    const newData = { labName, address, zoneId, subZoneId, contact1, contact2, email, activeStatus };
    
    const success = await Lab.updateById(labId, newData, systemId);
    if (success) {
      return res.status(200).send({ success: true, msg: "Lab updated successfully" });
    } else {
      return res.status(400).send({ success: false, msg: "Lab not found or no changes made" });
    }
  } catch (e) {
    next(e);
  }
};

// Delete Lab by Lab ID
const deleteLab = async (req, res, next) => {
  try {
    // Get systemId from authenticated user
    const systemId = req.user?.id || req.user?.systemId || 999;
    const { labId } = req.body;
    
    const success = await Lab.deleteById(labId, systemId);
    if (success) {
      return res.status(200).send({ success: true, msg: "Lab deleted successfully" });
    } else {
      return res.status(400).send({ success: false, msg: "Lab not found or deletion failed" });
    }
  } catch (e) {
    next(e);
  }
};

// Soft Delete Lab by Lab ID
const softDeleteLab = async (req, res, next) => {
  try {
    // Get systemId from authenticated user
    const systemId = req.user?.id || req.user?.systemId || 999;
    const { labId } = req.body;
    
    const success = await Lab.softDeleteById(labId, systemId);
    if (success) {
      return res.status(200).send({ success: true, msg: "Lab soft deleted successfully" });
    } else {
      return res.status(400).send({ success: false, msg: "Lab not found or soft deletion failed" });
    }
  } catch (e) {
    next(e);
  }
};

// Get Labs by Zone ID
const getLabsByZoneId = async (req, res, next) => {
  try {
    const { zoneId } = req.body;
    const labs = await Lab.findByZone(zoneId);
    
    if (labs && labs.length > 0) {
      return res.status(200).send({ success: true, labs, msg: "Labs found in zone" });
    } else {
      return res.status(200).send({ success: true, labs: [], msg: "No labs found in this zone" });
    }
  } catch (e) {
    next(e);
  }
};

// Get Labs by SubZone ID
const getLabsBySubZoneId = async (req, res, next) => {
  try {
    const { subZoneId } = req.body;
    const labs = await Lab.findBySubZone(subZoneId);
    
    if (labs && labs.length > 0) {
      return res.status(200).send({ success: true, labs, msg: "Labs found in subzone" });
    } else {
      return res.status(200).send({ success: true, labs: [], msg: "No labs found in this subzone" });
    }
  } catch (e) {
    next(e);
  }
};

// Get Lab by ID (Single Lab)
const getLabById = async (req, res, next) => {
  try {
    const { labId } = req.body;
    const labs = await Lab.find('labId', labId);
    
    if (labs && labs.length > 0) {
      return res.status(200).send({ success: true, lab: labs[0], msg: "Lab found successfully" });
    } else {
      return res.status(200).send({ success: true, lab: null, msg: "Lab not found" });
    }
  } catch (e) {
    next(e);
  }
};

// Search Labs by multiple criteria
const searchLabs = async (req, res, next) => {
  try {
    const { labName, email, contact, zoneId, subZoneId, activeStatus } = req.body;
    
    // Build search query
    const query = {};
    if (labName) query.labName = { $regex: labName, $options: 'i' };
    if (email) query.email = email;
    if (contact) {
      query.$or = [
        { contact1: contact },
        { contact2: contact }
      ];
    }
    if (zoneId) query.zoneId = zoneId;
    if (subZoneId) query.subZoneId = subZoneId;
    if (activeStatus !== undefined) query.activeStatus = activeStatus;
    
    const labs = await Lab.search(query);
    if (labs && labs.length > 0) {
      return res.status(200).send({ success: true, labs, msg: "Search completed successfully" });
    } else {
      return res.status(200).send({ success: true, labs: [], msg: "No labs found matching criteria" });
    }
  } catch (e) {
    next(e);
  }
};

// Get Labs Statistics
const getLabStats = async (req, res, next) => {
  try {
    const db = getClient();
    
    const totalLabs = await db.collection("labs").countDocuments();
    const activeLabs = await db.collection("labs").countDocuments({ activeStatus: true });
    const inactiveLabs = await db.collection("labs").countDocuments({ activeStatus: false });
    
    // Count labs by zone (you might need to adjust based on your zone structure)
    const labsByZone = await db.collection("labs").aggregate([
      { $group: { _id: "$zoneId", count: { $sum: 1 } } }
    ]).toArray();
    
    return res.status(200).send({
      success: true,
      stats: {
        totalLabs,
        activeLabs,
        inactiveLabs,
        labsByZone
      },
      msg: "Statistics retrieved successfully"
    });
  } catch (e) {
    next(e);
  }
};


module.exports = {
  postLab,
  getLab,
  getAllLabs,
  patchLab,
  deleteLab,
  softDeleteLab,
  getLabsByZoneId,
  getLabsBySubZoneId,
  getLabById,
  searchLabs,
  getLabStats
};