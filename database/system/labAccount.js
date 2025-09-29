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
  constructor(labName, address, zone, subZone, contact1, contact2, email, activeStatus, systemId) {
    this.labName = labName;
    this.address = address;
    this.zone = zone;
    this.subZone = subZone;
    this.contact1 = contact1;
    this.contact2 = contact2;
    this.email = email;
    this.invoicePrice = 10;
    this.labIncentive = 4;
    this.activeStatus = activeStatus ?? true;
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


  // ============ INSTANCE METHODS ============

  // Save new lab to database
  async save() {
    try {
      const db = getClient();
      const result = await db.collection("labs").insertOne(this);
      return result.insertedId ? true : false;
    } catch (e) {
      return handleError(e, "save");
    }
  }



  // Add notification to this lab
  async addNotification(message) {
    const newNotification = {
      msg: message,
      isRead: false,
      timestamp: new Date()
    };

    this.notification.unshift(newNotification);
    this.hasNotification = true;
    this.updatedAt = new Date();

    // Update in database
    const db = getClient();
    const result = await db.collection("labs").updateOne(
      { _id: new ObjectId(this._id) },
      {
        $push: { notification: { $each: [newNotification], $position: 0 } },
        $set: {
          hasNotification: true,
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount === 1 ? newNotification : null;
  }

  // Add billing history to this lab
  async addBillingHistory(month, totalInvoice) {
    const totalReceipt = totalInvoice * this.invoicePrice;
    const billingRecord = {
      month: month,
      totalInvoice: totalInvoice,
      totalReceipt: totalReceipt,
      dateAdded: new Date()
    };

    this.billingHistory.unshift(billingRecord);
    this.updateTotalReceipt();
    this.calculatePayableAmount();
    this.updatedAt = new Date();

    // Update in database
    const db = getClient();
    const result = await db.collection("labs").updateOne(
      { _id: new ObjectId(this._id) },
      {
        $push: { billingHistory: { $each: [billingRecord], $position: 0 } },
        $set: {
          totalReceipt: this.totalReceipt,
          payableAmount: this.payableAmount,
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount === 1 ? billingRecord : null;
  }

  // Business logic methods (no database operations)
  updateTotalReceipt() {
    const totalInvoices = this.billingHistory.reduce((sum, record) => sum + record.totalInvoice, 0);
    this.totalReceipt = totalInvoices * this.invoicePrice;
    return this.totalReceipt;
  }

  calculatePayableAmount() {
    this.payableAmount = Math.max(0, this.totalReceipt - this.labIncentive);
    return this.payableAmount;
  }

  // ============ STATIC METHODS (Database Operations) ============

  // Function 1: Find lab by ID
  static async findById(labId) {
    try {
      const db = getClient();
      const lab = await db.collection("labs").findOne({ _id: new ObjectId(labId) });
      return lab;
    } catch (e) {
      return handleError(e, "findById");
    }
  }

  // Function 2: Find lab by email
  static async findByEmail(email) {
    try {
      const db = getClient();
      const lab = await db.collection("labs").findOne({ email: email });
      return lab;
    } catch (e) {
      return handleError(e, "findByEmail");
    }
  }

  // Function 3: Find all labs
  static async findAll(projection = {}) {
    try {
      const db = getClient();
      const labs = await db.collection("labs").find({}).project(projection).toArray();
      const total = await db.collection("labs").countDocuments();
      return { total, labs };
    } catch (e) {
      return handleError(e, "findAll");
    }
  }

  // Function 4: Find labs by zone
  static async findByZone(zone, projection = {}) {
    try {
      const db = getClient();
      const labs = await db.collection("labs").find({ zone: zone }).project(projection).toArray();
      return labs;
    } catch (e) {
      return handleError(e, "findByZone");
    }
  }

  // Function 5: Find active labs
  static async findActiveLabs() {
    try {
      const db = getClient();
      const labs = await db.collection("labs").find({ activeStatus: true }).toArray();
      return labs;
    } catch (e) {
      return handleError(e, "findActiveLabs");
    }
  }

  // Function 6: Update lab by ID
  static async updateById(labId, updateData) {
    try {
      const db = getClient();
      const filter = { _id: new ObjectId(labId) };
      updateData.updatedAt = new Date();

      const result = await db.collection("labs").updateOne(filter, { $set: updateData });
      return result.modifiedCount === 1;
    } catch (e) {
      return handleError(e, "updateById");
    }
  }

  // Function 7: Add staff to lab
  static async addStaff(labId, staffData) {
    try {
      const db = getClient();
      const staff = {
        _id: new ObjectId(),
        name: staffData.name,
        username: staffData.username,
        email: staffData.email,
        password: staffData.password,
        contactNumber: staffData.contactNumber,
        access: staffData.access || [],
        loginTokens: staffData.loginTokens || [],
        joinDate: new Date(),
        isActive: true
      };

      const result = await db.collection("labs").updateOne(
        { _id: new ObjectId(labId) },
        {
          $push: { staffs: staff },
          $set: { updatedAt: new Date() }
        }
      );

      return result.modifiedCount === 1 ? staff : null;
    } catch (e) {
      return handleError(e, "addStaff");
    }
  }

  // Function 8: Add notification to lab by ID
  static async addNotificationById(labId, message) {
    try {
      const db = getClient();
      const newNotification = {
        msg: message,
        isRead: false,
        timestamp: new Date()
      };

      const result = await db.collection("labs").updateOne(
        { _id: new ObjectId(labId) },
        {
          $push: { notification: { $each: [newNotification], $position: 0 } },
          $set: {
            hasNotification: true,
            updatedAt: new Date()
          }
        }
      );

      return result.modifiedCount === 1 ? newNotification : null;
    } catch (e) {
      return handleError(e, "addNotificationById");
    }
  }

  // Function 9: Add billing history to lab by ID
  static async addBillingHistoryById(labId, month, totalInvoice) {
    try {
      const db = getClient();

      // First get the lab to calculate values
      const lab = await this.findById(labId);
      if (!lab) return null;

      const totalReceipt = totalInvoice * lab.invoicePrice;
      const payableAmount = Math.max(0, (lab.totalReceipt + totalReceipt) - lab.labIncentive);

      const billingRecord = {
        month: month,
        totalInvoice: totalInvoice,
        totalReceipt: totalReceipt,
        dateAdded: new Date()
      };

      const result = await db.collection("labs").updateOne(
        { _id: new ObjectId(labId) },
        {
          $push: { billingHistory: { $each: [billingRecord], $position: 0 } },
          $inc: { totalReceipt: totalReceipt },
          $set: {
            payableAmount: payableAmount,
            updatedAt: new Date()
          }
        }
      );

      return result.modifiedCount === 1 ? billingRecord : null;
    } catch (e) {
      return handleError(e, "addBillingHistoryById");
    }
  }

  // Function 10: Set warning for lab
  static async setWarning(labId, warningMessage) {
    try {
      const db = getClient();
      const result = await db.collection("labs").updateOne(
        { _id: new ObjectId(labId) },
        {
          $set: {
            warning: warningMessage,
            hasWarning: true,
            updatedAt: new Date()
          }
        }
      );
      return result.modifiedCount === 1;
    } catch (e) {
      return handleError(e, "setWarning");
    }
  }

  // Function 11: Clear warning for lab
  static async clearWarning(labId) {
    try {
      const db = getClient();
      const result = await db.collection("labs").updateOne(
        { _id: new ObjectId(labId) },
        {
          $set: {
            warning: "",
            hasWarning: false,
            updatedAt: new Date()
          }
        }
      );
      return result.modifiedCount === 1;
    } catch (e) {
      return handleError(e, "clearWarning");
    }
  }

  // Function 12: Count all labs
  static async countAll() {
    try {
      const db = getClient();
      const count = await db.collection("labs").countDocuments();
      return count;
    } catch (e) {
      return handleError(e, "countAll");
    }
  }

  // Function 13: Delete lab by ID
  static async deleteById(labId) {
    try {
      const db = getClient();
      const result = await db.collection("labs").deleteOne({ _id: new ObjectId(labId) });
      return result.deletedCount === 1;
    } catch (e) {
      return handleError(e, "deleteById");
    }
  }
}

module.exports = Lab;