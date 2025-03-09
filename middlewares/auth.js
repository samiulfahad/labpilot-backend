const jwt = require("jsonwebtoken");
const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, msg: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ success: false, msg: "Token expired or invalid" });

    req.user = decoded;
    next();
  });
};

module.exports = verifyAccessToken;
