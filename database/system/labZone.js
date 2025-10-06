/** @format */

const { ObjectId } = require("mongodb");
const { getClient } = require("../connection");

const handleError = (e, methodName) => {
    console.log("Error in database operation. database > system > labAccountZone");
    console.log(`method name ${methodName}`);
    console.log(e.message);
    return null;
};

class Zone {
    constructor(zoneName, systemId) {
        this.zoneName = zoneName;
        this.subZones = []
        this.createdBy = systemId
        this.createdAt = new Date();
    }


    // Function 1: Save new zone to database
    async save() {
        try {
            const db = getClient();
            const result = await db.collection("labZone").insertOne(this);
            return result.insertedId ? true : false;
        } catch (e) {
            return handleError(e, "save");
        }
    }

    // Function 2: Update Lab Zone name
    static async updateZoneById(_id, zoneName, systemId) {
        try {
            const db = getClient();

            const result = await db.collection("labZone").updateOne(
                { _id: new ObjectId(_id) },
                {
                    $set: {
                        zoneName: zoneName,
                        updatedBy: systemId,
                        updatedAt: new Date()
                    }
                }
            );
            return result.modifiedCount > 0;
        } catch (e) {
            return handleError(e, "updateZone");
        }
    }


    // Function 3: Create a subzone
    static async createSubZone(zoneId, subZoneName, systemId) {
        try {
            const db = getClient();
            const subZone = {
                _id: new ObjectId(),
                subZoneName: subZoneName,
                createdAt: new Date(),
                createdBy: systemId,
            };

            const result = await db.collection("labZone").updateOne(
                { _id: new ObjectId(zoneId) },
                {
                    $push: {
                        subZones: subZone
                    },
                    $set: {
                        updatedAt: new Date(),
                        updatedBy: systemId
                    }
                }
            );

            return result.modifiedCount > 0;
        } catch (e) {
            return handleError(e, "createSubZone");
        }
    }

    // Function 4: Update sub zone name
    static async updateSubZone(zoneId, subZoneId, newSubZoneName, systemId) {
        try {
            const db = getClient();

            const result = await db.collection("labZone").updateOne(
                {
                    _id: new ObjectId(zoneId),
                    "subZones._id": new ObjectId(subZoneId)
                },
                {
                    $set: {
                        "subZones.$.subZoneName": newSubZoneName,
                        "subZones.$.updatedAt": new Date(),
                        "subZones.$.updatedBy": systemId,
                        updatedAt: new Date(),
                        updatedBy: systemId
                    }
                }
            );

            return result.modifiedCount > 0;
        } catch (e) {
            return handleError(e, "updateSubZone");
        }
    }

    // Function 5: Delete a zone (and all its subzones)
    static async deleteZone(zoneId, systemId) {
        try {
            const db = getClient();

            // First, check if there are any labs associated with this zone
            const labsInZone = await db.collection("labs").findOne({
                zoneId: new ObjectId(zoneId)
            });

            if (labsInZone) {
                throw new Error("Cannot delete zone: There are labs associated with this zone");
            }

            // Delete the zone
            const result = await db.collection("labZone").deleteOne(
                { _id: new ObjectId(zoneId) }
            );

            return result.deletedCount > 0;
        } catch (e) {
            return handleError(e, "deleteZone");
        }
    }

    // Function 6: Delete a subzone
    static async deleteSubZone(zoneId, subZoneId, systemId) {
        try {
            const db = getClient();

            // First, check if there are any labs associated with this subzone
            const labsInSubZone = await db.collection("labs").findOne({
                subZoneId: new ObjectId(subZoneId)
            });

            if (labsInSubZone) {
                throw new Error("Cannot delete subzone: There are labs associated with this subzone");
            }

            // Remove the subzone from the zone's subZones array
            const result = await db.collection("labZone").updateOne(
                { _id: new ObjectId(zoneId) },
                {
                    $pull: {
                        subZones: { _id: new ObjectId(subZoneId) }
                    },
                    $set: {
                        updatedAt: new Date(),
                        updatedBy: systemId
                    }
                }
            );

            return result.modifiedCount > 0;
        } catch (e) {
            return handleError(e, "deleteSubZone");
        }
    }

    // Function 7: Get all zones with subzones (optional utility function)
    static async getAllZones() {
        try {
            const db = getClient();
            const zones = await db.collection("labZone").find({}).toArray();
            return zones;
        } catch (e) {
            return handleError(e, "getAllZones");
        }
    }

}

module.exports = Zone;