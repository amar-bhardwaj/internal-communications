const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Step 1: check header exists
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Step 2: remove "Bearer "
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token format wrong" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("JWT ERROR:", error.message); // 👈 IMPORTANT
    return res.status(401).json({ message: "Invalid token" });
  }
};