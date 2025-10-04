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
    constructor(zone, systemId) {
        this.zone = zone;
        this.createdBy = systemId
        this.createdAt = new Date();
    }


    // Function 1: Save new zone to database
    async save() {
        try {
            const db = getClient();
            const result = await db.collection("zones").insertOne(this);
            return result.insertedId ? true : false;
        } catch (e) {
            return handleError(e, "save");
        }
    }



    // Function 2: Update Lab
    static async updateById(_id, newData, systemId) {
        try {
            const db = getClient();
            // Prepare update object
            const updateFields = { ...newData, updatedAt: new Date(), updatedBy: systemId };
            const result = await db.collection("zones").updateOne(
                { _id: ObjectId(_id) },
                { $set: updateFields }
            );

            return result.modifiedCount > 0;
        } catch (e) {
            return handleError(e, "updateZone");
        }
    }



    // Function 4: Find all labs under a zone
    static async findLabsByZone(zoneId) {

        try {
            const db = getClient();
            const labs = await db.collection("labs").find({ zoneId: new ObjectId(zoneId) }).toArray();
            if (labs.length > 0) {
                return labs
            } else {
                return false
            }
        } catch (e) {
            return handleError(e, "findLabsByZone");  // This returns the result of handleError
        }
    }


    // Function 4: Find all labs under a sub zone
    static async findLabsBySubZone(subZoneId) {

        try {
            const db = getClient();
            const labs = await db.collection("labs").find({ subZoneId: new ObjectId(subZoneId) }).toArray();
            if (labs.length > 0) {
                return labs
            } else {
                return false
            }
        } catch (e) {
            return handleError(e, "findLabsBySubZone");  // This returns the result of handleError
        }
    }

    //// Done upto above /////



    // Function 4: Find All lab count by zone and subzone
    static async findAll() {
        try {
            const projection = { _id: 0, labName: 1, labId: 1, address: 1, email: 1, contact1: 1, contact2: 1 }
            const db = getClient();
            const lab = await db.collection("labs").find({}).project(projection).toArray();
            return lab ? lab : 0
        } catch (e) {
            return handleError(e, "find");  // This returns the result of handleError
        }
    }

}

module.exports = Lab;