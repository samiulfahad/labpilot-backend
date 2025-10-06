/** @format */

const { ObjectId } = require("mongodb");
const { getClient } = require("../connection");

const handleError = (e, methodName) => {
  console.log("Error in database operation. database > system > lab");
  console.log(`method name ${methodName}`);
  console.log(e.message);
  return null;
};

class Lab {
  constructor(labName, labId, address, zoneId, subZoneId, contact1, contact2, email, activeStatus, systemId) {
    this.labName = labName;
    this.labId = labId;
    this.address = address;
    this.zoneId = new ObjectId(zoneId); // ✅ Consistent ObjectId
    this.subZoneId = new ObjectId(subZoneId); // ✅ Consistent ObjectId
    this.contact1 = contact1.toString();
    this.contact2 = contact2.toString();
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
    this.createdBy = systemId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.isDeleted = false; // For soft delete
  }

  // Function 1: Save new lab to database
  async save() {
    try {
      const db = getClient();

      // Check if labId already exists
      const existingLab = await db.collection("labs").findOne({ labId: this.labId });
      if (existingLab) {
        throw new Error(`Lab with ID ${this.labId} already exists`);
      }

      const result = await db.collection("labs").insertOne(this);
      return result.insertedId ? true : false;
    } catch (e) {
      return handleError(e, "save");
    }
  }

  // Function 2: Update Lab
  static async updateById(labId, newData, systemId) {
    try {
      const db = getClient();

      // Remove protected fields from update data
      const { _id, createdAt, createdBy, labId: ignoreLabId, ...safeData } = newData;

      // Convert zoneId and subZoneId to ObjectId if present
      if (safeData.zoneId) {
        safeData.zoneId = new ObjectId(safeData.zoneId);
      }
      if (safeData.subZoneId) {
        safeData.subZoneId = new ObjectId(safeData.subZoneId);
      }

      const updateFields = {
        ...safeData,
        updatedAt: new Date(),
        updatedBy: systemId
      };

      const result = await db.collection("labs").updateOne(
        { labId: labId, isDeleted: { $ne: true } }, // Filter by labId and not deleted
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
        { labId: labId, isDeleted: { $ne: true } },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: systemId,
            updatedAt: new Date(),
            updatedBy: systemId
          }
        }
      );

      return result.modifiedCount > 0;
    } catch (e) {
      return handleError(e, "softDeleteById");
    }
  }

  // Function 3b: Hard delete with archiving
  static async deleteById(labId, systemId) {
    try {
      const db = getClient();

      // First, find the lab to be deleted (only non-deleted ones)
      const labToDelete = await db.collection("labs").findOne({
        labId: labId,
        isDeleted: { $ne: true }
      });

      if (!labToDelete) {
        console.log("Lab not found for deletion");
        return false;
      }

      // Prepare the deleted lab document with additional fields
      const deletedLab = {
        ...labToDelete,
        deletedAt: new Date(),
        deletedBy: systemId,
        originalId: labToDelete._id, // Keep reference to original document ID
        archiveReason: "manual_deletion"
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
        // If deletion failed but we already archived, clean up the archive
        await db.collection("deletedLabs").deleteOne({ _id: archiveResult.insertedId });
        console.log("Deletion failed - archive cleaned up");
        return false;
      }

    } catch (e) {
      console.error("Error in deleteById:", e.message);
      return handleError(e, "deleteById");
    }
  }

  // Function 4: Find labs by field
  static async find(field, value) {
    try {
      const projection = {
        _id: 0,
        labName: 1,
        labId: 1,
        address: 1,
        email: 1,
        contact1: 1,
        contact2: 1,
        zoneId: 1,
        subZoneId: 1,
        activeStatus: 1,
        createdAt: 1
      };

      const db = getClient();

      // Handle ObjectId conversion for specific fields
      let query = { [field]: value, isDeleted: { $ne: true } };
      if (field === 'zoneId' || field === 'subZoneId') {
        query = { [field]: new ObjectId(value), isDeleted: { $ne: true } };
      }

      const labs = await db.collection("labs").find(query).project(projection).toArray();
      return labs; // ✅ Always return array (empty if no results)
    } catch (e) {
      return handleError(e, "find");
    }
  }

  // Function 5: Find all labs (non-deleted only)
  static async findAll() {
    try {
      const projection = {
        _id: 0,
        labName: 1,
        labId: 1,
        address: 1,
        email: 1,
        contact1: 1,
        contact2: 1,
        zoneId: 1,
        subZoneId: 1,
        activeStatus: 1,
        createdAt: 1
      };

      const db = getClient();
      const labs = await db.collection("labs")
        .find({ isDeleted: { $ne: true } })
        .project(projection)
        .toArray();

      return labs; // ✅ Always return array
    } catch (e) {
      return handleError(e, "findAll");
    }
  }

  // Function 6: Find all labs under a zone
  static async findByZone(zoneId) {
    try {
      const projection = {
        labName: 1,
        address: 1,
        contact1: 1,
        contact2: 1,
        email: 1,
        activeStatus: 1,
        labId: 1,
        zoneId: 1,
        subZoneId: 1
      };

      const db = getClient();
      const labs = await db.collection("labs")
        .find({
          zoneId: new ObjectId(zoneId),
          isDeleted: { $ne: true }
        })
        .project(projection)
        .toArray();

      return labs; // ✅ Always return array
    } catch (e) {
      return handleError(e, "findByZone");
    }
  }

  // Function 7: Find all labs under a sub zone
  static async findBySubZone(subZoneId) {
    try {
      const projection = {
        labName: 1,
        address: 1,
        contact1: 1,
        contact2: 1,
        email: 1,
        activeStatus: 1,
        labId: 1,
        zoneId: 1,
        subZoneId: 1
      };

      const db = getClient();
      const labs = await db.collection("labs")
        .find({
          subZoneId: new ObjectId(subZoneId),
          isDeleted: { $ne: true }
        })
        .project(projection)
        .toArray();

      return labs; // ✅ Always return array
    } catch (e) {
      return handleError(e, "findBySubZone");
    }
  }

  // Function 8: Search labs with multiple criteria
  static async search(searchCriteria) {
    try {
      const projection = {
        _id: 0,
        labName: 1,
        labId: 1,
        address: 1,
        email: 1,
        contact1: 1,
        contact2: 1,
        zoneId: 1,
        subZoneId: 1,
        activeStatus: 1
      };

      const db = getClient();

      // Build query with non-deleted filter
      const query = { isDeleted: { $ne: true } };

      // Add search criteria
      if (searchCriteria.labName) {
        query.labName = { $regex: searchCriteria.labName, $options: 'i' };
      }
      if (searchCriteria.email) {
        query.email = searchCriteria.email;
      }
      if (searchCriteria.contact) {
        query.$or = [
          { contact1: searchCriteria.contact },
          { contact2: searchCriteria.contact }
        ];
      }
      if (searchCriteria.zoneId) {
        query.zoneId = new ObjectId(searchCriteria.zoneId);
      }
      if (searchCriteria.subZoneId) {
        query.subZoneId = new ObjectId(searchCriteria.subZoneId);
      }
      if (searchCriteria.activeStatus !== undefined) {
        query.activeStatus = searchCriteria.activeStatus;
      }

      const labs = await db.collection("labs")
        .find(query)
        .project(projection)
        .toArray();

      return labs; // ✅ Always return array
    } catch (e) {
      return handleError(e, "search");
    }
  }

  // Function 9: Find lab by ID with full details (for internal use)
  static async findById(labId, includeSensitive = false) {
    try {
      const db = getClient();

      // Basic projection (public fields)
      let projection = {
        _id: 0,
        labName: 1,
        labId: 1,
        address: 1,
        email: 1,
        contact1: 1,
        contact2: 1,
        zoneId: 1,
        subZoneId: 1,
        activeStatus: 1,
        invoicePrice: 1,
        labIncentive: 1,
        hasWarning: 1,
        warning: 1,
        totalReceipt: 1,
        payableAmount: 1,
        createdAt: 1,
        updatedAt: 1
      };

      // Include sensitive fields if requested
      if (includeSensitive) {
        projection = {
          ...projection,
          billingHistory: 1,
          staffs: 1,
          admins: 1,
          referrers: 1,
          testList: 1,
          createdBy: 1,
          updatedBy: 1
        };
      }

      const lab = await db.collection("labs").findOne(
        { labId: labId, isDeleted: { $ne: true } },
        { projection }
      );

      return lab; // Return object or null
    } catch (e) {
      return handleError(e, "findById");
    }
  }

  // Function 10: Restore soft-deleted lab
  static async restoreLab(labId, systemId) {
    try {
      const db = getClient();

      const result = await db.collection("labs").updateOne(
        { labId: labId, isDeleted: true },
        {
          $set: {
            isDeleted: false,
            restoredAt: new Date(),
            restoredBy: systemId,
            updatedAt: new Date(),
            updatedBy: systemId
          },
          $unset: {
            deletedAt: "",
            deletedBy: ""
          }
        }
      );

      return result.modifiedCount > 0;
    } catch (e) {
      return handleError(e, "restoreLab");
    }
  }

  // Function 11: Get lab statistics
  static async getStats() {
    try {
      const db = getClient();

      const totalLabs = await db.collection("labs").countDocuments({ isDeleted: { $ne: true } });
      const activeLabs = await db.collection("labs").countDocuments({
        activeStatus: true,
        isDeleted: { $ne: true }
      });
      const inactiveLabs = await db.collection("labs").countDocuments({
        activeStatus: false,
        isDeleted: { $ne: true }
      });
      const deletedLabs = await db.collection("labs").countDocuments({ isDeleted: true });

      // Count labs by zone
      const labsByZone = await db.collection("labs").aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: "$zoneId", count: { $sum: 1 } } }
      ]).toArray();

      return {
        totalLabs,
        activeLabs,
        inactiveLabs,
        deletedLabs,
        labsByZone
      };
    } catch (e) {
      return handleError(e, "getStats");
    }
  }

  // Function 12: Check if labId exists
  static async labIdExists(labId) {
    try {
      const db = getClient();
      const existingLab = await db.collection("labs").findOne({
        labId: labId,
        isDeleted: { $ne: true }
      });
      return !!existingLab;
    } catch (e) {
      return handleError(e, "labIdExists");
    }
  }
}
module.exports = Lab;