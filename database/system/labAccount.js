/** @format */

const { ObjectId } = require("mongodb");
const { getClient } = require("../connection");

const handleError = (e, methodName) => {
  console.log("Error in database operation. database > admin > lab");
  console.log(`method name ${methodName}`);
  console.log(e.message);
  return null;
};

class Lab {
  constructor(labName, labId, address, zone, subZone, contact1, contact2, email, activeStatus, systemId) {
    this.labName = labName;
    this.labId = labId;
    this.address = address;
    this.zone = zone;
    this.subZone = subZone;
    this.contact1 = contact1;
    this.contact2 = contact2;
    this.email = email;
    this.activeStatus = activeStatus;
    this.invoicePrice = 10;
    this.labIncentive = 4;
    this.hasWarning = false;
    this.warning = "";
    this.totalReceipt = 0;
    this.payableAmount = 0;
    this.billingHistory = [];
    this.staffs = [];
    this.admins = [];
    this.referrers = [];
    this.testList = [];
    this.createdBy = systemId
    this.createdAt = new Date();
  }


  // Function 1: Save new lab to database
  async save() {
    try {
      const db = getClient();
      const result = await db.collection("labs").insertOne(this);
      return result.insertedId ? true : false;
    } catch (e) {
      return handleError(e, "save");
    }
  }

  static test() {
    console.log('Test successful')
  }


  // Function 2: Update Lab
  static async updateById(labId, newData, systemId) {
    try {
      const db = getClient();
      // Prepare update object
      const updateFields = { ...newData, updatedAt: new Date(), updatedBy: systemId };

      console.log(updateFields)
      const result = await db.collection("labs").updateOne(
        { labId: labId }, // Filter by labId (numeric)
        { $set: updateFields }
      );

      return result.modifiedCount > 0;
    } catch (e) {
      return handleError(e, "updateLab");
    }
  }


  // Function 3a: Soft delete - mark as deleted without actually removing
  static async softDeleteById(labId, systemId) {
    try {
      const db = getClient();

      const result = await db.collection("labs").updateOne(
        { labId: labId },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: systemId
          }
        }
      );

      return result.modifiedCount > 0;
    } catch (e) {
      return handleError(e, "softDeleteById");
    }
  }

  // Function 3b: Hard delete
  static async deleteById(labId, systemId) {
    try {
      const db = getClient();

      // First, find the lab to be deleted
      const labToDelete = await db.collection("labs").findOne({ labId: labId });

      if (!labToDelete) {
        console.log("Lab not found for deletion");
        return false;
      }

      // Prepare the deleted lab document with additional fields
      const deletedLab = {
        ...labToDelete,
        deletedAt: new Date(),
        deletedBy: systemId,
        originalId: labToDelete._id // Keep reference to original document ID
      };

      // Remove the original _id to avoid duplicate key error when inserting
      delete deletedLab._id;

      // First, copy the lab data to deletedLabs collection
      const archiveResult = await db.collection("deletedLabs").insertOne(deletedLab);

      if (!archiveResult.insertedId) {
        console.log("Failed to archive lab data");
        return false;
      }

      // Then, delete the lab from the original collection
      const deleteResult = await db.collection("labs").deleteOne({ labId: labId });

      if (deleteResult.deletedCount > 0) {
        console.log(`Lab ${labId} successfully deleted and archived`);
        return true;
      } else {
        // If deletion failed but we already archived, we might want to clean up
        console.log("Deletion failed after archiving - manual cleanup may be needed");
        // Optional: You can choose to remove the archived document if deletion fails
        // await db.collection("deletedLabs").deleteOne({ _id: archiveResult.insertedId });
        return false;
      }

    } catch (e) {
      console.error("Error in deleteById:", e.message);
      return handleError(e, "deleteById");
    }
  }



  // Function 4: Find a lab
  static async find(field, value) {

    try {
      const db = getClient();
      const lab = await db.collection("labs").find({ [field]: value }).toArray();
      if (lab.length > 0) {
        return lab
      } else {
        return 0
      }
    } catch (e) {
      return handleError(e, "find");  // This returns the result of handleError
    }
  }


  // Function 4: Find a lab
  static async findAll() {

    try {
      const db = getClient();
      const lab = await db.collection("labs").find({}).toArray();
      return lab ? lab : 0
    } catch (e) {
      return handleError(e, "find");  // This returns the result of handleError
    }
  }

}

module.exports = Lab;