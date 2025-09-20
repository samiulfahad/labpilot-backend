const { ObjectId } = require("mongodb"); 
const Lab = require("../database/lab2")

// Create a new invoice
const postLab = async (req, res, next) => {
  try {
    const { labData } = req.body;
    const result = await Lab.createNew(labData)
    if (result) {
      return res.status(201).send({ success: true, msg: "New Lab created" });
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