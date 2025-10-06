/** @format */

const Zone = require("../../database/system/labZone");

// Zone endpoints
const postZone = async (req, res, next) => {
    try {
        const systemId = 555;
        const { zoneName } = req.body;
        const zone = new Zone(zoneName, systemId);
        const success = await zone.save();
        if (success) {
            return res.status(201).send({ success: true, msg: "Zone created" });
        } else {
            return res.status(400).send({ success: false, msg: "Failed to create zone" });
        }
    } catch (e) {
        next(e);
    }
};

const putZone = async (req, res, next) => {
    try {
        const systemId = 555;
        const { zoneId, zoneName } = req.body;
        const success = await Zone.updateZoneById(zoneId, zoneName, systemId);
        if (success) {
            return res.status(200).send({ success: true, msg: "Zone updated" });
        } else {
            return res.status(400).send({ success: false, msg: "Zone not found" });
        }
    } catch (e) {
        next(e);
    }
};

const deleteZone = async (req, res, next) => {
    try {
        const systemId = 555;
        const { zoneId } = req.body;
        const success = await Zone.deleteZone(zoneId, systemId);
        if (success) {
            return res.status(200).send({ success: true, msg: "Zone deleted" });
        } else {
            return res.status(400).send({ success: false, msg: "Zone not found or has associated labs" });
        }
    } catch (e) {
        next(e);
    }
};

const getZones = async (req, res, next) => {
    try {
        const zones = await Zone.getAllZones();
        return res.status(200).send({ success: true, zones });
    } catch (e) {
        next(e);
    }
};

// SubZone endpoints
const postSubZone = async (req, res, next) => {
    try {
        const systemId = 555;
        const { zoneId, subZoneName } = req.body;
        const success = await Zone.createSubZone(zoneId, subZoneName, systemId);
        if (success) {
            return res.status(201).send({ success: true, msg: "Subzone created" });
        } else {
            return res.status(400).send({ success: false, msg: "Zone not found" });
        }
    } catch (e) {
        next(e);
    }
};

const putSubZone = async (req, res, next) => {
    try {
        const systemId = 555;
        const { zoneId, subZoneId, subZoneName } = req.body;
        const success = await Zone.updateSubZone(zoneId, subZoneId, subZoneName, systemId);
        if (success) {
            return res.status(200).send({ success: true, msg: "Subzone updated" });
        } else {
            return res.status(400).send({ success: false, msg: "Subzone not found" });
        }
    } catch (e) {
        next(e);
    }
};

const deleteSubZone = async (req, res, next) => {
    try {
        const systemId = 555;
        const { zoneId, subZoneId } = req.body;
        const success = await Zone.deleteSubZone(zoneId, subZoneId, systemId);
        if (success) {
            return res.status(200).send({ success: true, msg: "Subzone deleted" });
        } else {
            return res.status(400).send({ success: false, msg: "Subzone not found or has associated labs" });
        }
    } catch (e) {
        next(e);
    }
};




module.exports = {
    // Zone endpoints
    postZone,
    putZone,
    deleteZone,
    getZones,

    // SubZone endpoints
    postSubZone,
    putSubZone,
    deleteSubZone,

};