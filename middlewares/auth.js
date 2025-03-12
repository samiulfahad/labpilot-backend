const jwt = require("jsonwebtoken");
const verifyAccessToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, msg: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    console.log(e);
    return res.status(401).json({ success: false, msg: "Token expired or invalid" });
  }
};

module.exports = verifyAccessToken;
