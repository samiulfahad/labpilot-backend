/** @format */

const { ObjectId } = require("mongodb");

const Zone = require("../../database/system/labAccountZone");

// Create a new zone
const postZone = async (req, res, next) => {
    try {
        //Incomplete Task: get this systemId from user request
        const systemId = 555
        const { zoneName } = req.body;
        const zone = new Zone(zoneName, systemId);
        const success = await zone.save()
        if (success) {
            return res.status(201).send({ success: true, msg: "Zone created" });
        } else {
            return res.status(400).send({ success: false });
        }
    } catch (e) {
        next(e);
    }
};


// Get labs by zoneId
const getLabsByZoneId = async (req, res, next) => {
    try {
        const { zoneId } = req.body;
        const labs = await Zone.findLabsByZone(zoneId);
        if (labs) {
            return res.status(200).send({ success: true, labs });
        } else {
            return res.status(400).send({ success: false });
        }
    } catch (e) {
        next(e);
    }
};

// Get labs by subZoneId
const getLabsBySubZoneId = async (req, res, next) => {
    try {
        const { subZoneId } = req.body;
        const labs = await Zone.findLabsBySubZone(subZoneId);
        if (labs) {
            return res.status(200).send({ success: true, labs });
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
    postZone,
    getLab,
    getAllLabs,
    patchLab,
    deleteLab
}